import React, { useState, useMemo, useEffect } from "react";
import { format, addDays, startOfWeek, endOfWeek, isSameDay } from "date-fns";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Trash2,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  RotateCcw,
  Filter,
  Loader2,
  Stethoscope,
  CheckCircle,
  Tag,
  Copy,
  Edit,
  MoreVertical,
  UserPlus,
  CalendarDays,
  Timer,
  Award,
  TrendingUp,
  Eye,
  Settings,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { useDoctors } from "@/hooks/use-doctor";
import { useShifts, useShiftMutations } from "@/hooks/use-shifts";
import { Doctor } from "@/types";
import { cn } from "@/lib/utils";
import ShiftTemplateManager from "@/components/doctor-schedule/ShiftTemplateManager";

// Shift template types
type ShiftTemplate = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  color: string;
  recurring: boolean;
  days?: number[];
};

const defaultTemplates: ShiftTemplate[] = [
  {
    id: "1",
    name: "Morning Shift",
    startTime: "08:00",
    endTime: "12:00",
    color: "bg-[#2C78E4]/10 border-[#2C78E4]/30 text-[#2C78E4]",
    recurring: false,
  },
  {
    id: "2",
    name: "Afternoon Shift",
    startTime: "13:00",
    endTime: "17:00",
    color: "bg-[#FFA726]/10 border-[#FFA726]/30 text-[#FFA726]",
    recurring: false,
  },
  {
    id: "3",
    name: "Night Shift",
    startTime: "18:00",
    endTime: "22:00",
    color: "bg-[#8B5CF6]/10 border-[#8B5CF6]/30 text-[#8B5CF6]",
    recurring: false,
  },
];

// Assignment type for the week view
type DoctorAssignment = {
  id: string;
  doctorId: number;
  doctorName: string;
  date: string;
  shiftTemplateId: string;
  startTime: string;
  endTime: string;
  status: "draft" | "published" | "confirmed";
};

const ShiftAssignmentPage = () => {
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState<"week" | "list">("week");
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [templates, setTemplates] = useState<ShiftTemplate[]>(defaultTemplates);
  const [newTemplate, setNewTemplate] = useState<Partial<ShiftTemplate>>({
    name: "",
    startTime: "09:00",
    endTime: "17:00",
    recurring: false,
    days: [],
  });

  // Data fetching
  const { data: doctorsData, isLoading: doctorsLoading } = useDoctors();
  const { data: assignmentsData, isLoading: assignmentsLoading } = useShifts();
  const { createMutation, updateMutation, deleteMutation } = useShiftMutations();

  // Format doctors data
  const doctors = useMemo(() => {
    if (!doctorsData?.data) return [];
    return doctorsData.data.filter((doc: Doctor) => 
      doc.role?.toLowerCase() === "doctor"
    );
  }, [doctorsData]);

  // Convert API shifts to assignment format
  const assignments = useMemo(() => {
    if (!assignmentsData || !Array.isArray(assignmentsData)) return [];

    return assignmentsData.map((shift) => {
      const doctor = doctors.find(
        (d: Doctor) => d.doctor_id === shift.doctor_id
      );

      const templateMatch =
        templates.find(
          (t) =>
            t.startTime === format(new Date(shift.start_time), "HH:mm") &&
            t.endTime === format(new Date(shift.end_time), "HH:mm")
        ) || templates[0];

      return {
        id: shift.id.toString(),
        doctorId: shift.doctor_id,
        doctorName: doctor?.doctor_name || "Unknown Doctor",
        date: shift.date,
        shiftTemplateId: templateMatch.id,
        startTime: format(new Date(shift.start_time), "HH:mm"),
        endTime: format(new Date(shift.end_time), "HH:mm"),
        status: (shift.status === "scheduled"
          ? "draft"
          : shift.status === "completed"
          ? "confirmed"
          : "published") as "draft" | "published" | "confirmed",
      };
    });
  }, [assignmentsData, doctors, templates]);

  // Get week range based on current date
  const weekRange = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });

    const days = [];
    let day = start;

    while (day <= end) {
      days.push(new Date(day));
      day = addDays(day, 1);
    }

    return days;
  }, [currentDate]);

  // Navigation
  const prevWeek = () => {
    setCurrentDate((prev) => addDays(prev, -7));
  };

  const nextWeek = () => {
    setCurrentDate((prev) => addDays(prev, 7));
  };

  const todayWeek = () => {
    setCurrentDate(new Date());
  };



  // Assignment handling
  const handleAssignShift = (
    date: Date,
    doctorId: string,
    templateId: string
  ) => {
    if (!doctorId || !templateId) {
      toast({
        title: "Invalid Assignment",
        description: "Please select both a doctor and a shift template",
        variant: "destructive",
      });
      return;
    }

    const doctor = doctors.find(
      (d: Doctor) => d.doctor_id.toString() === doctorId
    );
    const template = templates.find((t) => t.id === templateId);

    if (!doctor || !template) return;

    const shiftStartTime = new Date(date);
    if (isNaN(shiftStartTime.getTime())) {
      toast({
        title: "Invalid Date",
        description: "The selected date is not valid",
        variant: "destructive",
      });
      return;
    }

    shiftStartTime.setHours(
      parseInt(template.startTime.split(":")[0]),
      parseInt(template.startTime.split(":")[1]),
      0,
      0
    );

    const shiftEndTime = new Date(date);
    shiftEndTime.setHours(
      parseInt(template.endTime.split(":")[0]),
      parseInt(template.endTime.split(":")[1]),
      0,
      0
    );

    // Check for time overlaps
    const dateStr = format(date, "yyyy-MM-dd");
    const existingShifts = assignments.filter(
      (a) =>
        a.date === dateStr &&
        (a.doctorId === doctor.doctor_id ||
          a.doctorId?.toString() === doctor.doctor_id?.toString())
    );

    const hasOverlap = existingShifts.some((shift) => {
      const existingStart = new Date(`${shift.date} ${shift.startTime}`);
      const existingEnd = new Date(`${shift.date} ${shift.endTime}`);

      return (
        (shiftStartTime >= existingStart && shiftStartTime < existingEnd) ||
        (shiftEndTime > existingStart && shiftEndTime <= existingEnd) ||
        (shiftStartTime <= existingStart && shiftEndTime >= existingEnd)
      );
    });

    if (hasOverlap) {
      toast({
        title: "Time Conflict",
        description: "This shift overlaps with an existing shift for this doctor",
        variant: "destructive",
      });
      return;
    }

    const shiftData = {
      start_time: shiftStartTime,
      end_time: shiftEndTime,
      doctor_id: doctor.doctor_id,
      title: template.name,
      status: "scheduled",
      description: `Created from template ${template.name}`,
    };

    createMutation.mutate(shiftData, {
      onSuccess: (data) => {
        setSelectedDoctor(null);
        setSelectedTemplate(null);
        setShowAssignDialog(false);

        toast({
          title: "Shift Assigned",
          description: `${doctor.doctor_name} has been assigned to ${
            template.name
          } on ${format(date, "MMM dd, yyyy")}`,
          className: "bg-green-50 text-green-800 border-green-200",
        });
      },
      onError: (error) => {
        toast({
          title: "Assignment Failed",
          description: "Failed to create shift assignment",
          variant: "destructive",
        });
      },
    });
  };

  const handleDeleteAssignment = (id: string) => {
    deleteMutation.mutate(parseInt(id), {
      onSuccess: () => {
        toast({
          title: "Assignment Removed",
          description: "The shift assignment has been removed",
          className: "bg-red-50 text-red-800 border-red-200",
        });
      },
      onError: (error) => {
        toast({
          title: "Deletion Failed",
          description: "Failed to remove shift assignment",
          variant: "destructive",
        });
      },
    });
  };

  const getTemplateForAssignment = (assignment: DoctorAssignment) => {
    return templates.find((t) => t.id === assignment.shiftTemplateId);
  };

  const renderWeekView = () => {
    if (assignmentsLoading) {
      return (
        <div className="flex items-center justify-center h-64 border rounded-2xl bg-[#F9FAFB] mt-4">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#2C78E4]" />
            <p className="text-[#4B5563] font-medium">Loading shifts...</p>
            <p className="text-sm text-[#6B7280]">Please wait while we fetch the schedule</p>
          </div>
        </div>
      );
    }

    return (
      <div className="border rounded-2xl overflow-hidden mt-6 shadow-md bg-white">
        <div className="grid grid-cols-8 border-b bg-gradient-to-r from-[#F9FAFB] to-gray-50">
          <div className="p-4 border-r font-semibold bg-white flex items-center justify-center text-[#111827]">
            <Users className="h-4 w-4 mr-2 text-[#2C78E4]" />
            Doctors
          </div>
          {weekRange.map((day, index) => (
            <div
              key={index}
              className={`p-4 text-center font-semibold border-r last:border-r-0 ${
                isSameDay(day, new Date())
                  ? "bg-[#2C78E4]/10 text-[#2C78E4]"
                  : "text-[#111827]"
              }`}
            >
              <div className="text-sm">{format(day, "EEE")}</div>
              <div className="text-lg font-bold mt-1">{format(day, "d")}</div>
              <div className="text-xs text-[#4B5563] mt-1">
                {format(day, "MMM")}
              </div>
            </div>
          ))}
        </div>

        {doctorsLoading ? (
          <div className="p-12 text-center text-[#4B5563] flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#2C78E4]" />
            <span className="font-medium">Loading doctors...</span>
          </div>
        ) : doctors.length === 0 ? (
          <div className="p-12 text-center">
            <div className="bg-[#2C78E4]/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-[#2C78E4]" />
            </div>
            <h3 className="font-semibold text-[#111827] mb-2">No doctors available</h3>
            <p className="text-[#4B5563]">Add doctors to start scheduling shifts</p>
          </div>
        ) : (
          doctors.map((doctor: Doctor) => (
            <div
              key={doctor.doctor_id}
              className="grid grid-cols-8 border-b last:border-b-0 hover:bg-[#F9FAFB]/50 transition-colors"
            >
              <div className="p-4 border-r flex flex-col justify-center bg-white">
                <div className="flex items-center space-x-3">
                  <div className="bg-[#2C78E4]/10 p-2 rounded-full">
                    <Stethoscope className="h-4 w-4 text-[#2C78E4]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#111827]">
                      {doctor.doctor_name}
                    </div>
                    <div className="text-sm text-[#4B5563]">
                      {doctor.specialization || "General Practice"}
                    </div>
                  </div>
                </div>
              </div>

              {weekRange.map((day, index) => {
                const dayStr = format(day, "yyyy-MM-dd");
                const dayAssignments = assignments
                  .filter(
                    (a) =>
                      a.date === dayStr &&
                      (a.doctorId === doctor.doctor_id ||
                        a.doctorId?.toString() === doctor.doctor_id?.toString())
                  )
                  .sort((a, b) => {
                    const timeA = a.startTime || "00:00";
                    const timeB = b.startTime || "00:00";
                    return timeA.localeCompare(timeB);
                  });

                return (
                  <div
                    key={index}
                    className={`p-3 border-r last:border-r-0 min-h-[120px] relative ${
                      isSameDay(day, new Date()) ? "bg-[#2C78E4]/5" : ""
                    }`}
                  >
                    <div className="space-y-2">
                      {dayAssignments.length > 0
                        ? dayAssignments.map((assignment) => {
                            const template = getTemplateForAssignment(assignment);
                            return (
                              <div
                                key={assignment.id}
                                className={`p-2 rounded-lg border text-xs ${
                                  template?.color || "bg-gray-100"
                                } relative group hover:shadow-md transition-all duration-200`}
                              >
                                <div className="font-semibold">
                                  {template?.name}
                                </div>
                                <div className="text-xs mt-1 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {assignment.startTime} - {assignment.endTime}
                                </div>
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 hover:bg-white/50 rounded-md"
                                      >
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-32">
                                      
                                      <DropdownMenuItem className="text-xs">
                                        <Edit className="h-3 w-3 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-xs">
                                        <Copy className="h-3 w-3 mr-2" />
                                        Copy
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem 
                                        className="text-xs text-red-600"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteAssignment(assignment.id);
                                        }}
                                      >
                                        <Trash2 className="h-3 w-3 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            );
                          })
                        : null}

                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full flex flex-col items-center justify-center text-[#4B5563] hover:text-[#2C78E4] hover:bg-[#2C78E4]/10 border-2 border-dashed border-gray-200 hover:border-[#2C78E4]/30 rounded-lg py-2 transition-all duration-200"
                        onClick={() => {
                          setCurrentDate(day);
                          setSelectedDoctor(doctor.doctor_id.toString());
                          setShowAssignDialog(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mb-1" />
                        {/* <span className="text-xs">Add Shift</span> */}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    );
  };

  const renderListView = () => {
    const sortedAssignments = [...assignments]
      .filter((a) => {
        const date = new Date(a.date);
        return !isNaN(date.getTime());
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
      <div className="rounded-2xl border border-gray-100 mt-6 overflow-hidden shadow-md bg-white">
        <Table>
          <TableHeader className="bg-gradient-to-r from-[#F9FAFB] to-gray-50">
            <TableRow>
              <TableHead className="font-semibold text-[#111827]">Doctor</TableHead>
              <TableHead className="font-semibold text-[#111827]">Date</TableHead>
              <TableHead className="font-semibold text-[#111827]">Shift</TableHead>
              <TableHead className="font-semibold text-[#111827]">Time</TableHead>
              <TableHead className="font-semibold text-[#111827]">Status</TableHead>
              {/* <TableHead className="font-semibold text-[#111827] text-right">Actions</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAssignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center">
                    <div className="bg-[#2C78E4]/10 p-4 rounded-full mb-4">
                      <CalendarDays className="h-8 w-8 text-[#2C78E4]" />
                    </div>
                    <h3 className="font-semibold text-[#111827] mb-2">No shifts assigned</h3>
                    <p className="text-[#4B5563] mb-4">Start by creating shift assignments</p>
                    <Button
                      onClick={() => setShowAssignDialog(true)}
                      className="bg-[#2C78E4] hover:bg-[#2C78E4]/90 text-white rounded-lg"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Assign First Shift
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedAssignments.map((assignment) => {
                const template = getTemplateForAssignment(assignment);
                const assignmentDate = new Date(assignment.date);
                const displayDate = !isNaN(assignmentDate.getTime())
                  ? format(assignmentDate, "MMM dd, yyyy")
                  : format(new Date(), "MMM dd, yyyy");

                return (
                  <TableRow key={assignment.id} className="hover:bg-[#F9FAFB]/60">
                    <TableCell className="font-semibold text-[#111827]">
                      <div className="flex items-center space-x-2">
                        <div className="bg-[#2C78E4]/10 p-1 rounded-full">
                          <Stethoscope className="h-3 w-3 text-[#2C78E4]" />
                        </div>
                        <span>{assignment.doctorName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#111827]">{displayDate}</TableCell>
                    <TableCell>
                      <Badge className={cn("rounded-full", template?.color)}>
                        {template?.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#111827]">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1 text-[#4B5563]" />
                        {assignment.startTime} - {assignment.endTime}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={assignment.status === "published" ? "default" : "outline"}
                        className={
                          assignment.status === "published"
                            ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20"
                            : assignment.status === "confirmed"
                            ? "bg-[#2C78E4]/10 text-[#2C78E4] border-[#2C78E4]/20"
                            : "bg-[#FFA726]/10 text-[#FFA726] border-[#FFA726]/20"
                        }
                      >
                        {assignment.status}
                      </Badge>
                    </TableCell>
                    {/* <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Shift
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteAssignment(assignment.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell> */}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-[#2C78E4] to-[#2C78E4]/80 px-6 py-4 md:px-8 md:py-5 rounded-2xl shadow-md mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">Shift Management</h1>
            <p className="text-sm text-white">Efficiently manage doctor shifts and schedules</p>
          </div>
        </div>
      </div>

      {/* Main Schedule Card */}
      <Card className="border-none shadow-lg rounded-2xl overflow-hidden bg-white">
        <CardHeader className="bg-gradient-to-r from-[#F9FAFB] to-white border-b border-gray-100 pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <CardTitle className="text-xl font-bold text-[#111827] flex items-center">
                <Calendar className="h-6 w-6 mr-2 text-[#2C78E4]" />
                Shift Schedule
              </CardTitle>
              
              <Tabs
                value={activeView}
                onValueChange={(v) => setActiveView(v as "week" | "list")}
                className="ml-4"
              >
                <TabsList className="grid grid-cols-2 bg-gray-100 rounded-lg">
                  <TabsTrigger
                    value="week"
                    className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#2C78E4]"
                  >
                    <Calendar className="h-4 w-4" />
                    Week View
                  </TabsTrigger>
                  <TabsTrigger
                    value="list"
                    className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#2C78E4]"
                  >
                    <Users className="h-4 w-4" />
                    List View
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowTemplateDialog(true)}
                className="border-gray-200 rounded-lg hover:bg-[#F9FAFB] hover:border-[#2C78E4]/20"
              >
                <Settings className="h-4 w-4 mr-2" />
                Templates
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAssignDialog(true)}
                className="border-gray-200 rounded-lg hover:bg-[#F9FAFB] hover:border-[#2C78E4]/20"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Quick Assign
              </Button>

              {activeView === "week" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevWeek}
                    className="border-gray-200 rounded-lg hover:bg-[#F9FAFB] hover:border-[#2C78E4]/20"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={todayWeek}
                    className="border-gray-200 rounded-lg hover:bg-[#F9FAFB] hover:border-[#2C78E4]/20 text-[#4B5563] px-4"
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextWeek}
                    className="border-gray-200 rounded-lg hover:bg-[#F9FAFB] hover:border-[#2C78E4]/20"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <div className="text-lg font-semibold text-[#111827] ml-2">
                    {format(weekRange[0], "MMM d")} - {format(weekRange[6], "MMM d, yyyy")}
                  </div>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {activeView === "week" ? renderWeekView() : renderListView()}
        </CardContent>
      </Card>

      {/* Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="sm:max-w-[600px] border-none shadow-lg bg-white rounded-2xl">
          <DialogHeader className="border-b border-gray-100 pb-4">
            <DialogTitle className="text-xl font-bold text-[#111827]">
              Shift Templates
            </DialogTitle>
            <DialogDescription className="text-[#4B5563]">
              Manage shift templates to streamline scheduling
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Existing Templates */}
            <div>
              <h3 className="font-semibold text-[#111827] mb-3">Current Templates</h3>
              <div className="space-y-2">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`px-3 py-1 rounded-lg text-sm ${template.color}`}>
                        {template.name}
                      </div>
                      <span className="text-sm text-[#4B5563]">
                        {template.startTime} - {template.endTime}
                      </span>
                    </div>
      
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-gray-100 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowTemplateDialog(false)}
              className="border-gray-200 hover:bg-[#F9FAFB] hover:border-[#2C78E4]/20 rounded-xl text-[#4B5563]"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Shift Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-[500px] border-none shadow-lg bg-white rounded-2xl">
          <DialogHeader className="border-b border-gray-100 pb-4">
            <DialogTitle className="text-xl font-bold text-[#111827]">
              Assign Shift
            </DialogTitle>
            <DialogDescription className="text-[#4B5563]">
              Quickly assign a shift to a doctor
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="assign-date" className="text-[#111827] font-medium">
                Date
              </Label>
              <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-[#2C78E4]" />
                  <span className="font-medium text-[#111827]">
                    {format(currentDate, "EEEE, MMMM d, yyyy")}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="assign-doctor" className="text-[#111827] font-medium">
                Doctor
              </Label>
              <Select
                value={selectedDoctor || ""}
                onValueChange={setSelectedDoctor}
              >
                <SelectTrigger
                  id="assign-doctor"
                  className="mt-2 border-gray-200 hover:border-[#2C78E4]/40 rounded-xl"
                >
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 rounded-xl">
                  {doctors.map((doctor: Doctor) => (
                    <SelectItem
                      key={doctor.doctor_id}
                      value={doctor.doctor_id.toString()}
                    >
                      <div className="flex items-center space-x-2">
                        <Stethoscope className="h-4 w-4 text-[#2C78E4]" />
                        <span>{doctor.doctor_name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="assign-template" className="text-[#111827] font-medium">
                Shift Template
              </Label>
              <Select
                value={selectedTemplate || ""}
                onValueChange={setSelectedTemplate}
              >
                <SelectTrigger
                  id="assign-template"
                  className="mt-2 border-gray-200 hover:border-[#2C78E4]/40 rounded-xl"
                >
                  <SelectValue placeholder="Select a shift template" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 rounded-xl">
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{template.name}</span>
                        <span className="text-sm text-[#4B5563] ml-4">
                          {template.startTime} - {template.endTime}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="border-t border-gray-100 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowAssignDialog(false)}
              className="border-gray-200 hover:bg-[#F9FAFB] hover:border-[#2C78E4]/20 rounded-xl text-[#4B5563]"
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                handleAssignShift(
                  currentDate,
                  selectedDoctor || "",
                  selectedTemplate || ""
                )
              }
              disabled={!selectedDoctor || !selectedTemplate}
              className="bg-[#2C78E4] hover:bg-[#2C78E4]/90 text-white rounded-xl disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShiftAssignmentPage;
