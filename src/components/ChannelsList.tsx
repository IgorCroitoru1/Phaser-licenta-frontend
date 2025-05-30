import React, { useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useWebSocketContext } from '../context/WebSocketContext';
import { useAuth } from '@/context/AuthContext';
import { SidebarChannel } from './sidebar/sidebar-channel';
import { Channel } from '@/store/useChannelStore';
import { getAllChannels } from '@/services/channelService';

export interface ChannelsListRef {
  refreshChannels: () => Promise<void>;
}

const ChannelsList = forwardRef<ChannelsListRef>((props, ref) => {
  const { 
    userCounts, 
    connect, 
    disconnect,
    isConnected,
    isConnecting,
    channelsData 
  } = useWebSocketContext();
    const { accessToken, isAuthLoading } = useAuth();
  const isAuthenticated = !!accessToken;

  // REST API state for channels
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Connect to WebSocket for user counts when authenticated
  useEffect(() => {
    if (isAuthenticated && accessToken && !isConnected && !isConnecting) {
      connect(accessToken);
    }
  }, [isAuthenticated, accessToken, isConnected, isConnecting, connect]);

  useEffect(() => {
    if (!isAuthenticated && isConnected) {
      disconnect();
    }
  }, [isAuthenticated, isConnected, disconnect]);

  // Fetch channels from REST API
  const fetchChannels = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const channelsData = await getAllChannels();
      setChannels(channelsData);
      console.log("Channels loaded from API");
    } catch (error: any) {
      console.error('Failed to fetch channels:', error);
      setError(error.message || 'Failed to load channels');
      setChannels([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Expose refresh function to parent components
  useImperativeHandle(ref, () => ({
    refreshChannels: fetchChannels
  }), [fetchChannels]);

  // Load channels on component mount
  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);
  if (isAuthLoading) {
    return (
      <div className="px-3 py-2">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          <span className="text-sm text-muted-foreground">Authenticating...</span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="px-3 py-2">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          <span className="text-sm text-muted-foreground">Loading channels...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-3 py-2">
        <div className="text-sm text-red-600 mb-2">{error}</div>
        <button 
          onClick={fetchChannels}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="px-3 py-2 text-sm text-muted-foreground">
        No channels available
      </div>
    );
  }
  return (
    <>
      {channels.map((channel) => (
        <SidebarChannel 
          key={channel.id} 
          channel={channel}
          userCount={channelsData.find(c=> c.channelId === channel.id)?.clientsCount || 0} // Pass user count from WebSocket
        />
      ))}
    </>
  );
});

ChannelsList.displayName = 'ChannelsList';

export default ChannelsList;
