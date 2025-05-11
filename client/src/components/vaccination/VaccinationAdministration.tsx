import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
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
  ArrowRight,
  PlusCircle,
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
import { Badge } from "@/components/ui/badge";

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

  const { data: allVaccines = [], isLoading: isLoadingVaccines } = useGetTestByAppointmentID(
    selectedAppointmentId ? Number(selectedAppointmentId) : 0
  );

  // Fetch appointments for the selected date
  useEffect(() => {
    const fetchAppointmentsForDate = async () => {
      if (!selectedDate) return;

      try {
        setIsLoadingAppointments(true);
        const response = await getAllAppointments(selectedDate, "false", 1, 1000);
        setAppointments(response.data);
        setIsLoadingAppointments(false);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setIsLoadingAppointments(false);
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

  // Set initial appointment ID from props
  useEffect(() => {
    if (initialAppointmentId) {
      setSelectedAppointmentId(initialAppointmentId);
    }
  }, [initialAppointmentId]);

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
      // Format dates properly with time component to match expected format
      const formatDateForAPI = (dateString: string | undefined): string => {
        if (!dateString) return '';
        // Add time component to make it a valid ISO 8601 date-time string
        return `${dateString}T00:00:00Z`;
      };
      
      const result = await saveVaccinationRecord({
        pet_id: vaccinationData.pet_id as number,
        vaccine_name: vaccinationData.vaccine_name as string,
        date_administered: formatDateForAPI(vaccinationData.date_administered),
        next_due_date: formatDateForAPI(vaccinationData.next_due_date),
        vaccine_provider: vaccinationData.vaccine_provider as string,
        batch_number: vaccinationData.batch_number as string,
        notes: vaccinationData.notes as string,
        appointment_id: selectedAppointmentId || undefined,
      });
      
      toast({
        title: "Vaccination recorded",
        description: "The vaccination details have been saved successfully",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      
      setIsCompleted(true);
      
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
    <div className="space-y-6">
      {isCompleted ? (
        <Card className="border-none shadow-md overflow-hidden bg-white">
          <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b pb-4">
            <CardTitle className="text-lg font-semibold text-green-800 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Vaccination Complete
            </CardTitle>
            <CardDescription>
              The vaccination has been successfully recorded
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-6">
              <div className="rounded-full bg-green-100 p-4 mb-5">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Vaccination Recorded Successfully
              </h3>
              <p className="text-gray-500 text-center mb-6 max-w-md">
                {vaccinationData.vaccine_name} vaccine has been administered and recorded in the patient's medical record.
              </p>
              
              <div className="bg-indigo-50 rounded-lg p-6 w-full max-w-md">
                <h4 className="font-medium text-indigo-700 mb-4 flex items-center border-b border-indigo-100 pb-2">
                  <Syringe className="mr-2 h-5 w-5 text-indigo-600" />
                  Vaccination Details
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div>
                    <p className="text-gray-500">Vaccine</p>
                    <p className="font-medium">{vaccinationData.vaccine_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Batch #</p>
                    <p className="font-medium">{vaccinationData.batch_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Date Administered</p>
                    <p className="font-medium">
                      {vaccinationData.date_administered ? format(new Date(vaccinationData.date_administered), "MMM d, yyyy") : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Next Due Date</p>
                    <p className="font-medium">
                      {vaccinationData.next_due_date ? format(new Date(vaccinationData.next_due_date), "MMM d, yyyy") : "N/A"}
                    </p>
                  </div>
                  {selectedAppointment && (
                    <div className="col-span-2 pt-2 border-t border-indigo-100">
                      <p className="text-gray-500">Patient</p>
                      <p className="font-medium">{selectedAppointment.pet.pet_name}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          {/* <CardFooter className="flex justify-center py-4 bg-gray-50 border-t">
            <Button
              onClick={handleComplete}
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"
            >
              <span>Continue to Next Step</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter> */}
        </Card>
      ) : (
        <form className="space-y-6">
          <Card className="border-none shadow-md overflow-hidden bg-white">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b pb-4">
              <CardTitle className="text-lg font-semibold text-indigo-900 flex items-center">
                <Syringe className="h-5 w-5 mr-2 text-indigo-600" />
                Vaccine Administration
              </CardTitle>
              <CardDescription>
                Record a new vaccination for this patient
              </CardDescription>
            </CardHeader>
            
            <CardContent className="py-6 px-6">
              {/* Appointment Selection Section */}
              {!initialAppointmentId && (
                <div className="mb-6 bg-indigo-50 rounded-lg p-5">
                  <h3 className="font-medium text-indigo-700 mb-3 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-indigo-600" />
                    Select Appointment
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="appointment-date" className="mb-1.5 block text-sm font-medium text-indigo-900">
                        Appointment Date
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="appointment-date"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal border-gray-300 bg-white hover:bg-gray-50",
                              !selectedDate && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4 text-indigo-500" />
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

                    <div>
                      <Label htmlFor="appointment-select" className="mb-1.5 block text-sm font-medium text-indigo-900">
                        Appointment
                      </Label>
                      <Select
                        onValueChange={setSelectedAppointmentId}
                        value={selectedAppointmentId}
                        disabled={isLoadingAppointments}
                      >
                        <SelectTrigger id="appointment-select" className="bg-white border-gray-300">
                          <SelectValue
                            placeholder={
                              isLoadingAppointments
                                ? "Loading appointments..."
                                : "Select an appointment"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {appointments.length > 0 ? (
                            appointments.map((appointment) => (
                              <SelectItem
                                key={appointment.id}
                                value={appointment.id.toString()}
                              >
                                #{appointment.id} - {appointment.pet.pet_name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-appointments" disabled>
                              {selectedDate 
                                ? "No appointments for this date" 
                                : "Select a date first"}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {selectedAppointment && (
                    <div className="mt-4 bg-white rounded-md p-3 border border-indigo-100">
                      <div className="flex items-center mb-2">
                        <User className="h-4 w-4 text-indigo-500 mr-1.5" />
                        <h4 className="font-medium text-indigo-700">
                          Appointment Details
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <p className="text-gray-500">Patient</p>
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
              )}

              {/* Vaccination Form */}
              <div className="space-y-5 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <div className="space-y-2.5">
                    <Label htmlFor="vaccine" className="text-sm font-medium text-gray-700">
                      Select Vaccine <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={handleVaccineSelect}
                      value={vaccinationData.vaccine_name}
                      disabled={isLoadingVaccines || !allVaccines?.length}
                    >
                      <SelectTrigger id="vaccine" className="w-full bg-white border-gray-300">
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
                      <p className="text-amber-600 text-xs mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        No vaccines available for this appointment
                      </p>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    <Label htmlFor="batch_number" className="text-sm font-medium text-gray-700">
                      Batch Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="batch_number"
                      name="batch_number"
                      value={vaccinationData.batch_number}
                      onChange={handleInputChange}
                      placeholder="Enter vaccine batch number"
                      className="bg-white border-gray-300"
                    />
                  </div>

                  <div className="space-y-2.5">
                    <Label htmlFor="date_administered" className="text-sm font-medium text-gray-700">
                      Administration Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="date_administered"
                      name="date_administered"
                      type="date"
                      value={vaccinationData.date_administered}
                      onChange={handleInputChange}
                      className="bg-white border-gray-300"
                    />
                  </div>

                  <div className="space-y-2.5">
                    <Label htmlFor="next_due_date" className="text-sm font-medium text-gray-700">
                      Next Due Date
                    </Label>
                    <Input
                      id="next_due_date"
                      name="next_due_date"
                      type="date"
                      value={vaccinationData.next_due_date || ""}
                      onChange={handleInputChange}
                      className="bg-white border-gray-300"
                    />
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  <Label htmlFor="vaccine_provider" className="text-sm font-medium text-gray-700">
                    Vaccine Provider
                  </Label>
                  <Input
                    id="vaccine_provider"
                    name="vaccine_provider"
                    value={vaccinationData.vaccine_provider || ""}
                    onChange={handleInputChange}
                    placeholder="Enter vaccine provider or manufacturer"
                    className="bg-white border-gray-300"
                  />
                </div>

                <div className="space-y-2.5 pt-1">
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={vaccinationData.notes || ""}
                    onChange={handleInputChange}
                    placeholder="Enter any observations or reactions"
                    rows={3}
                    className="bg-white border-gray-300 min-h-[80px]"
                  />
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mt-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-amber-500 mr-2.5 flex-shrink-0" />
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
            </CardContent>

            <CardFooter className="flex justify-end py-4 bg-gray-50 border-t gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-gray-300"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedAppointmentId}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Recording...
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4" />
                    Record Vaccination
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
};

export default VaccinationAdministration;

