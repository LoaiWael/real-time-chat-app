import express from 'express'
import { protectedRoute } from '../middleware/auth.middleware.js'
import { upload } from "../middleware/upload.middleware.js"
import { getUsersForSidebar, getConversationsForSidebar, getMessages, sendMessage } from '../controllers/message.controller.js'

const router = express.Router();

router.use(protectedRoute);

router.get("/users", getUsersForSidebar)
router.get("/conversations", getConversationsForSidebar)
router.get("/:id", getMessages)
router.post("/:id", upload.single("media"), sendMessage)

export default router