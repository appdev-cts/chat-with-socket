const { check, validationResult } = require("express-validator");
const User = require("../models/user");
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
    return `${param}: ${msg}`;
};

exports.signupValidate = [
    //////////////////Name //////////////////////////
    check("firstName", "Please enter firstName field.")
        .not()
        .isEmpty()
        // check("name")
        .isAlpha()
        .withMessage("please enter valid firstName.")
        .isLength({ min: 3 })
        .withMessage("Name must be of 3 characters long."),
    check("lastName")
        .isAlpha()
        .withMessage("please enter valid lastName."),
    ////////////////////Email/////////////////////////////
    check("email", "Please include a EMAIL")
        .not()
        .isEmpty()
        .withMessage("Email is field requied.")
        .isEmail()
        .matches(/^\w+([\.]?\w+)*@\w+([\.]?\w+)*(\.\w{2,3})+$/)
        // .normalizeEmail()
        .withMessage("Please add valid email.")
        .custom((value, { req }) => {
            return new Promise((resolve, reject) => {
                let user = User.findOne({ email: req.body.email.toLowerCase() }).then((user) => {
                    if (user) {
                        reject(new Error("E-mail already in use"));
                    }
                    resolve(true);
                }).catch((err) => {
                    reject(new Error("Server Error"));
                })
            });
        }),
    ////////////////////Password/////////////////////////////
    check("password")
        .not()
        .isEmpty()
        .withMessage("Password is field requied.")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long"),
    // .custom(password => {
    //     if (password && password.match(/^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/)) {
    //         return true;
    //     }
    // }).withMessage("Password must be at least 8 characters long with at least a symbol, upper and lower case letters and a number"),
    ////////////////---------throw result here-------////////////////////
    (req, res, next) => {
        const errors = validationResult(req).formatWith(errorFormatter);
        if (!errors.isEmpty()) {
            let errmsg = '';
            errmsg = errors.array();
            if (errmsg.length >= 1) {
                let err = errmsg[0].split(":")[1]
                return res.status(400).json({ "status": false, "message": err.trim() });
            }
        } else {
            next();
        }
    }
]

exports.loginValidate = [
    ////////////////////Email/////////////////////////////
    check("email", "Please include a EMAIL")
        .not()
        .isEmpty()
        .withMessage("email is field requied.")
        .isEmail()
        .withMessage("Please add email.")
        .custom((value, { req }) => {
            return new Promise((resolve, reject) => {
                let user = User.findOne({ email: req.body.email.toLowerCase() }).then((user) => {
                    if (!user) {
                        reject(new Error("Please enter valid credential"));
                    }
                    resolve(true);
                }).catch((err) => {
                    reject(new Error("Server Error"));
                })
            });
        }),
    ////////////////////Password/////////////////////////////
    check("password")
        .not()
        .isEmpty()
        .withMessage("Please add password."),
    //////////////////////----throw result here-------///////////////////////
    (req, res, next) => {
        const errors = validationResult(req).formatWith(errorFormatter);
        if (!errors.isEmpty()) {
            let errmsg = '';
            errmsg = errors.array();
            if (errmsg.length >= 1) {
                let err = errmsg[0].split(":")[1]
                return res.status(400).json({ "status": false, "message": err.trim() });
            }
        } else {
            next();
        }
    }
]

exports.updateValidate = [
    check("firstName", "Please enter firstName field.")
        .not()
        .isEmpty()
        .isAlpha()
        .withMessage("Do you have number in your name ?")
        .isLength({ min: 3 })
        .withMessage("Name must be of 3 characters long."),
    //////////////////////----throw result here-------///////////////////////
    (req, res, next) => {
        const errors = validationResult(req).formatWith(errorFormatter);
        if (!errors.isEmpty()) {
            let errmsg = '';
            errmsg = errors.array();
            if (errmsg.length >= 1) {
                let err = errmsg[0].split(":")[1]
                return res.status(400).json({ "status": false, "message": err.trim() });
            }
        } else {
            next();
        }
    }
]

exports.resetValidate = [
    check("newPassword")
        .not()
        .isEmpty()
        .withMessage("New Password is field requied.")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long"),
    //////////////////////----throw result here-------///////////////////////
    (req, res, next) => {
        const errors = validationResult(req).formatWith(errorFormatter);
        if (!errors.isEmpty()) {
            let errmsg = '';
            errmsg = errors.array();
            if (errmsg.length >= 1) {
                let err = errmsg[0].split(":")[1]
                return res.status(400).json({ "status": false, "message": err.trim() });
            }
        } else {
            next();
        }
    }
]