<template>
  <div class="order-list page-container">
    <h2 class="order-list__title">我的订单</h2>

    <div v-loading="loading" class="order-list__content">
      <el-empty v-if="!loading && orders.length === 0" description="暂无订单" />

      <el-card v-for="order in orders" :key="order.id" class="order-list__item" shadow="never">
        <div class="order-list__header">
          <span class="order-list__no">订单号：{{ order.order_no }}</span>
          <span class="order-list__time">{{ formatDateTime(order.created_at) }}</span>
          <el-tag :type="order.status === 'paid' ? 'success' : 'warning'" size="small">
            {{ order.status === 'paid' ? '已支付' : '待支付' }}
          </el-tag>
        </div>

        <div class="order-list__items">
          <div v-for="item in order.items" :key="item.product_id" class="order-list__product">
            <img :src="item.image_url" :alt="item.name" />
            <div class="order-list__product-info">
              <span class="text-ellipsis">{{ item.name }}</span>
              <span class="order-list__product-price">¥{{ item.price.toFixed(2) }} × {{ item.quantity }}</span>
            </div>
          </div>
        </div>

        <div class="order-list__footer">
          <span class="order-list__total">
            共 {{ order.items.reduce((s, i) => s + i.quantity, 0) }} 件商品，合计：
            <b>¥{{ order.total_amount.toFixed(2) }}</b>
          </span>
          <el-button type="primary" size="small" @click="goDetail(order.id)">查看详情</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getOrders } from '@/api'
import type { Order } from '@/types'
import { formatDateTime } from '@/utils/format'

const router = useRouter()
const loading = ref(false)
const orders = ref<Order[]>([])

async function fetchOrders() {
  loading.value = true
  try {
    orders.value = await getOrders()
  } finally {
    loading.value = false
  }
}

function goDetail(id: number) {
  router.push({ name: 'OrderDetail', params: { id } })
}

onMounted(fetchOrders)
</script>

<style scoped lang="scss">
.order-list {
  padding: 24px 20px 40px;

  &__title {
    font-size: 24px;
    margin-bottom: 20px;
  }

  &__item {
    margin-bottom: 16px;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #ebeef5;
    margin-bottom: 12px;
  }

  &__no {
    font-weight: 600;
    color: #303133;
  }

  &__time {
    color: #909399;
    font-size: 13px;
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 12px;
  }

  &__product {
    display: flex;
    gap: 12px;
    align-items: center;

    img {
      width: 60px;
      height: 60px;
      border-radius: 6px;
      object-fit: cover;
    }
  }

  &__product-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  &__product-price {
    color: #909399;
    font-size: 13px;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 12px;
    border-top: 1px solid #ebeef5;
  }

  &__total {
    color: #606266;

    b {
      color: #f56c6c;
      font-size: 18px;
    }
  }
}
</style>
