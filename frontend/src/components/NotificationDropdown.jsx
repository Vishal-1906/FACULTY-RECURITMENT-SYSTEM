import React, { useEffect, useState, useRef } from 'react';
import { Bell, Check, Clock, Info, Calendar, MessageSquare, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div ref={dropdownRef} className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {unreadCount} New
            </span>
          )}
        </div>
        <button 
          onClick={markAllAsRead}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Mark all as read
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-50 text-left">
        {loading && notifications.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm">Loading alerts...</p>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((n) => (
            <div 
              key={n._id} 
              onClick={() => markAsRead(n._id)}
              className={`p-4 flex gap-4 hover:bg-gray-50 transition-colors cursor-pointer group ${!n.isRead ? 'bg-blue-50/30' : ''}`}
            >
              <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                n.type === 'Interview' ? 'bg-purple-100 text-purple-600' :
                n.type === 'Application' ? 'bg-blue-100 text-blue-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                {n.type === 'Interview' ? <Calendar className="w-5 h-5" /> :
                 n.type === 'Application' ? <Check className="w-5 h-5" /> :
                 <AlertCircle className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-relaxed ${!n.isRead ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                  {n.message}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[11px] text-gray-400 font-medium">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
              {!n.isRead && (
                <div className="shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
              )}
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-gray-400">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-sm font-medium">No new notifications</p>
            <p className="text-[11px] mt-1">We'll alert you when something happens.</p>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-50 bg-gray-50/50 text-center">
        <button className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-widest">
          View All Activity
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
