import api from '@/lib/axios';
import { Channel } from '@/store/useChannelStore';

export interface CreateChannelDto {
  name: string;
  maxUsers: number;
  mapName: string;
}






export class ChannelService {
  /**
   * Fetch all channels from the NestJS backend
   */
  static async getAllChannels(): Promise<Channel[]> {
    try {
      const response = await api.get<Channel[]>('/channels');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch channels:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch channels from server'
      );
    }
  }

  /**
   * Fetch a specific channel by ID
   */
  static async getChannelById(id: string): Promise<Channel> {
    try {
      const response = await api.get<Channel>(`/channels/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to fetch channel ${id}:`, error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        `Failed to fetch channel ${id}`
      );
    }
  }

  /**
   * Create a new channel
   */
  static async createChannel(channelData: CreateChannelDto): Promise<Channel> {
    try {
      const response = await api.post<Channel>('/channels', channelData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create channel:', error);
      throw error
    }
  }

  /**
   * Update an existing channel
   */
  static async updateChannel(id: string, channelData: Partial<CreateChannelDto>): Promise<Channel> {
    try {
      const response = await api.put<Channel>(`/channels/${id}`, channelData);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to update channel ${id}:`, error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        `Failed to update channel ${id}`
      );
    }
  }

  /**
   * Delete a channel
   */
  static async deleteChannel(id: string): Promise<void> {
    try {
      await api.delete(`/channels/${id}`);
    } catch (error: any) {
      console.error(`Failed to delete channel ${id}:`, error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        `Failed to delete channel ${id}`
      );
    }
  }


  

  
}

// Export individual functions for easier importing
export const {
  getAllChannels,
  getChannelById,
  createChannel,
  updateChannel,
  deleteChannel,
} = ChannelService;

// Default export
export default ChannelService;