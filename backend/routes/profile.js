const express = require('express');
const router = express.Router();
const multer = require('multer');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// Set up multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// Middleware to get user from token
const jwt = require('jsonwebtoken');
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ msg: 'Invalid token' });
  }
};

// Upload profile image
router.post('/image', auth, upload.single('image'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    user.image = `/uploads/${req.file.filename}`;
    await user.save();
    res.json({ msg: 'Image uploaded', image: user.image });
  } catch (err) {
    res.status(500).json({ msg: 'Upload error', error: err.message });
  }
});

// Get profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Profile error', error: err.message });
  }
});

// Update profile (except email)
router.put('/', auth, async (req, res) => {
  try {
    const { name, phone, address, gender, dob } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (gender) user.gender = gender;
    if (dob) user.dob = dob;
    await user.save();
    res.json({ msg: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ msg: 'Update error', error: err.message });
  }
});

module.exports = router;
