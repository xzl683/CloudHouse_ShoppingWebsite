<template>
	<el-drawer v-model="visible" direction="rtl" size="380px" title="购物车" :with-header="true">
		<template v-if="cartStore.items.length === 0">
			<el-empty description="购物车空空如也" />
		</template>
		<template v-else>
			<div class="cart-list">
				<div v-for="item in cartStore.items" :key="item.product.id" class="cart-item">
					<img :src="item.product.image_url" :alt="item.product.name" class="cart-item__img" />
					<div class="cart-item__info">
						<div class="cart-item__name text-ellipsis-2">{{ item.product.name }}</div>
						<div class="cart-item__price">¥{{ item.product.price.toFixed(2) }}</div>
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
					合计：<span class="cart-footer__amount">¥{{ cartStore.totalAmount.toFixed(2) }}</span>
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
import { createOrder } from '@/api';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>();

const router = useRouter();
const cartStore = useCartStore();

const visible = computed({
	get: () => props.modelValue,
	set: val => emit('update:modelValue', val),
});

async function goCheckout() {
	try {
		await ElMessageBox.confirm(
			`确认提交订单，合计 ¥${cartStore.totalAmount.toFixed(2)} ？`,
			'订单确认',
			{ confirmButtonText: '提交订单', cancelButtonText: '再看看', type: 'info' },
		);
		const items = cartStore.items.map(i => ({ product_id: i.product.id, quantity: i.quantity }));
		const order = await createOrder({ items });
		cartStore.clearCart();
		visible.value = false;
		ElMessage.success('订单提交成功！');
		router.push({ name: 'OrderDetail', params: { id: order.id } });
	} catch {
		// 用户取消或出错，不做处理
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
