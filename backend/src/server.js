import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { connectDB } from './libs/db.js'
import authRoute from './routes/authRoute.js'
import userRoute from './routes/userRoute.js'
import { protectedRoute } from './middlewares/authMiddeware.js'

dotenv.config()

// Khởi tạo server
const app = express()
const PORT = process.env.PORT || 5001

// middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
)
app.use(express.json())
app.use(cookieParser()) // phải có thư viện này để có thể đọc cookie từ req

// public routes
app.use('/api/auth', authRoute)

// private routes
app.use(protectedRoute) // có thể sử dụng middleware ở server thay vì gán vào từng cái route
app.use('/api/users', userRoute)

connectDB().then(() => {
  app.listen(PORT, () => {
    {
      console.log(`Server đang chạy ở cổng ${PORT}`)
    }
  })
})
