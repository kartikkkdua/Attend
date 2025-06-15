const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const moment = require('moment');

const app = express();

// Enable CORS for all routes and handle preflight requests
const corsOptions = {
  origin: 'http://localhost:3000', // frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // to handle preflight requests

// Parse JSON request bodies
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/attendance', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Attendance Schema
const attendanceSchema = new mongoose.Schema({
  name: String,
  email: String,
  sapId: String,
  course: String,
  batchYear: String,
  latitude: Number,
  longitude: Number,
  timestamp: {
    type: String,
    default: () => moment().format('YYYY-MM-DD HH:mm:ss'),
  },
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

// UPES coordinates (customize as needed)
const eventLocation = {
  latitude: 30.4022,
  longitude: 78.1288,
};

// Radius validation (Haversine formula)
const isWithinRadius = (userLat, userLng, targetLat, targetLng, radiusInMeters = 200) => {
  const toRad = deg => deg * Math.PI / 180;
  const R = 6371e3; // meters
  const φ1 = toRad(userLat);
  const φ2 = toRad(targetLat);
  const Δφ = toRad(targetLat - userLat);
  const Δλ = toRad(targetLng - userLng);

  const a = Math.sin(Δφ / 2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance <= radiusInMeters;
};

// Attendance Submission API
app.post('/submit', async (req, res) => {
  const { name, email, sapId, course, batchYear, latitude, longitude } = req.body;

  // Location radius check
  if (!isWithinRadius(latitude, longitude, eventLocation.latitude, eventLocation.longitude)) {
    return res.status(403).json({ message: '❌ You are not within the allowed location radius.' });
  }

  try {
    const newEntry = new Attendance({ name, email, sapId, course, batchYear, latitude, longitude });
    await newEntry.save();
    res.json({ message: '✅ Attendance saved successfully!' });
  } catch (err) {
    console.error('❌ Error saving attendance:', err);
    res.status(500).json({ message: '❌ Server error. Please try again later.' });
  }
});

// Basic test endpoint (optional)
app.get('/', (req, res) => {
  res.send('🚀 Geo Attendance API is working!');
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});