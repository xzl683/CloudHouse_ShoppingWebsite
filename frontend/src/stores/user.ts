import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginRequest, RegisterRequest } from '@/types'
import * as authApi from '@/api/auth'
import { storage } from '@/utils/storage'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(storage.get<User>('user'))
  const token = ref<string | null>(storage.get<string>('token'))

  const isLoggedIn = computed(() => !!token.value)

  async function login(data: LoginRequest): Promise<void> {
    const res = await authApi.login(data)
    user.value = res.user
    token.value = res.token
  }

  async function register(data: RegisterRequest): Promise<void> {
    await authApi.register(data)
  }

  function logout(): void {
    authApi.logout()
    user.value = null
    token.value = null
  }

  return {
    user,
    token,
    isLoggedIn,
    login,
    register,
    logout,
  }
})
