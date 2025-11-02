import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const OralCancerDetection = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      setIsLoading(true);
      const response = await axios.post('/api/oral-cancer/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setResult(response.data);
      toast.success('Analysis complete');
    } catch (error) {
      console.error('Error predicting:', error);
      toast.error('Failed to analyze image');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Oral Cancer Detection</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Oral Cavity Image
            </label>
            <div className="mt-1 flex items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Upload a clear image of the oral cavity for analysis.
            </p>
          </div>

          {preview && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Image Preview</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-2">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 mx-auto"
                />
              </div>
            </div>
          )}

          <div className="mt-6">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!selectedFile || isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                ${
                  !selectedFile || isLoading
                    ? 'bg-blue-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isLoading ? 'Analyzing...' : 'Analyze Image'}
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Analysis Results</h3>
          
          {result ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className={`text-center py-4 ${result.prediction?.is_cancerous ? 'text-red-600' : 'text-green-600'}`}>
                <div className="flex justify-center mb-3">
                  {result.prediction?.is_cancerous ? (
                    <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ) : (
                    <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <p className="text-2xl font-bold mb-2">
                  {result.prediction?.is_cancerous ? 'Suspicious Lesion Detected' : 'No Suspicious Lesions Detected'}
                </p>
                <p className="text-sm text-gray-600">
                  Confidence: {((result.prediction?.confidence || 0) * 100).toFixed(2)}%
                </p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${
                  result.prediction?.risk_level === 'high' ? 'bg-red-100 text-red-800' :
                  result.prediction?.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {result.prediction?.risk_level?.toUpperCase()} RISK
                </span>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">Recommendations:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {result.prediction?.is_cancerous ? (
                    <>
                      <li>• Immediate clinical examination recommended</li>
                      <li>• Consider biopsy for definitive diagnosis</li>
                      <li>• Refer to oncology specialist if confirmed</li>
                      <li>• Document all findings in patient records</li>
                    </>
                  ) : (
                    <>
                      <li>• No immediate action required</li>
                      <li>• Schedule regular check-ups as per protocol</li>
                      <li>• Monitor for any changes in the oral cavity</li>
                      <li>• Educate patient on oral hygiene and risk factors</li>
                    </>
                  )}
                </ul>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  <strong>Disclaimer:</strong> This is an AI-assisted analysis tool. All results must be verified by a qualified medical professional. This tool is meant to assist, not replace, clinical judgment.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-8 text-center rounded-lg border-2 border-dashed border-gray-300">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No analysis performed</h3>
              <p className="mt-1 text-sm text-gray-500">
                Upload an oral cavity image and click "Analyze" to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OralCancerDetection;
