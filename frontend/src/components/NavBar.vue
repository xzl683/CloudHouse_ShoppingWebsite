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
        <router-link to="/" class="navbar__link">首页</router-link>
        <router-link to="/products" class="navbar__link">全部商品</router-link>
        <router-link to="/orders" class="navbar__link">我的订单</router-link>
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
        <!-- 购物车 -->
        <el-badge :value="cartStore.totalCount" :hidden="cartStore.totalCount === 0" class="navbar__cart">
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
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search, ShoppingCart, User } from '@element-plus/icons-vue'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'

defineEmits<{ (e: 'toggle-cart'): void }>()

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()
const searchKeyword = ref('')

function handleSearch() {
  const keyword = searchKeyword.value.trim()
  if (keyword) {
    router.push({ name: 'ProductList', query: { keyword } })
  } else {
    router.push({ name: 'ProductList' })
  }
}

function handleUserCommand(command: string) {
  if (command === 'orders') {
    router.push({ name: 'OrderList' })
  } else if (command === 'logout') {
    userStore.logout()
    router.push({ name: 'Home' })
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
    &.router-link-active {
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
</style>
