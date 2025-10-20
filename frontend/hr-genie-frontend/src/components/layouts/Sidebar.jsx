import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Calendar, 
  BookOpen, 
  Bot,
  X,
  Users,
  CheckSquare,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { isHR, isAdmin } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['employee', 'hr', 'admin'] },
    { to: '/chat', icon: MessageSquare, label: 'AI Assistant', roles: ['employee', 'hr', 'admin'] },
    { to: '/leave', icon: Calendar, label: 'Leave Management', roles: ['employee', 'hr', 'admin'] },
    { to: '/knowledge', icon: BookOpen, label: 'Knowledge Base', roles: ['employee', 'hr', 'admin'] },
    // HR & Admin only
    { to: '/leave-approvals', icon: CheckSquare, label: 'Leave Approvals', roles: ['hr', 'admin'] },
    // Admin only
    { to: '/users', icon: Users, label: 'User Management', roles: ['admin'] },
  ];

  const shouldShowItem = (item) => {
    if (isAdmin) return true;
    if (isHR && (item.roles.includes('hr') || item.roles.includes('employee'))) return true;
    return item.roles.includes('employee');
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">HR Genie</h1>
              <p className="text-xs text-gray-500">AI Assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.filter(shouldShowItem).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => window.innerWidth < 1024 && onClose()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="p-4 bg-primary-50 rounded-lg">
            <p className="text-sm font-medium text-primary-900 mb-1">
              Need Help?
            </p>
            <p className="text-xs text-primary-700">
              Ask the AI assistant anything about HR policies!
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

