import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protectedRoute = async (req, res, next) => {
    try {
        // lấy token từ header
        const authHeader = req.headers['authorization']
        // console.log('authHeader: ', authHeader)
        const token = authHeader && authHeader.split(' ')[1] // Bearer <token>

        if (!token) {
            return res.status(401).json({ message: 'Không tìm thấy access token'})
        }
        // xác nhận token hợp lệ
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedUser) => {
            if (err) {
                console.log(err)
                return res.status(403).json({ message: 'Access token hết hạn hoặc không đúng' })
            }
            // tìm user
            const user = await User.findById(decodedUser.userId).select('-hashedPassword') // tìm userID và trừ field hashPassword

            if (!user) {
                return res.status(404).json({ message: 'Người dùng không tồn tại' })
            }

            // trả user vể trong req
            req.user = user
            next()
        })
    } catch (error) {
       console.log('Lỗi khi gọi lấy accesstoken', error)
        return res.status(500).json({ message: 'Lỗi hệ thống!'})
    }
    
}