import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../services/api';
import LeaveBalance from '../components/leave/LeaveBalance';
import LeaveRequestForm from '../components/leave/LeaveRequestForm';
import LeaveRequestList from '../components/leave/LeaveRequestList';

const LeavePage = () => {
  const [balance, setBalance] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const fetchLeaveData = async () => {
    try {
      const [balanceRes, requestsRes] = await Promise.all([
        leaveAPI.getBalance(),
        leaveAPI.getMyRequests(),
      ]);
      setBalance(balanceRes.data.balance);
      setRequests(requestsRes.data.leave_requests);
    } catch (error) {
      console.error('Failed to fetch leave data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (formData) => {
    await leaveAPI.createRequest(formData);
    await fetchLeaveData(); // Refresh data
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Leave Management</h1>
        <p className="text-gray-600">Manage your leave requests and check your balance</p>
      </div>

      <LeaveBalance balance={balance} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <LeaveRequestForm onSubmit={handleSubmitRequest} />
        </div>

        <div className="lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">My Leave Requests</h2>
            <p className="text-sm text-gray-600">Track your submitted leave requests</p>
          </div>
          <LeaveRequestList requests={requests} />
        </div>
      </div>
    </div>
  );
};

export default LeavePage;