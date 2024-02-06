const mongoose = require("mongoose");
const MONGO_URL = process.env.MONGO_URI;

;(async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Database connected!");
  } catch (error) {
    console.error(error);
    console.log("Something went wrong at database level");
    throw error;
    // process.exit(1) // exit from mongodb
  }
})();

module.exports = mongoose;
