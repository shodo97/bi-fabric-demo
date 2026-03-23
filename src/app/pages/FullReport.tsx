import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  getReportById, 
  catalogDatasets, 
  formatRelativeTime,
  getFullReportMonthlyTrend,
  getFullReportYoYData,
  getFullReportTopDrivers,
  getFullReportTopEntities,
} from '@/lib/dataModel';
import { TrendingUp, TrendingDown, Minus, ArrowLeft, Home, Download } from 'lucide-react';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { toast } from 'sonner';
import { generateReportPDF } from '@/lib/generateReportPDF';

export function FullReportPage() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const report = getReportById(reportId!);
  const sourceDataset = report ? catalogDatasets.find(d => d.dataset_id === report.source_dataset_id) : null;

  // Chart refs
  const trendChartRef = useRef<HTMLDivElement>(null);
  const yoyPrimaryChartRef = useRef<HTMLDivElement>(null);
  const yoySecondaryChartRef = useRef<HTMLDivElement>(null);
  const chartRootsRef = useRef<am5.Root[]>([]); // Store chart roots for export
  const pdfContentRef = useRef<HTMLDivElement>(null); // Main content ref for PDF capture
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Get data
  const monthlyTrend = report ? getFullReportMonthlyTrend(reportId!) : [];
  const yoyPrimary = report ? getFullReportYoYData(reportId!, 'primary') : [];
  const yoySecondary = report ? getFullReportYoYData(reportId!, 'secondary') : [];
  const topDrivers = report ? getFullReportTopDrivers(reportId!) : [];
  const topEntities = report ? getFullReportTopEntities(reportId!) : [];

  // Initialize charts
  useLayoutEffect(() => {
    if (!report || !isLoaded) return;

    const roots: am5.Root[] = [];

    // 1. Trend Chart (Combo: Bars + Line)
    if (trendChartRef.current && monthlyTrend.length > 0) {
      const root = am5.Root.new(trendChartRef.current);
      root.setThemes([am5themes_Animated.new(root)]);

      const chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          panX: false,
          panY: false,
          wheelX: 'none',
          wheelY: 'none',
          layout: root.verticalLayout,
        })
      );

      // X-Axis
      const xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
          categoryField: 'month',
          renderer: am5xy.AxisRendererX.new(root, {
            minGridDistance: 30,
          }),
        })
      );
      xAxis.data.setAll(monthlyTrend);

      // Y-Axis for bars (left)
      const yAxisBars = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          renderer: am5xy.AxisRendererY.new(root, {}),
        })
      );

      // Y-Axis for line (right)
      const yAxisLine = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          renderer: am5xy.AxisRendererY.new(root, {
            opposite: true,
          }),
        })
      );

      // Determine which fields to use based on domain
      let barField = 'value';
      let lineField = 'secondary';
      
      if (report.domain === 'Sales') {
        barField = 'units';
        lineField = 'takeRate';
      } else if (report.domain === 'Customer Experience') {
        barField = 'ris';
        lineField = 'nps';
      }

      // Bar series
      const barSeries = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: barField === 'units' ? 'Units Sold' : barField === 'ris' ? 'RIS Score' : 'Primary Metric',
          xAxis: xAxis,
          yAxis: yAxisBars,
          valueYField: barField,
          categoryXField: 'month',
          fill: am5.color(0x60A5FA),
          stroke: am5.color(0x60A5FA),
        })
      );
      barSeries.columns.template.setAll({
        cornerRadiusTL: 4,
        cornerRadiusTR: 4,
        strokeOpacity: 0,
      });
      barSeries.data.setAll(monthlyTrend);

      // Line series
      const lineSeries = chart.series.push(
        am5xy.LineSeries.new(root, {
          name: lineField === 'takeRate' ? 'Take Rate %' : lineField === 'nps' ? 'NPS Score' : 'Secondary Metric',
          xAxis: xAxis,
          yAxis: yAxisLine,
          valueYField: lineField,
          categoryXField: 'month',
          stroke: am5.color(0xF59E0B),
          fill: am5.color(0xF59E0B),
        })
      );
      lineSeries.strokes.template.setAll({ strokeWidth: 3 });
      lineSeries.bullets.push(() => {
        return am5.Bullet.new(root, {
          sprite: am5.Circle.new(root, {
            radius: 5,
            fill: am5.color(0xF59E0B),
            stroke: am5.color(0xFFFFFF),
            strokeWidth: 2,
          }),
        });
      });
      lineSeries.data.setAll(monthlyTrend);

      // Legend
      const legend = chart.children.push(
        am5.Legend.new(root, {
          centerX: am5.percent(50),
          x: am5.percent(50),
        })
      );
      legend.data.setAll(chart.series.values);

      roots.push(root);
    }

    // 2. YoY Primary Chart
    if (yoyPrimaryChartRef.current && yoyPrimary.length > 0) {
      const root = am5.Root.new(yoyPrimaryChartRef.current);
      root.setThemes([am5themes_Animated.new(root)]);

      const chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          panX: false,
          panY: false,
          wheelX: 'none',
          wheelY: 'none',
          layout: root.verticalLayout,
        })
      );

      const xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
          categoryField: 'month',
          renderer: am5xy.AxisRendererX.new(root, {
            minGridDistance: 30,
          }),
        })
      );
      xAxis.data.setAll(yoyPrimary);

      const yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          renderer: am5xy.AxisRendererY.new(root, {}),
        })
      );

      // This Year series
      const thisYearSeries = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: 'This Year',
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: 'thisYear',
          categoryXField: 'month',
          fill: am5.color(0x3B82F6),
          stroke: am5.color(0x3B82F6),
          clustered: true,
        })
      );
      thisYearSeries.columns.template.setAll({
        cornerRadiusTL: 4,
        cornerRadiusTR: 4,
        strokeOpacity: 0,
      });
      thisYearSeries.data.setAll(yoyPrimary);

      // Last Year series
      const lastYearSeries = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: 'Last Year',
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: 'lastYear',
          categoryXField: 'month',
          fill: am5.color(0x94A3B8),
          stroke: am5.color(0x94A3B8),
          clustered: true,
        })
      );
      lastYearSeries.columns.template.setAll({
        cornerRadiusTL: 4,
        cornerRadiusTR: 4,
        strokeOpacity: 0,
      });
      lastYearSeries.data.setAll(yoyPrimary);

      // Legend
      const legend = chart.children.push(
        am5.Legend.new(root, {
          centerX: am5.percent(50),
          x: am5.percent(50),
        })
      );
      legend.data.setAll(chart.series.values);

      roots.push(root);
    }

    // 3. YoY Secondary Chart
    if (yoySecondaryChartRef.current && yoySecondary.length > 0) {
      const root = am5.Root.new(yoySecondaryChartRef.current);
      root.setThemes([am5themes_Animated.new(root)]);

      const chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          panX: false,
          panY: false,
          wheelX: 'none',
          wheelY: 'none',
          layout: root.verticalLayout,
        })
      );

      const xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
          categoryField: 'month',
          renderer: am5xy.AxisRendererX.new(root, {
            minGridDistance: 30,
          }),
        })
      );
      xAxis.data.setAll(yoySecondary);

      const yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          renderer: am5xy.AxisRendererY.new(root, {}),
        })
      );

      const thisYearSeries = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: 'This Year',
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: 'thisYear',
          categoryXField: 'month',
          fill: am5.color(0x10B981),
          stroke: am5.color(0x10B981),
          clustered: true,
        })
      );
      thisYearSeries.columns.template.setAll({
        cornerRadiusTL: 4,
        cornerRadiusTR: 4,
        strokeOpacity: 0,
      });
      thisYearSeries.data.setAll(yoySecondary);

      const lastYearSeries = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: 'Last Year',
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: 'lastYear',
          categoryXField: 'month',
          fill: am5.color(0x94A3B8),
          stroke: am5.color(0x94A3B8),
          clustered: true,
        })
      );
      lastYearSeries.columns.template.setAll({
        cornerRadiusTL: 4,
        cornerRadiusTR: 4,
        strokeOpacity: 0,
      });
      lastYearSeries.data.setAll(yoySecondary);

      const legend = chart.children.push(
        am5.Legend.new(root, {
          centerX: am5.percent(50),
          x: am5.percent(50),
        })
      );
      legend.data.setAll(chart.series.values);

      roots.push(root);
    }

    // Store roots for PDF export
    chartRootsRef.current = roots;

    // Cleanup
    return () => {
      roots.forEach(root => root.dispose());
    };
  }, [report, monthlyTrend, yoyPrimary, yoySecondary, isLoaded]);

  const trendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-red-600" />;
    return <Minus className="w-3.5 h-3.5 text-gray-400" />;
  };

  const getPlatformBadge = (source?: string) => {
    if (!source) return null;
    const colors: { [key: string]: { bg: string; text: string } } = {
      'Tableau': { bg: '#DBEAFE', text: '#1E40AF' },
      'Looker': { bg: '#E0E7FF', text: '#3730A3' },
      'Qlik': { bg: '#DCFCE7', text: '#166534' },
    };
    const color = colors[source] || { bg: '#F3F4F6', text: '#374151' };
    return (
      <span 
        className="text-[10px] font-semibold px-2 py-1 rounded"
        style={{ 
          fontFamily: 'Inter, sans-serif', 
          backgroundColor: color.bg, 
          color: color.text 
        }}
      >
        {source}
      </span>
    );
  };

  const handleDownloadPDF = async () => {
    if (!report || isGeneratingPDF) return;
    
    // Ensure charts are available
    if (chartRootsRef.current.length === 0) {
      toast.error('Charts not ready', {
        description: 'Please wait for charts to finish loading',
        duration: 3000,
      });
      return;
    }
    
    setIsGeneratingPDF(true);
    setPdfError(null);
    
    try {
      // Wait for charts to finish rendering with animations
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Prepare report data
      const reportData = {
        reportName: report.report_name,
        domain: report.domain,
        datasetName: sourceDataset?.dataset_name || 'N/A',
        lastUpdated: formatRelativeTime(report.last_updated_ts),
        sourceApplication: report.source_application,
        kpis: kpiValues.slice(0, 3),
        topDrivers: topDrivers,
        topEntities: topEntities,
      };
      
      // Prepare chart references
      const charts = {
        trend: chartRootsRef.current[0] ? {
          chartRoot: chartRootsRef.current[0],
          title: 'Performance Trend (Last 12 Months)',
          width: 180,
          height: 80,
        } : undefined,
        yoyPrimary: chartRootsRef.current[1] ? {
          chartRoot: chartRootsRef.current[1],
          title: `${report.domain === 'Sales' ? 'Revenue' : 'Primary Metric'} — Year over Year`,
          width: 85,
          height: 60,
        } : undefined,
        yoySecondary: chartRootsRef.current[2] ? {
          chartRoot: chartRootsRef.current[2],
          title: `${report.domain === 'Sales' ? 'Units Sold' : 'Secondary Metric'} — Year over Year`,
          width: 85,
          height: 60,
        } : undefined,
      };
      
      // Generate PDF
      await generateReportPDF({
        reportData,
        charts,
        filename: `${report.report_name.replace(/\s+/g, '_')}_Full_Report_${new Date().toISOString().split('T')[0]}.pdf`,
        onProgress: (stage) => {
          if (stage === 'complete') {
            toast.success('PDF Downloaded Successfully', {
              id: 'pdf-generation',
              description: 'Your professional report has been generated',
              duration: 4000,
            });
          } else {
            toast.loading(stage, { id: 'pdf-generation' });
          }
        },
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setPdfError(`PDF generation failed: ${errorMessage}. Please try again or contact support.`);
      
      toast.error('PDF Generation Failed', {
        id: 'pdf-generation',
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-8 shadow-sm text-center max-w-md">
          <h2 className="text-[18px] font-semibold text-[#111827] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Report not found
          </h2>
          <p className="text-[13px] text-[#6B7280] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            The report you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/reports')}
            className="px-4 py-2 bg-[#111827] hover:bg-[#0F172A] text-white rounded-lg text-[13px] font-medium"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  // Calculate KPI values based on domain
  const kpiValues = report.key_kpis || [
    { kpi_name: 'Primary Metric', current_value: '75%', previous_value: '70%', trend: 'up', delta: '+5%' },
    { kpi_name: 'Secondary Metric', current_value: '85%', previous_value: '83%', trend: 'up', delta: '+2%' },
    { kpi_name: 'Tertiary Metric', current_value: '92%', previous_value: '94%', trend: 'down', delta: '-2%' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* ERROR NOTIFICATION */}
      {pdfError && (
        <div className="bg-red-50 border-b border-red-200 px-8 py-3">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-[12px] font-bold">!</span>
              </div>
              <p className="text-[13px] text-red-800 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                {pdfError}
              </p>
            </div>
            <button
              onClick={() => setPdfError(null)}
              className="text-red-600 hover:text-red-800 text-[20px] font-bold leading-none"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {/* HEADER BAR */}
      <div className="bg-white border-b border-[#E5E7EB] px-8 py-4">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/reports/${reportId}`)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to Report Detail"
            >
              <ArrowLeft className="w-5 h-5 text-[#6B7280]" />
            </button>
            <div>
              <h1 className="text-[20px] font-bold text-[#111827]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {report.report_name} — Full Report
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[11px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Domain: <span className="font-medium text-[#111827]">{report.domain}</span>
                </span>
                <span className="text-[#E5E7EB]">•</span>
                <span className="text-[11px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Dataset: <span className="font-medium text-[#111827]">{sourceDataset?.dataset_name}</span>
                </span>
                <span className="text-[#E5E7EB]">•</span>
                {getPlatformBadge(report.source_application)}
                <span className="text-[#E5E7EB]">•</span>
                <span className="text-[11px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Updated {formatRelativeTime(report.last_updated_ts)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="px-4 py-2 bg-[#111827] hover:bg-[#0F172A] disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-[12px] font-medium transition-colors flex items-center gap-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <Download className="w-4 h-4" />
              {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#111827] rounded-lg text-[12px] font-medium transition-colors flex items-center gap-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <Home className="w-4 h-4" />
              Return to BI Fabric
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-[1600px] mx-auto p-6 bg-white" ref={pdfContentRef}>
        <div className="grid grid-cols-12 gap-4">
          
          {/* ROW 1: KPI Summary + Trend Chart */}
          <div className="col-span-12 grid grid-cols-12 gap-4">
            
            {/* LEFT: KPI Summary */}
            <div className="col-span-4 bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-sm">
              <h3 className="text-[14px] font-semibold text-[#111827] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Year to Date Performance
              </h3>
              <div className="space-y-4">
                {kpiValues.slice(0, 3).map((kpi, idx) => (
                  <div key={idx} className="pb-4 border-b border-[#E5E7EB] last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {kpi.kpi_name}
                      </span>
                      {trendIcon(kpi.trend)}
                    </div>
                    <div className="text-[28px] font-bold text-[#111827] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {kpi.current_value}
                    </div>
                    <div className="flex items-center gap-2 text-[11px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <span className={kpi.trend === 'up' ? 'text-green-600 font-semibold' : kpi.trend === 'down' ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                        {kpi.delta}
                      </span>
                      <span className="text-[#6B7280]">from {kpi.previous_value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Trend Chart */}
            <div className="col-span-8 bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-sm">
              <h3 className="text-[14px] font-semibold text-[#111827] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Performance Trend (Last 12 Months)
              </h3>
              <div ref={trendChartRef} style={{ width: '100%', height: '280px' }}></div>
            </div>

          </div>

          {/* ROW 2: Four Cards (2x2 Grid) */}
          <div className="col-span-12 grid grid-cols-12 gap-4">
            
            {/* CARD 1: YoY Primary */}
            <div className="col-span-6 bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-sm">
              <h3 className="text-[14px] font-semibold text-[#111827] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                {report.domain === 'Sales' ? 'Revenue' : 'Primary Metric'} — Year over Year
              </h3>
              <div ref={yoyPrimaryChartRef} style={{ width: '100%', height: '220px' }}></div>
            </div>

            {/* CARD 2: Top Drivers Table */}
            <div className="col-span-6 bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-sm">
              <h3 className="text-[14px] font-semibold text-[#111827] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                {report.domain === 'Sales' ? 'Top Products' : report.domain === 'Customer Experience' ? 'Top Drivers' : 'Top Segments'}
              </h3>
              <div className="overflow-hidden">
                <table className="w-full">
                  <thead className="border-b border-[#E5E7EB]">
                    <tr>
                      <th className="text-left pb-2 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Name
                      </th>
                      <th className="text-right pb-2 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Value
                      </th>
                      <th className="text-right pb-2 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Share
                      </th>
                      <th className="text-center pb-2 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Trend
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {topDrivers.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="py-3 text-[12px] text-[#111827] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {item.name}
                        </td>
                        <td className="py-3 text-[12px] text-[#111827] text-right font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {item.value}
                        </td>
                        <td className="py-3 text-[12px] text-[#6B7280] text-right" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {item.share}
                        </td>
                        <td className="py-3 text-center">
                          {trendIcon(item.trend)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CARD 3: YoY Secondary */}
            <div className="col-span-6 bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-sm">
              <h3 className="text-[14px] font-semibold text-[#111827] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                {report.domain === 'Sales' ? 'Units Sold' : 'Secondary Metric'} — Year over Year
              </h3>
              <div ref={yoySecondaryChartRef} style={{ width: '100%', height: '220px' }}></div>
            </div>

            {/* CARD 4: Top Entities Table */}
            <div className="col-span-6 bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-sm">
              <h3 className="text-[14px] font-semibold text-[#111827] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                {report.domain === 'Sales' ? 'Top Territories' : report.domain === 'Customer Experience' ? 'Top Locations' : 'Top Entities'}
              </h3>
              <div className="overflow-hidden">
                <table className="w-full">
                  <thead className="border-b border-[#E5E7EB]">
                    <tr>
                      <th className="text-left pb-2 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Entity
                      </th>
                      <th className="text-right pb-2 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Metric
                      </th>
                      <th className="text-right pb-2 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Volume
                      </th>
                      <th className="text-right pb-2 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {topEntities.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="py-3 text-[12px] text-[#111827] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {item.entity}
                        </td>
                        <td className="py-3 text-[12px] text-[#111827] text-right font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {item.value}
                        </td>
                        <td className="py-3 text-[12px] text-[#6B7280] text-right" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {item.impressions}
                        </td>
                        <td className="py-3 text-[12px] text-[#6B7280] text-right" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {item.rate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>

        {/* FOOTER */}
        <div className="mt-6 bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-[11px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Powered by <span className="font-semibold text-[#111827]">BI Fabric</span> · Data-Driven · Connected Model
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/reports/${reportId}`)}
                className="text-[12px] text-[#60A5FA] hover:text-[#3B82F6] hover:underline font-medium"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Return to Report Detail
              </button>
              <span className="text-[#E5E7EB]">•</span>
              <button
                onClick={() => navigate('/reports')}
                className="text-[12px] text-[#60A5FA] hover:text-[#3B82F6] hover:underline font-medium"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Back to Reports
              </button>
              <span className="text-[#E5E7EB]">•</span>
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="text-[12px] text-[#60A5FA] hover:text-[#3B82F6] hover:underline font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Download className="w-4 h-4 inline-block mr-1" />
                {isGeneratingPDF ? 'Generating...' : 'Download Report'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}