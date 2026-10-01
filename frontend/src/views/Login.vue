<template>
	<div class="auth-page">
		<el-card class="auth-page__card" shadow="hover">
			<h2 class="auth-page__title">登录</h2>
			<el-form
				ref="formRef"
				:model="form"
				:rules="rules"
				label-width="0"
				@keyup.enter="handleLogin"
			>
				<el-form-item prop="username">
					<el-input v-model="form.username" placeholder="用户名" size="large" :prefix-icon="User" />
				</el-form-item>
				<el-form-item prop="password">
					<el-input
						v-model="form.password"
						type="password"
						placeholder="密码"
						size="large"
						show-password
						:prefix-icon="Lock"
					/>
				</el-form-item>
				<el-form-item>
					<el-button
						type="primary"
						size="large"
						style="width: 100%"
						:loading="loading"
						@click="handleLogin"
					>
						登录
					</el-button>
				</el-form-item>
				<div class="auth-page__tip">
					<span>还没有账号？</span>
					<router-link to="/register">立即注册</router-link>
				</div>
				<div class="auth-page__demo">
					<el-text type="info" size="small">演示账号：demo / 123456</el-text>
				</div>
			</el-form>
		</el-card>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

const formRef = ref<FormInstance>();
const loading = ref(false);
const form = ref({ username: '', password: '' });

const rules: FormRules = {
	username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
	password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};

async function handleLogin() {
	if (!formRef.value) return;
	await formRef.value.validate(async valid => {
		if (!valid) return;
		loading.value = true;
		try {
			await userStore.login(form.value);
			ElMessage.success('登录成功');
			router.push({ name: 'Home' });
		} catch (e) {
			ElMessage.error((e as Error).message || '登录失败');
		} finally {
			loading.value = false;
		}
	});
}
</script>

<style scoped lang="scss">
.auth-page {
	min-height: calc(100vh - 64px);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40px 20px;

	&__card {
		width: 100%;
		max-width: 400px;
	}

	&__title {
		text-align: center;
		margin-bottom: 24px;
		color: #303133;
	}

	&__tip {
		text-align: center;
		color: #909399;
		font-size: 14px;

		a {
			margin-left: 4px;
		}
	}

	&__demo {
		text-align: center;
		margin-top: 12px;
	}
}
</style>
