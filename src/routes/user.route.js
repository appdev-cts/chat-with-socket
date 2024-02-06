const { Router } = require("express");
const router = Router();

const {
  registerUser,
  loginUser,
  updateUserProfile,
  changePassword,
  getUserDetails,
  logoutUser,
  loginStatus,
  forgotPassword,
  resetPassword,
  sendEmailVerification,
  verifyUserAccount,
  googleSignIn,
  updateUserAvatar,
  getDistanceFromLatLonInKm,
  getDistance,
  getAllUserDetails,
  getAllUsersDetails,
  updateUserAadharCard,
  getAllUserAddress,
  getAllUsersAddress,
  resendEmailVerification,
  getOwnDetails,
} = require("../controllers/user.controller");

const {
  userValidtor,
  loginValidator,
  passwordValidtor,
  passwordChangeValidtor,
} = require("../middleware/validator.middleware");

const {
  protect,
  verifiedOnly,
  isAuthenticated,
  adminOnly,
} = require("../middleware/auth.middleware");

const { upload, handleUploadError } = require("../middleware/multer.middleware");
const { loginValidation } = require("../middleware/login.validationmiddleware");


// Protected routes
router.patch("/change-password",isAuthenticated,passwordChangeValidtor,changePassword);
router.get("/get-own-details", isAuthenticated, getOwnDetails);
router.post("/get-distance", isAuthenticated, getDistance);
router.get("/logout", isAuthenticated, logoutUser);
router.get("/login-status", isAuthenticated, loginStatus);

// update profile
router.patch("/update-user-profile", isAuthenticated,
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "aadharCard",
      maxCount: 1,
    },
  ]),
  handleUploadError,
  updateUserProfile
  );
  router.post("/update-user-avatar",isAuthenticated, upload.single("avatar"),handleUploadError,updateUserAvatar);
  router.post("/update-user-aadharCard",isAuthenticated,upload.single("aadharCard"),handleUploadError,updateUserAadharCard);
///////////////////////////////////////////////////////////////////////////////////////////////////////////



// Public Routes
router.post("/register-user", userValidtor, registerUser);
router.post("/forgot-password", forgotPassword);
router.post("/resend-verification-email", resendEmailVerification );
router.post("/reset-password/:resetToken", passwordValidtor, resetPassword);
router.get("/verify-user-account/:verifyToken", verifyUserAccount);
router.post("/login-user", loginValidation, verifiedOnly, loginUser);

// pending
// router.get('/google-signin',googleSignIn);


// admin route
router.get("/getAllUsersDetails",isAuthenticated,adminOnly,getAllUsersDetails);
router.get("/getAllUsersAddress",isAuthenticated,adminOnly,getAllUsersAddress);
router.post("/login-admin-only",loginValidation,adminOnly,verifiedOnly,loginUser);
//////////////////////////////////////////////////////////////////////////////////////////


module.exports = router;
