import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const DiagnosisForm = () => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    diagnosisResult: 'negative',
    findings: '',
    recommendations: '',
    severity: 'none',
    followUpRequired: false,
    followUpDate: '',
    treatmentPlan: '',
    referralRequired: false,
    referralDetails: {
      hospital: '',
      specialist: '',
      reason: ''
    },
    notes: ''
  });
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const fetchPatient = useCallback(async () => {
    try {
      const response = await axios.get(`/api/patients/${id}`);
      setPatient(response.data.data);
    } catch (error) {
      toast.error('Error fetching patient details');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('referralDetails.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        referralDetails: {
          ...formData.referralDetails,
          [field]: value
        }
      });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post('/api/diagnoses', { patient: id, ...formData });
      toast.success('Diagnosis created successfully');
      navigate('/doctor/dashboard');
    } catch (error) {
      toast.error('Error creating diagnosis');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={`/patient/${id}`} className="flex items-center text-primary-600 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </Link>

        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Create Diagnosis for {patient?.fullName}</h2>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis Result *</label>
            <select name="diagnosisResult" required value={formData.diagnosisResult} onChange={handleChange} className="input-field">
              <option value="negative">Negative</option>
              <option value="suspicious">Suspicious</option>
              <option value="positive">Positive</option>
              <option value="requires_biopsy">Requires Biopsy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Findings *</label>
            <textarea name="findings" required value={formData.findings} onChange={handleChange} rows="5" className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recommendations *</label>
            <textarea name="recommendations" required value={formData.recommendations} onChange={handleChange} rows="4" className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Treatment Plan</label>
            <textarea name="treatmentPlan" value={formData.treatmentPlan} onChange={handleChange} rows="4" className="input-field" />
          </div>

          <div className="flex items-center">
            <input type="checkbox" name="followUpRequired" checked={formData.followUpRequired} onChange={handleChange} className="w-4 h-4" />
            <label className="ml-2 text-sm font-medium">Follow-up Required</label>
          </div>

          {formData.followUpRequired && (
            <input type="date" name="followUpDate" value={formData.followUpDate} onChange={handleChange} className="input-field" />
          )}

          <div className="flex items-center">
            <input type="checkbox" name="referralRequired" checked={formData.referralRequired} onChange={handleChange} className="w-4 h-4" />
            <label className="ml-2 text-sm font-medium">Referral Required</label>
          </div>

          {formData.referralRequired && (
            <div className="space-y-4">
              <input type="text" name="referralDetails.hospital" value={formData.referralDetails.hospital} onChange={handleChange} className="input-field" placeholder="Hospital" />
              <input type="text" name="referralDetails.specialist" value={formData.referralDetails.specialist} onChange={handleChange} className="input-field" placeholder="Specialist" />
              <textarea name="referralDetails.reason" value={formData.referralDetails.reason} onChange={handleChange} rows="3" className="input-field" placeholder="Reason" />
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Link to={`/patient/${id}`} className="btn-secondary px-8 py-3">Cancel</Link>
            <button type="submit" disabled={submitting} className="btn-primary px-8 py-3">
              {submitting ? 'Submitting...' : 'Submit Diagnosis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiagnosisForm;
