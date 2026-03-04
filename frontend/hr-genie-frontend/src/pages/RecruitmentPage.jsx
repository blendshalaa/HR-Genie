import React, { useState, useEffect } from 'react';
import { Briefcase, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../services/api';
import JobModal from '../components/modals/JobModal';

const RecruitmentPage = () => {
    const [activeTab, setActiveTab] = useState('jobs');
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isJobModalOpen, setIsJobModalOpen] = useState(false);

    useEffect(() => {
        fetchRecruitmentData();
    }, [activeTab]);

    const fetchRecruitmentData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'jobs') {
                const res = await api.get('/recruitment/jobs');
                setJobs(res.data.jobs || []);
            } else {
                const res = await api.get('/recruitment/applications');
                setApplications(res.data.applications || []);
            }
        } catch (err) {
            console.error('Failed to fetch data', err);
            // mock if missing
            if (activeTab === 'jobs') setJobs([{ id: 1, title: 'Software Engineer', status: 'open', department_name: 'Engineering' }]);
            if (activeTab === 'applications') setApplications([{ id: 1, applicant_name: 'Jane Doe', job_title: 'Software Engineer', status: 'applied' }]);
        } finally {
            setLoading(false);
        }
    };

    const renderJobs = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Open Positions</h2>
                <button
                    onClick={() => setIsJobModalOpen(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                    Post Job
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map(job => (
                    <div key={job.id} className="card hover:shadow-lg transition flex items-start gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                            <p className="text-gray-500 text-sm mb-2">{job.department_name}</p>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {job.status.toUpperCase()}
                                </span>
                                <span className="text-xs text-gray-400">ID: #{job.id}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const getStatusBadge = (status) => {
        switch (status) {
            case 'applied': return <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-full text-xs font-medium"><Clock className="w-3 h-3" /> Applied</span>;
            case 'interviewing': return <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-xs font-medium"><FileText className="w-3 h-3" /> Interviewing</span>;
            case 'hired': return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium"><CheckCircle className="w-3 h-3" /> Hired</span>;
            case 'rejected': return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-medium"><XCircle className="w-3 h-3" /> Rejected</span>;
            default: return null;
        }
    };

    const renderApplications = () => (
        <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Applications</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border-b">
                    <thead>
                        <tr className="border-b text-sm text-gray-500">
                            <th className="py-3 px-4">Applicant Name</th>
                            <th className="py-3 px-4">Position</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.map(app => (
                            <tr key={app.id} className="border-b hover:bg-gray-50 transition">
                                <td className="py-3 px-4 font-medium text-gray-900">{app.applicant_name}</td>
                                <td className="py-3 px-4 text-gray-600">{app.job_title}</td>
                                <td className="py-3 px-4">{getStatusBadge(app.status)}</td>
                                <td className="py-3 px-4 text-right">
                                    <button className="text-primary-600 font-medium hover:underline text-sm">Review</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Recruitment</h1>
                    <p className="text-gray-500">Manage job postings and review applications.</p>
                </div>
            </div>

            <div className="flex space-x-4 border-b border-gray-200 mb-6">
                <button
                    className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'jobs' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('jobs')}
                >
                    Job Postings
                </button>
                <button
                    className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'applications' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('applications')}
                >
                    Applications
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                activeTab === 'jobs' ? renderJobs() : renderApplications()
            )}

            <JobModal
                isOpen={isJobModalOpen}
                onClose={() => setIsJobModalOpen(false)}
                onJobAdded={(newJob) => setJobs([newJob, ...jobs])}
            />
        </div>
    );
};

export default RecruitmentPage;
