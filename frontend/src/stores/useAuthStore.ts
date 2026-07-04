import { create } from 'zustand'
import { toast } from 'sonner'
import { authService } from '@/services/authService'
import type { AuthState } from '@/types/store'

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  loading: false,

  clearState: () => {
    set({ accessToken: null, user: null, loading: false })
  },

  setAccessToken: (accessToken) => {
    set({ accessToken })
  },

  signUp: async (userName, password, email, firstName, lastName) => {
    try {
      set({ loading: true })
      // gọi api
      await authService.signUp(userName, password, email, firstName, lastName)
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

  signIn: async (userName, password) => {
    try {
      set({ loading: true })
      const { accessToken } = await authService.signIn(userName, password)
      // lưu accessToken vào store
      get().setAccessToken(accessToken)

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
      console.error(error)
      toast.error('Phiên đăng nhập hết hạn vui lòng đăng nhập lại.')
      get().clearState()
    } finally {
      set({ loading: false })
    }
  },
}))
