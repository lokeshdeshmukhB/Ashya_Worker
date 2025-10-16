import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  const filterPatients = () => {
    if (filter === 'all') {
      setFilteredPatients(patients);
    } else {
      setFilteredPatients(patients.filter(p => p.status === filter));
    }
  };

  const updateStatus = async (patientId, status) => {
    try {
      await axios.put(`/api/patients/${patientId}/status`, { status });
      toast.success('Status updated successfully');
      fetchPatients();
    } catch (error) {
      toast.error('Error updating status');
      console.error(error);
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

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      urgent: 'text-red-600'
    };
    return colors[priority] || 'text-gray-600';
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
            <h1 className="text-xl font-bold text-primary-600">Doctor Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Dr. {user.name}</span>
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
            <div className="text-blue-100 mt-1">Total Patients</div>
          </div>
          <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <div className="text-3xl font-bold">{stats.pending}</div>
            <div className="text-yellow-100 mt-1">Pending Review</div>
          </div>
          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="text-3xl font-bold">{stats.underReview}</div>
            <div className="text-purple-100 mt-1">Under Review</div>
          </div>
          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="text-3xl font-bold">{stats.diagnosed}</div>
            <div className="text-green-100 mt-1">Diagnosed</div>
          </div>
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
              All Patients
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
              onClick={() => setFilter('under_review')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'under_review'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Under Review
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
          </div>
        </div>

        {/* Patients List */}
        <div className="space-y-4">
          {filteredPatients.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500 text-lg">No patients found</p>
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
                      <span className={`font-semibold ${getPriorityColor(patient.priority)}`}>
                        {patient.priority.toUpperCase()}
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
                        <span className="font-medium">Tobacco Use:</span> {patient.tobaccoUse}
                      </div>
                      <div>
                        <span className="font-medium">Recorded By:</span> {patient.recordedBy?.name}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span>{' '}
                        {format(new Date(patient.createdAt), 'MMM dd, yyyy')}
                      </div>
                    </div>

                    {patient.symptoms && patient.symptoms.length > 0 && (
                      <div className="mb-3">
                        <span className="font-medium text-sm text-gray-700">Symptoms: </span>
                        <span className="text-sm text-gray-600">
                          {patient.symptoms.join(', ')}
                        </span>
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
                      <button
                        onClick={() => updateStatus(patient._id, 'under_review')}
                        className="btn-secondary text-center whitespace-nowrap"
                      >
                        Mark Under Review
                      </button>
                    )}
                    
                    {(patient.status === 'pending' || patient.status === 'under_review') && (
                      <Link
                        to={`/patient/${patient._id}/diagnose`}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-center whitespace-nowrap"
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
  );
};

export default DoctorDashboard;
