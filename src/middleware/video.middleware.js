const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if(
      (file.fieldname === 'video' && 
      file.mimetype === 'video/mp4') ||
      (file.fieldname !== 'video' && 
     ( file.mimetype === 'image/png' || 
      file.mimetype === 'image/jpg' || 
      file.mimetype === 'image/jpeg')
      )){

      cb(null, "./public/temp");
    }
      else {
        const error = new Error(
          file.fieldname === "video"
            ? "Only mp4 files are allowed for video"
            : "Only png/jpg/jpeg are allowed for images"
        );
        console.error(error);
        cb(error, false);
      }
    
    
    },
  filename: function (req, file, cb) {
    const date = new Date().toISOString()
    cb(null,`${date}_${file.originalname}`);
  },
});


const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer errors (e.g., file size exceeded)
    return res.status(400).json({
      success: false,
      message: "Multer error",
      response: [],
    });
  } else if (err) {
    // Other errors
    console.error(err);
    return res.status(500).json({
      success: false,
      message: `Internal Server Error ${err}`,
      response: [],
    });
  }
  next(); // Pass the error to the next middleware if not handled here
};

exports.uploadVideo = multer({ storage: storage });
exports.handleUploadError = handleUploadError
