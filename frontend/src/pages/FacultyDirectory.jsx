import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import { UserCheck, Shield, Mail, MapPin, Search } from 'lucide-react';

const FacultyDirectory = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const { data } = await api.get('/applications/analytics'); // Temporary placeholder as specific endpoint not yet made
        // In reality, we'd have GET /api/faculty
        const res = await api.get('/api/auth/me'); // Just to show directory view
        setFaculty([{ _id: '1', user: { name: 'Dr. Jane Smith', email: 'jane@college.edu' }, department: 'CS', designation: 'Asst. Professor' }]);
      } catch (err) {
        toast.error('Failed to load faculty list');
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
  }, []);

  const filteredFaculty = faculty.filter(f => 
    f.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-10 text-center">Loading faculty database...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Faculty Database</h1>
          <p className="text-gray-500">Managing successfully recruited faculty members.</p>
        </div>
        
        <div className="mt-6 md:mt-0 w-full md:w-96 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search faculty..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredFaculty.map((f) => (
          <div key={f._id} className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-blue-50/50 p-6 hover:translate-y-[-4px] transition duration-300">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mr-4 shadow-lg shadow-blue-100">
                {f.user.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{f.user.name}</h2>
                <p className="text-sm font-medium text-blue-600">{f.designation}</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="w-4 h-4 mr-2 text-gray-400" />
                <span>Dept: {f.department}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                <span>{f.user.email}</span>
              </div>
            </div>

            <button className="w-full py-2 bg-gray-50 text-gray-700 rounded-xl font-bold text-sm hover:bg-blue-50 hover:text-blue-600 transition">
              View Records
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FacultyDirectory;
