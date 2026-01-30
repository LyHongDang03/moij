import express from 'express';
import {singUp} from "../controllers/authController.js";
const router = express.Router();
router.post('/singup', singUp)
export default router;