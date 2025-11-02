const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { spawn } = require('child_process');
const Patient = require('../models/Patient');
const { protect } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/oral_cancer');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'oral-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// POST /api/oral-cancer/predict - Predict oral cancer from image
router.post('/predict', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file provided' });
    }

    // Use absolute path to model file
    const modelPath = path.resolve(__dirname, '../../oral_cancer_model_windows.pkl');
    const imagePath = req.file.path;
    
    // Verify model exists
    if (!fs.existsSync(modelPath)) {
      console.error('Model file not found at:', modelPath);
      return res.status(500).json({ 
        success: false, 
        error: 'ML model file not found on server',
        details: process.env.NODE_ENV === 'development' ? `Expected at: ${modelPath}` : undefined
      });
    }

    // Call Python script to make prediction
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../ml_predict.py'),
      modelPath,
      imagePath
    ]);

    let result = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error(`Python stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python process error:', errorOutput);
        return res.status(500).json({ 
          success: false, 
          error: 'Error processing image with ML model',
          details: process.env.NODE_ENV === 'development' ? errorOutput : undefined
        });
      }
      
      try {
        // Trim whitespace and extract JSON from output
        const trimmedResult = result.trim();
        console.log('Raw Python output:', trimmedResult);
        
        const prediction = JSON.parse(trimmedResult);
        
        if (prediction.error) {
          return res.status(500).json({ 
            success: false, 
            error: prediction.error 
          });
        }

        // Add image path to response
        prediction.image_path = `/uploads/oral_cancer/${path.basename(req.file.path)}`;
        
        res.json(prediction);
      } catch (e) {
        console.error('Error parsing prediction result:', e);
        console.error('Result string length:', result.length);
        console.error('First 200 chars:', result.substring(0, 200));
        res.status(500).json({ 
          success: false, 
          error: 'Error parsing prediction result',
          details: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
      }
    });

  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error processing your request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/oral-cancer/analyze-patient-image - Analyze a specific patient's image
router.post('/analyze-patient-image', protect, async (req, res) => {
  try {
    const { patientId, imageIndex } = req.body;

    if (!patientId || imageIndex === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'Patient ID and image index are required' 
      });
    }

    // Find patient
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    // Check if image exists
    if (!patient.mouthImages[imageIndex]) {
      return res.status(404).json({ success: false, error: 'Image not found' });
    }

    // Get image URL and convert to file path
    const imageUrl = patient.mouthImages[imageIndex].url;
    const imagePath = path.join(__dirname, '..', imageUrl.replace('/uploads/', 'uploads/'));

    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ success: false, error: 'Image file not found on server' });
    }

    // Use absolute path to model file
    const modelPath = path.resolve(__dirname, '../../oral_cancer_model_windows.pkl');
    
    // Verify model exists
    if (!fs.existsSync(modelPath)) {
      console.error('Model file not found at:', modelPath);
      return res.status(500).json({ 
        success: false, 
        error: 'ML model file not found on server',
        details: process.env.NODE_ENV === 'development' ? `Expected at: ${modelPath}` : undefined
      });
    }

    // Call Python script to make prediction
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../ml_predict.py'),
      modelPath,
      imagePath
    ]);

    let result = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error(`Python stderr: ${data}`);
    });

    pythonProcess.on('close', async (code) => {
      if (code !== 0) {
        console.error('Python process error:', errorOutput);
        return res.status(500).json({ 
          success: false, 
          error: 'Error processing image with ML model',
          details: process.env.NODE_ENV === 'development' ? errorOutput : undefined
        });
      }
      
      try {
        // Trim whitespace and extract JSON from output
        const trimmedResult = result.trim();
        console.log('Raw Python output:', trimmedResult);
        
        const predictionResult = JSON.parse(trimmedResult);
        
        if (predictionResult.error) {
          return res.status(500).json({ 
            success: false, 
            error: predictionResult.error 
          });
        }

        // Update patient record with AI prediction
        patient.mouthImages[imageIndex].aiPrediction = {
          isCancerous: predictionResult.prediction.is_cancerous,
          confidence: predictionResult.prediction.confidence,
          riskLevel: predictionResult.prediction.risk_level,
          analyzedAt: new Date(),
          analyzedBy: req.user.id
        };

        await patient.save();

        res.json({ 
          success: true, 
          prediction: predictionResult.prediction,
          message: 'Image analyzed and results saved to patient record'
        });
      } catch (e) {
        console.error('Error parsing prediction result:', e);
        console.error('Result string length:', result.length);
        console.error('First 200 chars:', result.substring(0, 200));
        res.status(500).json({ 
          success: false, 
          error: 'Error parsing prediction result',
          details: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
      }
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error processing your request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/oral-cancer/model-info - Get information about the model
router.get('/model-info', (req, res) => {
  try {
    // In a real implementation, you would get this from your model
    const modelInfo = {
      name: 'Oral Cancer Detection Model',
      version: '1.0.0',
      description: 'Deep learning model for detecting oral cancer from oral cavity images',
      accuracy: '92.5%',
      last_updated: '2023-11-02',
      input_requirements: {
        format: 'JPG, PNG',
        size: 'Up to 10MB',
        resolution: 'Minimum 224x224 pixels'
      }
    };
    
    res.json({ success: true, data: modelInfo });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error retrieving model information' });
  }
});

module.exports = router;
