import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/types'

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 注入 token
    const token = localStorage.getItem('cloudhouse_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截器：统一处理返回结构
request.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse
    if (res.code !== 0 && res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res as unknown as typeof response
  },
  (error) => {
    const message = error.response?.data?.message || error.message || '网络错误，请稍后重试'
    ElMessage.error(message)
    return Promise.reject(error)
  },
)

// 封装请求方法，返回 data 部分
export function http<T>(config: AxiosRequestConfig): Promise<T> {
  return request(config).then((res) => (res as unknown as ApiResponse<T>).data)
}

export default request
