import React from 'react';
import { Calendar, Clock } from 'lucide-react';

const LeaveBalance = ({ balance }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-green-600 rounded-lg">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900">Sick Leave</h3>
        </div>
        <p className="text-3xl font-bold text-green-700">{balance?.sick_leave_balance || 0}</p>
        <p className="text-sm text-green-700 mt-1">days remaining</p>
      </div>

      <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-600 rounded-lg">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900">Vacation</h3>
        </div>
        <p className="text-3xl font-bold text-purple-700">{balance?.vacation_balance || 0}</p>
        <p className="text-sm text-purple-700 mt-1">days remaining</p>
      </div>
    </div>
  );
};

export default LeaveBalance;