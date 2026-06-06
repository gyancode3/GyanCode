const express = require('express');
const router = express.Router();
const Mentor = require('../models/Mentor');
const bcrypt = require('bcryptjs');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Create Mentor - admin only
router.post('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { loginId, name, email, password } = req.body;
    if (!loginId || !email || !password) {
      return res.status(400).json({ message: 'loginId, email and password are required' });
    }
    const existing = await Mentor.findOne({ $or: [{ loginId }, { email }] });
    if (existing) return res.status(409).json({ message: 'Mentor with given loginId or email already exists' });
    const passwordHash = await bcrypt.hash(password, 12);
    const mentor = new Mentor({ loginId, name, email, passwordHash, role: 'mentor' });
    await mentor.save();
    res.status(201).json({ message: 'Mentor created', mentor: { id: mentor._id, loginId, name, email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all mentors - admin only
router.get('/', authenticate, authorize(['admin']), async (req, res) => {
  const mentors = await Mentor.find().select('-passwordHash');
  res.json(mentors);
});

module.exports = router;
