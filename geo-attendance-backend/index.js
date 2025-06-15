const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const moment = require('moment');

const app = express();

// Enable CORS for all routes
app.use(cors());
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
    timestamp: { type: String, default: () => moment().format('YYYY-MM-DD HH:mm:ss') },
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

// Attendance Submission API
app.post('/submit', async (req, res) => {
    const { name, email, sapId, course, batchYear, latitude, longitude } = req.body;

    if (!latitude || !longitude) {
        return res.status(400).json({ message: '❌ Location data (latitude and longitude) is required.' });
    }

    try {
        const newEntry = new Attendance({
            name,
            email,
            sapId,
            course,
            batchYear,
            latitude,
            longitude,
        });
        await newEntry.save();
        res.json({ message: '✅ Attendance saved successfully!' });
    } catch (err) {
        console.error('❌ Error saving attendance:', err);
        res.status(500).json({ message: '❌ Server error. Please try again later.' });
    }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});