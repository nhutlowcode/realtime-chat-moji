import express from 'express'
import { authMe, searchUserByusername } from '../controllers/userController.js'

const router = express.Router()

router.get('/me', authMe)
router.get('/search', searchUserByusername)

export default router
