import { Server } from 'socket.io'
import http from 'http'
import express from 'express'
import { socketAuthMiddleware } from '../middlewares/socketMiddleware.js'
import { getUserConversationsForSocketIO } from '../controllers/conversationController.js'

const app = express() // express app là application dùng để định nghĩa cách server xử lý HTTP request thông qua middleware, route,...
const server = http.createServer(app) // tạo một http server trên môi trường node js, và gắn http request vào để xử lí request
// tạo một server riêng của socket.io và gắn nó vào http server để xử lí và gaio tiếp realtime
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
})

io.use(socketAuthMiddleware) // sử dụng middleware này để kiểm tra user từ socket client gửi xuống

const onlineUsers = new Map() // { userId: socketId}

io.on('connection', async (socket) => {
  const user = socket.user

  console.log(`${user.displayName} đang online với socketId: ${socket.id}`)

  onlineUsers.set(user._id, socket.id) // thêm key là userId và value là socketId

  io.emit('online-users', Array.from(onlineUsers.keys())) // thông báo cho bên FE danh sách user đang onl có trong biến onlineUsers

  const conversationIds = await getUserConversationsForSocketIO(user._id)
  conversationIds.forEach((id) => {
    socket.join(id)
  })

  socket.on('disconnect', () => {
    onlineUsers.delete(user._id) // xóa user nào ngắt kết nối socket
    io.emit('online-users', Array.from(onlineUsers.keys())) // gửi thông báo đến FE danh sách users onl mới nhất
    console.log(`${user.displayName} đã offline với socketId: ${socket.id}`)
  })
})

export { io, app, server }
