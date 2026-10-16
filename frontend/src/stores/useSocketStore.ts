import { create } from 'zustand'
import { io, type Socket } from 'socket.io-client'
import { useAuthStore } from './useAuthStore'
import type { SocketState } from '@/types/store'
import { useChatStore } from './useChatStore'

const baseUrl = import.meta.env.VITE_SOCKET_URL

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  onlineUsers: [],

  connectSocket: () => {
    const accessToken = useAuthStore.getState().accessToken // lấy accessToken từ useAuthStore
    const exitingSocket = get().socket // lấy state của socket

    if (exitingSocket) return // tránh tạo nhiều socket

    // tạo một kết nối đến BE
    const socket: Socket = io(baseUrl, {
      auth: { token: accessToken },
      transports: ['websocket'],
    })

    set({ socket })
    // lắng nghe sự kiện connect nếu kết nối thành công
    socket.on('connect', () => {
      console.log('Đã kết nối với socket.')
    })

    // online users
    socket.on('online-users', (userIds) => {
      set({ onlineUsers: userIds })
    })
    // new message
    socket.on('new-message', ({ message, conversation, unreadCounts }) => {
      useChatStore.getState().addMessage(message)

      const lastMessage = {
        _id: conversation.lastMessage._id,
        content: conversation.lastMessage.content,
        createdAt: conversation.lastMessage.createdAt,
        sender: {
          _id: conversation.lastMessage.senderId,
          displayName: '',
          avatarUrl: null,
        },
      }

      const updatedConversation = {
        ...conversation,
        lastMessage,
        unreadCounts,
      }

      if (useChatStore.getState().activeConversationId === message._id) {
        // đánh dấu đã đọc
        useChatStore.getState().markAsSeen()
      }

      useChatStore.getState().updateConversation(updatedConversation)
    })

    // read mesage
    socket.on('read-message', ({ conversation, lastMessage }) => {
      // console.log('conversations useSocketStore: ', conversation)
      const updated = {
        _id: conversation._id,
        lastMessage,
        lastMessageAt: conversation.lastMessageAt,
        unreadCounts: conversation.unreadCounts,
        seenBy: conversation.seenBy,
      }

      useChatStore.getState().updateConversation(updated)
    })

    // new group chat
    socket.on('new-group', (conversation) => {
      useChatStore.getState().addConvo(conversation)
      socket.emit('join-conversation', conversation._id)
    })
  },

  disconnectSocket: () => {
    const socket = get().socket
    if (socket) {
      socket.disconnect()
      set({ socket: null })
    }
  },
}))
