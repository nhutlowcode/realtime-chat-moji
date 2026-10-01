import { friendService } from '@/services/friendService.js'
import type { FriendState } from '@/types/store'
import { create } from 'zustand'

export const useFriendStore = create<FriendState>((set, get) => ({
  loading: false,

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
      const resultMessage = await friendService.sendDirectRequest(
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
}))
