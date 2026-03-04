import React, { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';
import api from '../../services/api';

const EvaluationModal = ({ isOpen, onClose, onEvaluationAdded }) => {
    const [userId, setUserId] = useState('');
    const [rating, setRating] = useState(0);
    const [comments, setComments] = useState('');
    const [reviewDate, setReviewDate] = useState(new Date().toISOString().split('T')[0]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
            setUserId('');
            setRating(0);
            setComments('');
            setReviewDate(new Date().toISOString().split('T')[0]);
            setError(null);
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data.users || []);
        } catch (err) {
            console.error('Failed to fetch users for evaluation modal', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please provide a rating.');
            return;
        }
        setLoading(true);
        setError(null);

        try {
            const newEvaluation = {
                user_id: userId,
                rating,
                comments,
                review_date: reviewDate,
                evaluation_criteria: {
                    communication: rating,
                    teamwork: rating,
                    productivity: rating
                }
            };

            const res = await api.post('/performance', newEvaluation);
            onEvaluationAdded(res.data.review);
            onClose();
        } catch (err) {
            console.error('Failed to create evaluation', err);
            setError(err.response?.data?.error || 'An error occurred while creating the evaluation.');
        } finally {
            setLoading(false);
        }
    };

    const handleStarClick = (index) => {
        setRating(index + 1);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fadeIn">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-slideUp">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">New Performance Evaluation</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Employee <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                        >
                            <option value="">Select an employee...</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Overall Rating <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                            {[...Array(5)].map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleStarClick(i)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-8 h-8 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Review Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            required
                            value={reviewDate}
                            onChange={(e) => setReviewDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Comments
                        </label>
                        <textarea
                            rows={4}
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition resize-none"
                            placeholder="Detailed feedback for the employee..."
                        />
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !userId}
                            className={`px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition ${(loading || !userId) ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Submitting...' : 'Submit Evaluation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EvaluationModal;
