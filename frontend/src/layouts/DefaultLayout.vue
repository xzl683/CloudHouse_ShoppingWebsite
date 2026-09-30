<template>
  <div class="layout">
    <NavBar @toggle-cart="cartVisible = true" />
    <main class="layout__main">
      <router-view />
    </main>
    <FooterBar />
    <CartDrawer v-model="cartVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import NavBar from '@/components/NavBar.vue'
import FooterBar from '@/components/FooterBar.vue'
import CartDrawer from '@/components/CartDrawer.vue'

const cartVisible = ref(false)
</script>

<style scoped lang="scss">
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.layout__main {
  flex: 1;
  width: 100%;
}
</style>
