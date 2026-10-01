// 格式化工具函数

// 价格格式化（保留两位小数，加 ¥ 符号）
export function formatPrice(price: number): string {
	return `¥${price.toFixed(2)}`;
}

// 生成订单号
export function generateOrderNo(): string {
	const now = new Date();
	const pad = (n: number) => String(n).padStart(2, '0');
	const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
	const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
	const rand = Math.floor(Math.random() * 1000)
		.toString()
		.padStart(3, '0');
	return `ORD${dateStr}${timeStr}${rand}`;
}

// 格式化日期时间
export function formatDateTime(dateStr: string): string {
	const date = new Date(dateStr);
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
		date.getHours(),
	)}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
