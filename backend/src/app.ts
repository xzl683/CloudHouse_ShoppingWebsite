import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { config } from './config'
import productsRouter from './routes/products'
import ordersRouter from './routes/orders'
import authRouter from './routes/auth'
import { notFound, errorHandler } from './middleware/errorHandler'

const app = express()

// 基础中间件
app.use(cors({ origin: config.corsOrigin, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

// 业务路由
app.use('/api/products', productsRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/auth', authRouter)

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({
    code: 200,
    message: 'ok',
    data: {
      service: 'cloudhouse-backend',
      time: new Date().toISOString(),
    },
  })
})

// 兜底 & 错误处理
app.use(notFound)
app.use(errorHandler)

export default app
