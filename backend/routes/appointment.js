const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendMail } = require('../utils/mailer');
const path = require('path');

// Static doctor list for backend email (sync with frontend)
const doctors = [
  { _id: 'doc1', name: 'Dr. Richard James', image: '/uploads/doc1.png', speciality: 'General physician' },
  { _id: 'doc2', name: 'Dr. Emma Davis', image: '/uploads/doc2.png', speciality: 'Gynecologist' },
  { _id: 'doc3', name: 'Dr. Sarah Patel', image: '/uploads/doc3.png', speciality: 'Dermatologist' },
  // ... add all doctors here as in frontend assets.js
];

// Auth middleware
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

// Book appointment
router.post('/', auth, async (req, res) => {
  try {
    const { doctor, date, time } = req.body;
    // Prevent double booking for the same doctor/date/time globally
    const slotTaken = await Appointment.findOne({ doctor, date, time, status: 'booked' });
    if (slotTaken) return res.status(400).json({ msg: 'This slot is already booked. Please choose another.' });
    const appt = new Appointment({ user: req.user.id, doctor, date, time });
    await appt.save();

    // Send confirmation email to user
    try {
      const user = await User.findById(req.user.id);
      // Find doctor details
      const doc = doctors.find(d => d._id === doctor || d.name === doctor) || { name: doctor };
      const doctorImgUrl = doc.image ? `${process.env.BASE_URL || 'http://localhost:5000'}${doc.image}` : '';
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:400px;margin:auto;padding:16px;border-radius:12px;background:#f9f9f9;">
          <h2 style="color:#2d7be5;">Appointment Booked</h2>
          <p>Dear ${user.name},</p>
          <p>Your appointment has been <b>booked</b> and is <b>waiting for confirmation</b>.</p>
          <div style="margin:16px 0;text-align:center;">
            ${doctorImgUrl ? `<img src='${doctorImgUrl}' alt='Doctor' style='width:100px;height:100px;border-radius:50%;object-fit:cover;margin-bottom:8px;' />` : ''}
            <p style="margin:0;font-size:18px;"><b>${doc.name}</b></p>
            <p style="margin:0 0 8px 0;color:#888;">${doc.speciality || ''}</p>
            <p>Date: <b>${date}</b></p>
            <p>Time: <b>${time}</b></p>
          </div>
          <p style="color:#555;">Thank you for using our hospital appointment system.</p>
        </div>
      `;
      await sendMail({
        to: user.email,
        subject: 'Appointment Booked',
        html
      });
    } catch (e) {
      console.error('Failed to send appointment email:', e.message);
    }

    res.json({ msg: 'Appointment booked', appointment: appt });
  } catch (err) {
    res.status(500).json({ msg: 'Booking error', error: err.message });
  }
});

// List user's appointments
router.get('/', auth, async (req, res) => {
  try {
    const appts = await Appointment.find({ user: req.user.id });
    res.json(appts);
  } catch (err) {
    res.status(500).json({ msg: 'List error', error: err.message });
  }
});

// Cancel appointment
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const appt = await Appointment.findOne({ _id: req.params.id, user: req.user.id });
    if (!appt) return res.status(404).json({ msg: 'Appointment not found' });
    appt.status = 'cancelled';
    await appt.save();
    res.json({ msg: 'Appointment cancelled', appointment: appt });
  } catch (err) {
    res.status(500).json({ msg: 'Cancel error', error: err.message });
  }
});

// Get all booked slots for a doctor
router.get('/slots/:doctor', async (req, res) => {
  try {
    const { doctor } = req.params;
    const appts = await Appointment.find({ doctor, status: 'booked' });
    const slots = appts.map(a => ({ date: a.date, time: a.time }));
    res.json(slots);
  } catch (err) {
    res.status(500).json({ msg: 'Slot error', error: err.message });
  }
});

module.exports = router;
