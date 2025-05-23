import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMedicalRecordsReport } from "@/hooks/use-report";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";

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

  // Prepare monthly trend data
  const monthlyTrendData = data.monthly_trends
    .filter(item => item.examinations > 0)
    .map(item => ({
      ...item,
      month: item.month.substring(5) // Just show MM from YYYY-MM format
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

      {/* Monthly Examination Trends */}
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="text-lg text-indigo-900">Monthly Examination Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${value} examinations`} />
                <Line 
                  type="monotone" 
                  dataKey="examinations" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  dot={{ fill: "#4f46e5", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#4f46e5", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicalReport;