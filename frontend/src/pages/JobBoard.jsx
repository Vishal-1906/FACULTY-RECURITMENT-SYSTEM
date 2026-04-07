import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import { Search, Briefcase, MapPin, Calendar, ArrowRight, Loader2, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const JobBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const { user } = useAuth();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await api.get('/jobs');
        setJobs(data);
      } catch (error) {
        toast.error('Failed to load job postings');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleApply = async (jobId) => {
    setApplying(jobId);
    try {
      await api.post(`/applications/apply/${jobId}`);
      toast.success('Application submitted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(null);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'All' || job.department === filterDept;
    return matchesSearch && matchesDept;
  });

  const departments = ['All', ...new Set(jobs.map(j => j.department))];

  if (loading) return <div className="p-10 text-center">Loading vacancies...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Available Faculty Positions</h1>
        <p className="text-lg text-gray-600">Find your next academic role in specialized departments.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search by title or department..."
            className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select 
              className="pl-9 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-700"
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
            >
              {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredJobs.length > 0 ? filteredJobs.map((job) => (
          <div key={job._id} className="group glass-card rounded-3xl p-6 flex flex-col h-full hover:shadow-2xl transition duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-blue-50 p-3 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Briefcase className="w-6 h-6 text-blue-600 group-hover:text-white" />
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">{job.status}</span>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-2 truncate">{job.title}</h2>
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{job.department}</span>
            </div>
            
            <div className="flex-1 mb-6">
              <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                {job.description}
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-xs font-medium text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => handleApply(job._id)}
              disabled={applying === job._id}
              className="w-full bg-gray-900 text-white font-bold py-3 px-6 rounded-2xl flex items-center justify-center hover:bg-blue-600 transition group-hover:translate-y-[-2px] disabled:opacity-50"
            >
              {applying === job._id ? <Loader2 className="animate-spin w-5 h-5" /> : (
                <>
                  Apply Now <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No jobs found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobBoard;
