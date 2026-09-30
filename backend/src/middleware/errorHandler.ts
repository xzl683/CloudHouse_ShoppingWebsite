import type { Request, Response, NextFunction } from 'express'

// 404 兜底
export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    code: 404,
    message: `接口不存在: ${req.method} ${req.path}`,
    data: null,
  })
}

// 统一错误处理（必须放在最后，且 4 个参数齐全）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  console.error('[ERROR]', err)
  const status = err.status || 500
  const message = err.message || '服务器内部错误'
  res.status(status).json({ code: status, message, data: null })
}
