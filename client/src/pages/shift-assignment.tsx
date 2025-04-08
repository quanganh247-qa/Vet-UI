import React, { useState, useMemo } from 'react';
import { format, addDays, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Trash2,
  Users,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { useDoctors } from '@/hooks/use-doctor';
import { useShifts, useShiftMutations } from '@/hooks/use-shifts';
import { Doctor } from '@/types';

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
    id: '1',
    name: 'Morning Shift',
    startTime: '08:00',
    endTime: '12:00',
    color: 'bg-blue-100 border-blue-300 text-blue-800',
    recurring: false
  },
  {
    id: '2',
    name: 'Afternoon Shift',
    startTime: '13:00',
    endTime: '17:00',
    color: 'bg-green-100 border-green-300 text-green-800',
    recurring: false
  },
  {
    id: '3',
    name: 'Evening Shift',
    startTime: '18:00',
    endTime: '22:00',
    color: 'bg-purple-100 border-purple-300 text-purple-800',
    recurring: false
  }
];

// Assignment type for the week view
type DoctorAssignment = {
  id: string;
  doctorId: number;
  doctorName: string;
  date: Date;
  shiftTemplateId: string;
  startTime: string;
  endTime: string;
  status: 'draft' | 'published' | 'confirmed';
};

const ShiftAssignmentPage = () => {
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState<'week' | 'list'>('week');
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [templates, setTemplates] = useState<ShiftTemplate[]>(defaultTemplates);
  const [newTemplate, setNewTemplate] = useState<Partial<ShiftTemplate>>({
    name: '',
    startTime: '09:00',
    endTime: '17:00',
    recurring: false,
    days: [],
  });
  const [assignments, setAssignments] = useState<DoctorAssignment[]>([]);
  
  // Data fetching
  const { data: doctorsData, isLoading: doctorsLoading } = useDoctors();
  const { createMutation } = useShiftMutations();

  // Format doctors data
  const doctors = useMemo(() => {
    if (!doctorsData?.data) return [];
    return doctorsData.data;
  }, [doctorsData]);

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
    setCurrentDate(prev => addDays(prev, -7));
  };

  const nextWeek = () => {
    setCurrentDate(prev => addDays(prev, 7));
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
        variant: "destructive"
      });
      return;
    }
    
    const templateWithId: ShiftTemplate = {
      id: `template_${Date.now()}`,
      name: newTemplate.name || 'New Shift',
      startTime: newTemplate.startTime || '09:00',
      endTime: newTemplate.endTime || '17:00',
      color: 'bg-gray-100 border-gray-300 text-gray-800',
      recurring: newTemplate.recurring || false,
      days: newTemplate.days
    };
    
    setTemplates(prev => [...prev, templateWithId]);
    setNewTemplate({
      name: '',
      startTime: '09:00',
      endTime: '17:00',
      recurring: false,
      days: [],
    });
    setShowTemplateDialog(false);
    
    toast({
      title: "Template Created",
      description: "New shift template has been created"
    });
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast({
      title: "Template Deleted",
      description: "Shift template has been removed"
    });
  };

  // Assignment handling
  const handleAssignShift = (date: Date, doctorId: string, templateId: string) => {
    if (!doctorId || !templateId) {
      toast({
        title: "Invalid Assignment",
        description: "Please select both a doctor and a shift template",
        variant: "destructive"
      });
      return;
    }
    
    const doctor = doctors.find((d: Doctor) => d.doctor_id.toString() === doctorId);
    const template = templates.find(t => t.id === templateId);
    
    if (!doctor || !template) return;
    
    const newAssignment: DoctorAssignment = {
      id: `assignment_${Date.now()}`,
      doctorId: doctor.doctor_id,
      doctorName: doctor.doctor_name,
      date: new Date(date),
      shiftTemplateId: template.id,
      startTime: template.startTime,
      endTime: template.endTime,
      status: 'draft'
    };
    
    setAssignments(prev => [...prev, newAssignment]);
    setSelectedDoctor(null);
    setSelectedTemplate(null);
    setShowAssignDialog(false);
    
    toast({
      title: "Shift Assigned",
      description: `${doctor.doctor_name} has been assigned to ${template.name} on ${format(date, 'MMM dd, yyyy')}`
    });
  };

  const handleDeleteAssignment = (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
    toast({
      title: "Assignment Removed",
      description: "The shift assignment has been removed"
    });
  };

  const handlePublishAssignments = () => {
    // In a real app, this would send the assignments to the backend
    setAssignments(prev => 
      prev.map(a => ({...a, status: 'published'}))
    );
    
    toast({
      title: "Shifts Published",
      description: "All shifts have been published and notifications sent to doctors"
    });
  };

  // Get assignments for a specific doctor and date
  const getAssignmentsForDay = (date: Date, doctorId?: number) => {
    return assignments.filter(a => 
      isSameDay(a.date, date) && 
      (doctorId ? a.doctorId === doctorId : true)
    );
  };

  // Get template info for an assignment
  const getTemplateForAssignment = (assignment: DoctorAssignment) => {
    return templates.find(t => t.id === assignment.shiftTemplateId);
  };

  // Render week view
  const renderWeekView = () => {
    return (
      <div className="border rounded-lg overflow-hidden mt-4">
        <div className="grid grid-cols-8 border-b">
          <div className="p-3 border-r font-medium bg-muted/20 flex items-center justify-center">
            Doctors
          </div>
          {weekRange.map((day, index) => (
            <div 
              key={index} 
              className={`p-3 text-center font-medium border-r last:border-r-0 ${
                isSameDay(day, new Date()) ? 'bg-blue-50' : ''
              }`}
            >
              <div>{format(day, 'EEE')}</div>
              <div className="text-sm text-muted-foreground">{format(day, 'MMM dd')}</div>
            </div>
          ))}
        </div>
        
        {doctorsLoading ? (
          <div className="p-8 text-center">Loading doctors...</div>
        ) : doctors.length === 0 ? (
          <div className="p-8 text-center">No doctors available</div>
        ) : (
          doctors.map((doctor: Doctor) => (
            <div key={doctor.doctor_id} className="grid grid-cols-8 border-b last:border-b-0">
              <div className="p-3 border-r flex flex-col justify-center">
                <div className="font-medium">{doctor.doctor_name}</div>
                <div className="text-sm text-muted-foreground">{doctor.specialization || 'Doctor'}</div>
              </div>
              
              {weekRange.map((day, index) => {
                const dayAssignments = getAssignmentsForDay(day, doctor.doctor_id);
                
                return (
                  <div 
                    key={index} 
                    className={`p-2 border-r last:border-r-0 min-h-[100px] relative ${
                      isSameDay(day, new Date()) ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    {dayAssignments.length > 0 ? (
                      <div className="space-y-1">
                        {dayAssignments.map(assignment => {
                          const template = getTemplateForAssignment(assignment);
                          return (
                            <div 
                              key={assignment.id} 
                              className={`p-2 rounded border text-xs ${template?.color || 'bg-gray-100'} relative group`}
                            >
                              <div className="font-medium">{template?.name}</div>
                              <div className="text-xs mt-1">
                                {assignment.startTime} - {assignment.endTime}
                              </div>
                              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Trash2 
                                  className="h-4 w-4 text-red-500 hover:text-red-700" 
                                  onClick={() => handleDeleteAssignment(assignment.id)} 
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full h-full flex flex-col items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30"
                        onClick={() => {
                          setCurrentDate(day);
                          setSelectedDoctor(doctor.doctor_id.toString());
                          setShowAssignDialog(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mb-1" />
                        <span className="text-xs">Assign</span>
                      </Button>
                    )}
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
    const sortedAssignments = [...assignments].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    return (
      <div className="rounded-lg border mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Doctor</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Shift</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAssignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  No shift assignments found
                </TableCell>
              </TableRow>
            ) : (
              sortedAssignments.map(assignment => {
                const template = getTemplateForAssignment(assignment);
                return (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.doctorName}</TableCell>
                    <TableCell>{format(assignment.date, 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{template?.name}</TableCell>
                    <TableCell>{assignment.startTime} - {assignment.endTime}</TableCell>
                    <TableCell>
                      <Badge variant={assignment.status === 'published' ? 'default' : 'outline'}>
                        {assignment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAssignment(assignment.id)}
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
    <div className="container mx-auto py-6 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shift Assignment</h1>
          <p className="text-muted-foreground mt-1">
            Efficiently assign and manage shifts for your medical staff
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowTemplateDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
          
          <Button 
            onClick={handlePublishAssignments}
            disabled={assignments.length === 0 || assignments.every(a => a.status === 'published')}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Publish Shifts
          </Button>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <Card>
            <CardHeader className="pb-3 space-y-0">
              <div className="flex justify-between items-center">
                <CardTitle>Shift Schedule</CardTitle>
                <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'week' | 'list')}>
                  <TabsList>
                    <TabsTrigger value="week" className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Week View
                    </TabsTrigger>
                    <TabsTrigger value="list" className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      List View
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {activeView === 'week' && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={prevWeek}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={todayWeek}>
                        Today
                      </Button>
                      <Button variant="outline" size="icon" onClick={nextWeek}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <h3 className="font-medium">
                        {format(weekRange[0], 'MMM d')} - {format(weekRange[6], 'MMM d, yyyy')}
                      </h3>
                    </div>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowAssignDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Quick Assign
                    </Button>
                  </div>
                  {renderWeekView()}
                </>
              )}
              
              {activeView === 'list' && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">All Assignments</h3>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowAssignDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Assignment
                    </Button>
                  </div>
                  {renderListView()}
                </>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Shift Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {templates.map(template => (
                  <div key={template.id} className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {template.startTime} - {template.endTime}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowTemplateDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* New Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Shift Template</DialogTitle>
            <DialogDescription>
              Define a new shift template that can be assigned to doctors.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input 
                id="template-name" 
                placeholder="e.g., Morning Shift" 
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time">Start Time</Label>
                <Input 
                  id="start-time" 
                  type="time" 
                  value={newTemplate.startTime}
                  onChange={(e) => setNewTemplate({...newTemplate, startTime: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="end-time">End Time</Label>
                <Input 
                  id="end-time" 
                  type="time" 
                  value={newTemplate.endTime}
                  onChange={(e) => setNewTemplate({...newTemplate, endTime: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="recurring" 
                checked={newTemplate.recurring}
                onCheckedChange={(checked) => 
                  setNewTemplate({...newTemplate, recurring: checked === true})
                }
              />
              <Label htmlFor="recurring">Recurring Shift</Label>
            </div>
            
            {newTemplate.recurring && (
              <div>
                <Label className="mb-2 block">Repeat on days</Label>
                <div className="flex flex-wrap gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                    <div key={day} className="flex items-center space-x-1">
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
                          setNewTemplate({...newTemplate, days});
                        }}
                      />
                      <Label htmlFor={`day-${index}`}>{day}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <Label htmlFor="template-notes">Notes (Optional)</Label>
              <Textarea 
                id="template-notes" 
                placeholder="Additional information about this shift template"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTemplate}>
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Assign Shift Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Shift</DialogTitle>
            <DialogDescription>
              Assign a shift template to a doctor on a specific date.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="assign-date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(currentDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  {/* Here you would typically have a date picker component */}
                  <div className="p-4">
                    <div className="text-center mb-2">Select a date</div>
                    <div className="grid grid-cols-7 gap-1">
                      {weekRange.map((day, i) => (
                        <Button
                          key={i}
                          variant={isSameDay(day, currentDate) ? "default" : "outline"}
                          size="sm"
                          className="w-10 h-10"
                          onClick={() => {
                            setCurrentDate(day);
                            // Close popover would go here
                          }}
                        >
                          {format(day, 'd')}
                        </Button>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label htmlFor="assign-doctor">Doctor</Label>
              <Select
                value={selectedDoctor || ""}
                onValueChange={setSelectedDoctor}
              >
                <SelectTrigger id="assign-doctor" className="mt-1">
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor: Doctor) => (
                    <SelectItem key={doctor.doctor_id} value={doctor.doctor_id.toString()}>
                      {doctor.doctor_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="assign-template">Shift Template</Label>
              <Select
                value={selectedTemplate || ""}
                onValueChange={setSelectedTemplate}
              >
                <SelectTrigger id="assign-template" className="mt-1">
                  <SelectValue placeholder="Select a shift template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} ({template.startTime} - {template.endTime})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <div className="flex items-center mb-2">
                <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                <Label>Conflicts</Label>
              </div>
              
              <div className="text-sm text-muted-foreground">
                No scheduling conflicts detected.
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => handleAssignShift(
                currentDate, 
                selectedDoctor || '', 
                selectedTemplate || ''
              )}
              disabled={!selectedDoctor || !selectedTemplate}
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