<template>
	<div class="product-card" @click="goDetail">
		<div class="product-card__image">
			<img :src="product.image_url" :alt="product.name" loading="lazy" />
			<div v-if="product.stock === 0" class="product-card__soldout">已售罄</div>
		</div>
		<div class="product-card__info">
			<h3 class="product-card__name text-ellipsis-2">{{ product.name }}</h3>
			<div class="product-card__tags">
				<el-tag
					v-for="tag in product.tags.slice(0, 2)"
					:key="tag"
					size="small"
					type="info"
					effect="plain"
				>
					{{ tag }}
				</el-tag>
			</div>
			<div class="product-card__bottom">
				<span class="product-card__price">¥{{ product.price.toFixed(2) }}</span>
				<el-button
					type="primary"
					size="small"
					:disabled="product.stock === 0"
					@click.stop="handleAddToCart"
				>
					加入购物车
				</el-button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { Product } from '@/types';
import { useCartStore } from '@/stores/cart';

const props = defineProps<{ product: Product }>();
const router = useRouter();
const cartStore = useCartStore();

function goDetail() {
	router.push({ name: 'ProductDetail', params: { id: props.product.id } });
}

function handleAddToCart() {
	cartStore.addToCart(props.product);
	ElMessage.success(`已添加「${props.product.name}」到购物车`);
}
</script>

<style scoped lang="scss">
.product-card {
	background: #fff;
	border-radius: 8px;
	overflow: hidden;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
	cursor: pointer;
	transition:
		transform 0.2s,
		box-shadow 0.2s;
	display: flex;
	flex-direction: column;

	&:hover {
		transform: translateY(-4px);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
	}

	&__image {
		position: relative;
		width: 100%;
		aspect-ratio: 1;
		overflow: hidden;
		background: #f5f7fa;

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
			transition: transform 0.3s;
		}
	}

	&:hover &__image img {
		transform: scale(1.05);
	}

	&__soldout {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 18px;
		font-weight: 600;
	}

	&__info {
		padding: 12px 14px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		flex: 1;
	}

	&__name {
		font-size: 14px;
		line-height: 1.4;
		color: #303133;
		font-weight: 500;
		min-height: 40px;
	}

	&__tags {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;
	}

	&__bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: auto;
	}

	&__price {
		font-size: 18px;
		font-weight: 700;
		color: #f56c6c;
	}
}
</style>
