const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  _id: { type: String },
  name: { type: String, required: true },
  image: { type: String, required: true },
  speciality: { type: String, required: true },
  degree: { type: String },
  experience: { type: String },
  about: { type: String },
  fees: { type: Number },
  address: {
    line1: { type: String, default: '' },
    line2: { type: String, default: '' }
  }
});

module.exports = mongoose.model('Doctor', doctorSchema);
