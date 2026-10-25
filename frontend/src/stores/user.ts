import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, LoginRequest, RegisterRequest } from '@/types';
import * as authApi from '@/api/auth';
import { storage } from '@/utils/storage';

export const useUserStore = defineStore('user', () => {
	const user = ref<User | null>(storage.get<User>('user'));
	const token = ref<string | null>(storage.get<string>('token'));

	const isLoggedIn = computed(() => !!token.value);
	const balance = computed(() => user.value?.balance ?? 0);

	async function login(data: LoginRequest): Promise<void> {
		const res = await authApi.login(data);
		user.value = res.user;
		token.value = res.token;
		// 真实后端登录时也需要持久化，否则刷新页面会丢失登录态
		storage.set('token', res.token);
		storage.set('user', res.user);
	}

	async function register(data: RegisterRequest): Promise<void> {
		await authApi.register(data);
	}

	async function recharge(amount: number): Promise<void> {
		const updated = await authApi.recharge(amount);
		user.value = updated;
		storage.set('user', updated);
	}

	// 刷新当前用户信息（如下单扣费后同步余额）
	async function refreshUser(): Promise<void> {
		if (!token.value) return;
		try {
			const latest = await authApi.getCurrentUser();
			user.value = latest;
			storage.set('user', latest);
		} catch {
			// 刷新失败不影响主流程，保留本地缓存
		}
	}

	function logout(): void {
		authApi.logout();
		user.value = null;
		token.value = null;
	}

	return {
		user,
		token,
		isLoggedIn,
		balance,
		login,
		register,
		recharge,
		refreshUser,
		logout,
	};
});
