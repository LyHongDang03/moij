import express from 'express';
import {singIn, singOut, singUp} from "../controllers/authController.js";

const router = express.Router();
router.post('/singup', singUp)
router.post('/singin', singIn)
router.post('/singout', singOut)
export default router;