<template>
  <div v-loading="loading" class="order-detail page-container">
    <template v-if="order">
      <!-- 下单成功提示 -->
      <el-result
        v-if="order.status === 'paid'"
        icon="success"
        title="下单成功"
        :sub-title="`订单号：${order.order_no}`"
      >
        <template #extra>
          <el-button type="primary" @click="$router.push({ name: 'OrderList' })">
            查看全部订单
          </el-button>
          <el-button @click="$router.push({ name: 'Home' })">继续购物</el-button>
        </template>
      </el-result>

      <!-- 订单信息 -->
      <el-card class="order-detail__card" shadow="never">
        <template #header>
          <div class="order-detail__header">
            <span>订单详情</span>
            <el-tag :type="order.status === 'paid' ? 'success' : 'warning'" size="small">
              {{ order.status === 'paid' ? '已支付' : '待支付' }}
            </el-tag>
          </div>
        </template>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ order.order_no }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ formatDateTime(order.created_at) }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            {{ order.status === 'paid' ? '已支付' : '待支付' }}
          </el-descriptions-item>
          <el-descriptions-item label="订单总价">
            <span style="color: #f56c6c; font-weight: 600">¥{{ order.total_amount.toFixed(2) }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <h3 class="order-detail__section-title">商品清单</h3>
        <el-table :data="order.items" stripe style="width: 100%">
          <el-table-column label="商品" min-width="200">
            <template #default="{ row }">
              <div class="order-detail__product-cell">
                <img :src="row.image_url" :alt="row.name" />
                <span class="text-ellipsis">{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="单价" width="120">
            <template #default="{ row }">¥{{ row.price.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column label="数量" width="100">
            <template #default="{ row }">{{ row.quantity }}</template>
          </el-table-column>
          <el-table-column label="小计" width="120">
            <template #default="{ row }">
              <span style="color: #f56c6c">¥{{ (row.price * row.quantity).toFixed(2) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getOrderById } from '@/api'
import type { Order } from '@/types'
import { formatDateTime } from '@/utils/format'

const route = useRoute()
const loading = ref(false)
const order = ref<Order | null>(null)

async function fetchOrder() {
  loading.value = true
  try {
    const id = Number(route.params.id)
    order.value = await getOrderById(id)
  } catch {
    ElMessage.error('订单不存在')
  } finally {
    loading.value = false
  }
}

onMounted(fetchOrder)
</script>

<style scoped lang="scss">
.order-detail {
  padding: 24px 20px 40px;

  &__card {
    margin-top: 20px;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 600;
  }

  &__section-title {
    margin: 20px 0 12px;
    font-size: 16px;
  }

  &__product-cell {
    display: flex;
    align-items: center;
    gap: 10px;

    img {
      width: 48px;
      height: 48px;
      border-radius: 4px;
      object-fit: cover;
    }
  }
}
</style>
