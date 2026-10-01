import { Types } from 'mongoose'
import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import {
  emitNewMessage,
  updateConversationAfterCreateMessage,
} from '../utils/messageHelper.js'
import { io } from '../socket/index.js'

export const sendDirectMessage = async (req, res) => {
  try {
    // lấy thông tin từ FE truyền lên
    const { recipientId, content, conversationId } = req.body

    // lấy Id của người gửi từ protectRoutes
    const senderId = req.user._id

    let conversation

    if (!content) {
      return res.status(400).json({ message: 'Thiếu nội dung.' })
    }

    if (conversationId) {
      conversation = await Conversation.findById(conversationId)
    }

    // nếu không tìm thấy cuộc trò chuyên thì tạo mới
    if (!conversation) {
      conversation = await Conversation.create({
        type: 'direct',
        participants: [
          { userId: senderId, joinedAt: new Date() },
          { userId: new Types.ObjectId(recipientId), joinedAt: new Date() },
        ],
        lastMessage: new Date(),
        unreadCounts: new Map(),
      })
    }

    const message = await Message.create({
      conversationId: conversation._id,
      senderId,
      content,
    })

    updateConversationAfterCreateMessage(conversation, message, senderId)

    await conversation.save()

    emitNewMessage(io, conversation, message)

    return res.status(201).json({ message })
  } catch (error) {
    console.error('Lỗi khi gửi tin nhắn trực tiếp', error)
    return res.status(500).json({ message: 'Lỗi khi gửi tin nhắn trực tiếp.' })
  }
}

export const sendGroupMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body
    const senderId = req.user._id
    // bước này là middleware check xem user này có thuộc coversation hay không
    const conversation = req.conversation

    // console.log('conversation from sendGroupMessage: ', conversation)

    if (!content) {
      return res.status(400).json({ message: 'Thiếu nội dung' })
    }

    const message = await Message.create({
      conversationId,
      senderId,
      content,
    })

    // hàm này giúp làm mới lại cuộc trò chuyện, ví dụ tin nhắn mới gửi thì chưa ai xem hết
    updateConversationAfterCreateMessage(conversation, message, senderId)

    await conversation.save()
    emitNewMessage(io, conversation, message)

    return res.status(201).json({ message })
  } catch (error) {
    console.error('Lỗi khi gửi tin nhắn cho nhóm', error)
    res.status(500).json({ message: 'Lỗi khi gửi tin nhắn nhóm.' })
  }
}
