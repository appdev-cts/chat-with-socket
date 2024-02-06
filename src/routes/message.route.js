const express = require("express");
const {addMessage,getMessages, sendPhoto} = require("../controllers/message.controller");
const { isAuthenticated } = require("../middleware/auth.middleware");
const { upload, handleUploadError } = require("../middleware/multer.middleware");
const router = express.Router();

router.post('/', addMessage);
router.get('/:chatId', getMessages);
router.post('/send-photo',upload.single("photo"),handleUploadError,sendPhoto);
// router.get('/get-photo',getPhoto)
// router.get("/getPreviousChat/:userId",getPreviousChat);

module.exports = router;
