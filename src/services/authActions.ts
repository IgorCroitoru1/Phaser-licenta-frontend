// services/authActions.ts
import { UserDto } from '@/dtos/UserDto'
import { Credentials, SignInData } from '@/types/auth'
import api from '@/lib/axios'
import axiosBare from '@/lib/axiosBare'

// These are action functions that components can call
// They return promises and the component will handle updating the context
export const authActions = {
  async login(signInData: SignInData): Promise<{ token: string; user: UserDto }> {
    const { data: credentials } = await api.post<Credentials & { user: UserDto }>('auth/login', signInData)
    api.defaults.headers.common.Authorization = `Bearer ${credentials.access_token}`
    return {
      token: credentials.access_token,
      user: credentials.user
    }
  },

  async refreshCredentials(): Promise<string> {
    const { data: credentials } = await axiosBare.post<Credentials>('auth/refresh')
    return credentials.access_token
  },

  async logout(): Promise<void> {
    await api.post<void>('auth/logout')
  },

  async getUser(): Promise<UserDto> {
    const { data: user } = await api.get<UserDto>('auth/me')
    return user
  }
}
