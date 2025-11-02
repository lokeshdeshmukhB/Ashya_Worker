import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ImageAnalysis = ({ patientId, imageIndex, image, onAnalysisComplete }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(image.aiPrediction || null);

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      const response = await axios.post('/api/oral-cancer/analyze-patient-image', {
        patientId,
        imageIndex
      });

      if (response.data.success) {
        setResult(response.data.prediction);
        toast.success('Image analyzed successfully');
        if (onAnalysisComplete) {
          onAnalysisComplete(response.data.prediction);
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error.response?.data?.error || 'Failed to analyze image');
    } finally {
      setAnalyzing(false);
    }
  };

  const getRiskBadgeColor = (riskLevel) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      high: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[riskLevel] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className="mt-3">
      {!result ? (
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
            analyzing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
          }`}
        >
          {analyzing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing with AI...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Analyze with AI Model
            </span>
          )}
        </button>
      ) : (
        <div className={`p-4 rounded-lg border-2 ${getRiskBadgeColor(result.riskLevel || result.risk_level)}`}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center">
              {result.isCancerous || result.is_cancerous ? (
                <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <div>
                <p className="font-bold text-sm">
                  {result.isCancerous || result.is_cancerous ? 'Suspicious Lesion Detected' : 'No Suspicious Lesions'}
                </p>
                <p className="text-xs mt-1">
                  Confidence: {((result.confidence || 0) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${getRiskBadgeColor(result.riskLevel || result.risk_level)}`}>
              {result.riskLevel || result.risk_level} Risk
            </span>
          </div>
          
          <div className="mt-3 pt-3 border-t border-current border-opacity-20">
            <p className="text-xs font-medium mb-1">AI Recommendations:</p>
            <ul className="text-xs space-y-1">
              {(result.isCancerous || result.is_cancerous) ? (
                <>
                  <li>• Immediate clinical examination recommended</li>
                  <li>• Consider biopsy for confirmation</li>
                  <li>• Document findings in patient record</li>
                </>
              ) : (
                <>
                  <li>• Continue routine monitoring</li>
                  <li>• Schedule follow-up as per protocol</li>
                  <li>• Educate patient on oral hygiene</li>
                </>
              )}
            </ul>
          </div>

          {result.analyzedAt && (
            <p className="text-xs mt-2 opacity-75">
              Analyzed: {new Date(result.analyzedAt).toLocaleString()}
            </p>
          )}

          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="mt-3 w-full py-1 px-3 text-xs rounded border border-current hover:bg-black hover:bg-opacity-5 transition-colors"
          >
            Re-analyze
          </button>
        </div>
      )}
      
      <p className="text-xs text-gray-500 mt-2 text-center">
        AI-assisted analysis • Results should be verified by a medical professional
      </p>
    </div>
  );
};

export default ImageAnalysis;
