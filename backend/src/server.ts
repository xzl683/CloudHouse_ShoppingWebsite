import app from './app';
import { config } from './config';
import { getDb } from './db/database';

const PORT = config.port;

try {
	// 启动时初始化数据库（建表 + 种子）
	getDb();
} catch (err) {
	console.error('❌ 数据库初始化失败：');
	console.error(err);
	console.error('\n常见原因（Windows）：better-sqlite3 原生绑定加载失败');
	console.error('请尝试：npm rebuild better-sqlite3');
	console.error('或安装 Visual Studio Build Tools 后重新 npm install');
	process.exit(1);
}

const server = app.listen(PORT, () => {
	console.log(`✅ CloudHouse backend running at http://localhost:${PORT}`);
	console.log(`   Health check: http://localhost:${PORT}/api/health`);
});

server.on('error', (err) => {
	console.error('❌ 服务启动失败：', err.message);
	process.exit(1);
});
