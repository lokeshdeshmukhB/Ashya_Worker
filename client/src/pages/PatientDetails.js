import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import ImageAnalysis from '../components/ImageAnalysis';

const PatientDetails = () => {
  const [patient, setPatient] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatientDetails();
  }, [id]);

  const fetchPatientDetails = useCallback(async () => {
    try {
      const patientResponse = await axios.get(`/api/patients/${id}`);
      setPatient(patientResponse.data.data);

      // Fetch diagnosis if available
      if (patientResponse.data.data.diagnosis) {
        try {
          const diagnosisResponse = await axios.get(`/api/diagnoses/patient/${id}`);
          setDiagnosis(diagnosisResponse.data.data);
        } catch (error) {
          console.log('No diagnosis found');
        }
      }
    } catch (error) {
      toast.error('Error fetching patient details');
      console.error(error);
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      under_review: 'bg-blue-100 text-blue-800 border-blue-200',
      diagnosed: 'bg-green-100 text-green-800 border-green-200',
      follow_up_required: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return `px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${badges[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`;
  };



  const getDiagnosisResultBadge = (result) => {
    const badges = {
      negative: 'bg-green-50 text-green-700 border-green-200 ring-green-500',
      suspicious: 'bg-yellow-50 text-yellow-700 border-yellow-200 ring-yellow-500',
      positive: 'bg-red-50 text-red-700 border-red-200 ring-red-500',
      requires_biopsy: 'bg-orange-50 text-orange-700 border-orange-200 ring-orange-500'
    };
    return `px-4 py-3 rounded-lg border ring-1 font-bold text-center shadow-sm ${badges[result] || ''}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Patient not found</p>
          <Link to={-1} className="btn-primary mt-4">
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Actions */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
          </div>

          <div className="flex space-x-3">
            {user.role === 'doctor' && !diagnosis && (
              <Link to={`/patient/${id}/diagnose`} className="btn-primary flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Create Diagnosis
              </Link>
            )}
            {user.role === 'asha_worker' && patient.recordedBy._id === (user.id || user._id) && (
              <Link to={`/patient/${id}/edit`} className="btn-secondary flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Record
              </Link>
            )}
          </div>
        </div>

        {/* Patient Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-gray-900">{patient.fullName}</h1>
                <span className={getStatusBadge(patient.status)}>
                  {patient.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {patient.gender}, {patient.age} years
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {patient.address.village}, {patient.address.district}
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Registered: {format(new Date(patient.createdAt), 'MMM dd, yyyy')}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              {/* Priority removed */}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Medical Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Diagnosis Section (if exists) */}
            {diagnosis && (
              <section className="bg-white rounded-xl shadow-md border-l-4 border-primary-500 overflow-hidden">
                <div className="p-6 bg-primary-50 border-b border-primary-100">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Clinical Diagnosis
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Result</label>
                      <div className={`mt-2 ${getDiagnosisResultBadge(diagnosis.diagnosisResult)}`}>
                        {diagnosis.diagnosisResult.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Severity</label>
                      <div className="mt-2 text-lg font-medium capitalize text-gray-900">
                        {diagnosis.severity}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Clinical Findings</label>
                    <p className="mt-2 text-gray-800 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                      {diagnosis.findings}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Treatment Plan</label>
                      <p className="mt-2 text-gray-800">{diagnosis.treatmentPlan || 'No specific plan recorded.'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Recommendations</label>
                      <p className="mt-2 text-gray-800">{diagnosis.recommendations || 'None.'}</p>
                    </div>
                  </div>

                  {diagnosis.followUpRequired && (
                    <div className="flex items-start p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <svg className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-yellow-800">Follow-up Required</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Scheduled for: <span className="font-medium">{format(new Date(diagnosis.followUpDate), 'MMMM dd, yyyy')}</span>
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                    <div>
                      Diagnosed by <span className="font-medium text-gray-900">Dr. {diagnosis.doctor.name}</span>
                    </div>
                    <div>
                      {format(new Date(diagnosis.createdAt), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Oral Examination Section */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Oral Examination</h2>
              </div>
              <div className="p-6 space-y-6">
                {patient.symptoms && patient.symptoms.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Reported Symptoms</h3>
                    <div className="flex flex-wrap gap-2">
                      {patient.symptoms.map((symptom, index) => (
                        <span key={index} className="px-3 py-1 bg-red-50 text-red-700 border border-red-100 rounded-full text-sm font-medium">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {patient.oralExaminationNotes && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Examination Notes</h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{patient.oralExaminationNotes}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Mouth Images</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {patient.mouthImages.map((image, index) => (
                      <div key={index} className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                        <div className="relative group">
                          <img
                            src={image.url}
                            alt={`Examination ${index + 1}`}
                            className="w-full h-64 object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                            onClick={() => window.open(image.url, '_blank')}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all pointer-events-none" />
                        </div>
                        {user.role === 'doctor' && (
                          <div className="p-3 bg-white border-t border-gray-200">
                            <ImageAnalysis
                              patientId={patient._id}
                              imageIndex={index}
                              image={image}
                              onAnalysisComplete={fetchPatientDetails}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Medical History Section */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Medical History & Habits</h2>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-sm text-gray-500 block mb-1">Tobacco Use</span>
                    <p className="font-semibold text-gray-900 capitalize">{patient.tobaccoUse}</p>
                    {patient.tobaccoDuration && (
                      <p className="text-sm text-gray-600 mt-1">{patient.tobaccoDuration}</p>
                    )}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-sm text-gray-500 block mb-1">Alcohol Consumption</span>
                    <p className="font-semibold text-gray-900 capitalize">{patient.alcoholConsumption}</p>
                  </div>
                </div>
                {patient.medicalHistory && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">History Notes</h3>
                    <p className="text-gray-700">{patient.medicalHistory}</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Sidebar Info */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{patient.phone}</p>
                    {patient.alternatePhone && (
                      <p className="text-sm text-gray-500">{patient.alternatePhone} (Alt)</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-900">
                      {patient.address.street && `${patient.address.street}, `}
                      {patient.address.village}
                    </p>
                    <p className="text-sm text-gray-500">
                      {patient.address.district}, {patient.address.state}
                    </p>
                    {patient.address.pincode && (
                      <p className="text-sm text-gray-500">{patient.address.pincode}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Care Team Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Care Team</h3>
              
              <div className="mb-6">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Assigned Doctor</span>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold mr-3">
                    Dr
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Dr. {patient.assignedDoctor.name}</p>
                    <p className="text-xs text-gray-500">{patient.assignedDoctor.specialization}</p>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Recorded By</span>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-600 font-bold mr-3">
                    AW
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{patient.recordedBy.name}</p>
                    <p className="text-xs text-gray-500">Asha Worker</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
