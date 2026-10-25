<template>
	<el-dialog v-model="ui.rechargeVisible" title="账户充值" width="min(420px, 92vw)">
		<div class="recharge">
			<div class="recharge__current">
				当前余额：<span class="recharge__amount">¥{{ userStore.balance.toFixed(2) }}</span>
			</div>
			<div class="recharge__quick">
				<el-button
					v-for="amt in quickAmounts"
					:key="amt"
					:type="rechargeAmount === amt ? 'primary' : 'default'"
					@click="rechargeAmount = amt"
				>
					¥{{ amt }}
				</el-button>
			</div>
			<el-input-number
				v-model="rechargeAmount"
				:min="1"
				:max="100000"
				:precision="2"
				placeholder="输入充值金额"
				style="width: 100%; margin-top: 16px"
			/>
		</div>
		<template #footer>
			<el-button @click="ui.closeRecharge()">取消</el-button>
			<el-button type="primary" :loading="recharging" @click="handleRecharge">
				确认充值
			</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { useUiStore } from '@/stores/ui';

const userStore = useUserStore();
const ui = useUiStore();

const recharging = ref(false);
const rechargeAmount = ref<number>(100);
const quickAmounts = [50, 100, 200, 500, 1000];

async function handleRecharge() {
	if (!rechargeAmount.value || rechargeAmount.value <= 0) {
		ElMessage.warning('请输入有效的充值金额');
		return;
	}
	recharging.value = true;
	try {
		await userStore.recharge(rechargeAmount.value);
		ElMessage.success(`充值成功，已到账 ¥${rechargeAmount.value.toFixed(2)}`);
		ui.closeRecharge();
	} catch (e) {
		ElMessage.error(e instanceof Error ? e.message : '充值失败，请重试');
	} finally {
		recharging.value = false;
	}
}
</script>

<style scoped lang="scss">
.recharge {
	&__current {
		font-size: 15px;
		color: #606266;
		margin-bottom: 12px;
	}

	&__amount {
		color: #f56c6c;
		font-weight: 700;
		font-size: 18px;
	}

	&__quick {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
}
</style>
