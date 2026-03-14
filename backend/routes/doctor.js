const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const docs = await Doctor.find();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching doctors', error: err.message });
  }
});

// Get doctor by id
router.get('/:id', async (req, res) => {
  try {
    const doc = await Doctor.findById(req.params.id);
    if (!doc) return res.status(404).json({ msg: 'Doctor not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching doctor', error: err.message });
  }
});

module.exports = router;
