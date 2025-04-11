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

  const [administrationSite, setAdministrationSite] =
    useState<string>("subcutaneous");
  const [administrationSites, setAdministrationSites] = useState<string[]>([
    "subcutaneous",
    "intramuscular",
    "intradermal",
    "intranasal",
  ]);

  // New states for appointment selection
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
  
  const handleSaveVaccination = async () => {
    // Validate required fields
    if (!vaccinationData.pet_id) {
      toast({
        title: "Error",
        description: "Pet ID is required",
        variant: "destructive",
      });
      return;
    }
  
    if (!vaccinationData.vaccine_name?.trim()) {
      toast({
        title: "Error",
        description: "Vaccine name is required",
        variant: "destructive",
      });
      return;
    }
  
    // Date validation
    try {
      const dateAdministered = vaccinationData.date_administered 
        ? new Date(vaccinationData.date_administered)
        : null;
  
      const nextDueDate = vaccinationData.next_due_date
        ? new Date(vaccinationData.next_due_date)
        : null;
  
      if (!dateAdministered || isNaN(dateAdministered.getTime())) {
        throw new Error("Invalid administration date format");
      }
  
      if (nextDueDate && isNaN(nextDueDate.getTime())) {
        throw new Error("Invalid due date format");
      }
  
      if (nextDueDate && dateAdministered && nextDueDate <= dateAdministered) {
        throw new Error("Due date must be after administration date");
      }
  
      // Prepare payload with proper typing
      const payload: SaveVaccinationRequest = {
        pet_id: vaccinationData.pet_id,
        vaccine_name: vaccinationData.vaccine_name.trim(),
        date_administered: dateAdministered.toISOString(),
        next_due_date: nextDueDate?.toISOString() || "",
        vaccine_provider: vaccinationData.vaccine_provider?.trim() || "",
        batch_number: vaccinationData.batch_number?.trim() || "",
        notes: vaccinationData.notes?.trim() || "",
        appointment_id: selectedAppointmentId || "",
      };
  
      saveVaccination(payload);

      
      
    } catch (error) {
      toast({
        title: "Validation Error",
        description: error instanceof Error ? error.message : "Invalid input format",
        variant: "destructive",
      });
    }
  };
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [vaccinationSiteImage, setVaccinationSiteImage] = useState<string>(
    "/assets/vaccination-sites/subcutaneous.png"
  );

  const { data: allVaccines = [], isLoading: isLoadingVaccines } = useGetTestByAppointmentID(Number(selectedAppointmentId));

  console.log(vaccinationData);
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

  const handleAdministrationSiteChange = (site: string) => {
    setAdministrationSite(site);
    setVaccinationSiteImage(`/assets/vaccination-sites/${site}.png`);
  };

  const validateForm = () => {
    if (!vaccinationData.pet_id) {
      toast({
        title: "Missing Information",
        description: "Please select an appointment",
        variant: "destructive",
      });
      return false;
    }

    if (!vaccinationData.vaccine_name) {
      toast({
        title: "Missing Information",
        description: "Please select a vaccine",
        variant: "destructive",
      });
      return false;
    }

    if (!vaccinationData.batch_number) {
      toast({
        title: "Missing Information",
        description: "Please enter the batch number",
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
      // Call the saveVaccinationRecord function with the required data
      await saveVaccinationRecord({
        pet_id: vaccinationData.pet_id || 0,
        vaccine_name: vaccinationData.vaccine_name || "",
        date_administered:
          vaccinationData.date_administered ||
          formatDate(new Date(), "yyyy-MM-dd"),
        next_due_date: vaccinationData.next_due_date || "",
        vaccine_provider: vaccinationData.vaccine_provider || "",
        batch_number: vaccinationData.batch_number || "",
        notes: vaccinationData.notes || "",
        appointment_id: selectedAppointmentId || "",
      });

      setIsCompleted(true);
      toast({
        title: "Vaccination Administered",
        description: "Vaccination has been successfully recorded",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      console.error("Error administering vaccination:", error);
      toast({
        title: "Error",
        description: "Failed to record vaccination. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  return (
    <Card className="w-full shadow-md border-blue-100">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Syringe className="h-5 w-5 text-blue-500 mr-2" />
            <CardTitle className="text-lg text-blue-700">
              Vaccination Administration
            </CardTitle>
          </div>
          {isCompleted && (
            <Badge className="bg-green-100 text-green-800 flex items-center">
              <Check className="h-3.5 w-3.5 mr-1" />
              <span>Completed</span>
            </Badge>
          )}
        </div>
      </CardHeader>

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
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-blue-700 mb-3">
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
                  <div className="bg-white rounded-md p-3 border border-blue-100">
                    <div className="flex items-center mb-2">
                      <User className="h-4 w-4 text-blue-500 mr-1" />
                      <h4 className="font-medium text-blue-700">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="space-y-4">
                <div>
                  <Label>Administration Site</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {administrationSites.map((site) => (
                      <Button
                        key={site}
                        type="button"
                        variant={
                          administrationSite === site ? "default" : "outline"
                        }
                        className={`justify-start text-sm capitalize ${
                          administrationSite === site
                            ? "bg-blue-600 text-white"
                            : "text-gray-700"
                        }`}
                        onClick={() => handleAdministrationSiteChange(site)}
                      >
                        {site}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="border rounded-md p-4 mt-4">
                  <h3 className="font-medium text-gray-700 mb-2 text-center">
                    Recommended Injection Site
                  </h3>
                  <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center p-4">
                    <div className="text-center text-gray-500 text-sm">
                      <p className="capitalize">
                        {administrationSite} injection site
                      </p>
                      <p className="text-xs mt-1">
                        Image would show recommended site
                      </p>
                    </div>
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
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between py-4 bg-gray-50 border-t">
        {isCompleted ? (
          <Button
            onClick={handleComplete}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Continue to Next Step
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveVaccination}
              disabled={isSubmitting || !selectedAppointmentId}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <span className="mr-2">Processing...</span>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                "Record Vaccination"
              )}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
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
