import { http } from '@/utils/request';
import { storage } from '@/utils/storage';
import type { User, LoginRequest, LoginResponse, RegisterRequest } from '@/types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// ============ 用户认证 API ============

type MockUser = { id: number; username: string; password: string; balance: number };

const MOCK_USERS_KEY = 'mock_users';
const DEFAULT_MOCK_USERS: MockUser[] = [
	{ id: 1, username: 'demo', password: '123456', balance: 1000 },
];

// Mock 用户持久化到 localStorage，保证刷新/重新登录后余额与注册账号不丢失
function loadMockUsers(): MockUser[] {
	return storage.get<MockUser[]>(MOCK_USERS_KEY) || [...DEFAULT_MOCK_USERS];
}

function saveMockUsers(users: MockUser[]): void {
	storage.set(MOCK_USERS_KEY, users);
}

// 下单扣费后同步 Mock 用户余额，避免重新登录时余额回退
export function syncMockUserBalance(username: string, balance: number): void {
	const users = loadMockUsers();
	const target = users.find(u => u.username === username);
	if (!target) return;
	target.balance = balance;
	saveMockUsers(users);
}

export function login(data: LoginRequest): Promise<LoginResponse> {
	if (USE_MOCK) {
		const user = loadMockUsers().find(
			u => u.username === data.username && u.password === data.password,
		);
		if (!user) {
			return Promise.reject(new Error('用户名或密码错误'));
		}
		const token = `mock-token-${user.id}-${Date.now()}`;
		const userInfo: User = {
			id: user.id,
			username: user.username,
			balance: user.balance,
			created_at: '2026-01-01T00:00:00Z',
		};
		storage.set('token', token);
		storage.set('user', userInfo);
		return Promise.resolve({ token, user: userInfo });
	}
	return http<LoginResponse>({ url: '/auth/login', method: 'POST', data });
}

export function register(data: RegisterRequest): Promise<User> {
	if (USE_MOCK) {
		const users = loadMockUsers();
		const exists = users.some(u => u.username === data.username);
		if (exists) {
			return Promise.reject(new Error('用户名已存在'));
		}
		const newUser: MockUser = {
			id: users.length + 1,
			username: data.username,
			password: data.password,
			balance: 0,
		};
		users.push(newUser);
		saveMockUsers(users);
		const userInfo: User = {
			id: newUser.id,
			username: newUser.username,
			balance: newUser.balance,
			created_at: new Date().toISOString(),
		};
		return Promise.resolve(userInfo);
	}
	return http<User>({ url: '/auth/register', method: 'POST', data });
}

export function getCurrentUser(): Promise<User> {
	if (USE_MOCK) {
		const user = storage.get<User>('user');
		if (!user) return Promise.reject(new Error('未登录'));
		return Promise.resolve(user);
	}
	return http<User>({ url: '/auth/me', method: 'GET' });
}

// 充值
export function recharge(amount: number): Promise<User> {
	if (USE_MOCK) {
		if (!Number.isFinite(amount) || amount <= 0 || amount > 100000) {
			return Promise.reject(new Error('充值金额需在 1~100000 之间'));
		}
		const stored = storage.get<User>('user');
		if (!stored) return Promise.reject(new Error('未登录'));
		const users = loadMockUsers();
		const target = users.find(u => u.username === stored.username);
		if (!target) return Promise.reject(new Error('未登录'));
		target.balance = Math.round((target.balance + amount) * 100) / 100;
		saveMockUsers(users);
		const updated = { ...stored, balance: target.balance };
		storage.set('user', updated);
		return Promise.resolve(updated);
	}
	return http<User>({ url: '/auth/recharge', method: 'POST', data: { amount } });
}

export function logout(): void {
	storage.remove('token');
	storage.remove('user');
}
