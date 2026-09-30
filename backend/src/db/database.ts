import Database from 'better-sqlite3'
import path from 'node:path'
import fs from 'node:fs'
import { config } from '../config'
import { seed } from './seed'

let dbInstance: Database.Database | null = null

/**
 * 获取数据库单例（首次调用时建表并播种数据）
 */
export function getDb(): Database.Database {
  if (dbInstance) return dbInstance

  const dbPath = path.resolve(process.cwd(), config.dbPath)
  const dir = path.dirname(dbPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')

  initSchema(db)

  // 仅在商品表为空时执行种子（避免每次重启重复插入）
  const { c } = db.prepare('SELECT COUNT(*) AS c FROM products').get() as { c: number }
  if (c === 0) {
    seed(db)
    console.log('[db] 已写入种子数据')
  }

  dbInstance = db
  return db
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      image_url TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      tags TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_no TEXT UNIQUE NOT NULL,
      user_id INTEGER,
      total_amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'paid',
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    );
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
  `)
}
