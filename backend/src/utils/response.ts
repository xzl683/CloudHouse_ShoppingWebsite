import type { ApiResponse } from '../types'

// 成功响应
export function success<T>(data: T, message = 'success'): ApiResponse<T> {
  return { code: 200, message, data }
}

// 失败响应（用于在路由内主动返回错误，不抛异常）
export function fail<T = null>(message: string, code = 400, data: T = null as unknown as T): ApiResponse<T> {
  return { code, message, data }
}
