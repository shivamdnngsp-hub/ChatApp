import { redis } from "../config/redis.js";
import { generateAccessToken, generateRefreshToken } from "../config/token.js";
import Chat from "../models/chat.js";
import Message from "../models/messages.js";
import User from "../models/user.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signup = async (req, res, next) => {

    try {
        const { userName, password } = req.body

        const userExist = await User.findOne({ userName })

        if (userExist) {
            return res.status(400).json({ message: "User Name alredy exist " })
        }


        if (!userName || userName.trim().length < 3) {
            return res.status(400).json({ message: "userName must be of atleast 3 charcters " })
        }

        if (!password || password.length < 5) {
            return res.status(400).json({ message: "Password must be at least 5 characters" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await User.create({
            userName,
            password: hashedPassword
        })

        const aiUser = await User.findOne({ isAI: true });
        if (aiUser) {
            const chat = await Chat.create({
                participants: [newUser._id, aiUser._id]
            });
            const welcomeMessage = await Message.create({
                sender: aiUser._id,
                chat: chat._id,
                content: "Hello! I'm Chatly AI 🤖. Ask me anything."
            });
            chat.lastMessage = welcomeMessage._id;
            await chat.save();
        }

        const accessToken = generateAccessToken({ userId: newUser._id })
        const refreshToken = generateRefreshToken({ userId: newUser._id })


        await redis.set(
            `access:${newUser._id}`,
            accessToken,
            "EX",
            15 * 60
        );

        await redis.set(
            `refresh:${newUser._id}`,
            refreshToken,
            "EX",
            7 * 24 * 60 * 60
        );


        await redis.set(
            `session:${newUser._id}`,
            "active",
            "EX",
            7 * 24 * 60 * 60
        );

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",

            maxAge: 15 * 60 * 1000
        })

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",

            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(201).json({
            success: true,
            message: "Signup successful",
            user: {
                userName: newUser.userName,
                id: newUser._id
            }
        });

    } catch (error) {
        res.status(500).json({ message: "server error in signup" })
    }
}

export const login = async (req, res, next) => {

    try {

        const { userName, password } = req.body;

        const user = await User.findOne({ userName })
        if (!user) {
            return res.status(400).json({ message: "User name not found" })
        }
        if (!password) {
            return res.status(400).json({ message: "Password required" });
        }

        const existingSession = await redis.get(`session:${user._id}`);

        if (existingSession) {
            await redis.del(`access:${user._id}`);
            await redis.del(`refresh:${user._id}`);
            await redis.del(`session:${user._id}`);
        }



        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect Password" })
        }

        const accessToken = generateAccessToken({ userId: user._id })
        const refreshToken = generateRefreshToken({ userId: user._id })

        await redis.set(
            `access:${user._id}`,
            accessToken,
            "EX",
            15 * 60
        );

        await redis.set(
            `refresh:${user._id}`,
            refreshToken,
            "EX",
            7 * 24 * 60 * 60
        );

        await redis.set(
            `session:${user._id}`,
            "active",
            "EX",
            7 * 24 * 60 * 60
        );



        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 15 * 60 * 1000
        })

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json({
            message: "Login successfull",
            success: true,
            user: {
                userName: user.userName,
                id: user._id
            }
        }
        )

    } catch (error) {
        return res.status(500).json({ message: "serevr error in login" })
    }
}




export const logout = async (req, res, next) => {

    try {

        const userId = req.userId;


        await redis.del(`access:${userId}`);
        await redis.del(`refresh:${userId}`);
        await redis.del(`session:${userId}`);


        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 15 * 60 * 1000
        })
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json({ message: "Logged out", success: true })


    } catch (error) {
        return res.status(500).json({ message: "server error in logout" })
    }

}

export const RefreshToken = async (req, res, next) => {

    try {

        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token found" });
        }


        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_SECRET
        );

        const userId = decoded.userId;

        const savedRefreshToken = await redis.get(`refresh:${userId}`);

        if (!savedRefreshToken || savedRefreshToken !== refreshToken) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }

        const newAccessToken = generateAccessToken({ userId });

        await redis.set(
            `access:${userId}`,
            newAccessToken,
            "EX",
            15 * 60
        );


        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 15 * 60 * 1000
        });

        return res.status(200).json({
            message: "Access token refreshed successfully"
        });

    } catch (error) {
        return res.status(401).json({ message: "Refresh token expired or invalid" });
    }
};