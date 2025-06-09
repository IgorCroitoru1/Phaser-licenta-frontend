import { UserDto } from '@/dtos/UserDto'
import api from '@/lib/axios'
import axiosBare from '@/lib/axiosBare'
import { useAuthStore } from '@/store/useAuthStore'
import { Credentials, SignInData, SignUpData } from '@/types/auth'
import axios, { AxiosInstance } from 'axios'
import { set } from 'react-hook-form'
import { webSocketService } from './websocket'

export class AuthService {
  private instance: AxiosInstance

  constructor(instance: AxiosInstance) {
    this.instance = instance
  }

  public setBearerToken(token: string) {
    this.instance.defaults.headers.common.Authorization = `Bearer ${token}`
  }

  public async login(signInData: SignInData) {
    return this.instance
      .post<Credentials & {user :UserDto}>('auth/login', signInData)
      .then(({ data: credentials }) => {
        this.setBearerToken(credentials.access_token)
        useAuthStore.getState().login(credentials.access_token, credentials.user)
    })
      .catch((error) => Promise.reject(error))
  }

  public async register(signUpData: SignUpData) {
    return this.instance
      .post<Credentials & {user :UserDto}>('auth/register-with-code', signUpData)
      .then(({ data: user }) => user)
      .catch((error) => Promise.reject(error))
  }

  public async refreshCredentials() {
    return axiosBare
      .post<Credentials>('auth/refresh')
      .then(({ data: credentials }) => useAuthStore.getState().setAccessToken(credentials.access_token))
      .catch((error) => Promise.reject(error))
  }

  public async logout() {
    return this.instance
      .post<void>('auth/logout')
      .then(() => {
        webSocketService.forceDisconnect();
        useAuthStore.getState().logout()

      })
      .catch((error) => Promise.reject(error))
  }
  public async sendCode(email: string) {
    return this.instance
      .post<void>('auth/request-verification-code', { email })
      .then(() => Promise.resolve())
      .catch((error) => Promise.reject(error))
  }
  public async getUser() {
    return this.instance
      .get<UserDto>('auth/me')
      .then(({ data: user }) => user)
      .catch((error) => Promise.reject(error))
  }
}

export const authService =  new AuthService(api)