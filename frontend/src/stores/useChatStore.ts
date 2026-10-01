import { chatService } from '@/services/chatService'
import type { ChatState } from '@/types/store'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useAuthStore } from './useAuthStore'

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: {},
      activeConversationId: null, // với state này chỉ nắm giữ duy nhất 1 Id cuộc trò chuyện
      convoloading: false,
      messageloading: false,
      // hàm setActiveConversation dùng để set cuộc trò chuyện được chọn thông qua id của cuộc trò chuyện được truyền vào
      setActiveConversation: (id) => set({ activeConversationId: id }),
      // hàm reset dùng để đặt các state trở về ban đầu
      reset: () => {
        set({
          conversations: [],
          messages: {},
          activeConversationId: null,
          convoloading: false,
        })
      },
      // hàm này dùng để lấy các cuộc hội thoại
      fetchConversations: async () => {
        try {
          set({ convoloading: true })
          const { conversations } = await chatService.fetchConversations()
          set({ conversations, convoloading: false })
        } catch (error) {
          console.error('Lỗi xảy ra khi fetchConversations ', error)
          set({ convoloading: false })
        }
      },
      // hàm fetchMessage dùng để lấy tin nhắn của cuộc hội thoại
      fetchMessages: async (conversationId) => {
        set({ messageloading: true })
        const { activeConversationId, messages } = get()
        const { user } = useAuthStore.getState()

        const convoId = conversationId ?? activeConversationId
        if (!convoId) {
          return
        }
        const current = messages?.[convoId]
        const nextCursor =
          current?.nextCursor === undefined ? '' : current?.nextCursor

        if (nextCursor === null) {
          return
        }
        set({ messageloading: true })

        try {
          // destructure: messages được đổi tên thành fetched
          const { messages: fetched, cursor } = await chatService.fetchMessages(
            convoId,
            nextCursor,
          )
          // logic này dùng để phân biệt tin nhắn nào do user đang đăng nhập gửi, để có thể phân biệt và render ra UI phần tin nhắn
          //
          const processed = fetched.map((m) => ({
            ...m,
            isOwn: m.senderId === user?._id,
          }))
          // console.log('processed: ', processed)
          set((state) => {
            const prevMess = state.messages[convoId]?.items ?? []
            const merged =
              prevMess.length > 0 ? [...processed, ...prevMess] : processed
            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  items: merged,
                  hasMore: !!cursor, // flat để xem có còn load được tin nhắn nữa hay không
                  nextCursor: cursor ?? null, // con trỏ cho lần fetch kế tiếp
                },
              },
            }
          })
        } catch (error) {
          console.error('lỗi xảy ra khi fetchMessages', error)
        } finally {
          set({ messageloading: false })
        }
      },

      sendDirectMessage: async (recipientId, content, imgUrl) => {
        try {
          const { activeConversationId } = get()
          await chatService.sendDirectMessage(
            recipientId,
            content,
            imgUrl,
            activeConversationId || undefined,
          )
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === activeConversationId ? { ...c, seenBy: [] } : c,
            ),
          }))
        } catch (error) {
          console.error('Lỗi xảy ra ở sendDirectMessage: ', error)
        }
      },
      sendGroupMessage: async (conversationId, content, imgUrl) => {
        try {
          await chatService.sendGroupMessage(conversationId, content, imgUrl)
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === get().activeConversationId ? { ...c, seenBy: [] } : c,
            ),
          }))
        } catch (error) {
          console.error('Lỗi ở sendGroupMessage: ', error)
        }
      },
      addMessage: async (message) => {
        try {
          const user = useAuthStore.getState().user
          const { fetchMessages } = get()
          message.isOwn = message.senderId === user?._id
          const convoId = message.conversationId

          let prevItems = get().messages[convoId]?.items ?? []

          if (prevItems.length === 0) {
            await fetchMessages(message.conversationId)
            prevItems = get().messages[convoId]?.items ?? []
          }

          set((state) => {
            if (prevItems.some((m) => m._id === message._id)) {
              return state
            }

            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  items: [...prevItems, message],
                  hasMore: state.messages[convoId].hasMore,
                  nextCursor: state.messages[convoId].nextCursor ?? undefined,
                },
              },
            }
          })
        } catch (error) {
          console.error('Lỗi xảy ra khi addMessages', error)
        }
      },

      updateConversation: (conversation) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c._id === conversation._id ? { ...c, ...conversation } : c,
          ),
        }))
      },

      markAsSeen: async () => {
        try {
          const { user } = useAuthStore.getState()
          const { activeConversationId, conversations } = get()
          if (!activeConversationId || !user) {
            return
          }

          const convo = conversations.find(
            (c) => c._id === activeConversationId,
          )

          if ((convo?.unreadCounts?.[user._id] ?? 0) === 0) {
            return
          }

          await chatService.markAsSeen(activeConversationId)

          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === activeConversationId && c.lastMessage
                ? {
                    ...c,
                    unreadCount: {
                      [user._id]: 0,
                    },
                  }
                : c,
            ),
          }))
        } catch (error) {
          console.error('Lỗi xảy ra ở mark as seen trong store', error)
        }
      },
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({ conversations: state.conversations }),
    },
  ),
)
