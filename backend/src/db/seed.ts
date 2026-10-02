import type { Database } from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { seedProducts } from './seedData';

/**
 * 写入种子数据：20 件商品 + 1 个演示用户 + 1 笔演示订单
 * 仅在数据库为空时调用（由 database.ts 控制）
 */
export function seed(db: Database): void {
	// 1. 商品（按 id 顺序插入，保持与前端 Mock 一致）
	const insertProduct = db.prepare(
		`INSERT INTO products (id, name, price, description, category, image_url, stock, tags, created_at)
     VALUES (@id, @name, @price, @description, @category, @image_url, @stock, @tags, @created_at)`,
	);
	const insertProducts = db.transaction((items: typeof seedProducts) => {
		for (const p of items) {
			insertProduct.run({ ...p, tags: JSON.stringify(p.tags) });
		}
	});
	insertProducts(seedProducts);

	// 2. 演示用户：demo / 123456，初始余额 1000
	const passwordHash = bcrypt.hashSync('123456', 10);
	db
		.prepare(
			`INSERT INTO users (id, username, password, balance, created_at) VALUES (?, ?, ?, ?, ?)`,
		)
		.run(1, 'demo', passwordHash, 1000, new Date('2026-01-01T00:00:00Z').toISOString());

	// 3. 演示订单（与前端 mockOrders 一致）
	const orderNo = 'ORD20260930100001';
	const createdAt = new Date('2026-09-28T10:00:00Z').toISOString();
	const items = [
		{
			product_id: 1,
			name: 'SoundWave Pro 主动降噪耳机',
			price: 899,
			quantity: 1,
			image_url: seedProducts[0].image_url,
		},
		{
			product_id: 8,
			name: 'GamerMouse G7 电竞鼠标',
			price: 249,
			quantity: 1,
			image_url: seedProducts[7].image_url,
		},
	];
	const totalAmount = items.reduce((s, i) => s + i.price * i.quantity, 0);

	const insertOrder = db.prepare(
		`INSERT INTO orders (order_no, user_id, total_amount, status, created_at) VALUES (?, ?, ?, ?, ?)`,
	);
	const insertItem = db.prepare(
		`INSERT INTO order_items (order_id, product_id, name, price, quantity, image_url) VALUES (?, ?, ?, ?, ?, ?)`,
	);
	const tx = db.transaction(() => {
		const r = insertOrder.run(orderNo, 1, totalAmount, 'paid', createdAt);
		const orderId = Number(r.lastInsertRowid);
		for (const it of items) {
			insertItem.run(orderId, it.product_id, it.name, it.price, it.quantity, it.image_url);
		}
	});
	tx();
}
