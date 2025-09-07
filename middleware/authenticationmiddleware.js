import User from "../models/userSchema.js";
import jwt from "jsonwebtoken";

// define the Authentication Middleware function
const authenticate = async (req, res, next) => {
  const token = req.cookies.token;
  const secretKey = process.env.JWT_SECRET;
  if (!token) {
    return res.status(401).json({ message: "Access Denied, pls log in to continue! ⚠️" });
  }
  try {
    const validToken = jwt.verify(token, secretKey);
    if (!validToken) {
      return res.status(401).json({ message: "Invalid Token!❌" });
    }
    const verifiedUser = await User.findById(validToken.id).select("-password"); // Exclude password 
    if (!verifiedUser) {
      return res.status(401).json({ message: "User not found❌" });
    }
    req.user = verifiedUser; // Attach the verified user to the request object
    req.role = verifiedUser.role; // Attach the user role to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(500).json({
      message: "oops! something broke, don't worry, we're working on it🛠️",
      error: {"Session Timeout": error.message},
    });
  }
};
export default authenticate;
