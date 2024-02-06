
// generate 6 digit otp. 
exports.generateOTP = (OTP_LENGTH = 6) => {
    let OTP = ''
    for (let i = 1; i <= OTP_LENGTH; i++) {
        // Math.random() * 9 // 4.4234234234
        let randomNumber = Math.round(Math.random() * 9) // 4
        OTP += randomNumber;
    }
    return OTP;
}
