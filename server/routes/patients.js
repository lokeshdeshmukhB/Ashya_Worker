const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Patient = require('../models/Patient');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/patients
// @desc    Create a new patient record
// @access  Private (Asha Worker)
router.post('/', [
  protect,
  authorize('asha_worker'),
  body('fullName').notEmpty().withMessage('Patient name is required'),
  body('age').isInt({ min: 0 }).withMessage('Valid age is required'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('assignedDoctor').notEmpty().withMessage('Assigned doctor is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const patientData = {
      ...req.body,
      recordedBy: req.user.id
    };

    const patient = await Patient.create(patientData);
    
    // Populate references
    await patient.populate('recordedBy', 'name email phone');
    await patient.populate('assignedDoctor', 'name email phone specialization hospital');

    // Emit socket event to doctor
    const io = req.app.get('io');
    io.to(req.body.assignedDoctor).emit('new_patient', {
      message: 'New patient assigned to you',
      patient: patient
    });

    res.status(201).json({
      success: true,
      message: 'Patient record created successfully',
      data: patient
    });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating patient record', 
      error: error.message 
    });
  }
});

// @route   GET /api/patients
// @desc    Get all patients (filtered by role)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    
    // Filter based on role
    if (req.user.role === 'asha_worker') {
      query.recordedBy = req.user.id;
    } else if (req.user.role === 'doctor') {
      query.assignedDoctor = req.user.id;
    }

    // Additional filters
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    const patients = await Patient.find(query)
      .populate('recordedBy', 'name email phone workArea')
      .populate('assignedDoctor', 'name email phone specialization hospital')
      .populate('diagnosis')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching patients', 
      error: error.message 
    });
  }
});

// @route   GET /api/patients/:id
// @desc    Get single patient
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('recordedBy', 'name email phone workArea employeeId')
      .populate('assignedDoctor', 'name email phone specialization hospital licenseNumber')
      .populate({
        path: 'diagnosis',
        populate: { path: 'doctor', select: 'name email specialization' }
      });

    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    // Check authorization
    if (req.user.role === 'asha_worker' && patient.recordedBy._id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view this patient' 
      });
    }
    if (req.user.role === 'doctor' && patient.assignedDoctor._id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view this patient' 
      });
    }

    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching patient', 
      error: error.message 
    });
  }
});

// @route   PUT /api/patients/:id
// @desc    Update patient record
// @access  Private (Asha Worker - own records only)
router.put('/:id', protect, authorize('asha_worker'), async (req, res) => {
  try {
    let patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    // Check if user created this record
    if (patient.recordedBy.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this patient record' 
      });
    }

    patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('recordedBy', 'name email phone')
    .populate('assignedDoctor', 'name email phone specialization hospital');

    res.json({
      success: true,
      message: 'Patient record updated successfully',
      data: patient
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating patient record', 
      error: error.message 
    });
  }
});

// @route   PUT /api/patients/:id/status
// @desc    Update patient status
// @access  Private (Doctor)
router.put('/:id/status', protect, authorize('doctor'), async (req, res) => {
  try {
    const { status, priority } = req.body;

    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    if (patient.assignedDoctor.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this patient' 
      });
    }

    if (status) patient.status = status;
    if (priority) patient.priority = priority;

    await patient.save();

    // Emit socket event to Asha worker
    const io = req.app.get('io');
    io.to(patient.recordedBy.toString()).emit('patient_status_updated', {
      message: 'Patient status updated',
      patient: patient
    });

    res.json({
      success: true,
      message: 'Patient status updated successfully',
      data: patient
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating patient status', 
      error: error.message 
    });
  }
});

// @route   DELETE /api/patients/:id
// @desc    Delete patient record
// @access  Private (Asha Worker - own records only)
router.delete('/:id', protect, authorize('asha_worker'), async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    if (patient.recordedBy.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this patient record' 
      });
    }

    await patient.deleteOne();

    res.json({
      success: true,
      message: 'Patient record deleted successfully'
    });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting patient record', 
      error: error.message 
    });
  }
});

module.exports = router;
