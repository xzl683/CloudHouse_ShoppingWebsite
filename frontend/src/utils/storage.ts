// localStorage 封装
const PREFIX = 'cloudhouse_'

export const storage = {
  get<T>(key: string): T | null {
    const val = localStorage.getItem(PREFIX + key)
    if (!val) return null
    try {
      return JSON.parse(val) as T
    } catch {
      return null
    }
  },
  set(key: string, value: unknown): void {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  },
  remove(key: string): void {
    localStorage.removeItem(PREFIX + key)
  },
  clear(): void {
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith(PREFIX)) localStorage.removeItem(k)
    })
  },
}
