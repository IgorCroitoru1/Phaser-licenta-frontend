// filepath: c:\Users\Igor\Desktop\JS\phaser-licenta\template-nextjs\src\services\user.ts
import { UpdateUserDto } from '@/dtos/UpdateUserDto'
import { UserDto } from '@/dtos/UserDto'
import api from '@/lib/axios'
import { AxiosInstance } from 'axios'


export class UserService {
  private instance: AxiosInstance

  constructor(instance: AxiosInstance) {
    this.instance = instance
  }

  /**
   * Get current user profile
   */
  public async getProfile(): Promise<UserDto> {
    return this.instance
      .get<UserDto>('user/profile')
      .then(({ data }) => data)
      .catch((error) => Promise.reject(error))
  }

  /**
   * Update current user profile
   */
  public async updateProfile(updateData: UpdateUserDto): Promise<UserDto> {
    return this.instance
      .put<UserDto>('user/profile', updateData)
      .then(({ data }) => data)
      .catch((error) => Promise.reject(error))
  }

  /**
   * Delete current user profile
   */
  public async deleteProfile(): Promise<void> {
    return this.instance
      .delete<void>('user/profile')
      .then(() => void 0)
      .catch((error) => Promise.reject(error))
  }

  /**
   * Admin: Get user by ID
   */
  public async getUserById(userId: string): Promise<UserDto> {
    return this.instance
      .get<UserDto>(`user/${userId}`)
      .then(({ data }) => data)
      .catch((error) => Promise.reject(error))
  }

  /**
   * Admin: Update user by ID
   */
  public async updateUser(userId: string, updateData: UpdateUserDto): Promise<UserDto> {
    return this.instance
      .put<UserDto>(`user/${userId}`, updateData)
      .then(({ data }) => data)
      .catch((error) => Promise.reject(error))
  }

  /**
   * Admin: Delete user by ID
   */
  public async deleteUser(userId: string): Promise<void> {
    return this.instance
      .delete<void>(`user/${userId}`)
      .then(() => void 0)
      .catch((error) => Promise.reject(error))
  }
}

export const userService = new UserService(api)