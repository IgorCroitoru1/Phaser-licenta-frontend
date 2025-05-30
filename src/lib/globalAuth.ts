// lib/globalAuth.ts
// Global auth state manager that can be used outside React components
import { UserDto } from '@/dtos/UserDto'

interface GlobalAuthState {
  accessToken: string | null
  user: UserDto | null
  isAuthLoading: boolean
}

class GlobalAuthManager {
  private state: GlobalAuthState = {
    accessToken: null,
    user: null,
    isAuthLoading: true
  }

  private listeners: (() => void)[] = []

  getState(): GlobalAuthState {
    return { ...this.state }
  }

  setAccessToken(token: string) {
    this.state.accessToken = token
    this.notifyListeners()
  }

  setUser(user: UserDto | null) {
    this.state.user = user
    this.notifyListeners()
  }

  setAuthLoading(isLoading: boolean) {
    this.state.isAuthLoading = isLoading
    this.notifyListeners()
  }

  login(token: string, user: UserDto) {
    this.state.accessToken = token
    this.state.user = user
    this.notifyListeners()
  }

  logout() {
    this.state.accessToken = null
    this.state.user = null
    this.notifyListeners()
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener())
  }

  getAccessToken(): string | null {
    return this.state.accessToken
  }

  getUser(): UserDto | null {
    return this.state.user
  }

  getIsAuthLoading(): boolean {
    return this.state.isAuthLoading
  }
}

export const globalAuth = new GlobalAuthManager()
