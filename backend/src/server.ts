import app from './app';
import { config } from './config';
import { getDb } from './db/database';

// 启动时初始化数据库（建表 + 种子）
getDb();

const PORT = config.port;
app.listen(PORT, () => {
	console.log(`✅ CloudHouse backend running at http://localhost:${PORT}`);
	console.log(`   Health check: http://localhost:${PORT}/api/health`);
});
