<template>
	<div class="home">
		<!-- Banner -->
		<section class="home__banner">
			<div class="home__banner-content page-container">
				<h1 class="home__banner-title">发现优质数码好物</h1>
				<p class="home__banner-subtitle">精选耳机、键盘、鼠标、显示器，一站式购物体验</p>
				<el-button type="primary" size="large" @click="$router.push({ name: 'ProductList' })">
					立即逛逛
				</el-button>
			</div>
		</section>

		<!-- 分类入口 -->
		<section class="home__section page-container">
			<h2 class="home__section-title">商品分类</h2>
			<div class="home__categories">
				<div
					v-for="cat in categories"
					:key="cat"
					class="home__category"
					@click="$router.push({ name: 'ProductList', query: { category: cat } })"
				>
					<span class="home__category-icon">{{ categoryIcons[cat] || '📦' }}</span>
					<span class="home__category-name">{{ cat }}</span>
				</div>
			</div>
		</section>

		<!-- 推荐商品 -->
		<section class="home__section page-container">
			<div class="home__section-header">
				<h2 class="home__section-title">热门推荐</h2>
				<router-link to="/products" class="home__more">查看全部 →</router-link>
			</div>
			<div v-loading="loading" class="home__products">
				<ProductCard v-for="product in hotProducts" :key="product.id" :product="product" />
			</div>
		</section>

		<!-- 新品上架 -->
		<section class="home__section page-container">
			<div class="home__section-header">
				<h2 class="home__section-title">新品上架</h2>
				<router-link to="/products" class="home__more">查看全部 →</router-link>
			</div>
			<div v-loading="loading" class="home__products">
				<ProductCard v-for="product in newProducts" :key="product.id" :product="product" />
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getProducts, getCategories } from '@/api';
import type { Product } from '@/types';
import ProductCard from '@/components/ProductCard.vue';

const loading = ref(false);
const categories = ref<string[]>([]);
const hotProducts = ref<Product[]>([]);
const newProducts = ref<Product[]>([]);

const categoryIcons: Record<string, string> = {
	耳机: '🎧',
	键盘: '⌨️',
	鼠标: '🖱️',
	显示器: '🖥️',
	智能穿戴: '⌚',
	家居: '💡',
	配件: '🔌',
	音箱: '🔊',
};

onMounted(async () => {
	loading.value = true;
	try {
		const [cats, hot, newest] = await Promise.all([
			getCategories(),
			getProducts({ pageSize: 8, sort: 'price_desc' }),
			getProducts({ pageSize: 8, sort: 'newest' }),
		]);
		categories.value = cats;
		hotProducts.value = hot.list;
		newProducts.value = newest.list;
	} finally {
		loading.value = false;
	}
});
</script>

<style scoped lang="scss">
.home {
	padding-bottom: 40px;
}

.home__banner {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 80px 0;
	margin-bottom: 40px;

	&-content {
		text-align: center;
		color: #fff;
	}

	&-title {
		font-size: 42px;
		margin-bottom: 16px;
	}

	&-subtitle {
		font-size: 18px;
		margin-bottom: 32px;
		opacity: 0.9;
	}
}

.home__section {
	margin-bottom: 40px;

	&-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20px;
	}

	&-title {
		font-size: 24px;
		color: #303133;
	}
}

.home__more {
	font-size: 14px;
	color: #409eff;
}

.home__categories {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
	gap: 16px;
}

.home__category {
	background: #fff;
	border-radius: 12px;
	padding: 24px 16px;
	text-align: center;
	cursor: pointer;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
	transition: all 0.2s;

	&:hover {
		transform: translateY(-3px);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
	}

	&-icon {
		font-size: 36px;
		display: block;
		margin-bottom: 8px;
	}

	&-name {
		font-size: 14px;
		color: #606266;
	}
}

.home__products {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
	gap: 20px;
}

// 响应式
@media (max-width: 768px) {
	.home__banner {
		padding: 40px 0;

		&-title {
			font-size: 28px;
		}

		&-subtitle {
			font-size: 14px;
		}
	}

	.home__products {
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 12px;
	}
}
</style>
