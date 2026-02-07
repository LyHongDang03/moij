import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto"
import Session from "../models/Session.js";

const ACCESS_TOKEN_TTL = "30m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000;
export const singUp = async (req, res) => {
    try {
        const {username, password, email, firstName, lastName} = req.body;
        if(!username || !password || !email || !firstName || !lastName){
            return res.status(400).json({ message: 'Không thể thiếu username, password, email, firstName, lastName' });
        }
        const duplicate = await User.findOne({username});
        if (duplicate) {
            res.status(409).json({message: 'Tài khoản đã tồn tại trong hệ thống'});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            username,
            hashedPassword,
            email,
            displayName: `${firstName} ${lastName}`
        });
        return res.sendStatus(204);
    } catch (err) {
        console.error('Lỗi khi gọi singUp', err);
        res.status(500).json({message: 'Lỗi hệ thống'});
    }
}

export const singIn = async (req, res) => {
    try {
        const {username, password} = req.body;
        if(!username || !password){
            return res.status(400).json({ message: 'Không thể thiếu username, password' });
        }
        const user = await User.findOne({username});
        if(!user){
            return res.status(401).json({message: 'Tài khoản không tồn tại trong hệ thống'});
        }
        const passWordCorrect = await   bcrypt.compare(password, user.hashedPassword);
        if(!passWordCorrect){
            return res.status(401).json({message: 'User hoặc mật khẩu không đúng'});
            }
        // Tạo token access
        const accessToken = jwt.sign(
            {userId: user._id},
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: ACCESS_TOKEN_TTL})
        // Tạo token refresh
        const refreshToken = crypto.randomBytes(64).toString('hex');
        await Session.create({
            userId: user._id,
            refreshToken,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL)
        })
        // Trả ref token cho cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: REFRESH_TOKEN_TTL
        });
        return res.status(200).json({message: 'Đăng nhập thành công', accessToken});
    } catch (err) {
        console.error('Lỗi khi gọi singIn', err);
        res.status(500).json({message: 'Lỗi hệ thống'});
    }
}

export const singOut = async (req, res) => {
    try {
        // lấy ref token từ cookie
        const token = req.cookies?.refreshToken;
        if(token){
            // xóa ref token trong session
           await Session.deleteOne({refreshToken: token});
        }
        // xóa cookie
        res.clearCookie('refreshToken')
        res.status(200).json({message: 'Đăng xuất thành công'});

    } catch (err) {
        console.error('Lỗi khi gọi singOut', err);
        res.status(500).json({message: 'Lỗi hệ thống'});
    }
}