import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

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

  const fetchPatientDetails = async () => {
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
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge badge-pending',
      under_review: 'badge badge-under-review',
      diagnosed: 'badge badge-diagnosed',
      follow_up_required: 'badge badge-follow-up'
    };
    return badges[status] || 'badge';
  };

  const getDiagnosisResultBadge = (result) => {
    const badges = {
      negative: 'bg-green-100 text-green-800 border-green-200',
      suspicious: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      positive: 'bg-red-100 text-red-800 border-red-200',
      requires_biopsy: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return `px-4 py-2 rounded-lg border-2 font-semibold ${badges[result] || ''}`;
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-primary-600 hover:text-primary-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>

          {user.role === 'doctor' && !diagnosis && (
            <Link
              to={`/patient/${id}/diagnose`}
              className="btn-primary"
            >
              Create Diagnosis
            </Link>
          )}
        </div>

        {/* Patient Header */}
        <div className="card mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {patient.fullName}
              </h1>
              <div className="flex items-center space-x-3">
                <span className={getStatusBadge(patient.status)}>
                  {patient.status.replace('_', ' ')}
                </span>
                <span className="text-gray-600">
                  Priority: <span className="font-semibold">{patient.priority.toUpperCase()}</span>
                </span>
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <div>Submitted: {format(new Date(patient.createdAt), 'MMM dd, yyyy')}</div>
              <div>Updated: {format(new Date(patient.updatedAt), 'MMM dd, yyyy')}</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Age</span>
                  <p className="font-medium">{patient.age} years</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Gender</span>
                  <p className="font-medium capitalize">{patient.gender}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Phone</span>
                  <p className="font-medium">{patient.phone}</p>
                </div>
                {patient.alternatePhone && (
                  <div>
                    <span className="text-sm text-gray-600">Alternate Phone</span>
                    <p className="font-medium">{patient.alternatePhone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Address</h2>
              <p className="text-gray-700">
                {patient.address.street && `${patient.address.street}, `}
                {patient.address.village}, {patient.address.district}
                <br />
                {patient.address.state} {patient.address.pincode && `- ${patient.address.pincode}`}
              </p>
            </div>

            {/* Medical History */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Medical History</h2>
              <div className="space-y-3">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Tobacco Use</span>
                    <p className="font-medium capitalize">{patient.tobaccoUse}</p>
                  </div>
                  {patient.tobaccoDuration && (
                    <div>
                      <span className="text-sm text-gray-600">Duration</span>
                      <p className="font-medium">{patient.tobaccoDuration}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-gray-600">Alcohol Consumption</span>
                    <p className="font-medium capitalize">{patient.alcoholConsumption}</p>
                  </div>
                </div>
                {patient.medicalHistory && (
                  <div>
                    <span className="text-sm text-gray-600">Medical History Notes</span>
                    <p className="text-gray-700 mt-1">{patient.medicalHistory}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Symptoms */}
            {patient.symptoms && patient.symptoms.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Symptoms</h2>
                <div className="flex flex-wrap gap-2">
                  {patient.symptoms.map((symptom, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Oral Examination */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Oral Examination</h2>
              {patient.oralExaminationNotes && (
                <div className="mb-4">
                  <span className="text-sm text-gray-600">Examination Notes</span>
                  <p className="text-gray-700 mt-1">{patient.oralExaminationNotes}</p>
                </div>
              )}

              {patient.mouthImages && patient.mouthImages.length > 0 && (
                <div>
                  <span className="text-sm text-gray-600 block mb-3">Mouth Images</span>
                  <div className="grid md:grid-cols-2 gap-4">
                    {patient.mouthImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.url}
                          alt={`Mouth examination ${index + 1}`}
                          className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(image.url, '_blank')}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                          <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Diagnosis */}
            {diagnosis && (
              <div className="card border-2 border-primary-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Diagnosis</h2>
                
                <div className="mb-4">
                  <span className="text-sm text-gray-600 block mb-2">Diagnosis Result</span>
                  <div className={getDiagnosisResultBadge(diagnosis.diagnosisResult)}>
                    {diagnosis.diagnosisResult.replace('_', ' ').toUpperCase()}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-600 font-semibold">Findings</span>
                    <p className="text-gray-700 mt-1">{diagnosis.findings}</p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600 font-semibold">Recommendations</span>
                    <p className="text-gray-700 mt-1">{diagnosis.recommendations}</p>
                  </div>

                  {diagnosis.severity && (
                    <div>
                      <span className="text-sm text-gray-600">Severity</span>
                      <p className="font-medium capitalize">{diagnosis.severity}</p>
                    </div>
                  )}

                  {diagnosis.treatmentPlan && (
                    <div>
                      <span className="text-sm text-gray-600 font-semibold">Treatment Plan</span>
                      <p className="text-gray-700 mt-1">{diagnosis.treatmentPlan}</p>
                    </div>
                  )}

                  {diagnosis.followUpRequired && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold text-yellow-800">Follow-up Required</span>
                      </div>
                      {diagnosis.followUpDate && (
                        <p className="text-sm text-yellow-700 mt-1">
                          Date: {format(new Date(diagnosis.followUpDate), 'MMM dd, yyyy')}
                        </p>
                      )}
                    </div>
                  )}

                  {diagnosis.referralRequired && diagnosis.referralDetails && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="font-semibold text-red-800">Referral Required</span>
                      </div>
                      <div className="text-sm text-red-700 space-y-1">
                        {diagnosis.referralDetails.hospital && (
                          <p><span className="font-medium">Hospital:</span> {diagnosis.referralDetails.hospital}</p>
                        )}
                        {diagnosis.referralDetails.specialist && (
                          <p><span className="font-medium">Specialist:</span> {diagnosis.referralDetails.specialist}</p>
                        )}
                        {diagnosis.referralDetails.reason && (
                          <p><span className="font-medium">Reason:</span> {diagnosis.referralDetails.reason}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {diagnosis.notes && (
                    <div>
                      <span className="text-sm text-gray-600 font-semibold">Additional Notes</span>
                      <p className="text-gray-700 mt-1">{diagnosis.notes}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <span className="text-sm text-gray-600">Diagnosed by</span>
                    <p className="font-medium">Dr. {diagnosis.doctor.name}</p>
                    <p className="text-sm text-gray-600">{diagnosis.doctor.specialization}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {format(new Date(diagnosis.createdAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Contact Info */}
          <div className="space-y-6">
            {/* Recorded By */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Recorded By</h3>
              <div className="space-y-2">
                <p className="font-medium">{patient.recordedBy.name}</p>
                <p className="text-sm text-gray-600">Asha Worker</p>
                <p className="text-sm text-gray-600">{patient.recordedBy.phone}</p>
                <p className="text-sm text-gray-600">{patient.recordedBy.email}</p>
                {patient.recordedBy.workArea && (
                  <p className="text-sm text-gray-600">Area: {patient.recordedBy.workArea}</p>
                )}
              </div>
            </div>

            {/* Assigned Doctor */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Assigned Doctor</h3>
              <div className="space-y-2">
                <p className="font-medium">Dr. {patient.assignedDoctor.name}</p>
                <p className="text-sm text-gray-600">{patient.assignedDoctor.specialization}</p>
                <p className="text-sm text-gray-600">{patient.assignedDoctor.hospital}</p>
                <p className="text-sm text-gray-600">{patient.assignedDoctor.phone}</p>
                <p className="text-sm text-gray-600">{patient.assignedDoctor.email}</p>
              </div>
            </div>

            {/* Quick Actions */}
            {user.role === 'doctor' && (
              <div className="card">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  {!diagnosis && (
                    <Link
                      to={`/patient/${id}/diagnose`}
                      className="block w-full btn-primary text-center"
                    >
                      Create Diagnosis
                    </Link>
                  )}
                  <a
                    href={`tel:${patient.phone}`}
                    className="block w-full btn-secondary text-center"
                  >
                    Call Patient
                  </a>
                  <a
                    href={`tel:${patient.recordedBy.phone}`}
                    className="block w-full btn-secondary text-center"
                  >
                    Call Asha Worker
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
