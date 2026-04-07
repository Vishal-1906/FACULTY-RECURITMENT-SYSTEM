import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import NotificationHandler from './components/NotificationHandler';
import Login from './pages/Login';
import Register from './pages/Register';
import ApplicantDashboard from './pages/ApplicantDashboard';
import ProfileEditor from './pages/ProfileEditor';
import JobBoard from './pages/JobBoard';
import AdminDashboard from './pages/AdminDashboard';
import JobManager from './pages/JobManager';
import JobForm from './pages/JobForm';
import ApplicantTracker from './pages/ApplicantTracker';
import FacultyDirectory from './pages/FacultyDirectory';
import { PrivateRoute, AdminRoute } from './components/ProtectedRoute';
import { Toaster } from 'sonner';
import { Bell, TrendingUp, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

// Placeholder Pages
const Home = () => (
  <div className="bg-white">
    {/* Hero Section */}
    <div className="relative overflow-hidden bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl mb-6">
            Elite Faculty Recruitment <span className="text-blue-600">Simplified.</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 mb-10">
            RecruitFlow is the industry-leading platform for modern colleges. Seamlessly manage the entire recruitment lifecycle from job post to faculty induction.
          </p>
          <div className="flex items-center justify-center gap-x-6">
            <Link to="/register" className="rounded-2xl bg-gray-900 px-8 py-4 text-sm font-bold text-white shadow-xl hover:bg-gray-800 transition">Get Started</Link>
            <Link to="/login" className="text-sm font-bold leading-6 text-gray-900">Explore vacanies <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </div>
      {/* Abstract Background Element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-50/50 rounded-full blur-3xl opacity-50 -z-0"></div>
    </div>

    {/* Features Section */}
    <div className="py-24 bg-gray-50 border-y border-gray-100">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="bg-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-100">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-4">Pipeline Analytics</h3>
            <p className="text-gray-600 text-sm">Real-time charts and data visualization to track conversion rates at every recruitment stage.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="bg-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-100">
              <Bell className="text-white w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-4">Live Notifications</h3>
            <p className="text-gray-600 text-sm">Applicants stay informed instantly with Socket.io powered real-time alerts for interviews and offers.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="bg-purple-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-100">
              <UserCheck className="text-white w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-4">Smart Screening</h3>
            <p className="text-gray-600 text-sm">Advanced research-match metrics help identify top PhD candidates faster than manual screening.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);



const App = () => {
  return (
    <div className="min-h-screen">
      <div className="bg-blobs">
        <div className="bg-blob-1"></div>
        <div className="bg-blob-2"></div>
      </div>
      <Toaster position="top-right" richColors />
      <NotificationHandler />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Applicant Protected Routes */}
        <Route path="/applicant/dashboard" element={
          <PrivateRoute>
            <ApplicantDashboard />
          </PrivateRoute>
        } />
        <Route path="/applicant/profile" element={
          <PrivateRoute>
            <ProfileEditor />
          </PrivateRoute>
        } />
        <Route path="/applicant/jobs" element={
          <PrivateRoute>
            <JobBoard />
          </PrivateRoute>
        } />

        {/* Admin Protected Routes */}
        <Route path="/admin/dashboard" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/admin/jobs" element={
          <AdminRoute>
            <JobManager />
          </AdminRoute>
        } />
        <Route path="/admin/jobs/new" element={
          <AdminRoute>
            <JobForm />
          </AdminRoute>
        } />
        <Route path="/admin/jobs/edit/:id" element={
          <AdminRoute>
            <JobForm />
          </AdminRoute>
        } />
        <Route path="/admin/applicants" element={
          <AdminRoute>
            <ApplicantTracker />
          </AdminRoute>
        } />
        <Route path="/admin/faculty" element={
          <AdminRoute>
            <FacultyDirectory />
          </AdminRoute>
        } />
      </Routes>
    </div>
  );
};

export default App;
