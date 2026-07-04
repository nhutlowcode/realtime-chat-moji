import mongoose, { modelNames } from 'mongoose'

const sessionSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    refreshToken: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamp: true, // thêm thuộc tính này để monogo tự thêm createdAt và updatedAt
  },
)

// tự động xóa khi hết hạn
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model('Session', sessionSchema)
