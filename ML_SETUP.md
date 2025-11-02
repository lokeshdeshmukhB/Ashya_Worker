# ML Model Integration Setup Guide

## Overview
This guide explains how to set up the oral cancer detection ML model integration with your MERN application.

## Prerequisites

### Python Requirements
1. **Python 3.7 or higher** must be installed on your system
2. Required Python packages:
   - numpy
   - Pillow (PIL)
   - scikit-learn (if your model uses sklearn)
   - pickle (built-in)

### Installation Steps

#### 1. Install Python (if not already installed)
- Download from: https://www.python.org/downloads/
- During installation, make sure to check "Add Python to PATH"

#### 2. Install Required Python Packages
Open a terminal/command prompt and run:

```bash
pip install numpy Pillow scikit-learn
```

Or create a requirements.txt file:
```bash
cd E:\mernstack\Asha_project\server
pip install -r requirements.txt
```

Create `requirements.txt` with:
```
numpy>=1.19.0
Pillow>=8.0.0
scikit-learn>=0.24.0
```

#### 3. Verify ML Model File
Ensure the model file exists at:
```
E:\mernstack\Asha_project\oral_cancer_classifier.pkl
```

## How It Works

### Architecture
1. **Frontend (React)**: 
   - Doctors can upload images or analyze existing patient images
   - `OralCancerDetection.js` component for standalone analysis
   - `ImageAnalysis.js` component for patient image analysis

2. **Backend (Node.js/Express)**:
   - `/api/oral-cancer/predict` - Analyze uploaded images
   - `/api/oral-cancer/analyze-patient-image` - Analyze patient's existing images
   - Routes spawn Python process to run ML predictions

3. **ML Model (Python)**:
   - `ml_predict.py` script loads the pickle model
   - Preprocesses images (resize, normalize)
   - Returns predictions as JSON

### Data Flow
```
User uploads image → Express API → Python script → ML Model → Prediction → Database → UI
```

## Features

### 1. Standalone Image Analysis
- Doctors can upload any oral cavity image for quick analysis
- Accessible from Doctor Dashboard → "Oral Cancer Detection" tab
- Results include:
  - Cancer detection (yes/no)
  - Confidence score
  - Risk level (low/medium/high)
  - Clinical recommendations

### 2. Patient Image Analysis
- Analyze images uploaded by ASHA workers
- Results saved to patient record
- Accessible from Patient Details page
- Each image has an "Analyze with AI Model" button
- Analysis includes:
  - Detection result
  - Confidence percentage
  - Risk assessment
  - Timestamp and analyzer information

## Model Requirements

### Input Format
- **Image Types**: JPG, PNG, JPEG, WEBP
- **Size**: Up to 10MB
- **Recommended Resolution**: Minimum 224x224 pixels
- **Color Mode**: RGB

### Output Format
The model should return predictions in this format:
```json
{
  "success": true,
  "prediction": {
    "is_cancerous": true/false,
    "confidence": 0.85,
    "class": 0 or 1,
    "risk_level": "low"/"medium"/"high"
  }
}
```

## Customizing the ML Script

If your model has different requirements, modify `server/ml_predict.py`:

### Change Image Preprocessing
```python
def preprocess_image(image_path, target_size=(224, 224)):
    # Modify target_size based on your model
    # Add custom preprocessing steps
    pass
```

### Adjust Model Loading
```python
def load_model(model_path):
    # If using TensorFlow/Keras instead of pickle:
    # from tensorflow import keras
    # model = keras.models.load_model(model_path)
    pass
```

## Testing the Integration

### 1. Test Python Script Directly
```bash
cd E:\mernstack\Asha_project\server
python ml_predict.py ../oral_cancer_classifier.pkl path/to/test/image.jpg
```

Expected output:
```json
{
  "success": true,
  "prediction": {
    "is_cancerous": false,
    "confidence": 0.92,
    "class": 0,
    "risk_level": "low"
  }
}
```

### 2. Test API Endpoint
Use Postman or curl:
```bash
curl -X POST http://localhost:5000/api/oral-cancer/predict \
  -H "Content-Type: multipart/form-data" \
  -F "image=@path/to/image.jpg"
```

### 3. Test in Application
1. Login as a doctor
2. Go to Doctor Dashboard
3. Click "Oral Cancer Detection" tab
4. Upload an image
5. Click "Analyze Image"

## Troubleshooting

### Python Not Found
**Error**: `spawn python ENOENT`

**Solution**: 
- Ensure Python is in system PATH
- Try using `python3` instead of `python` in `oralCancer.js`:
  ```javascript
  const pythonProcess = spawn('python3', [...]);
  ```

### Module Import Errors
**Error**: `ModuleNotFoundError: No module named 'PIL'`

**Solution**:
```bash
pip install Pillow
```

### Model Loading Errors
**Error**: `Error loading model`

**Solution**:
- Verify model file path is correct
- Check if model was saved with compatible pickle protocol
- Ensure scikit-learn version matches the one used to train the model

### Image Processing Errors
**Error**: `Error preprocessing image`

**Solution**:
- Check image file is not corrupted
- Verify image format is supported
- Ensure sufficient memory for image processing

## Security Considerations

1. **File Upload Validation**: Only image files are accepted
2. **File Size Limits**: Maximum 10MB per image
3. **Authentication**: All analysis endpoints require authentication
4. **Data Privacy**: Images are stored securely on the server
5. **Result Verification**: All AI results include disclaimer about medical professional review

## Performance Optimization

### For Production:
1. **Use GPU acceleration** if available (modify Python script to use TensorFlow GPU)
2. **Implement caching** for frequently analyzed images
3. **Add queue system** for batch processing (e.g., Bull, Redis)
4. **Optimize image preprocessing** (resize before upload)

## Database Schema

### Patient Model - mouthImages Array
```javascript
{
  url: String,
  uploadedAt: Date,
  description: String,
  aiPrediction: {
    isCancerous: Boolean,
    confidence: Number,
    riskLevel: String, // 'low', 'medium', 'high'
    analyzedAt: Date,
    analyzedBy: ObjectId // Reference to doctor
  }
}
```

## API Endpoints

### POST /api/oral-cancer/predict
Upload and analyze a new image
- **Auth**: Not required (for quick analysis)
- **Body**: multipart/form-data with 'image' field
- **Response**: Prediction result

### POST /api/oral-cancer/analyze-patient-image
Analyze existing patient image
- **Auth**: Required (doctor only)
- **Body**: `{ patientId, imageIndex }`
- **Response**: Prediction result + saves to patient record

### GET /api/oral-cancer/model-info
Get model information
- **Auth**: Not required
- **Response**: Model metadata

## Support

For issues or questions:
1. Check server logs: `npm run dev` in server directory
2. Check Python output in terminal
3. Verify all dependencies are installed
4. Review error messages in browser console

## Future Enhancements

- [ ] Batch image analysis
- [ ] Model versioning and A/B testing
- [ ] Export analysis reports as PDF
- [ ] Integration with DICOM medical imaging standards
- [ ] Real-time analysis progress updates
- [ ] Model performance metrics dashboard
