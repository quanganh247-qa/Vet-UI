import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinancialReport } from "@/hooks/use-report";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { Loader2 } from "lucide-react";

const COLORS = ["#4f46e5", "#7c3aed", "#2563eb", "#8b5cf6", "#3b82f6", "#a78bfa"];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(value);
};

interface FinancialReportProps {
  startDate: string;
  endDate: string;
}

const FinancialReport = ({ startDate, endDate }: FinancialReportProps) => {
  const { data, isLoading, error } = useFinancialReport(startDate, endDate);

  console.log("data: ", data);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md">
        Failed to load financial data. Please try again later.
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
      month: item.month.substring(5) // Just show MM from YYYY-MM format
    }));

  return (
    <div className="space-y-6">
      {/* Revenue Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-white border-none shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-indigo-500">Total Revenue</CardDescription>
            <CardTitle className="text-2xl text-indigo-700">{formatCurrency(data.total_revenue)}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-white border-none shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-purple-500">Total Expenses</CardDescription>
            <CardTitle className="text-2xl text-purple-700">{formatCurrency(data.total_expenses)}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-white border-none shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-500">Net Profit</CardDescription>
            <CardTitle className="text-2xl text-blue-700">{formatCurrency(data.profit)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue by Service */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-indigo-900">Revenue by Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceRevenueData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {serviceRevenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-indigo-900">Monthly Revenue/Profit Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrendData}>
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialReport; 