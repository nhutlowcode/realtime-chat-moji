import User from '../models/User.js'
import Session from '../models/Session.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { ref } from 'process'

const ACCESS_TOKEN_TTL = '30m'
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000 // tính theo mili giây

export const signUp = async (req, res) => {
  try {
    const { userName, password, email, firstName, lastName } = req.body

    if (!userName || !password || !email || !firstName || !lastName) {
      return res.status(400).json({
        message:
          'Không được thiếu userName, password, email, firstName và lastName!',
      })
    }

    // Kiểm tra xem userName đã tồn tại hay chưa
    const duplicate = await User.findOne({ userName })
    if (duplicate) {
      return res.status(409).json({ message: 'userName đã tồn tại!' })
    }

    // mã hóa password
    const hashedPassword = await bcrypt.hash(password, 10) // salt = 10

    // Tạo user mới
    await User.create({
      userName,
      hashedPassword,
      displayName: `${firstName} ${lastName}`,
      email,
    })

    // return
    return res.sendStatus(204) // 204 là thành công những không gửi kèm theo dữ liệu gì hết
  } catch (error) {
    console.log('Lỗi khi gọi signup', error)
    return res.status(500).json({ message: 'Lỗi hệ thống!' })
  }
}

export const signIn = async (req, res) => {
  try {
    // lấy input từ UI
    const { userName, password } = req.body

    // tìm xem user này có trong db hay không
    const user = await User.findOne({ userName })

    if (!user) {
      return res.status(401).json({ message: 'Thiếu userName hoặc password' })
    }

    // kiểm tra passworrd có khớp hay không
    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword)
    if (!passwordCorrect) {
      return res
        .status(401)
        .json({ message: 'userName hoặc password không chính xác!' })
    }

    // nếu khớp, tạo access token với jwt
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    )

    // tạo refresh token
    const refreshToken = crypto.randomBytes(64).toString('hex')

    // tạo session mới để lưu access token
    await Session.create({
      userId: user._id,
      refreshToken: refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    })

    // trẩ refreshToken về trong cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none', // BE và FE deploy riêng
      maxAge: REFRESH_TOKEN_TTL,
    })

    // trả accessToken về trong res
    res.status(200).json({
      message: `User ${user.displayName} đã logged in`,
      accessToken,
    })
  } catch (error) {
    console.log('Lỗi khi gọi signIn', error)
    return res.status(500).json({ message: 'Lỗi hệ thống!' })
  }
}

export const signOut = async (req, res) => {
  try {
    // lấy refreshToken từ cookie
    const token = req.cookies?.refreshToken // dòng này hoạt động được là nhờ cookie parser"
    if (token) {
      // xóa refresh Token trong Session
      await Session.deleteOne({ refreshToken: token })
      // xóa cookie
      res.clearCookie('refreshToken')
    }

    res.sendStatus(204)
  } catch (error) {
    console.log('Lỗi khi gọi signOut', error)
    return res.status(500).json({ message: 'Lỗi hệ thống!' })
  }
}
