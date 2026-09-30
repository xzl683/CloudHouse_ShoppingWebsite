# 购物网站（Vue 3 + TypeScript）开发计划

## 一、需求分析与技术选型

### 1.1 项目目标
开发一个完整的购物网站，包含：前端页面、后端服务、商品数据、基础购物流程。鼓励加入 AI 客服/购物 Agent 功能。

### 1.2 核心用户流程
进入商城 → 浏览商品 → 搜索/筛选 → 商品详情 → 加入购物车 → 修改购物车 → 提交订单 → 查看订单结果

### 1.3 技术栈
| 层级 | 技术选型 | 说明 |
|------|----------|------|
| 前端框架 | Vue 3 + TypeScript + Vite | Composition API + `<script setup>` |
| UI 组件库 | Element Plus | 成熟组件丰富，中文文档完善 |
| 状态管理 | Pinia | 购物车、用户、商品状态 |
| 路由 | Vue Router 4 | 页面路由 |
| HTTP | Axios | 接口请求封装 |
| 样式 | SCSS + 响应式（flex + 媒体查询） | 50%–250% 缩放适配 |
| 后端 | Node.js + Express + TypeScript | RESTful API |
| 数据库 | SQLite (better-sqlite3) | 轻量、零配置、易部署 |
| AI Agent | Qwen / DeepSeek API + 工具调用 | 特别加分项 |

### 1.4 项目目录结构
```
/workspace
├── frontend/                # Vue 3 + TS 前端
│   ├── src/
│   │   ├── api/             # 接口请求封装
│   │   ├── assets/          # 静态资源（图片、样式）
│   │   ├── components/      # 公共组件
│   │   ├── layouts/         # 布局组件
│   │   ├── router/          # 路由配置
│   │   ├── stores/          # Pinia 状态
│   │   ├── types/           # TS 类型定义
│   │   ├── utils/           # 工具函数
│   │   ├── views/           # 页面组件
│   │   ├── App.vue
│   │   └── main.ts
│   ├── index.html
│   ├── vite.config.ts
│   └── tsconfig.json
├── backend/                 # Express + TS 后端
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── db/              # 数据库连接与初始化
│   │   ├── middleware/      # 中间件（鉴权等）
│   │   ├── models/          # 数据模型
│   │   ├── routes/          # 路由
│   │   ├── services/        # 业务逻辑
│   │   ├── types/           # TS 类型
│   │   └── app.ts
│   ├── data/                # 种子数据（商品 JSON）
│   └── ...
├── README.md
└── .trae/documents/         # 计划文档
```

---

## 二、数据库设计

### 2.1 products 表（商品）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增主键 |
| name | TEXT | 商品名称 |
| price | REAL | 价格 |
| description | TEXT | 商品介绍 |
| category | TEXT | 分类（如 耳机、键盘、鼠标） |
| image_url | TEXT | 商品图片 URL |
| stock | INTEGER | 库存 |
| tags | TEXT | 标签（JSON 数组字符串） |
| created_at | TEXT | 创建时间 |

### 2.2 orders 表（订单）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增主键 |
| order_no | TEXT UNIQUE | 订单编号 |
| items | TEXT | 商品列表（JSON） |
| total_amount | REAL | 订单总价 |
| status | TEXT | 订单状态（pending/paid） |
| created_at | TEXT | 创建时间 |

### 2.3 users 表（用户，加分项）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增主键 |
| username | TEXT UNIQUE | 用户名 |
| password_hash | TEXT | 密码哈希 |
| created_at | TEXT | 创建时间 |

---

## 三、后端 API 设计

| 方法 | 路径 | 说明 | 必需 |
|------|------|------|------|
| GET | /api/products | 商品列表（支持 keyword, category, minPrice, maxPrice, page, pageSize, sort） | ✅ |
| GET | /api/products/:id | 商品详情 | ✅ |
| POST | /api/orders | 创建订单 | ✅ |
| GET | /api/orders/:id | 订单详情 | ✅ |
| GET | /api/orders | 订单列表 | ✅ |
| POST | /api/auth/register | 用户注册 | 加分 |
| POST | /api/auth/login | 用户登录 | 加分 |
| GET | /api/auth/me | 当前用户信息 | 加分 |
| POST | /api/agent/chat | AI Agent 对话 | 特别加分 |

---

## 四、前端页面清单

| 页面 | 路由 | 核心功能 | 必需 |
|------|------|----------|------|
| 首页 | `/` | 导航栏、商品推荐、分类入口、搜索、购物车入口 | ✅ |
| 商品列表 | `/products` | 商品卡片、搜索、筛选、分页 | ✅ |
| 商品详情 | `/products/:id` | 商品信息、加入购物车 | ✅ |
| 订单结果 | `/orders/:id` | 下单成功展示 | ✅ |
| 订单列表 | `/orders` | 查看历史订单 | ✅ |
| 登录 | `/login` | 用户登录 | 加分 |
| 注册 | `/register` | 用户注册 | 加分 |
| AI Agent | 全局聊天窗口 | 自然语言购物助手 | 特别加分 |

侧拉式购物车作为全局组件（非独立页面），由导航栏购物车图标触发。

---

## 五、实现步骤（按依赖顺序）

### 阶段一：项目脚手架与基础配置
1. **初始化前端项目**：使用 Vite 创建 Vue 3 + TS 项目，安装 Element Plus、Pinia、Vue Router、Axios、SCSS
2. **初始化后端项目**：创建 Express + TS 项目结构，安装 express、better-sqlite3、cors、dotenv
3. **配置基础**：前端配置 Vite 路径别名、Element Plus 自动导入、全局样式；后端配置 TS、启动脚本、CORS

### 阶段二：后端核心
4. **数据库设计与初始化**：编写 SQLite 建表脚本，准备 20 条商品种子数据（覆盖耳机、键盘、鼠标、显示器等分类，价格有差异）
5. **商品 API**：实现 GET /api/products（搜索 keyword、分类 category、价格区间 minPrice/maxPrice、分页 page/pageSize、排序 sort）和 GET /api/products/:id
6. **订单 API**：实现 POST /api/orders（含订单号生成、库存校验、金额计算）、GET /api/orders/:id、GET /api/orders
7. **用户 API（加分）**：注册、登录（JWT）、获取当前用户

### 阶段三：前端基础架构
8. **全局配置**：路由表、Pinia stores（cart、user、product）、Axios 实例封装、布局组件（DefaultLayout 含导航栏 + 侧拉购物车）
9. **导航栏组件**：Logo、导航链接、搜索框、购物车图标（悬浮效果 + 商品数量徽标）

### 阶段四：前端业务页面
10. **首页**：Banner、分类入口、推荐商品区、热门商品列表
11. **商品列表页**：商品卡片网格、搜索栏、筛选面板（分类 + 价格区间）、分页
12. **商品详情页**：商品大图轮播、名称、价格、库存、介绍、加入购物车按钮
13. **侧拉购物车**：从右侧滑出，商品列表、数量增减、单项/总金额、清空、去结算
14. **订单流程**：结算（模拟支付）→ 订单结果页（订单号、商品、总价、状态）→ 订单列表页

### 阶段五：响应式与体验优化
15. **响应式适配**：flex 布局 + 媒体查询 + 相对单位（rem/vw），适配手机/平板/电脑，50%–250% 缩放测试

### 阶段六：加分项
16. **用户系统（加分）**：登录/注册页面、Pinia user store、登录状态管理、路由守卫
17. **AI 购物 Agent（特别加分）**：
    - 聊天窗口 UI（流式输出、打字机效果）
    - `searchProducts` 工具调用
    - 多轮上下文理解
    - 写入工具：`addToCart`、`updateCartItem`、`removeFromCart`、`getCart`、`createOrder`（写入前需用户确认）
    - 多步规划与复杂约束处理

### 阶段七：文档与交付
18. **README**：项目介绍、技术栈、运行说明
19. **AI Coding Process**：记录 2–3 个代表性 AI 辅助开发任务
20. **联调验证**：核心流程全链路测试、响应式测试

---

## 六、依赖与注意事项

- 前端运行在 `http://localhost:5173`，后端运行在 `http://localhost:3000`，通过 Vite proxy 或后端 CORS 解决跨域
- 商品图片使用网络公开图片 URL（如 Unsplash），避免本地资源管理复杂度
- 订单号生成规则：`ORD` + 时间戳 + 随机数
- 密码使用 bcrypt 哈希存储（加分项用户系统）
- AI Agent 部分需配置 LLM API Key（通过环境变量 `.env` 注入，不提交到仓库）

---

## 七、验证方式

1. **后端验证**：使用 curl/Postman 测试所有 API 接口返回正确数据
2. **前端验证**：
   - 核心流程：浏览 → 搜索 → 筛选 → 详情 → 加购 → 修改购物车 → 下单 → 查看订单，全流程跑通
   - 购物车：增删改、金额计算、清空均正常
   - 响应式：浏览器开发者工具切换设备（手机/平板/桌面）+ 缩放 50%/100%/250%，布局不错乱
3. **AI Agent 验证**：测试自然语言查商品、多轮追问、加购/下单闭环

---

## 八、风险与处理

| 风险 | 处理方式 |
|------|----------|
| AI Agent API Key 不可用 | Agent 作为加分项，不影响主流程；可先实现 mock 版本 |
| better-sqlite3 原生编译问题 | 准备 JSON 文件存储的 fallback 方案 |
| 商品图片 URL 失效 | 选择稳定的图床或使用 placeholder 图片服务 |
| 响应式在极端缩放下错乱 | 使用 rem + clamp() + 媒体查询组合，优先保证可用性 |
| 前后端联调跨域 | 后端配置 CORS，前端开发环境用 Vite proxy |

---

## 九、加分项优先级建议

1. **必做**：阶段一 ~ 阶段五（核心购物流程）
2. **推荐加分**：阶段六-16（用户系统）+ 阶段六-17 基础层（9.1–9.3：对话 + 搜索工具 + 多轮）
3. **进阶加分**：Agent 进阶层（9.4–9.5：购物闭环 + 多步规划）
4. **高阶加分**：Agent 高阶层（9.6–9.7：鲁棒性 + 流式输出 + 富消息）
5. **挑战加分**：Agent 挑战层（9.8：测试用例 + 评估）
