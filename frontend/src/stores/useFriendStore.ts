import { friendService } from '@/services/friendService.js'
import type { FriendState } from '@/types/store'
import { create } from 'zustand'

export const useFriendStore = create<FriendState>((set, get) => ({
  friends: [],
  loading: false,
  receivedList: [],
  sentList: [],

  searchByUsername: async (username: string) => {
    try {
      set({ loading: true })
      const user = await friendService.searchByUserName(username)
      return user
    } catch (error) {
      console.error('Có lỗi xảy ra khi tìm user bằng username', error)
      console.log('có lỗi')
      return null
    } finally {
      set({ loading: false })
    }
  },

  addFriend: async (to, message) => {
    try {
      set({ loading: true })
      const resultMessage = await friendService.sendFriendRequest(
        to,
        message || '',
      )
      return resultMessage
    } catch (error) {
      console.error('Lỗi xảy ra khi addFriend', error)
      return 'Lỗi xảy ra khi gửi kết bạn. Hãy thử lại'
    } finally {
      set({ loading: false })
    }
  },

  getAllFriendRequest: async () => {
    try {
      set({ loading: true })
      const result = await friendService.getAllFriendRequest()
      if (!result) return
      const { sent, received } = result
      set({ receivedList: received, sentList: sent })
    } catch (error) {
      console.error('Lỗi xảy ra khi getAllFriendRequest', error)
    } finally {
      set({ loading: false })
    }
  },

  acceptRequest: async (requestId) => {
    try {
      set({ loading: true })
      await friendService.acceptRequest(requestId)
      set((state) => ({
        receivedList: state.receivedList.filter((r) => r._id !== requestId),
      }))
    } catch (error) {
      console.error('Lỗi xảy ra khi acceptRequest', error)
    } finally {
      set({ loading: false })
    }
  },
  declineRequest: async (requestId) => {
    try {
      set({ loading: true })
      await friendService.declineRequest(requestId)
      set((state) => ({
        receivedList: state.receivedList.filter((r) => r._id !== requestId),
      }))
    } catch (error) {
      console.error('Lỗi khi declineRequest', error)
    } finally {
      set({ loading: false })
    }
  },
  getFriends: async () => {
    try {
      const friends = await friendService.getFriendList()
      set({ friends: friends })
    } catch (error) {
      console.error('Lỗi xảy ra kh load friends', error)
      set({ friends: [] })
    } finally {
      set({ loading: false })
    }
  },
}))
