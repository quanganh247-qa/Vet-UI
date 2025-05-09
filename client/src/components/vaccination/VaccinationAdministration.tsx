import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  AlertCircle,
  Syringe,
  Plus,
  Check,
  Calendar,
  User,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Appointment, TestByAppointment, Vaccination, Vaccine } from "@/types";
import {
  saveVaccinationRecord,
  SaveVaccinationRequest,
} from "@/services/vaccine-services";
import { format, formatDate } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  getAllAppointments,
  getAppointments,
} from "@/services/appointment-services";
import { useGetTestByAppointmentID } from "@/hooks/use-test";
import { useAllVaccines, useSaveVaccinationRecord } from "@/hooks/use-vaccine";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VaccinationAdministrationProps {
  appointmentId?: string;
  petId?: string;
  onComplete: () => void;
  onCancel: () => void;
}

const VaccinationAdministration: React.FC<VaccinationAdministrationProps> = ({
  appointmentId: initialAppointmentId,
  petId: initialPetId,
  onComplete,
  onCancel,
}) => {
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | undefined
  >(initialAppointmentId);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

  const [vaccinationData, setVaccinationData] = useState<Partial<Vaccination>>({
    pet_id: initialPetId ? Number(initialPetId) : undefined,
    vaccine_name: "",
    date_administered: new Date().toISOString().split("T")[0],
    next_due_date: "",
    vaccine_provider: "",
    batch_number: "",
    notes: "",
  });
  const { mutate: saveVaccination, isPending: isSavingVaccination } = useSaveVaccinationRecord();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [vaccinationSiteImage, setVaccinationSiteImage] = useState<string>(
    "/assets/vaccination-sites/subcutaneous.png"
  );

  const { data: allVaccines = [], isLoading: isLoadingVaccines } = useGetTestByAppointmentID(Number(selectedAppointmentId));

  useEffect(() => {
  }, [allVaccines]);

  // Fetch appointments for the selected date
  useEffect(() => {
    const fetchAppointmentsForDate = async () => {
      if (!selectedDate) return;

      try {

        const response = await getAllAppointments(selectedDate, "false", 1, 1000);
        setAppointments(response.data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast({
          title: "Error",
          description: "Failed to load appointments. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchAppointmentsForDate();
  }, [selectedDate, toast]);

  // Update selected appointment when appointment ID changes
  useEffect(() => {
    if (selectedAppointmentId && appointments.length > 0) {
      const appointment = appointments.find(
        (app) => app.id === Number(selectedAppointmentId)
      );
      if (appointment) {
        setSelectedAppointment(appointment);
        setVaccinationData((prev) => ({
          ...prev,
          pet_id: Number(appointment.pet.pet_id),
        }));
      }
    }
  }, [selectedAppointmentId, appointments]);

  // Update next due date based on vaccine selection
  const handleVaccineSelect = (vaccineName: string) => {
    const selectedVaccine = allVaccines?.find((v: TestByAppointment) => v.test_name === vaccineName);
    if (selectedVaccine) {
      setVaccinationData({
        ...vaccinationData,
        vaccine_name: selectedVaccine.test_name,
        vaccine_provider: selectedVaccine.test_name,
        batch_number: selectedVaccine.batch_number,
        next_due_date: selectedVaccine.expiration_date,
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setVaccinationData({
      ...vaccinationData,
      [name]: value,
    });
  };

  const handleComplete = () => {
    onComplete();
  };

  const validateForm = () => {
    if (!vaccinationData.pet_id) {
      toast({
        title: "Pet selection required",
        description: "Please select a pet for vaccination",
        variant: "destructive",
      });
      return false;
    }
    
    if (!vaccinationData.vaccine_name) {
      toast({
        title: "Vaccine required",
        description: "Please select a vaccine",
        variant: "destructive",
      });
      return false;
    }
    
    if (!vaccinationData.batch_number) {
      toast({
        title: "Batch number required",
        description: "Please enter the vaccine batch number",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const result = await saveVaccinationRecord({
        pet_id: vaccinationData.pet_id as number,
        vaccine_name: vaccinationData.vaccine_name as string,
        date_administered: vaccinationData.date_administered as string,
        next_due_date: vaccinationData.next_due_date as string,
        vaccine_provider: vaccinationData.vaccine_provider as string,
        batch_number: vaccinationData.batch_number as string,
        notes: vaccinationData.notes as string,
        appointment_id: selectedAppointmentId || undefined,
      });
      
      toast({
        title: "Vaccination recorded",
        description: "The vaccination details have been saved successfully",
      });
      
      // Reset form
      setVaccinationData({
        pet_id: initialPetId ? Number(initialPetId) : undefined,
        vaccine_name: "",
        date_administered: new Date().toISOString().split("T")[0],
        next_due_date: "",
        vaccine_provider: "",
        batch_number: "",
        notes: "",
      });
      
      if (onComplete) onComplete();
    } catch (error) {
      console.error("Failed to save vaccination record:", error);
      toast({
        title: "Error",
        description: "Failed to save vaccination record. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollArea className="h-[calc(80vh-120px)]">
      <div className="space-y-6 p-4 bg-white">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="w-full shadow-md border-none overflow-hidden">
            <CardContent className="pt-6 pb-2">
              {isCompleted ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="rounded-full bg-green-100 p-3 mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    Vaccination Complete
                  </h3>
                  <p className="text-gray-500 text-center mb-6">
                    {vaccinationData.vaccine_name} vaccine has been administered
                    successfully.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-4 w-full">
                    <h4 className="font-medium text-blue-700 mb-2">
                      Vaccination Details
                    </h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <p className="text-gray-500">Vaccine</p>
                        <p className="font-medium">{vaccinationData.vaccine_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Batch #</p>
                        <p className="font-medium">{vaccinationData.batch_number}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Date</p>
                        <p className="font-medium">
                          {vaccinationData.date_administered}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Next Due</p>
                        <p className="font-medium">{vaccinationData.next_due_date}</p>
                      </div>
                      {selectedAppointment && (
                        <div className="col-span-2">
                          <p className="text-gray-500">Pet</p>
                          <p className="font-medium">{selectedAppointment.pet.pet_name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Appointment Selection Section */}
                  <div className="bg-indigo-50 rounded-lg p-4 mb-4">
                    <h3 className="font-medium text-indigo-700 mb-3">
                      Select Appointment
                    </h3>
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <Label htmlFor="appointment-date" className="mb-1 block">
                            Appointment Date
                          </Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="appointment-date"
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !selectedDate && "text-muted-foreground"
                                )}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {selectedDate ? (
                                  format(selectedDate, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <CalendarComponent
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="flex-1">
                          <Label htmlFor="appointment-select" className="mb-1 block">
                            Select Appointment
                          </Label>
                          <Select
                            onValueChange={setSelectedAppointmentId}
                            value={selectedAppointmentId}
                            disabled={
                              isLoadingAppointments
                            }
                          >
                            <SelectTrigger id="appointment-select" className="w-full">
                              <SelectValue
                                placeholder={
                                  isLoadingAppointments
                                    ? "Loading..."
                                    : "Select appointment"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {appointments.map((appointment) => (
                                <SelectItem
                                  key={appointment.id}
                                  value={appointment.id.toString()}
                                >
                                  {(() => {
                                    try {
                                      return appointment.id;
                                    } catch (error) {
                                      return "Invalid time";
                                    }
                                  })()}{" "}
                                  - {appointment.pet.pet_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {selectedAppointment && (
                        <div className="bg-white rounded-md p-3 border border-indigo-100">
                          <div className="flex items-center mb-2">
                            <User className="h-4 w-4 text-indigo-500 mr-1" />
                            <h4 className="font-medium text-indigo-700">
                              Appointment Details
                            </h4>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div>
                              <p className="text-gray-500">Pet Name</p>
                              <p className="font-medium">
                                {selectedAppointment.pet.pet_name}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Owner</p>
                              <p className="font-medium">
                                {selectedAppointment.owner.owner_name}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Time</p>
                              <p className="font-medium">
                                {(() => {
                                  try {
                                    return formatDate(selectedAppointment.arrival_time, "HH:mm");
                                  } catch (error) {
                                    return "Invalid time format";
                                  }
                                })()}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Reason</p>
                              <p className="font-medium">
                                {selectedAppointment.reason}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="vaccine">Select Vaccine</Label>
                        <Select
                          onValueChange={handleVaccineSelect}
                          value={vaccinationData.vaccine_name}
                          disabled={isLoadingVaccines || !allVaccines?.length}
                        >
                          <SelectTrigger id="vaccine" className="w-full">
                            <SelectValue 
                              placeholder={
                                isLoadingVaccines 
                                  ? "Loading vaccines..." 
                                  : !allVaccines?.length 
                                    ? "No vaccines available" 
                                    : "Select a vaccine"
                              } 
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {allVaccines && allVaccines.length > 0 ? (
                              allVaccines.map((vaccine: TestByAppointment) => (
                                <SelectItem 
                                  key={vaccine.test_id || `vaccine-${Math.random()}`} 
                                  value={vaccine.test_name || "Unknown Vaccine"}
                                >
                                  {vaccine.test_name || "Unknown Vaccine"} 
                                  {vaccine.batch_number ? `(${vaccine.batch_number})` : ""}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-vaccines" disabled>
                                No vaccines available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        {selectedAppointmentId && !allVaccines?.length && !isLoadingVaccines && (
                          <p className="text-amber-600 text-xs mt-1">
                            No vaccines available for this appointment. Please select a different appointment.
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="batch_number">Batch Number</Label>
                        <Input
                          id="batch_number"
                          name="batch_number"
                          value={vaccinationData.batch_number}
                          onChange={handleInputChange}
                          placeholder="Enter vaccine batch number"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="date_administered">Administration Date</Label>
                          <Input
                            id="date_administered"
                            name="date_administered"
                            type="date"
                            value={vaccinationData.date_administered}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div>
                          <Label htmlFor="next_due_date">Next Due Date</Label>
                          <Input
                            id="next_due_date"
                            name="next_due_date"
                            type="date"
                            value={vaccinationData.next_due_date || ""}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          name="notes"
                          value={vaccinationData.notes}
                          onChange={handleInputChange}
                          placeholder="Enter any observations or reactions"
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-4">
                      <div className="flex">
                        <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                        <div>
                          <h3 className="font-medium text-amber-800 text-sm">
                            Important Notes
                          </h3>
                          <p className="text-amber-700 text-xs mt-1">
                            Always monitor the patient for at least 15-30 minutes
                            after vaccination to observe for any immediate adverse
                            reactions.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between py-4 bg-gray-50 border-t">
              {isCompleted ? (
                <Button
                  onClick={handleComplete}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  Continue to Next Step
                </Button>
              ) : (
                <div className="flex justify-end space-x-4">
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    className="border-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !selectedAppointmentId}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Recording...
                      </>
                    ) : (
                      "Record Vaccination"
                    )}
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </form>
      </div>
    </ScrollArea>
  );
};

export default VaccinationAdministration;
// Helper component for Badge
const Badge = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        className || ""
      }`}
    >
      {children}
    </span>
  );
};

