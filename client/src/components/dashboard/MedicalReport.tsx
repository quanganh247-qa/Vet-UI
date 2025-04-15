import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMedicalRecordsReport } from "@/hooks/use-report";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { Loader2 } from "lucide-react";

const COLORS = ["#4f46e5", "#7c3aed", "#2563eb", "#8b5cf6", "#3b82f6", "#a78bfa", "#ec4899", "#8b5cf6"];

interface MedicalReportProps {
  startDate: string;
  endDate: string;
}

const MedicalReport = ({ startDate, endDate }: MedicalReportProps) => {
  const { data, isLoading, error } = useMedicalRecordsReport(startDate, endDate);

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
        Failed to load medical records data. Please try again later.
      </div>
    );
  }

  // Prepare data for pie chart
  const diseaseData = data.common_diseases.map(item => ({
    name: item.disease,
    value: item.count,
    percentage: item.percentage
  }));

  // Prepare monthly trend data
  const monthlyTrendData = data.monthly_trends
    .filter(item => item.examinations > 0)
    .map(item => ({
      ...item,
      month: item.month.substring(5) // Just show MM from YYYY-MM format
    }));

  // Prepare data for examinations by type
  const examinationsByTypeData = Object.entries(data.examinations_by_type).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="space-y-6">
      {/* Medical Statistics Card */}
      <Card className="bg-gradient-to-br from-indigo-50 to-white border-none shadow-md">
        <CardHeader className="pb-2">
          <CardDescription className="text-indigo-500">Total Examinations</CardDescription>
          <CardTitle className="text-2xl text-indigo-700">{data.total_examinations}</CardTitle>
        </CardHeader>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Common Diseases Chart */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-indigo-900">Common Diseases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={diseaseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {diseaseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} cases`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Examination Trends */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-indigo-900">Monthly Examination Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrendData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value} examinations`} />
                  <Bar dataKey="examinations" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Examinations by Type */}
      {examinationsByTypeData.some(item => item.value > 0) && (
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-indigo-900">Examinations by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={examinationsByTypeData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip formatter={(value) => `${value} examinations`} />
                  <Bar dataKey="value" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MedicalReport; 