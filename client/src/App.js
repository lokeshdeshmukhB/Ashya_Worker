import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorDashboard from './pages/DoctorDashboard';
import AshaWorkerDashboard from './pages/AshaWorkerDashboard';
import PatientForm from './pages/PatientForm';
import PatientDetails from './pages/PatientDetails';
import DiagnosisForm from './pages/DiagnosisForm';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-neutral-50">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route
                path="/doctor/dashboard"
                element={
                  <PrivateRoute role="doctor">
                    <DoctorDashboard />
                  </PrivateRoute>
                }
              />
              
              <Route
                path="/asha-worker/dashboard"
                element={
                  <PrivateRoute role="asha_worker">
                    <AshaWorkerDashboard />
                  </PrivateRoute>
                }
              />
              
              <Route
                path="/patient/new"
                element={
                  <PrivateRoute role="asha_worker">
                    <PatientForm />
                  </PrivateRoute>
                }
              />
              
              <Route
                path="/patient/:id"
                element={
                  <PrivateRoute>
                    <PatientDetails />
                  </PrivateRoute>
                }
              />
              
              <Route
                path="/patient/:id/diagnose"
                element={
                  <PrivateRoute role="doctor">
                    <DiagnosisForm />
                  </PrivateRoute>
                }
              />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
