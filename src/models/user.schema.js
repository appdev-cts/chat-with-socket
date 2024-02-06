  const mongoose = require("mongoose");
  const bcrypt = require("bcryptjs");

  const userSchema = mongoose.Schema(
    {
      email: {
        type: String,
        required: [true, "Please enter a email"],
        unique: true,
        trim: true,
      },
      username:{
        type:String,
        required:[true,"Please enter username"],
        unique: true,
        trim: true,
      },
      password: {
        type: String,
        required: [true, "Please enter a password"],
      },
      mobileNumber: {
        type: String,
        required: [true, "Please enter a mobile number"],
        default: "+91",
        unique: true,
        trim: true,
      },
      avatar: {
        type: String,
        default: "https://i.ibb.co/4pDNDk1/avatar.png",
      },
      gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
      },
      hobbies: {
        type: [String],
        default: [],
      },
      currentAddress: String,
      permanentAddress: String,
      aadharCard: {
        type:String,
        default: "",
      },
      distance: {
        type: Object,
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
      role:{
        type:String,
        enum:['user','admin','suspended'],
        default:"user"
      },
      // Location field for geospatial queries
      location: {
          type: {
              type: String,
              enum: ['Point'],
              default: 'Point',
          },
          coordinates: {
              type: [Number],
              default: [0, 0],
          },
      },
  

    },
    {
      timestamps: true,
    }
  );

  //hashed password
  userSchema.pre("save", async function (next) {
    // if not modified no need to hash password
    if (!this.isModified("password")) {
      return next();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  });

  // compare password
  userSchema.methods.comparePassword = async function (password) {
    const result = await bcrypt.compare(password, this.password);
    return result;
  };


  userSchema.index({ location: '2dsphere' });

  module.exports = mongoose.model("User", userSchema);


