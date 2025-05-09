// lib/axios.ts
import { useAuthStore } from "@/store/useAuthStore"
import axios from "axios"
import Router from "next/router"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_SERVER_URL,
  withCredentials: true,
})

let isRefreshing = false
let refreshSubscribers: (() => void)[] = []

function subscribeTokenRefresh(cb: () => void) {
  refreshSubscribers.push(cb)
}

function onRefreshed() {
  refreshSubscribers.forEach((cb) => cb())
  refreshSubscribers = []
}

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  // console.log("token", token)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      if (!isRefreshing) {
        isRefreshing = true
        try {
          const refreshRes = await axios.post(
            `${process.env.NEXT_PUBLIC_AUTH_SERVER_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          )
          const newToken = refreshRes.data.access_token
          useAuthStore.getState().setAccessToken(newToken)
          isRefreshing = false
          onRefreshed()
        } catch (e) {
          useAuthStore.getState().logout()
          //Router.push("/login")
          return Promise.reject(e)
        }
      }

      return new Promise((resolve) => {
        subscribeTokenRefresh(() => {
          originalRequest.headers.Authorization = `Bearer ${useAuthStore.getState().accessToken}`
          resolve(api(originalRequest))
        })
      })
    }

    return Promise.reject(error)
  }
)

export default api
