// =================== FEEDBACK STATS CARDS ===================
// src/components/FeedbackStatsCards.jsx
import React from 'react';
import { TrendingUp, Clock, CheckCircle, AlertTriangle, Star, MessageSquare } from 'lucide-react';

const FeedbackStatsCards = ({ stats, loading }) => {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Feedback',
      value: stats.statusCounts?.reduce((sum, item) => sum + parseInt(item.count), 0) || 0,
      icon: MessageSquare,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Pending Review',
      value: stats.pendingCount || 0,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Resolved',
      value: stats.statusCounts?.find(s => s.status === 'resolved')?.count || 0,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Average Rating',
      value: stats.averageRating ? `${stats.averageRating}★` : 'N/A',
      icon: Star,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`p-3 rounded-full ${card.bgColor}`}>
                <Icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FeedbackStatsCards;