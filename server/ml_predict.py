import sys
import json
import pickle
import numpy as np
from PIL import Image
import os
import pathlib
import platform

# Patch PosixPath for Windows compatibility
if platform.system() == 'Windows':
    pathlib.PosixPath = pathlib.WindowsPath

# Disable FastAI progress bars to prevent stdout pollution
os.environ['FASTAI_NO_PROGRESS'] = '1'

# Try to import fastai for loading fastai models
try:
    from fastai.vision.all import load_learner, PILImage
    HAS_FASTAI = True
    sys.stderr.write("fastai imported successfully\n")
    sys.stderr.flush()
except ImportError:
    HAS_FASTAI = False
    sys.stderr.write("Warning: fastai not available\n")
    sys.stderr.flush()

# Try to import joblib as fallback for scikit-learn models
try:
    import joblib
    HAS_JOBLIB = True
except ImportError:
    HAS_JOBLIB = False
    sys.stderr.write("Warning: joblib not available, will only use pickle\n")
    sys.stderr.flush()

def load_model(model_path):
    """Load the trained ML model"""
    import traceback
    
    # Try fastai first (for fastai exported models)
    if HAS_FASTAI:
        try:
            sys.stderr.write(f"Loading model from: {model_path}\n")
            sys.stderr.write(f"Attempting to load with fastai load_learner...\n")
            sys.stderr.flush()
            
            model = load_learner(model_path)
            
            sys.stderr.write(f"Model loaded successfully with fastai. Type: {type(model).__name__}\n")
            sys.stderr.flush()
            return model
        except Exception as e:
            sys.stderr.write(f"Fastai loading failed: {str(e)}\n")
            sys.stderr.write(f"Trying other methods...\n")
            sys.stderr.flush()
    
    # Try joblib (common for scikit-learn models)
    if HAS_JOBLIB:
        try:
            sys.stderr.write(f"Attempting to load with joblib...\n")
            sys.stderr.flush()
            
            model = joblib.load(model_path)
            
            sys.stderr.write(f"Model loaded successfully with joblib. Type: {type(model).__name__}\n")
            sys.stderr.flush()
            return model
        except Exception as e:
            sys.stderr.write(f"Joblib loading failed: {str(e)}\n")
            sys.stderr.write(f"Falling back to pickle...\n")
            sys.stderr.flush()
    
    # Try standard pickle
    try:
        sys.stderr.write(f"Loading model from: {model_path}\n")
        sys.stderr.flush()
        
        with open(model_path, 'rb') as f:
            sys.stderr.write(f"File opened successfully, attempting pickle.load...\n")
            sys.stderr.flush()
            model = pickle.load(f)
        
        sys.stderr.write(f"Model loaded successfully with pickle. Type: {type(model).__name__}\n")
        sys.stderr.flush()
        return model
    except FileNotFoundError:
        error_msg = f"Model file not found at path: {model_path}"
        sys.stderr.write(f"ERROR: {error_msg}\n")
        sys.stderr.flush()
        print(json.dumps({"error": error_msg}))
        sys.exit(1)
    except Exception as e:
        error_msg = f"Error loading model: {str(e)}"
        full_trace = traceback.format_exc()
        sys.stderr.write(f"ERROR: {error_msg}\n")
        sys.stderr.write(f"Full traceback:\n{full_trace}\n")
        sys.stderr.flush()
        print(json.dumps({"error": error_msg, "traceback": full_trace}))
        sys.exit(1)

def predict_with_fastai(model, image_path):
    """Make prediction using fastai model"""
    try:
        sys.stderr.write(f"Using fastai prediction for: {image_path}\n")
        sys.stderr.flush()
        
        # Load image using fastai's PILImage
        img = PILImage.create(image_path)
        sys.stderr.write(f"Image loaded with fastai PILImage\n")
        sys.stderr.flush()
        
        # Make prediction with progress bar disabled
        from fastai.callback.progress import ProgressCallback
        with model.no_bar():
            pred_class, pred_idx, probs = model.predict(img)
        
        sys.stderr.write(f"Prediction: {pred_class}, Index: {pred_idx}, Probs: {probs}\n")
        sys.stderr.flush()
        
        # Get class labels
        vocab = model.dls.vocab
        sys.stderr.write(f"Model vocabulary: {vocab}\n")
        sys.stderr.flush()
        
        # Determine if cancerous (assuming vocab has cancer-related labels)
        # Common labels: 'cancer', 'cancerous', 'malignant', 'positive', etc.
        pred_label = str(pred_class).lower()
        is_cancerous = any(keyword in pred_label for keyword in ['cancer', 'malignant', 'positive', 'abnormal'])
        
        # Get confidence
        confidence = float(probs[pred_idx])
        
        sys.stderr.write(f"Final - Label: {pred_class}, Cancerous: {is_cancerous}, Confidence: {confidence}\n")
        sys.stderr.flush()
        
        return is_cancerous, confidence, str(pred_class)
    except Exception as e:
        import traceback
        sys.stderr.write(f"Fastai prediction error: {traceback.format_exc()}\n")
        sys.stderr.flush()
        raise e

def predict_with_sklearn(model, image_path, target_size=(224, 224)):
    """Make prediction using sklearn/traditional ML model"""
    try:
        sys.stderr.write(f"Using sklearn prediction for: {image_path}\n")
        sys.stderr.flush()
        
        # Load and resize image
        img = Image.open(image_path)
        sys.stderr.write(f"Image loaded. Mode: {img.mode}, Size: {img.size}\n")
        sys.stderr.flush()
        
        # Convert to RGB if necessary
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize image
        img = img.resize(target_size)
        
        # Convert to numpy array and normalize
        img_array = np.array(img)
        img_array = img_array / 255.0  # Normalize to [0, 1]
        
        # Flatten the image
        img_array = img_array.flatten()
        
        # Reshape for model input (add batch dimension)
        img_array = img_array.reshape(1, -1)
        
        sys.stderr.write(f"Preprocessed array shape: {img_array.shape}\n")
        sys.stderr.flush()
        
        # Get prediction
        prediction = model.predict(img_array)
        sys.stderr.write(f"Raw prediction: {prediction}\n")
        sys.stderr.flush()
        
        # Get probability if available
        if hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba(img_array)
            confidence = float(np.max(probabilities))
            predicted_class = int(prediction[0])
        else:
            predicted_class = int(prediction[0])
            confidence = 0.85
        
        is_cancerous = bool(predicted_class == 1)
        
        sys.stderr.write(f"Final - Class: {predicted_class}, Cancerous: {is_cancerous}, Confidence: {confidence}\n")
        sys.stderr.flush()
        
        return is_cancerous, confidence, str(predicted_class)
    except Exception as e:
        import traceback
        sys.stderr.write(f"Sklearn prediction error: {traceback.format_exc()}\n")
        sys.stderr.flush()
        raise e

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: python ml_predict.py <model_path> <image_path>"}))
        sys.exit(1)
    
    model_path = sys.argv[1]
    image_path = sys.argv[2]
    
    # Log paths for debugging
    sys.stderr.write(f"Model path: {model_path}\n")
    sys.stderr.write(f"Image path: {image_path}\n")
    sys.stderr.write(f"Model exists: {os.path.exists(model_path)}\n")
    sys.stderr.write(f"Image exists: {os.path.exists(image_path)}\n")
    sys.stderr.flush()
    
    # Check if files exist
    if not os.path.exists(model_path):
        print(json.dumps({"error": f"Model file not found: {model_path}"}))
        sys.exit(1)
    
    if not os.path.exists(image_path):
        print(json.dumps({"error": f"Image file not found: {image_path}"}))
        sys.exit(1)
    
    # Load model
    model = load_model(model_path)
    
    # Determine model type and make prediction
    try:
        # Check if it's a fastai model
        if HAS_FASTAI and hasattr(model, 'dls') and hasattr(model, 'predict'):
            sys.stderr.write(f"Detected fastai model\n")
            sys.stderr.flush()
            is_cancerous, confidence, pred_label = predict_with_fastai(model, image_path)
        else:
            sys.stderr.write(f"Detected sklearn/traditional model\n")
            sys.stderr.flush()
            is_cancerous, confidence, pred_label = predict_with_sklearn(model, image_path)
        
        # Determine risk level
        if is_cancerous:
            if confidence > 0.7:
                risk_level = "high"
            else:
                risk_level = "medium"
        else:
            risk_level = "low"
        
        # Prepare result
        result = {
            "success": True,
            "prediction": {
                "is_cancerous": is_cancerous,
                "confidence": confidence,
                "class": pred_label,
                "risk_level": risk_level
            }
        }
        
        # Output result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        import traceback
        error_msg = f"Error making prediction: {str(e)}"
        full_trace = traceback.format_exc()
        sys.stderr.write(f"ERROR: {error_msg}\n")
        sys.stderr.write(f"Full traceback:\n{full_trace}\n")
        sys.stderr.flush()
        print(json.dumps({"error": error_msg, "traceback": full_trace}))
        sys.exit(1)

if __name__ == "__main__":
    main()
