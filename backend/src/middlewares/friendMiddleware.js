import Friend from '../models/Friend.js'
import Conversation from '../models/Conversation.js'

const pair = (a, b) => (a < b ? [a, b] : [b, a])

export const checkFriendShip = async (req, res, next) => {
  try {
    const me = req.user._id.toString()
    const recipientId = req.body?.recipientId ?? null // ?? là toán tử nullish

    const memberIds = req.body?.memberIds ?? []

    if (!recipientId && memberIds.length === 0) {
      return res
        .status(400)
        .json({ message: 'Cần cung cấp recipientId hoặc memberIds' })
    }

    if (recipientId) {
      const [userA, userB] = pair(me, recipientId)
      const isFriend = await Friend.findOne({ userA, userB })

      if (!isFriend) {
        return res
          .status(403)
          .json({ message: 'Bạn chưa kết bạn với người này.' })
      }

      return next()
    }

    // todo: chat nhóm
    const friendChecks = memberIds.map(async (memberId) => {
      const [userA, userB] = pair(me, memberId)
      const friend = await Friend.findOne({ userA, userB })
      return friend ? null : memberId
    })

    const result = await Promise.all(friendChecks)
    const notFriends = result.filter(Boolean)

    if (notFriends.length > 0) {
      return res
        .status(403)
        .json({ message: 'Bạn chỉ có thể thêm bạn bè vào nhóm ', notFriends })
    }
    next()
  } catch (error) {
    console.error('Lỗi khi checkfriendship', error)
    res.status(500).json({ message: 'Lỗi hệ thống.' })
  }
}

export const checkGroupMemberShip = async (req, res, next) => {
  try {
    const { conversationId } = req.body
    const userId = req.user._id

    const conversation = await Conversation.findById(conversationId)

    console.log('conversation from checkGroupMemberShip: ', conversation)

    if (!conversation) {
      return res
        .status(403)
        .json({ message: 'Không tìm thấy cuộc trò chuyện này.' })
    }

    const isMember = conversation.participants.some(
      (p) => p.userId.toString() === userId.toString(),
    )

    // console.log('isMember: ', isMember)
    // console.log('userId: ', userId)

    if (!isMember) {
      return res.status(403).json({ message: 'Bạn không có ở trong nhóm này' })
    }

    req.conversation = conversation
    next()
  } catch (error) {
    console.error('Lỗi xảy ra ở checkGroupMemberShip', error)
    res.status(500).json({ message: 'Lỗi hệ thống' })
  }
}
