const { sendOTP, verifyOTP } = require('../controllers/twilio.controller');
const { mobileNumberValidation } = require('../middleware/validator.middleware');

const router = require('express').Router()


router.route('/send-otp').post(mobileNumberValidation,sendOTP)
router.route('/verify-otp').post(mobileNumberValidation,verifyOTP)

module.exports = router;