import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import { Save, User, GraduationCap, Briefcase, Award, Plus, Minus, Trash2, Loader2, FileText, Upload, CheckCircle, ShieldCheck } from 'lucide-react';
import FileUploader from '../components/FileUploader';

const ProfileEditor = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    address: '',
    education: [],
    experience: [],
    research: [],
    skills: [],
    resumeUrl: '',
    marksheet12Url: '',
    degreeUrl: ''
  });

  const [skillInput, setSkillInput] = useState('');
  const [uploadProgress, setUploadProgress] = useState({
    resume: 0,
    marksheet12: 0,
    degree: 0
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/applicants/profile');
        setProfile({
          ...profile,
          ...data,
          name: data.user?.name || ''
        });
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Update text data (including name)
      const { data } = await api.put('/applicants/profile', profile);
      
      // 2. Refresh profile with updated name from user populate
      setProfile({
        ...profile,
        ...data,
        name: data.user?.name || profile.name
      });
      
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append(field, file);

    setUploadProgress(prev => ({ ...prev, [field]: 1 }));
    try {
      const { data } = await api.post('/applicants/upload-documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prev => ({ ...prev, [field]: percentCompleted }));
        }
      });
      setUploadProgress(prev => ({ ...prev, [field]: 100 }));
      setProfile(prev => ({ ...prev, [field + 'Url']: data[field + 'Url'] }));
      toast.success(`${field} uploaded successfully`);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error(`${field} upload error:`, error.response?.data || error.message);
      toast.error(`Failed: ${errorMsg}`);
    } finally {
      setTimeout(() => {
        setUploadProgress(prev => ({ ...prev, [field]: 0 }));
      }, 1500);
    }
  };

  const handleDeleteFile = async (field) => {
    try {
      await api.delete(`/applicants/documents/${field}`);
      setProfile(prev => ({ ...prev, [field + 'Url']: '' }));
      toast.success(`${field} deleted successfully`);
    } catch (error) {
      toast.error(`Failed to delete ${field}`);
    }
  };

  const addItem = (field, item) => {
    setProfile({ ...profile, [field]: [...profile[field], item] });
  };

  const removeItem = (field, index) => {
    const newList = [...profile[field]];
    newList.splice(index, 1);
    setProfile({ ...profile, [field]: newList });
  };

  const addSkill = (e) => {
    e.preventDefault();
    if (skillInput && !profile.skills.includes(skillInput)) {
      setProfile({ ...profile, skills: [...profile.skills, skillInput] });
      setSkillInput('');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-3xl shadow-xl shadow-blue-50 border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 px-8 py-6 text-white flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <User className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Edit My Profile</h1>
          </div>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="flex items-center bg-white text-blue-600 px-6 py-2 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            Save Changes
          </button>
        </div>

        <div className="p-8 space-y-10">
          {/* Basic Info */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" /> Basic Information
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  value={profile.address}
                  onChange={(e) => setProfile({...profile, address: e.target.value})}
                />
              </div>
            </div>
          </section>

          {/* Education */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-blue-600" /> Education
              </h2>
              <button 
                onClick={() => addItem('education', { degree: '', institution: '', year: '', cgpa: '' })}
                className="text-sm font-bold text-blue-600 flex items-center hover:text-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Education
              </button>
            </div>
            <div className="space-y-4">
              {profile.education.map((edu, idx) => (
                <div key={idx} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-start justify-between">
                  <div className="grid md:grid-cols-4 gap-4 flex-1">
                    <select 
                      className="px-3 py-2 border rounded-lg focus:ring-1 bg-white"
                      value={edu.degree}
                      onChange={(e) => {
                        const newEdu = [...profile.education];
                        newEdu[idx].degree = e.target.value;
                        setProfile({...profile, education: newEdu});
                      }}
                    >
                      <option value="">Select Degree</option>
                      <option value="B.Tech / B.E.">B.Tech / B.E.</option>
                      <option value="M.Tech / M.E.">M.Tech / M.E.</option>
                      <option value="MCA">MCA</option>
                      <option value="M.Sc">M.Sc</option>
                      <option value="PhD">PhD</option>
                      <option value="M.Phil">M.Phil</option>
                      <option value="Diploma">Diploma</option>
                    </select>
                    <input 
                      placeholder="Institution"
                      className="px-3 py-2 border rounded-lg focus:ring-1"
                      value={edu.institution}
                      onChange={(e) => {
                        const newEdu = [...profile.education];
                        newEdu[idx].institution = e.target.value;
                        setProfile({...profile, education: newEdu});
                      }}
                    />
                    <div className="flex items-center space-x-1">
                      <button 
                        type="button"
                        onClick={() => {
                          const newEdu = [...profile.education];
                          const currentYear = parseInt(newEdu[idx].year) || new Date().getFullYear();
                          newEdu[idx].year = (currentYear - 1).toString();
                          setProfile({...profile, education: newEdu});
                        }}
                        className="p-1 border rounded hover:bg-gray-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input 
                        type="number"
                        placeholder="Year"
                        className="w-full px-2 py-2 border rounded-lg focus:ring-1 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={edu.year}
                        onChange={(e) => {
                          const newEdu = [...profile.education];
                          newEdu[idx].year = e.target.value;
                          setProfile({...profile, education: newEdu});
                        }}
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const newEdu = [...profile.education];
                          const currentYear = parseInt(newEdu[idx].year) || new Date().getFullYear();
                          newEdu[idx].year = (currentYear + 1).toString();
                          setProfile({...profile, education: newEdu});
                        }}
                        className="p-1 border border-blue-100 bg-blue-50 rounded hover:bg-blue-100"
                      >
                        <Plus className="w-3 h-3 text-blue-600" />
                      </button>
                    </div>
                    <input 
                      placeholder="CGPA"
                      className="px-3 py-2 border rounded-lg focus:ring-1"
                      value={edu.cgpa}
                      onChange={(e) => {
                        const newEdu = [...profile.education];
                        newEdu[idx].cgpa = e.target.value;
                        setProfile({...profile, education: newEdu});
                      }}
                    />
                  </div>
                  <button onClick={() => removeItem('education', idx)} className="ml-4 text-red-500 hover:bg-red-50 p-2 rounded-lg">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Research */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <Award className="w-5 h-5 mr-2 text-blue-600" /> Research Publications
              </h2>
              <button 
                onClick={() => addItem('research', { title: '', publication: '', link: '' })}
                className="text-sm font-bold text-blue-600 flex items-center hover:text-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Research
              </button>
            </div>
            <div className="space-y-4">
              {profile.research.map((res, idx) => (
                <div key={idx} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-start justify-between">
                  <div className="grid md:grid-cols-3 gap-4 flex-1">
                    <input placeholder="Paper Title" className="px-3 py-2 border rounded-lg" value={res.title} onChange={(e) => {
                      const newRes = [...profile.research];
                      newRes[idx].title = e.target.value;
                      setProfile({...profile, research: newRes});
                    }} />
                    <input placeholder="Publication Name" className="px-3 py-2 border rounded-lg" value={res.publication} onChange={(e) => {
                      const newRes = [...profile.research];
                      newRes[idx].publication = e.target.value;
                      setProfile({...profile, research: newRes});
                    }} />
                    <input placeholder="Link" className="px-3 py-2 border rounded-lg" value={res.link} onChange={(e) => {
                      const newRes = [...profile.research];
                      newRes[idx].link = e.target.value;
                      setProfile({...profile, research: newRes});
                    }} />
                  </div>
                  <button onClick={() => removeItem('research', idx)} className="ml-4 text-red-500 hover:bg-red-50 p-2 rounded-lg">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Documents Section */}
          <section className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" /> Required Documents (Resume, Marksheet, etc.)
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <FileUploader 
                label="Resume" 
                field="resume" 
                currentUrl={profile.resumeUrl} 
                onUpload={handleFileUpload}
                uploadProgress={uploadProgress.resume}
                onDelete={handleDeleteFile}
              />
              <FileUploader 
                label="10th or 12th Marksheet" 
                field="marksheet12" 
                currentUrl={profile.marksheet12Url} 
                onUpload={handleFileUpload}
                uploadProgress={uploadProgress.marksheet12}
                onDelete={handleDeleteFile}
              />
              <FileUploader 
                label="Identity Proof" 
                field="degree" 
                currentUrl={profile.degreeUrl} 
                onUpload={handleFileUpload}
                uploadProgress={uploadProgress.degree}
                onDelete={handleDeleteFile}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;
