import api from '@/lib/axios'

export const authService = {
  signUp: async (
    userName: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string,
  ) => {
    const res = await api.post(
      '/auth/signup',
      {
        userName,
        password,
        email,
        firstName,
        lastName,
      },
      { withCredentials: true },
    )
    return res.data
  },

  signIn: async (userName: string, password: string) => {
    try {
      const res = await api.post(
        '/auth/signin',
        {
          userName,
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
      const res = await api.get('/users/me', { withCredentials: true })
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
