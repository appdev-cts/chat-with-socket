const { check, validationResult } = require("express-validator");
const User = require("../models/user.schema");

const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return `${param}: ${msg}`;
};

exports.userValidtor = [
  /////////////////////////////   Email   /////////////////////////////

  check("email", "Please include a valid email")
    .not()
    .isEmpty()
    .withMessage("Email is field required")
    .isEmail()
    .matches(/^\w+([\.]?\w+)*@\w+([\.]?\w+)*(\.\w{2,3})+$/)
    .withMessage("Please enter a valid email")

    .custom((value, { req }) => {
      return new Promise(async (resolve, reject) => {
        let user = await User.findOne({ email: req.body.email.toLowerCase() })
          .then((user) => {
            if (user) {
              reject(new Error("E-mail already in use"));
            }
            resolve(true);
          })
          .catch((error) => {
            reject(new Error("Server Error", err));
          });
      });
    }),

  /////////////////////////////   USERNAME   /////////////////////////////

  check("username", "Please include a valid username")
  .not()
  .isEmpty()
  .withMessage("Username is a required field")

   .custom((value, { req }) => {
      return new Promise(async (resolve, reject) => {
        let user = await User.findOne({ username: req.body.username })
          .then((user) => {
            if (user) {
              reject(new Error("Username already in use"));
            }
            resolve(true);
          })
          .catch((error) => {
            reject(new Error("Server Error", err));
          });
      });
    }),

  /////////////////////////////   Password   /////////////////////////////


  check("password")
    .not()
    .isEmpty()
    .withMessage("Please ,Enter your password")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be between 8 to 20 characters long")
    .custom(password => {
          if (password && password.match(/^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/)) {
              return true;
          } 
      }).withMessage('Password must be at least 8 characters long along with atleast a symbol , uppercase and lowercase letter.'),
  
  ///////////////////////////// Mobile Number //////////////////////////

  check('mobileNumber')

  .isNumeric()
  .withMessage('Mobile Number must contain only numeric digits')
  .isLength({min: 10, max: 12})
  .withMessage("Mobile Number must be in the range of 10 to 12")

  .custom((value, { req }) => {
    return new Promise(async (resolve, reject) => {
      let user = await User.findOne({ mobileNumber: req.body.mobileNumber })
        .then((user) => {
          if (user) {
            reject(new Error("Mobile number is already in use"));
          }
          resolve(true);
        })  
        .catch((error) => {
          reject(new Error("Server Error", err));
        });
    });
  }),

  /////////////////////////////   Result Go through here   /////////////////////////////


  (req, res, next) => {
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      let err_msg = "";
      err_msg = errors.array();
      if (err_msg.length >= 1) {
        let err = err_msg[0].split(":")[1];
        return res.status(400).json({ status: false, message: err.trim(), response:[]});
      }
    } else {
      next();
    }
  },

  /////////////////////////////////////////////////////////////////////////////////

];

exports.passwordChangeValidtor = [
  check("newPassword")
  .not()
  .isEmpty()
  .withMessage("Please ,Enter your password")
  .isLength({ min: 8, max: 20 })
  .withMessage("Password must be between 8 to 20 characters long")
  .custom(password => {
        if (password && password.match(/^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/)) {
            return true;
        } 
    }).withMessage('Password must be at least 8 characters long along with atleast a symbol , uppercase and lowercase letter.'),

    /////////////////////////////   Result Go through here   /////////////////////////////


  (req, res, next) => {
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      let err_msg = "";
      err_msg = errors.array();
      if (err_msg.length >= 1) {
        let err = err_msg[0].split(":")[1];
        return res.status(400).json({ status: false, message: err.trim() , response:[] });
      }
    } else {
      next();
    }
  },
  /////////////////////////////////////////////////////////////////////////////////
];
exports.passwordValidtor = [
  check("password")
  .not()
  .isEmpty()
  .withMessage("Please ,Enter your password")
  .isLength({ min: 8, max: 20 })
  .withMessage("Password must be between 8 to 20 characters long")
  .custom(password => {
        if (password && password.match(/^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/)) {
            return true;
        } 
    }).withMessage('Password must be at least 8 characters long along with atleast a symbol , uppercase and lowercase letter.'),

    /////////////////////////////   Result Go through here   /////////////////////////////


  (req, res, next) => {
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      let err_msg = "";
      err_msg = errors.array();
      if (err_msg.length >= 1) {
        let err = err_msg[0].split(":")[1];
        return res.status(400).json({ status: false, message: err.trim() , response:[] });
      }
    } else {
      next();
    }
  },
  /////////////////////////////////////////////////////////////////////////////////
];

// exports.loginValidator = [
//   check("identifier").trim().not().isEmpty().withMessage("Email/Username is required!"),
//   check("password").trim().not().isEmpty().withMessage("Password is missing!"),

//   (req, res, next) => {
//     const errors = validationResult(req).formatWith(errorFormatter);

//     if (!errors.isEmpty()) {
//       let err_msg = errors.array();
//       if (err_msg.length >= 1) {
//         let err = err_msg[0].split(":")[1];
//         return res.status(400).json({ status: false, message: err.trim() });
//       }
//     } else {
//       next();
//     }
//   }
// ];


exports.mobileNumberValidation = [

  ///////////////////////////// Mobile Number //////////////////////////

  check('phoneNumber')
  .not()
  .isEmpty()
  .withMessage('Please,Enter your phone number')
  .isNumeric()
  .withMessage('Mobile Number must contain only numeric digits')
  .isLength({min: 10, max: 12})
  .withMessage("Mobile Number must be in the range of 10 to 12")

  .custom((value, { req }) => {
    return new Promise(async (resolve, reject) => {
      let user = await User.findOne({ mobileNumber: req.body.phoneNumber })
        .then((user) => {
          if (user) {
            reject(new Error("Mobile number is already in use"));
          }
          resolve(true);
        })  
        .catch((error) => {
          reject(new Error("Server Error", err));
        });
    });
  }),

  /////////////////////////////   Result Go through here   /////////////////////////////


  (req, res, next) => {
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      let err_msg = "";
      err_msg = errors.array();
      if (err_msg.length >= 1) {
        let err = err_msg[0].split(":")[1];
        return res.status(400).json({ status: false, message: err.trim(), response:[]});
      }
    } else {
      next();
    }
  },

  /////////////////////////////////////////////////////////////////////////////////
]