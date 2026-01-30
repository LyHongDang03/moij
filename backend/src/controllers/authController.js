import bcrypt from "bcrypt";
import User from "../models/User.js";

export const singUp = async (req, res) => {
    try {
        const {username, password, email, firstName, lastName} = req.body;
        if(!username || !password || !email || !firstName || !lastName || !password){
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