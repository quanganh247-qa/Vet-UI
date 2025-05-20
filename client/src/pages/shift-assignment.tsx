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
];

// Assignment type for the week view
type DoctorAssignment = {
  id: string;
  doctorId: number;
  doctorName: string;
  date: string; // Date stored as string
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

  const { createMutation, updateMutation, deleteMutation } =
    useShiftMutations();

  // Format doctors data
  const doctors = useMemo(() => {
    if (!doctorsData?.data) return [];
    // Filter to only include doctors with role "doctor" or "Doctor"
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

      // Find matching template or use the first template as fallback
      const templateMatch =
        templates.find(
          (t) =>
            t.startTime === format(new Date(shift.start_time), "HH:mm") &&
            t.endTime === format(new Date(shift.end_time), "HH:mm")
        ) || templates[0];

      // Ensure we're working with valid dates
      const startDate = new Date(shift.start_time);
      const isValidDate = !isNaN(startDate.getTime());

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
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Week starts on Monday
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

  // Template management
  const handleAddTemplate = () => {
    if (!newTemplate.name || !newTemplate.startTime || !newTemplate.endTime) {
      toast({
        title: "Invalid Template",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const templateWithId: ShiftTemplate = {
      id: `template_${Date.now()}`,
      name: newTemplate.name || "New Shift",
      startTime: newTemplate.startTime || "09:00",
      endTime: newTemplate.endTime || "17:00",
      color: "bg-[#2C78E4]/10 border-[#2C78E4]/30 text-[#2C78E4]",
      recurring: newTemplate.recurring || false,
      days: newTemplate.days,
    };

    setTemplates((prev) => [...prev, templateWithId]);
    setNewTemplate({
      name: "",
      startTime: "09:00",
      endTime: "17:00",
      recurring: false,
      days: [],
    });
    setShowTemplateDialog(false);

    toast({
      title: "Template Created",
      description: "New shift template has been created",
      className: "bg-green-50 text-green-800 border-green-200",
    });
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    toast({
      title: "Template Deleted",
      description: "Shift template has been removed",
      className: "bg-red-50 text-red-800 border-red-200",
    });
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

    // Create the shift on the backend
    const shiftStartTime = new Date(date);
    // Ensure date is valid
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

    // Check for time overlaps with existing shifts
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
        description:
          "This shift overlaps with an existing shift for this doctor",
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
        // Clear selections and close dialog
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
    // Delete from backend
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

  // Get template info for an assignment
  const getTemplateForAssignment = (assignment: DoctorAssignment) => {
    return templates.find((t) => t.id === assignment.shiftTemplateId);
  };

  // Effect to set current date to match data when component loads
  useEffect(() => {
    if (assignments.length > 0) {
      try {
        // Find the earliest date in assignments that is valid and not in the past
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Set to midnight for comparison

        // Filter valid dates and those not in the past
        const validDates = assignments
          .map((a) => new Date(a.date))
          .filter((date) => !isNaN(date.getTime()) && date >= now);

        if (validDates.length > 0) {
          // Sort dates in ascending order and take the earliest
          const earliestFutureDate = new Date(
            Math.min(...validDates.map((d) => d.getTime()))
          );
          setCurrentDate(earliestFutureDate);
          console.log(
            "Set current date to earliest valid future assignment date:",
            format(earliestFutureDate, "yyyy-MM-dd")
          );
        } else {
          // If no valid future dates, use current date
          setCurrentDate(new Date());
          console.log("No valid future assignments found, using current date");
        }
      } catch (error) {
        console.error("Error setting initial date:", error);
        // Default to current date on error
        setCurrentDate(new Date());
      }
    }
  }, [assignments]);

  // Render week view
  const renderWeekView = () => {
    console.log("Current assignments:", assignments);
    console.log(
      "Week range:",
      weekRange.map((day) => format(day, "yyyy-MM-dd"))
    );

    // If no assignments are loaded yet, show loading state
    if (assignmentsLoading) {
      return (
        <div className="flex items-center justify-center h-64 border rounded-lg bg-[#F9FAFB] mt-4">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-[#2C78E4]" />
            <p className="text-[#4B5563]">Loading assignments...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="border rounded-lg overflow-hidden mt-4">
        <div className="grid grid-cols-8 border-b">
          <div className="p-3 border-r font-medium bg-[#F9FAFB] flex items-center justify-center text-[#4B5563]">
            Doctors
          </div>
          {weekRange.map((day, index) => (
            <div
              key={index}
              className={`p-3 text-center font-medium border-r last:border-r-0 ${
                isSameDay(day, new Date())
                  ? "bg-[#2C78E4]/5 text-[#2C78E4]"
                  : "text-[#111827]"
              }`}
            >
              <div>{format(day, "EEE")}</div>
              <div className="text-sm text-[#4B5563]">
                {format(day, "MMM dd")}
              </div>
            </div>
          ))}
        </div>

        {doctorsLoading ? (
          <div className="p-8 text-center text-[#4B5563] flex flex-col items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-[#2C78E4]" />
            <span>Loading doctors...</span>
          </div>
        ) : doctors.length === 0 ? (
          <div className="p-8 text-center text-[#4B5563]">
            No doctors available
          </div>
        ) : (
          doctors.map((doctor: Doctor) => (
            <div
              key={doctor.doctor_id}
              className="grid grid-cols-8 border-b last:border-b-0"
            >
              <div className="p-3 border-r flex flex-col justify-center">
                <div className="font-medium text-[#111827]">
                  {doctor.doctor_name}
                </div>
                <div className="text-sm text-[#4B5563]">
                  {doctor.specialization || "Doctor"}
                </div>
              </div>

              {weekRange.map((day, index) => {
                // Format date string for comparison
                const dayStr = format(day, "yyyy-MM-dd");

                // Get assignments for this day/doctor
                const dayAssignments = assignments
                  .filter(
                    (a) =>
                      a.date === dayStr &&
                      (a.doctorId === doctor.doctor_id ||
                        a.doctorId?.toString() ===
                          doctor.doctor_id?.toString() ||
                        (a.doctorName === doctor.doctor_name &&
                          a.doctorName === "DHQA RCC")) // Special handling for test data
                  )
                  .sort((a, b) => {
                    // Sort by start time
                    const timeA = a.startTime || "00:00";
                    const timeB = b.startTime || "00:00";
                    return timeA.localeCompare(timeB);
                  });

                return (
                  <div
                    key={index}
                    className={`p-2 border-r last:border-r-0 min-h-[100px] relative ${
                      isSameDay(day, new Date()) ? "bg-[#2C78E4]/5" : ""
                    }`}
                  >
                    <div className="space-y-1">
                      {dayAssignments.length > 0
                        ? dayAssignments.map((assignment) => {
                            const template =
                              getTemplateForAssignment(assignment);
                            return (
                              <div
                                key={assignment.id}
                                className={`p-2 rounded-lg border text-xs ${
                                  template?.color || "bg-gray-100"
                                } relative group hover:shadow-md transition-shadow`}
                              >
                                <div className="font-medium">
                                  {template?.name}
                                </div>
                                <div className="text-xs mt-1">
                                  {assignment.startTime} - {assignment.endTime}
                                </div>
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                  <Trash2
                                    className="h-4 w-4 text-red-500 hover:text-red-700"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteAssignment(assignment.id);
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })
                        : null}

                      {/* Always show the Assign button, even when there are existing assignments */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full flex flex-col items-center justify-center text-[#4B5563] hover:text-[#2C78E4] hover:bg-[#F9FAFB] mt-1"
                        onClick={() => {
                          setCurrentDate(day);
                          setSelectedDoctor(doctor.doctor_id.toString());
                          setShowAssignDialog(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mb-1" />
                        {/* <span className="text-xs">Assign Shift</span> */}
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

  // Render list view of all assignments
  const renderListView = () => {
    // Sort by parsing date strings - ensure valid dates
    const sortedAssignments = [...assignments]
      .filter((a) => {
        const date = new Date(a.date);
        return !isNaN(date.getTime()); // Filter out invalid dates
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
      <div className="rounded-lg border border-gray-200 mt-4 overflow-hidden">
        <Table>
          <TableHeader className="bg-[#F9FAFB]">
            <TableRow>
              <TableHead className="font-medium text-[#111827]">
                Doctor
              </TableHead>
              <TableHead className="font-medium text-[#111827]">Date</TableHead>
              <TableHead className="font-medium text-[#111827]">
                Shift
              </TableHead>
              <TableHead className="font-medium text-[#111827]">Time</TableHead>
              <TableHead className="font-medium text-[#111827]">
                Status
              </TableHead>
              <TableHead className="font-medium text-[#111827] text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAssignments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-[#4B5563]"
                >
                  No shift assignments found
                </TableCell>
              </TableRow>
            ) : (
              sortedAssignments.map((assignment) => {
                const template = getTemplateForAssignment(assignment);
                const assignmentDate = new Date(assignment.date);
                // Use current date as fallback if date is invalid
                const displayDate = !isNaN(assignmentDate.getTime())
                  ? format(assignmentDate, "MMM dd, yyyy")
                  : format(new Date(), "MMM dd, yyyy");

                return (
                  <TableRow key={assignment.id} className="hover:bg-[#F9FAFB]">
                    <TableCell className="font-medium text-[#111827]">
                      {assignment.doctorName}
                    </TableCell>
                    <TableCell className="text-[#111827]">
                      {displayDate}
                    </TableCell>
                    <TableCell className="text-[#111827]">
                      {template?.name}
                    </TableCell>
                    <TableCell className="text-[#111827]">
                      {assignment.startTime} - {assignment.endTime}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          assignment.status === "published"
                            ? "default"
                            : "outline"
                        }
                        className={
                          assignment.status === "published"
                            ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-100"
                            : "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100"
                        }
                      >
                        {assignment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
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
      <div className="bg-gradient-to-r from-[#2C78E4] to-[#2C78E4]/80 px-6 py-4 md:px-8 md:py-5 rounded-2xl shadow-md mb-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Shift Assignment</h1>
            
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-4">
          <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
            <CardHeader className="bg-white pb-3 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold text-[#111827] flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-[#2C78E4]" />
                  Shift Schedule
                </CardTitle>
                <Tabs
                  value={activeView}
                  onValueChange={(v) => setActiveView(v as "week" | "list")}
                  className="w-[200px]"
                >
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger
                      value="week"
                      className="flex items-center gap-1.5"
                    >
                      <Calendar className="h-4 w-4" />
                      Week View
                    </TabsTrigger>
                    <TabsTrigger
                      value="list"
                      className="flex items-center gap-1.5"
                    >
                      <Users className="h-4 w-4" />
                      List View
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <Tabs value={activeView} className="w-full">
                <TabsContent value="week" className="mt-0 p-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={prevWeek}
                        className="border-gray-200 rounded-lg hover:bg-[#F9FAFB] hover:border-[#2C78E4]/20"
                      >
                        <ChevronLeft className="h-4 w-4 text-[#4B5563]" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={todayWeek}
                        className="border-gray-200 rounded-lg hover:bg-[#F9FAFB] hover:border-[#2C78E4]/20 text-[#4B5563]"
                      >
                        Today
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={nextWeek}
                        className="border-gray-200 rounded-lg hover:bg-[#F9FAFB] hover:border-[#2C78E4]/20"
                      >
                        <ChevronRight className="h-4 w-4 text-[#4B5563]" />
                      </Button>
                      <h3 className="font-medium text-[#111827] ml-2">
                        {format(weekRange[0], "MMM d")} -{" "}
                        {format(weekRange[6], "MMM d, yyyy")}
                      </h3>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAssignDialog(true)}
                      className="border-gray-200 rounded-lg hover:bg-[#F9FAFB] hover:border-[#2C78E4]/20 text-[#4B5563]"
                    >
                      <Plus className="h-4 w-4 mr-2 text-[#2C78E4]" />
                      Quick Assign
                    </Button>
                  </div>
                  {renderWeekView()}
                </TabsContent>

                <TabsContent value="list" className="mt-0 p-0">
                  {renderListView()}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* New Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="sm:max-w-[550px] border-none shadow-md bg-white rounded-lg">
          <DialogHeader className="border-b border-gray-100 pb-4">
            <DialogTitle className="text-[#111827]">
              Create Shift Template
            </DialogTitle>
            <DialogDescription className="text-[#4B5563]">
              Define a new shift template that can be assigned to doctors.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="template-name" className="text-[#111827]">
                Template Name
              </Label>
              <Input
                id="template-name"
                placeholder="e.g., Morning Shift"
                value={newTemplate.name}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, name: e.target.value })
                }
                className="border-gray-200 focus:border-[#2C78E4] focus:ring-[#2C78E4] rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time" className="text-[#111827]">
                  Start Time
                </Label>
                <Input
                  id="start-time"
                  type="time"
                  value={newTemplate.startTime}
                  onChange={(e) =>
                    setNewTemplate({
                      ...newTemplate,
                      startTime: e.target.value,
                    })
                  }
                  className="border-gray-200 focus:border-[#2C78E4] focus:ring-[#2C78E4] rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="end-time" className="text-[#111827]">
                  End Time
                </Label>
                <Input
                  id="end-time"
                  type="time"
                  value={newTemplate.endTime}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, endTime: e.target.value })
                  }
                  className="border-gray-200 focus:border-[#2C78E4] focus:ring-[#2C78E4] rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recurring"
                  checked={newTemplate.recurring}
                  onCheckedChange={(checked) =>
                    setNewTemplate({
                      ...newTemplate,
                      recurring: checked === true,
                    })
                  }
                  className="text-[#2C78E4] border-gray-300 rounded focus:ring-[#2C78E4]"
                />
                <Label htmlFor="recurring" className="text-[#111827]">
                  Recurring Shift
                </Label>
              </div>

              {newTemplate.recurring && (
                <div className="bg-[#F9FAFB] p-4 rounded-xl border border-gray-200">
                  <Label className="mb-3 block text-[#111827] font-medium">
                    Repeat on days
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (day, index) => (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox
                            id={`day-${index}`}
                            checked={newTemplate.days?.includes(index)}
                            onCheckedChange={(checked) => {
                              const days = [...(newTemplate.days || [])];
                              if (checked) {
                                if (!days.includes(index)) days.push(index);
                              } else {
                                const dayIndex = days.indexOf(index);
                                if (dayIndex !== -1) days.splice(dayIndex, 1);
                              }
                              setNewTemplate({ ...newTemplate, days });
                            }}
                            className="text-[#2C78E4] border-gray-300 rounded focus:ring-[#2C78E4]"
                          />
                          <Label
                            htmlFor={`day-${index}`}
                            className="text-[#4B5563]"
                          >
                            {day}
                          </Label>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="template-notes" className="text-[#111827]">
                Notes (Optional)
              </Label>
              <Textarea
                id="template-notes"
                placeholder="Additional information about this shift template"
                className="min-h-[80px] border-gray-200 focus:border-[#2C78E4] focus:ring-[#2C78E4] rounded-lg"
              />
            </div>
          </div>

          <DialogFooter className="border-t border-gray-100 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowTemplateDialog(false)}
              className="border-gray-200 hover:bg-[#F9FAFB] hover:border-[#2C78E4]/20 rounded-lg text-[#4B5563]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddTemplate}
              className="bg-[#2C78E4] hover:bg-[#2C78E4]/90 text-white rounded-lg"
            >
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Shift Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-[550px] border-none shadow-md bg-white rounded-lg">
          <DialogHeader className="border-b border-gray-100 pb-4">
            <DialogTitle className="text-[#111827]">Assign Shift</DialogTitle>
            <DialogDescription className="text-[#4B5563]">
              Assign a shift template to a doctor on a specific date.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="assign-date" className="text-[#111827]">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1 border-gray-200 hover:border-[#2C78E4]/20 rounded-lg"
                  >
                    <Calendar className="mr-2 h-4 w-4 text-[#2C78E4]" />
                    {format(currentDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 border-gray-200"
                  align="start"
                >
                  {/* Here you would typically have a date picker component */}
                  <div className="p-4">
                    <div className="text-center mb-2 text-[#111827] font-medium">
                      Select a date
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {weekRange.map((day, i) => (
                        <Button
                          key={i}
                          variant={
                            isSameDay(day, currentDate) ? "default" : "outline"
                          }
                          size="sm"
                          className={cn(
                            "w-10 h-10 rounded-lg",
                            isSameDay(day, currentDate)
                              ? "bg-[#2C78E4] hover:bg-[#2C78E4]/90 text-white"
                              : "border-gray-200 hover:border-[#2C78E4]/20 hover:bg-[#F9FAFB] text-[#4B5563]"
                          )}
                          onClick={() => {
                            setCurrentDate(day);
                            // Close popover would go here
                          }}
                        >
                          {format(day, "d")}
                        </Button>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="assign-doctor" className="text-[#111827]">
                Doctor
              </Label>
              <Select
                value={selectedDoctor || ""}
                onValueChange={setSelectedDoctor}
              >
                <SelectTrigger
                  id="assign-doctor"
                  className="mt-1 border-gray-200 hover:border-[#2C78E4]/20 rounded-lg"
                >
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 rounded-lg">
                  {doctors.map((doctor: Doctor) => (
                    <SelectItem
                      key={doctor.doctor_id}
                      value={doctor.doctor_id.toString()}
                    >
                      {doctor.doctor_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="assign-template" className="text-[#111827]">
                Shift Template
              </Label>
              <Select
                value={selectedTemplate || ""}
                onValueChange={setSelectedTemplate}
              >
                <SelectTrigger
                  id="assign-template"
                  className="mt-1 border-gray-200 hover:border-[#2C78E4]/20 rounded-lg"
                >
                  <SelectValue placeholder="Select a shift template" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 rounded-lg">
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} ({template.startTime} - {template.endTime}
                      )
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center mb-2">
                <AlertCircle className="h-4 w-4 mr-2 text-[#FFA726]" />
                <Label className="text-[#111827]">Conflicts</Label>
              </div>

              <div className="text-sm text-[#4B5563]">
                No scheduling conflicts detected.
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-gray-100 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowAssignDialog(false)}
              className="border-gray-200 hover:bg-[#F9FAFB] hover:border-[#2C78E4]/20 rounded-lg text-[#4B5563]"
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
              className="bg-[#2C78E4] hover:bg-[#2C78E4]/90 text-white rounded-lg"
            >
              Assign Shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShiftAssignmentPage;
