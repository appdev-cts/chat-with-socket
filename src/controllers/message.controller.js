const Message = require('../models/message.schema')

const { uploadOnCloudinary } = require('../config/cloudinary.config');
const asyncHandler = require("express-async-handler");

// Multer setup for handling file uploads


exports.addMessage = async (req, res) => {
  const { chatId, senderId, text } = req.body;
  const message = new Message({
    chatId,
    senderId,
    text,
  });
  try {
    const result = await message.save();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);  
  }
};

exports.getMessages = async (req, res) => {
  const { chatId } = req.params;
  try {
    const result = await Message.find({ chatId });
    res.status(200).json(result);

  } catch (error) {
    res.status(500).json(error);
  }
};

exports.sendPhoto = async(req,res)=>{
  const photoLocalPath = req.file?.path;
  const { chatId, senderId } = req.body;


  if (!photoLocalPath) {
    res.status(400).json({
      status: false,
      message: "Photo is missing , please upload it.",
      response: [],
    });
  }

  const cloudinaryUpload = await uploadOnCloudinary(photoLocalPath);

  if (!cloudinaryUpload) {
     res.status(400).json({
      status: false,
      message: 'Error while uploading photo to Cloudinary!',
      response: [],
    });
  }

  const photoUrl = cloudinaryUpload.url;

  const message = new Message({
    chatId,
    senderId,
    photo: {
      cloudinaryUrl: photoUrl,
      fileName: req.file.originalname,
    },
  });

  try {
    const result = await message.save();
    console.log(result);
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json(error);
  }
}


