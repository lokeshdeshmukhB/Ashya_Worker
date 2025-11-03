import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const PatientForm = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: 'male',
    phone: '',
    alternatePhone: '',
    address: {
      street: '',
      village: '',
      district: '',
      state: '',
      pincode: ''
    },
    tobaccoUse: 'none',
    tobaccoDuration: '',
    alcoholConsumption: 'none',
    symptoms: [],
    medicalHistory: '',
    oralExaminationNotes: '',
    assignedDoctor: '',
    priority: 'medium',
    mouthImages: []
  });
  const [symptomInput, setSymptomInput] = useState('');
  const navigate = useNavigate();

  const commonSymptoms = [
    'Mouth sores',
    'White or red patches',
    'Difficulty swallowing',
    'Persistent pain',
    'Lump or thickening',
    'Numbness',
    'Bleeding',
    'Loose teeth'
  ];

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('/api/doctors');
      setDoctors(response.data.data);
    } catch (error) {
      toast.error('Error fetching doctors');
      console.error(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSymptomToggle = (symptom) => {
    if (formData.symptoms.includes(symptom)) {
      setFormData({
        ...formData,
        symptoms: formData.symptoms.filter(s => s !== symptom)
      });
    } else {
      setFormData({
        ...formData,
        symptoms: [...formData.symptoms, symptom]
      });
    }
  };

  const handleAddCustomSymptom = () => {
    if (symptomInput.trim() && !formData.symptoms.includes(symptomInput.trim())) {
      setFormData({
        ...formData,
        symptoms: [...formData.symptoms, symptomInput.trim()]
      });
      setSymptomInput('');
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    const formDataImages = new FormData();
    files.forEach(file => {
      formDataImages.append('images', file);
    });

    try {
      const response = await axios.post('/api/upload/multiple-images', formDataImages, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const uploadedImages = response.data.data.map(img => ({
        url: img.url,
        description: ''
      }));

      setFormData({
        ...formData,
        mouthImages: [...formData.mouthImages, ...uploadedImages]
      });

      toast.success('Images uploaded successfully');
    } catch (error) {
      toast.error('Error uploading images');
      console.error(error);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      mouthImages: formData.mouthImages.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.assignedDoctor) {
      toast.error('Please select a doctor');
      return;
    }

    if (formData.mouthImages.length === 0) {
      toast.error('Please upload at least one mouth image');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/patients', formData);
      toast.success('Patient record created successfully');
      navigate('/asha-worker/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating patient record');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/asha-worker/dashboard"
            className="flex items-center text-primary-600 hover:text-primary-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">New Patient Record</h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter patient's full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age *
                  </label>
                  <input
                    type="number"
                    name="age"
                    required
                    min="0"
                    value={formData.age}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter age"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alternate Phone
                  </label>
                  <input
                    type="tel"
                    name="alternatePhone"
                    value={formData.alternatePhone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter alternate phone"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street/House No.
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter street/house number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Village/Town *
                  </label>
                  <input
                    type="text"
                    name="address.village"
                    required
                    value={formData.address.village}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter village/town"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District *
                  </label>
                  <input
                    type="text"
                    name="address.district"
                    required
                    value={formData.address.district}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter district"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="address.state"
                    required
                    value={formData.address.state}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter state"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="address.pincode"
                    value={formData.address.pincode}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter pincode"
                  />
                </div>
              </div>
            </div>

            {/* Medical History */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical History</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tobacco Use
                  </label>
                  <select
                    name="tobaccoUse"
                    value={formData.tobaccoUse}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="none">None</option>
                    <option value="smoking">Smoking</option>
                    <option value="chewing">Chewing</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                {formData.tobaccoUse !== 'none' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration of Tobacco Use
                    </label>
                    <input
                      type="text"
                      name="tobaccoDuration"
                      value={formData.tobaccoDuration}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="e.g., 5 years, 10 years"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alcohol Consumption
                  </label>
                  <select
                    name="alcoholConsumption"
                    value={formData.alcoholConsumption}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="none">None</option>
                    <option value="occasional">Occasional</option>
                    <option value="regular">Regular</option>
                    <option value="heavy">Heavy</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical History Notes
                </label>
                <textarea
                  name="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={handleChange}
                  rows="3"
                  className="input-field"
                  placeholder="Any relevant medical history..."
                />
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Symptoms</h3>
              <div className="grid md:grid-cols-2 gap-3 mb-4">
                {commonSymptoms.map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => handleSymptomToggle(symptom)}
                    className={`p-3 border-2 rounded-lg text-left transition-all ${
                      formData.symptoms.includes(symptom)
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                  className="input-field"
                  placeholder="Add custom symptom..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomSymptom())}
                />
                <button
                  type="button"
                  onClick={handleAddCustomSymptom}
                  className="btn-secondary whitespace-nowrap"
                >
                  Add
                </button>
              </div>

              {formData.symptoms.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.symptoms.map((symptom, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                    >
                      {symptom}
                      <button
                        type="button"
                        onClick={() => handleSymptomToggle(symptom)}
                        className="ml-2 text-primary-600 hover:text-primary-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Oral Examination */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Oral Examination</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Examination Notes
                </label>
                <textarea
                  name="oralExaminationNotes"
                  value={formData.oralExaminationNotes}
                  onChange={handleChange}
                  rows="4"
                  className="input-field"
                  placeholder="Describe observations from oral examination..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mouth Images * (Upload clear images of oral cavity)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="input-field"
                  disabled={uploadingImages}
                />
                {uploadingImages && (
                  <p className="text-sm text-gray-600 mt-2">Uploading images...</p>
                )}

                {formData.mouthImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.mouthImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image.url}
                          alt={`Mouth ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Assignment */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign to Doctor *
                  </label>
                  <select
                    name="assignedDoctor"
                    required
                    value={formData.assignedDoctor}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select a doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor._id} value={doctor._id}>
                        Dr. {doctor.name} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                </div>

        {/*        <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div> */}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link to="/asha-worker/dashboard" className="btn-secondary px-8 py-3">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || uploadingImages}
                className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Patient Record'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientForm;
