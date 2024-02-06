const asyncHandler = require("express-async-handler");
const User = require("../models/user.schema");

exports.loginValidation = asyncHandler(async (req, res, next) => {
  try{
    const { identifier, password } = req.body;

    if (!identifier) {
      return res.status(400).json({
        status: false,
        message: "Please enter either email or username",
        response: [],
      });
    } 
    
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);


    let username,email;    
    if(isEmail) {
      email = identifier;
    }else{
      username = identifier;
    }
    
    console.log(username,email)

    const user = await User.findOne({
      $or: [  
        { username },
        { email},
      ]
    }); 
    
    
    if (!user) {
      return res.status(400).json({ message: "User not found, please sign up",response:[] });
    }
    
    if (!password) {
      return res
        .status(400)
        .json({ status: false, message: "Please enter password", response:[] });
    }
    
    const matched = await user.comparePassword(password);
    
    if (!matched) {
      return res.status(400).json({status:false, message: "Invalid email or password" ,response:[]});
    }
    
    req.user = user 
    next();
  }catch(error){
    console.error("Error in loginValidation:", error);
    return res.status(400).json({ status:false,message: "Internal Server Error",response:[] });
  }
});
  