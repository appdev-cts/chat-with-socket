const mongoose = require('mongoose');

const tokenSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
          },
        token:{
            type: String,
            default:""
        },
        resetToken:{
          type:String,
          default:""
        },
        verificationToken:{
          type:String,
          default:""
        },
        createdAt: {
            type: Date,
            required: true,
          },
          expiresAtToken: {
            type: Date,
            // required: true,
          },
          expiresAtReset: {
            type: Date,
            // required: true,
          },
          expiresAtVerification: {
            type: Date,
            // required: true,
          }
    }
);

module.exports = mongoose.model('Token',tokenSchema)