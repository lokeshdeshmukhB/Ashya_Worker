import React, { useState, useEffect } from 'react';
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

  const filterPatients = () => {
    if (filter === 'all') {
      setFilteredPatients(patients);
    } else if (filter === 'pending') {
      setFilteredPatients(patients.filter(p => p.status === 'pending' || p.status === 'under_review'));
    } else {
      setFilteredPatients(patients.filter(p => p.status === filter));
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
      negative: 'bg-green-100 text-green-800',
      suspicious: 'bg-yellow-100 text-yellow-800',
      positive: 'bg-red-100 text-red-800',
      requires_biopsy: 'bg-orange-100 text-orange-800'
    };
    return `badge ${badges[result] || ''}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-primary-600">Asha Worker Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user.name}</span>
              <button
                onClick={logout}
                className="text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="text-blue-100 mt-1">Total Records</div>
          </div>
          <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <div className="text-3xl font-bold">{stats.pending}</div>
            <div className="text-yellow-100 mt-1">Pending Review</div>
          </div>
          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="text-3xl font-bold">{stats.diagnosed}</div>
            <div className="text-green-100 mt-1">Diagnosed</div>
          </div>
          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="text-3xl font-bold">{stats.followUp}</div>
            <div className="text-purple-100 mt-1">Follow-up Required</div>
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
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Records
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('diagnosed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'diagnosed'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Diagnosed
            </button>
            <button
              onClick={() => setFilter('follow_up_required')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'follow_up_required'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Follow-up
            </button>
          </div>
        </div>

        {/* Patients List */}
        <div className="space-y-4">
          {filteredPatients.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No patient records found</p>
              <Link to="/patient/new" className="btn-primary">
                Add Your First Patient
              </Link>
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <div key={patient._id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {patient.fullName}
                      </h3>
                      <span className={getStatusBadge(patient.status)}>
                        {patient.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">Age:</span> {patient.age} years
                      </div>
                      <div>
                        <span className="font-medium">Gender:</span> {patient.gender}
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span> {patient.phone}
                      </div>
                      <div>
                        <span className="font-medium">Village:</span> {patient.address?.village || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Doctor:</span> {patient.assignedDoctor?.name}
                      </div>
                      <div>
                        <span className="font-medium">Submitted:</span>{' '}
                        {format(new Date(patient.createdAt), 'MMM dd, yyyy')}
                      </div>
                    </div>

                    {patient.diagnosis && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-gray-700">Diagnosis Result:</span>
                          <span className={getDiagnosisResultBadge(patient.diagnosis.diagnosisResult)}>
                            {patient.diagnosis.diagnosisResult.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        {patient.diagnosis.findings && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Findings:</span> {patient.diagnosis.findings}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <Link
                      to={`/patient/${patient._id}`}
                      className="btn-primary text-center whitespace-nowrap"
                    >
                      View Details
                    </Link>
                    
                    {patient.status === 'pending' && (
                      <Link
                        to={`/patient/${patient._id}`}
                        className="btn-secondary text-center whitespace-nowrap"
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
  );
};

export default AshaWorkerDashboard;
