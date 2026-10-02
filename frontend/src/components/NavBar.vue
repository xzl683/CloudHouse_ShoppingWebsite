<template>
	<header class="navbar">
		<div class="navbar__inner page-container">
			<!-- Logo -->
			<router-link to="/" class="navbar__logo">
				<span class="navbar__logo-icon">🛒</span>
				<span class="navbar__logo-text">云屋商城</span>
			</router-link>

			<!-- 导航链接 -->
			<nav class="navbar__nav">
				<router-link
					to="/"
					class="navbar__link"
					:class="{ 'is-active': route.path === '/' }"
				>
					首页
				</router-link>
				<router-link
					to="/products"
					class="navbar__link"
					:class="{ 'is-active': route.path.startsWith('/products') }"
				>
					全部商品
				</router-link>
				<router-link
					to="/orders"
					class="navbar__link"
					:class="{ 'is-active': route.path.startsWith('/orders') }"
				>
					我的订单
				</router-link>
			</nav>

			<!-- 搜索框 -->
			<div class="navbar__search">
				<el-input
					v-model="searchKeyword"
					placeholder="搜索商品，如耳机、键盘"
					clearable
					@keyup.enter="handleSearch"
				>
					<template #prefix>
						<el-icon><Search /></el-icon>
					</template>
				</el-input>
			</div>

			<!-- 右侧操作 -->
			<div class="navbar__actions">
				<!-- 余额（登录后显示） -->
				<div v-if="userStore.isLoggedIn" class="navbar__balance" @click="showRecharge = true">
					<el-icon><Wallet /></el-icon>
					<span>¥{{ userStore.balance.toFixed(2) }}</span>
				</div>

				<!-- 购物车 -->
				<el-badge
					:value="cartStore.totalCount"
					:hidden="cartStore.totalCount === 0"
					class="navbar__cart"
				>
					<el-button circle @click="$emit('toggle-cart')">
						<el-icon :size="20"><ShoppingCart /></el-icon>
					</el-button>
				</el-badge>

				<!-- 用户 -->
				<el-dropdown v-if="userStore.isLoggedIn" @command="handleUserCommand">
					<span class="navbar__user">
						<el-icon><User /></el-icon>
						<span class="navbar__username">{{ userStore.user?.username }}</span>
					</span>
					<template #dropdown>
						<el-dropdown-menu>
							<el-dropdown-item command="recharge">充值</el-dropdown-item>
							<el-dropdown-item command="orders">我的订单</el-dropdown-item>
							<el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
						</el-dropdown-menu>
					</template>
				</el-dropdown>
				<template v-else>
					<router-link to="/login" class="navbar__btn">登录</router-link>
					<router-link to="/register" class="navbar__btn navbar__btn--primary">注册</router-link>
				</template>
			</div>
		</div>
	</header>

	<!-- 充值弹窗 -->
	<el-dialog v-model="showRecharge" title="账户充值" width="420px">
		<div class="recharge">
			<div class="recharge__current">
				当前余额：<span class="recharge__amount">¥{{ userStore.balance.toFixed(2) }}</span>
			</div>
			<div class="recharge__quick">
				<el-button
					v-for="amt in quickAmounts"
					:key="amt"
					:type="rechargeAmount === amt ? 'primary' : 'default'"
					@click="rechargeAmount = amt"
				>
					¥{{ amt }}
				</el-button>
			</div>
			<el-input-number
				v-model="rechargeAmount"
				:min="1"
				:max="100000"
				:precision="2"
				placeholder="输入充值金额"
				style="width: 100%; margin-top: 16px"
			/>
		</div>
		<template #footer>
			<el-button @click="showRecharge = false">取消</el-button>
			<el-button type="primary" :loading="recharging" @click="handleRecharge">
				确认充值
			</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Search, ShoppingCart, User, Wallet } from '@element-plus/icons-vue';
import { useCartStore } from '@/stores/cart';
import { useUserStore } from '@/stores/user';

defineEmits<{ (e: 'toggle-cart'): void }>();

const router = useRouter();
const route = useRoute();
const cartStore = useCartStore();
const userStore = useUserStore();
const searchKeyword = ref('');

// 充值弹窗
const showRecharge = ref(false);
const recharging = ref(false);
const rechargeAmount = ref<number>(100);
const quickAmounts = [50, 100, 200, 500, 1000];

async function handleRecharge() {
	if (!rechargeAmount.value || rechargeAmount.value <= 0) {
		ElMessage.warning('请输入有效的充值金额');
		return;
	}
	recharging.value = true;
	try {
		await userStore.recharge(rechargeAmount.value);
		ElMessage.success(`充值成功，已到账 ¥${rechargeAmount.value.toFixed(2)}`);
		showRecharge.value = false;
	} catch (e) {
		ElMessage.error(e instanceof Error ? e.message : '充值失败，请重试');
	} finally {
		recharging.value = false;
	}
}

function handleSearch() {
	const keyword = searchKeyword.value.trim();
	if (keyword) {
		router.push({ name: 'ProductList', query: { keyword } });
	} else {
		router.push({ name: 'ProductList' });
	}
}

function handleUserCommand(command: string) {
	if (command === 'recharge') {
		showRecharge.value = true;
	} else if (command === 'orders') {
		router.push({ name: 'OrderList' });
	} else if (command === 'logout') {
		userStore.logout();
		router.push({ name: 'Home' });
	}
}
</script>

<style scoped lang="scss">
.navbar {
	position: sticky;
	top: 0;
	z-index: 100;
	background: #fff;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	height: 64px;

	&__inner {
		display: flex;
		align-items: center;
		height: 100%;
		gap: 24px;
	}

	&__logo {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 20px;
		font-weight: 700;
		color: #409eff;
		flex-shrink: 0;
	}

	&__logo-icon {
		font-size: 26px;
	}

	&__nav {
		display: flex;
		gap: 8px;
		flex-shrink: 0;
	}

	&__link {
		padding: 8px 16px;
		border-radius: 6px;
		color: #606266;
		font-size: 15px;
		transition: all 0.2s;

		&:hover,
		&.is-active {
			color: #409eff;
			background: #ecf5ff;
		}
	}

	&__search {
		flex: 1;
		max-width: 420px;
	}

	&__actions {
		display: flex;
		align-items: center;
		gap: 16px;
		flex-shrink: 0;
	}

	&__cart {
		:deep(.el-badge__content) {
			border: 1px solid #fff;
		}
	}

	&__balance {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 4px 12px;
		background: #fdf6ec;
		color: #e6a23c;
		border-radius: 16px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;

		&:hover {
			background: #faecd8;
		}
	}

	&__user {
		display: flex;
		align-items: center;
		gap: 6px;
		cursor: pointer;
		color: #606266;
		padding: 4px 8px;
		border-radius: 4px;
		transition: all 0.2s;

		&:hover {
			color: #409eff;
			background: #f5f7fa;
		}
	}

	&__username {
		font-size: 14px;
	}

	&__btn {
		padding: 6px 16px;
		border-radius: 6px;
		font-size: 14px;
		color: #606266;
		transition: all 0.2s;

		&:hover {
			color: #409eff;
		}

		&--primary {
			background: #409eff;
			color: #fff;

			&:hover {
				background: #66b1ff;
				color: #fff;
			}
		}
	}
}

// 响应式
@media (max-width: 768px) {
	.navbar {
		height: auto;
		padding: 8px 0;

		&__inner {
			flex-wrap: wrap;
			gap: 12px;
		}

		&__nav {
			order: 3;
			width: 100%;
			justify-content: center;
		}

		&__search {
			order: 2;
			max-width: 100%;
			flex: 1 1 100%;
		}

		&__actions {
			order: 1;
			margin-left: auto;
		}
	}
}

// 充值弹窗
.recharge {
	&__current {
		font-size: 15px;
		color: #606266;
		margin-bottom: 12px;
	}

	&__amount {
		color: #f56c6c;
		font-weight: 700;
		font-size: 18px;
	}

	&__quick {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
}
</style>
