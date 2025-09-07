import mongoose from "mongoose";

mongoose.Schema.Types.String.set("trim", true); // Trims all strings globally

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },

    // Role system
    role: {
      type: String,
      enum: ["user", "seller", "admin", "superAdmin"], // added "seller"
      default: "user",
    },
    // Account status
    isVerified: { type: Boolean, default: false }, // email verified via OTP
    isBanned: { type: Boolean, default: false }, // banned by admin
    
    // Track if user wants to become seller
    sellerStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },

    // Seller-specific info (only filled if approved)
    sellerProfile: {
      storeName: { type: String },
      storeDescription: { type: String },
      contact: { type: String },
    },

    profile: {
      firstName: { type: String },
      lastName: { type: String },
      phone: { type: String, unique: true, sparse: true }, // sparse allows multiple nulls
      address: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
      },
    },
    profilePic: { type: String }, 
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;

// import mongoose from "mongoose";

// mongoose.Schema.Types.String.set("trim", true); // Trims all strings globally in userSchema
// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   email: { type: String, required: true, unique: true, lowercase: true},
//   password: { type: String, required: true },
//   role: { type: String, enum: ["user", "admin", "superAdmin"], default: "user" },
 
//    profile: {
//       firstName: { type: String },
//       lastName: { type: String },
//       phone: { type: String },
//       address: {
//         street: String,
//         city: String,
//         state: String,
//         postalCode: String,
//         country: String
//       }}},{ timestamps: true });   
// const User = mongoose.model("User", userSchema);
// export default User;
