const Attendance = require('../models/Attendance');

const submitAttendance = async (req, res) => {
  const { name, email, latitude, longitude } = req.body;

  if (!name || !email || !latitude || !longitude) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const attendance = new Attendance({ name, email, latitude, longitude });
    await attendance.save();
    res.status(201).json({ message: 'Attendance submitted successfully!' });
  } catch (err) {
    console.error('Error saving attendance:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { submitAttendance };