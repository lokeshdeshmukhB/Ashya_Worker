import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'asha_worker',
    // Doctor fields
    specialization: '',
    licenseNumber: '',
    hospital: '',
    // Asha worker fields
    workArea: '',
    employeeId: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      role: formData.role
    };

    if (formData.role === 'doctor') {
      userData.specialization = formData.specialization;
      userData.licenseNumber = formData.licenseNumber;
      userData.hospital = formData.hospital;
    } else {
      userData.workArea = formData.workArea;
      userData.employeeId = formData.employeeId;
    }

    const result = await register(userData);

    if (result.success) {
      toast.success('Registration successful!');
      if (result.user.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (result.user.role === 'asha_worker') {
        navigate('/asha-worker/dashboard');
      }
    } else {
      toast.error(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="mt-2 text-gray-600">Join the oral cancer detection initiative</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'asha_worker' })}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    formData.role === 'asha_worker'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-semibold">Asha Worker</div>
                  <div className="text-sm text-gray-600">Community Health Worker</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'doctor' })}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    formData.role === 'doctor'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-semibold">Doctor</div>
                  <div className="text-sm text-gray-600">Medical Professional</div>
                </button>
              </div>
            </div>

            {/* Common Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter your email"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Min. 6 characters"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Confirm password"
                />
              </div>
            </div>

            {/* Doctor Specific Fields */}
            {formData.role === 'doctor' && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-gray-900">Doctor Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                      Specialization *
                    </label>
                    <input
                      id="specialization"
                      name="specialization"
                      type="text"
                      required
                      value={formData.specialization}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="e.g., Oncology, Dentistry"
                    />
                  </div>

                  <div>
                    <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      License Number *
                    </label>
                    <input
                      id="licenseNumber"
                      name="licenseNumber"
                      type="text"
                      required
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Medical license number"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="hospital" className="block text-sm font-medium text-gray-700 mb-2">
                    Hospital/Clinic *
                  </label>
                  <input
                    id="hospital"
                    name="hospital"
                    type="text"
                    required
                    value={formData.hospital}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Hospital or clinic name"
                  />
                </div>
              </div>
            )}

            {/* Asha Worker Specific Fields */}
            {formData.role === 'asha_worker' && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-gray-900">Asha Worker Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="workArea" className="block text-sm font-medium text-gray-700 mb-2">
                      Work Area *
                    </label>
                    <input
                      id="workArea"
                      name="workArea"
                      type="text"
                      required
                      value={formData.workArea}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Village/Area name"
                    />
                  </div>

                  <div>
                    <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-2">
                      Employee ID *
                    </label>
                    <input
                      id="employeeId"
                      name="employeeId"
                      type="text"
                      required
                      value={formData.employeeId}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Your employee ID"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>

          <div className="mt-6">
            <Link
              to="/"
              className="flex items-center justify-center text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
