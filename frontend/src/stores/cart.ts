import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CartItem, Product } from '@/types'
import { storage } from '@/utils/storage'

const CART_STORAGE_KEY = 'cart'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>(loadCartFromStorage())

  // 从 localStorage 加载购物车
  function loadCartFromStorage(): CartItem[] {
    return storage.get<CartItem[]>(CART_STORAGE_KEY) || []
  }

  // 保存购物车到 localStorage
  function saveCartToStorage(): void {
    storage.set(CART_STORAGE_KEY, items.value)
  }

  // 购物车商品总数量
  const totalCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0),
  )

  // 购物车总金额
  const totalAmount = computed(() =>
    items.value.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  )

  // 添加商品到购物车
  function addToCart(product: Product, quantity = 1): void {
    const existing = items.value.find((item) => item.product.id === product.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({ product, quantity })
    }
    saveCartToStorage()
  }

  // 更新商品数量
  function updateQuantity(productId: number, quantity: number): void {
    const item = items.value.find((i) => i.product.id === productId)
    if (item) {
      if (quantity <= 0) {
        removeFromCart(productId)
      } else {
        item.quantity = quantity
        saveCartToStorage()
      }
    }
  }

  // 移除商品
  function removeFromCart(productId: number): void {
    items.value = items.value.filter((item) => item.product.id !== productId)
    saveCartToStorage()
  }

  // 清空购物车
  function clearCart(): void {
    items.value = []
    saveCartToStorage()
  }

  // 获取某项商品数量
  function getItemQuantity(productId: number): number {
    const item = items.value.find((i) => i.product.id === productId)
    return item ? item.quantity : 0
  }

  return {
    items,
    totalCount,
    totalAmount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getItemQuantity,
  }
})
