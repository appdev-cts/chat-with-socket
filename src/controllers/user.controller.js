// -------------------------------------- Require Library --------------------------------
const asyncHandler = require("express-async-handler");
const User = require("../models/user.schema");
const Token = require("../models/token.schema");
const {
  generateToken,
  getCoordinates,
  hashToken,
  deg2rad,
  sendError,
  emailTransporter,
} = require("../utils");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const geolib = require("geolib");
const sendEmail = require("../utils/sendEmail");
const { uploadOnCloudinary } = require("../config/cloudinary.config");
const crypto = require("crypto");

// -------------------------------------- Bussiness Logic --------------------------------

// Register User
exports.registerUser = asyncHandler(async (req, res) => {
  let { email, password, mobileNumber, username } = req.body;

  // Create user
  const user = await User.create({ email, password, mobileNumber, username });

  // Generate token
  const token = generateToken(user._id);
  password = undefined;

  //   Create Verification Token
  const verificationToken = crypto.randomBytes(32).toString("hex") + user._id;

  // hashed token
  const hashedToken = hashToken(verificationToken);

  // save in db
  //  await new Token({
  //   userId: user._id,
  //   verificationToken: hashedToken,
  //   createdAt: Date.now(),
  //   expiresAt: Date.now() + 60 * (60 * 1000), // 60 mins
  // }).save();

  // // save token in db
  // await new Token({
  //   userId: user._id,
  //   token: token,
  //   createdAt: Date.now(),
  //   expiresAt: new Date(Date.now() +  24 * 24 * 60 * (60 * 1000)), // 24hrs
  // }).save();

  const verificationTokenExpiration = Date.now() + 60 * 60 * 1000; // 60 minutes
  const resetTokenExpiration = Date.now() + 24 * 60 * 60 * 1000; // 24 hours for reset token
  const authTokenExpiration = Date.now() + 48 * 60 * 60 * 1000;

  // Save both tokens in one document
  await new Token({
    userId: user._id,
    verificationToken: hashedToken,
    token: token,
    createdAt: Date.now(),
    expiresAtVerification: verificationTokenExpiration,
    expiresAtToken: authTokenExpiration,
  }).save();

  // Sending token in the response header

  // Send HTTP-only cookie
  // res.cookie("token", token, {
  //   path: "/",
  //   httpOnly: true,
  //   expires: new Date(Date.now() + 24 * 60 * (60 * 1000)), // 24hrs
  //   sameSite: "none",
  //   secure: true,
  // });

  // Sending response
  if (user) {
    const { _id, email, mobileNumber, isVerified, username } = user;

    res.status(201).json({
      status: true,
      message: "User is created successfully",
      response: [
        {
          _id,
          email,
          mobileNumber,
          isVerified,
          username,
          verificationToken,
        },
      ],
    });
  } else {
    res
      .status(400)
      .json({ status: false, message: "Invalid user data", response: [] });
  }
});
// ------------------------------------- Register User end  ------------------------------

// Login User
exports.loginUser = asyncHandler(async (req, res) => {
  let { identifier, password } = req.body;

  const user = await User.findOne({
    $or: [{ username: identifier }, { email: identifier }],
  });

  // Delete Token if it exists in DB
  // let userToken = await Token.findOne({ userId: user._id });

  let exitingToken = await Token.findOne({ userId: user._id });
  if (exitingToken) {
    await exitingToken.deleteOne();
  }

  // Generate token
  const token = generateToken(user._id);
  password = undefined;

  // Update or create new token in DB
  await Token.updateOne(
    { userId: user._id },
    {
      userId: user._id,
      token: token,
      createdAt: Date.now(),
      expiresAtToken: new Date(Date.now() + 24 * 24 * 60 * (60 * 1000)), // 24hrs
    },
    { upsert: true }
  );

  // save token in db
  //  const dbuser =  await new Token({
  //     userId: user._id,
  //     token: token,
  //     createdAt: Date.now(),
  //     expiresAt: new Date(Date.now() + 24 * 60 * (60 * 1000)), // 24hrs
  //   }).save();

  //   console.log(dbuser.token)

  // Send HTTP-only cookie
  // res.cookie("token", token, {
  //   path: "/",
  //   httpOnly: true,
  //   expires: new Date(Date.now() + 24 * 60 * (60 * 1000)), // 24hrs
  //   sameSite: "none",
  //   secure: true,
  // });

  // Sending response
  if (user) {
    const { _id, email, mobileNumber, role, isVerified, username } = user;
    res.status(200).json({
      status: true,
      message: "Login Successfull ",
      response: [
        {
          _id,
          email,
          username,
          role,
          mobileNumber,
          isVerified,
          token,
        },
      ],
    });
  } else {
    res
      .status(200)
      .json({ status: false, message: "Invalid user data", response: [] });
  }
});
// ------------------------------------- login user end  ------------------------------

// Update User Profile
exports.updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

   
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
        response: [],
      });
    }

    let {
      avatar,
      gender,
      hobbies,
      currentAddress,
      permanentAddress,
      aadharCard,
      latitude,
      longitude,
    } = user;


    // Upload image to Cloudinary
    let avatarCloud = null;
    if (req.files && req.files.avatar && req.files.avatar[0]) {
      avatarCloud = await uploadOnCloudinary(req.files.avatar[0].path);
    }
    avatarCloud = avatarCloud || { url: avatar }; // Use default if no new image provided

    // Upload Aadhar card to Cloudinary
    let aadharCardCloud = null;
    if (req.files && req.files.aadharCard && req.files.aadharCard[0]) {
      aadharCardCloud = await uploadOnCloudinary(req.files.aadharCard[0].path);
    }
    aadharCardCloud = aadharCardCloud || { url: aadharCard }; // Use default if no new Aadhar card provided

    const hobbiesArray = typeof req?.body?.hobbies === 'string' ? req?.body?.hobbies.split(",").map((hobby) => hobby.trim()) : user.hobbies;

    console.log(req.files)
    // Update user data
    user.avatar = avatarCloud.url;
    user.gender = req.body.gender || gender;
    user.currentAddress = req.body.currentAddress || currentAddress;
    user.permanentAddress = req.body.permanentAddress || permanentAddress;
    user.aadharCard = aadharCardCloud.url;
    user.hobbies = hobbiesArray
    // long and lant

    // Update latitude and longitude if provided in the request
    user.latitude = parseFloat(req.body.latitude) || latitude;
    user.longitude = parseFloat(req.body.longitude) || longitude;


    if (!isNaN(user.latitude) && !isNaN(user.longitude)) {
    user.latitude = Math.min(90, Math.max(-90, user.latitude));
    user.longitude = Math.min(180, Math.max(-180, user.longitude));
    user.location = {
      type: "Point",
      coordinates: [user.longitude, user.latitude],
    };
  } 
    

  

    // Save updated user
    const updatedUser = await user.save();

    const userWithoutPassword = { ...updatedUser.toObject() };
    delete userWithoutPassword.password;

    // Sending response
    res.status(200).json({
      status: true,
      message: "Update user profile successfully",
      response: [{ user: userWithoutPassword }],
    });
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      response: [],
    });
  }
});

// ------------------------------------- Update User End  ------------------------------

// Change Password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  console.log(currentPassword,newPassword)

  if (!user) {
    res
      .status(404)
      .json({ status: false, message: "User not found", response: [] });
  }

  if (!currentPassword || !newPassword) {
    res.status(400).json({
      status: false,
      message: "Please enter current password and new password",
      response: [],
    });
  }

  // check if old password is correct
  const passwordIsCorrect = await bcrypt.compare(currentPassword, user.password);

  console.log(passwordIsCorrect);
  // Destroy the current session
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });

  // Save new password
  if (user && passwordIsCorrect) {
    user.password = newPassword;
    await user.save();

    // Send Email
    const subject = "Password Change Successfully - Cts";
    const send_to = user.email;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = "noreply@gamil.com";
    const template = "changePassword";
    const name = user.email;

    await sendEmail(subject, send_to, sent_from, reply_to, template, name);

    res.status(200).json({
      status: true,
      message: "Password change successful, please re-login",
      response: [],
    });
  } else {
    res.status(400).json({
      status: false,
      message: "Old password is incorrect",
      response: [],
    });
  }
});
// ------------------------------------- Change Password end  ------------------------------

// Get user details
exports.getOwnDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const userWithoutPassword = { ...user.toObject() };
  delete userWithoutPassword.password;

  if (user) {
    res.status(200).json({
      status: true,
      message: "User details fetched sucessfully",
      response: [{ user: userWithoutPassword }],
    });
  } else {
    res
      .status(404)
      .json({ status: false, message: "User not found", response: [] });
  }
});
// ------------------------------------- Get User end  ------------------------------

// Logout User
exports.logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Find and delete the user's token from the database
  await Token.findOneAndDelete({ userId });

  // Delete the token on the client side by setting an empty cookie
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });

  return res
    .status(200)
    .json({ status: true, message: "Logout successful", response: [] });
});
// ------------------------------------- logout user end  ------------------------------

// Get Login Status
exports.loginStatus = asyncHandler(async (req, res) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return res.json({
      status: false,
      message: "User is logout, please provide a valid Bearer token.",
      response: [],
    });
  }

  const token = authorizationHeader.split(" ")[1];

  if (!token) {
    return res.json({
      status: false,
      message: "User is logout, please provide a valid Bearer token.",
      response: [],
    });
  }

  // Verify token
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user exists in the database
    const user = await User.findById(decodedToken.id).select("-password");

    if (!user) {
      res.json({
        status: false,
        message: "User not found, please log in.",
        response: [],
      });
    }

    const tokenExists = await Token.findOne({ userId: user._id });
    if (!tokenExists) {
      res.json({
        status: false,
        message: "Token not found, please log in.",
        response: [],
      });
    }

    res.json({
      status: true,
      message: "User is logged in",
      response: [{ user }],
    });
  } catch (error) {
    console.error("Error in loginStatus:", error);
    res.json({
      status: false,
      message: "Invalid Bearer token, user is logged out.",
      response: [],
    });
  }
});
// ------------------------------------- login status end  ------------------------------

// Send Automated emails
exports.sendAutomatedEmail = asyncHandler(async (req, res) => {
  const { subject, send_to, reply_to, template, url } = req.body;

  if (!subject || !send_to || !reply_to || !template) {
    res.status(500).json({
      status: false,
      message: "Missing email parameter",
      response: [],
    });
  }

  // Get user
  const user = await User.findOne({ email: send_to });

  if (!user) {
    res
      .status(404)
      .json({ status: false, message: "User not found", response: [] });
  }

  const sent_from = process.env.EMAIL_USER;
  const name = user.name;
  const link = `${process.env.FRONTEND_URL}${url}`;

  try {
    await sendEmail(
      subject,
      send_to,
      sent_from,
      reply_to,
      template,
      name,
      link
    );
    res.status(200).json({ status: true, message: "Email Sent", response: [] });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Email not sent, please try again",
      response: [],
    });
  }
});
// ------------------------------------- Send Automated emails end  ------------------------------

// Forgot Password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404).json({
      status: false,
      message: "No User with this email",
      response: [],
    });
  }

  // Delete token if it exists in Database
  let token = await User.findOne({ userId: user._id });
  if (token) {
    await token.deleteOne();
  }

  //   Create Verification Token and save
  const resetToken = crypto.randomBytes(32).toString("hex") + user._id;

  // Hash Token
  const hashedToken = hashToken(resetToken);
  await new Token({
    userId: user._id,
    resetToken: hashedToken,
    createdAt: Date.now(),
    expiresAtReset: Date.now() + 60 * (60 * 1000),
  }).save();
  const resetURL = `${process.env.FRONTEND_URL}/api/v1/auth/reset-password/${resetToken}`;

  // Send Email
  const subject = "Password r eset requrest - Cts " + resetURL;
  const send_to = user.email;
  const sent_from = process.env.EMAIL_USER;
  const reply_to = "noreply@gmail.com";
  const template = "forgotPassword";
  const name = user.email;
  const link = resetURL;

  // sending email
  try {
    // await sendEmail(
    //   subject,
    //   send_to,
    //   sent_from,
    //   reply_to,
    //   template,
    //   name,
    //   link
    // );

    emailTransporter.sendMail(
      {
        subject,
        to: send_to,
        from: sent_from,
        replyTo: reply_to,
        // template : template,
        link,
        // context: { name, link },
      },
      (error, info) => {
        if (error) {
          return console.error("Error sending email:", error);
        }
        console.log("Email sent:", info.response);
      }
    );

    res.status(200).json({
      status: true,
      message: "Password email is send , please check your email",
      response: [],
    });
  } catch (err) {
    console.error("Something went wrong while forgot password", err);
    res.status(500).json({
      status: false,
      message: "Email not sent, yet please try again later",
      response: [],
    });
  }
});
// ------------------------------------- Forgot Password end  ------------------------------

// Reset Password
exports.resetPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  console.log(resetToken)
  console.log(password)

  const hashedToken = hashToken(resetToken);

  const userToken = await Token.findOne({
    resetToken: hashedToken,
    expiresAtReset: { $gt: Date.now() },
  });

  if (!userToken) {
    res
      .status(404)
      .json({ status: false, message: "User token not found", response: [] });
  }

  // Find User
  const user = await User.findOne({ _id: userToken.userId });

  user.password = password;
  // Destroy the current session
  // res.cookie("token", "", {
  //   path: "/",
  //   httpOnly: true,
  //   expires: new Date(0),
  //   sameSite: "none",
  //   secure: true,
  // });

  await user.save();

  // sending email
  // Send Email
  const subject = "Password Reset Successfully - Cts";
  const send_to = user.email;
  const sent_from = process.env.EMAIL_USER;
  const reply_to = "noreply@gmail.com";
  const template = "resetPassword";
  const name = user.email;

  // sending email
  try {
    await sendEmail(subject, send_to, sent_from, reply_to, template, name);
    res.status(200).json({
      status: true,
      message: "Password Reset Successfully, please login again.",
      response: [],
    });
  } catch (err) {
    console.error("Something went wrong while reset password", err);
    res.status(500).json({
      status: false,
      message: "Email not sent, yet please try again later",
      response: [],
    });
  }
});
// ------------------------------------- Reset Password end  ------------------------------

// resend email Verification
exports.resendEmailVerification = asyncHandler(async (req, res) => {
  const { email, username } = req.body;

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    res
      .status(404)
      .json({ status: false, message: "User not found", response: [] });
  }

  if (user && user.isVerified) {
    res.status(400).json({
      status: false,
      message: "User already verified",
      response: [],
    });
  }

  // Delete Token if it exists in db
  let token = await Token.findOne({ userId: user._id });

  if (token) {
    await token.deleteOne();
  }

  //   Create Verification Token
  const verificationToken = crypto.randomBytes(32).toString("hex") + user._id;

  // hashed token
  const hashedToken = hashToken(verificationToken);

  // save in db
  await new Token({
    userId: user._id,
    verificationToken: hashedToken,
    createdAt: Date.now(),
    expiresAtVerification: Date.now() + 60 * (60 * 1000), // 60 mins
  }).save();

  const verificationURL = `${process.env.FRONTEND_URL}/api/v1/auth/verify-user-account/:${verificationToken}`;

  const subject = "Verify User Account - Cts";
  const send_to = user.email;
  const sent_from = process.env.EMAIL_USER;
  const reply_to = "noreply@gmail.com";
  const template = "emailVerification";
  const name = user.email;
  const link = verificationURL;

  try {
    await sendEmail(
      subject,
      send_to,
      sent_from,
      reply_to,
      template,
      name,
      link
    );
    res.status(200).json({
      status: true,
      message: "Verification Email Sent",
      response: [{ verificationToken: verificationToken }],
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Email not sent, please try again",
      response: [],
    });
  }
});
// ------------------------------------- Send Email Verification ------------------------------

// Verify User Account
exports.verifyUserAccount = asyncHandler(async (req, res) => {
  const { verifyToken } = req.params;

  const hashedToken = hashToken(verifyToken);

  const userToken = await Token.findOne({
    verificationToken: hashedToken,
    expiresAtVerification: { $gt: Date.now() },
  });

  if (!userToken) {
    res.status(404).json({
      status: false,
      message: "Invalid and expire token",
      response: [],
    });
  }

  const user = await User.findOne({ _id: userToken.userId });
  user.isVerified = true;
  await user.save();

  const subject = "Account Verify Successfully - Cts";
  const send_to = user.email;
  const sent_from = process.env.EMAIL_USER;
  const reply_to = "noreply@gmail.com";
  const template = "verifyUser";
  const name = user.email;

  // Remove the password field from the user object
  const userWithoutPassword = { ...user.toObject() };
  delete userWithoutPassword.password;

  try {
    await sendEmail(subject, send_to, sent_from, reply_to, template, name);
    res.status(200).json({
      status: true,
      message: "Account Verify Successfully",
      response: [{ user: userWithoutPassword }],
    });
  } catch (error) {
    res.status(500).json({
      status: true,
      message: "Email not sent, please try again",
      response: [],
    });
  }
});
// ------------------------------------- Verify User Account ------------------------------

//Get distakce from lat lon in km
exports.getDistance = asyncHandler(async (req, res) => {
  let { current_lat, current_long, permanent_lat, permanent_long } = req.body;
  let R = 6371; // Radius of the earth in km
  let dLat = deg2rad(permanent_lat - current_lat); // deg2rad below
  let dLon = deg2rad(permanent_long - current_long);
  let a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(current_lat)) *
      Math.cos(deg2rad(permanent_lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let d = R * c; // Distance in km

  const distance = parseFloat(d.toFixed(2)) + "km";
  res.status(200).json({
    status: true,
    message: "sccessfully distance is fetched",
    response: [{ distance }],
  });
});
// ------------------------------------- Verify User Account ------------------------------

// UPDATE USER AVATAR
exports.updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    res.status(400).json({
      status: false,
      message: "Avatar is missing , please upload it.",
      response: [],
    });
  }

  const user = await User.findOne(req.user._id);
  if (!user) {
    res
      .status(404)
      .json({ status: false, message: "User not found", response: [] });
  }

  if (user.avatar) {
    user.avatar = "";
    await user.save();
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    res.status(400).json({
      status: false,
      message: "Error while updating avatar image!",
      response: [],
    });
  }

  const updateUserAvatar = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  res.status(200).json({
    status: true,
    message: "Avatar image updated successfully",
    response: [{ updateUserAvatar }],
  });
});
// ------------------------------------ UPDATE USER AVATAR--------------------------------

// GET ALL USERS DETAILS
exports.getAllUsersDetails = asyncHandler(async (req, res) => {
  const users = await User.find().sort("-createdAt").select("-password");

  // const userWithoutPassword = { ...users.toObject() };
  // delete userWithoutPassword.password;

  if (!users || users.length === 0) {
    return res.status(404).json({
      status: false,
      message: "Users not found",
      response: [],
    });
  }
  res.status(200).json({
    status: true,
    message: "All users details fetched sccessfully",
    response: [{ users }],
  });
});
// ----------------------------------- GET ALL USER DETAILS ---------------------------------

// UPDATE USER AADHARCARD
exports.updateUserAadharCard = asyncHandler(async (req, res) => {
  const aadharLocalPath = req.file?.path;

  if (!aadharLocalPath) {
    res.status(400).json({
      status: false,
      message: "aadharCard is missing , please upload it.",
      response: [],
    });
  }

  const user = await User.findOne(req.user._id);
  if (!user) {
    res
      .status(404)
      .json({ status: false, message: "User not found", response: [] });
  }

  if (user.aadharCard) {
    user.aadharCard = "";
    await user.save();
  }

  const aadharCard = await uploadOnCloudinary(aadharLocalPath);

  if (!aadharCard) {
    res.status(400).json({
      status: false,
      message: "Error while updating avatar image!",
      response: [],
    });
  }

  const updateUserAadharCard = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        aadharCard: aadharCard.url,
      },
    },
    { new: true }
  ).select("-password");

  res.status(200).json({
    status: true,
    message: "AadharCard updated successfully",
    response: [{ updateUserAadharCard }],
  });
});
// ----------------------------------- UPDATE USER AADHARCARD ---------------------------------

// GET ALL USERS ADDRESS
exports.getAllUsersAddress = asyncHandler(async (req, res) => {
  const users = await User.find().sort("-createdAt").select("-password");

  if (!users || users.length === 0) {
    return res.status(404).json({
      status: false,
      message: "Users not found",
      response: [],
    });
  }

  const addresses = users
    .filter((user) => user.currentAddress || user.permanentAddress)
    .map((user) => ({
      username: user.username,
      email: user.email,
      currentAddress: user.currentAddress,
      permanentAddress: user.permanentAddress,
    }));

  if (addresses.length === 0) {
    return res.status(404).json({
      status: false,
      message: "No user addresses found",
      response: [],
    });
  }

  res.status(200).json({
    status: true,
    message: "All users address fetched sccessfully",
    response: addresses,
  });
});
// ------------------------------------ GET USERS ADDRESS -------------------------------------------

