import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'sonner';
import { Users, Filter, CheckCircle, XCircle, Search, FileText, ChevronDown, Calendar, FileCheck, ExternalLink } from 'lucide-react';
import InterviewModal from '../components/InterviewModal';
import RejectionModal from '../components/RejectionModal';
import ProfileViewModal from '../components/ProfileViewModal';

const ApplicantTracker = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';
  
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(initialFilter);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [interviewModal, setInterviewModal] = useState({ isOpen: false, id: null, name: '' });
  const [rejectionModal, setRejectionModal] = useState({ isOpen: false, id: null, name: '' });
  const [profileModal, setProfileModal] = useState({ isOpen: false, applicant: null });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await api.get('/jobs');
        setJobs(data);
        // Default stays 'all' if not already set or if jobs exist
      } catch (err) {
        toast.error('Failed to load jobs');
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedJob) {
      const fetchApplicants = async () => {
        setLoading(true);
        try {
          let endpoint = `/applications/job/${selectedJob}`;
          if (selectedJob === 'all') {
            endpoint = '/applicants';
          } else if (selectedJob === 'smart') {
            endpoint = '/applicants/high-matches';
          }
          const { data } = await api.get(endpoint);
          
          // If fetching all or smart, normalize the data structure
          if (selectedJob === 'all' || selectedJob === 'smart') {
            const normalizedData = data.map(applicant => ({
              _id: applicant._id,
              applicant: applicant,
              status: applicant.matchScore ? `Match: ${applicant.matchScore}` : (applicant.status || 'Registered'),
              job: { title: 'None' },
              rating: applicant.rating
            }));
            setApplications(normalizedData);
          } else {
            setApplications(data);
          }
        } catch (err) {
          toast.error('Failed to load applicants');
        } finally {
          setLoading(false);
        }
      };
      fetchApplicants();
    }
  }, [selectedJob]);

  const updateStatus = async (id, status, interviewDetails = null) => {
    try {
      let endpoint = `/applications/${id}/status`;
      if (selectedJob === 'all' || selectedJob === 'smart') {
        endpoint = `/applicants/${id}/status`;
      }
      
      const payload = { status };
      
      // Merge interview details if it's an object
      if (interviewDetails && typeof interviewDetails === 'object') {
        Object.assign(payload, interviewDetails);
      }
      
      // Handle rejection feedback if it's a string
      if (status === 'Rejected' && interviewDetails && typeof interviewDetails === 'string') {
        if (selectedJob === 'all' || selectedJob === 'smart') {
           payload.rejectionReason = interviewDetails;
        } else {
           payload.remarks = interviewDetails;
        }
      }

      await api.put(endpoint, payload);
      toast.success(status === 'Interview' ? 'Interview scheduled successfully' : status === 'Rejected' ? 'Applicant rejected with feedback' : `Applicant updated to ${status}`);
      
      // Close modals
      if (status === 'Interview') {
        setInterviewModal({ isOpen: false, id: null, name: '' });
      }
      if (status === 'Rejected') setRejectionModal({ isOpen: false, id: null, name: '' });

      // Refresh list
      let refreshEndpoint = `/applications/job/${selectedJob}`;
      if (selectedJob === 'all') refreshEndpoint = '/applicants';
      if (selectedJob === 'smart') refreshEndpoint = '/applicants/high-matches';
      
      const { data } = await api.get(refreshEndpoint);
      
      if (selectedJob === 'all' || selectedJob === 'smart') {
        const normalizedData = data.map(applicant => ({
          _id: applicant._id,
          applicant: applicant,
          status: applicant.matchScore ? `Match: ${applicant.matchScore}` : (applicant.status || 'Registered'),
          job: { title: 'None' },
          rating: applicant.rating
        }));
        setApplications(normalizedData);
      } else {
        setApplications(data);
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const updateRating = async (id, rating) => {
    try {
      let endpoint = `/applications/${id}/status`;
      if (selectedJob === 'all' || selectedJob === 'smart') {
        endpoint = `/applicants/${id}/status`;
      }
      
      await api.put(endpoint, { rating });
      toast.success('Rating updated successfully');
      
      let refreshEndpoint = `/applications/job/${selectedJob}`;
      if (selectedJob === 'all') refreshEndpoint = '/applicants';
      if (selectedJob === 'smart') refreshEndpoint = '/applicants/high-matches';
      
      const { data } = await api.get(refreshEndpoint);
      
      if (selectedJob === 'all' || selectedJob === 'smart') {
        const normalizedData = data.map(applicant => ({
          _id: applicant._id,
          applicant: applicant,
          status: applicant.matchScore ? `Match: ${applicant.matchScore}` : (applicant.status || 'Registered'),
          job: { title: 'None' },
          rating: applicant.rating
        }));
        setApplications(normalizedData);
      } else {
        setApplications(data);
      }
    } catch (err) {
      toast.error('Failed to update rating');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Applicant Tracking System</h1>
          <p className="text-gray-500 mt-1">Review profiles and manage the recruitment pipeline.</p>
        </div>
        
        <div className="mt-6 md:mt-0 flex items-center space-x-4 glass-card p-2 rounded-2xl">
          <label className="text-sm font-bold text-gray-500 px-3">Filter by Job:</label>
          <select 
            className="bg-gray-50 border-none rounded-xl text-sm font-bold py-2 focus:ring-0"
            value={selectedJob}
            onChange={(e) => {
              setSelectedJob(e.target.value);
              setSearchParams(e.target.value === 'all' ? {} : { filter: e.target.value });
            }}
          >
            <option value="all">All Applicants (Talent Pool)</option>
            <option value="smart">Smart Screening (High Matches)</option>
            {jobs.map(job => <option key={job._id} value={job._id}>{job.title}</option>)}
          </select>
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden">
        {loading ? <div className="p-20 text-center">Loading applicants...</div> : (
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-white/50">
              <tr>
                <th className="px-6 py-4 text-sm font-bold text-gray-700">Applicant</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Education</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Documents</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700">Status</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700">Rating</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {applications.length > 0 ? applications.map((app) => (
                <tr key={app._id} className="hover:bg-gray-50/50 transition duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center text-blue-700 font-bold mr-3 uppercase">
                        {app.applicant.user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{app.applicant.user.name}</div>
                        <div className="text-xs text-gray-500">{app.applicant.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {app.applicant.education.length > 0 ? (
                      <div 
                        className="text-sm cursor-pointer group"
                        onClick={() => setProfileModal({ isOpen: true, applicant: app.applicant })}
                      >
                        <div className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">{app.applicant.education[0].degree}</div>
                        <div className="text-xs text-gray-500 group-hover:text-blue-500 transition-colors">{app.applicant.education[0].institution}</div>
                        <div className="text-[10px] text-blue-500 font-bold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Click to view full profile</div>
                      </div>
                    ) : <span className="text-xs text-gray-400 italic">Not provided</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-col space-y-1">
                      {app.applicant.resumeUrl && (
                        <a href={app.applicant.resumeUrl.startsWith('http') ? app.applicant.resumeUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${app.applicant.resumeUrl}`} target="_blank" rel="noreferrer" className="flex items-center text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded w-fit font-bold">
                          <FileText className="w-3 h-3 mr-1" /> Resume
                        </a>
                      )}
                      {app.applicant.marksheet12Url && (
                        <a href={app.applicant.marksheet12Url.startsWith('http') ? app.applicant.marksheet12Url : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${app.applicant.marksheet12Url}`} target="_blank" rel="noreferrer" className="flex items-center text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded w-fit font-bold">
                          <FileText className="w-3 h-3 mr-1" /> Marksheet
                        </a>
                      )}
                      {app.applicant.degreeUrl && (
                        <a href={app.applicant.degreeUrl.startsWith('http') ? app.applicant.degreeUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${app.applicant.degreeUrl}`} target="_blank" rel="noreferrer" className="flex items-center text-xs text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-2 py-1 rounded w-fit font-bold">
                          <FileText className="w-3 h-3 mr-1" /> Identity Proof
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span 
                      className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
                        app.status === 'Shortlisted' ? 'bg-blue-100 text-blue-700' :
                        app.status === 'Interview' ? 'bg-purple-100 text-purple-700' :
                        app.status === 'Selected' ? 'bg-green-100 text-green-700' :
                        app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        app.status.startsWith('Match:') ? 'bg-orange-100 text-orange-700 border border-orange-200 shadow-sm' :
                        'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      className="bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold py-1 px-2 focus:ring-2 focus:ring-blue-500"
                      value={app.rating || ''}
                      onChange={(e) => updateRating(app._id, parseInt(e.target.value))}
                    >
                      <option value="">No Rating</option>
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <option key={num} value={num}>{num} / 10</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => updateStatus(app._id, 'Shortlisted')}
                          disabled={app.status === 'Shortlisted'}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Shortlist Applicant"
                        >
                          <Search className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => setInterviewModal({ isOpen: true, id: app._id, name: app.applicant.user.name })}
                          className={`p-2 ${app.status === 'Interview' ? 'text-orange-600 hover:bg-orange-50' : 'text-purple-600 hover:bg-purple-50'} rounded-lg`}
                          title={app.status === 'Interview' ? 'Reschedule Interview' : 'Schedule Interview'}
                        >
                          <Calendar className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => updateStatus(app._id, 'Selected')}
                          disabled={app.status === 'Selected'}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Select Applicant"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => setRejectionModal({ isOpen: true, id: app._id, name: app.applicant.user.name })}
                          disabled={app.status === 'Rejected'}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center text-gray-500">No applicants yet for this position.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <InterviewModal 
        isOpen={interviewModal.isOpen}
        onClose={() => setInterviewModal({ isOpen: false, id: null, name: '' })}
        applicantName={interviewModal.name}
        initialData={(() => {
          const app = applications.find(a => a._id === interviewModal.id);
          if (!app) return null;
          // For job-specific views, interview details are on the application itself
          // For 'all'/'smart' views, they are on the applicant profile
          const source = (selectedJob === 'all' || selectedJob === 'smart') ? app.applicant : app;
          return {
            interviewDate: source.interviewDate || app.applicant?.interviewDate,
            interviewTime: source.interviewTime || app.applicant?.interviewTime,
            interviewVenue: source.interviewVenue || app.applicant?.interviewVenue,
            interviewRequirements: source.interviewRequirements || app.applicant?.interviewRequirements
          };
        })()}
        onConfirm={(details) => updateStatus(interviewModal.id, 'Interview', details)}
      />
      <RejectionModal
        isOpen={rejectionModal.isOpen}
        onClose={() => setRejectionModal({ isOpen: false, id: null, name: '' })}
        applicantName={rejectionModal.name}
        onConfirm={(reason) => updateStatus(rejectionModal.id, 'Rejected', reason)}
      />
      <ProfileViewModal 
        isOpen={profileModal.isOpen}
        onClose={() => setProfileModal({ isOpen: false, applicant: null })}
        applicant={profileModal.applicant}
      />
    </div>
  );
};

export default ApplicantTracker;
