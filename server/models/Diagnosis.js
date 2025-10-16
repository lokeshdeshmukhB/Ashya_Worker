const mongoose = require('mongoose');

const diagnosisSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  diagnosisResult: {
    type: String,
    enum: ['negative', 'suspicious', 'positive', 'requires_biopsy'],
    required: true
  },
  findings: {
    type: String,
    required: true
  },
  recommendations: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['none', 'mild', 'moderate', 'severe'],
    default: 'none'
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  treatmentPlan: {
    type: String
  },
  referralRequired: {
    type: Boolean,
    default: false
  },
  referralDetails: {
    hospital: String,
    specialist: String,
    reason: String
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

diagnosisSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Diagnosis', diagnosisSchema);
