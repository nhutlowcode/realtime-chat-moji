import api from '@/lib/axios'

export const friendService = {
  async searchByUserName(username: string) {
    const res = await api.get(`users/search?username=${username}`)
    return res.data.user
  },

  async sendDirectRequest(to: string, message: string) {
    const res = await api.post(`/friends/request`, { to, message })
    return res.data.message
  },
}
