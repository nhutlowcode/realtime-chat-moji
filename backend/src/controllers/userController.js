import { uploadImageFromBuffer } from '../middlewares/uploadMiddleware.js'
import User from '../models/User.js'

export const authMe = async (req, res) => {
  try {
    const user = req.user // lấy ra từ middleware
    res.status(200).json({ user })
  } catch (error) {
    console.log('Lỗi khi gọi authMe: ', error)
    return res.status(500).json({ message: 'lỗi hệ thống' })
  }
}

export const searchUserByusername = async (req, res) => {
  try {
    const { username } = req.query
    if (!username || username.trim() === '') {
      return res.status(400).json({ message: 'Vui lòng nhập username hợp lệ' })
    }
    const user = await User.findOne({ username }).select(
      // select những thông tin cần thiết để trả về
      '_id displayName username avartarUrl',
    )
    return res.status(200).json({ user })
  } catch (error) {
    console.error('Lỗi xảy ra ở searchUserByusername', error)
    return res.status(500).json({ message: 'Lỗi hệ thống' })
  }
}

export const uploadAvatar = async (req, res) => {
  try {
    const file = req.file
    const userId = req.user._id

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const result = await uploadImageFromBuffer(file.buffer)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        avatarUrl: result.secure_url,
        avatarId: req.public_id,
      },
      {
        new: true,
      },
    ).select('avatarUrl')

    if (!updatedUser.avatarUrl) {
      return res.status(400).json({ message: 'Avatar trả vể null' })
    }
    return res.status(200).json({ avatarUrl: updatedUser.avatarUrl })
  } catch (error) {
    console.error('Lỗi xảy ra khi upload avatar', error)
    return res.status(500).json({ message: 'Upload failed' })
  }
}
