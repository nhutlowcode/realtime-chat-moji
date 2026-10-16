import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { connectDB } from './libs/db.js'
import authRoute from './routes/authRoute.js'
import userRoute from './routes/userRoute.js'
import friendRoute from './routes/friendRoute.js'
import MessageRoute from '../src/routes/messageRoute.js'
import ConversationRoute from '../src/routes/conversationRoute.js'
import { protectedRoute } from './middlewares/authMiddeware.js'
import { app, server } from './/socket/index.js'
import { v2 as cloudinary } from 'cloudinary'

dotenv.config()

// Khởi tạo server
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

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
})

// public routes
app.use('/api/auth', authRoute)

// private routes
app.use(protectedRoute) // có thể sử dụng middleware ở server thay vì gán vào từng cái route
app.use('/api/users', userRoute)
app.use('/api/friends', friendRoute)
app.use('/api/messages', MessageRoute)
app.use('/api/conversations', ConversationRoute)

ConversationRoute
connectDB().then(() => {
  // server này đã được cấu hình socket.io
  server.listen(PORT, () => {
    {
      console.log(`Server đang chạy ở cổng ${PORT}`)
    }
  })
})
