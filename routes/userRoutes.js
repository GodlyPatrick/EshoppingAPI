import Router from "express";
const userRouter = Router();

import {
  registerUser,
  getMyProfile,
  getAUser,
  requestSeller,
  deleteMyAccount,
  updateMyAccount,
  updateMyProfile,
  uploadProfilePic, 
  deleteProfilePic
} from "../controllers/userController.js";
import authenticate from "../middleware/authenticationmiddleware.js";
import {checkBanStatus, blockIncompleteProfiles} from "../middleware/accountVerificationMiddleware.js"
import upload from "../middleware/uploadmiddleware.js";


userRouter
  .post("/register", registerUser)
  .get("/queryUser", authenticate, getAUser)
  .get("/Myprofile", authenticate, getMyProfile)
  .post("/requestSeller", authenticate, checkBanStatus, blockIncompleteProfiles, requestSeller)
  .post("/uploadAvatar", upload.single("profilePic"), authenticate, checkBanStatus, uploadProfilePic)
  .put("/updateUser/:id", authenticate, checkBanStatus, updateMyAccount)
  .put("/updateProfile/:id", authenticate, checkBanStatus, updateMyProfile)
  .delete("/deleteAvatar", authenticate, checkBanStatus, deleteProfilePic)
  .delete("/deleteMyAcc/:id", authenticate, checkBanStatus, deleteMyAccount);







export default userRouter;





