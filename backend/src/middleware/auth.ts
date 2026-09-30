import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import type { JwtPayload } from '../types'

// 扩展 Express Request，挂载当前用户信息
declare module 'express-serve-static-core' {
  interface Request {
    userId?: number
    username?: string
  }
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) return null
  return header.slice(7)
}

// 必须登录：无 token 或 token 无效直接返回 401
export function authRequired(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req)
  if (!token) {
    res.status(401).json({ code: 401, message: '未登录或登录已过期', data: null })
    return
  }
  try {
    const payload = verifyToken(token) as JwtPayload
    req.userId = payload.userId
    req.username = payload.username
    next()
  } catch {
    res.status(401).json({ code: 401, message: '登录已过期，请重新登录', data: null })
  }
}

// 可选登录：有合法 token 则注入用户信息，无 token 也放行
export function authOptional(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req)
  if (token) {
    try {
      const payload = verifyToken(token) as JwtPayload
      req.userId = payload.userId
      req.username = payload.username
    } catch {
      // 非法 token 直接忽略，按未登录处理
    }
  }
  next()
}
