import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, BarChart2, Activity, Printer, CalendarIcon, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, addMonths, subMonths } from "date-fns";
import { vi } from 'date-fns/locale';
import FinancialReport from "./FinancialReport";
import MedicalReport from "./MedicalReport";
import DoctorPerformanceReport from "./DoctorPerformanceReport";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";

const ReportsDashboard = () => {
  const [activeTab, setActiveTab] = useState("financial");
  const today = new Date();
  // Set the timezone to Asia/Ho_Chi_Minh
  today.setHours(today.getHours() + 7);
  
  const [dateRange, setDateRange] = useState({
    startDate: format(subMonths(today, 3), 'yyyy-MM-dd', { locale: vi }), // Default to 3 months ago
    endDate: format(today, 'yyyy-MM-dd', { locale: vi }) // Default to today
  });
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      // Adjust for timezone
      date.setHours(date.getHours() + 7);
      setDateRange(prev => ({
        ...prev,
        startDate: format(date, 'yyyy-MM-dd', { locale: vi })
      }));
      setStartDateOpen(false);
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      // Adjust for timezone
      date.setHours(date.getHours() + 7);
      setDateRange(prev => ({
        ...prev,
        endDate: format(date, 'yyyy-MM-dd', { locale: vi })
      }));
      setEndDateOpen(false);
    }
  };

  const setDateRangePreset = (months: number) => {
    const end = new Date();
    // Adjust for timezone
    end.setHours(end.getHours() + 7);
    const start = subMonths(end, months);
    
    setDateRange({
      startDate: format(start, 'yyyy-MM-dd', { locale: vi }),
      endDate: format(end, 'yyyy-MM-dd', { locale: vi })
    });
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    date.setHours(date.getHours() + 7);
    return format(date, 'dd/MM/yyyy', { locale: vi });
  };

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-md overflow-hidden">
        <Tabs defaultValue="financial" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <CardHeader className="bg-gradient-to-r from-[#2C78E4]/5 to-white border-none shadow-md hover:shadow-lg transition-shadow duration-300 rounded-2xl p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <TabsList className="bg-[#F9FAFB] p-1 rounded-xl">
                <TabsTrigger 
                  value="financial" 
                  className="flex items-center gap-2 px-4 py-2.5 data-[state=active]:bg-[#2C78E4] data-[state=active]:text-white rounded-lg transition-all"
                >
                  <PieChart className="h-4 w-4" />
                  Financial
                </TabsTrigger>
                <TabsTrigger 
                  value="medical" 
                  className="flex items-center gap-2 px-4 py-2.5 data-[state=active]:bg-[#2C78E4] data-[state=active]:text-white rounded-lg transition-all"
                >
                  <Activity className="h-4 w-4" />
                  Medical Records
                </TabsTrigger>
                <TabsTrigger 
                  value="doctor-performance" 
                  className="flex items-center gap-2 px-4 py-2.5 data-[state=active]:bg-[#2C78E4] data-[state=active]:text-white rounded-lg transition-all"
                >
                  <Users className="h-4 w-4" />
                  Doctor Performance
                </TabsTrigger>
              </TabsList>

              <div className="flex flex-wrap items-center gap-4">
                {/* Date Preset Buttons */}
                <div className="flex items-center gap-2 bg-[#F9FAFB] p-1 rounded-xl">
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="h-9 px-4 hover:bg-[#2C78E4] hover:text-white data-[active=true]:bg-[#2C78E4] data-[active=true]:text-white rounded-lg transition-all"
                    onClick={() => setDateRangePreset(1)}
                    data-active={dateRange.startDate === format(subMonths(new Date(), 1), 'yyyy-MM-dd', { locale: vi })}
                  >
                    1M
                  </Button>
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="h-9 px-4 hover:bg-[#2C78E4] hover:text-white data-[active=true]:bg-[#2C78E4] data-[active=true]:text-white rounded-lg transition-all"
                    onClick={() => setDateRangePreset(3)}
                    data-active={dateRange.startDate === format(subMonths(new Date(), 3), 'yyyy-MM-dd', { locale: vi })}
                  >
                    3M
                  </Button>
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="h-9 px-4 hover:bg-[#2C78E4] hover:text-white data-[active=true]:bg-[#2C78E4] data-[active=true]:text-white rounded-lg transition-all"
                    onClick={() => setDateRangePreset(6)}
                    data-active={dateRange.startDate === format(subMonths(new Date(), 6), 'yyyy-MM-dd', { locale: vi })}
                  >
                    6M
                  </Button>
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="h-9 px-4 hover:bg-[#2C78E4] hover:text-white data-[active=true]:bg-[#2C78E4] data-[active=true]:text-white rounded-lg transition-all"
                    onClick={() => setDateRangePreset(12)}
                    data-active={dateRange.startDate === format(subMonths(new Date(), 12), 'yyyy-MM-dd', { locale: vi })}
                  >
                    1Y
                  </Button>
                </div>
                
                {/* Date Range Pickers */}
                <div className="flex items-center gap-3 bg-[#F9FAFB] p-2 rounded-xl">
                  <div className="flex items-center">
                    <Label className="mr-2 text-sm text-[#4B5563]">Từ</Label>
                    <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-9 bg-white hover:bg-white/90 text-[#111827] w-[130px] justify-start rounded-lg shadow-sm"
                        >
                          <CalendarIcon className="h-4 w-4 mr-2 text-[#2C78E4]" />
                          {formatDisplayDate(dateRange.startDate)}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={new Date(dateRange.startDate)}
                          onSelect={handleStartDateSelect}
                          initialFocus
                          className="rounded-lg border border-[#F9FAFB]"
                          locale={vi}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="flex items-center">
                    <Label className="mr-2 text-sm text-[#4B5563]">Đến</Label>
                    <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-9 bg-white hover:bg-white/90 text-[#111827] w-[130px] justify-start rounded-lg shadow-sm"
                        >
                          <CalendarIcon className="h-4 w-4 mr-2 text-[#2C78E4]" />
                          {formatDisplayDate(dateRange.endDate)}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={new Date(dateRange.endDate)}
                          onSelect={handleEndDateSelect}
                          initialFocus
                          className="rounded-lg border border-[#F9FAFB]"
                          locale={vi}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <TabsContent value="financial" className="mt-0">
              <FinancialReport startDate={dateRange.startDate} endDate={dateRange.endDate} />
            </TabsContent>
            
            <TabsContent value="medical" className="mt-0">
              <MedicalReport startDate={dateRange.startDate} endDate={dateRange.endDate} />
            </TabsContent>
            
            <TabsContent value="doctor-performance" className="mt-0">
              <DoctorPerformanceReport startDate={dateRange.startDate} endDate={dateRange.endDate} />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default ReportsDashboard; 