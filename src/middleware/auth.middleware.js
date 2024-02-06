const asyncHandler = require("express-async-handler");
const User = require("../models/user.schema");
const jwt = require("jsonwebtoken");
const Token = require("../models/token.schema");

exports.protect = asyncHandler(async (req, res, next) => {
  try {
    //get user token
    const token =
      req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

    //if token is not
    if (!token) {
      return res
        .status(400)
        .json({
          message: "Your are not valid user , please login/register",
          response:[],
        });
    }

    // verify token
    const Verified = jwt.verify(token, process.env.JWT_SECRET);

    // get user id from token
    const user = await User.findById(Verified.id).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", response:[] });
    }
    req.user = user;
    next();
  } catch (error) {
    res
      .status(401)
      .json({ message: "Not authorized, Please login", response:[] });
    console.error("Error", error);
  }
});



// another way
exports.isAuthenticated = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(400)
        .json({
          message: "Your are not valid user,please login/register",
          response:[],
        });
    }

    const Verified = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(Verified.id).select("-password");
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", response:[] });
    }

    const tokenExists = await Token.findOne({ userId: user._id });

    if (!tokenExists || tokenExists.token !== token) {
      return res.status(400).json({
        message: "Invalid access token. Token has been revoked.",
        response:[],
      });
    }

      req.user = user;
      next();
  } catch (error) {
    console.log("error", error);
    res.json({
      status: false,
      message: "Invalid access token",
      response:[],
    });
  }
});


exports.verifiedOnly = asyncHandler(async (req, res, next) => {
  // const { username, email, password } = req.body;

  // if (!(username || email)) {
  //   return res.status(400).json({
  //     status: false,
  //     message: "Please enter either email or username",
  //     response:[],
  //   });
  // }
  // console.log(username, email)
  // const user = await User.findOne({
  //   $or: [
  //     { username },
  //     { email },
  //   ],
  // });

  const user = await User.findOne(req.user._id)

  if (user && user.isVerified) {
    next();
  } else {
    res.status(401).json({
      status: false,
      message:
        "Account not verified , Please verify your email first",
      response:[],
    });
  }
});


exports.adminOnly = asyncHandler(async(req,res,next)=>{
 
  if(req.user && req.user.role === "admin"){
    next()
  }else{
    res.status(400).json({
      status: false,
      message: "Unauthorized Access: This operation requires admin privileges.",
      response:[],
    });
  }
})


// exports.isOwner = asyncHandler(async (req,res,next)=>{
//   const user = await User.findById(req.user.id);

//   if(!user){
//     res.status(404).json({success:false, message:"User not found",response:[{}]})
//   }

//   if(user._id.toString() !== req.params.id){
//     res.status(403).json({success:false , message:"You are not authorized to delete this profile!"})
//   }
//   next()
// })


