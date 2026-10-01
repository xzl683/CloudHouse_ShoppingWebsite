# CloudHouse 云屋商城 - 后端

购物网站后端 API 服务，采用 **Node.js + Express + TypeScript** 技术栈，数据库使用 **SQLite (better-sqlite3)**，鉴权基于 **JWT + bcrypt**。

与前端 [frontend](../frontend) 通过 RESTful API 通信，遵循统一响应结构 `{ code, message, data }`。

## 技术栈

| 层级     | 技术                    | 说明                     |
| -------- | ----------------------- | ------------------------ |
| 运行时   | Node.js + TypeScript    | 与前端统一 TS 生态       |
| Web 框架 | Express 4               | 轻量成熟                 |
| 数据库   | SQLite (better-sqlite3) | 单文件、零配置、同步 API |
| 鉴权     | jsonwebtoken + bcryptjs | JWT 令牌 + 密码哈希      |
| 日志     | morgan                  | HTTP 请求日志            |
| 开发工具 | tsx                     | TS 热重载开发            |
| 构建     | tsc                     | 类型检查 + 编译为 CJS    |

## 项目结构

```
backend/
├── src/
│   ├── config/         # 配置（读取 .env）
│   ├── db/             # 数据库初始化 + 种子数据
│   │   ├── database.ts # 建表、单例、自动播种
│   │   ├── seed.ts     # 种子写入逻辑
│   │   └── seedData.ts # 20 件商品数据
│   ├── middleware/     # 中间件
│   │   ├── auth.ts     # authRequired / authOptional（JWT）
│   │   └── errorHandler.ts
│   ├── routes/         # 路由
│   │   ├── products.ts # 商品
│   │   ├── orders.ts   # 订单
│   │   └── auth.ts     # 用户认证
│   ├── types/          # 与前端共享的 TS 类型契约
│   ├── utils/          # 响应封装 / JWT / 订单号
│   ├── app.ts          # Express 应用（中间件 + 路由挂载）
│   └── server.ts       # 启动入口
├── data/               # SQLite 数据库文件（gitignored）
├── .env.example        # 环境变量示例
├── tsconfig.json
└── package.json
```

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 开发模式（tsx watch，文件改动自动重启，启动即自动建表 + 播种）
npm run dev

# 3. 生产模式
npm run build     # tsc 编译到 dist/
npm start         # node dist/server.js
```

启动后：

- 服务地址：http://localhost:3001
- 健康检查：http://localhost:3001/api/health

## 配置

复制 `.env.example` 为 `.env` 并按需修改：

| 变量             | 默认值                            | 说明                         |
| ---------------- | --------------------------------- | ---------------------------- |
| `PORT`           | `3001`                            | 服务端口                     |
| `JWT_SECRET`     | `cloudhouse-dev-secret-change-me` | JWT 签名密钥（生产务必替换） |
| `JWT_EXPIRES_IN` | `7d`                              | Token 有效期                 |
| `CORS_ORIGIN`    | `http://localhost:5173`           | 允许的跨域来源（逗号分隔）   |
| `DB_PATH`        | `./data/cloudhouse.db`            | SQLite 文件路径              |

> 数据库在首次启动时自动建表并写入种子数据（20 件商品 + demo 用户 + 1 笔演示订单）。重置数据只需删除 `data/cloudhouse.db*` 后重启。

## API 接口清单

统一响应结构：

```json
{ "code": 200, "message": "success", "data": {...} }
```

`code === 200` 表示成功，否则为错误（附带 HTTP 状态码）。

### 商品 `/api/products`

| 方法 | 路径                       | 说明                            | 入参                                                                                                      |
| ---- | -------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------- |
| GET  | `/api/products`            | 商品列表（搜索/筛选/分页/排序） | query: `keyword` `category` `minPrice` `maxPrice` `page` `pageSize` `sort(price_asc\|price_desc\|newest)` |
| GET  | `/api/products/:id`        | 商品详情                        | -                                                                                                         |
| GET  | `/api/products/categories` | 分类列表                        | -                                                                                                         |

### 订单 `/api/orders`

| 方法 | 路径                      | 说明                                      | 鉴权 |
| ---- | ------------------------- | ----------------------------------------- | ---- |
| GET  | `/api/orders`             | 订单列表（登录看本人+匿名，未登录看匿名） | 可选 |
| POST | `/api/orders`             | 创建订单（校验库存 + 事务扣减）           | 可选 |
| GET  | `/api/orders/:id`         | 按 id 查询                                | -    |
| GET  | `/api/orders/no/:orderNo` | 按订单号查询                              | -    |

创建订单请求体：

```json
{ "items": [{ "product_id": 2, "quantity": 2 }] }
```

### 用户认证 `/api/auth`

| 方法 | 路径                 | 说明                               | 鉴权     |
| ---- | -------------------- | ---------------------------------- | -------- |
| POST | `/api/auth/register` | 注册（用户名 2-20 位，密码 ≥6 位） | -        |
| POST | `/api/auth/login`    | 登录，返回 JWT                     | -        |
| GET  | `/api/auth/me`       | 当前用户信息                       | 必须登录 |

### 其他

| 方法 | 路径          | 说明     |
| ---- | ------------- | -------- |
| GET  | `/api/health` | 健康检查 |

## 数据模型

- `users`：id, username(唯一), password(bcrypt 哈希), created_at
- `products`：id, name, price, description, category, image_url, stock, tags(JSON), created_at
- `orders`：id, order_no(唯一), user_id(可空), total_amount, status, created_at
- `order_items`：id, order_id, product_id, name, price, quantity, image_url

## 演示账号

- 用户名：`demo`
- 密码：`123456`

## 与前端联调

1. 启动后端：`npm run dev`（监听 3001）
2. 前端 `frontend/.env` 设置 `VITE_USE_MOCK=false`（`vite.config.ts` 已将 `/api` 代理至 `:3001`）
3. 启动前端：`cd ../frontend && npm run dev`

> 前端通过 `VITE_USE_MOCK` 开关在 Mock 数据与真实后端间切换，业务代码无需改动。

## 设计说明

- **统一响应结构**：与前端 `ApiResponse<T>` 契约一致，前端响应拦截器据此判断成功/失败。
- **JWT 鉴权**：`authRequired`（必须登录）/ `authOptional`（软鉴权，有 token 则注入用户上下文）。订单流程采用软鉴权，允许游客下单，登录用户的订单归属其账户。
- **事务**：创建订单时在单个事务内插入订单、订单项并扣减库存，保证一致性。
- **类型共享**：`src/types/index.ts` 与 `frontend/src/types/index.ts` 保持一致契约。
