import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, leaveAPI } from '../services/api';
import StatsCard from '../components/dashboard/StatsCard';
import { 
  MessageSquare, 
  Calendar, 
  BookOpen, 
  Clock,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, balanceRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        leaveAPI.getBalance()
      ]);
      
      setStats(dashboardRes.data);
      setBalance(balanceRes.data.balance);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Section */}
      <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-primary-100">
              Here's what's happening with your HR activities today.
            </p>
          </div>
          <button
            onClick={() => navigate('/chat')}
            className="hidden sm:flex items-center gap-2 bg-white text-primary-700 px-6 py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors"
          >
            Ask AI Assistant
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={MessageSquare}
          title="Total Conversations"
          value={stats?.stats?.total_conversations || 0}
          subtitle="Active chats"
          color="primary"
        />
        <StatsCard
          icon={Calendar}
          title="Sick Leave Balance"
          value={balance?.sick_leave_balance || 0}
          subtitle="Days remaining"
          color="green"
        />
        <StatsCard
          icon={Calendar}
          title="Vacation Balance"
          value={balance?.vacation_balance || 0}
          subtitle="Days remaining"
          color="purple"
        />
        <StatsCard
          icon={Clock}
          title="Pending Requests"
          value={stats?.stats?.pending_leave_requests || 0}
          subtitle="Awaiting approval"
          color="amber"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chat Activity Chart */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Chat Activity</h3>
              <p className="text-sm text-gray-500">Last 7 days</p>
            </div>
          </div>

          {stats?.chat_activity?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.chat_activity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9ca3af"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#0ea5e9" 
                  strokeWidth={2}
                  dot={{ fill: '#0ea5e9', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No activity yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/chat')}
              className="w-full flex items-center gap-4 p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors text-left group"
            >
              <div className="p-2 bg-primary-600 rounded-lg">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Ask AI Assistant</p>
                <p className="text-sm text-gray-600">Get instant answers to HR questions</p>
              </div>
              <ArrowRight className="w-5 h-5 text-primary-600 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/leave')}
              className="w-full flex items-center gap-4 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left group"
            >
              <div className="p-2 bg-green-600 rounded-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Request Leave</p>
                <p className="text-sm text-gray-600">Submit a new leave request</p>
              </div>
              <ArrowRight className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/knowledge')}
              className="w-full flex items-center gap-4 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left group"
            >
              <div className="p-2 bg-purple-600 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Browse Policies</p>
                <p className="text-sm text-gray-600">View company policies and guidelines</p>
              </div>
              <ArrowRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Knowledge Base Preview */}
      {stats?.stats?.total_knowledge_articles > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Knowledge Base</h3>
            <button
              onClick={() => navigate('/knowledge')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View All
            </button>
          </div>
          <p className="text-gray-600">
            Access {stats.stats.total_knowledge_articles} articles covering company policies, 
            procedures, and FAQs. Use the AI assistant or browse directly.
          </p>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;