import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectedRoute = async (req, res, next) => {
    try {
     // lấy token từ header
     const  authHeader = req.headers.authorization;
     if (!authHeader) {
         return res.status(401).json({error: "No token provided"});
     }
     const token = authHeader.split(' ')[1];
     if (!token) {
         return res.status(401).json({error: "No token provided"});
     }
     // xác nhận token hợp lệ
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(401).json({message: "Access token không hợp lệ hoặc đã hết hạn"});
            }
            // tìm user
            const user = await User.findById(decoded.userId).select("-hashedPassword");
            if (!user) {
                return res.status(401).json({message: "User không tồn tại"});
            }
            // trả user về cho req
            req.user = user;
            next();
        })

    } catch (err) {
        console.error('Lỗi khi gọi protectedRoute', err);
        res.status(500).json({message: 'Lỗi hệ thống'});
    }
}