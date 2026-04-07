import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Briefcase, Calendar, MapPin, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const JobManager = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const { data } = await api.get('/jobs');
      setJobs(data);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job requirement?')) {
      try {
        await api.delete(`/jobs/${id}`);
        toast.success('Job removed successfully');
        fetchJobs();
      } catch (error) {
        toast.error('Failed to delete job');
      }
    }
  };

  if (loading) return <div className="p-10 text-center">Loading jobs...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Job Postings</h1>
        <Link to="/admin/jobs/new" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center hover:bg-blue-700 transition">
          <Plus className="w-5 h-5 mr-2" />
          Add New Job
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-gray-700">Job Title</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700">Department</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700">Deadline</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700">Status</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {jobs.map((job) => (
              <tr key={job._id} className="hover:bg-gray-50/50 transition">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{job.title}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {job.department}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {new Date(job.deadline).toLocaleDateString()}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    job.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <Link to={`/admin/jobs/edit/${job._id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button onClick={() => handleDelete(job._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobManager;
