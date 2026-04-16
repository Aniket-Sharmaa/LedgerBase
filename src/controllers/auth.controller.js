import userModel from "../models/user.models.js";
import jwt from "jsonwebtoken";
import { sendRegisterEmail } from "../services/services.js";
import tokenBlacklistModel from "../models/blackList.model.js";
/* user register controller 
POST /api/auth/register
*/
export async function userRegisterController(req, res) {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({
        message: "Email, name and password are required",
        status: "failed",
      });
    }

    const isEmailExists = await userModel.findOne({ email });

    if (isEmailExists) {
      return res.status(422).json({
        message: "User already exists with this email",
        status: "failed",
      });
    }

    const user = await userModel.create({ email, name, password });


    sendRegisterEmail(user.email, user.name)
      .catch(err => console.error("Registration email failed:", err.message));

    const token = jwt.sign(
      { userID: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      token,
      message: "User registered successfully",
      status: "success",
    });

  } catch (err) {
    console.error("Register controller error:", err.message);
    return res.status(500).json({
      message: "Internal server error",
      status: "failed",
    });
  }
}

/* user login controller 
POST /api/auth/login
*/
export async function userLoginController(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        status: "failed",
      });
    }

    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found with this email",
        status: "failed",
      });
    }

    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({
        message: "Invalid password",
        status: "failed",
      });
    }

    const token = jwt.sign(
      { userID: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      token,
      message: "User logged in successfully",
      status: "success",
    });

  } catch (err) {
    console.error("Login controller error:", err.message);
    return res.status(500).json({
      message: "Internal server error",
      status: "failed",
    });
  }
}
/* user login controller 
POST /api/auth/logout
*/
export async function  userLogoutController(req,res){
       const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        if(!token){
            return res.status(200).json({
                message: 'User logged out sucessfully'
            })
        }
        res.cookie('token', '')
        await tokenBlacklistModel.create({ token });
        res.clearCookie('token')
        return res.status(200).json({
            message: 'User logged out sucessfully'
        })
}