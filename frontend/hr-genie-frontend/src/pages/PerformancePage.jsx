import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { TrendingUp, Star, Calendar as CalendarIcon, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import EvaluationModal from '../components/modals/EvaluationModal';

const PerformancePage = () => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);

    useEffect(() => {
        if (user && user.id) {
            fetchReviews(user.id);
        }
    }, [user]);

    const fetchReviews = async (userId) => {
        try {
            const res = await api.get(`/performance/user/${userId}`);
            setReviews(res.data.reviews || []);
        } catch (err) {
            console.error('Failed to fetch reviews', err);
            // mock data fallback
            setReviews([
                { id: 1, reviewer_name: 'Admin User', rating: 4, review_date: '2023-12-15', comments: 'Great performance this quarter, shows strong initiative.' },
                { id: 2, reviewer_name: 'Jane Smith', rating: 5, review_date: '2023-06-10', comments: 'Exceeded all goals and mentored junior devs.' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
        ));
    };

    if (loading) return <div className="text-center py-10">Loading performance reviews...</div>;

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Performance Evaluation</h1>
                    <p className="text-gray-500">Track and review your performance history.</p>
                </div>
                {(user?.role === 'admin' || user?.role === 'hr' || user?.role === 'manager') && (
                    <button
                        onClick={() => setIsEvalModalOpen(true)}
                        className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                    >
                        <TrendingUp className="w-5 h-5" />
                        New Evaluation
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map(review => (
                    <div key={review.id} className="card flex flex-col hover:shadow-lg transition">
                        <div className="flex items-center justify-between border-b pb-4 mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-indigo-50 rounded text-indigo-600">
                                    <Star className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Q-Review</h3>
                                    <div className="flex items-center gap-1 mt-1">
                                        {renderStars(review.rating)}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center text-xs text-gray-500 gap-1">
                                    <CalendarIcon className="w-3 h-3" />
                                    {new Date(review.review_date).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 mb-4">
                            <div className="flex items-start gap-2">
                                <MessageSquare className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                <p className="text-sm text-gray-600 italic">"{review.comments}"</p>
                            </div>
                        </div>

                        <div className="text-xs text-gray-500 mt-auto pt-4 border-t">
                            Reviewed by: <span className="font-medium text-gray-700">{review.reviewer_name || 'System User'}</span>
                        </div>
                    </div>
                ))}

                {reviews.length === 0 && (
                    <div className="col-span-full text-center py-10 bg-white rounded-lg border border-dashed border-gray-300 text-gray-500">
                        No performance reviews found for your profile.
                    </div>
                )}
            </div>

            <EvaluationModal
                isOpen={isEvalModalOpen}
                onClose={() => setIsEvalModalOpen(false)}
                onEvaluationAdded={(newEval) => setReviews([newEval, ...reviews])}
            />
        </div>
    );
};

export default PerformancePage;
