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

## 技术选型说明

后端采用推荐方案 **Node.js + Express + TypeScript**，与前端统一 TS 生态，便于共享类型定义、AI 辅助生成代码。方案对比与选型详见 [开发计划](./.trae/documents/shopping_website_plan.md)。
