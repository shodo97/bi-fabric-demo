import React from 'react';
import { Layout } from '../components/ui/Layout';
import { useNavigate } from 'react-router';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import MedallionIcon from '../../imports/Group5';
import { usePersona } from '@/app/context/PersonaContext';
import {
  getReportsCount,
  getDatasetsCount,
  getLatestRefreshTime,
  getLast90DaysRevenue,
  getCurrentMonthMetrics,
  getRecentReports,
  getFeaturedDatasets,
  formatRelativeTime,
} from '@/lib/dataModel';

const defaultIntentCards = [
  {
    title: 'Create a New Report',
    description: 'Start building insights from your connected datasets',
    gradient: 'from-blue-500 to-indigo-600',
    action: 'Help me create a new report',
  },
  {
    title: 'Explore Trending Data',
    description: 'See what reports and datasets are gaining traction',
    gradient: 'from-purple-500 to-pink-600',
    action: 'Show me trending reports and datasets',
  },
  {
    title: 'Data Quality Overview',
    description: 'Check freshness and governance status across datasets',
    gradient: 'from-emerald-500 to-teal-600',
    action: 'Show me data quality overview',
  },
  {
    title: 'Ask a Business Question',
    description: 'Use conversational analytics to get instant answers',
    gradient: 'from-orange-500 to-amber-600',
    action: 'I want to ask a business question',
  },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { persona } = usePersona();

  // Load data from backend model
  const reportsCount = getReportsCount(false);
  const enterpriseReportsCount = getReportsCount(true);
  const datasetsCount = getDatasetsCount(false);
  const certifiedDatasetsCount = getDatasetsCount(true);
  const latestRefresh = getLatestRefreshTime();

  const last90DaysData = getLast90DaysRevenue();
  const currentMonthMetrics = getCurrentMonthMetrics();
  const recentReports3 = getRecentReports(3);
  const trendingReports = getRecentReports(5);
  const featuredDatasets = getFeaturedDatasets(6);

  // Prepare current month performance data for chart
  const performanceData = [
    { metric: 'Take Rate', value: currentMonthMetrics.takeRate },
    { metric: 'RIS', value: currentMonthMetrics.ris },
    { metric: 'Return Rate', value: currentMonthMetrics.returnRate },
    { metric: 'AARD', value: currentMonthMetrics.aard },
  ];

  // Sample every 10th data point for cleaner chart
  const sampledRevenueData = last90DaysData.filter((_, idx) => idx % 10 === 0);

  const intentCards = persona?.intentCards ?? defaultIntentCards;

  // Gradient sets for each carousel row
  const recentGradients = [
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-pink-600',
    'from-emerald-500 to-teal-600',
  ];
  const trendingGradients = [
    'from-rose-500 to-orange-600',
    'from-amber-500 to-yellow-600',
    'from-cyan-500 to-blue-600',
    'from-indigo-500 to-violet-600',
    'from-green-500 to-emerald-600',
  ];
  const datasetGradients = [
    'from-slate-500 to-gray-600',
    'from-violet-500 to-purple-600',
    'from-teal-500 to-cyan-600',
    'from-orange-500 to-red-600',
    'from-blue-500 to-indigo-600',
    'from-pink-500 to-rose-600',
  ];

  const scrollbarHideStyle: React.CSSProperties = {
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  };

  return (
    <Layout>
      {/* PAGE HEADER */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-[28px] font-semibold text-[#111827]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Dashboard
          </h1>
          <p className="text-[13px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif' }}>
            A unified view of your accessible insights, reports, and data.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="text-[11px] text-[#6B7280] bg-gray-50 px-3 py-1.5 rounded-md" style={{ fontFamily: 'Inter, sans-serif' }}>
            Static Demo — Data-Driven
          </div>
          <div className="text-[10px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Last refresh: {formatRelativeTime(latestRefresh)}
          </div>
        </div>
      </div>

      {/* KPI SUMMARY TILES (compact) */}
      <div className="grid grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/reports')}
          className="bg-white rounded-xl border border-[#E5E7EB] px-4 py-3 shadow-sm text-left hover:border-[#6B7280] transition-colors cursor-pointer group"
        >
          <div className="text-[26px] font-bold text-[#111827] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
            {reportsCount}
          </div>
          <div className="text-[13px] font-semibold text-[#111827] group-hover:text-[#E11D48] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
            Reports Available
          </div>
        </button>

        <button
          onClick={() => navigate('/enterprise-bi')}
          className="bg-[#FFFBEB] rounded-xl border border-[#E5E7EB] px-4 py-3 shadow-sm text-left hover:border-[#6B7280] transition-colors cursor-pointer group"
        >
          <div className="text-[26px] font-bold text-[#111827] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
            {enterpriseReportsCount}
          </div>
          <div className="text-[13px] font-semibold text-[#111827] group-hover:text-[#E11D48] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
            Enterprise BI Reports
          </div>
        </button>

        <button
          onClick={() => navigate('/datasets')}
          className="bg-white rounded-xl border border-[#E5E7EB] px-4 py-3 shadow-sm text-left hover:border-[#6B7280] transition-colors cursor-pointer group"
        >
          <div className="text-[26px] font-bold text-[#111827] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
            {datasetsCount}
          </div>
          <div className="text-[13px] font-semibold text-[#111827] group-hover:text-[#E11D48] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
            Datasets Available
          </div>
        </button>

        <button
          onClick={() => navigate('/datasets')}
          className="bg-white rounded-xl border border-[#E5E7EB] px-4 py-3 shadow-sm text-left hover:border-[#6B7280] transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="text-[26px] font-bold text-[#111827]" style={{ fontFamily: 'Inter, sans-serif' }}>
              {certifiedDatasetsCount}
            </div>
            <div className="w-7 h-7">
              <MedallionIcon />
            </div>
          </div>
          <div className="text-[13px] font-semibold text-[#111827] group-hover:text-[#E11D48] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
            Gold Datasets
          </div>
        </button>
      </div>

      {/* INTENT-BASED SUMMARY CARDS */}
      <div>
        <h2 className="text-[16px] font-semibold text-[#111827] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
          {persona ? `Personalized for ${persona.title}` : 'What would you like to do?'}
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {intentCards.map((card, idx) => (
            <button
              key={idx}
              onClick={() => navigate('/conversational', { state: { prompt: card.action } })}
              className={`bg-gradient-to-br ${card.gradient} rounded-xl p-5 text-left shadow-md hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer`}
            >
              <div className="text-[15px] font-bold text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                {card.title}
              </div>
              <div className="text-[12px] text-white/70 mb-4 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                {card.description}
              </div>
              <div className="text-[12px] font-semibold text-white/90" style={{ fontFamily: 'Inter, sans-serif' }}>
                View &rarr;
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* CAROUSEL: Continue where you left off */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-semibold text-[#111827]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Continue where you left off
          </h2>
          <button
            onClick={() => navigate('/reports')}
            className="text-[13px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            See all &gt;
          </button>
        </div>
        <div
          className="flex gap-4 overflow-x-auto pb-2"
          style={{ ...scrollbarHideStyle }}
        >
          <style>{`.flex.overflow-x-auto::-webkit-scrollbar { display: none; }`}</style>
          {recentReports3.map((report, idx) => (
            <button
              key={report.report_id}
              onClick={() => navigate(`/reports/${report.report_id}`)}
              className={`flex-shrink-0 w-[280px] h-[160px] bg-gradient-to-br ${recentGradients[idx % recentGradients.length]} rounded-xl p-5 text-left shadow-md hover:shadow-xl hover:scale-[1.03] transition-all cursor-pointer`}
            >
              <div className="text-[15px] font-bold text-white mb-1 line-clamp-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                {report.report_name}
              </div>
              <div className="text-[12px] text-white/70 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                {report.domain}
              </div>
              <div className="text-[11px] text-white/60" style={{ fontFamily: 'Inter, sans-serif' }}>
                Updated {formatRelativeTime(report.last_updated_ts)}
              </div>
              {report.enterprise_flag && (
                <div className="mt-2 inline-block bg-white/20 text-white text-[10px] font-medium px-2 py-0.5 rounded" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Enterprise
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* CAROUSEL: Trending reports */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-semibold text-[#111827]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Trending reports
          </h2>
          <button
            onClick={() => navigate('/reports')}
            className="text-[13px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            See all &gt;
          </button>
        </div>
        <div
          className="flex gap-4 overflow-x-auto pb-2"
          style={{ ...scrollbarHideStyle }}
        >
          {trendingReports.map((report, idx) => (
            <button
              key={report.report_id}
              onClick={() => navigate(`/reports/${report.report_id}`)}
              className={`flex-shrink-0 w-[280px] h-[160px] bg-gradient-to-br ${trendingGradients[idx % trendingGradients.length]} rounded-xl p-5 text-left shadow-md hover:shadow-xl hover:scale-[1.03] transition-all cursor-pointer`}
            >
              <div className="text-[15px] font-bold text-white mb-1 line-clamp-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                {report.report_name}
              </div>
              <div className="text-[12px] text-white/70 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                {report.domain}
              </div>
              <div className="text-[11px] text-white/60" style={{ fontFamily: 'Inter, sans-serif' }}>
                Updated {formatRelativeTime(report.last_updated_ts)}
              </div>
              {report.enterprise_flag && (
                <div className="mt-2 inline-block bg-white/20 text-white text-[10px] font-medium px-2 py-0.5 rounded" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Enterprise
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* CAROUSEL: Frequently accessed datasets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-semibold text-[#111827]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Frequently accessed datasets
          </h2>
          <button
            onClick={() => navigate('/datasets')}
            className="text-[13px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            See all &gt;
          </button>
        </div>
        <div
          className="flex gap-4 overflow-x-auto pb-2"
          style={{ ...scrollbarHideStyle }}
        >
          {featuredDatasets.map((dataset, idx) => (
            <button
              key={dataset.dataset_id}
              onClick={() => navigate(`/datasets/${dataset.dataset_id}`)}
              className={`flex-shrink-0 w-[280px] h-[160px] bg-gradient-to-br ${datasetGradients[idx % datasetGradients.length]} rounded-xl p-5 text-left shadow-md hover:shadow-xl hover:scale-[1.03] transition-all cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="text-[15px] font-bold text-white line-clamp-2 flex-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {dataset.dataset_name}
                </div>
                {dataset.certified_flag && (
                  <div className="ml-2 bg-white/20 text-white text-[10px] font-medium px-2 py-0.5 rounded flex-shrink-0" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Gold
                  </div>
                )}
              </div>
              <div className="text-[12px] text-white/70 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                {dataset.domain}
              </div>
              <div className="text-[11px] text-white/60" style={{ fontFamily: 'Inter, sans-serif' }}>
                Refreshed {formatRelativeTime(dataset.last_refresh_ts)}
              </div>
              <div className="text-[10px] text-white/50 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                {dataset.refresh_frequency}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* COMPACT CHARTS ROW */}
      <div className="grid grid-cols-2 gap-4">
        {/* SU&G Revenue Trend */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
          <div className="mb-3">
            <h2 className="text-[15px] font-semibold text-[#111827] mb-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
              SU&G Revenue Trend (90 days)
            </h2>
            <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif' }}>
              High-level revenue signal across territories
            </p>
          </div>

          <div className="h-[160px] mb-2">
            <ResponsiveContainer width="100%" height="100%" minHeight={160}>
              <LineChart data={sampledRevenueData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 10, fontFamily: 'Inter, sans-serif' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 10, fontFamily: 'Inter, sans-serif' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                />
                <Line
                  key="revenue-line"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#60A5FA"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#F8F9FB] rounded-lg p-2 border border-[#E5E7EB]">
            <p className="text-[11px] text-[#111827] font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
              Run Rate (MTD): ${(currentMonthMetrics.runRate / 1000000).toFixed(2)}M
            </p>
          </div>
        </div>

        {/* Performance Snapshot */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
          <div className="mb-3">
            <h2 className="text-[15px] font-semibold text-[#111827] mb-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
              Performance Snapshot (Current Month)
            </h2>
            <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Key performance indicators across all territories
            </p>
          </div>

          <div className="space-y-3">
            {performanceData.map((item) => (
              <div key={item.metric}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-[#111827]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {item.metric}
                  </span>
                  <span className="text-[12px] font-semibold text-[#111827]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {item.value.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-[#60A5FA] h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min(item.value, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
