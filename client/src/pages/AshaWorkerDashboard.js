import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const AshaWorkerDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    diagnosed: 0,
    followUp: 0
  });
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [filter, patients]);

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/api/patients');
      const patientsData = response.data.data;
      setPatients(patientsData);
      
      // Calculate stats
      const stats = {
        total: patientsData.length,
        pending: patientsData.filter(p => p.status === 'pending' || p.status === 'under_review').length,
        diagnosed: patientsData.filter(p => p.status === 'diagnosed').length,
        followUp: patientsData.filter(p => p.status === 'follow_up_required').length
      };
      setStats(stats);
    } catch (error) {
      toast.error('Error fetching patients');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = useCallback(() => {
    if (filter === 'all') {
      setFilteredPatients(patients);
    } else if (filter === 'pending') {
      setFilteredPatients(patients.filter(p => p.status === 'pending' || p.status === 'under_review'));
    } else {
      setFilteredPatients(patients.filter(p => p.status === filter));
    }
  }, [filter, patients]);

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
      negative: 'bg-green-100 text-green-800',
      suspicious: 'bg-yellow-100 text-yellow-800',
      positive: 'bg-red-100 text-red-800',
      requires_biopsy: 'bg-orange-100 text-orange-800'
    };
    return `badge ${badges[result] || ''}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Section */}
        <div className="mb-8 bg-gradient-to-r from-secondary-600 to-secondary-800 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Asha Worker Dashboard</h1>
              <p className="mt-2 text-secondary-100">Welcome back, {user.name}. Manage your community health records.</p>
            </div>
            <Link
              to="/patient/new"
              className="bg-white text-secondary-700 px-6 py-3 rounded-lg font-bold shadow-md hover:bg-secondary-50 transition-all transform hover:-translate-y-0.5 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Patient
            </Link>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Records</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full text-primary-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-accent-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending Review</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pending}</p>
              </div>
              <div className="p-3 bg-accent-50 rounded-full text-accent-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Diagnosed</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.diagnosed}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-secondary-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Follow-up</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.followUp}</p>
              </div>
              <div className="p-3 bg-secondary-50 rounded-full text-secondary-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mb-6">
          <Link
            to="/patient/new"
            className="inline-flex items-center btn-primary text-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Patient Record
          </Link>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all shadow-sm ${
                filter === 'all'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              All Records
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all shadow-sm ${
                filter === 'pending'
                  ? 'bg-accent-500 text-gray-900 shadow-md'
                  : 'bg-white text-gray-700 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('diagnosed')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all shadow-sm ${
                filter === 'diagnosed'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              Diagnosed
            </button>
            <button
              onClick={() => setFilter('follow_up_required')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all shadow-sm ${
                filter === 'follow_up_required'
                  ? 'bg-secondary-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              Follow-up
            </button>
          </div>
        </div>

          <div className="divide-y divide-gray-100">
            {filteredPatients.length === 0 ? (
              <div className="p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No patient records found</h3>
                <p className="mt-1 text-sm text-gray-500">Add a new patient to get started.</p>
                <div className="mt-6">
                  <Link to="/patient/new" className="btn-primary inline-flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Patient
                  </Link>
                </div>
              </div>
            ) : (
              filteredPatients.map((patient) => (
                <div key={patient._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{patient.fullName}</h3>
                        <span className={getStatusBadge(patient.status)}>
                          {patient.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {patient.gender}, {patient.age} yrs
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {patient.phone}
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {patient.address?.village || 'N/A'}
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Dr. {patient.assignedDoctor?.name}
                        </div>
                      </div>

                      {patient.diagnosis && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <span className="font-medium text-gray-700">Diagnosis:</span>
                          <span className={getDiagnosisResultBadge(patient.diagnosis.diagnosisResult)}>
                            {patient.diagnosis.diagnosisResult.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Link
                        to={`/patient/${patient._id}`}
                        className="btn-outline text-sm py-2 px-4 text-center"
                      >
                        View Details
                      </Link>
                      
                      {patient.status === 'pending' && (
                        <Link
                          to={`/patient/${patient._id}/edit`}
                          className="btn-secondary text-sm py-2 px-4 text-center"
                        >
                          Edit Record
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AshaWorkerDashboard;
