import express from 'express'
import {
  createConversation,
  getConversation,
  getMessages,
  markAsSeen,
} from '../controllers/conversationController.js'
import { checkFriendShip } from '../middlewares/friendMiddleware.js'

const route = express.Router()

route.post('/', checkFriendShip, createConversation)
route.get('/', getConversation)
route.get('/:conversationId/messages', getMessages)
route.patch('/:conversationId/seen', markAsSeen)

export default route
