import mongoose from 'mongoose'

const userSchema = mongoose.Schema({
    userName: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: true
    },
    hashedPassword: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    displayName: {
        type: String,
        required: true,
        trim: true
    },
    avatarUrl: {
        type: String // link CDN để hiện thị hình
    },
    avatarId: {
        type: String // Cloudinary public id để xóa hình
    },
    bio: {
        type: String,
        maxlength: 500
    },
    phone: {
        type: String,
        sparse: true
    }
},
{
    timestamps: true
})

const User = mongoose.model('User', userSchema)

export default User