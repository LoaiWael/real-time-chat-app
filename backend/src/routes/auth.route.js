import express from 'express';
import { checkAuth } from '../controllers/auth.controller.js';
import { protectedRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// api/auth/check
router.get('/check', protectedRoute, checkAuth);

export default router;