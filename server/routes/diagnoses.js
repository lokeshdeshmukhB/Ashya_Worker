const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Diagnosis = require('../models/Diagnosis');
const Patient = require('../models/Patient');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/diagnoses
// @desc    Create a diagnosis for a patient
// @access  Private (Doctor)
router.post('/', [
  protect,
  authorize('doctor'),
  body('patient').notEmpty().withMessage('Patient ID is required'),
  body('diagnosisResult').isIn(['negative', 'suspicious', 'positive', 'requires_biopsy']).withMessage('Valid diagnosis result is required'),
  body('findings').notEmpty().withMessage('Findings are required'),
  body('recommendations').notEmpty().withMessage('Recommendations are required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const patient = await Patient.findById(req.body.patient);

    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    // Check if doctor is assigned to this patient
    if (patient.assignedDoctor.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to diagnose this patient' 
      });
    }

    const diagnosisData = {
      ...req.body,
      doctor: req.user.id
    };

    const diagnosis = await Diagnosis.create(diagnosisData);

    // Update patient with diagnosis and status
    patient.diagnosis = diagnosis._id;
    patient.status = 'diagnosed';
    await patient.save();

    await diagnosis.populate('doctor', 'name email specialization hospital');
    await diagnosis.populate('patient', 'fullName age gender phone');

    // Emit socket event to Asha worker
    const io = req.app.get('io');
    io.to(patient.recordedBy.toString()).emit('diagnosis_completed', {
      message: 'Diagnosis completed for patient',
      diagnosis: diagnosis,
      patient: patient
    });

    res.status(201).json({
      success: true,
      message: 'Diagnosis created successfully',
      data: diagnosis
    });
  } catch (error) {
    console.error('Create diagnosis error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating diagnosis', 
      error: error.message 
    });
  }
});

// @route   GET /api/diagnoses/patient/:patientId
// @desc    Get diagnosis for a patient
// @access  Private
router.get('/patient/:patientId', protect, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId);

    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    // Check authorization
    if (req.user.role === 'asha_worker' && patient.recordedBy.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view this diagnosis' 
      });
    }
    if (req.user.role === 'doctor' && patient.assignedDoctor.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view this diagnosis' 
      });
    }

    const diagnosis = await Diagnosis.findOne({ patient: req.params.patientId })
      .populate('doctor', 'name email specialization hospital phone')
      .populate('patient', 'fullName age gender phone address');

    if (!diagnosis) {
      return res.status(404).json({ 
        success: false, 
        message: 'Diagnosis not found for this patient' 
      });
    }

    res.json({
      success: true,
      data: diagnosis
    });
  } catch (error) {
    console.error('Get diagnosis error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching diagnosis', 
      error: error.message 
    });
  }
});

// @route   PUT /api/diagnoses/:id
// @desc    Update a diagnosis
// @access  Private (Doctor who created it)
router.put('/:id', protect, authorize('doctor'), async (req, res) => {
  try {
    let diagnosis = await Diagnosis.findById(req.params.id);

    if (!diagnosis) {
      return res.status(404).json({ 
        success: false, 
        message: 'Diagnosis not found' 
      });
    }

    // Check if doctor created this diagnosis
    if (diagnosis.doctor.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this diagnosis' 
      });
    }

    diagnosis = await Diagnosis.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('doctor', 'name email specialization hospital')
    .populate('patient', 'fullName age gender phone');

    // Emit socket event to Asha worker
    const patient = await Patient.findById(diagnosis.patient._id);
    const io = req.app.get('io');
    io.to(patient.recordedBy.toString()).emit('diagnosis_updated', {
      message: 'Diagnosis updated',
      diagnosis: diagnosis
    });

    res.json({
      success: true,
      message: 'Diagnosis updated successfully',
      data: diagnosis
    });
  } catch (error) {
    console.error('Update diagnosis error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating diagnosis', 
      error: error.message 
    });
  }
});

// @route   GET /api/diagnoses/stats
// @desc    Get diagnosis statistics
// @access  Private (Doctor)
router.get('/stats/summary', protect, authorize('doctor'), async (req, res) => {
  try {
    const stats = await Diagnosis.aggregate([
      { $match: { doctor: req.user._id } },
      {
        $group: {
          _id: '$diagnosisResult',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Diagnosis.countDocuments({ doctor: req.user._id });

    res.json({
      success: true,
      data: {
        total,
        breakdown: stats
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching statistics', 
      error: error.message 
    });
  }
});

module.exports = router;
