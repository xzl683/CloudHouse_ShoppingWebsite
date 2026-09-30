# 云屋商城 CloudHouse Shopping

一个基于 **Vue 3 + TypeScript** 的购物网站前端项目，采用前后端分离架构。开发阶段使用 Mock 数据，可平滑对接任意后端服务。

## 项目介绍

本项目实现了完整的电商购物流程，包括商品浏览、搜索筛选、商品详情、购物车、下单、订单管理等核心功能，并附带用户注册登录系统（加分项）。

### 核心功能

- 🏠 **首页**：Banner、商品分类入口、热门推荐、新品上架
- 📦 **商品列表**：商品卡片网格、关键词搜索、分类筛选、价格区间筛选、排序、分页
- 🔍 **商品详情**：商品大图、价格、库存、介绍、加入购物车、立即购买
- 🛒 **侧拉购物车**：添加/删除/修改数量、金额实时计算、清空、去结算
- 📋 **订单管理**：模拟支付下单、订单详情、订单列表
- 👤 **用户系统**：注册、登录、退出、登录状态管理
- 📱 **响应式适配**：支持手机、平板、桌面端，50%–250% 缩放布局不错乱

### 核心用户流程

```
进入商城 → 浏览商品 → 搜索/筛选 → 商品详情 → 加入购物车 → 修改购物车 → 提交订单 → 查看订单结果
```

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | Vue 3 + TypeScript + Vite | Composition API + `<script setup>` |
| UI 组件库 | Element Plus | 组件化开发 |
| 状态管理 | Pinia | 购物车、用户状态 |
| 路由 | Vue Router 4 | 页面路由 |
| HTTP | Axios | 接口请求封装 |
| 样式 | SCSS | 响应式布局（flex + 媒体查询） |

## 项目结构

```
frontend/
├── src/
│   ├── api/              # 接口请求封装（Mock/真实接口切换）
│   ├── assets/styles/    # 全局样式（变量、reset）
│   ├── components/       # 公共组件（NavBar、ProductCard、CartDrawer、FooterBar）
│   ├── layouts/          # 布局组件（DefaultLayout）
│   ├── mock/             # Mock 数据（20 条商品）
│   ├── router/           # 路由配置
│   ├── stores/           # Pinia 状态（cart、user）
│   ├── types/            # TypeScript 类型定义
│   ├── utils/            # 工具函数（request、storage、format）
│   ├── views/            # 页面（Home、ProductList、ProductDetail、OrderList、OrderDetail、Login、Register、NotFound）
│   ├── App.vue
│   └── main.ts
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装与运行

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

启动后访问 http://localhost:5173

### 构建

```bash
npm run build
```

### 类型检查

```bash
npx vue-tsc --noEmit
```

## 演示账号

- 用户名：`demo`
- 密码：`123456`

## 前后端分离说明

本项目采用前后端分离架构，前端通过统一的 `api/` 模块与后端解耦。

### Mock 模式（当前默认）

开发阶段使用前端内置的 Mock 数据，无需后端即可运行完整流程。通过环境变量控制：

```env
# .env
VITE_USE_MOCK=true          # 开启 Mock 数据
VITE_API_BASE_URL=/api      # 后端 API 地址
```

### 对接真实后端

将 `VITE_USE_MOCK` 设为 `false`，前端将通过 Axios 请求真实后端接口。只需确保后端提供以下 API 契约：

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/products | 商品列表（支持 keyword, category, minPrice, maxPrice, page, pageSize, sort） |
| GET | /api/products/:id | 商品详情 |
| POST | /api/orders | 创建订单 |
| GET | /api/orders/:id | 订单详情 |
| GET | /api/orders | 订单列表 |
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |
| GET | /api/auth/me | 当前用户信息 |

### 后端方案推荐

详见 [开发计划](../.trae/documents/shopping_website_plan.md) 中的后端方案对比。推荐使用 **Node.js + Express + TypeScript**，前后端统一 TS 生态，可共享类型定义。

## 响应式设计

- 使用 flex 布局 + 媒体查询 + 相对单位
- 适配手机（<768px）、平板（768px–900px）、桌面端（>900px）
- 页面在 50%–250% 缩放下布局不错乱

## AI Coding Process

本项目开发过程中大量使用 AI 辅助编码，以下为代表性任务：

### 任务一：项目脚手架与基础配置

- **需求描述**：使用 Vite 创建 Vue 3 + TS 项目，集成 Element Plus（自动导入）、Pinia、Vue Router、Axios、SCSS，配置路径别名
- **AI 辅助方式**：通过 Prompt 描述技术栈与配置要求，AI 生成 `vite.config.ts`、`tsconfig`、`main.ts` 等配置文件
- **验证方式**：`npm run build` 通过，开发服务器正常启动

### 任务二：购物车状态管理

- **需求描述**：实现 Pinia 购物车 store，支持添加、删除、修改数量、金额计算、localStorage 持久化
- **AI 辅助方式**：提供数据结构和功能清单，AI 生成 `stores/cart.ts`，人工核对金额计算逻辑与持久化时机
- **验证方式**：浏览器实测数量增减与合计金额实时同步，刷新页面购物车不丢失

### 任务三：商品搜索与筛选

- **需求描述**：商品列表页支持关键词搜索、分类筛选、价格区间筛选、排序、分页
- **AI 辅助方式**：描述交互流程与参数结构，AI 生成视图组件与 Mock 过滤逻辑，人工调整筛选条件组合逻辑
- **验证方式**：搜索"耳机"仅返回耳机商品，价格筛选与排序结果正确

## 后续规划

- [ ] 后端实现（Node.js + Express + TypeScript）
- [ ] AI 购物 Agent（自然语言查商品、加购、下单闭环）
- [ ] 商品图片本地化
- [ ] 单元测试

## License

MIT
