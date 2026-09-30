import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { getDb } from '../db/database'
import { success } from '../utils/response'
import { signToken } from '../utils/jwt'
import { authRequired } from '../middleware/auth'
import type { LoginResponse, User } from '../types'

const router = Router()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToUser(row: any): User {
  return { id: row.id, username: row.username, created_at: row.created_at }
}

// POST /api/auth/register —— 注册
router.post('/register', (req, res) => {
  const { username, password } = req.body ?? {}
  if (!username || !password) {
    res.status(400).json({ code: 400, message: '用户名和密码不能为空', data: null })
    return
  }
  if (username.length < 2 || username.length > 20) {
    res.status(400).json({ code: 400, message: '用户名长度需为 2-20 位', data: null })
    return
  }
  if (password.length < 6) {
    res.status(400).json({ code: 400, message: '密码长度不能少于 6 位', data: null })
    return
  }

  const db = getDb()
  const exist = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
  if (exist) {
    res.status(409).json({ code: 409, message: '用户名已存在', data: null })
    return
  }

  const passwordHash = bcrypt.hashSync(password, 10)
  const createdAt = new Date().toISOString()
  const r = db
    .prepare('INSERT INTO users (username, password, created_at) VALUES (?, ?, ?)')
    .run(username, passwordHash, createdAt)
  const row = db
    .prepare('SELECT id, username, created_at FROM users WHERE id = ?')
    .get(r.lastInsertRowid)
  res.json(success(rowToUser(row), '注册成功'))
})

// POST /api/auth/login —— 登录
router.post('/login', (req, res) => {
  const { username, password } = req.body ?? {}
  if (!username || !password) {
    res.status(400).json({ code: 400, message: '用户名和密码不能为空', data: null })
    return
  }

  const db = getDb()
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as
    | { id: number; username: string; password: string; created_at: string }
    | undefined
  if (!row || !bcrypt.compareSync(password, row.password)) {
    res.status(401).json({ code: 401, message: '用户名或密码错误', data: null })
    return
  }

  const token = signToken({ userId: row.id, username: row.username })
  const data: LoginResponse = { token, user: rowToUser(row) }
  res.json(success(data, '登录成功'))
})

// GET /api/auth/me —— 当前用户信息（需登录）
router.get('/me', authRequired, (req, res) => {
  const db = getDb()
  const row = db
    .prepare('SELECT id, username, created_at FROM users WHERE id = ?')
    .get(req.userId) as { id: number; username: string; created_at: string } | undefined
  if (!row) {
    res.status(404).json({ code: 404, message: '用户不存在', data: null })
    return
  }
  res.json(success(rowToUser(row)))
})

export default router
