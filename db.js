const mongoose = require("mongoose");

module.exports = () => {
  try {
    // Directly connect without deprecated options
    mongoose.connect(process.env.DB);
    console.log("Connected to database successfully");
  } catch (error) {
    console.log(error);
    console.log("Could not connect database!");
  }
};
