// services/websocket.service.ts
import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS, ChannelLiveData, UserCounts } from '../types/websocket.types';

interface WebSocketCallbacks {
  onInitialData?: (data: ChannelLiveData[]) => void;
  onChannelsUpdate?: (data: ChannelLiveData[]) => void;
  onChannelUpdate?: (data: ChannelLiveData) => void;
  onUserCountsUpdate?: (data: UserCounts) => void;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
}

export class WebSocketService {
  private socket: Socket | null = null;
  private readonly serverUrl: string;
  private callbacks: WebSocketCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isManualDisconnect = false; // Track manual disconnects for auth logout
  private currentToken: string | null = null; // Track current token

  constructor(serverUrl: string | undefined = process.env.NEXT_PUBLIC_WS_URL) {
    if (!serverUrl) {
      throw new Error('WebSocket server URL is not defined');
    }
    this.serverUrl = serverUrl;
  }
  connect(token: string, callbacks: WebSocketCallbacks = {}): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.callbacks = callbacks;
        this.isManualDisconnect = false; // Reset manual disconnect flag
        this.currentToken = token; // Store current token

        // Disconnect existing connection if any
        if (this.socket) {
          this.disconnect();
        }
        // Create new connection
        this.socket = io(`${this.serverUrl}/channels`, {
          auth: { token },
          transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
          timeout: 20000,
          retries: 3,
        });

        // Connection events
        this.socket.on('connect', () => {
          console.log('✅ Connected to WebSocket server');
          this.reconnectAttempts = 0;
          this.callbacks.onConnect?.();
          resolve(true);
        });

        this.socket.on('disconnect', (reason) => {
          console.log(`❌ Disconnected from WebSocket: ${reason}`);
          this.callbacks.onDisconnect?.(reason);
          
          // Auto-reconnect logic
          if (reason === 'io server disconnect') {
            // Server disconnected, don't reconnect automatically
            return;
          }
          
          this.handleReconnect(token);
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ WebSocket connection error:', error);
          this.callbacks.onError?.(error);
          reject(error);
        });

       

        this.socket.on(SOCKET_EVENTS.CHANNELS_UPDATE, (data: ChannelLiveData[]) => {
          console.log('🔄 Received channels update:', data);
          this.callbacks.onChannelsUpdate?.(data);
        });

        // this.socket.on(SOCKET_EVENTS.CHANNEL_UPDATE, (data: ChannelUpdate) => {
        //   console.log(`🎯 Received channel update for ${data.channelId}:`, data);
        //   this.callbacks.onChannelUpdate?.(data);
        // });

        this.socket.on(SOCKET_EVENTS.CHANNELS_USER_COUNTS, (data: UserCounts) => {
          console.log('👥 Received user counts update:', data);
          this.callbacks.onUserCountsUpdate?.(data);
        });

      } catch (error) {
        console.error('❌ Error creating WebSocket connection:', error);
        reject(error);
      }
    });
  }
  private handleReconnect(token: string) {
    // Don't reconnect if manually disconnected or token is invalid
    if (this.isManualDisconnect || !this.currentToken) {
      console.log('🔌 Skipping reconnect - manual disconnect or no token');
      return;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Exponential backoff
      
      console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(token, this.callbacks);
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached');
      this.callbacks.onError?.(new Error('Max reconnection attempts reached'));
    }
  }
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('🔌 WebSocket disconnected');
    }
  }

  // New method for auth logout - ensures complete cleanup
  forceDisconnect() {
    this.isManualDisconnect = true;
    this.currentToken = null;
    this.reconnectAttempts = 0;
    this.callbacks = {};
    
    if (this.socket) {
      this.socket.removeAllListeners(); // Remove all listeners
      this.socket.disconnect();
      this.socket = null;
      console.log('🔌 WebSocket force disconnected for logout');
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Emit events (if you need to send data to server)
  emit(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('⚠️ Cannot emit: WebSocket not connected');
    }
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();