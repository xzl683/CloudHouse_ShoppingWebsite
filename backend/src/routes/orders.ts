import { Router } from 'express';
import { getDb } from '../db/database';
import { success } from '../utils/response';
import { authRequired } from '../middleware/auth';
import { generateOrderNo } from '../utils/orderNo';
import type { Order, OrderItem, CreateOrderRequest } from '../types';

const router = Router();

// 数据库行类型
type OrderRow = {
	id: number;
	order_no: string;
	user_id: number | null;
	total_amount: number;
	status: string;
	created_at: string;
};
type OrderItemRow = {
	product_id: number;
	name: string;
	price: number;
	quantity: number;
	image_url: string;
};
type ProductRow = {
	id: number;
	name: string;
	price: number;
	description: string;
	category: string;
	image_url: string;
	stock: number;
	tags: string;
	created_at: string;
};

function rowToOrder(orderRow: OrderRow, items: OrderItemRow[]): Order {
	return {
		id: orderRow.id,
		order_no: orderRow.order_no,
		items: items.map(i => ({
			product_id: i.product_id,
			name: i.name,
			price: i.price,
			quantity: i.quantity,
			image_url: i.image_url,
		})) as OrderItem[],
		total_amount: orderRow.total_amount,
		status: orderRow.status as Order['status'],
		created_at: orderRow.created_at,
	};
}

function loadOrderById(id: number): Order | null {
	const db = getDb();
	const orderRow = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as OrderRow | undefined;
	if (!orderRow) return null;
	const items = db
		.prepare('SELECT * FROM order_items WHERE order_id = ?')
		.all(id) as OrderItemRow[];
	return rowToOrder(orderRow, items);
}

// GET /api/orders —— 当前登录用户的订单列表
router.get('/', authRequired, (req, res) => {
	const db = getDb();
	const rows = db
		.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC')
		.all(req.userId) as OrderRow[];
	const orders = rows.map(r => {
		const items = db
			.prepare('SELECT * FROM order_items WHERE order_id = ?')
			.all(r.id) as OrderItemRow[];
		return rowToOrder(r, items);
	});
	res.json(success(orders));
});

// POST /api/orders —— 创建订单（从余额扣费）
router.post('/', authRequired, (req, res) => {
	const data = req.body as CreateOrderRequest;
	if (!data?.items || !Array.isArray(data.items) || data.items.length === 0) {
		res.status(400).json({ code: 400, message: '订单商品不能为空', data: null });
		return;
	}

	const db = getDb();

	// 校验商品存在性 & 库存
	const items: OrderItem[] = [];
	for (const it of data.items) {
		if (!Number.isInteger(it.quantity) || it.quantity < 1) {
			res.status(400).json({ code: 400, message: '商品参数不合法', data: null });
			return;
		}
		const p = db.prepare('SELECT * FROM products WHERE id = ?').get(it.product_id) as
			ProductRow | undefined;
		if (!p) {
			res.status(404).json({ code: 404, message: `商品(id=${it.product_id})不存在`, data: null });
			return;
		}
		if (p.stock < it.quantity) {
			res
				.status(400)
				.json({ code: 400, message: `商品「${p.name}」库存不足（剩余 ${p.stock}）`, data: null });
			return;
		}
		items.push({
			product_id: p.id,
			name: p.name,
			price: p.price,
			quantity: it.quantity,
			image_url: p.image_url,
		});
	}

	// 汇总金额（保留两位小数，避免浮点误差）
	const total = Math.round(items.reduce((s, i) => s + i.price * i.quantity, 0) * 100) / 100;

	// 校验余额
	const user = db.prepare('SELECT id, balance FROM users WHERE id = ?').get(req.userId) as
		| { id: number; balance: number }
		| undefined;
	if (!user) {
		res.status(401).json({ code: 401, message: '用户不存在，请重新登录', data: null });
		return;
	}
	if (user.balance < total) {
		res.status(400).json({
			code: 400,
			message: `余额不足：当前余额 ¥${user.balance.toFixed(2)}，本单需支付 ¥${total.toFixed(
				2,
			)}，请先充值`,
			data: null,
		});
		return;
	}

	const orderNo = generateOrderNo();
	const createdAt = new Date().toISOString();
	const userId = req.userId as number;

	const insertOrder = db.prepare(
		`INSERT INTO orders (order_no, user_id, total_amount, status, created_at) VALUES (?, ?, ?, ?, ?)`,
	);
	const insertItem = db.prepare(
		`INSERT INTO order_items (order_id, product_id, name, price, quantity, image_url) VALUES (?, ?, ?, ?, ?, ?)`,
	);
	// 仅在余额充足时扣款，防止并发下余额被扣成负数
	const deductBalance = db.prepare(
		'UPDATE users SET balance = ROUND(balance - ?, 2) WHERE id = ? AND balance >= ?',
	);
	// 仅在库存充足时扣减
	const reduceStock = db.prepare(
		'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
	);

	try {
		const tx = db.transaction(() => {
			const paid = deductBalance.run(total, userId, total);
			if (paid.changes === 0) {
				throw new Error('INSUFFICIENT_BALANCE');
			}
			const r = insertOrder.run(orderNo, userId, total, 'paid', createdAt);
			const orderId = Number(r.lastInsertRowid);
			for (const it of items) {
				const stockRes = reduceStock.run(it.quantity, it.product_id, it.quantity);
				if (stockRes.changes === 0) {
					throw new Error(`OUT_OF_STOCK:${it.name}`);
				}
				insertItem.run(
					orderId,
					it.product_id,
					it.name,
					it.price,
					it.quantity,
					it.image_url,
				);
			}
		});
		tx();
	} catch (e) {
		const msg = e instanceof Error ? e.message : '';
		if (msg === 'INSUFFICIENT_BALANCE') {
			res.status(400).json({ code: 400, message: '余额不足，请先充值', data: null });
			return;
		}
		if (msg.startsWith('OUT_OF_STOCK:')) {
			res
				.status(400)
				.json({ code: 400, message: `商品「${msg.slice(12)}」库存不足`, data: null });
			return;
		}
		throw e;
	}

	// 查询并返回完整订单
	const created = db.prepare('SELECT id FROM orders WHERE order_no = ?').get(orderNo) as {
		id: number;
	};
	res.json(success(loadOrderById(created.id)));
});

// GET /api/orders/no/:orderNo —— 按订单号查询（仅本人）
// 必须注册在 /:id 之前
router.get('/no/:orderNo', authRequired, (req, res) => {
	const db = getDb();
	const orderRow = db.prepare('SELECT * FROM orders WHERE order_no = ?').get(req.params.orderNo) as
		OrderRow | undefined;
	if (!orderRow) {
		res.status(404).json({ code: 404, message: '订单不存在', data: null });
		return;
	}
	if (orderRow.user_id !== req.userId) {
		res.status(403).json({ code: 403, message: '无权查看该订单', data: null });
		return;
	}
	const items = db
		.prepare('SELECT * FROM order_items WHERE order_id = ?')
		.all(orderRow.id) as OrderItemRow[];
	res.json(success(rowToOrder(orderRow, items)));
});

// GET /api/orders/:id —— 按订单 id 查询（仅本人）
router.get('/:id', authRequired, (req, res) => {
	const id = Number(req.params.id);
	if (Number.isNaN(id)) {
		res.status(400).json({ code: 400, message: '订单 id 不合法', data: null });
		return;
	}
	const order = loadOrderById(id);
	if (!order) {
		res.status(404).json({ code: 404, message: '订单不存在', data: null });
		return;
	}
	const row = getDb().prepare('SELECT user_id FROM orders WHERE id = ?').get(id) as {
		user_id: number | null;
	};
	if (row.user_id !== req.userId) {
		res.status(403).json({ code: 403, message: '无权查看该订单', data: null });
		return;
	}
	res.json(success(order));
});

export default router;
