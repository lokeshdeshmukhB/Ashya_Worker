const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/asha-workers
// @desc    Get all Asha workers
// @access  Private (Doctor)
router.get('/', protect, authorize('doctor'), async (req, res) => {
  try {
    const ashaWorkers = await User.find({ 
      role: 'asha_worker', 
      isActive: true 
    }).select('-password');

    res.json({
      success: true,
      count: ashaWorkers.length,
      data: ashaWorkers
    });
  } catch (error) {
    console.error('Get Asha workers error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching Asha workers', 
      error: error.message 
    });
  }
});

module.exports = router;
