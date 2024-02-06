const asyncHandler = require("express-async-handler");
const Chat = require("../models/chat.schema");
const User = require("../models/user.schema");

exports.createChat = async (req, res) => {

  const { senderId, receiverId } = req.body;
  try {
    const existingChat = await Chat.findOne({
      members: {
        $all: [senderId, receiverId],
      },
    });

    if (existingChat) {
      return res.status(200).json(existingChat);
    }

    const newChat = new Chat({
      members: [senderId, receiverId],
    });

    const result = await newChat.save();
    res.status(200).json(result);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.userChats = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      members: { $in: [req.params.userId] },
    });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found for the user.' });
    }
    console.log(chat)
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.findChat = async (req, res) => {
  try { 
    const chat = await Chat.findOne({
      members: { $all: [req.params.firstId, req.params.secondId] },
    });
    res.status(200).json(chat)
  } catch (error) {
    res.status(500).json(error)
  }
};

exports.getUserChats = async (req, res) => {
  try {
    const {userId} = req.params;
    const chats = await Chat.find({
      members: userId,
    })
    res.status(200).json(chats);
  } catch (err) {
    res.status(500).json(err);
  }
};