# CloudHouse 云屋商城

一个完整的购物网站项目，当前阶段实现**前端部分**，采用前后端分离架构。

## 项目结构

```
.
├── frontend/          # Vue 3 + TypeScript 前端（已完成）
├── backend/           # 后端（待实现，方案待定）
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

后端暂未实现，前端使用 Mock 数据运行。后端方案对比与推荐详见 [开发计划](./.trae/documents/shopping_website_plan.md)。

推荐方案：**Node.js + Express + TypeScript**，与前端统一 TS 生态。
