const mongoose = require('mongoose');

const MentorSchema = new mongoose.Schema({
  loginId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Pending', 'Suspended'], default: 'Active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Mentor', MentorSchema);
