// FRONTEND: src/components/DashboardAnalyticsSection.jsx
import React, { useState } from 'react';
import AdminDashboardAnalyticsWithPDF from './AdminDashboardAnalyticsWithPDF';

const DashboardAnalyticsSection = ({ userRole, userLocation, pools = [] }) => {
  const [showAnalytics, setShowAnalytics] = useState(false);

  if (!showAnalytics) {
    return (
      <div className="relative group">
        <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl sm:rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
        <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 lg:p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-white text-xl sm:text-2xl font-bold mb-2">Advanced Analytics</h3>
            <p className="text-white/70 text-sm sm:text-base mb-6">
              Get insights into water quality trends, system performance, and operational metrics with PDF export
            </p>
            <button
              onClick={() => setShowAnalytics(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center gap-2 mx-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Launch Analytics Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative group">
        <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl sm:rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
        <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h2 className="text-white text-2xl sm:text-3xl font-bold mb-2">System Analytics</h2>
              <p className="text-white/70">Real-time insights with PDF export capability</p>
            </div>
            
            <button
              onClick={() => setShowAnalytics(false)}
              className="bg-slate-600/50 hover:bg-slate-500/50 text-white px-4 py-2 rounded border border-white/20 backdrop-blur-sm transition-colors"
            >
              Hide Analytics
            </button>
          </div>
        </div>
      </div>

      <AdminDashboardAnalyticsWithPDF />
    </div>
  );
};

export default DashboardAnalyticsSection;