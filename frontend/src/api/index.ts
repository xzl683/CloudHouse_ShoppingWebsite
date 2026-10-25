import { http } from '@/utils/request';
import { mockProducts, mockOrders } from '@/mock/products';
import { syncMockUserBalance } from '@/api/auth';
import type {
	Product,
	ProductQueryParams,
	ProductListResponse,
	Order,
	CreateOrderRequest,
	User,
} from '@/types';
import { generateOrderNo } from '@/utils/format';
import { storage } from '@/utils/storage';

// 是否使用 Mock 数据（开发阶段默认开启）
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// ============ 商品 API ============

// 模拟分页、搜索、筛选
function mockGetProducts(params: ProductQueryParams): ProductListResponse {
	let list = [...mockProducts];

	if (params.keyword) {
		const kw = params.keyword.toLowerCase();
		list = list.filter(
			p =>
				p.name.toLowerCase().includes(kw) ||
				p.description.toLowerCase().includes(kw) ||
				p.tags.some(t => t.toLowerCase().includes(kw)),
		);
	}

	if (params.category) {
		list = list.filter(p => p.category === params.category);
	}

	if (params.minPrice !== undefined) {
		list = list.filter(p => p.price >= params.minPrice!);
	}

	if (params.maxPrice !== undefined) {
		list = list.filter(p => p.price <= params.maxPrice!);
	}

	if (params.sort) {
		switch (params.sort) {
			case 'price_asc':
				list.sort((a, b) => a.price - b.price);
				break;
			case 'price_desc':
				list.sort((a, b) => b.price - a.price);
				break;
			case 'newest':
				list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
				break;
		}
	}

	const total = list.length;
	const page = params.page ?? 1;
	const pageSize = params.pageSize ?? 12;
	const start = (page - 1) * pageSize;
	const pagedList = list.slice(start, start + pageSize);

	return { list: pagedList, total, page, pageSize };
}

export function getProducts(params: ProductQueryParams): Promise<ProductListResponse> {
	if (USE_MOCK) {
		return Promise.resolve(mockGetProducts(params));
	}
	return http<ProductListResponse>({ url: '/products', method: 'GET', params });
}

export function getProductById(id: number): Promise<Product> {
	if (USE_MOCK) {
		const product = mockProducts.find(p => p.id === id);
		if (!product) return Promise.reject(new Error('商品不存在'));
		return Promise.resolve(product);
	}
	return http<Product>({ url: `/products/${id}`, method: 'GET' });
}

// 获取所有分类
export function getCategories(): Promise<string[]> {
	if (USE_MOCK) {
		const categories = [...new Set(mockProducts.map(p => p.category))];
		return Promise.resolve(categories);
	}
	return http<string[]>({ url: '/products/categories', method: 'GET' });
}

// ============ 订单 API ============

// 获取本地存储的订单
function getLocalOrders(): Order[] {
	return storage.get<Order[]>('orders') || [...mockOrders];
}

function saveLocalOrders(orders: Order[]): void {
	storage.set('orders', orders);
}

export function createOrder(data: CreateOrderRequest): Promise<Order> {
	if (USE_MOCK) {
		const user = storage.get<User>('user');
		if (!user) return Promise.reject(new Error('请先登录后再下单'));

		const items: Order['items'] = [];
		for (const item of data.items) {
			const product = mockProducts.find(p => p.id === item.product_id);
			if (!product) return Promise.reject(new Error('商品不存在'));
			if (product.stock < item.quantity) {
				return Promise.reject(new Error(`商品「${product.name}」库存不足`));
			}
			items.push({
				product_id: product.id,
				name: product.name,
				price: product.price,
				quantity: item.quantity,
				image_url: product.image_url,
			});
		}

		const totalAmount =
			Math.round(items.reduce((sum, it) => sum + it.price * it.quantity, 0) * 100) / 100;

		// 余额校验与扣费
		if (user.balance < totalAmount) {
			return Promise.reject(
				new Error(
					`余额不足：当前余额 ¥${user.balance.toFixed(2)}，本单需支付 ¥${totalAmount.toFixed(
						2,
					)}，请先充值`,
				),
			);
		}
		user.balance = Math.round((user.balance - totalAmount) * 100) / 100;
		storage.set('user', user);
		syncMockUserBalance(user.username, user.balance);

		// 扣减库存
		for (const item of data.items) {
			const product = mockProducts.find(p => p.id === item.product_id);
			if (product) product.stock -= item.quantity;
		}

		const order: Order = {
			id: Date.now(),
			order_no: generateOrderNo(),
			items,
			total_amount: totalAmount,
			status: 'paid',
			created_at: new Date().toISOString(),
		};

		const orders = getLocalOrders();
		orders.unshift(order);
		saveLocalOrders(orders);

		return Promise.resolve(order);
	}
	return http<Order>({ url: '/orders', method: 'POST', data });
}

export function getOrderById(id: number): Promise<Order> {
	if (USE_MOCK) {
		const orders = getLocalOrders();
		const order = orders.find(o => o.id === id);
		if (!order) return Promise.reject(new Error('订单不存在'));
		return Promise.resolve(order);
	}
	return http<Order>({ url: `/orders/${id}`, method: 'GET' });
}

export function getOrderByNo(orderNo: string): Promise<Order> {
	if (USE_MOCK) {
		const orders = getLocalOrders();
		const order = orders.find(o => o.order_no === orderNo);
		if (!order) return Promise.reject(new Error('订单不存在'));
		return Promise.resolve(order);
	}
	return http<Order>({ url: `/orders/no/${orderNo}`, method: 'GET' });
}

export function getOrders(): Promise<Order[]> {
	if (USE_MOCK) {
		return Promise.resolve(getLocalOrders());
	}
	return http<Order[]>({ url: '/orders', method: 'GET' });
}
