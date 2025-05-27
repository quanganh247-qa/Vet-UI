import { useCreateWalkInAppointment } from "@/hooks/use-appointment";
import { useServices } from "@/hooks/use-services";
import { useDoctors } from "@/hooks/use-doctor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  PawPrint,
  Search,
  Stethoscope,
  Tag,
  User,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Zap,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  usePatientData,
  usePatientsData,
  usePetOwnerByPetId,
} from "@/hooks/use-pet";
import { AppointmentRequest } from "@/services/appointment-services";
import { useEffect, useState } from "react";
import { useShifts, useTimeSlots } from "@/hooks/use-shifts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatTime } from "@/lib/utils";

// Simplified form validation schema
const formSchema = z.object({
  pet_id: z.string().optional(),
  doctor_id: z.string().min(1, "Please select a doctor"),
  service_id: z.string().min(1, "Please select a service"),
  reason: z.string().min(1, "Please provide a reason for the visit"),
  time_slot_id: z.string().min(1, "Please select an available time slot"),
  owner: z.object({
    owner_name: z.string().min(1, "Owner name is required"),
    owner_number: z.string().min(1, "Phone number is required"),
    owner_email: z.string().email("Invalid email address"),
    owner_address: z.string().min(1, "Address is required"),
  }),
  pet: z
    .object({
      pet_name: z.string().min(1, "Pet name is required"),
      pet_species: z.string().min(1, "Species is required"),   
    })
    .optional(),
});

type FormData = z.infer<typeof formSchema>;

interface WalkInRegistrationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  className?: string;
}

interface Service {
  id: number;
  name: string;
  description: string;
  cost: number;
  notes?: string;
}

interface Doctor {
  doctor_id: number;
  doctor_name: string;
}

interface PetInfo {
  age: number;
  birth_date: string;
  breed: string;
  data_image: string;
  gender: string;
  healthnotes: string;
  last_checked_date: string;
  microchip_number: string;
  name: string;
  original_name: string;
  petid: number;
  type: string;
  username: string;
  weight: number;
}

export const WalkInRegistrationForm: React.FC<WalkInRegistrationFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formMode, setFormMode] = useState<"new" | "existing">("existing");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<PetInfo[]>([]);
  const [selectedPet, setSelectedPet] = useState<PetInfo | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");
  const [doctorSearchTerm, setDoctorSearchTerm] = useState("");

  const { data: servicesData, isLoading: servicesLoading } = useServices();
  const { data: doctorsData, isLoading: doctorsLoading } = useDoctors();
  const createWalkInMutation = useCreateWalkInAppointment();
  const isSubmitting = createWalkInMutation.isPending;

  const { data: shiftsData, isLoading: shiftsLoading } = useShifts();
  console.log("shiftsData", shiftsData);

  const {
    data: patientsData,
    isLoading: isLoading,
  } = usePatientsData(1, 9999);

  const { data: petOwnerData, isLoading: isPetOwnerLoading } =
    usePetOwnerByPetId(selectedPet?.petid);

  // Form initialization with validation
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pet_id: "",
      doctor_id: "",
      service_id: "",
      time_slot_id: "",
      reason: "",
      owner: {
        owner_name: "",
        owner_number: "",
        owner_email: "",
        owner_address: "",
      },
      pet: {
        pet_name: "",
        pet_species: "",
      },
    },
  });
  
  const {data: timeSlotsData, isLoading: timeSlotsLoading} = useTimeSlots(selectedDate, form.watch("doctor_id"));

  // Filter services based on search term
  const filteredServices = servicesData?.filter((service: Service) =>
    serviceSearchTerm.trim() === '' || 
    service.name.toLowerCase().includes(serviceSearchTerm.toLowerCase()) 
  ) || [];

  // Filter doctors based on search term and availability (shifts) on selected date
  const filteredDoctors = doctorsData?.data?.filter((doctor: Doctor) => {
    // First filter by search term if provided
    const matchesSearch = doctorSearchTerm.trim() === '' || 
      doctor.doctor_name.toLowerCase().includes(doctorSearchTerm.toLowerCase());
    
    // Then filter by whether doctor has shift on selected date
    const hasShiftOnDate = shiftsData?.some((shift: any) => 
      shift.doctor_id === doctor.doctor_id && 
      shift.date === selectedDate
    );
    
    return matchesSearch && hasShiftOnDate;
  }) || [];

  // Real-time search
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (searchTerm.trim()) {
        handlePetSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchTerm, patientsData]);

  // Update form when pet owner data is available
  useEffect(() => {
    if (petOwnerData && selectedPet) {
      form.setValue("pet_id", selectedPet.petid.toString());
      form.setValue("pet.pet_name", selectedPet.name || "");
      form.setValue("pet.pet_species", selectedPet.type || "");
      form.setValue("owner.owner_name", petOwnerData.username || "");
      form.setValue("owner.owner_number", petOwnerData.phone_number || "");
      form.setValue("owner.owner_email", petOwnerData.email || "");
      form.setValue("owner.owner_address", petOwnerData.address || "");
    }
  }, [petOwnerData, selectedPet, form]);

  const handleSubmit = async (data: FormData) => {
    try {
      if (formMode === "existing" && !selectedPet?.petid) {
        toast({
          title: "Error",
          description: "Please select a pet first",
          variant: "destructive",
        });
        return;
      }

      const appointmentData =
        formMode === "new"
          ? {
              pet_id: 0,
              doctor_id: parseInt(data.doctor_id),
              service_id: parseInt(data.service_id),
              time_slot_id: parseInt(data.time_slot_id),
              reason: data.reason,
              pet: data.pet
                ? {
                    name: data.pet.pet_name,
                    species: data.pet.pet_species,
                  }
                : {
                    name: "",
                    species: "",
                  },
              owner: {
                owner_name: data.owner.owner_name,
                owner_number: data.owner.owner_number,
                owner_email: data.owner.owner_email,
                owner_address: data.owner.owner_address,
              },
            }
          : {
              pet_id: selectedPet!.petid,
              doctor_id: parseInt(data.doctor_id),
              service_id: parseInt(data.service_id),
              time_slot_id: parseInt(data.time_slot_id),
              reason: data.reason,
              pet: {
                name: selectedPet!.name,
                species: selectedPet!.type,
              },
            };

      await createWalkInMutation.mutateAsync(appointmentData as AppointmentRequest);
      
      toast({
        title: "Success!",
        description: "Walk-in appointment created successfully",
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      
      onSuccess?.();
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast({
        title: "Error",
        description: "Error creating walk-in appointment",
        variant: "destructive",
      });
    }
  };

  const handlePetSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      if (patientsData?.data) {
        const results = patientsData.data.filter(
          (pet) =>
            pet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pet.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pet.breed?.toString().includes(searchTerm)
        );
        setSearchResults(results);
      }
    } catch (error) {
      console.error("Error searching for pets:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectPet = (pet: PetInfo) => {
    setSelectedPet(pet);
    form.setValue("pet_id", pet.petid.toString());
    form.setValue("pet.pet_name", pet.name || "");
    form.setValue("pet.pet_species", pet.type || "");
    setCurrentStep(2);
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const steps = [
    { id: 1, title: "Patient Info", icon: PawPrint },
    { id: 2, title: "Service & Doctor", icon: Stethoscope },
    { id: 3, title: "Date & Time", icon: Clock },
    { id: 4, title: "Review & Book", icon: CheckCircle2 },
  ];

  return (
    <div className="bg-white w-full">
      <div className="p-8 max-w-6xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                    currentStep >= step.id
                      ? "bg-green-500 border-green-500 text-white"
                      : "bg-gray-100 border-gray-300 text-gray-400"
                  }`}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <div
                    className={`text-sm font-medium ${
                      currentStep >= step.id ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-24 h-1 mx-4 ${
                      currentStep > step.id ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Step 1: Patient Information */}
          {currentStep === 1 && (
            <Card className="border-2 border-green-200 shadow-lg">
              <CardHeader className="bg-green-50 border-b">
                <CardTitle className="flex items-center gap-3 text-green-700">
                  <PawPrint className="h-6 w-6" />
                  Step 1: Find or Add Patient
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Mode Selection */}
                <div className="flex gap-4 mb-6">
                  <Button
                    type="button"
                    variant={formMode === "existing" ? "default" : "outline"}
                    className={`flex-1 py-4 ${
                      formMode === "existing"
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "hover:bg-blue-50"
                    }`}
                    onClick={() => setFormMode("existing")}
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Find Existing Patient
                  </Button>
                  <Button
                    type="button"
                    variant={formMode === "new" ? "default" : "outline"}
                    className={`flex-1 py-4 ${
                      formMode === "new"
                        ? "bg-green-500 hover:bg-green-600"
                        : "hover:bg-green-50"
                    }`}
                    onClick={() => setFormMode("new")}
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    Add New Patient
                  </Button>
                </div>

                {/* Existing Patient Search */}
                {formMode === "existing" && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-lg font-medium mb-2 block">Search for Patient</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Type pet name, owner name, or ID..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 py-3 text-lg border-2 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {searchResults.length > 0 && (
                      <div className="grid gap-3 max-h-96 overflow-y-auto">
                        {searchResults.map((pet: PetInfo) => (
                          <Card
                            key={pet.petid}
                            className="p-4 hover:bg-blue-50 cursor-pointer border-2 hover:border-blue-300 transition-all"
                            onClick={() => selectPet(pet)}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-full">
                                  <PawPrint className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-bold text-lg">{pet.name}</div>
                                  <div className="text-gray-600">{pet.type} • ID: {pet.petid}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">{pet.username}</div>
                                <div className="text-sm text-gray-500">Owner</div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* New Patient Form */}
                {formMode === "new" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-lg font-medium mb-2 block">Pet Name *</Label>
                        <Input
                          {...form.register("pet.pet_name")}
                          placeholder="Fluffy"
                          className="py-3 text-lg border-2 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <Label className="text-lg font-medium mb-2 block">Species *</Label>
                        <Input
                          {...form.register("pet.pet_species")}
                          placeholder="e.g., Dog, Cat, Bird, Rabbit..."
                          className="py-3 text-lg border-2 focus:border-green-500"
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Owner Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="font-medium mb-1 block">Full Name *</Label>
                          <Input
                            {...form.register("owner.owner_name")}
                            placeholder="John Smith"
                            className="border-2 focus:border-green-500"
                          />
                        </div>
                        <div>
                          <Label className="font-medium mb-1 block">Phone *</Label>
                          <Input
                            {...form.register("owner.owner_number")}
                            placeholder="(555) 123-4567"
                            className="border-2 focus:border-green-500"
                          />
                        </div>
                        <div>
                          <Label className="font-medium mb-1 block">Email *</Label>
                          <Input
                            {...form.register("owner.owner_email")}
                            type="email"
                            placeholder="email@example.com"
                            className="border-2 focus:border-green-500"
                          />
                        </div>
                        <div>
                          <Label className="font-medium mb-1 block">Address *</Label>
                          <Input
                            {...form.register("owner.owner_address")}
                            placeholder="123 Main St, City, State"
                            className="border-2 focus:border-green-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="bg-green-500 hover:bg-green-600 px-8 py-3 text-lg"
                        disabled={!form.watch("pet.pet_name") || !form.watch("owner.owner_name")}
                      >
                        Continue <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Service & Doctor */}
          {currentStep === 2 && (
            <Card className="border-2 border-blue-200 shadow-lg">
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle className="flex items-center gap-3 text-blue-700">
                  <Stethoscope className="h-6 w-6" />
                  Step 2: Select Service & Doctor
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-lg font-medium mb-3 block">Service Needed *</Label>
                    
                    {/* Service Search Input */}
                    <div className="mb-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Search services... (e.g., vaccination, checkup, surgery)"
                          value={serviceSearchTerm}
                          onChange={(e) => setServiceSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 text-sm border-2 focus:border-blue-500 rounded-xl"
                        />
                      </div>
                      {serviceSearchTerm && (
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500">
                            Found {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''}
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setServiceSearchTerm("")}
                            className="text-xs text-blue-600 hover:text-blue-800 h-auto p-1"
                          >
                            Clear search
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Service Selection Grid */}
                    <div className="max-h-64 overflow-y-auto border-2 border-gray-200 rounded-lg">
                      {servicesLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        </div>
                      ) : filteredServices.length > 0 ? (
                        <div className="space-y-2 p-3">
                          {filteredServices.map((service: Service) => (
                            <Card
                              key={service.id}
                              className={cn(
                                "p-3 cursor-pointer transition-all border hover:border-blue-500",
                                form.watch("service_id") === service.id.toString()
                                  ? "bg-blue-50 border-blue-500 ring-2 ring-blue-200"
                                  : "hover:bg-blue-25"
                              )}
                              onClick={() => form.setValue("service_id", service.id.toString())}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Tag className="h-4 w-4 text-blue-600" />
                                    <h4 className="font-semibold text-sm">{service.name}</h4>
                                  </div>
                                  {service.notes && (
                                    <p className="text-xs text-gray-500 italic">{service.notes}</p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <Badge variant="secondary" className="text-xs">
                                    {service.cost.toLocaleString('vi-VN')} VND
                                  </Badge>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Tag className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">
                            {serviceSearchTerm ? "No services found" : "No services available"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-lg font-medium mb-3 block">Available Doctor *</Label>
                    
                    {/* Info about date-based filtering */}
                    <div className="mb-3 p-2 bg-blue-50 border-l-4 border-blue-400 rounded-r">
                      <p className="text-xs text-blue-700">
                        📅 Only showing doctors with shifts on <strong>{selectedDate}</strong>
                      </p>
                    </div>
                    
                    {/* Doctor Search Input */}
                    <div className="mb-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Search doctors... (e.g., Dr. Smith, Johnson)"
                          value={doctorSearchTerm}
                          onChange={(e) => setDoctorSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 text-sm border-2 focus:border-blue-500 rounded-xl"
                        />
                      </div>
                      {doctorSearchTerm && (
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500">
                            Found {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setDoctorSearchTerm("")}
                            className="text-xs text-blue-600 hover:text-blue-800 h-auto p-1"
                          >
                            Clear search
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Doctor Selection Grid */}
                    <div className="max-h-64 overflow-y-auto border-2 border-gray-200 rounded-lg">
                      {doctorsLoading || shiftsLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                          <span className="ml-2 text-sm text-gray-500">
                            {shiftsLoading ? "Loading doctor schedules..." : "Loading doctors..."}
                          </span>
                        </div>
                      ) : filteredDoctors.length > 0 ? (
                        <div className="space-y-2 p-3">
                          {filteredDoctors.map((doctor: Doctor) => (
                            <Card
                              key={doctor.doctor_id}
                              className={cn(
                                "p-4 cursor-pointer transition-all border hover:border-blue-500",
                                form.watch("doctor_id") === doctor.doctor_id.toString()
                                  ? "bg-blue-50 border-blue-500 ring-2 ring-blue-200"
                                  : "hover:bg-blue-25"
                              )}
                              onClick={() => form.setValue("doctor_id", doctor.doctor_id.toString())}
                            >
                              <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-full">
                                  <Stethoscope className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm">Dr. {doctor.doctor_name}</h4>
                                  <p className="text-xs text-gray-500">Available on {selectedDate}</p>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Stethoscope className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">
                            {doctorSearchTerm 
                              ? "No doctors found matching your search with shifts on this date" 
                              : `No doctors available on ${selectedDate}`}
                          </p>
                          <p className="text-xs mt-1 text-gray-400">
                            Try selecting a different date in Step 3
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Label className="text-lg font-medium mb-3 block">Reason for Visit *</Label>
                  <Textarea
                    {...form.register("reason")}
                    placeholder="Please describe what's wrong or what service is needed..."
                    className="min-h-24 text-lg border-2 focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-between mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="px-6 py-3"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" /> Back
                  </Button>
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-blue-500 hover:bg-blue-600 px-8 py-3"
                    disabled={!form.watch("service_id") || !form.watch("doctor_id") || !form.watch("reason")}
                  >
                    Continue <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Date & Time */}
          {currentStep === 3 && (
            <Card className="border-2 border-purple-200 shadow-lg">
              <CardHeader className="bg-purple-50 border-b">
                <CardTitle className="flex items-center gap-3 text-purple-700">
                  <Clock className="h-6 w-6" />
                  Step 3: Choose Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-6">
                  <Label className="text-lg font-medium mb-3 block">Appointment Date *</Label>
                  <div className="flex gap-4">
                    <Input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        form.setValue("time_slot_id", "");
                        form.setValue("doctor_id", "");
                      }}
                      className="text-lg border-2 focus:border-purple-500 max-w-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const today = new Date().toISOString().split('T')[0];
                        setSelectedDate(today);
                        form.setValue("time_slot_id", "");
                        form.setValue("doctor_id", "");
                      }}
                      className="px-6"
                    >
                      Today
                    </Button>
                  </div>
                </div>

                {form.watch("doctor_id") && selectedDate && (
                  <div>
                    <Label className="text-lg font-medium mb-3 block">Available Time Slots *</Label>
                    {timeSlotsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                      </div>
                    ) : timeSlotsData?.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {timeSlotsData.map((slot: any) => (
                          <Button
                            key={slot.id}
                            type="button"
                            variant="outline"
                            onClick={() => slot.status === 'available' ? form.setValue("time_slot_id", slot.id.toString()) : null}
                            disabled={slot.status !== 'available'}
                            className={cn(
                              "h-16 relative border-2",
                              slot.status === 'available' 
                                ? "hover:bg-purple-50 hover:border-purple-500" 
                                : "bg-gray-100 text-gray-400 cursor-not-allowed",
                              form.watch("time_slot_id") === slot.id.toString() && "bg-purple-100 border-purple-500 text-purple-700"
                            )}
                          >
                            <div className="text-center">
                              <Clock className="h-4 w-4 mx-auto mb-1" />
                              <div className="font-medium text-sm">
                                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                              </div>
                              {slot.status !== 'available' && (
                                <div className="text-xs">Busy</div>
                              )}
                            </div>
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>No available time slots for this date</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="px-6 py-3"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" /> Back
                  </Button>
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-purple-500 hover:bg-purple-600 px-8 py-3"
                    disabled={!form.watch("time_slot_id")}
                  >
                    Continue <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <Card className="border-2 border-green-200 shadow-lg">
              <CardHeader className="bg-green-50 border-b">
                <CardTitle className="flex items-center gap-3 text-green-700">
                  <CheckCircle2 className="h-6 w-6" />
                  Step 4: Review & Book Appointment
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Patient Summary */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-bold text-lg mb-3">Patient Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Pet:</span> {form.watch("pet.pet_name") || selectedPet?.name}
                      </div>
                      <div>
                        <span className="font-medium">Species:</span> {form.watch("pet.pet_species") || selectedPet?.type}
                      </div>
                      <div>
                        <span className="font-medium">Owner:</span> {form.watch("owner.owner_name")}
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span> {form.watch("owner.owner_number")}
                      </div>
                    </div>
                  </div>

                  {/* Appointment Summary */}
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-bold text-lg mb-3">Appointment Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Service:</span> {
                          servicesData?.find((s: Service) => s.id.toString() === form.watch("service_id"))?.name
                        }
                      </div>
                      <div>
                        <span className="font-medium">Doctor:</span> Dr. {
                          doctorsData?.data?.find((d: Doctor) => d.doctor_id.toString() === form.watch("doctor_id"))?.doctor_name
                        }
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {selectedDate}
                      </div>
                      <div>
                        <span className="font-medium">Time:</span> {
                          timeSlotsData?.find((t: any) => t.id.toString() === form.watch("time_slot_id")) &&
                          `${formatTime(timeSlotsData.find((t: any) => t.id.toString() === form.watch("time_slot_id")).start_time)} - ${formatTime(timeSlotsData.find((t: any) => t.id.toString() === form.watch("time_slot_id")).end_time)}`
                        }
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="font-medium">Reason:</span> {form.watch("reason")}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="px-6 py-3"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" /> Back
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onCancel}
                      className="px-6 py-3"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-green-500 hover:bg-green-600 px-8 py-3 text-lg font-bold"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                          Booking...
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5 mr-2" />
                          Book Appointment Now!
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </div>
  );
};
