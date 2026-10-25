import { defineStore } from 'pinia';
import { ref } from 'vue';

// 全局 UI 状态：跨组件控制弹窗（如充值弹窗）
export const useUiStore = defineStore('ui', () => {
	const rechargeVisible = ref(false);

	function openRecharge(): void {
		rechargeVisible.value = true;
	}

	function closeRecharge(): void {
		rechargeVisible.value = false;
	}

	return { rechargeVisible, openRecharge, closeRecharge };
});
