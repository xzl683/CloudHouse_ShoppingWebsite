import dotenv from 'dotenv';

// 加载 .env 配置
dotenv.config();

export const config = {
	/** 服务端口 */
	port: Number(process.env.PORT) || 3001,
	/** JWT 签名密钥 */
	jwtSecret: process.env.JWT_SECRET || 'cloudhouse-dev-secret-change-me',
	/** JWT 过期时间 */
	jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
	/** 允许的跨域来源 */
	corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5173')
		.split(',')
		.map(s => s.trim())
		.filter(Boolean),
	/** SQLite 数据库文件路径 */
	dbPath: process.env.DB_PATH || './data/cloudhouse.db',
};

export type AppConfig = typeof config;
