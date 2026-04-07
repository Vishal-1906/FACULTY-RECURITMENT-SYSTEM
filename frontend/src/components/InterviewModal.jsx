import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, ListChecks } from 'lucide-react';

const InterviewModal = ({ isOpen, onClose, onConfirm, applicantName, initialData = null }) => {
  const [details, setDetails] = useState({
    interviewDate: '',
    interviewTime: '',
    interviewVenue: '',
    interviewRequirements: ''
  });

  useEffect(() => {
    if (initialData) {
      setDetails({
        interviewDate: initialData.interviewDate ? new Date(initialData.interviewDate).toISOString().split('T')[0] : '',
        interviewTime: initialData.interviewTime || '',
        interviewVenue: initialData.interviewVenue || '',
        interviewRequirements: initialData.interviewRequirements || ''
      });
    } else {
      setDetails({
        interviewDate: '',
        interviewTime: '',
        interviewVenue: '',
        interviewRequirements: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-purple-50 to-blue-50">
          <h3 className="text-xl font-bold text-gray-900">
            {initialData?.interviewDate ? 'Update Interview Details' : 'Schedule Interview'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-500 mb-4 uppercase tracking-wider font-semibold">
            Applicant: <span className="text-gray-900 font-bold">{applicantName}</span>
          </p>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 text-purple-500" />
                Interview Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                value={details.interviewDate}
                onChange={(e) => setDetails({ ...details, interviewDate: e.target.value })}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 text-blue-500" />
                Interview Time
              </label>
              <input
                type="time"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                value={details.interviewTime}
                onChange={(e) => setDetails({ ...details, interviewTime: e.target.value })}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 text-red-500" />
                Venue / Location
              </label>
              <input
                type="text"
                placeholder="Google Meet Link or Office Address"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                value={details.interviewVenue}
                onChange={(e) => setDetails({ ...details, interviewVenue: e.target.value })}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <ListChecks className="w-4 h-4 text-green-500" />
                Interview Requirements / Notes
              </label>
              <textarea
                rows="3"
                placeholder="e.g. Bring your resume and original documents"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all resize-none"
                value={details.interviewRequirements}
                onChange={(e) => setDetails({ ...details, interviewRequirements: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-gray-700 font-semibold hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(details)}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95"
          >
            {initialData?.interviewDate ? 'Update Details' : 'Confirm & Move to Interview'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewModal;
