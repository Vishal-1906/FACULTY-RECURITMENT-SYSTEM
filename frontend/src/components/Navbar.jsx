import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, LayoutDashboard, Briefcase, Bell, Settings, Menu } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import api from '../services/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Refresh count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications');
      const count = res.data.filter(n => !n.isRead).length;
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Briefcase className="text-white w-6 h-6" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">RecruitFlow</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2 mr-4 border-r border-gray-200 pr-4 relative">
                  <button 
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className={`p-2 rounded-lg transition-all relative ${isNotificationOpen ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'}`}
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className={`absolute top-2 right-2 w-2 h-2 rounded-full border-2 border-white ${isNotificationOpen ? 'bg-white' : 'bg-red-500'}`}></span>
                    )}
                  </button>
                  
                  <NotificationDropdown 
                    isOpen={isNotificationOpen} 
                    onClose={() => {
                      setIsNotificationOpen(false);
                      fetchUnreadCount(); // Refresh count when closed
                    }} 
                  />
                  <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                    <Settings className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg md:hidden">
                    <Menu className="w-6 h-6" />
                  </button>
                </div>

                <Link to={user.role === 'Admin' ? '/admin/dashboard' : '/applicant/dashboard'} 
                  className="p-2 text-gray-600 hover:text-blue-600 transition-colors hidden sm:block">
                  <LayoutDashboard className="w-5 h-5" />
                </Link>
                
                <div className="flex items-center space-x-3 ml-4 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-bold text-gray-800 hidden md:block">{user.name}</span>
                  <button onClick={handleLogout} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Sign Out">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-blue-600">Login</Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
