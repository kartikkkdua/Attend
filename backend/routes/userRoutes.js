const express = require('express');
const router = express.Router();
const { submitAttendance } = require('../controllers/userController');

router.post('/submit', submitAttendance);

module.exports = router;