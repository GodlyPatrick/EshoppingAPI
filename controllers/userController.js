import User from "../models/userSchema.js";
import bcrypt from "bcryptjs";
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "Please fill all the fields" });
  }
  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      email: email,
      username: username,
    });
    if (existingUser) {
      return res.status(400).json({ message: "This User already exists!" });
    }
    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new user
    const newUser = new User({ ...req.body, password: hashedPassword });
    await newUser.save();
    res.status(201).json({
      message:
        "User registered Successfully, check your email to verify your account✅",
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
    console.log(req.body);
  }
};

export const getAUser = async (req, res) => {
  const user = req.user; // must be logged in
  if (!user) {
    return res.status(404).json({ message: "You're not logged in! ⚠" });
  }

  const {
    username,
    email,
    firstName,
    lastName,
    phone,
    street,
    city,
    state,
    postalCode,
    country,
  } = req.query;

  try {
    const filter = {};

    if (username) filter.username = username;
    if (email) filter.email = email;
    if (firstName) filter["profile.firstName"] = firstName;
    if (lastName) filter["profile.lastName"] = lastName;
    if (phone) filter["profile.phone"] = phone;
    if (street) filter["profile.address.street"] = street;
    if (city) filter["profile.address.city"] = city;
    if (state) filter["profile.address.state"] = state;
    if (postalCode) filter["profile.address.postalCode"] = postalCode;
    if (country) filter["profile.address.country"] = country;

    // Prevent sending all users if no query provided
    // if (Object.keys(filter).length === 0) {
    //   return res.status(400).json({ message: "Please provide at least one query parameter ⚠" });
    // }
    
    const filteredUser = await User.find(filter).select("-password");

    if (!filteredUser || filteredUser.length === 0) {
      return res.status(404).json({ message: "No users found matching the criteria! ⚠" });
    }

    res.status(200).json({ message: "User(s) found!", users: filteredUser });
  } catch (error) {
    res.status(500).json({ message: "Server Error 🛑", error: error.message });
  }
};


export const getMyProfile = async (req, res) => {
  const userId = req.user._id; // Get the authenticated user's ID from the request
  try {
    const user = await User.findById(userId).select("-password").populate('profile'); // Exclude password
     res.status(200).json({ message: "User profile fetched successfully ✅", user,  });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }};



export const updateMyAccount = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id; // Get the authenticated user's ID from the request
  const { username, email, password } = req.body;
  try {
    if (id !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You can only update your own account! ⚠" });
    }
    // Hash the password if it's being updated
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
      const updatedUser = await User.findByIdAndUpdate(
        id,
        {
          $set: {
            username: username,
            email: email,
            password: hashedPassword,
          },
        },
        { new: true },
      ).select("-password");
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found! ⚠" });
      }
      res
        .status(200)
        .json({ message: "User updated successfully! ✅", user: updatedUser });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const updateMyProfile = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
 
  const {
    firstName,
    lastName,
    phone,
    street,
    city,
    state,
    postalCode,
    country,
  } = req.body;

  try {
    if (id !== userId.toString())  {
      return res
        .status(403)
        .json({ message: "You can only update your own profile! ⚠" });
    }

    const user = await User.findById(id).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found❕" });
    }
  
    

    // Nullish coalescing
    user.profile.firstName          = firstName     ?? user.profile.firstName;
    user.profile.lastName           = lastName      ?? user.profile.lastName;
    user.profile.phone              = phone         ?? user.profile.phone;
    user.profile.address.street     = street        ?? user.profile.address.street;
    user.profile.address.city       = city          ?? user.profile.address.city;
    user.profile.address.state      = state         ?? user.profile.address.state;
    user.profile.address.postalCode = postalCode    ?? user.profile.address.postalCode;
    user.profile.address.country    = country       ?? user.profile.address.country;

    await user.save(); // Save the updated user profile
      res.status(200).json({
      message: "Profile updated successfully ✅", user});
  } catch (error) {
    res.status(500).json({
      message: "oops! something broke, don't worry, we're working on it🛠️",
      error: error.message,
    });
  }
};

export const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded ⚠️" });

    const user = await User.findById(req.user._id); 
    if (!user) return res.status(404).json({ message: "User not found ⚠️" });

    user.profilePic = req.file.path; // store path in DB
    await user.save();

    res.status(200).json({ message: "Profile picture uploaded ✅", file: req.file });
  } catch (err) {
    res.status(500).json({ message: "Upload failed 🛠️", error: err.message });
  }
};

export const deleteProfilePic = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found 🚫" });
    }

    if (!user.profilePic) {
      return res.status(400).json({ message: "No profile picture to delete ⚠️" });
    }

    user.profilePic = null;
    await user.save();

    res.status(200).json({
      message: "Profile picture deleted successfully 🗑️",
    });
  } catch (error) {
    res.status(500).json({
      message: "Something broke 🛠️",
      error: error.message,
    });
  }
};


export const requestSeller = async (req, res) => {
  const userid = req.user._id;
  const { username, email, phone} = req.body;
  if (!username || !email || !phone) {
    return res.status(400).json({ message: "Please provide all fields ⚠️" });
  }
  try {
       const user = await User.findOne({ _id: userid, email, username });
    if (!user) {
      return res.status(404).json({ message: "User not found! ⚠️" });
    } 
    
    if (user.sellerStatus === "pending") {
      return res.status(400).json({ message: "Request already pending ⏳" });
    }

    if (user.role === "seller") {
      return res.status(400).json({ message: "You are already a seller ✅" });
    }
    if (user.role === "admin" || user.role === "superAdmin") {
      return res
        .status(400)
        .json({ message: "Admins cannot request to become sellers ⚠️" });
    }

    user.sellerStatus = "pending";
    await user.save();

    res.status(200).json({
      message: "Your request to become a seller has been sent successfully 🚀",
      user,
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Oops! Something broke, don't worry we're working on it 🛠️", 
      error: error.message });
  }
};

export const updateSellerProfile = async (req, res) => {
  const { id } = req.params; // seller's ID to update
  const userId = req.user._id; // logged-in user's ID
  const userRole = req.user.role; // logged-in user's role
  const { storeName, storeDescription, contact } = req.body;

  try {
        if (id !== userId.toString() && userRole !== "superAdmin") {
      return res
        .status(403)
        .json({ message: "You can only update your own seller profile! ⚠" });
    }

    const user = await User.findById(id).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found❕" });
    }
    
    // Nullish coalescing
    user.sellerProfile.storeName        = storeName        ?? user.sellerProfile.storeName;
    user.sellerProfile.storeDescription = storeDescription ?? user.sellerProfile.storeDescription;
    user.sellerProfile.contact          = contact         ?? user.sellerProfile.contact;

    await user.save(); // Save the updated seller profile

    res.status(200).json({
      message: "Seller profile updated successfully ✅", user});
  } catch (error) {
    res.status(500).json({
      message: "oops! something broke, don't worry, we're working on it🛠️",
      error: error.message,
    });
  }
};


export const deleteMyAccount = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  if (id !== userId.toString()) {
    return res
      .status(403)
      .json({ message: "You can only delete your own account! ⚠" });
  }
  const deletedUser = await User.findByIdAndDelete(id);
  if (!deletedUser) {
    return res.status(404).json({ message: "User not found! ⚠" });
  }
  res.status(200).json({ message: "User deleted successfully! ✅" });
};


