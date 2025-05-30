import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinancialReport } from "@/hooks/use-report";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area, CartesianGrid } from "recharts";
import { Loader2, DollarSign, TrendingUp, TrendingDown, PieChart as PieChartIcon, BarChart3, Receipt } from "lucide-react";

const COLORS = ["#2C78E4", "#FFA726", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444"];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(value);
};

const formatCompactCurrency = (value: number) => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B VND`;
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M VND`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K VND`;
  }
  return formatCurrency(value);
};

interface FinancialReportProps {
  startDate: string;
  endDate: string;
}

const FinancialReport = ({ startDate, endDate }: FinancialReportProps) => {
  const { data, isLoading, error } = useFinancialReport(startDate, endDate);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-white rounded-2xl shadow-md">
        <Loader2 className="h-10 w-10 text-[#2C78E4] animate-spin mb-4" />
        <p className="text-[#4B5563] font-medium">Loading financial data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 text-red-700 rounded-2xl border border-red-200 shadow-md">
        <div className="flex items-center mb-2">
          <Receipt className="h-5 w-5 mr-2" />
          <span className="font-semibold">Error Loading Data</span>
        </div>
        <p className="text-red-600">Failed to load financial data. Please try again later.</p>
      </div>
    );
  }

  // Prepare data for pie chart
  const serviceRevenueData = Object.entries(data.revenue_by_service).map(([name, value]) => ({
    name,
    value
  }));

  // Prepare monthly trend data
  const monthlyTrendData = data.monthly_trends
    .filter(item => item.revenue > 0 || item.expenses > 0)
    .map(item => ({
      ...item,
      month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
      profit_margin: item.revenue > 0 ? ((item.profit / item.revenue) * 100) : 0
    }));

  // Calculate growth rates
  const currentMonth = monthlyTrendData[monthlyTrendData.length - 1];
  const previousMonth = monthlyTrendData[monthlyTrendData.length - 2];
  
  const revenueGrowth = previousMonth && previousMonth.revenue > 0 ? 
    ((currentMonth?.revenue - previousMonth.revenue) / previousMonth.revenue * 100) : 0;
  
  const profitMargin = data.total_revenue > 0 ? (data.profit / data.total_revenue * 100) : 0;

  return (
    <div className="space-y-6">
      

      {/* Revenue Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-[#2C78E4]/5 to-white border-none shadow-md hover:shadow-lg transition-shadow duration-300 rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardDescription className="text-[#2C78E4] font-medium text-sm">Total Revenue</CardDescription>
                <CardTitle className="text-2xl font-bold text-[#2C78E4] mt-1">
                  {formatCompactCurrency(data.total_revenue)}
                </CardTitle>
              </div>
              <div className="bg-[#2C78E4]/10 p-3 rounded-xl">
                <DollarSign className="h-6 w-6 text-[#2C78E4]" />
              </div>
            </div>
          </CardHeader>
        </Card>
        
        <Card className="bg-gradient-to-br from-[#FFA726]/5 to-white border-none shadow-md hover:shadow-lg transition-shadow duration-300 rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardDescription className="text-[#FFA726] font-medium text-sm">Total Expenses</CardDescription>
                <CardTitle className="text-2xl font-bold text-[#FFA726] mt-1">
                  {formatCompactCurrency(data.total_expenses)}
                </CardTitle>
              </div>
              <div className="bg-[#FFA726]/10 p-3 rounded-xl">
                <Receipt className="h-6 w-6 text-[#FFA726]" />
              </div>
            </div>
          </CardHeader>
        </Card>
        
        <Card className="bg-gradient-to-br from-[#10B981]/5 to-white border-none shadow-md hover:shadow-lg transition-shadow duration-300 rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardDescription className="text-[#10B981] font-medium text-sm">Net Profit</CardDescription>
                <CardTitle className="text-2xl font-bold text-[#10B981] mt-1">
                  {formatCompactCurrency(data.profit)}
                </CardTitle>
              </div>
              <div className="bg-[#10B981]/10 p-3 rounded-xl">
                {data.profit >= 0 ? 
                  <TrendingUp className="h-6 w-6 text-[#10B981]" /> : 
                  <TrendingDown className="h-6 w-6 text-red-500" />
                }
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-[#8B5CF6]/5 to-white border-none shadow-md hover:shadow-lg transition-shadow duration-300 rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardDescription className="text-[#8B5CF6] font-medium text-sm">Profit Margin</CardDescription>
                <CardTitle className="text-2xl font-bold text-[#8B5CF6] mt-1">
                  {profitMargin.toFixed(1)}%
                </CardTitle>
              </div>
              <div className="bg-[#8B5CF6]/10 p-3 rounded-xl">
                <PieChartIcon className="h-6 w-6 text-[#8B5CF6]" />
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Service */}
        <Card className="border-none shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#F9FAFB] to-white border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-[#111827]">Revenue by Service</CardTitle>
                <CardDescription className="text-[#4B5563] mt-1">Distribution of revenue across services</CardDescription>
              </div>
              <PieChartIcon className="h-5 w-5 text-[#4B5563]" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceRevenueData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {serviceRevenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none', 
                      borderRadius: '12px', 
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card className="border-none shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#F9FAFB] to-white border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-[#111827]">Monthly Revenue Breakdown</CardTitle>
                <CardDescription className="text-[#4B5563] mt-1">Profit and cost distribution over time</CardDescription>
              </div>
              <div className="flex items-center space-x-4 text-sm text-[#4B5563]">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-[#10B981] rounded-full mr-2"></div>
                  Profit
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-[#2C78E4] rounded-full mr-2"></div>
                  Costs
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={monthlyTrendData.map(item => ({
                    ...item,
                    costs: item.revenue - item.profit
                  }))} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  stackOffset="none"
                >
                  <defs>
                    <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.6}/>
                    </linearGradient>
                    <linearGradient id="costsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2C78E4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2C78E4" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#4B5563', fontSize: 12 }}
                    dy={10}
                    padding={{ left: 20, right: 20 }}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatCompactCurrency(value)}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#4B5563', fontSize: 12 }}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none', 
                      borderRadius: '12px', 
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      padding: '12px'
                    }}
                    labelStyle={{ color: '#111827', fontWeight: 'bold', marginBottom: '8px' }}
                    formatter={(value, name) => [
                      formatCurrency(Number(value)), 
                      name === 'profit' ? 'Profit' : 'Operating Costs'
                    ]}
                    wrapperStyle={{ zIndex: 1000 }}
                  />
                  <Area 
                    type="monotone"
                    dataKey="costs"
                    stackId="1"
                    stroke="#2C78E4"
                    fill="url(#costsGradient)"
                    name="costs"
                  />
                  <Area 
                    type="monotone"
                    dataKey="profit"
                    stackId="1"
                    stroke="#10B981"
                    fill="url(#profitGradient)"
                    name="profit"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {/* Chart Footer */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-sm text-[#4B5563]">
                  <span className="font-medium">Average Profit Margin:</span>{' '}
                  <span className="text-[#10B981] font-medium">
                    {(monthlyTrendData.reduce((acc, item) => acc + (item.profit / item.revenue * 100), 0) / monthlyTrendData.length).toFixed(1)}%
                  </span>
                </div>
                <div className="text-sm text-[#4B5563]">
                  <span className="font-medium">Total Revenue:</span>{' '}
                  {formatCompactCurrency(monthlyTrendData.reduce((acc, item) => acc + item.revenue, 0))}
                </div>
                <div className="text-sm text-[#4B5563]">
                  <span className="font-medium">Cost Ratio:</span>{' '}
                  <span className="text-[#2C78E4] font-medium">
                    {(monthlyTrendData.reduce((acc, item) => acc + ((item.revenue - item.profit) / item.revenue * 100), 0) / monthlyTrendData.length).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Insights */}
      <div className="bg-gradient-to-br from-[#2C78E4]/5 to-[#FFA726]/5 rounded-2xl p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-[#111827] mb-4">Financial Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <div className="w-2 h-2 bg-[#2C78E4] rounded-full mr-2"></div>
              <span className="text-sm font-medium text-[#4B5563]">Top Service</span>
            </div>
            <p className="text-lg font-bold text-[#111827]">
              {serviceRevenueData.length > 0 ? 
                serviceRevenueData.reduce((max, item) => 
                  item.value > max.value ? item : max
                ).name : 'N/A'
              }
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <div className="w-2 h-2 bg-[#10B981] rounded-full mr-2"></div>
              <span className="text-sm font-medium text-[#4B5563]">Average Monthly Revenue</span>
            </div>
            <p className="text-lg font-bold text-[#111827]">
              {monthlyTrendData.length > 0 ? 
                formatCompactCurrency(monthlyTrendData.reduce((sum, item) => sum + item.revenue, 0) / monthlyTrendData.length)
                : formatCurrency(0)
              }
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <div className="w-2 h-2 bg-[#FFA726] rounded-full mr-2"></div>
              <span className="text-sm font-medium text-[#4B5563]">Best Month</span>
            </div>
            <p className="text-lg font-bold text-[#111827]">
              {monthlyTrendData.length > 0 ? 
                monthlyTrendData.reduce((max, item) => 
                  item.revenue > max.revenue ? item : max
                ).month : 'N/A'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialReport; 