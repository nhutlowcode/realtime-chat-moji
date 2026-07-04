import { useAuthStore } from '@/stores/useAuthStore'
import axios from 'axios'

const api = axios.create({
  baseURL:
    import.meta.env.MODE === 'development'
      ? 'http://localhost:5001/api'
      : '/api',
  withCredentials: true, // phải có này để cookie có thể gửi lên server
})

// gắn access token vào req header
api.interceptors.request.use((config) => {
  // cú pháp này chỉ lấy accesstoken tại thời điểm code này chạy, sau đó accesstoken có cập nhật thì giá trị của accesstoken hiện tại vẫn giữ nguyên
  const { accessToken } = useAuthStore.getState()

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config

    if (
      originalRequest.url.includes('/auth/signin') ||
      originalRequest.url.includes('/auth/signup') ||
      originalRequest.url.includes('/auth/refresh')
    ) {
      return Promise.reject()
    }

    originalRequest._retryCount = originalRequest._retryCount || 0
    if (error.response?.status === 403 && originalRequest._retryCount < 4) {
      originalRequest._retryCount += 1
      console.log('refresh time: ', originalRequest._retryCount)
      try {
        const res = await api.post('/auth/refresh')
        const newAccessToken = res.data.accessToken
        useAuthStore.getState().setAccessToken(newAccessToken)

        // gắn accesstoken mới vào header của request cữ
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        return api(originalRequest)
      } catch (refreshError) {
        useAuthStore.getState().clearState()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)
export default api
