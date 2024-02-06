const asyncHandler = require("express-async-handler");
const User = require("../models/user.schema");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const ytdl = require('ytdl-core')
const { promisify } = require('util');
const http = require('http'); // or 'https' for https:// URLs
const fs = require('fs')
const sanitize = require('sanitize-filename');
const { uploadOnCloudinary } = require("../config/cloudinary.config");
const axios = require('axios')

const unlinkAsync = promisify(fs.unlink);

const downloadVideo = async (videoUrl, inputPath) => {
  const response = await axios.get(videoUrl, { responseType: 'stream' });
  const videoWriteStream = fs.createWriteStream(inputPath);
  response.data.pipe(videoWriteStream);
  return new Promise((resolve, reject) => {
    videoWriteStream.on('finish', resolve);
    videoWriteStream.on('error', reject);
  });
};


// Get | adminOnly |  /api/v1/upgradeRole
exports.upgradeRole = asyncHandler(async (req, res) => {
  const { role, userId, username, email } = req.body;

  const user = await User.findOne({
    $or: [{ username }, { email }, { _id: userId }],
  });

  if (!(username || email || userId) && !role) {
    res.status(400).json({
      success: false,
      message:
        "Please enter at least one of them (username, email, or id) and role",
      response: [],
    });
  }

  if (!user) {
    res
      .status(404)
      .json({ success: false, message: "User not found", response: [] });
  }
  //change role and save in db
  user.role = role;
  await user.save();

  res.status(200).json({
    sucess: true,
    message: `User role updated to ${role}`,
  });
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////

// delete  | deleteUser | /api/v1/delete-user/:id
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = User.findById(req.params.id);
  if (!user) {
    res
      .status(404)
      .json({ success: false, message: "User not found", response: [] });
  }
  await user.deleteOne();
  res.status(200).json({
    success: true,
    message: "User deleted successfully",
    response: [],
  });
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////

// delete | deleteOwnProfile | /api/v1/delete-own-profile
exports.deleteOwnProfile = asyncHandler(async (req, res) => {
  const user = User.findOne(req.user);
  if (!user) {
    res
      .status(404)
      .json({ success: false, message: "User not found", response: [] });
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User profile delete sccessfully",
    response: [],
  });
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Get | filterUser | /api/v1/filter-user
exports.filterUser = asyncHandler(async (req, res) => {
  let {
    username,
    role,
    hobbies,
    gender,
    latitude,
    longitude,
    distance,
    search,
    page,
    sort,
    limit,
  } = req?.query;

  let pipeline = [];

  // Count the total number of users without pagination
  const totalCountPipeline = [...pipeline];
  totalCountPipeline.push({ $count: "total" });
  const totalCountResult = await User.aggregate(totalCountPipeline);

  // Extract the total count
  const totalCount =
    totalCountResult.length > 0 ? totalCountResult[0].total : 0;

  // find near by user
  if (latitude && longitude && distance) {
    // Parse latitude, longitude, and distance as numbers
    latitude = parseFloat(latitude);
    longitude = parseFloat(longitude);
    distance = parseFloat(distance);

    // Add geospatial query to find nearby users
    pipeline.push(
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          distanceField: "distanceInMeters",
          spherical: true,
        },
      },
      {
        $addFields: {
          distance: {
            $concat: [
              {
                $toString: {
                  $round: [{ $divide: ["$distanceInMeters", 1000] }, 2],
                },
              },
              " km",
            ],
          },
        },
      },
      { $match: { distanceInMeters: { $lte: distance * 1000 } } }
    );
  }

  // Search based on name (case-insensitive)
  if (search) {
    const result = {
      $or: [
        { username: { $regex: new RegExp(search, "i") } },
        { email: { $regex: new RegExp(search, "i") } },
        { gender: { $regex: new RegExp(`^${search}$`, "i") } },
      ],
    };

    pipeline.push({ $match: result });
  }

  // sort based on name
  if (sort) {
    const sortOrder = sort.toLowerCase() === "asc" ? 1 : -1;
    switch (sort) {
      case "username":
        pipeline.push({ $sort: { username: sortOrder } });
        break;
      case "email":
        pipeline.push({ $sort: { email: sortOrder } });
        break;
      case "verified":
        pipeline.push({ $sort: { isVerified: sortOrder } });
        break;
      case "not_verified":
        pipeline.push({ $sort: { isVerified: sortOrder } });
        break;
      case "mobile_number":
        pipeline.push({ $sort: { mobileNumber: sortOrder } });
        break;
      default:
        // Default sorting, e.g., based on username
        pipeline.push({ $sort: { username: sortOrder } });
    }
  }

  if (username) {
    pipeline.push({
      $match: {
        username: {
          $regex: new RegExp(username, "i"),
        },
      },
    });
  }

  if (role) {
    pipeline.push({
      $match: {
        role: {
          $regex: new RegExp(role, "i"),
        },
      },
    });
  }

  if (hobbies) {
    pipeline.push({
      $match: {
        hobbies: {
          $regex: new RegExp(hobbies, "i"),
        },
      },
    });
  }

  if (gender) {
    pipeline.push({
      $match: {
        gender: {
          $regex: new RegExp(`^${gender}$`, "i"),
        },
      },
    });
  }

  // Pagination
  let startIndex = 0;
  let endIndex = 0;

  if (page && limit) {
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);

    if (!isNaN(parsedPage) && !isNaN(parsedLimit)) {
      startIndex = (parsedPage - 1) * parsedLimit;
      endIndex = parsedPage * parsedLimit;
    }
  }

  pipeline.push({ $skip: startIndex });

  if (limit && limit !== "All") {
    pipeline.push({ $limit: parseInt(limit) });
  }


  // fetch all user data
  if (pipeline.length === 0) {
    pipeline.push({ $match: {} });
  }

  const result = await User.aggregate(pipeline);
  if (result.length === 0) {
    res.status(200).json({
      success: false,
      message: "No users found matching the search criteria",
      response: [{}],
    });
  } else {
    let totalPages = 1;
    if (result.length >= 5 || page > 1) {
      totalPages = Math.max(1, Math.ceil(totalCount / parseInt(limit)));
    }

    res.status(200).json({
      success: true,
      message: `${result.length} user(s) found successfully`,
      response: result,
      totalPages: totalPages,
    });
  }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Patch | UploadVideo | /api/v1/video-upload
exports.uploadVideoLocal = asyncHandler(async (req, res) => {
  const videoLocalPath = req.files?.video[0].path;
  const thumbnail = req.files.thumbnail[0].originalname;

  if (!videoLocalPath) {
    return res
      .status(400)
      .json({ success: false, message: "No video upload", response: [] });
  }

  const originalFileName = req.files?.video[0].originalname;

  const timestamps = Date.now();

  ffmpeg({ source: videoLocalPath })
    .on("filenames", (generatedFilenames) => {
      console.log(`created files name ${generatedFilenames}`);
    })
    .on("end", () => {
      console.log("Finished processing");
      return res.status(200).json({
        success: true,
        message:
          "Video uploaded successfully. Thumbnail generated at 2 and 5 seconds.",
        response: [
          {
            video: originalFileName,
            thumbnail,
          },
        ],
      });
    })
    .on("error", (err) => {
      console.log(err);
      return res.status(400).json({
        success: false,
        message: "Something went wrong while generate thumbnail",
        response: [],
      });
    })
    .takeScreenshots(
      {
        filename: `${originalFileName}_${timestamps}_%i.png`,
        timemarks: [2, 5],
      },
      "images"
    );
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////

// POST | add new user | /api/v1/add-new-user
exports.addNewUser = asyncHandler(async (req, res) => {
  const { email, password, username, mobileNumber } = req.body;

  const user = await User.create({
    email,
    password,
    mobileNumber,
    username,
    isVerified: true,
  });

  res
    .status(201)
    .json({ message: "User created successfully", resposne: [{ user }] });
});

// GET | GET user details | /api/v1/get-user-details/:id
exports.getUserDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res
      .status(404)
      .json({ success: false, message: "User not found", response: [] });
  }


  res.status(200).json({
    success: true,
    message: "User Found successfully",
    response: [{ user }],
  });
})

// Patch | Patch user details | /api/v1/update-user-details/:id
exports.updateUserDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res
      .status(404)
      .json({ success: false, message: "User not found", response: [] });
  }

  try {
    let {
      avatar,
      gender,
      hobbies,
      currentAddress,
      permanentAddress,
      aadharCard,
      latitude,
      longitude,
    } = user;


    // Upload image to Cloudinary
    let avatarCloud = null;
    if (req.files && req.files.avatar && req.files.avatar[0]) {
      avatarCloud = await uploadOnCloudinary(req.files.avatar[0].path);
    }
    avatarCloud = avatarCloud || { url: avatar }; // Use default if no new image provided

    // Upload Aadhar card to Cloudinary
    let aadharCardCloud = null;
    if (req.files && req.files.aadharCard && req.files.aadharCard[0]) {
      aadharCardCloud = await uploadOnCloudinary(req.files.aadharCard[0].path);
    }
    aadharCardCloud = aadharCardCloud || { url: aadharCard }; // Use default if no new Aadhar card provided

    const hobbiesArray = typeof req?.body?.hobbies === 'string' ? req?.body?.hobbies.split(",").map((hobby) => hobby.trim()) : user.hobbies;

    // Update user data
    user.avatar = avatarCloud.url;
    user.gender = req.body.gender || gender;
    user.currentAddress = req.body.currentAddress || currentAddress;
    user.permanentAddress = req.body.permanentAddress || permanentAddress;
    user.aadharCard = aadharCardCloud.url;
    user.hobbies = hobbiesArray;
    user.role = req.body.role
    // long and lant

    // Update latitude and longitude if provided in the request
    user.latitude = parseFloat(req.body.latitude) || latitude;
    user.longitude = parseFloat(req.body.longitude) || longitude;


    if (!isNaN(user.latitude) && !isNaN(user.longitude)) {
      user.latitude = Math.min(90, Math.max(-90, user.latitude));
      user.longitude = Math.min(180, Math.max(-180, user.longitude));
      user.location = {
        type: "Point",
        coordinates: [user.longitude, user.latitude],
      };
    }



    // Save updated user
    const updatedUser = await user.save();

    const userWithoutPassword = { ...updatedUser.toObject() };
    delete userWithoutPassword.password;

    // Sending response
    res.status(200).json({
      status: true,
      message: "Update user profile successfully",
      response: [{ user: userWithoutPassword }],
    });
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      response: [],
    });
  }

})
////////////////////////////////////////////////////////////////////////////////////////////////////////////


exports.convert = async (req, res) => {
  try {
    const { videoUrl } = req.body;
    if (!videoUrl) {
      return res.status(400).json({ success: false, message: 'Video URL is required.', response: [] });
    }
    let videoReadableStream;
    let videoId;
    const publicPath = path.join(__dirname,"../../public")
    const mp4Regex = /\.mp4$/i;

    if (ytdl.validateURL(videoUrl)) {
      videoId = ytdl.getVideoID(videoUrl);
      videoReadableStream = ytdl(videoId, { filter: 'audioonly' });
    } else if (mp4Regex.test(videoUrl)) {
      const response = await axios.get(videoUrl, { responseType: 'stream' });
      videoReadableStream = response.data;
      videoId = 'non-youtube-video';
    } else {
      return res.status(400).json({ success: false, message: 'Only MP4 video URLs and YouTube URLs are accepted.', response: [] });
    }

    const sanitizedFileName = sanitize(`${Date.now()}_${videoId}.mp3`);
    const sanitizedFileNameWithoutSpecialChars = sanitizedFileName.replace(/[^a-zA-Z0-9.]/g, "_");
    const inputPath = path.join(publicPath, 'downloads', sanitizedFileNameWithoutSpecialChars);

    const outputPath = path.join(publicPath, 'output', sanitizedFileNameWithoutSpecialChars);
    const videoWriteStream = fs.createWriteStream(inputPath);

    videoReadableStream.pipe(videoWriteStream);
    videoWriteStream.on('finish', async () => {
      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(inputPath)
          .audioCodec('libmp3lame')
          .toFormat('mp3')
          .on('end', resolve)
          .on('error', reject)
          .save(outputPath);
      });
      const cloudinaryUploadResult = await uploadOnCloudinary(outputPath);

      fs.unlinkSync(inputPath);
      
      res.json({
        success: true, message: 'Successfully convert video to mp3 audio',
        response: [{
          audioUrl: cloudinaryUploadResult.secure_url
        }]
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' , response:[] });
  }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////

