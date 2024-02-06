// const multer = require("multer");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     if (
//       file.mimetype == "image/png" ||
//       file.mimetype == "image/jpg" ||
//       file.mimetype == "image/jpeg" ||
//       file.mimetype == "application/pdf"
//     ) {
//       cb(null, "./public/temp");
//     } else {
//       const error = new Error("Only PDF/IMAGES are allowed");
//       console.error(error);
//       cb(error, false);
//     }
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   },
// });

// exports.upload = multer({ storage });



  const multer = require("multer");

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      if (
        (file.fieldname === "aadharCard" &&
          file.mimetype === "application/pdf") || 
        (file.fieldname !== "aadharCard" &&
          (file.mimetype === "image/png" ||
            file.mimetype === "image/jpg" ||
            file.mimetype === "image/jpeg"))
      ) {
        cb(null, "./public/temp");
      } else {
        const error = new Error(
          file.fieldname === "aadharCard"
            ? "Only PDF files are allowed for Aadhar Card"
            : "Only images are allowed for other files"
        );
        console.error(error);
        cb(error, false);
      }
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
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
    next(); 
  };



  exports.upload = multer({ storage });
  exports.handleUploadError = handleUploadError;
