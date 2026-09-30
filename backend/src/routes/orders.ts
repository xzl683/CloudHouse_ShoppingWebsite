import { Router } from 'express'
import { getDb } from '../db/database'
import { success } from '../utils/response'
import { authOptional } from '../middleware/auth'
import { generateOrderNo } from '../utils/orderNo'
import type { Order, OrderItem, CreateOrderRequest } from '../types'

const router = Router()

// 数据库行类型
type OrderRow = {
  id: number
  order_no: string
  user_id: number | null
  total_amount: number
  status: string
  created_at: string
}
type OrderItemRow = {
  product_id: number
  name: string
  price: number
  quantity: number
  image_url: string
}
type ProductRow = {
  id: number
  name: string
  price: number
  description: string
  category: string
  image_url: string
  stock: number
  tags: string
  created_at: string
}

function rowToOrder(orderRow: OrderRow, items: OrderItemRow[]): Order {
  return {
    id: orderRow.id,
    order_no: orderRow.order_no,
    items: items.map((i) => ({
      product_id: i.product_id,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      image_url: i.image_url,
    })) as OrderItem[],
    total_amount: orderRow.total_amount,
    status: orderRow.status as Order['status'],
    created_at: orderRow.created_at,
  }
}

function loadOrderById(id: number): Order | null {
  const db = getDb()
  const orderRow = db
    .prepare('SELECT * FROM orders WHERE id = ?')
    .get(id) as OrderRow | undefined
  if (!orderRow) return null
  const items = db
    .prepare('SELECT * FROM order_items WHERE order_id = ?')
    .all(id) as OrderItemRow[]
  return rowToOrder(orderRow, items)
}

// GET /api/orders —— 订单列表
// 登录用户返回其本人订单 + 匿名订单；未登录返回匿名订单
router.get('/', authOptional, (req, res) => {
  const db = getDb()
  let rows: OrderRow[]
  if (req.userId) {
    rows = db
      .prepare(
        'SELECT * FROM orders WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC',
      )
      .all(req.userId) as OrderRow[]
  } else {
    rows = db
      .prepare('SELECT * FROM orders WHERE user_id IS NULL ORDER BY created_at DESC')
      .all() as OrderRow[]
  }
  const orders = rows.map((r) => {
    const items = db
      .prepare('SELECT * FROM order_items WHERE order_id = ?')
      .all(r.id) as OrderItemRow[]
    return rowToOrder(r, items)
  })
  res.json(success(orders))
})

// POST /api/orders —— 创建订单
router.post('/', authOptional, (req, res) => {
  const data = req.body as CreateOrderRequest
  if (!data?.items || !Array.isArray(data.items) || data.items.length === 0) {
    res.status(400).json({ code: 400, message: '订单商品不能为空', data: null })
    return
  }

  const db = getDb()

  // 校验商品存在性 & 库存
  const items: OrderItem[] = []
  for (const it of data.items) {
    if (!it.product_id || !it.quantity || it.quantity < 1) {
      res.status(400).json({ code: 400, message: '商品参数不合法', data: null })
      return
    }
    const p = db
      .prepare('SELECT * FROM products WHERE id = ?')
      .get(it.product_id) as ProductRow | undefined
    if (!p) {
      res.status(404).json({ code: 404, message: `商品(id=${it.product_id})不存在`, data: null })
      return
    }
    if (p.stock < it.quantity) {
      res
        .status(400)
        .json({ code: 400, message: `商品「${p.name}」库存不足（剩余 ${p.stock}）`, data: null })
      return
    }
    items.push({
      product_id: p.id,
      name: p.name,
      price: p.price,
      quantity: it.quantity,
      image_url: p.image_url,
    })
  }

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const orderNo = generateOrderNo()
  const createdAt = new Date().toISOString()
  const userId = req.userId ?? null

  const insertOrder = db.prepare(
    `INSERT INTO orders (order_no, user_id, total_amount, status, created_at) VALUES (?, ?, ?, ?, ?)`,
  )
  const insertItem = db.prepare(
    `INSERT INTO order_items (order_id, product_id, name, price, quantity, image_url) VALUES (?, ?, ?, ?, ?, ?)`,
  )
  const reduceStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?')

  const tx = db.transaction(() => {
    const r = insertOrder.run(orderNo, userId, total, 'paid', createdAt)
    const orderId = Number(r.lastInsertRowid)
    for (const it of items) {
      insertItem.run(orderId, it.product_id, it.name, it.price, it.quantity, it.image_url)
      reduceStock.run(it.quantity, it.product_id)
    }
  })
  tx()

  // 查询并返回完整订单
  const created = db
    .prepare('SELECT id FROM orders WHERE order_no = ?')
    .get(orderNo) as { id: number }
  res.json(success(loadOrderById(created.id)))
})

// GET /api/orders/no/:orderNo —— 按订单号查询
// 必须注册在 /:id 之前
router.get('/no/:orderNo', (req, res) => {
  const db = getDb()
  const orderRow = db
    .prepare('SELECT * FROM orders WHERE order_no = ?')
    .get(req.params.orderNo) as OrderRow | undefined
  if (!orderRow) {
    res.status(404).json({ code: 404, message: '订单不存在', data: null })
    return
  }
  const items = db
    .prepare('SELECT * FROM order_items WHERE order_id = ?')
    .all(orderRow.id) as OrderItemRow[]
  res.json(success(rowToOrder(orderRow, items)))
})

// GET /api/orders/:id —— 按订单 id 查询
router.get('/:id', (req, res) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    res.status(400).json({ code: 400, message: '订单 id 不合法', data: null })
    return
  }
  const order = loadOrderById(id)
  if (!order) {
    res.status(404).json({ code: 404, message: '订单不存在', data: null })
    return
  }
  res.json(success(order))
})

export default router
