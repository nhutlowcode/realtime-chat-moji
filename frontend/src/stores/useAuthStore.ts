import { create } from 'zustand'
import { toast } from 'sonner'
import { authService } from '@/services/authService'
import type { AuthState } from '@/types/store'
import { persist } from 'zustand/middleware'
import { useChatStore } from './useChatStore'

// AuthState là type mà mình đã định nghĩa ở (store.ts) để ràng buộc kiểu, các biến hay làm được viết trong store này
// đều phải đúng type đã được định nghĩa, nếu không sẽ bị lỗi
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      loading: false,

      clearState: () => {
        set({ accessToken: null, user: null, loading: false })
        useChatStore.getState().reset()
        localStorage.clear()
        sessionStorage.clear()
      },

      setAccessToken: (accessToken) => {
        set({ accessToken })
      },
      setUser: (user) => {
        set({ user })
      },

      signUp: async (username, password, email, firstName, lastName) => {
        try {
          set({ loading: true })
          // gọi api
          await authService.signUp(
            username,
            password,
            email,
            firstName,
            lastName,
          )
          toast.success(
            'Đăng ký thành công, Bạn sẽ được chuyển đến trang đăng nhập.',
          )
        } catch (error) {
          console.error('Lỗi ở signup', error)
          toast.error('Đăng ký không thành công!')
        } finally {
          set({ loading: false })
        }
      },

      signIn: async (username, password) => {
        try {
          get().clearState()
          set({ loading: true })
          useChatStore.getState().reset()
          const { accessToken } = await authService.signIn(username, password)
          // lưu accessToken vào store sau khi đăng nhập thành công
          get().setAccessToken(accessToken)
          useChatStore.getState().fetchConversations()

          // lấy thông tin người dùng và lưu vào store
          await get().fetchMe()
          toast.success('Chào mừng bạn đã trở lại với Moji.')
        } catch (error) {
          console.error(error)
          toast.error('Đăng nhập không thành công.')
        } finally {
          set({ loading: false })
        }
      },

      signOut: async () => {
        try {
          get().clearState()
          await authService.signOut()
          toast.success('Đăng xuất thành công.')
        } catch (error) {
          console.error(error)
          console.log('Có lỗi khi đăng xuất hãy thử lại.')
        }
      },

      fetchMe: async () => {
        try {
          set({ loading: true })
          const user = await authService.fetchMe()
          set({ user })
        } catch (error) {
          console.error('Lỗi khi gọi fetchMe ở useAuthStore: ', error)
          set({ user: null, accessToken: null })
          toast.error('Lỗi xảy ra khi lấy dữ liệu người dùng.')
        } finally {
          set({ loading: false })
        }
      },

      refresh: async () => {
        try {
          set({ loading: true })
          const { user, fetchMe, setAccessToken } = get()
          const accessToken = await authService.refresh()
          setAccessToken(accessToken)
          if (!user) {
            await fetchMe()
          }
        } catch (error) {
          console.error('refresh failed', error)
          toast.error('Phiên đăng nhập hết hạn vui lòng đăng nhập lại.')
          get().clearState()
        } finally {
          set({ loading: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    },
  ),
)
