import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import { io } from '../socket/index.js'

export const createConversation = async (req, res) => {
  try {
    const { type, name, memberIds } = req.body
    const userId = req.user._id

    // console.log('userId: ', userId)
    // console.log('memberIds: ', memberIds)

    if (
      (type === 'group' && !name) ||
      !memberIds ||
      !Array.isArray(memberIds) ||
      memberIds.length === 0
    ) {
      return res
        .status(400)
        .json({ message: 'Tên nhóm và danh sách thành viên là bắt buộc.' })
    }

    let conversation

    if (type === 'direct') {
      const participantId = memberIds[0]
      conversation = await Conversation.findOne({
        type: 'direct',
        'participants.userId': { $all: [userId, participantId] },
      })

      if (!conversation) {
        conversation = new Conversation({
          type: 'direct',
          participants: [{ userId }, { userId: participantId }],
          lastMessageAt: new Date(),
        })
      }
      await conversation.save()
    }

    if (type === 'group') {
      conversation = new Conversation({
        type: 'group',
        participants: [{ userId }, ...memberIds.map((id) => ({ userId: id }))],
        group: {
          name,
          createdBy: userId,
        },
        lastMessageAt: new Date(),
      })

      await conversation.save()
    }

    if (!conversation) {
      return res.status(400).json({ message: 'Coversation type không hợp lệ.' })
    }

    await conversation.populate([
      { path: 'participants.userId', select: 'displayName avatarUrl' },
      { path: 'seenBy', select: 'displayName avatarUrl' },
      { path: 'lastMessage.senderId', select: 'displayName avatarUrl' },
    ])
    const participants = (conversation.participants || []).map((p) => ({
      _id: p.userId._id,
      displayName: p.userId?.displayName,
      avatarUrl: p.userId?.avatarUrl ?? null,
      joinedAt: p.joinedAt,
    }))

    const formatted = { ...conversation.toObject(), participants }

    if (type === 'group') {
      memberIds.forEach((userId) => {
        // io phải là cùng một instance Socket.IO server
        io.to(userId.toString()).emit('new-group', formatted)
      })
    }

    return res.status(201).json({ conversation: formatted })
  } catch (error) {
    console.error('Lỗi khi tạo conversation', error)
    res.status(500).json({ message: 'Lỗi hệ thống' })
  }
}

export const getConversation = async (req, res) => {
  try {
    const userId = req.user._id
    const conversations = await Conversation.find({
      'participants.userId': userId,
    })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .populate({
        path: 'participants.userId',
        select: 'displayName avatarUrl',
      })
      .populate({
        path: 'lastMessage.senderId',
        select: 'displayName avatarUrl',
      })
      .populate({
        path: 'seenBy',
        select: 'displayName avatarUrl',
      })

    const formatted = conversations.map((convo) => {
      const participants = (convo.participants || []).map((p) => ({
        _id: p.userId._id,
        displayName: p.userId?.displayName,
        avatarUrl: p.userId?.avatarUrl ?? null,
        joinedAt: p.joinedAt,
      }))

      return {
        ...convo.toObject(),
        unreadCounts: convo.unreadCounts || {},
        participants,
      }
    })

    res.status(200).json({ conversations: formatted })
  } catch (error) {
    console.error('Lỗi xảy ra khi lấy conversations', error)
    res.status(500).json({ message: 'Lỗi hệ thống.' })
  }
}

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params
    const { limit = 50, cursor } = req.query

    const query = { conversationId }

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) }
    }

    // message lúc này nhận về 1 mảng các documents
    let messages = await Message.find(query)
      .sort({ createdAt: -1 }) //  5 4 3 2 1
      .limit(Number(limit) + 1)

    // messages sẽ trả về 51 docs để biết còn tin nhắn phía sau, hoặc có thể ít hơn thì thôi
    let nextCursor = null

    if (messages.length > Number(limit)) {
      // lấy phần tử 51 làm nextMessage, phải là 51 vì query messages ra chỉ có 51 phần tử
      const nextMessage = messages[messages.length - 1]
      nextCursor = nextMessage.createdAt.toISOString()

      // bỏ tin nhắn thứ 51 đi
      messages.pop()
    }

    // vì trước đó truy vấn được sắp xếp theo thứ tự giảm dần, nên trc khi return thì phải đảo ngược lại
    messages = messages.reverse()

    return res.status(200).json({ messages, nextCursor })
  } catch (error) {
    console.error('Lỗi xảy ra khi lấy messages', error)
    res.status(500).json({ message: 'Lỗi hệ thống' })
  }
}

export const getUserConversationsForSocketIO = async (userId) => {
  try {
    // tìm Conversations trong mảng participants có ít nhất 1 phần tử có userId bằng với userId truyền vào
    const conversations = await Conversation.find(
      { 'participants.userId': userId },
      { _id: 1 },
    )
    return conversations.map((c) => c._id.toString())
  } catch (error) {
    console.error('Có lỗi khi fetch getUserConversationsForSocketIO ', error)
    return []
  }
}

export const markAsSeen = async (req, res) => {
  try {
    const { conversationId } = req.params
    const userId = req.user._id.toString()

    const conversation = await Conversation.findById(conversationId).lean()

    if (!conversation) {
      return res.status(404).json({ message: 'Không tìm thấy cuộc trò chuyện' })
    }

    const last = conversation.lastMessage
    if (!last) {
      return res
        .status(200)
        .json({ message: 'Không có tin nhắn để mark as seen' })
    }

    if (last.senderId.toString() === userId) {
      return res.status(200).json({ message: 'Sender không cần mark as seen' })
    }

    const updated = await Conversation.findByIdAndUpdate(
      conversationId,
      {
        $addToSet: { seenBy: userId },
        $set: { [`unreadCounts.${userId}`]: 0 },
      },
      { returnDocument: 'after' },
    )

    // console.log('updated conversations controller: ', updated)

    io.to(conversationId).emit('read-message', {
      conversation: updated,
      lastMessage: {
        _id: updated?.lastMessage._id,
        content: updated?.lastMessage.content,
        createdAt: updated?.lastMessage.createdAt,
        senderId: {
          _id: updated?.lastMessage.senderId,
        },
      },
    })

    return res.status(200).json({
      message: 'Mark as seen',
      seenBy: updated?.seenBy || [],
      myUnreadCount: updated?.unreadCounts[userId] || 0,
    })
  } catch (error) {
    console.error('Lỗi khi mark as seen', error)
    return res.status(500).json({ message: 'Lỗi hệ thống' })
  }
}
