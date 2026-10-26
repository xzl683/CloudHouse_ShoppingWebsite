import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { fileURLToPath, URL } from 'node:url';

// 将 /api 请求代理到后端（Express，默认 3001 端口）
const apiProxy = {
	'/api': {
		target: 'http://localhost:3001',
		changeOrigin: true,
	},
};

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		AutoImport({
			resolvers: [ElementPlusResolver()],
			imports: ['vue', 'vue-router', 'pinia'],
			dts: 'src/auto-imports.d.ts',
		}),
		Components({
			resolvers: [ElementPlusResolver()],
			dts: 'src/components.d.ts',
		}),
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	css: {
		preprocessorOptions: {
			scss: {},
		},
	},
	server: {
		port: 5173,
		open: false,
		// 切换到真实后端时：将 .env 中 VITE_USE_MOCK 改为 false 即可
		proxy: apiProxy,
	},
	// build 后 `npm run preview` 同样走代理，保证 /api 与图片路径正常
	preview: {
		port: 4173,
		proxy: apiProxy,
	},
});
