import express from "express";
import {authMe} from "../controllers/userController.js";
import {protectedRoute} from "../middlewares/authMiddleware.js";
const router = express.Router();
router.get('/me', authMe);
export default router;