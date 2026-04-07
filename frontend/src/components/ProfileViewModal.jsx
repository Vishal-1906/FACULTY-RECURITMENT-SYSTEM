import React from 'react';
import { X, User, GraduationCap, Briefcase, Award, FileText, ExternalLink, Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';

const ProfileViewModal = ({ isOpen, onClose, applicant }) => {
  if (!isOpen || !applicant) return null;

  const { user, phone, address, education = [], experience = [], research = [], skills = [], resumeUrl, marksheet12Url, degreeUrl } = applicant;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 px-8 py-6 text-white flex justify-between items-center flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl uppercase">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user?.name || 'Applicant Profile'}</h2>
              <div className="flex items-center text-blue-100 text-sm mt-1">
                <Mail className="w-4 h-4 mr-1" /> {user?.email}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto space-y-10">
          {/* Basic Info */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" /> Basic Information
            </h3>
            <div className="grid md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</p>
                  <p className="text-gray-900 font-medium">{phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Address</p>
                  <p className="text-gray-900 font-medium">{address || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Education */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <GraduationCap className="w-5 h-5 mr-2 text-blue-600" /> Education History
            </h3>
            <div className="space-y-4">
              {education.length > 0 ? education.map((edu, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center group hover:border-blue-100 transition-colors">
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{edu.degree}</h4>
                    <p className="text-gray-600 font-medium">{edu.institution}</p>
                    <div className="flex items-center text-sm text-gray-500 mt-1 font-medium">
                       <span>Year: {edu.year}</span>
                       <span className="mx-2">•</span>
                       <span>CGPA / Percentage: {edu.cgpa}</span>
                    </div>
                  </div>
                  <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold">
                    Completed
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 italic bg-gray-50 p-6 rounded-2xl border border-dashed text-center">No education history provided</p>
              )}
            </div>
          </section>

          {/* Research */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-blue-600" /> Research & Publications
            </h3>
            <div className="space-y-4">
              {research.length > 0 ? research.map((res, idx) => (
                <div key={idx} className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-gray-900">{res.title}</h4>
                  <p className="text-gray-600 text-sm mt-1">{res.publication}</p>
                  {res.link && (
                    <a 
                      href={res.link} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-blue-600 text-sm font-bold flex items-center mt-2 hover:underline"
                    >
                      View Publication <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                </div>
              )) : (
                <p className="text-gray-500 italic bg-gray-50 p-6 rounded-2xl border border-dashed text-center">No research publications listed</p>
              )}
            </div>
          </section>

          {/* Experience */}
          {experience && experience.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-blue-600" /> Professional Experience
              </h3>
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <h4 className="font-bold text-gray-900">{exp.title}</h4>
                    <p className="text-gray-600 font-medium">{exp.organization}</p>
                    <p className="text-sm text-gray-500 mt-1 font-bold">{exp.duration}</p>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Documents */}
          <section className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" /> Verified Documents
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: 'Resume', url: resumeUrl, color: 'blue' },
                { label: '10/12 Marksheet', url: marksheet12Url, color: 'indigo' },
                { label: 'Identity Proof', url: degreeUrl, color: 'emerald' }
              ].map((doc, idx) => (
                doc.url ? (
                  <a 
                    key={idx}
                    href={doc.url.startsWith('http') ? doc.url : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${doc.url}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className={`flex items-center justify-between p-4 bg-white rounded-2xl border border-${doc.color}-100 hover:border-${doc.color}-300 transition-colors shadow-sm group`}
                  >
                    <div className="flex items-center">
                       <div className={`p-2 bg-${doc.color}-50 rounded-lg mr-3`}>
                         <FileText className={`w-5 h-5 text-${doc.color}-600`} />
                       </div>
                       <span className="text-sm font-bold text-gray-700">{doc.label}</span>
                    </div>
                    <ExternalLink className={`w-4 h-4 text-gray-400 group-hover:text-${doc.color}-600 transition-colors`} />
                  </a>
                ) : (
                  <div key={idx} className="flex items-center p-4 bg-gray-100/50 rounded-2xl border border-dashed border-gray-200 opacity-60">
                    <div className="p-2 bg-gray-50 rounded-lg mr-3">
                       <FileText className="w-5 h-5 text-gray-300" />
                    </div>
                    <span className="text-sm font-bold text-gray-400">{doc.label} (N/A)</span>
                  </div>
                )
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfileViewModal;
