import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../services/api';
import DepartmentModal from '../components/modals/DepartmentModal';

const DepartmentsPage = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await api.get('/departments');
            setDepartments(response.data.departments || []);
        } catch (error) {
            console.error('Failed to fetch departments', error);
            // fallback to mock if api fails
            setDepartments([{ id: 1, name: 'Engineering', description: 'Tech team' }]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center mt-10">Loading departments...</div>;
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
                    <p className="text-gray-500">Manage company departments and their details.</p>
                </div>
                <button
                    onClick={() => setIsDeptModalOpen(true)}
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Department
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map((dept) => (
                    <div key={dept.id} className="card hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{dept.name}</h3>
                                <p className="text-sm text-gray-500">Manager ID: {dept.manager_id || 'Unassigned'}</p>
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-6">{dept.description || 'No description provided.'}</p>

                        <div className="flex justify-end gap-2 border-t pt-4">
                            <button className="p-2 text-gray-500 hover:text-primary-600 transition-colors rounded">
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
                {departments.length === 0 && (
                    <div className="col-span-full text-center py-10 text-gray-500 bg-white rounded-lg border border-dashed">
                        No departments found. Create the first one!
                    </div>
                )}
            </div>

            <DepartmentModal
                isOpen={isDeptModalOpen}
                onClose={() => setIsDeptModalOpen(false)}
                onDepartmentAdded={(newDept) => setDepartments([newDept, ...departments])}
            />
        </div>
    );
};

export default DepartmentsPage;
