# CloudHouse 云屋商城

一个完整的购物网站项目，采用**前后端分离**架构：前端 Vue 3 + TypeScript，后端 Node.js + Express + TypeScript，数据库 SQLite。

## 项目结构

```
.
├── frontend/          # Vue 3 + TypeScript + Vite 前端
├── backend/           # Node.js + Express + TypeScript 后端（SQLite）
├── 项目文档/           # 项目考核文档与学习路线
└── README.md
```

## 前端

详见 [frontend/README.md](./frontend/README.md)

### 快速开始

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:5173

### 演示账号
- 用户名：`demo`
- 密码：`123456`

## 后端

详见 [backend/README.md](./backend/README.md)

### 快速开始

```bash
cd backend
npm install
npm run dev      # 开发模式（tsx watch，自动重启）
# 或
npm run build && npm start   # 生产模式
```

服务运行于 http://localhost:3001 ，健康检查 http://localhost:3001/api/health

### 前后端联调

1. 启动后端：`cd backend && npm run dev`
2. 将 `frontend/.env` 中 `VITE_USE_MOCK` 改为 `false`（已通过 Vite 代理 /api → :3001）
3. 启动前端：`cd frontend && npm run dev`

## AI Coding Process

本项目使用 AI Coding 工具（Trae + 大语言模型）协同完成，从需求拆解、前端页面、后端接口、数据库设计到问题排查均有 AI 参与。人工主要负责：明确需求与约束、拆解任务、审查 AI 产出、运行验证并定位偏差。

下面选取 3 个有代表性的任务说明 AI 的使用过程。

### 1. 前后端分离架构与后端服务搭建

**目标**：在 Vue 3 前端之外，补齐一套能真实支撑购物流程的后端（商品、订单、用户），并保证前后端可一键切换 Mock / 真实接口。

**给 AI 的上下文与约束**：

- 技术栈固定为 Node.js + Express + TypeScript + SQLite（better-sqlite3），鉴权使用 JWT + bcrypt；
- 统一响应结构 `{ code, message, data }`，前端 axios 拦截器按该结构解包；
- 商品至少 15～30 条，需支持 `keyword / category / minPrice / maxPrice / page / pageSize / sort`；
- 接口路径、字段名必须与前端 `src/types` 中的类型保持一致；
- 通过 `VITE_USE_MOCK` 控制前端走 Mock 还是真实后端。

**AI 产出**：Express 应用骨架、SQLite 建表与自动播种（20 件商品 + demo 用户）、商品/订单/认证三组路由、JWT 中间件、前端 `request.ts` 与 Pinia stores。

**人工验证**：启动后端后用 `curl` 依次验证 `/api/health`、`/api/products?keyword=耳机`、登录后 `POST /api/orders`；再跑 `npm run build` 确认 TypeScript 通过。过程中发现后端 `node_modules` 缺失导致 `tsc` 报「找不到 express/jsonwebtoken」，补装依赖后消除。

### 2. 商品图片生成与本地化接入

**目标**：把占位的 `picsum.photos` 随机图替换为与商品匹配的真实产品图。

**AI 协作过程**：

1. 按商品名称/品类批量生成 20 张文生图（耳机、键盘、鼠标、显示器、手表等）；
2. 生成图右下角带有水印，用 ImageMagick 统一裁掉底部区域、缩放为 900×844、质量 86，总体积控制在 832K；
3. 让 AI 修改前后端两份种子数据：用 `IMG_MAP` 把原 seed 名映射到 `/products/xxx.jpg`，避免图片路径散落在业务代码里；
4. 人工用 `identify` 校验尺寸/体积，并在页面中确认图片正常加载。

### 3. 充值-扣费链路实现与真实 Bug 定位

**需求**：用户可以查看余额、充值；下单时从余额扣费；余额不足时给出明确提示并引导充值。

**AI 方案设计**：

- 后端在 SQLite 事务中用条件更新原子扣款：`UPDATE users SET balance = ROUND(balance - ?, 2) WHERE id = ? AND balance >= ?`，库存同理，避免并发下扣成负数；
- 下单前先校验余额与库存，余额不足返回「当前余额 ¥X，本单需支付 ¥Y，请先充值」；
- 前端下单前预检余额，不足时弹窗引导充值；下单成功后刷新用户信息同步余额；
- Mock 分支实现与后端等价的校验/扣费逻辑，并把 Mock 用户持久化，避免重新登录后余额回退。

**借助 AI 排查的真实问题**：

| 现象 | 定位过程 | 修复 |
| --- | --- | --- |
| 前端请求后端一直 401/502 | 浏览器 Network 看到请求未带 `Authorization`；对比发现 `storage` 封装会把值 JSON 序列化，而 `request.ts` 用 `localStorage.getItem` 直接读取，拿到的是带引号的字符串 | 统一改用 `storage.get<string>('token')` |
| 后端 `tsc` 大量「找不到模块/console/process」 | 报错集中在类型声明缺失，判断为依赖未安装而非代码问题 | 重新 `npm install` 后构建通过 |
| `better-sqlite3@13` 启动失败 | 该版本要求 Node ≥ 22，本地 Node 版本较低 | 降级到 v11 |

**验证方式**：完整回归「余额不足 → 去充值 → 再次下单 → 余额减少 → 订单详情金额正确」，并执行 `vue-tsc --noEmit` 与前后端 `npm run build`。

### AI 使用原则

- 先提供项目结构、现有代码和类型定义，再让 AI 修改，减少凭空猜测；
- 一次只推进一个可验证的小目标，避免大跨度重构；
- 要求 AI 先读文件再动手，改动后必须通过类型检查、构建或接口调用验证；
- 报错时提供完整日志与复现步骤，让 AI 先定位原因再修复；
- AI 生成的代码由人工审查关键业务逻辑（金额计算、权限校验、事务边界）。

> 说明：考核第九章的 AI 客服 / 购物 Agent 本次未实现，项目聚焦于基础购物流程与工程完整性。

## 技术选型说明

后端采用推荐方案 **Node.js + Express + TypeScript**，与前端统一 TS 生态，便于共享类型定义、AI 辅助生成代码。方案对比与选型详见 [开发计划](./.trae/documents/shopping_website_plan.md)。
