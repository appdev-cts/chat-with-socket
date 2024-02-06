const {TWILIO_ACCOUNT_SID,TWILIO_AUTH_TOKEN,TWILIO_SERVICE_SID} = process.env
const client = require('twilio')(TWILIO_ACCOUNT_SID,TWILIO_AUTH_TOKEN,TWILIO_SERVICE_SID,{
    lazyLoading: true,
})

// sendOTP 
exports.sendOTP = async(req,res)=>{
    const {countryCode , phoneNumber} = req.body;
    try{
        const otpResponse = await client.verify
        .v2.services(TWILIO_SERVICE_SID)
        .verifications.create({
            to:`+${countryCode}${phoneNumber}`,
            channel:'sms'
        });
        res
        .status(200) 
        .json({success: true,message: `OTP send successfully`,response:[]})

    }catch(error){
        res
        .status(error?.status || 400) 
        .json({success: false,message: error.message || "Something went wrong while sending otp",response:[]})
    }
} 


// verifyOTP 
exports.verifyOTP = async(req,res)=>{
    const {countryCode , phoneNumber,otp} = req.body;

    try{
        const verifiedResponse = await client.verify
        .v2.services(TWILIO_SERVICE_SID)
        .verificationChecks.create({
            to:`+${countryCode}${phoneNumber}`,
            code:otp,
        });
        res
        .status(200) 
        .json({success: true,message: `OTP verified successfully`,response:[]})

    }catch(error){
        res
        .status(error?.status || 400) 
        .json({success: false,message: error.message || "Something went wrong while verified OTP",response:[]})
    }
} 
//////////////////////////////////////////////////////////////////////////////////////////////////////////////