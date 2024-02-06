const multer = require('multer');
const { sendChatMessage } = require('../controllers/chat.controller');
const { upgradeRole, deleteUser, deleteOwnProfile, getUser, filterUser, uploadVideoLocal, addNewUser, getUserDetails, updateUserDetails, convert, downloadVideo } = require('../controllers/features.controller');
const { isAuthenticated, adminOnly } = require('../middleware/auth.middleware');
const { handleUploadError, upload } = require('../middleware/multer.middleware');
const { userValidtor } = require('../middleware/validator.middleware');
const { uploadVideo } = require('../middleware/video.middleware');

const router = require('express').Router();

router.post('/upgradeRole',isAuthenticated,adminOnly,upgradeRole);
router.delete('/delete-user/:id',isAuthenticated,adminOnly,deleteUser);
router.delete('/delete-own-profile',isAuthenticated,deleteOwnProfile);

// filter user
router.get('/filter-user',filterUser)
router.patch('/video-upload',
uploadVideo.fields([
    {
        name:'video',
        maxCount:1,
    },
    {
        name:'thumbnail',
        maxCount:1,
    }
]),handleUploadError,uploadVideoLocal);


router.post('/add-new-user',userValidtor,isAuthenticated,adminOnly,addNewUser)
router.get('/get-user-details/:id',isAuthenticated,getUserDetails)
router.patch("/update-user-details/:id", isAuthenticated,
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
  adminOnly,
  updateUserDetails
  );


router.post('/convert',convert)

module.exports = router;


