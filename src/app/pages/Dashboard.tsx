import React from 'react';
import { Layout } from '../components/ui/Layout';
import { useNavigate } from 'react-router';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';
import MedallionIcon from '../../imports/Group5';
import { usePersona } from '@/app/context/PersonaContext';
import {
  getReportsCount,
  getDatasetsCount,
  getLatestRefreshTime,
  getLast90DaysRevenue,
  getCurrentMonthMetrics,
  getTopTerritories,
  getBottomTerritories,
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

const freqBorderColors = ['#3B82F6', '#8B5CF6', '#10B981', '#E11D48', '#F59E0B'];

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
  const topTerritories = getTopTerritories(5);
  const bottomTerritories = getBottomTerritories(5);
  const recentReports = getRecentReports(5);
  const trendingReports = getRecentReports(7);
  const featuredDatasets = getFeaturedDatasets(6);

  // Prepare current month performance data
  const performanceData = [
    { metric: 'Take Rate', value: currentMonthMetrics.takeRate },
    { metric: 'RIS', value: currentMonthMetrics.ris },
    { metric: 'Return Rate', value: currentMonthMetrics.returnRate },
    { metric: 'AARD', value: currentMonthMetrics.aard },
  ];

  // Sample every 10th data point for cleaner chart
  const sampledRevenueData = last90DaysData.filter((_, idx) => idx % 10 === 0);

  const intentCards = persona?.intentCards ?? defaultIntentCards;

  const scrollbarHideStyle: React.CSSProperties = {
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  };

  const font = { fontFamily: 'Inter, sans-serif' };
  const cardBase = 'bg-white rounded-[12px] border border-[#E5E7EB] p-6 shadow-sm';

  return (
    <Layout>
      <div className="space-y-8">
        {/* ===== 1. PAGE HEADER ===== */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-[28px] font-semibold text-[#111827]" style={font}>
              Dashboard
            </h1>
            <p className="text-[13px] text-[#6B7280]" style={font}>
              A unified view of your accessible insights, reports, and data.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="text-[11px] text-[#6B7280] bg-gray-50 px-3 py-1.5 rounded-md" style={font}>
              Static Demo — Data-Driven
            </div>
            <div className="text-[10px] text-[#6B7280]" style={font}>
              Last refresh: {formatRelativeTime(latestRefresh)}
            </div>
          </div>
        </div>

        {/* ===== 2. KPI SUMMARY TILES ===== */}
        <div className="grid grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/reports')}
            className="bg-white rounded-[12px] border border-[#E5E7EB] px-4 py-3 shadow-sm text-left hover:border-[#6B7280] hover:shadow-md transition-all duration-200 cursor-pointer group"
          >
            <div className="text-[26px] font-bold text-[#111827] mb-1" style={font}>
              {reportsCount}
            </div>
            <div className="text-[13px] font-semibold text-[#111827] group-hover:text-[#E11D48] transition-colors" style={font}>
              Reports Available
            </div>
          </button>

          <button
            onClick={() => navigate('/enterprise-bi')}
            className="bg-[#FFFBEB] rounded-[12px] border border-[#E5E7EB] px-4 py-3 shadow-sm text-left hover:border-[#6B7280] hover:shadow-md transition-all duration-200 cursor-pointer group"
          >
            <div className="text-[26px] font-bold text-[#111827] mb-1" style={font}>
              {enterpriseReportsCount}
            </div>
            <div className="text-[13px] font-semibold text-[#111827] group-hover:text-[#E11D48] transition-colors" style={font}>
              Enterprise BI Reports
            </div>
          </button>

          <button
            onClick={() => navigate('/datasets')}
            className="bg-white rounded-[12px] border border-[#E5E7EB] px-4 py-3 shadow-sm text-left hover:border-[#6B7280] hover:shadow-md transition-all duration-200 cursor-pointer group"
          >
            <div className="text-[26px] font-bold text-[#111827] mb-1" style={font}>
              {datasetsCount}
            </div>
            <div className="text-[13px] font-semibold text-[#111827] group-hover:text-[#E11D48] transition-colors" style={font}>
              Datasets Available
            </div>
          </button>

          <button
            onClick={() => navigate('/datasets')}
            className="bg-white rounded-[12px] border border-[#E5E7EB] px-4 py-3 shadow-sm text-left hover:border-[#6B7280] hover:shadow-md transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="text-[26px] font-bold text-[#111827]" style={font}>
                {certifiedDatasetsCount}
              </div>
              <div className="w-7 h-7">
                <MedallionIcon />
              </div>
            </div>
            <div className="text-[13px] font-semibold text-[#111827] group-hover:text-[#E11D48] transition-colors" style={font}>
              Gold Datasets
            </div>
          </button>
        </div>

        {/* ===== NEW SECTION A: Quick Summary of Topics ===== */}
        <div>
          <div className="mb-3">
            <h2 className="text-[16px] font-semibold text-[#111827]" style={font}>
              Quick Summary
            </h2>
            <p className="text-[12px] text-[#6B7280] mt-0.5" style={font}>
              Personalized topics based on your role
            </p>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {intentCards.map((card, idx) => {
              // Extract a left-border color from the gradient name
              const colorMap: Record<string, string> = {
                'from-blue-500': '#3B82F6',
                'from-purple-500': '#8B5CF6',
                'from-emerald-500': '#10B981',
                'from-orange-500': '#F97316',
                'from-pink-500': '#EC4899',
                'from-violet-500': '#8B5CF6',
                'from-rose-500': '#F43F5E',
                'from-red-500': '#EF4444',
                'from-indigo-500': '#6366F1',
                'from-green-500': '#22C55E',
              };
              const gradientKey = card.gradient.split(' ')[0];
              const borderColor = colorMap[gradientKey] || '#3B82F6';

              return (
                <button
                  key={idx}
                  onClick={() => navigate('/conversational', { state: { prompt: card.action } })}
                  className="bg-white rounded-[12px] border border-[#E5E7EB] p-5 text-left shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                  style={{ borderLeft: `3px solid ${borderColor}` }}
                >
                  <div className="text-[14px] font-bold text-[#111827] mb-1.5" style={font}>
                    {card.title}
                  </div>
                  <div className="text-[12px] text-[#6B7280] leading-relaxed" style={font}>
                    {card.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ===== NEW SECTION B: Frequently Accessed Reports ===== */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[16px] font-semibold text-[#111827]" style={font}>
              Frequently Accessed
            </h2>
            <button
              onClick={() => navigate('/reports')}
              className="text-[13px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors"
              style={font}
            >
              See all &rarr;
            </button>
          </div>
          <div
            className="flex gap-4 overflow-x-auto pb-2"
            style={scrollbarHideStyle}
          >
            <style>{`.flex.overflow-x-auto::-webkit-scrollbar { display: none; }`}</style>
            {recentReports.map((report, idx) => (
              <button
                key={report.report_id}
                onClick={() => navigate(`/reports/${report.report_id}`)}
                className="flex-shrink-0 w-[260px] bg-white rounded-[12px] border border-[#E5E7EB] p-5 text-left shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                style={{ borderLeft: `3px solid ${freqBorderColors[idx % freqBorderColors.length]}` }}
              >
                <div className="text-[14px] font-bold text-[#111827] mb-2 line-clamp-2" style={font}>
                  {report.report_name}
                </div>
                <div className="inline-block text-[11px] font-medium text-[#6B7280] bg-[#F8F9FB] px-2 py-0.5 rounded mb-2" style={font}>
                  {report.domain}
                </div>
                <div className="text-[11px] text-[#6B7280]" style={font}>
                  Updated {formatRelativeTime(report.last_updated_ts)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ===== NEW SECTION C: Trending Reports with Access Gating ===== */}
        <div>
          <div className="mb-3">
            <h2 className="text-[16px] font-semibold text-[#111827]" style={font}>
              Trending in Your Area
            </h2>
            <p className="text-[12px] text-[#6B7280] mt-0.5" style={font}>
              Reports gaining traction across your organization
            </p>
          </div>
          <div
            className="flex gap-4 overflow-x-auto pb-2"
            style={scrollbarHideStyle}
          >
            {trendingReports.map((report, idx) => {
              const hasAccess = idx < 5;
              return (
                <button
                  key={report.report_id}
                  onClick={() => {
                    if (hasAccess) {
                      navigate(`/reports/${report.report_id}`);
                    }
                  }}
                  className={`flex-shrink-0 w-[260px] rounded-[12px] border border-[#E5E7EB] p-5 text-left shadow-sm transition-all duration-200 ${
                    hasAccess
                      ? 'bg-white hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
                      : 'bg-gray-50 opacity-70 cursor-default'
                  }`}
                  style={{ borderLeft: `3px solid ${freqBorderColors[idx % freqBorderColors.length]}` }}
                >
                  <div
                    className={`text-[14px] font-bold mb-2 line-clamp-2 ${hasAccess ? 'text-[#111827]' : 'text-[#9CA3AF]'}`}
                    style={font}
                  >
                    {report.report_name}
                  </div>
                  <div className="inline-block text-[11px] font-medium text-[#6B7280] bg-[#F8F9FB] px-2 py-0.5 rounded mb-2" style={font}>
                    {report.domain}
                  </div>
                  {hasAccess ? (
                    <div className="text-[11px] text-[#6B7280]" style={font}>
                      Updated {formatRelativeTime(report.last_updated_ts)}
                    </div>
                  ) : (
                    <div className="mt-1">
                      <div className="text-[11px] text-[#9CA3AF] mb-2" style={font}>
                        You don't have access to this report yet.
                      </div>
                      <span
                        className="inline-block text-[11px] font-semibold text-[#E11D48] bg-[#FFF1F2] px-3 py-1 rounded-md"
                        style={font}
                      >
                        Request Access
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ===== 3. KEY SIGNALS ===== */}
        <div className="grid grid-cols-2 gap-4">
          {/* SU&G Revenue Trend */}
          <div className={cardBase}>
            <div className="mb-3">
              <h2 className="text-[15px] font-semibold text-[#111827] mb-0.5" style={font}>
                SU&G Revenue Trend (90 days)
              </h2>
              <p className="text-[12px] text-[#6B7280]" style={font}>
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
              <p className="text-[11px] text-[#111827] font-semibold" style={font}>
                Run Rate (MTD): ${(currentMonthMetrics.runRate / 1000000).toFixed(2)}M
              </p>
            </div>
          </div>

          {/* Performance Snapshot */}
          <div className={cardBase}>
            <div className="mb-3">
              <h2 className="text-[15px] font-semibold text-[#111827] mb-0.5" style={font}>
                Performance Snapshot (Current Month)
              </h2>
              <p className="text-[12px] text-[#6B7280]" style={font}>
                Key performance indicators across all territories
              </p>
            </div>

            <div className="space-y-3">
              {performanceData.map((item) => (
                <div key={item.metric}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium text-[#111827]" style={font}>
                      {item.metric}
                    </span>
                    <span className="text-[12px] font-semibold text-[#111827]" style={font}>
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

        {/* ===== 4. TERRITORY PERFORMANCE ===== */}
        <div className="grid grid-cols-2 gap-4">
          {/* Top Territories */}
          <div className={cardBase}>
            <h2 className="text-[15px] font-semibold text-[#111827] mb-4" style={font}>
              Top Territories (Take Rate)
            </h2>
            <div className="space-y-3">
              {topTerritories.map((t) => (
                <div key={t.territory_id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-[13px] font-medium text-[#111827]" style={font}>
                      {t.territory_name}
                    </div>
                    <div className="text-[11px] text-[#6B7280]" style={font}>
                      {t.take_rate_pct.toFixed(1)}%
                    </div>
                  </div>
                  <div className="w-[80px] h-[24px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={t.sparkline}>
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#10B981"
                          strokeWidth={1.5}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Territories */}
          <div className={cardBase}>
            <h2 className="text-[15px] font-semibold text-[#111827] mb-4" style={font}>
              Bottom Territories (Take Rate)
            </h2>
            <div className="space-y-3">
              {bottomTerritories.map((t) => (
                <div key={t.territory_id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-[13px] font-medium text-[#111827]" style={font}>
                      {t.territory_name}
                    </div>
                    <div className="text-[11px] text-[#6B7280]" style={font}>
                      {t.take_rate_pct.toFixed(1)}%
                    </div>
                  </div>
                  <div className="w-[80px] h-[24px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={t.sparkline}>
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#E11D48"
                          strokeWidth={1.5}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== 5. YOUR REPORTS ===== */}
        <div className={cardBase}>
          <h2 className="text-[15px] font-semibold text-[#111827] mb-4" style={font}>
            Your Reports
          </h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                <th className="text-left text-[11px] font-semibold text-[#6B7280] pb-2 pr-4" style={font}>
                  Report Name
                </th>
                <th className="text-left text-[11px] font-semibold text-[#6B7280] pb-2 pr-4" style={font}>
                  Domain
                </th>
                <th className="text-left text-[11px] font-semibold text-[#6B7280] pb-2" style={font}>
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map((report) => (
                <tr
                  key={report.report_id}
                  className="border-b border-[#F3F4F6] hover:bg-[#F8F9FB] transition-colors cursor-pointer"
                  onClick={() => navigate(`/reports/${report.report_id}`)}
                >
                  <td className="py-2.5 pr-4">
                    <span className="text-[13px] font-medium text-[#111827]" style={font}>
                      {report.report_name}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className="text-[12px] text-[#6B7280]" style={font}>
                      {report.domain}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span className="text-[12px] text-[#6B7280]" style={font}>
                      {formatRelativeTime(report.last_updated_ts)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ===== 6. YOUR DATASETS ===== */}
        <div>
          <h2 className="text-[15px] font-semibold text-[#111827] mb-4" style={font}>
            Your Datasets
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {featuredDatasets.map((dataset) => (
              <button
                key={dataset.dataset_id}
                onClick={() => navigate(`/datasets/${dataset.dataset_id}`)}
                className={`${cardBase} text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="text-[14px] font-bold text-[#111827] line-clamp-2 flex-1" style={font}>
                    {dataset.dataset_name}
                  </div>
                  {dataset.certified_flag && (
                    <div className="ml-2 w-5 h-5 flex-shrink-0">
                      <MedallionIcon />
                    </div>
                  )}
                </div>
                <div className="text-[12px] text-[#6B7280] mb-2" style={font}>
                  {dataset.domain}
                </div>
                <div className="text-[11px] text-[#6B7280]" style={font}>
                  Refreshed {formatRelativeTime(dataset.last_refresh_ts)}
                </div>
                <div className="text-[10px] text-[#9CA3AF] mt-1" style={font}>
                  {dataset.refresh_frequency}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
