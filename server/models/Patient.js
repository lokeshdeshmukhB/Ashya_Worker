const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  // Personal Information
  fullName: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: 0
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  alternatePhone: {
    type: String
  },
  address: {
    street: String,
    village: String,
    district: String,
    state: String,
    pincode: String
  },
  
  // Medical Information
  tobaccoUse: {
    type: String,
    enum: ['none', 'smoking', 'chewing', 'both'],
    default: 'none'
  },
  tobaccoDuration: {
    type: String // e.g., "5 years", "10 years"
  },
  alcoholConsumption: {
    type: String,
    enum: ['none', 'occasional', 'regular', 'heavy'],
    default: 'none'
  },
  symptoms: [{
    type: String
  }],
  medicalHistory: {
    type: String
  },
  
  // Oral Examination
  mouthImages: [{
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    description: String,
    aiPrediction: {
      isCancerous: Boolean,
      confidence: Number,
      riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high']
      },
      analyzedAt: Date,
      analyzedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  }],
  oralExaminationNotes: {
    type: String
  },
  
  // System Information
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'diagnosed', 'follow_up_required'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Diagnosis
  diagnosis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Diagnosis'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
patientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Patient', patientSchema);
