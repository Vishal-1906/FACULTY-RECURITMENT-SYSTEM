import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Save, ArrowLeft, Loader2, Briefcase, Plus, Minus } from 'lucide-react';

const JobForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    description: '',
    degree: '',
    requirements: '',
    experienceRequired: '',
    status: 'Open',
    deadline: ''
  });

  useEffect(() => {
    if (id) {
      const fetchJob = async () => {
        setFetching(true);
        try {
          const { data } = await api.get(`/jobs/${id}`);
          setFormData({
            ...data,
            degree: data.requirements[0] || '',
            requirements: data.requirements.slice(1).join(', '),
            deadline: data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : ''
          });
        } catch (err) {
          toast.error('Failed to load job details');
        } finally {
          setFetching(false);
        }
      };
      fetchJob();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formattedData = {
      ...formData,
      requirements: [formData.degree, ...formData.requirements.split(',').map(s => s.trim()).filter(s => s !== '')]
    };

    try {
      if (id) {
        await api.put(`/jobs/${id}`, formattedData);
        toast.success('Job updated successfully');
      } else {
        await api.post('/jobs', formattedData);
        toast.success('Job created successfully');
      }
      navigate('/admin/jobs');
    } catch (err) {
      toast.error('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-10 text-center">Loading form...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-3xl shadow-xl shadow-blue-50 border border-gray-100 overflow-hidden">
        <div className="bg-gray-900 px-8 py-6 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Briefcase className="w-6 h-6" />
            <h1 className="text-2xl font-bold">{id ? 'Edit Job Requirement' : 'New Job Requirement'}</h1>
          </div>
          <button onClick={() => navigate('/admin/jobs')} className="text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Job Title</label>
              <select 
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              >
                <option value="">Select Job Title</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Professor">Professor</option>
                <option value="Lecturer">Lecturer</option>
                <option value="Guest Faculty">Guest Faculty</option>
                <option value="HOD (Head of Department)">HOD (Head of Department)</option>
                <option value="Dean">Dean</option>
                <option value="Registrar">Registrar</option>
                <option value="Librarian">Librarian</option>
                <option value="Laboratory Assistant">Laboratory Assistant</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Department</label>
              <select 
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              >
                <option value="">Select Department</option>
                <option value="Aeronautical Engineering">Aeronautical Engineering</option>
                <option value="Artificial Intelligence and Data Science (AI & DS)">Artificial Intelligence and Data Science (AI & DS)</option>
                <option value="Biotechnology Engineering">Biotechnology Engineering</option>
                <option value="Chemical Engineering">Chemical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Computer Science Engineering (CSE)">Computer Science Engineering (CSE)</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Electronics & Communication (ECE)">Electronics & Communication (ECE)</option>
                <option value="Information Technology (IT)">Information Technology (IT)</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Mechatronics Engineering">Mechatronics Engineering</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Job Description</label>
            <textarea 
              required
              rows="4"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Degree Required</label>
              <select 
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                value={formData.degree}
                onChange={(e) => setFormData({...formData, degree: e.target.value})}
              >
                <option value="">Select Minimum Degree</option>
                <option value="B.Tech / B.E.">B.Tech / B.E.</option>
                <option value="M.Tech / M.E.">M.Tech / M.E.</option>
                <option value="MCA">MCA</option>
                <option value="M.Sc">M.Sc</option>
                <option value="PhD">PhD</option>
                <option value="M.Phil">M.Phil</option>
                <option value="NET / SLET Qualified">NET / SLET Qualified</option>
                <option value="Diploma">Diploma</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Other Requirements (Comma separated)</label>
              <input 
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                value={formData.requirements}
                onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                placeholder="e.g. 2 years experience, Python proficiency"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
             <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Exp. Required (Years)</label>
              <div className="flex items-center space-x-2">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, experienceRequired: Math.max(0, parseInt(formData.experienceRequired || 0) - 1).toString()})}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <Minus className="w-4 h-4 text-gray-600" />
                </button>
                <input 
                  type="number"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-center focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={formData.experienceRequired}
                  onChange={(e) => setFormData({...formData, experienceRequired: e.target.value})}
                  placeholder="0"
                />
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, experienceRequired: (parseInt(formData.experienceRequired || 0) + 1).toString()})}
                  className="p-2 border border-blue-100 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                >
                  <Plus className="w-4 h-4 text-blue-600" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
              <select 
                className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Deadline</label>
              <input 
                type="date"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center hover:bg-blue-700 transition shadow-lg shadow-blue-100 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin w-6 h-6 mr-2" /> : <Save className="w-6 h-6 mr-2" />}
              {id ? 'Update Job Requirement' : 'Post Job Requirement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobForm;
