const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, default: "" }, // profile picture
  phone: { type: String, default: "" },
  address: {
    line1: { type: String, default: "" },
    line2: { type: String, default: "" }
  },
  gender: { type: String, default: "Male" },
  dob: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
