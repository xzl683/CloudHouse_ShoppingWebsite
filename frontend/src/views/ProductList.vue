<template>
  <div class="product-list page-container">
    <!-- 筛选栏 -->
    <div class="product-list__filter">
      <div class="product-list__filter-item">
        <span class="product-list__filter-label">分类：</span>
        <el-radio-group v-model="selectedCategory" @change="handleFilterChange">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button
            v-for="cat in categories"
            :key="cat"
            :label="cat"
          >{{ cat }}</el-radio-button>
        </el-radio-group>
      </div>

      <div class="product-list__filter-item">
        <span class="product-list__filter-label">价格：</span>
        <el-input-number v-model="minPrice" :min="0" placeholder="最低价" size="small" style="width: 120px" @change="handleFilterChange" />
        <span style="margin: 0 8px">—</span>
        <el-input-number v-model="maxPrice" :min="0" placeholder="最高价" size="small" style="width: 120px" @change="handleFilterChange" />
        <el-button size="small" @click="resetPrice">重置</el-button>
      </div>

      <div class="product-list__filter-item">
        <span class="product-list__filter-label">排序：</span>
        <el-select v-model="sortBy" size="small" style="width: 140px" @change="handleFilterChange">
          <el-option label="默认" value="" />
          <el-option label="价格从低到高" value="price_asc" />
          <el-option label="价格从高到低" value="price_desc" />
          <el-option label="最新上架" value="newest" />
        </el-select>
      </div>
    </div>

    <!-- 搜索结果提示 -->
    <div v-if="keyword" class="product-list__result">
      搜索 “<b>{{ keyword }}</b>” 共找到 <b>{{ total }}</b> 件商品
    </div>

    <!-- 商品列表 -->
    <div v-loading="loading" class="product-list__grid">
      <ProductCard v-for="product in products" :key="product.id" :product="product" />
      <el-empty v-if="!loading && products.length === 0" description="没有找到相关商品" />
    </div>

    <!-- 分页 -->
    <div class="product-list__pagination">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[8, 12, 16, 24]"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @size-change="fetchProducts"
        @current-change="fetchProducts"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getProducts, getCategories } from '@/api'
import type { Product } from '@/types'
import ProductCard from '@/components/ProductCard.vue'

const route = useRoute()
const loading = ref(false)
const products = ref<Product[]>([])
const categories = ref<string[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(12)

const keyword = ref((route.query.keyword as string) || '')
const selectedCategory = ref((route.query.category as string) || '')
const minPrice = ref<number | undefined>(undefined)
const maxPrice = ref<number | undefined>(undefined)
const sortBy = ref<string>('')

async function fetchProducts() {
  loading.value = true
  try {
    const params: Record<string, unknown> = {
      page: page.value,
      pageSize: pageSize.value,
    }
    if (keyword.value) params.keyword = keyword.value
    if (selectedCategory.value) params.category = selectedCategory.value
    if (minPrice.value !== undefined) params.minPrice = minPrice.value
    if (maxPrice.value !== undefined) params.maxPrice = maxPrice.value
    if (sortBy.value) params.sort = sortBy.value

    const res = await getProducts(params)
    products.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function handleFilterChange() {
  page.value = 1
  fetchProducts()
}

function resetPrice() {
  minPrice.value = undefined
  maxPrice.value = undefined
  handleFilterChange()
}

watch(
  () => route.query,
  (q) => {
    keyword.value = (q.keyword as string) || ''
    selectedCategory.value = (q.category as string) || ''
    page.value = 1
    fetchProducts()
  },
)

onMounted(async () => {
  categories.value = await getCategories()
  fetchProducts()
})
</script>

<style scoped lang="scss">
.product-list {
  padding: 24px 20px;
}

.product-list__filter {
  background: #fff;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-list__filter-item {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.product-list__filter-label {
  color: #909399;
  font-size: 14px;
  flex-shrink: 0;
}

.product-list__result {
  margin-bottom: 16px;
  color: #606266;

  b {
    color: #409eff;
  }
}

.product-list__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  min-height: 300px;
}

.product-list__pagination {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

@media (max-width: 768px) {
  .product-list__grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
}
</style>
