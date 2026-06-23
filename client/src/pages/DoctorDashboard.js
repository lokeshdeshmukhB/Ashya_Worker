import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const DoctorDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    diagnosed: 0
  });
  const { user } = useAuth();

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
        pending: patientsData.filter(p => p.status === 'pending').length,
        underReview: patientsData.filter(p => p.status === 'under_review').length,
        diagnosed: patientsData.filter(p => p.status === 'diagnosed').length
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
    } else {
      setFilteredPatients(patients.filter(p => p.status === filter));
    }
  }, [filter, patients]);

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      under_review: 'bg-blue-100 text-blue-800 border-blue-200',
      diagnosed: 'bg-green-100 text-green-800 border-green-200',
      follow_up_required: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return `px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${badges[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`;
  };



  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/patients/${id}/status`, { status });
      toast.success('Patient status updated');
      fetchPatients();
    } catch (error) {
      toast.error('Error updating status');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Section */}
        <div className="mb-8 bg-gradient-to-r from-primary-700 to-primary-900 rounded-2xl p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold text-white">Doctor Dashboard</h1>
          <p className="mt-2 text-primary-100">Welcome back, Dr. {user.name}. Here's an overview of your patients.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full text-primary-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending Review</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full text-yellow-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Under Review</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.underReview}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
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
        </div>

        {/* Filters & Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900">Patient Records</h2>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'pending'
                    ? 'bg-yellow-500 text-white shadow-md'
                    : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('under_review')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'under_review'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                Under Review
              </button>
              <button
                onClick={() => setFilter('diagnosed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'diagnosed'
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                Diagnosed
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredPatients.length === 0 ? (
              <div className="p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No patients found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your filters.</p>
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
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {format(new Date(patient.createdAt), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        to={`/patient/${patient._id}`}
                        className="btn-outline text-sm py-2 px-4"
                      >
                        View Details
                      </Link>
                      
                      {patient.status === 'pending' && (
                        <button
                          onClick={() => updateStatus(patient._id, 'under_review')}
                          className="btn-secondary text-sm py-2 px-4 shadow-sm"
                        >
                          Mark Under Review
                        </button>
                      )}
                      
                      {(patient.status === 'pending' || patient.status === 'under_review') && (
                        <Link
                          to={`/patient/${patient._id}/diagnose`}
                          className="btn-primary text-sm py-2 px-4 shadow-sm"
                        >
                          Diagnose
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

export default DoctorDashboard;
