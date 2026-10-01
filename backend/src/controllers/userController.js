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
    if (!username || !username.trim()) {
      return res.status(400).json({ message: 'Vui lòng nhập username hợp lệ' })
    }
    const user = await User.findOne({ username }).select(
      '_id displayName username avartarUrl',
    )
    return res.status(200).json({ user })
  } catch (error) {
    console.error('Lỗi xảy ra ở searchUserByusername', error)
  }
}
