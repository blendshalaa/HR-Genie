import React from 'react';
import { BookOpen, Tag } from 'lucide-react';

const KnowledgeCard = ({ article, onClick }) => {
  const categoryColors = {
    policies: 'bg-blue-100 text-blue-700',
    benefits: 'bg-green-100 text-green-700',
    procedures: 'bg-purple-100 text-purple-700',
    faq: 'bg-amber-100 text-amber-700',
  };

  return (
    <div
      onClick={onClick}
      className="card hover:shadow-lg transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary-50 rounded-lg group-hover:bg-primary-100 transition-colors">
          <BookOpen className="w-6 h-6 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
            {article.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {article.content}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {article.category && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryColors[article.category] || 'bg-gray-100 text-gray-700'}`}>
                {article.category}
              </span>
            )}
            {article.tags && article.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="flex items-center gap-1 text-xs text-gray-500">
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeCard;