import Friend from '../models/Friend.js'
import User from '../models/User.js'
import FriendRequest from '../models/FriendRequest.js'

export const sendFriendRequest = async (req, res) => {
  try {
    // lấy người nhận và message từ FE
    const { to, message } = req.body
    // lấy id của người gửi
    const from = req.user._id
    // kiểm tra có phải gửi cho chính mình hay không
    if (from === to) {
      return res.status(500).json({
        message: 'Không thể gửi yêu cầu kết bạn cho chính mình.',
      })
    }
    // check xem người nhận có tồn tại hay không
    const userExisted = await User.exists({ _id: to })

    if (!userExisted) {
      return res.status(404).json({ message: 'Người nhận không tồn tại.' })
    }
    // kiểm tra xem giữa 2 người đã có mối quan hệ nào chưa
    let userA = from.toString()
    let userB = to.toString()

    // so sánh và sử dụng Destructuring Assignment để gán lại giá trị
    if (userA > userB) {
      ;[userA, userB] = [userB, userA]
    }

    // khai báo 2 biến và sử dụng promise.all() để chạy song song logic
    const [alreadyFriend, existingRequest] = await Promise.all([
      Friend.findOne({ userA, userB }),
      FriendRequest.findOne({
        $or: [
          { from, to },
          { from: to, to: from },
        ],
      }),
    ])

    if (alreadyFriend) {
      return res.status(400).json({ message: 'Hai người đã là bạn bè.' })
    }

    if (existingRequest) {
      return res.status(400).json({ message: 'Lời mời đã được gửi rồi.' })
    }

    // nếu mọi thứ ổn thì tiến hành tạo request
    const request = await FriendRequest.create({
      from,
      to,
      message,
    })

    res.status(201).json({
      message: 'Gửi lời mời thành công.',
      request,
    })
  } catch (error) {
    console.error('Lỗi khi gửi lời mời kết bạn ', error)
    res.status(500).json({ message: 'Lỗi hệ thống.' })
  }
}

export const acceptFriendRequest = async (req, res) => {
  try {
    // lấy request id ra từ params
    const { requestId } = req.params
    // lấy userId của user đang đăng nhập
    const userId = req.user._id
    // console.log('userId: ', userId)
    // kiểm tra lời mời có tồn tại hay không
    const request = await FriendRequest.findById(requestId)
    // kiểm tra có lời mời hay không
    if (!request) {
      return res.status(404).json({ message: 'Không tìm thấy lời mời này.' })
    }
    // console.log('request: ', request)
    // check chỉ người nhận lời mời mới được quyền đồng ý
    if (request.to.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: 'Bạn không có quyền chấp nhận lời mởi này.' })
    }
    // tiền hành tạo quan hệ bạn bè mới
    const friend = await Friend.create({
      userA: request.from,
      userB: request.to,
    })
    // sau khi tạo xong lời mời thì xóa cái lời mời trước đó đi
    await FriendRequest.findByIdAndDelete(requestId)

    const from = await User.findById(request.from)
      .select('_id displayName avatarUrl')
      .lean()

    res.status(201).json({
      message: 'Cháp nhận lời mời kết bạn thành công.',
      newFriend: {
        _id: from?._id,
        displayName: from?.displayName,
        avatarUrl: from?.avatarUrl,
      },
    })
  } catch (error) {
    console.error('Lỗi khi chấp nhận lời mời kết bạn ', error)
    res.status(500).json({ message: 'Lỗi hệ thống.' })
  }
}

export const declineFriendRequest = async (req, res) => {
  try {
    // lấy requestId từ params
    const { requestId } = req.params
    // lấy userId của user đang đăng nhập
    const userId = req.user._id
    // kiểm tra xem lời mời có tồn tại hay không
    const request = await FriendRequest.findById(requestId)

    // kiểm tra lời mời có tồn tại hay không
    if (!request) {
      return res.satus(404).json({ message: 'Lời mời không tồn tại.' })
    }
    // kiểm tra để đảm bảo chỉ có người nhận mới có quyển từ chối
    if (request.to.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: 'Bạn không có quyển từ chối lời mời này.' })
    }
    // tiến hành xóa lời mời
    await FriendRequest.findByIdAndDelete(requestId)

    res.status(200).json({ message: 'Từ chối lời mời thành công.' })
  } catch (error) {
    console.error('Lỗi khi từ chối lời mời kết bạn ', error)
    res.status(500).json({ message: 'Lỗi hệ thống.' })
  }
}

export const getAllFriends = async (req, res) => {
  try {
    // Lấy id của người dùng đang đăng nhập
    // req.user được middleware auth gắn vào sau khi xác thực JWT
    const userId = req.user._id

    // Tìm tất cả bản ghi Friend mà người dùng này xuất hiện
    // ở userA hoặc userB
    const friendShips = await Friend.find({
      $or: [
        {
          userA: userId,
        },
        {
          userB: userId,
        },
      ],
    })

      // Thay ObjectId của userA bằng document User thật
      // Chỉ lấy các field cần thiết
      .populate('userA', '_id displayName avatarUrl')

      // Làm tương tự với userB
      .populate('userB', '_id displayName avatarUrl')

      // Chuyển document Mongoose thành object JavaScript thuần
      // để truy cập nhanh hơn và giảm overhead
      .lean()

    // Nếu chưa có bạn bè nào
    if (!friendShips.length) {
      return res.status(200).json({ friendShips: [] })
    }

    // Mỗi friendship luôn có 2 người:
    // userA và userB
    //
    // Nếu userA chính là mình
    // => bạn bè là userB
    //
    // Ngược lại
    // => bạn bè là userA
    const friends = friendShips.map((f) =>
      f.userA._id.toString() === userId.toString() ? f.userB : f.userA,
    )

    // Trả về danh sách bạn bè
    res.status(200).json({ friends })
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bạn bè', error)

    res.status(500).json({
      message: 'Lỗi hệ thống.',
    })
  }
}

export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id
    const populateFields = ' _id displayName avatarUrl'
    const [sent, received] = await Promise.all([
      FriendRequest.find({ from: userId }).populate('to', populateFields), // poluplate là thêm nhưng field thông tin của bảng mà field đang truy vấn reference đến, ở đây là field 'to' ref đến bảng User được định nghĩa trong schema
      FriendRequest.find({ to: userId }).populate('from', populateFields),
    ])

    res.status(200).json({ sent, received })
  } catch (error) {
    console.error('Lỗi khi lấy danh sách lời mời kết bạn ', error)
    res.status(500).json({ message: 'Lỗi hệ thống.' })
  }
}
