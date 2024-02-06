const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: { type: String },
  photo: {
    cloudinaryUrl: { type: String },
    fileName: { type: String }, 
  },
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;