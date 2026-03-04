import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { DollarSign, FileText, CheckCircle, Clock } from 'lucide-react';
import PayrollModal from '../components/modals/PayrollModal';

const PayrollPage = () => {
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);

    useEffect(() => {
        fetchPayrolls();
    }, []);

    const fetchPayrolls = async () => {
        try {
            const res = await api.get('/payroll');
            setPayrolls(res.data.payrolls || []);
        } catch (err) {
            console.error('Error fetching payroll', err);
            // mock data
            setPayrolls([
                { id: 1, employee_name: 'John Doe', base_salary: 5000, bonus: 500, tax_deduction: 1000, net_salary: 4500, pay_period_start: '2023-10-01', pay_period_end: '2023-10-31', status: 'paid' },
                { id: 2, employee_name: 'Jane Smith', base_salary: 6000, bonus: 0, tax_deduction: 1200, net_salary: 4800, pay_period_start: '2023-11-01', pay_period_end: '2023-11-30', status: 'pending' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center mt-10">Loading payroll data...</div>;

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
                    <p className="text-gray-500">Manage employee salaries, bonuses, and tax deductions.</p>
                </div>
                <button
                    onClick={() => setIsPayrollModalOpen(true)}
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                    <DollarSign className="w-5 h-5" />
                    Run Payroll
                </button>
            </div>

            <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Payrolls</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse border-b">
                        <thead>
                            <tr className="border-b text-sm text-gray-500">
                                <th className="py-3 px-4">Employee</th>
                                <th className="py-3 px-4 text-right">Base Salary</th>
                                <th className="py-3 px-4 text-right">Bonuses</th>
                                <th className="py-3 px-4 text-right">Net Salary</th>
                                <th className="py-3 px-4 text-center">Period</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payrolls.map(pay => (
                                <tr key={pay.id} className="border-b hover:bg-gray-50 transition">
                                    <td className="py-3 px-4 font-medium text-gray-900">{pay.employee_name}</td>
                                    <td className="py-3 px-4 text-right text-gray-600">${parseFloat(pay.base_salary).toLocaleString()}</td>
                                    <td className="py-3 px-4 text-right text-gray-600">${parseFloat(pay.bonus).toLocaleString()}</td>
                                    <td className="py-3 px-4 text-right font-semibold text-primary-700">${parseFloat(pay.net_salary).toLocaleString()}</td>
                                    <td className="py-3 px-4 text-center text-gray-500 text-sm">{new Date(pay.pay_period_start).toLocaleDateString()} - {new Date(pay.pay_period_end).toLocaleDateString()}</td>
                                    <td className="py-3 px-4">
                                        {pay.status === 'paid' ? (
                                            <span className="flex items-center w-max gap-1 text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-medium">
                                                <CheckCircle className="w-3 h-3" /> Paid
                                            </span>
                                        ) : (
                                            <span className="flex items-center w-max gap-1 text-amber-700 bg-amber-100 px-2 py-1 rounded-full text-xs font-medium">
                                                <Clock className="w-3 h-3" /> Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <button className="text-indigo-600 hover:text-indigo-800 transition p-1">
                                            <FileText className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {payrolls.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="py-6 text-center text-gray-500">No payroll records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <PayrollModal
                isOpen={isPayrollModalOpen}
                onClose={() => setIsPayrollModalOpen(false)}
                onPayrollAdded={(newPayroll) => setPayrolls([newPayroll, ...payrolls])}
            />
        </div>
    );
};

export default PayrollPage;
