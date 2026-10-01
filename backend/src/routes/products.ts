import { Router } from 'express';
import { getDb } from '../db/database';
import { success } from '../utils/response';
import type { Product, ProductQueryParams, ProductListResponse } from '../types';

const router = Router();

// 把数据库行映射为 Product（tags 从 JSON 字符串还原）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToProduct(row: any): Product {
	return {
		id: row.id,
		name: row.name,
		price: row.price,
		description: row.description,
		category: row.category,
		image_url: row.image_url,
		stock: row.stock,
		tags: JSON.parse(row.tags || '[]'),
		created_at: row.created_at,
	};
}

// GET /api/products/categories —— 分类列表
// 注意：此路由必须注册在 /:id 之前，否则会被 :id 捕获
router.get('/categories', (_req, res) => {
	const db = getDb();
	const rows = db.prepare('SELECT DISTINCT category FROM products ORDER BY category').all() as {
		category: string;
	}[];
	res.json(success(rows.map(r => r.category)));
});

// GET /api/products —— 商品列表（支持搜索/筛选/分页/排序）
router.get('/', (req, res) => {
	const db = getDb();

	const params: ProductQueryParams = {
		keyword: (req.query.keyword as string | undefined)?.trim() || undefined,
		category: (req.query.category as string | undefined) || undefined,
		minPrice: req.query.minPrice !== undefined ? Number(req.query.minPrice) : undefined,
		maxPrice: req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : undefined,
		page: req.query.page !== undefined ? Number(req.query.page) : 1,
		pageSize: req.query.pageSize !== undefined ? Number(req.query.pageSize) : 12,
		sort: req.query.sort as ProductQueryParams['sort'] | undefined,
	};

	// 动态拼接 WHERE
	const where: string[] = [];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const args: any[] = [];
	if (params.keyword) {
		where.push('(name LIKE ? OR description LIKE ? OR tags LIKE ?)');
		const kw = `%${params.keyword}%`;
		args.push(kw, kw, kw);
	}
	if (params.category) {
		where.push('category = ?');
		args.push(params.category);
	}
	if (params.minPrice !== undefined && !Number.isNaN(params.minPrice)) {
		where.push('price >= ?');
		args.push(params.minPrice);
	}
	if (params.maxPrice !== undefined && !Number.isNaN(params.maxPrice)) {
		where.push('price <= ?');
		args.push(params.maxPrice);
	}
	const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

	// 总数
	const { c: total } = db
		.prepare(`SELECT COUNT(*) AS c FROM products ${whereSql}`)
		.get(...args) as { c: number };

	// 排序
	let orderSql = 'ORDER BY id ASC';
	if (params.sort === 'price_asc') orderSql = 'ORDER BY price ASC';
	else if (params.sort === 'price_desc') orderSql = 'ORDER BY price DESC';
	else if (params.sort === 'newest') orderSql = 'ORDER BY created_at DESC';

	const page = Math.max(1, params.page || 1);
	const pageSize = Math.max(1, Math.min(100, params.pageSize || 12));
	const offset = (page - 1) * pageSize;

	const rows = db
		.prepare(`SELECT * FROM products ${whereSql} ${orderSql} LIMIT ? OFFSET ?`)
		.all(...args, pageSize, offset);

	const list = rows.map(rowToProduct);
	const result: ProductListResponse = { list, total, page, pageSize };
	res.json(success(result));
});

// GET /api/products/:id —— 商品详情
router.get('/:id', (req, res) => {
	const db = getDb();
	const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
	if (!row) {
		res.status(404).json({ code: 404, message: '商品不存在', data: null });
		return;
	}
	res.json(success(rowToProduct(row)));
});

export default router;
