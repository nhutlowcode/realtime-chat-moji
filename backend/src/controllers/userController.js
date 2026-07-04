 export const authMe = async (req, res) => {
    try {
        const user = req.user // ra từ middleware

        res.status(200).json({ user })
    } catch (error) {
        console.log('Lỗi khi gọi authMe: ', error)
        return res.status(500).json({ message: 'lỗi hệ thống' })
    }
}