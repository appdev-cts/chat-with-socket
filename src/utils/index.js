const jwt = require("jsonwebtoken");
const axios = require("axios");
const crypto = require("crypto");
const nodemailer = require('nodemailer');


exports.generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

exports.getCoordinates = async (address) => {
  console.log(address);
 
  try {
    const response = await axios(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);

    if (response.data.length > 0) {
      const coordinates = {
        latitude: parseFloat(response.data[0].lat),
        longitude: parseFloat(response.data[0].lon),
      };
      return coordinates; 
    } else {
      throw new Error('No coordinates found for the address');
    }
  } catch (error) {
    throw error;
  }
};


// hash token
exports.hashToken=(token)=>{
  return crypto.createHash('sha256').update(token.toString()).digest('hex')
}

// deg 2 rad 
exports.deg2rad = (deg) => {
  return deg * (Math.PI / 180);
}


exports.sendError = (res, error,status=false, statusCode = 401) => {
  res.status(statusCode).json({ status,error,response:[{}] })
}


exports.emailTransporter = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: process.env.MAIL_TRAP_USER,
    pass: process.env.MAIL_TRAP_PASS,
  },
});