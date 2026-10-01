<template>
	<footer class="footer">
		<div class="footer__inner page-container">
			<div class="footer__col">
				<h4 class="footer__title">关于云屋</h4>
				<p class="footer__desc">云屋商城致力于为用户提供优质的数码产品与购物体验。</p>
			</div>
			<div class="footer__col">
				<h4 class="footer__title">购物指南</h4>
				<ul class="footer__links">
					<li><router-link to="/products">全部商品</router-link></li>
					<li><router-link to="/orders">我的订单</router-link></li>
				</ul>
			</div>
			<div class="footer__col">
				<h4 class="footer__title">联系方式</h4>
				<ul class="footer__links">
					<li>客服邮箱：support@cloudhouse.com</li>
					<li>客服电话：400-888-8888</li>
				</ul>
			</div>
		</div>
		<div class="footer__bottom">
			<p>© 2026 云屋商城 CloudHouse. All rights reserved.</p>
		</div>
	</footer>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.footer {
	background: #2c3e50;
	color: #ecf0f1;
	margin-top: 40px;

	&__inner {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		padding: 40px 20px;
		gap: 24px;
	}

	&__col {
		flex: 1;
		min-width: 180px;
	}

	&__title {
		font-size: 16px;
		margin-bottom: 16px;
		color: #fff;
	}

	&__desc {
		font-size: 13px;
		line-height: 1.6;
		color: #bdc3c7;
	}

	&__links {
		li {
			margin-bottom: 8px;
			font-size: 13px;
			color: #bdc3c7;
		}

		a {
			color: #bdc3c7;
			&:hover {
				color: #409eff;
			}
		}
	}

	&__bottom {
		text-align: center;
		padding: 16px;
		border-top: 1px solid #34495e;
		font-size: 12px;
		color: #95a5a6;
	}
}
</style>
