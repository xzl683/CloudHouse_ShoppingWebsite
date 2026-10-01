// 生成订单号：ORD + YYYYMMDD + 6 位随机数
export function generateOrderNo(): string {
	const d = new Date();
	const pad = (n: number) => String(n).padStart(2, '0');
	const date = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
	const rand = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
	return `ORD${date}${rand}`;
}
