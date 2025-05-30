// types/websocket.types.ts
export interface ChannelLiveData {
  channelId: string;
  clientsCount: number;
  roomsCount: number;
  isActive: boolean;
  metadata?: any;
}

export interface ChannelUpdate {
  channelId: string;
  data: ChannelLiveData;
}

export interface UserCounts {
  [channelId: string]: number;
}

// Socket event constants (same as backend)
export const SOCKET_EVENTS = {
  CHANNELS_INITIAL: 'channels:initial',
  CHANNELS_UPDATE: 'channels:update', 
  CHANNEL_UPDATE: 'channel:update',
  CHANNELS_USER_COUNTS: 'channels:userCounts',
} as const;

export type SocketEventType = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];