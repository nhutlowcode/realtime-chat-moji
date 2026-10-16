import api from '@/lib/axios'

export const userService = {
  uploadAvatar: async (formData: FormData) => {
    const res = await api.post('/users/uploadAvatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }, // để be biết đang uploda file và multer có thể đọc được
    })

    if (res.status === 400) {
      throw new Error(res.data.message)
    }

    return res.data
  },
}
