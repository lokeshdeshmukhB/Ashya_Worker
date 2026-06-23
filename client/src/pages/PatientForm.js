import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import StepWizard from '../components/StepWizard';

const PatientForm = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
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
  const { id } = useParams();
  const isEditMode = !!id;

  const steps = [
    { title: 'Personal Info' },
    { title: 'Address' },
    { title: 'Medical History' },
    { title: 'Symptoms & Exam' },
    { title: 'Assignment' }
  ];

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
    if (isEditMode) {
      fetchPatientDetails();
    }
  }, [id]);

  const fetchPatientDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/patients/' + id);
      const patient = response.data.data;
      
      setFormData({
        fullName: patient.fullName,
        age: patient.age,
        gender: patient.gender,
        phone: patient.phone,
        alternatePhone: patient.alternatePhone || '',
        address: {
          street: patient.address.street || '',
          village: patient.address.village,
          district: patient.address.district,
          state: patient.address.state,
          pincode: patient.address.pincode || ''
        },
        tobaccoUse: patient.tobaccoUse,
        tobaccoDuration: patient.tobaccoDuration || '',
        alcoholConsumption: patient.alcoholConsumption,
        symptoms: patient.symptoms || [],
        medicalHistory: patient.medicalHistory || '',
        oralExaminationNotes: patient.oralExaminationNotes || '',
        assignedDoctor: patient.assignedDoctor._id || patient.assignedDoctor,
        priority: patient.priority,
        mouthImages: patient.mouthImages || []
      });
    } catch (error) {
      toast.error('Error fetching patient details');
      console.error(error);
      navigate('/asha-worker/dashboard');
    } finally {
      setLoading(false);
    }
  };

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

  const validateStep = (step) => {
    switch (step) {
      case 0: // Personal Info
        if (!formData.fullName || !formData.age || !formData.gender || !formData.phone) {
          toast.error('Please fill in all required fields');
          return false;
        }
        return true;
      case 1: // Address
        if (!formData.address.village || !formData.address.district || !formData.address.state) {
          toast.error('Please fill in all required address fields');
          return false;
        }
        return true;
      case 2: // Medical History
        return true; // Optional fields
      case 3: // Symptoms & Exam
        if (formData.mouthImages.length === 0) {
          toast.error('Please upload at least one mouth image');
          return false;
        }
        return true;
      case 4: // Assignment
        if (!formData.assignedDoctor) {
          toast.error('Please select a doctor');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(4)) return;

    setLoading(true);

    try {
      if (isEditMode) {
        await axios.put('/api/patients/' + id, formData);
        toast.success('Patient record updated successfully');
      } else {
        await axios.post('/api/patients', formData);
        toast.success('Patient record created successfully');
      }
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-2"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? 'Edit Patient Record' : 'New Patient Registration'}
            </h1>
            <p className="mt-1 text-gray-600">
              {isEditMode ? 'Update patient information and medical history.' : 'Enter patient details to create a new record.'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <StepWizard
            steps={steps}
            currentStep={currentStep}
            onStepClick={(step) => {
              // Only allow clicking previous steps or current step
              if (step <= currentStep) setCurrentStep(step);
            }}
          />

          <div className="p-8">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Personal Info */}
              {currentStep === 0 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                        required
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Phone</label>
                      <input
                        type="tel"
                        name="alternatePhone"
                        value={formData.alternatePhone}
                        onChange={handleChange}
                        className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Address */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                      <input
                        type="text"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleChange}
                        className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Village *</label>
                      <input
                        type="text"
                        name="address.village"
                        value={formData.address.village}
                        onChange={handleChange}
                        className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                      <input
                        type="text"
                        name="address.district"
                        value={formData.address.district}
                        onChange={handleChange}
                        className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                      <input
                        type="text"
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleChange}
                        className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                      <input
                        type="text"
                        name="address.pincode"
                        value={formData.address.pincode}
                        onChange={handleChange}
                        className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Medical History */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tobacco Use *</label>
                      <select
                        name="tobaccoUse"
                        value={formData.tobaccoUse}
                        onChange={handleChange}
                        className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                        required
                      >
                        <option value="none">None</option>
                        <option value="smoking">Smoking</option>
                        <option value="chewing">Chewing</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                    {formData.tobaccoUse !== 'none' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                        <input
                          type="text"
                          name="tobaccoDuration"
                          value={formData.tobaccoDuration}
                          onChange={handleChange}
                          className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                          placeholder="e.g., 5 years"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alcohol Consumption *</label>
                      <select
                        name="alcoholConsumption"
                        value={formData.alcoholConsumption}
                        onChange={handleChange}
                        className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                        required
                      >
                        <option value="none">None</option>
                        <option value="occasional">Occasional</option>
                        <option value="regular">Regular</option>
                        <option value="heavy">Heavy</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Other Medical History</label>
                    <textarea
                      name="medicalHistory"
                      value={formData.medicalHistory}
                      onChange={handleChange}
                      rows="3"
                      className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Step 4: Symptoms & Exam */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {commonSymptoms.map((symptom) => (
                        <button
                          key={symptom}
                          type="button"
                          onClick={() => handleSymptomToggle(symptom)}
                          className={'px-3 py-1 rounded-full text-sm border transition-colors ' + (
                            formData.symptoms.includes(symptom)
                              ? 'bg-primary-100 border-primary-500 text-primary-700'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          )}
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
                        className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                        placeholder="Add other symptom..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomSymptom())}
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomSymptom}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        Add
                      </button>
                    </div>
                    {formData.symptoms.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {formData.symptoms.map((symptom, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-50 text-primary-700 border border-primary-200"
                          >
                            {symptom}
                            <button
                              type="button"
                              onClick={() => handleSymptomToggle(symptom)}
                              className="ml-2 text-primary-500 hover:text-primary-700"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Oral Examination Notes</label>
                    <textarea
                      name="oralExaminationNotes"
                      value={formData.oralExaminationNotes}
                      onChange={handleChange}
                      rows="3"
                      className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mouth Images</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-500 transition-colors">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                          >
                            <span>Upload images</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              multiple
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={uploadingImages}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                    {uploadingImages && (
                      <p className="mt-2 text-sm text-primary-600 animate-pulse">Uploading images...</p>
                    )}
                    {formData.mouthImages.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.mouthImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image.url}
                              alt={'Mouth ' + (index + 1)}
                              className="h-24 w-full object-cover rounded-lg shadow-sm"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 5: Assignment */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign Doctor *</label>
                    <select
                      name="assignedDoctor"
                      value={formData.assignedDoctor}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                      required
                    >
                      <option value="">Select a doctor</option>
                      {doctors.map((doctor) => (
                        <option key={doctor._id} value={doctor._id}>
                          Dr. {doctor.name} ({doctor.specialization || 'General'})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Priority removed as per user request */}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-8 flex justify-between pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className={'px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors ' + (
                    currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  )}
                >
                  Previous
                </button>
                
                {currentStep < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-primary"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      'Submit Record'
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientForm;
