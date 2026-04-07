import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  User, 
  Briefcase, 
  CheckCircle, 
  Clock, 
  ChevronRight, 
  PlusCircle, 
  FileText,
  ShieldCheck,
  Calendar,
  MapPin,
  ListChecks,
  Users,
  Trash2,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const ApplicantDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileRes, appsRes] = await Promise.all([
          api.get('/applicants/profile'),
          api.get('/applications/my-applications')
        ]);
        setProfile(profileRes.data);
        setApplications(appsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to delete your resume?')) return;
    setDeleting(true);
    try {
      await api.delete('/applicants/documents/resume');
      setProfile(prev => ({ ...prev, resumeUrl: '', profileComplete: false }));
      toast.success('Resume deleted successfully');
    } catch (error) {
      toast.error('Failed to delete resume');
    } finally {
      setDeleting(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    try {
      const { data } = await api.post('/applicants/upload-documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(prev => ({ ...prev, resumeUrl: data.resumeUrl }));
      toast.success('Resume uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading your dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.name}</h1>
          <p className="text-gray-600">Track your applications and update your profile</p>
        </div>
        <Link to="/applicant/profile" className="mt-4 md:mt-0 flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition shadow-md shadow-blue-100">
          <User className="w-4 h-4 mr-2" />
          Edit Profile
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stats: Applied Positions */}
        <div className="glass-card p-6 rounded-2xl flex items-center space-x-4 h-full">
          <div className="bg-blue-100 p-3 rounded-xl">
            <CheckCircle className="text-blue-600 w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Applied Positions</p>
            <p className="text-2xl font-bold text-gray-900">
              {Math.max(applications.length, (profile?.status && profile?.status !== 'Registered' ? 1 : 0))}
            </p>
          </div>
        </div>

        {/* Stats: Interviews Scheduled */}
        <div className="glass-card p-6 rounded-2xl flex items-center space-x-4 h-full">
          <div className="bg-orange-100 p-3 rounded-xl">
            <Clock className="text-orange-600 w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Interviews Scheduled</p>
            <p className="text-2xl font-bold text-gray-900">
              {applications.filter(a => a.status === 'Interview').length || (profile?.status === 'Interview' ? 1 : 0)}
            </p>
          </div>
        </div>

        {/* Stats: Profile Rating */}
        <div className="glass-card p-6 rounded-2xl flex items-center space-x-4 h-full">
          <div className="bg-yellow-100 p-3 rounded-xl flex items-center justify-center">
            <span className="text-xl">⭐</span>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Profile Rating</p>
            <p className="text-2xl font-bold text-gray-900">
              {profile?.rating ? `${profile.rating}/10` : 'Unrated'}
            </p>
          </div>
        </div>

        {/* Profile Progress & Status */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-center h-full">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-semibold">Profile Status</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              profile?.status === 'Selected' ? 'bg-green-100 text-green-700' :
              profile?.status === 'Rejected' ? 'bg-red-100 text-red-700' :
              profile?.status === 'Interview' ? 'bg-purple-100 text-purple-700' :
              profile?.status === 'Shortlisted' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {profile?.status || 'Registered'}
            </span>
          </div>
          
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${
                  profile?.status === 'Selected' ? 'text-green-600 bg-green-50' :
                  profile?.status === 'Rejected' ? 'text-red-600 bg-red-50' :
                  'text-blue-600 bg-blue-50'
                }`}>
                  {profile?.status === 'Selected' ? 'Hired' :
                   profile?.status === 'Rejected' ? 'Closed' :
                   profile?.status === 'Interview' ? 'Interview Stage' :
                   profile?.status === 'Shortlisted' ? 'Processing' :
                   'Applied'}
                </span>
              </div>
              <div className="text-right">
                <span className={`text-xs font-semibold inline-block ${
                  profile?.status === 'Selected' ? 'text-green-600' :
                  profile?.status === 'Rejected' ? 'text-red-600' :
                  'text-blue-600'
                }`}>
                  {profile?.status === 'Selected' ? '100%' :
                   profile?.status === 'Rejected' ? '100%' :
                   profile?.status === 'Interview' ? '75%' :
                   profile?.status === 'Shortlisted' ? '50%' :
                   '25%'}
                </span>
              </div>
            </div>
            <div className={`overflow-hidden h-2 mb-4 text-xs flex rounded ${
              profile?.status === 'Selected' ? 'bg-green-100' :
              profile?.status === 'Rejected' ? 'bg-red-100' :
              'bg-blue-100'
            }`}>
              <div 
                style={{ 
                  width: profile?.status === 'Selected' || profile?.status === 'Rejected' ? "100%" : 
                         profile?.status === 'Interview' ? "75%" : 
                         profile?.status === 'Shortlisted' ? "50%" : "25%" 
                }} 
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${
                  profile?.status === 'Selected' ? 'bg-green-500' :
                  profile?.status === 'Rejected' ? 'bg-red-500' :
                  'bg-blue-500'
                }`}
              ></div>
            </div>
          </div>

          {/* Rejection Feedback */}
          {profile?.status === 'Rejected' && (profile?.rejectionReason || applications.find(a => a.status === 'Rejected')?.remarks) && (
            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Feedback from Admin</p>
              <p className="text-sm text-red-700 italic">
                "{profile?.rejectionReason || applications.find(a => a.status === 'Rejected')?.remarks}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Interview Details Card */}
      {(profile?.status === 'Interview' || applications.some(a => a.status === 'Interview')) && (
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-purple-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-4 flex-1">
              <div className="inline-flex items-center px-4 py-1 rounded-full bg-white/20 backdrop-blur-md text-sm font-bold uppercase tracking-wider">
                <Calendar className="w-4 h-4 mr-2" /> Upcoming Interview
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">Interview Scheduled!</h2>
              <div className="grid sm:grid-cols-2 gap-6 mt-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm">
                    <Calendar className="w-5 h-5 text-purple-200" />
                  </div>
                  <div>
                    <p className="text-xs text-purple-200 font-medium uppercase">Date</p>
                    <p className="font-bold text-lg">
                      {new Date(profile?.interviewDate || applications.find(a => a.status === 'Interview')?.interviewDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm">
                    <Clock className="w-5 h-5 text-blue-200" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-200 font-medium uppercase">Time</p>
                    <p className="font-bold text-lg">
                      {profile?.interviewTime || applications.find(a => a.status === 'Interview')?.interviewTime || 'TBA'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm">
                    <MapPin className="w-5 h-5 text-red-200" />
                  </div>
                  <div>
                    <p className="text-xs text-red-200 font-medium uppercase">Venue / Location</p>
                    <p className="font-bold text-lg">
                      {profile?.interviewVenue || applications.find(a => a.status === 'Interview')?.interviewVenue || 'TBA'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm">
                    <ListChecks className="w-5 h-5 text-green-200" />
                  </div>
                  <div>
                    <p className="text-xs text-green-200 font-medium uppercase">Special Requirements</p>
                    <p className="font-bold text-lg leading-tight">
                      {profile?.interviewRequirements || applications.find(a => a.status === 'Interview')?.interviewRequirements || 'No special requirements.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
               <div className="bg-white/10 p-6 rounded-full border-4 border-white/5 animate-pulse">
                  <Calendar className="w-20 h-20 text-white" />
               </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 grid lg:grid-cols-3 gap-8">
        {/* Application History */}
        <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-100/50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Recent Applications</h2>
            <Link to="/applicant/jobs" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center">
              View All Postings <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {applications.length > 0 ? applications.map((app) => (
              <div key={app._id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <Briefcase className="text-blue-600 w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{app.job.title}</h3>
                    <p className="text-sm text-gray-500">{app.job.department}</p>
                  </div>
                </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      app.status === 'Selected' ? 'bg-green-100 text-green-800' :
                      app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      app.status === 'Interview' ? 'bg-purple-100 text-purple-800' :
                      app.status === 'Shortlisted' ? 'bg-blue-100 text-blue-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {app.status}
                    </span>
                    {app.rating && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                        ⭐ {app.rating}/10
                      </span>
                    )}
                    {app.status === 'Interview' && app.interviewDate && (
                      <p className="text-[10px] text-purple-600 font-bold mt-1 uppercase">
                        Scheduled: {new Date(app.interviewDate).toLocaleDateString()}
                      </p>
                    )}
                    {app.status === 'Rejected' && app.remarks && (
                      <p className="text-[10px] text-red-600 italic mt-1 max-w-[200px] truncate ml-auto">
                        "{app.remarks}"
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">Applied on {new Date(app.createdAt).toLocaleDateString()}</p>
                  </div>
              </div>
            )) : profile?.status && profile?.status !== 'Registered' ? (
              <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition border-l-4 border-blue-500">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <Users className="text-blue-600 w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">General Recruitment</h3>
                    <p className="text-sm text-gray-500">Talent Pool / Smart Matching</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    profile.status === 'Selected' ? 'bg-green-100 text-green-800' :
                    profile.status === 'Interview' ? 'bg-purple-100 text-purple-800' :
                    profile.status === 'Shortlisted' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {profile.status}
                  </span>
                  {profile.status === 'Rejected' && profile.rejectionReason && (
                    <p className="text-[10px] text-red-600 italic mt-1 max-w-[200px] truncate ml-auto">
                      "{profile.rejectionReason}"
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">Recruitment Active</p>
                </div>
              </div>
            ) : (
              <div className="p-10 text-center text-gray-500">
                <p>No applications found.</p>
                <Link to="/applicant/jobs" className="mt-4 inline-block text-blue-600 font-medium">Explore vacancies</Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Tips or Notification Hub */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
          <h2 className="text-lg font-bold mb-4 flex items-center">
            <PlusCircle className="mr-2 w-5 h-5" /> Quick Tips
          </h2>
          <ul className="space-y-4 text-blue-50">
            <li className="flex items-start">
              <div className="bg-white/20 p-1 rounded mr-3 mt-1">
                <CheckCircle className="w-3 h-3" />
              </div>
              <p className="text-sm font-medium">Keep your research papers updated to improve matching.</p>
            </li>
            <li className="flex items-start">
              <div className="bg-white/20 p-1 rounded mr-3 mt-1">
                <CheckCircle className="w-3 h-3" />
              </div>
              <p className="text-sm font-medium">Prepare for technical interviews by reviewing core concepts.</p>
            </li>
            <li className="flex items-start">
              {!profile?.resumeUrl && (
                <div className="flex items-start space-x-3 text-white/90">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium">Upload your Resume for screening.</p>
                </div>
              )}
            </li>
          </ul>
          
          <div className="mt-10 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
            <h3 className="font-bold flex items-center mb-2">
              <FileText className="mr-2 w-4 h-4" /> My Resume
            </h3>
            <p className="text-xs text-blue-100 mb-3">
              {profile?.resumeUrl ? "Your resume is uploaded and ready." : "Ensure your resume is up-to-date and clear."}
            </p>
            {profile?.resumeUrl ? (
              <div className="space-y-3">
                <a 
                  href={profile.resumeUrl.startsWith('http') ? profile.resumeUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${profile.resumeUrl}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="block w-full bg-white text-blue-700 text-xs font-bold py-2.5 rounded-lg hover:bg-blue-50 transition text-center shadow-sm"
                >
                  View My Resume
                </a>
                <div className="flex gap-2">
                  <button 
                    onClick={() => document.getElementById('resume-upload-dash').click()}
                    disabled={uploading}
                    className="flex-1 flex items-center justify-center bg-blue-500/20 hover:bg-blue-500/30 text-white text-[10px] font-bold py-2 rounded-lg transition"
                  >
                    {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                    {uploading ? 'Uploading...' : 'Reupload'}
                  </button>
                  <button 
                    onClick={handleDeleteResume}
                    disabled={deleting}
                    className="flex-1 flex items-center justify-center bg-red-500/20 hover:bg-red-500/30 text-white text-[10px] font-bold py-2 rounded-lg transition"
                  >
                    {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3 mr-1" />}
                    Delete
                  </button>
                </div>
                <input 
                  type="file" 
                  id="resume-upload-dash" 
                  className="hidden" 
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <button 
                  onClick={() => document.getElementById('resume-upload-dash-new').click()}
                  disabled={uploading}
                  className="block w-full bg-white text-blue-700 text-xs font-bold py-2.5 rounded-lg hover:bg-blue-50 transition text-center"
                >
                  {uploading ? 'Uploading...' : 'Upload Resume Now'}
                </button>
                <input 
                  type="file" 
                  id="resume-upload-dash-new" 
                  className="hidden" 
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDashboard;
