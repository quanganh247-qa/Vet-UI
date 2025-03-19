import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const AppointmentTypeChart = ({ data }: { data: Record<string, number> }) => {
  const chartData = Object.entries(data || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: value,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} />
        <YAxis hide tick={{ fontSize: 10 }} tickLine={false} />
        <Tooltip
          formatter={(value) => [`${value}%`, "Appointments"]}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #f0f0f0",
            borderRadius: "4px",
            fontSize: "12px",
          }}
        />
        <Bar dataKey="value" fill="#2C7BE5" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

const DailyCheckinsChart = ({
  data,
}: {
  data: { current: number[]; previous: number[] };
}) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const chartData = days.map((day, index) => ({
    name: day,
    current: data.current[index] || 0,
    previous: data.previous[index] || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart
        data={chartData}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} />
        <YAxis hide tick={{ fontSize: 10 }} tickLine={false} />
        <Tooltip
          formatter={(value, name) => [
            value,
            name === "current" ? "This Week" : "Last Week",
          ]}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #f0f0f0",
            borderRadius: "4px",
            fontSize: "12px",
          }}
        />
        <Line
          type="monotone"
          dataKey="current"
          stroke="#2C7BE5"
          strokeWidth={2}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="previous"
          stroke="#00A9B5"
          strokeWidth={2}
          strokeDasharray="5 5"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

const AnalyticsCharts = () => {
  const [timeRange, setTimeRange] = useState("week");

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["/api/analytics/date/today"],
  });

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <h2 className="text-lg font-display font-semibold text-[#12263F]">
          Analytics
        </h2>
        <div>
          <Select defaultValue="week" onValueChange={setTimeRange}>
            <SelectTrigger className="text-sm border-0 text-gray-500 focus:outline-none bg-transparent h-8 w-32">
              <SelectValue placeholder="This Week" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="last-week">Last Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="p-4">
        <div className="flex flex-wrap -mx-2">
          <div className="w-full md:w-1/2 px-2 mb-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Appointments by Type
              </h3>

              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : analyticsData ? (
                <AppointmentTypeChart data={analyticsData.appointment_counts} />
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </div>

          <div className="w-full md:w-1/2 px-2 mb-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Daily Check-ins
              </h3>

              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : analyticsData ? (
                <DailyCheckinsChart data={analyticsData.checkins} />
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
          {isLoading ? (
            // Loading skeletons
            Array(4)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-20 mt-1" />
                  <Skeleton className="h-6 w-12 mt-1" />
                </div>
              ))
          ) : (
            // Stats
            <>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Most Common</p>
                <p className="text-sm font-medium">Vaccinations</p>
                <p className="text-lg font-display font-semibold mt-1">32%</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Peak Hours</p>
                <p className="text-sm font-medium">10am - 2pm</p>
                <p className="text-lg font-display font-semibold mt-1">42%</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Avg. Time</p>
                <p className="text-sm font-medium">Per Patient</p>
                <p className="text-lg font-display font-semibold mt-1">
                  24 min
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">New Patients</p>
                <p className="text-sm font-medium">This Week</p>
                <p className="text-lg font-display font-semibold mt-1">+18</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
