import User from "../models/userSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
export const loginUser = async (req, res) => {
  let { password, email } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Please provide your email and password to login",
    });
  }

  try {
    console.log("Body received:", req.body);

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(400).json({
        message: "oops! User not found 🚫, please sign up first to continue",
      });
    }

    // compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid Credentials!❌" });
    }

    // create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30m" },
    );
    // send token in HTTP-only cookie
    return res
      .cookie("token", token, { httpOnly: true, sameSite: "strict" })
      .status(200)
      .json({
        message: `Login Successful✅, welcome ${user.username}`,
        role: user.role,
      });
  } catch (error) {
    res.status(500).json({
      message: "oops!, something broke, don't worry, we're working on it🔧",
      error: error.message,
    });
  }
};
export const logoutUser = async (req, res) => {
  const user = req.user;
  try {
    if (!req.cookies.token) {
      return res.status(404).json({ message: "You are not logged in! 🚫" });
    }

    res.clearCookie("token", { httpOnly: true, sameSite: "strict" });

    res.status(200).json({
      message: `Logout Successful ✅ Au revoir ${user.username}`,
    });
  } catch (error) {
    res.status(500).json({
      message: "Oops! Something broke, don't worry, we're working on it 🛠️",
      error: error.message,
    });
  }
};
