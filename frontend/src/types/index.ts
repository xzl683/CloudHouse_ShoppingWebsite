// 商品类型
export interface Product {
	id: number;
	name: string;
	price: number;
	description: string;
	category: string;
	image_url: string;
	stock: number;
	tags: string[];
	created_at: string;
}

// 商品列表查询参数
export interface ProductQueryParams {
	keyword?: string;
	category?: string;
	minPrice?: number;
	maxPrice?: number;
	page?: number;
	pageSize?: number;
	sort?: 'price_asc' | 'price_desc' | 'newest';
}

// 商品列表返回
export interface ProductListResponse {
	list: Product[];
	total: number;
	page: number;
	pageSize: number;
}

// 购物车项
export interface CartItem {
	product: Product;
	quantity: number;
}

// 订单商品项
export interface OrderItem {
	product_id: number;
	name: string;
	price: number;
	quantity: number;
	image_url: string;
}

// 订单
export interface Order {
	id: number;
	order_no: string;
	items: OrderItem[];
	total_amount: number;
	status: 'pending' | 'paid' | 'cancelled';
	created_at: string;
}

// 创建订单请求
export interface CreateOrderRequest {
	items: { product_id: number; quantity: number }[];
}

// 用户
export interface User {
	id: number;
	username: string;
	balance: number;
	created_at: string;
}

// 登录请求
export interface LoginRequest {
	username: string;
	password: string;
}

// 注册请求
export interface RegisterRequest {
	username: string;
	password: string;
}

// 登录响应
export interface LoginResponse {
	token: string;
	user: User;
}

// 统一 API 响应
export interface ApiResponse<T = unknown> {
	code: number;
	message: string;
	data: T;
}
