import type { Message } from '@/types/chat'
import type { Conversation } from './chat'
import type { Friend, FriendRequest, User } from './user'
import type { Socket } from 'socket.io-client'

export interface AuthState {
  accessToken: string | null
  user: User | null
  loading: boolean

  clearState: () => void
  setAccessToken: (accessToken: string) => void
  setUser: (user: User) => void

  signUp: (
    username: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string,
  ) => Promise<void>

  signIn: (useName: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  fetchMe: () => Promise<void>
  refresh: () => Promise<void>
}

// =================================================

export interface ThemeState {
  isDark: boolean
  toggleTheme: () => void
  setTheme: (dark: boolean) => void
}

// =================================================

export interface ChatState {
  conversations: Conversation[]
  messages: Record<
    string,
    {
      items: Message[]
      hasMore: boolean // infinite-scroll
      nextCursor?: string | null // phân trang
    }
  >
  activeConversationId: string | null
  convoloading: boolean
  messageloading: boolean
  loading: boolean
  reset: () => void

  setActiveConversation: (id: string | null) => void
  fetchConversations: () => Promise<void>
  fetchMessages: (conversationId?: string) => Promise<void>
  sendDirectMessage: (
    recipientId: string,
    content: string,
    imgUrl?: string,
    conversationId?: string,
  ) => Promise<void>
  sendGroupMessage: (
    conversationId: string,
    content: string,
    imgUrl?: string,
  ) => Promise<void>
  // add message
  addMessage: (message: Message) => Promise<void>

  // update convo
  updateConversation: (conversation: unknown) => void

  // mark as seen
  markAsSeen: () => Promise<void>
  addConvo: (convo: Conversation) => void
  createConversation: (
    type: 'direct' | 'group',
    name: string,
    memberIds: string[],
  ) => Promise<void>
}

// ===================================================

export interface SocketState {
  socket: Socket | null
  onlineUsers: string[]
  connectSocket: () => void
  disconnectSocket: () => void
}

//====================================================

export interface FriendState {
  friends: Friend[]
  loading: boolean
  receivedList: FriendRequest[]
  sentList: FriendRequest[]
  searchByUsername: (username: string) => Promise<User | null>
  addFriend: (to: string, message?: string) => Promise<string>
  getAllFriendRequest: () => Promise<void>
  acceptRequest: (requestId: string) => Promise<void>
  declineRequest: (requestId: string) => Promise<void>
  getFriends: () => Promise<void>
}

// =====================================================

export interface UserState {
  updateAvatarUrl: (formData: FormData) => Promise<void>
}
