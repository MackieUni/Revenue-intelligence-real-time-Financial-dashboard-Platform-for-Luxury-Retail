import React, { useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, ComposedChart, Area, PieChart, Pie, Cell
} from "recharts";
import { TrendingUp, Target, DollarSign, ShoppingCart, Percent, Calendar, CheckCircle } from "lucide-react";

/* =======================
   Type Definitions
   ======================= */
type TabId = "dashboard" | "forecast" | "5ps";

interface TrafficSources {
  organic: number;
  paid: number;
  social: number;
  email: number;
  direct: number;
}

interface MonthData {
  month: string;
  revenue: number;
  units: number;
  grossMargin: number;      // 0..1
  conversionRate: number;   // 0..1
  avgOrderValue: number;
  trafficSources: TrafficSources;
}

interface ForecastPoint {
  month: string;            // e.g. "Jan (F)"
  revenue: number;
  forecastHigh: number;
  forecastLow: number;
  confidence: number;       // 0..1
}

interface CategoryPerf {
  name: string;
  revenue: number;
  margin: number;           // 0..1
  growth: number;           // 0..1
}

interface CampaignROI {
  campaign: string;
  roi: number;              // multiplier, e.g. 4.2x
  spend: number;            // $
}

interface Segment {
  segment: string;
  revenue: number;          // fraction 0..1 of total rev
  count: number;            // fraction 0..1 of customers
}

/* =======================
   Component
   ======================= */
const RetailAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [forecastHorizon, setForecastHorizon] = useState<number>(12);

  // -------- Mock data (replace later with real data) --------
  const generateMockData = (): { historicalData: MonthData[]; forecastData: ForecastPoint[] } => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] as const;

    const historicalData: MonthData[] = months.map((month, index) => {
      const seasonality = index < 6 ? 0.8 + index * 0.05 : 1.2 - (index - 6) * 0.03;
      const holidayBoost = [10, 11].includes(index) ? 1.4 : 1.0; // Nov/Dec boost
      return {
        month,
        revenue: Math.round((850_000 + Math.random() * 150_000) * seasonality * holidayBoost),
        units: Math.round((2_800 + Math.random() * 500) * seasonality * holidayBoost),
        grossMargin: 0.68 + (Math.random() * 0.08 - 0.04),
        conversionRate: 0.034 + (Math.random() * 0.008 - 0.004),
        avgOrderValue: Math.round(280 + Math.random() * 40),
        trafficSources: {
          organic: Math.round(15_000 + Math.random() * 3_000),
          paid: Math.round(8_000 + Math.random() * 2_000),
          social: Math.round(5_000 + Math.random() * 1_500),
          email: Math.round(4_000 + Math.random() * 1_000),
          direct: Math.round(12_000 + Math.random() * 2_500),
        },
      };
    });

    const growthTrend = 1.08; // 8% YoY growth assumption
    const uncertainty = 0.10; // ±10% range

    const forecastData: ForecastPoint[] = months.map((month, idx) => {
      const baseRevenue = historicalData[idx].revenue * growthTrend;
      return {
        month: `${month} (F)`,
        revenue: Math.round(baseRevenue),
        forecastHigh: Math.round(baseRevenue * (1 + uncertainty)),
        forecastLow: Math.round(baseRevenue * (1 - uncertainty)),
        confidence: Math.max(0, 0.85 - idx * 0.02),
      };
    });

    return { historicalData, forecastData };
  };

  const { historicalData, forecastData } = useMemo(generateMockData, []);

  // KPIs
  const currentMonthData = historicalData[historicalData.length - 1];
  const previousMonthData = historicalData[historicalData.length - 2];

  const kpis = useMemo(() => {
    const totalRevenue = historicalData.reduce((s, m) => s + m.revenue, 0);
    const avgGrossMargin = historicalData.reduce((s, m) => s + m.grossMargin, 0) / historicalData.length;
    const avgConversionRate = historicalData.reduce((s, m) => s + m.conversionRate, 0) / historicalData.length;
    const avgOrderValue = historicalData.reduce((s, m) => s + m.avgOrderValue, 0) / historicalData.length;
    const monthlyGrowth = previousMonthData
      ? ((currentMonthData.revenue - previousMonthData.revenue) / previousMonthData.revenue) * 100
      : 0;
    return { totalRevenue, avgGrossMargin, avgConversionRate, avgOrderValue, monthlyGrowth };
  }, [historicalData, currentMonthData, previousMonthData]);

  // 5P’s example data
  const fivePsAnalysis = {
    Product: {
      topCategories: [
        { name: "Handbags", revenue: 4_200_000, margin: 0.72, growth: 0.12 },
        { name: "Accessories", revenue: 1_800_000, margin: 0.68, growth: 0.08 },
        { name: "Footwear", revenue: 1_200_000, margin: 0.65, growth: 0.15 },
        { name: "Apparel", revenue: 900_000, margin: 0.58, growth: 0.05 },
      ] as CategoryPerf[],
    },
    Price: { elasticity: -1.2, optimalPromotionDepth: 0.25, marginImpact: -0.15 },
    Place: {
      channelPerformance: [
        { channel: "Desktop", revenue: 0.55, conversion: 0.038 },
        { channel: "Mobile", revenue: 0.40, conversion: 0.028 },
        { channel: "Tablet", revenue: 0.05, conversion: 0.042 },
      ],
    },
    Promotion: {
      campaignROI: [
        { campaign: "Holiday Sale", roi: 4.2, spend: 150_000 },
        { campaign: "New Collection", roi: 3.8, spend: 120_000 },
        { campaign: "Email Campaigns", roi: 6.5, spend: 80_000 },
        { campaign: "Social Media", roi: 2.9, spend: 100_000 },
      ] as CampaignROI[],
    },
    People: {
      customerSegments: [
        { segment: "VIP Customers", revenue: 0.35, count: 0.05 },
        { segment: "Regular Customers", revenue: 0.45, count: 0.25 },
        { segment: "New Customers", revenue: 0.20, count: 0.70 },
      ] as Segment[],
    },
  };

  type CombinedPoint =
  | (MonthData & { type: "historical" })
  | (ForecastPoint & { type: "forecast" });

const combinedData: CombinedPoint[] = [
  ...historicalData.map((d) => ({ ...d, type: "historical" as const })),
  ...forecastData.slice(0, forecastHorizon).map((d) => ({ ...d, type: "forecast" as const })),
];
 

  /* -------------------- Renderers -------------------- */
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue (12M)</p>
              <p className="text-2xl font-bold text-green-600">${(kpis.totalRevenue / 1_000_000).toFixed(1)}M</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
          <div className="flex items-center mt-2">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">{kpis.monthlyGrowth.toFixed(1)}% MoM</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gross Margin</p>
              <p className="text-2xl font-bold text-blue-600">{(kpis.avgGrossMargin * 100).toFixed(1)}%</p>
            </div>
            <Percent className="h-8 w-8 text-blue-600" />
          </div>
          <div className="flex items-center mt-2">
            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">Above target</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-purple-600">{(kpis.avgConversionRate * 100).toFixed(1)}%</p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
          <div className="flex items-center mt-2">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">Industry avg: 3.1%</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-orange-600">${kpis.avgOrderValue.toFixed(0)}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-orange-600" />
          </div>
          <div className="flex items-center mt-2">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+5.2% YoY</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Forecast Confidence</p>
              <p className="text-2xl font-bold text-indigo-600">87%</p>
            </div>
            <Calendar className="h-8 w-8 text-indigo-600" />
          </div>
          <div className="flex items-center mt-2">
            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">High accuracy</span>
          </div>
        </div>
      </div>

      {/* Main Revenue Chart */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Revenue Trend & 12-Month Forecast</h3>
          <select
            value={forecastHorizon}
            onChange={(e) => setForecastHorizon(Number(e.target.value))}
            className="px-3 py-1 border rounded"
          >
            <option value={6}>6 Month Forecast</option>
            <option value={12}>12 Month Forecast</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={combinedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#3B82F6" name="Actual / Forecast Revenue" opacity={0.85} />
            <Line type="monotone" dataKey="forecastHigh" stroke="#EF4444" strokeDasharray="5 5" name="Forecast High" dot={false} />
            <Line type="monotone" dataKey="forecastLow" stroke="#EF4444" strokeDasharray="5 5" name="Forecast Low" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Traffic Sources + Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Traffic Sources Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(currentMonthData.trafficSources).map(([key, value]) => ({
                  name: key.charAt(0).toUpperCase() + key.slice(1),
                  value,
                }))}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {Object.keys(currentMonthData.trafficSources).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6"][index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Monthly Performance Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="grossMargin" stroke="#10B981" name="Gross Margin %" />
              <Line type="monotone" dataKey="conversionRate" stroke="#8B5CF6" name="Conversion Rate %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderForecast = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">Advanced Forecasting Models</h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800">Time Series Model</h4>
            <p className="text-sm text-blue-600 mt-1">ARIMA with seasonality</p>
            <p className="text-2xl font-bold text-blue-800 mt-2">±8.5% MAE</p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800">ML Ensemble</h4>
            <p className="text-sm text-green-600 mt-1">Random Forest + XGBoost</p>
            <p className="text-2xl font-bold text-green-800 mt-2">±6.2% MAE</p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-800">Hybrid Model</h4>
            <p className="text-sm text-purple-600 mt-1">Combined approach</p>
            <p className="text-2xl font-bold text-purple-800 mt-2">±5.8% MAE</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={forecastData.slice(0, 12)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="forecastHigh" stackId="1" stroke="#EF4444" fill="#FEE2E2" name="Forecast Range" />
            <Area type="monotone" dataKey="forecastLow" stackId="1" stroke="#EF4444" fill="#FFFFFF" name="Forecast Low" />
            <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} name="Forecast" />
            <Bar dataKey="confidence" fill="#10B981" opacity={0.3} name="Confidence" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">Scenario Planning</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">Bear Case (-15%)</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Economic downturn</li>
              <li>• Increased competition</li>
              <li>• Supply chain issues</li>
              <li>• Reduced marketing spend</li>
            </ul>
            <p className="text-xl font-bold text-red-600 mt-3">${(kpis.totalRevenue * 0.85 / 1_000_000).toFixed(1)}M</p>
          </div>

          <div className="p-4 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Base Case (+8%)</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Steady market growth</li>
              <li>• Maintained positioning</li>
              <li>• Normal seasonality</li>
              <li>• Current strategies</li>
            </ul>
            <p className="text-xl font-bold text-blue-600 mt-3">${(kpis.totalRevenue * 1.08 / 1_000_000).toFixed(1)}M</p>
          </div>

          <div className="p-4 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Bull Case (+25%)</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Successful new launches</li>
              <li>• Market expansion</li>
              <li>• Operational efficiency</li>
              <li>• Increased brand strength</li>
            </ul>
            <p className="text-xl font-bold text-green-600 mt-3">${(kpis.totalRevenue * 1.25 / 1_000_000).toFixed(1)}M</p>
          </div>
        </div>
      </div>
    </div>
  );

  const render5Ps = () => (
    <div className="space-y-6">
      {/* Product Performance */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">Product Performance Analysis</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fivePsAnalysis.Product.topCategories}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
                <Bar dataKey="growth" fill="#10B981" name="Growth %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Category Insights</h4>
            {fivePsAnalysis.Product.topCategories.map((category, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{category.name}</span>
                  <span className="text-sm text-gray-600">{(category.growth * 100).toFixed(1)}% growth</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>Revenue: ${(category.revenue / 1_000_000).toFixed(1)}M</span>
                  <span>Margin: {(category.margin * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Promotion Analysis */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">Promotional Campaign ROI Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={fivePsAnalysis.Promotion.campaignROI}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="campaign" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="spend" fill="#EF4444" name="Campaign Spend ($)" />
            <Line type="monotone" dataKey="roi" stroke="#10B981" strokeWidth={3} name="ROI Multiplier" />
          </ComposedChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {fivePsAnalysis.Promotion.campaignROI.map((c, idx) => (
            <div key={idx} className="p-3 text-center bg-gray-50 rounded-lg">
              <p className="text-sm font-medium">{c.campaign}</p>
              <p className="text-lg font-bold text-green-600">{c.roi.toFixed(1)}x ROI</p>
              <p className="text-xs text-gray-600">${(c.spend / 1_000).toFixed(0)}K spend</p>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Segments */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">Customer Segment Analysis (People)</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={fivePsAnalysis.People.customerSegments}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="revenue"
                label={({ segment, revenue }) => `${segment}: ${(revenue * 100).toFixed(0)}%`}
              >
                {fivePsAnalysis.People.customerSegments.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={["#3B82F6", "#EF4444", "#10B981"][index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-3">
            <h4 className="font-semibold">Segment Performance</h4>
            {fivePsAnalysis.People.customerSegments.map((s, idx) => (
              <div key={idx} className="p-3 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{s.segment}</span>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {(s.count * 100).toFixed(0)}% of customers
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Revenue Contribution: {(s.revenue * 100).toFixed(0)}%</p>
                  <p>Revenue per Customer: ${((s.revenue / Math.max(s.count, 1e-6)) * 1000).toFixed(0)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">North America eCommerce Analytics</h1>
          <p className="text-gray-600">Real-time sales forecasting and performance analytics dashboard</p>
          <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
            <span>Last Updated: {new Date().toLocaleString()}</span>
            <span>•</span>
            <span>Data Source: NA eCommerce Platform</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: "dashboard", name: "Executive Dashboard", icon: TrendingUp },
              { id: "forecast",  name: "Sales Forecast",      icon: Calendar   },
              { id: "5ps",       name: "5P's Analysis",       icon: Target     },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === (tab.id as TabId)
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div>
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "forecast" && renderForecast()}
          {activeTab === "5ps" && render5Ps()}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p> North America Retail Finance Analytics • Built with React & Recharts</p>
          <p className="mt-1">Real-time forecasting powered by advanced ML models</p>
        </div>
      </div>
    </div>
  );
};

<<<<<<< HEAD:src/CoachRetailAnalytics.tsx
export default RetailAnalytics;
=======
export default CoachRetailAnalytics;
>>>>>>> 41f5736ff9064d9de931be28c2b40eb1b0093b05:src/RetailAnalytics.tsx
