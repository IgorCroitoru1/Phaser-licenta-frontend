// lib/store/auth.ts
import { UserDto } from '@/dtos/UserDto'
import { User } from 'next-auth'
import { create } from 'zustand'
import { useMemo } from 'react'

interface AuthState {
  accessToken: string | null
  user: UserDto | null
  isAuthLoading: boolean
  setAuthLoading: (isLoading: boolean) => void
  login: (token: string, user: UserDto) => void
  setAccessToken: (token: string) => void
  logout: () => void
  setUser: (user: UserDto | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthLoading: true,
  setAuthLoading: (isLoading) => set({ isAuthLoading: isLoading }),
  login: (token, user) => set({ accessToken: token, user }),
  setAccessToken: (token) => set((state) => ({ ...state, accessToken: token })),
  logout: () => set({ accessToken: null, user: null }),
  setUser: (user) => set((state) => ({ ...state, user })),
}))
