import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: localStorage.getItem('platform_token') || ''
  }),
  actions: {
    setUser(user) {
      this.user = user
    },
    setToken(token) {
      this.token = token
      localStorage.setItem('platform_token', token)
    },
    clearUser() {
      this.user = null
      this.token = ''
      localStorage.removeItem('platform_token')
    }
  }
})