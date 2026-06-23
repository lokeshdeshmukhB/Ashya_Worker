import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinkClass = (path) => `
    px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
    ${isActive(path) 
      ? 'bg-primary-50 text-primary-700' 
      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'}
  `;

  const mobileNavLinkClass = (path) => `
    block px-3 py-2 rounded-md text-base font-medium
    ${isActive(path)
      ? 'bg-primary-50 text-primary-700'
      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'}
  `;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
                    <span>+</span>
                  </div>
                  <span className="font-display font-bold text-xl text-gray-900 tracking-tight">
                    OralScan<span className="text-primary-600">AI</span>
                  </span>
                </Link>
              </div>
              
              {/* Desktop Navigation */}
              {user && (
                <div className="hidden sm:ml-8 sm:flex sm:space-x-4 sm:items-center">
                  {user.role === 'doctor' && (
                    <>
                      <Link to="/doctor/dashboard" className={navLinkClass('/doctor/dashboard')}>
                        Dashboard
                      </Link>
                      {/* Add more doctor links here */}
                    </>
                  )}
                  {user.role === 'asha_worker' && (
                    <>
                      <Link to="/asha-worker/dashboard" className={navLinkClass('/asha-worker/dashboard')}>
                        Dashboard
                      </Link>
                      <Link to="/patient/new" className={navLinkClass('/patient/new')}>
                        New Patient
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                    <span className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                    title="Logout"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium text-sm">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary py-2 px-4 text-sm shadow-none hover:shadow-md">
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden bg-white border-t border-gray-200">
            <div className="pt-2 pb-3 space-y-1 px-4">
              {user ? (
                <>
                  {user.role === 'doctor' && (
                    <Link
                      to="/doctor/dashboard"
                      className={mobileNavLinkClass('/doctor/dashboard')}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  {user.role === 'asha_worker' && (
                    <>
                      <Link
                        to="/asha-worker/dashboard"
                        className={mobileNavLinkClass('/asha-worker/dashboard')}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/patient/new"
                        className={mobileNavLinkClass('/patient/new')}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        New Patient
                      </Link>
                    </>
                  )}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex items-center px-3 mb-3">
                      <div className="ml-3">
                        <div className="text-base font-medium text-gray-800">{user.name}</div>
                        <div className="text-sm font-medium text-gray-500 capitalize">{user.role.replace('_', ' ')}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-2 pt-2">
                  <Link
                    to="/login"
                    className="block w-full text-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 border border-gray-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full text-center px-3 py-2 rounded-md text-base font-medium bg-primary-600 text-white hover:bg-primary-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} OralScan AI. Empowering Rural Healthcare.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
