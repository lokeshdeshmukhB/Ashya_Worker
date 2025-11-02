# AI-Powered Oral Cancer Detection Feature

## Overview
This feature integrates your `oral_cancer_classifier.pkl` ML model into the MERN application, allowing doctors to analyze oral cavity images uploaded by ASHA workers and detect potential cancerous lesions.

## What's Been Implemented

### 1. Backend Components

#### Python ML Script (`server/ml_predict.py`)
- Loads the pickle model (`oral_cancer_classifier.pkl`)
- Preprocesses images (resize to 224x224, normalize, flatten)
- Returns JSON predictions with confidence scores
- Handles errors gracefully

#### API Routes (`server/routes/oralCancer.js`)
Three new endpoints:
- **POST /api/oral-cancer/predict** - Analyze uploaded images (standalone)
- **POST /api/oral-cancer/analyze-patient-image** - Analyze patient's existing images
- **GET /api/oral-cancer/model-info** - Get model information

#### Database Updates (`server/models/Patient.js`)
Added `aiPrediction` field to `mouthImages` array:
```javascript
aiPrediction: {
  isCancerous: Boolean,
  confidence: Number,
  riskLevel: String, // 'low', 'medium', 'high'
  analyzedAt: Date,
  analyzedBy: ObjectId
}
```

### 2. Frontend Components

#### Standalone Analysis (`client/src/components/OralCancerDetection.js`)
- Upload any oral cavity image for quick analysis
- Shows prediction results with visual indicators
- Displays confidence scores and risk levels
- Provides clinical recommendations
- Accessible from Doctor Dashboard

#### Patient Image Analysis (`client/src/components/ImageAnalysis.js`)
- Analyze images already uploaded by ASHA workers
- "Analyze with AI Model" button on each patient image
- Results saved to patient record
- Shows analysis history
- Re-analyze capability

#### Updated Pages
- **DoctorDashboard.js** - Added "Oral Cancer Detection" tab
- **PatientDetails.js** - Integrated AI analysis for each patient image

## How Doctors Use This Feature

### Method 1: Standalone Image Analysis
1. Login as a doctor
2. Go to Doctor Dashboard
3. Click **"Oral Cancer Detection"** tab
4. Upload an oral cavity image
5. Click **"Analyze Image"**
6. View results with recommendations

### Method 2: Analyze Patient Images
1. Login as a doctor
2. Navigate to a patient's details page
3. Scroll to "Oral Examination" section
4. Each image has an **"Analyze with AI Model"** button
5. Click to analyze
6. Results are saved to the patient record
7. Can re-analyze if needed

## Results Display

### Detection Results Include:
- ✅ **Detection Status**: Suspicious lesion detected or not
- 📊 **Confidence Score**: Percentage (0-100%)
- ⚠️ **Risk Level**: Low, Medium, or High
- 💡 **Recommendations**: Clinical actions based on results
- 📅 **Analysis Timestamp**: When the analysis was performed
- 👨‍⚕️ **Analyzer**: Which doctor performed the analysis

### Visual Indicators:
- 🟢 **Green**: No suspicious lesions (low risk)
- 🟡 **Yellow**: Medium risk
- 🔴 **Red**: Suspicious lesions detected (high risk)

## Setup Instructions

### 1. Install Python Dependencies
```bash
cd E:\mernstack\Asha_project\server
pip install -r requirements.txt
```

Or manually:
```bash
pip install numpy Pillow scikit-learn
```

### 2. Verify Model File
Ensure `oral_cancer_classifier.pkl` exists at:
```
E:\mernstack\Asha_project\oral_cancer_classifier.pkl
```

### 3. Test Python Script
```bash
cd E:\mernstack\Asha_project\server
python ml_predict.py ../oral_cancer_classifier.pkl path/to/test/image.jpg
```

### 4. Start the Application
```bash
# Terminal 1 - Server
cd E:\mernstack\Asha_project\server
npm run dev

# Terminal 2 - Client
cd E:\mernstack\Asha_project\client
npm start
```

## Workflow Example

### Scenario: ASHA Worker → Doctor Analysis

1. **ASHA Worker**:
   - Visits patient in village
   - Takes oral cavity photos
   - Uploads images via PatientForm
   - Assigns to doctor

2. **Doctor**:
   - Reviews patient in dashboard
   - Opens patient details
   - Sees images uploaded by ASHA worker
   - Clicks "Analyze with AI Model" on each image
   - Reviews AI predictions
   - Makes clinical diagnosis based on:
     - AI analysis results
     - Patient symptoms
     - Medical history
     - Clinical examination notes

3. **System**:
   - Saves AI predictions to patient record
   - Tracks who analyzed and when
   - Maintains analysis history
   - Supports re-analysis if needed

## Technical Details

### Image Processing Pipeline
```
Upload → Multer → File System → Python Script → ML Model → Prediction → Database → UI
```

### Model Input Requirements
- **Format**: JPG, PNG, JPEG, WEBP
- **Size**: Up to 10MB
- **Resolution**: Minimum 224x224 pixels (auto-resized)
- **Color**: RGB (auto-converted if needed)

### Model Output Format
```json
{
  "success": true,
  "prediction": {
    "is_cancerous": true,
    "confidence": 0.87,
    "class": 1,
    "risk_level": "high"
  }
}
```

## Important Notes

### Medical Disclaimer
⚠️ **The AI model is an assistive tool, not a replacement for clinical judgment.**
- All results must be verified by qualified medical professionals
- AI predictions should inform, not dictate, clinical decisions
- Biopsy remains the gold standard for definitive diagnosis

### Data Privacy
- Images stored securely on server
- Access restricted to authenticated doctors
- Analysis history tracked for accountability
- Patient data protected per healthcare standards

### Accuracy Considerations
- Model accuracy depends on training data quality
- Image quality affects prediction accuracy
- Clinical context is essential for interpretation
- Regular model updates recommended

## Troubleshooting

### Common Issues

**1. Python not found**
```
Error: spawn python ENOENT
```
Solution: Add Python to system PATH or use `python3` in code

**2. Module not found**
```
ModuleNotFoundError: No module named 'PIL'
```
Solution: `pip install Pillow`

**3. Model loading error**
```
Error loading model
```
Solution: Verify model file path and pickle compatibility

**4. Image processing error**
```
Error preprocessing image
```
Solution: Check image format and file integrity

## Files Created/Modified

### New Files:
- ✅ `server/ml_predict.py` - Python ML prediction script
- ✅ `server/routes/oralCancer.js` - API routes for ML integration
- ✅ `server/requirements.txt` - Python dependencies
- ✅ `client/src/components/OralCancerDetection.js` - Standalone analysis UI
- ✅ `client/src/components/ImageAnalysis.js` - Patient image analysis UI
- ✅ `ML_SETUP.md` - Detailed setup guide
- ✅ `AI_DETECTION_FEATURE.md` - This document

### Modified Files:
- ✅ `server/server.js` - Added oral cancer route
- ✅ `server/models/Patient.js` - Added aiPrediction field
- ✅ `client/src/pages/DoctorDashboard.js` - Added AI detection tab
- ✅ `client/src/pages/PatientDetails.js` - Added image analysis component

## Next Steps

1. **Install Python dependencies**:
   ```bash
   pip install -r server/requirements.txt
   ```

2. **Test the ML script**:
   ```bash
   cd server
   python ml_predict.py ../oral_cancer_classifier.pkl path/to/test/image.jpg
   ```

3. **Start the application** and test the feature

4. **Train doctors** on how to use the AI detection feature

5. **Monitor results** and gather feedback for model improvements

## Support

For detailed setup instructions, see `ML_SETUP.md`

For issues:
1. Check server logs
2. Verify Python installation
3. Test ML script independently
4. Review browser console for errors

---

**Feature Status**: ✅ Ready for Testing

**Last Updated**: November 2, 2025
