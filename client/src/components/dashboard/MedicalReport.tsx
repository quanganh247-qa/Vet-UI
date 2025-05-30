import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMedicalRecordsReport } from "@/hooks/use-report";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Loader2, Activity, TrendingUp, Calendar, Stethoscope } from "lucide-react";

interface MedicalReportProps {
  startDate: string;
  endDate: string;
}

const MedicalReport = ({ startDate, endDate }: MedicalReportProps) => {
  const { data, isLoading, error } = useMedicalRecordsReport(startDate, endDate);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-white rounded-2xl shadow-md">
        <Loader2 className="h-10 w-10 text-[#2C78E4] animate-spin mb-4" />
        <p className="text-[#4B5563] font-medium">Loading medical records...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 text-red-700 rounded-2xl border border-red-200 shadow-md">
        <div className="flex items-center mb-2">
          <Activity className="h-5 w-5 mr-2" />
          <span className="font-semibold">Error Loading Data</span>
        </div>
        <p className="text-red-600">Failed to load medical records data. Please try again later.</p>
      </div>
    );
  }

  // Prepare monthly trend data
  const monthlyTrendData = data.monthly_trends
    .filter(item => item.examinations > 0)
    .map(item => ({
      ...item,
      month: new Date(item.month + '-01').toLocaleDateString('vi-VN', { 
        month: 'short',
        timeZone: 'Asia/Ho_Chi_Minh'
      })
    }));

  // Calculate growth rate
  const currentMonth = monthlyTrendData[monthlyTrendData.length - 1]?.examinations || 0;
  const previousMonth = monthlyTrendData[monthlyTrendData.length - 2]?.examinations || 0;
  const growthRate = previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Examinations */}
        <Card className="bg-gradient-to-br from-[#2C78E4]/5 to-white border-none shadow-md hover:shadow-lg transition-shadow duration-300 rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardDescription className="text-[#2C78E4] font-medium text-sm">Total Examinations</CardDescription>
                <CardTitle className="text-3xl font-bold text-[#2C78E4] mt-1">{data.total_examinations.toLocaleString()}</CardTitle>
              </div>
              <div className="bg-[#2C78E4]/10 p-3 rounded-xl">
                <Activity className="h-6 w-6 text-[#2C78E4]" />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Monthly Average */}
        <Card className="bg-gradient-to-br from-[#FFA726]/5 to-white border-none shadow-md hover:shadow-lg transition-shadow duration-300 rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardDescription className="text-[#FFA726] font-medium text-sm">Monthly Average</CardDescription>
                <CardTitle className="text-3xl font-bold text-[#FFA726] mt-1">
                  {monthlyTrendData.length > 0 ? 
                    Math.round(monthlyTrendData.reduce((sum, item) => sum + item.examinations, 0) / monthlyTrendData.length).toLocaleString() 
                    : '0'
                  }
                </CardTitle>
              </div>
              <div className="bg-[#FFA726]/10 p-3 rounded-xl">
                <Calendar className="h-6 w-6 text-[#FFA726]" />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Growth Rate */}
        <Card className="bg-gradient-to-br from-[#10B981]/5 to-white border-none shadow-md hover:shadow-lg transition-shadow duration-300 rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardDescription className="text-[#10B981] font-medium text-sm">Monthly Growth</CardDescription>
                <CardTitle className="text-3xl font-bold text-[#10B981] mt-1">
                  {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
                </CardTitle>
              </div>
              <div className="bg-[#10B981]/10 p-3 rounded-xl">
                <TrendingUp className="h-6 w-6 text-[#10B981]" />
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Monthly Examination Trends Chart */}
      <Card className="border-none shadow-md rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#F9FAFB] to-white border-b border-gray-100 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-[#111827]">Monthly Examination Trends</CardTitle>
              <CardDescription className="text-[#4B5563] mt-1">Track examination volume over time</CardDescription>
            </div>
            <div className="flex items-center text-sm text-[#4B5563]">
              <div className="w-3 h-3 bg-[#2C78E4] rounded-full mr-2"></div>
              Examinations
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4B5563', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4B5563', fontSize: 12 }}
                  dx={-10}
                />
                <Tooltip 
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '12px', 
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    padding: '12px' 
                  }}
                  labelStyle={{ color: '#111827', fontWeight: 'bold', marginBottom: '4px' }}
                  formatter={(value) => [`${value} examinations`, 'Total']}
                />
                <Bar 
                  dataKey="examinations" 
                  fill="#2C78E4"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                >
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Chart Footer */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#4B5563]">
                Data from {monthlyTrendData.length} months
              </span>
              <span className="text-[#4B5563]">
                Peak: {Math.max(...monthlyTrendData.map(item => item.examinations)).toLocaleString()} examinations
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Insights */}
      {monthlyTrendData.length > 0 && (
        <div className="bg-gradient-to-br from-[#2C78E4]/5 to-[#FFA726]/5 rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-[#111827] mb-4">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-[#2C78E4] rounded-full mr-2"></div>
                <span className="text-sm font-medium text-[#4B5563]">Busiest Month</span>
              </div>
              <p className="text-lg font-bold text-[#111827]">
                {monthlyTrendData.reduce((max, item) => 
                  item.examinations > max.examinations ? item : max
                ).month}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-[#FFA726] rounded-full mr-2"></div>
                <span className="text-sm font-medium text-[#4B5563]">Total Months</span>
              </div>
              <p className="text-lg font-bold text-[#111827]">
                {monthlyTrendData.length} months
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalReport;