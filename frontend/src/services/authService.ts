import api from '@/lib/axios'
import axios from 'axios'

export const authService = {
  signUp: async (
    username: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string,
  ) => {
    const res = await axios.post(
      '/auth/signup',
      {
        username,
        password,
        email,
        firstName,
        lastName,
      },
      { withCredentials: true },
    )
    return res.data
  },

  signIn: async (username: string, password: string) => {
    try {
      console.log(
        `ở authservice username: ${username} và password: ${password}`,
      )
      const res = await axios.post(
        'http://localhost:5001/api/auth/signin',
        {
          username,
          password,
        },
        {
          withCredentials: true,
        },
      )

      return res.data
    } catch (error) {
      console.error('Lỗi ở signin: ', error)
    }
  },

  signOut: async () => {
    return await api.post('/auth/signout', {}, { withCredentials: true })
  },

  fetchMe: async () => {
    try {
      const res = await api.get('/users/me')
      return res.data.user
    } catch (error) {
      console.error('Lỗi khi gọi fetchMe: ', error)
    }
  },

  refresh: async () => {
    const res = await api.post('/auth/refresh')
    return res.data.accessToken
  },
}
