import tokenBlacklistModel from "../models/blackList.model.js";
import userModel from "../models/user.models.js";
import jwt from "jsonwebtoken";



export async function authMiddleware(req,res,next){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if(!token){
        return res.status(401).json({
            message: "Unauthorized: No token provided",
            status: "failed"
        })
    }
     const isBlacklisted =  await tokenBlacklistModel.findOne({
     token
    })
    if(isBlacklisted){
        return res.staus(401).json({
            message: 'Unauthorized token, acces token is invalid'
        })
    }
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.userID).select("-password");
        req.user = user;
        return next();
    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized: Invalid token",
            status: "failed"
        })
    }
}
export async function authSystemUserMiddleware(req,res,next){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if(!token){
        return res.status(401).json({
            message: "Unauthorized: No token provided",
            status: "failed"
        })
    }
     const isBlacklisted =  await tokenBlacklistModel.findOne({
     token
    })
    if(isBlacklisted){
        return res.staus(401).json({
            message: 'Unauthorized token, acces token is invalid'
        })
    }
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.userID).select("+systemUser");
        if(!user.systemUser){
            return res.status(403).json({
                message: "Forbidden: Access is denied",
                status: "failed"
            })
        }
        req.user = user;
        return next();

    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized: Invalid token",
            status: "failed"
        })
        
    }
}