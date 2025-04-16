import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, BarChart2, Activity, Printer, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { addMonths, subMonths } from "date-fns";
import FinancialReport from "./FinancialReport";
import MedicalReport from "./MedicalReport";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";

const ReportsDashboard = () => {
  const [activeTab, setActiveTab] = useState("financial");
  const today = new Date();
  const [dateRange, setDateRange] = useState({
    startDate: format(subMonths(today, 3), 'yyyy-MM-dd'), // Default to 3 months ago
    endDate: format(today, 'yyyy-MM-dd') // Default to today
  });
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      setDateRange(prev => ({
        ...prev,
        startDate: format(date, 'yyyy-MM-dd')
      }));
      setStartDateOpen(false);
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      setDateRange(prev => ({
        ...prev,
        endDate: format(date, 'yyyy-MM-dd')
      }));
      setEndDateOpen(false);
    }
  };

  const setDateRangePreset = (months: number) => {
    const end = new Date();
    const start = subMonths(end, months);
    
    setDateRange({
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd')
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* <h2 className="text-2xl font-semibold text-indigo-900">Clinic Reports</h2> */}
          <div className="flex items-center">
            <BarChart2 className="h-5 w-5 mr-2 text-indigo-600" />
            <CardTitle className="text-2xl font-semibold text-indigo-900">Reports Dashboard</CardTitle>
          </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              className="h-9 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              onClick={() => setDateRangePreset(1)}
            >
              1M
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="h-9 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              onClick={() => setDateRangePreset(3)}
            >
              3M
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="h-9 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              onClick={() => setDateRangePreset(6)}
            >
              6M
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="h-9 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              onClick={() => setDateRangePreset(12)}
            >
              1Y
            </Button>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center">
              <Label className="mr-2 text-sm text-gray-600">From:</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-9 border-indigo-200 text-indigo-700 hover:bg-indigo-50 w-[130px] justify-start"
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {dateRange.startDate}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={new Date(dateRange.startDate)}
                    onSelect={handleStartDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex items-center">
              <Label className="mr-2 text-sm text-gray-600">To:</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-9 border-indigo-200 text-indigo-700 hover:bg-indigo-50 w-[130px] justify-start"
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {dateRange.endDate}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={new Date(dateRange.endDate)}
                    onSelect={handleEndDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <Button 
            // onClick={handlePrint}
            variant="outline" 
            className="h-9 flex items-center border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          >
            {/* <Printer className="h-4 w-4 mr-2" />
            Print */}
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <Tabs defaultValue="financial" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-white pb-3 border-b">
            <TabsList className="grid grid-cols-2 max-w-[400px]">
              <TabsTrigger value="financial" className="flex items-center">
                <PieChart className="h-4 w-4 mr-2" />
                Financial
              </TabsTrigger>
              <TabsTrigger value="medical" className="flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                Medical Records
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="p-6">
            <TabsContent value="financial" className="mt-0">
              <FinancialReport startDate={dateRange.startDate} endDate={dateRange.endDate} />
            </TabsContent>
            
            <TabsContent value="medical" className="mt-0">
              <MedicalReport startDate={dateRange.startDate} endDate={dateRange.endDate} />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default ReportsDashboard; 