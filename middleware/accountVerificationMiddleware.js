import User from "../models/userSchema.js";

// CASE 1: Block banned users from any action
export const checkBanStatus = (req, res, next) => {
  if (req.user && req.user.isBanned) {
    return res.status(403).json({
      message: "oops! This account has been banned 🔒 Please contact support!",
    });
  }
  next();
};

// CASE 2: Block users with incomplete profiles from certain actions

export const blockIncompleteProfiles = async (req, res, next) => {
  try {
    const userId = req.user._id; // logged-in user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found! ⚠" });
    }

    // (i) If user is a normal USER  
    if (user.role === "user") {
      if (
        !user.profile.firstName ||
        !user.profile.lastName ||
        !user.profile.phone ||
        !user.profile.address?.street ||
        !user.profile.address?.city ||
        !user.profile.address?.country
      ) {
        return res.status(403).json({
          message: "Please complete your profile first! ⚠",
        });
      }
    }

    // (ii) If user is a SELLER 
    if (user.role === "seller") {
      // check user profile
      if (
        !user.profile.firstName ||
        !user.profile.lastName ||
        !user.profile.phone ||
        !user.profile.address?.street ||
        !user.profile.address?.city ||
        !user.profile.address?.country
      ) {
        return res.status(403).json({
          message: "Please complete your profile before creating a product ⚠",
        });
      }

      // check sellerProfile
      if (
        !user.sellerProfile.storeName ||
        !user.sellerProfile.storeDescription ||
        !user.sellerProfile.contact
      ) {
        return res.status(403).json({
          message: "Complete your seller profile before creating a product ⚠",
        });
      }
    }

    // if user Passed all checks → allow request to continue
    next();
  } catch (error) {
    return res.status(500).json({ message: "Server error ⚠", error: error.message });
  }
};


