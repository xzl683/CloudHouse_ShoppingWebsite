<template>
	<el-drawer
		v-model="visible"
		direction="rtl"
		size="min(380px, 100%)"
		title="购物车"
		:with-header="true"
	>
		<template v-if="cartStore.items.length === 0">
			<el-empty description="购物车空空如也" />
		</template>
		<template v-else>
			<div class="cart-list">
				<div v-for="item in cartStore.items" :key="item.product.id" class="cart-item">
					<img :src="item.product.image_url" :alt="item.product.name" class="cart-item__img" />
					<div class="cart-item__info">
						<div class="cart-item__name text-ellipsis-2">{{ item.product.name }}</div>
						<div class="cart-item__price">
							¥{{ item.product.price.toFixed(2) }}
							<span class="cart-item__subtotal"
								>小计 ¥{{ (item.product.price * item.quantity).toFixed(2) }}</span
							>
						</div>
						<div class="cart-item__actions">
							<el-input-number
								v-model="item.quantity"
								:min="1"
								:max="item.product.stock"
								size="small"
								controls-position="right"
								@change="val => val !== undefined && cartStore.updateQuantity(item.product.id, val)"
							/>
							<el-button
								type="danger"
								link
								size="small"
								@click="cartStore.removeFromCart(item.product.id)"
							>
								删除
							</el-button>
						</div>
					</div>
				</div>
			</div>
		</template>

		<template #footer>
			<div class="cart-footer">
				<div class="cart-footer__total">
					<div>
						合计：<span class="cart-footer__amount"
							>¥{{ cartStore.totalAmount.toFixed(2) }}</span
						>
					</div>
					<div v-if="userStore.isLoggedIn" class="cart-footer__balance">
						账户余额：
						<span :class="{ 'is-insufficient': userStore.balance < cartStore.totalAmount }"
							>¥{{ userStore.balance.toFixed(2) }}</span
						>
					</div>
				</div>
				<div class="cart-footer__actions">
					<el-button @click="cartStore.clearCart()" :disabled="cartStore.items.length === 0">
						清空购物车
					</el-button>
					<el-button type="primary" :disabled="cartStore.items.length === 0" @click="goCheckout">
						去结算
					</el-button>
				</div>
			</div>
		</template>
	</el-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useCartStore } from '@/stores/cart';
import { useUserStore } from '@/stores/user';
import { useUiStore } from '@/stores/ui';
import { createOrder } from '@/api';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>();

const router = useRouter();
const cartStore = useCartStore();
const userStore = useUserStore();
const ui = useUiStore();

const visible = computed({
	get: () => props.modelValue,
	set: val => emit('update:modelValue', val),
});

async function goCheckout() {
	if (!cartStore.requireLogin()) return;

	// 余额不足时引导充值，避免下单失败
	const total = cartStore.totalAmount;
	if (userStore.balance < total) {
		try {
			await ElMessageBox.confirm(
				`当前余额 ¥${userStore.balance.toFixed(2)}，本单需支付 ¥${total.toFixed(
					2,
				)}，余额不足，是否立即充值？`,
				'余额不足',
				{ confirmButtonText: '去充值', cancelButtonText: '取消', type: 'warning' },
			);
			visible.value = false;
			ui.openRecharge();
		} catch {
			// 用户取消
		}
		return;
	}

	try {
		await ElMessageBox.confirm(
			`确认提交订单，合计 ¥${total.toFixed(2)} ？（将从余额中扣除）`,
			'订单确认',
			{ confirmButtonText: '提交订单', cancelButtonText: '再看看', type: 'info' },
		);
		const items = cartStore.items.map(i => ({ product_id: i.product.id, quantity: i.quantity }));
		const order = await createOrder({ items });
		await userStore.refreshUser();
		cartStore.clearCart();
		visible.value = false;
		ElMessage.success('订单提交成功！');
		router.push({ name: 'OrderDetail', params: { id: order.id } });
	} catch (e) {
		// 用户取消时静默；接口/业务错误给出提示（axios 错误已由拦截器提示）
		const err = e as { response?: unknown; message?: string };
		if (e !== 'cancel' && e !== 'close' && !err.response && err.message) {
			ElMessage.error(err.message);
		}
	}
}
</script>

<style scoped lang="scss">
.cart-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.cart-item {
	display: flex;
	gap: 12px;
	padding: 12px;
	background: #f5f7fa;
	border-radius: 8px;

	&__img {
		width: 72px;
		height: 72px;
		border-radius: 6px;
		object-fit: cover;
		flex-shrink: 0;
	}

	&__info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-width: 0;
	}

	&__name {
		font-size: 13px;
		color: #303133;
		line-height: 1.4;
	}

	&__price {
		font-size: 15px;
		font-weight: 600;
		color: #f56c6c;
		display: flex;
		align-items: baseline;
		gap: 8px;
	}

	&__subtotal {
		font-size: 12px;
		font-weight: 400;
		color: #909399;
	}

	&__actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: auto;
	}
}

.cart-footer {
	display: flex;
	flex-direction: column;
	gap: 12px;

	&__total {
		font-size: 15px;
		color: #606266;
	}

	&__amount {
		font-size: 20px;
		font-weight: 700;
		color: #f56c6c;
	}

	&__balance {
		font-size: 13px;
		color: #909399;
		margin-top: 4px;

		.is-insufficient {
			color: #f56c6c;
			font-weight: 600;
		}
	}

	&__actions {
		display: flex;
		gap: 8px;

		.el-button {
			flex: 1;
		}
	}
}

:deep(.el-drawer__body) {
	display: flex;
	flex-direction: column;
}
</style>
