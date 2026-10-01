<template>
	<div v-loading="loading" class="product-detail page-container">
		<el-page-header @back="$router.back()" class="product-detail__back">
			<template #content>商品详情</template>
		</el-page-header>

		<template v-if="product">
			<div class="product-detail__content">
				<!-- 左侧图片 -->
				<div class="product-detail__image">
					<img :src="product.image_url" :alt="product.name" />
				</div>

				<!-- 右侧信息 -->
				<div class="product-detail__info">
					<h1 class="product-detail__name">{{ product.name }}</h1>
					<div class="product-detail__tags">
						<el-tag v-for="tag in product.tags" :key="tag" type="success" effect="plain">
							{{ tag }}
						</el-tag>
					</div>

					<div class="product-detail__price-box">
						<span class="product-detail__price-label">价格</span>
						<span class="product-detail__price">¥{{ product.price.toFixed(2) }}</span>
					</div>

					<div class="product-detail__meta">
						<div class="product-detail__meta-item">
							<span class="product-detail__meta-label">分类：</span>
							<el-tag size="small">{{ product.category }}</el-tag>
						</div>
						<div class="product-detail__meta-item">
							<span class="product-detail__meta-label">库存：</span>
							<span :class="{ 'out-of-stock': product.stock === 0 }">
								{{ product.stock > 0 ? `${product.stock} 件` : '已售罄' }}
							</span>
						</div>
					</div>

					<div class="product-detail__description">
						<h3>商品介绍</h3>
						<p>{{ product.description }}</p>
					</div>

					<div class="product-detail__actions">
						<div class="product-detail__quantity">
							<span class="product-detail__meta-label">数量：</span>
							<el-input-number
								v-model="quantity"
								:min="1"
								:max="product.stock"
								:disabled="product.stock === 0"
							/>
						</div>
						<el-button
							type="primary"
							size="large"
							:disabled="product.stock === 0"
							@click="handleAddToCart"
						>
							<el-icon><ShoppingCart /></el-icon>
							加入购物车
						</el-button>
						<el-button
							type="danger"
							size="large"
							:disabled="product.stock === 0"
							@click="handleBuyNow"
						>
							立即购买
						</el-button>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ShoppingCart } from '@element-plus/icons-vue';
import { getProductById, createOrder } from '@/api';
import { useCartStore } from '@/stores/cart';
import type { Product } from '@/types';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();

const loading = ref(false);
const product = ref<Product | null>(null);
const quantity = ref(1);

async function fetchProduct() {
	loading.value = true;
	try {
		const id = Number(route.params.id);
		product.value = await getProductById(id);
	} catch (e) {
		ElMessage.error('商品不存在');
		router.push({ name: 'ProductList' });
	} finally {
		loading.value = false;
	}
}

function handleAddToCart() {
	if (!product.value) return;
	cartStore.addToCart(product.value, quantity.value);
	ElMessage.success(`已添加 ${quantity.value} 件「${product.value.name}」到购物车`);
}

async function handleBuyNow() {
	if (!product.value) return;
	try {
		const order = await createOrder({
			items: [{ product_id: product.value.id, quantity: quantity.value }],
		});
		ElMessage.success('下单成功！');
		router.push({ name: 'OrderDetail', params: { id: order.id } });
	} catch {
		ElMessage.error('下单失败，请重试');
	}
}

onMounted(fetchProduct);
</script>

<style scoped lang="scss">
.product-detail {
	padding: 24px 20px 40px;

	&__back {
		margin-bottom: 20px;
	}

	&__content {
		display: flex;
		gap: 32px;
		background: #fff;
		padding: 32px;
		border-radius: 12px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
	}

	&__image {
		width: 420px;
		flex-shrink: 0;
		border-radius: 8px;
		overflow: hidden;

		img {
			width: 100%;
			aspect-ratio: 1;
			object-fit: cover;
		}
	}

	&__info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	&__name {
		font-size: 26px;
		color: #303133;
		line-height: 1.3;
	}

	&__tags {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}

	&__price-box {
		background: linear-gradient(90deg, #fff7e6 0%, #ffece8 100%);
		padding: 20px 24px;
		border-radius: 8px;
		display: flex;
		align-items: baseline;
		gap: 16px;
	}

	&__price-label {
		font-size: 14px;
		color: #909399;
	}

	&__price {
		font-size: 36px;
		font-weight: 700;
		color: #f56c6c;
	}

	&__meta {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	&__meta-item {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	&__meta-label {
		color: #909399;
		font-size: 14px;
	}

	.out-of-stock {
		color: #f56c6c;
		font-weight: 600;
	}

	&__description {
		h3 {
			font-size: 16px;
			margin-bottom: 8px;
			color: #303133;
		}

		p {
			color: #606266;
			line-height: 1.8;
		}
	}

	&__actions {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-top: auto;
		flex-wrap: wrap;
	}

	&__quantity {
		display: flex;
		align-items: center;
		gap: 8px;
	}
}

// 响应式
@media (max-width: 900px) {
	.product-detail__content {
		flex-direction: column;
		padding: 20px;
	}

	.product-detail__image {
		width: 100%;
	}

	.product-detail__name {
		font-size: 20px;
	}

	.product-detail__price {
		font-size: 28px;
	}
}
</style>
