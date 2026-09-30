import { http } from '@/utils/request'
import { storage } from '@/utils/storage'
import type { User, LoginRequest, LoginResponse, RegisterRequest } from '@/types'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

// ============ 用户认证 API ============

const MOCK_USERS = [
  { id: 1, username: 'demo', password: '123456' },
]

export function login(data: LoginRequest): Promise<LoginResponse> {
  if (USE_MOCK) {
    const user = MOCK_USERS.find(
      (u) => u.username === data.username && u.password === data.password,
    )
    if (!user) {
      return Promise.reject(new Error('用户名或密码错误'))
    }
    const token = `mock-token-${user.id}-${Date.now()}`
    const userInfo: User = { id: user.id, username: user.username, created_at: '2026-01-01T00:00:00Z' }
    storage.set('token', token)
    storage.set('user', userInfo)
    return Promise.resolve({ token, user: userInfo })
  }
  return http<LoginResponse>({ url: '/auth/login', method: 'POST', data })
}

export function register(data: RegisterRequest): Promise<User> {
  if (USE_MOCK) {
    const exists = MOCK_USERS.some((u) => u.username === data.username)
    if (exists) {
      return Promise.reject(new Error('用户名已存在'))
    }
    const newUser = { id: MOCK_USERS.length + 1, ...data }
    MOCK_USERS.push(newUser)
    const userInfo: User = { id: newUser.id, username: newUser.username, created_at: new Date().toISOString() }
    return Promise.resolve(userInfo)
  }
  return http<User>({ url: '/auth/register', method: 'POST', data })
}

export function getCurrentUser(): Promise<User> {
  if (USE_MOCK) {
    const user = storage.get<User>('user')
    if (!user) return Promise.reject(new Error('未登录'))
    return Promise.resolve(user)
  }
  return http<User>({ url: '/auth/me', method: 'GET' })
}

export function logout(): void {
  storage.remove('token')
  storage.remove('user')
}
