const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/doctors
// @desc    Get all doctors
// @access  Private (Asha Worker)
router.get('/', protect, authorize('asha_worker'), async (req, res) => {
  try {
    const doctors = await User.find({ 
      role: 'doctor', 
      isActive: true 
    }).select('-password');

    res.json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching doctors', 
      error: error.message 
    });
  }
});

// @route   GET /api/doctors/:id
// @desc    Get single doctor
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const doctor = await User.findOne({ 
      _id: req.params.id, 
      role: 'doctor' 
    }).select('-password');

    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Doctor not found' 
      });
    }

    res.json({
      success: true,
      data: doctor
    });
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching doctor', 
      error: error.message 
    });
  }
});

module.exports = router;
