import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Users, 
  Briefcase, 
  UserCheck, 
  FileText, 
  TrendingUp, 
  BarChart as BarChartIcon, 
  ChevronRight,
  Plus
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    statusCounts: [],
    topCandidates: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/applications/analytics');
        setStats(data);
      } catch (error) {
        console.error('Error fetching admin stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const STATUS_COLORS = {
    'Selected': '#10B981',
    'Shortlisted': '#3B82F6',
    'Interview': '#8B5CF6',
    'Rejected': '#EF4444',
    'Applied': '#6B7280',
    'Registered': '#9CA3AF'
  };

  const chartData = stats.statusCounts.map((s, idx) => ({
    name: s._id,
    value: s.count
  }));

  if (loading) return <div className="p-10 text-center">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Recruitment Analytics</h1>
          <p className="text-gray-500">Overview of the faculty recruitment pipeline</p>
        </div>
        <Link to="/admin/jobs/new" className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center hover:bg-blue-700 transition shadow-lg shadow-blue-100">
          <Plus className="w-5 h-5 mr-2" />
          Create Job Requirement
        </Link>
      </div>

      {/* Hero Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-10">
        <div className="glass-card p-6 rounded-3xl">
          <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
            <Briefcase className="text-blue-600 w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-500">Active Postings</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalJobs}</p>
        </div>
        <div className="glass-card p-6 rounded-3xl">
          <div className="bg-purple-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
            <Users className="text-purple-600 w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-500">Total Applicants</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalApplicants}</p>
        </div>
        <div className="glass-card p-6 rounded-3xl">
          <div className="bg-green-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
            <UserCheck className="text-green-600 w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-500">Selected Applicants</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats.statusCounts.find(s => s._id === 'Selected')?.count || 0}
          </p>
        </div>
        <div className="glass-card p-6 rounded-3xl">
          <div className="bg-orange-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
            <TrendingUp className="text-orange-600 w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-500">Conv. Rate</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalApplicants > 0 
              ? Math.round((stats.statusCounts.find(s => s._id === 'Selected')?.count || 0) / stats.totalApplicants * 100) 
              : 0}%
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Top Candidates Section (Moved to where Recruitment Pipeline was) */}
        <div className="glass-panel p-8 rounded-3xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="bg-yellow-100 p-2 rounded-lg mr-3">
              ⭐
            </span>
            Top Rated Candidates
          </h2>
          
          {stats.topCandidates && stats.topCandidates.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-white/50">
                  <tr>
                    <th className="px-6 py-4 text-sm font-bold text-gray-700">Applicant</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-700">Rating</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-700 w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.topCandidates.map(candidate => (
                    <tr key={candidate._id} className="hover:bg-gray-50/50 transition duration-200">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{candidate.user?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{candidate.user?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <span className="text-lg font-bold text-yellow-600">{candidate.rating}</span>
                          <span className="text-xs font-bold text-gray-400">/ 10</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link 
                          to={`/admin/applicants`}
                          className="text-blue-600 hover:text-blue-800 font-bold text-sm bg-blue-50 px-3 py-1.5 rounded-lg"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500 text-sm">
              No candidates have been rated yet. Review candidates in the Tracking System to add ratings.
            </div>
          )}
        </div>

        {/* Quick Links / Recent Activity */}
        <div className="space-y-6">
          <div className="glass-panel p-8 rounded-3xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Management Tools</h2>
            <div className="space-y-4">
              <Link to="/admin/applicants" className="flex items-center justify-between p-4 bg-white/40 rounded-2xl hover:bg-white/60 transition group border border-white/50">
                <div className="flex items-center">
                  <div className="bg-white/60 p-2 rounded-lg mr-4 border border-white/50">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="font-bold">Applicant Tracking System</span>
                </div>
                <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition" />
              </Link>
              <Link to="/admin/jobs" className="flex items-center justify-between p-4 bg-white/40 rounded-2xl hover:bg-white/60 transition group border border-white/50">
                <div className="flex items-center">
                  <div className="bg-white/60 p-2 rounded-lg mr-4 border border-white/50">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <span className="font-bold">Job Postings Manager</span>
                </div>
                <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition" />
              </Link>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-gray-900 to-slate-800 p-8 rounded-3xl text-white shadow-xl shadow-gray-200">
            <h2 className="text-xl font-bold mb-4">Smart Screening</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Our system automatically highlights candidates whose research background matches the department requirements.
            </p>
            <button 
              onClick={() => navigate('/admin/applicants?filter=smart')}
              className="bg-white text-gray-900 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-100 transition"
            >
              Review High Matches
            </button>
          </div>
        </div>
      </div>

      {/* Recruitment Pipeline Chart (Moved to the bottom full-width section) */}
      <div className="mt-10 glass-panel p-8 rounded-3xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-gray-900">Recruitment Pipeline</h2>
          <BarChartIcon className="text-gray-400 w-5 h-5" />
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }} dy={10} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
              <Tooltip 
                cursor={{ fill: '#F1F5F9' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={80}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#CBD5E1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
