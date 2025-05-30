import { UserDto } from '@/dtos/UserDto'
import api from '@/lib/axios'
import axiosBare from '@/lib/axiosBare'
import { Credentials, SignInData, SignUpData } from '@/types/auth'
import axios, { AxiosInstance } from 'axios'

// This service is now a singleton that manages global auth state
// It's designed to work with the React Context
export class AuthService {
  private instance: AxiosInstance
  private static authContext: any = null

  constructor(instance: AxiosInstance) {
    this.instance = instance
  }

  // Method to set the auth context from React components
  public static setAuthContext(context: any) {
    AuthService.authContext = context
  }

  public setBearerToken(token: string) {
    this.instance.defaults.headers.common.Authorization = `Bearer ${token}`
  }

  public async login(signInData: SignInData) {
    return this.instance
      .post<Credentials & {user :UserDto}>('auth/login', signInData)
      .then(({ data: credentials }) => {
        this.setBearerToken(credentials.access_token)
        // Update context if available
        if (AuthService.authContext) {
          AuthService.authContext.login(credentials.access_token, credentials.user)
        }
        return credentials
    })
      .catch((error) => Promise.reject(error))
  }

  public async refreshCredentials() {
    return axiosBare
      .post<Credentials>('auth/refresh')
      .then(({ data: credentials }) => {
        // Update context if available
        if (AuthService.authContext) {
          AuthService.authContext.setAccessToken(credentials.access_token)
        }
        return credentials
      })
      .catch((error) => Promise.reject(error))
  }

  public async logout() {
    return this.instance
      .post<void>('auth/logout')
      .then(() => {
        // Update context if available
        if (AuthService.authContext) {
          AuthService.authContext.logout()
        }
      })
      .catch((error) => Promise.reject(error))
  }

  public async getUser() {
    return this.instance
      .get<UserDto>('auth/me')
      .then(({ data: user }) => user)
      .catch((error) => Promise.reject(error))
  }
}

export const authService = new AuthService(api)