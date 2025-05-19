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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  usePatientData,
  usePatientsData,
  usePetOwnerByPetId,
} from "@/hooks/use-pet";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Patient, Pet } from "@/types";
import { AppointmentRequest } from "@/services/appointment-services";
import { useEffect, useState } from "react";
import { useTimeSlots } from "@/hooks/use-shifts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatTime } from "@/lib/utils";

// Form validation schema
const formSchema = z.object({
  pet_id: z.string().optional(),
  doctor_id: z.string().min(1, "Please select a doctor"),
  service_id: z.string().min(1, "Please select a service"),
  reason: z.string().min(1, "Please provide a reason for the visit"),
  priority: z.string().optional(),
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
  const [formMode, setFormMode] = useState<"new" | "existing">("new");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<PetInfo[]>([]);
  const [selectedPet, setSelectedPet] = useState<PetInfo | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedPetId, setSelectedPetId] = useState<number | undefined>(
    undefined
  );
  const [isFormValid, setIsFormValid] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showInlineTimeSlots, setShowInlineTimeSlots] = useState(true);

  const { data: servicesData, isLoading: servicesLoading } = useServices();
  const { data: doctorsData, isLoading: doctorsLoading } = useDoctors();
  const createWalkInMutation = useCreateWalkInAppointment();
  const isSubmitting = createWalkInMutation.isPending;

  const {
    data: patientsData,
    isLoading: isLoading,
    isError,
  } = usePatientsData(1, 9999);

  const { data: petOwnerData, isLoading: isPetOwnerLoading } =
    usePetOwnerByPetId(selectedPetId);

  const { data: petData, isLoading: isPetLoading } = usePatientData(
    selectedPetId?.toString()
  );

  // Form initialization with validation
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pet_id: "",
      doctor_id: "",
      service_id: "",
      time_slot_id: "",
      reason: "",
      priority: "",
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
  console.log("Time slots data:", timeSlotsData);

  // Log doctorsData for debugging
  useEffect(() => {
    if (doctorsData) {
      console.log("Doctors data:", doctorsData);
    }
  }, [doctorsData]);

  // Add useEffect for real-time search
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (searchTerm.trim()) {
        handlePetSearch();
      } else {
        setSearchResults([]);
      }
    }, 300); // Debounce time of 300ms

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

  // New effect to check form validity, including time slot
  useEffect(() => {
    const checkFormValidity = () => {
      const values = form.getValues();
      const commonFieldsValid = 
        !!values.doctor_id && 
        !!values.service_id && 
        !!values.reason &&
        !!values.time_slot_id;
      
      if (formMode === "new") {
        const newPetFieldsValid = 
          values.pet?.pet_name && 
          values.pet?.pet_species && 
          values.owner.owner_name && 
          values.owner.owner_number && 
          values.owner.owner_email && 
          values.owner.owner_address;
        
        setIsFormValid(!!commonFieldsValid && !!newPetFieldsValid);
      } else {
        // For existing pets, we need a selected pet as well
        setIsFormValid(!!commonFieldsValid && !!selectedPet);
      }
    };

    // Run validation check on form value changes
    const subscription = form.watch(() => checkFormValidity());
    checkFormValidity(); // Initial check
    
    return () => subscription.unsubscribe();
  }, [form, formMode, selectedPet]);

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
      
      // Only execute these if the mutation was successful
      toast({
        title: "Success",
        description: "Walk-in appointment created successfully",
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      
      onSuccess?.();
    } catch (error) {
      console.error("Error creating appointment:", error);
      let errorMessage = "Error creating walk-in appointment";
      
      // Extract specific error messages when available
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      // Don't call onSuccess when there's an error
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
      toast({
        title: "Error",
        description: "Failed to search for pets",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const selectPet = (pet: PetInfo) => {
    setSelectedPet(pet);
    setSelectedPetId(Number(pet.petid));
    // Set pet information immediately from the selected pet
    form.setValue("pet_id", pet.petid.toString());
    form.setValue("pet.pet_name", pet.name || "");

    // Set these fields directly from the pet object when available
    form.setValue("pet.pet_species", pet.type || "");
  };

  const clearPetSelection = () => {
    setSelectedPet(null);
    setSelectedPetId(undefined);
    form.reset();
  };


  // Handle direct time slot selection from buttons
  const handleTimeSlotClick = (timeSlotId: string) => {
    console.log("Time slot selected:", timeSlotId);
    form.setValue("time_slot_id", timeSlotId);
  };

  return (
    <div className="bg-white w-full h-full overflow-auto">
      <div className="p-6">
        <Tabs
          defaultValue="new"
          onValueChange={(value) => setFormMode(value as "new" | "existing")}
          className="w-full"
        >
          <TabsList className="w-full mb-6 bg-[#F9FAFB] p-1 rounded-lg">
            <TabsTrigger value="new" className="flex-1 rounded-md data-[state=active]:bg-[#2C78E4] data-[state=active]:text-white">
              <UserPlus className="h-4 w-4 mr-2" />
              <span>New Pet & Owner</span>
            </TabsTrigger>
            <TabsTrigger value="existing" className="flex-1 rounded-md data-[state=active]:bg-[#2C78E4] data-[state=active]:text-white">
              <PawPrint className="h-4 w-4 mr-2" />
              <span>Existing Pet</span>
            </TabsTrigger>
          </TabsList>

          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <TabsContent value="existing" className="m-0">
              {!selectedPet ? (
                <div className="bg-[#F9FAFB] border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Search className="h-5 w-5 text-[#2C78E4] mr-2" />
                    <h3 className="font-medium text-[#111827]">
                      Find Existing Pet
                    </h3>
                  </div>
                  <p className="text-sm text-[#4B5563] mb-4">
                    Search for a patient by name, ID, or owner name
                  </p>

                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Search by pet name, ID, or owner name"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 border-gray-200 focus:border-[#2C78E4] focus:ring-[#2C78E4]"
                    />
                    {isSearching && (
                      <div className="animate-spin h-4 w-4 border-2 border-[#2C78E4] border-t-transparent rounded-full mr-2"></div>
                    )}
                  </div>

                  {searchResults.length > 0 && (
                    <div className="mt-4 bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                      <h4 className="text-sm font-medium text-[#111827] mb-2">
                        Search Results ({searchResults.length})
                      </h4>
                      <div className="space-y-2">
                        {searchResults.map((pet: PetInfo) => (
                          <div
                            key={`pet-${pet.petid}`}
                            className="p-3 hover:bg-[#F9FAFB] cursor-pointer transition-colors border border-gray-200 rounded-lg"
                            onClick={() => selectPet(pet)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center">
                                  <PawPrint className="h-4 w-4 text-[#2C78E4] mr-1.5" />
                                  <span className="font-medium text-[#111827]">
                                    {pet.name}
                                  </span>
                                  <Badge
                                    className="ml-2 text-xs bg-[#F9FAFB] text-[#4B5563] border-gray-200"
                                    variant="outline"
                                  >
                                    {pet.breed}
                                  </Badge>
                                </div>
                                <div className="text-sm text-[#4B5563] mt-1">
                                  ID: {pet.petid}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-[#111827]">
                                  {pet.username}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchTerm && !isSearching && searchResults.length === 0 && (
                    <div className="mt-4 text-center text-[#4B5563]">
                      No pets found matching "{searchTerm}"
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[#F9FAFB] border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <PawPrint className="h-5 w-5 text-[#2C78E4] mr-2" />
                      <h3 className="font-medium text-[#111827]">
                        Selected Pet
                      </h3>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearPetSelection}
                      className="text-xs h-8 border-gray-200 hover:bg-[#F9FAFB] hover:text-[#2C78E4] hover:border-[#2C78E4]/30"
                    >
                      Change Pet
                    </Button>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium text-[#111827] text-lg">
                            {selectedPet.name}
                          </span>
                          <Badge className="ml-2 bg-[#F9FAFB] text-[#4B5563] border-gray-200" variant="outline">
                            {selectedPet.type}
                          </Badge>
                        </div>
                        <div className="text-sm text-[#4B5563] mt-1">
                          ID: {selectedPet.petid}
                        </div>
                      
                      </div>
                      {isPetOwnerLoading ? (
                        <div className="animate-spin h-4 w-4 border-2 border-[#2C78E4] border-t-transparent rounded-full"></div>
                      ) : petOwnerData ? (
                        <div className="text-right">
                          <div className="text-sm font-medium text-[#111827]">
                            {petOwnerData.owner_name}
                          </div>
                          <div className="text-xs text-[#4B5563]">
                            {petOwnerData.owner_phone}
                          </div>
                          <div className="text-xs text-[#4B5563]">
                            {petOwnerData.owner_email}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="new" className="m-0">
              <div className="bg-[#F9FAFB] border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <UserPlus className="h-5 w-5 text-[#2C78E4] mr-2" />
                  <h3 className="font-medium text-[#111827]">
                    New Pet & Owner Registration
                  </h3>
                </div>
                <p className="text-sm text-[#4B5563] mb-4">
                  Enter new pet and owner information
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="pet.pet_name"
                      className="text-[#111827] flex items-center"
                    >
                      Pet Name <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="pet.pet_name"
                      {...form.register("pet.pet_name")}
                      placeholder="Fluffy"
                      className={`transition-all border-gray-200 focus:border-[#2C78E4] focus:ring-[#2C78E4] ${
                        form.formState.errors.pet?.pet_name
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                    />
                    {form.formState.errors.pet?.pet_name && (
                      <p className="text-xs text-red-500 mt-1">
                        {form.formState.errors.pet.pet_name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="pet.pet_species"
                      className="text-[#111827] flex items-center"
                    >
                      Species <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select
                      value={form.watch("pet.pet_species")}
                      onValueChange={(value) =>
                        form.setValue("pet.pet_species", value)
                      }
                    >
                      <SelectTrigger
                        id="pet.pet_species"
                        className={`border-gray-200 transition-all focus:border-[#2C78E4] focus:ring-[#2C78E4] ${
                          form.formState.errors.pet?.pet_species
                            ? "border-red-500 focus:ring-red-500"
                            : ""
                        }`}
                      >
                        <SelectValue placeholder="Select species" />
                      </SelectTrigger>
                      <SelectContent className="border-gray-200">
                        <SelectItem value="dog">Dog</SelectItem>
                        <SelectItem value="cat">Cat</SelectItem>
                        <SelectItem value="bird">Bird</SelectItem>
                        <SelectItem value="reptile">Reptile</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.pet?.pet_species && (
                      <p className="text-xs text-red-500 mt-1">
                        {form.formState.errors.pet.pet_species.message}
                      </p>
                    )}
                  </div>
                </div>

                <Separator className="my-6 bg-gray-200" />

                <div className="flex items-center mb-3">
                  <User className="h-5 w-5 text-[#2C78E4] mr-2" />
                  <h3 className="font-medium text-[#111827]">Owner Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="owner.owner_name"
                      className="text-[#111827] flex items-center"
                    >
                      Full Name <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="owner.owner_name"
                      {...form.register("owner.owner_name")}
                      placeholder="John Smith"
                      className={`transition-all border-gray-200 focus:border-[#2C78E4] focus:ring-[#2C78E4] ${
                        form.formState.errors.owner?.owner_name
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                    />
                    {form.formState.errors.owner?.owner_name && (
                      <p className="text-xs text-red-500 mt-1">
                        {form.formState.errors.owner.owner_name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="owner.owner_number"
                      className="text-[#111827] flex items-center"
                    >
                      Phone Number <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="owner.owner_number"
                      {...form.register("owner.owner_number")}
                      placeholder="(555) 123-4567"
                      className={`transition-all border-gray-200 focus:border-[#2C78E4] focus:ring-[#2C78E4] ${
                        form.formState.errors.owner?.owner_number
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                    />
                    {form.formState.errors.owner?.owner_number && (
                      <p className="text-xs text-red-500 mt-1">
                        {form.formState.errors.owner.owner_number.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="owner.owner_email"
                      className="text-[#111827] flex items-center"
                    >
                      Email <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="owner.owner_email"
                      type="email"
                      {...form.register("owner.owner_email")}
                      placeholder="email@example.com"
                      className={`transition-all border-gray-200 focus:border-[#2C78E4] focus:ring-[#2C78E4] ${
                        form.formState.errors.owner?.owner_email
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                    />
                    {form.formState.errors.owner?.owner_email && (
                      <p className="text-xs text-red-500 mt-1">
                        {form.formState.errors.owner.owner_email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="owner.owner_address"
                      className="text-[#111827] flex items-center"
                    >
                      Address <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="owner.owner_address"
                      {...form.register("owner.owner_address")}
                      placeholder="123 Main St, City, State"
                      className={`transition-all border-gray-200 focus:border-[#2C78E4] focus:ring-[#2C78E4] ${
                        form.formState.errors.owner?.owner_address
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                    />
                    {form.formState.errors.owner?.owner_address && (
                      <p className="text-xs text-red-500 mt-1">
                        {form.formState.errors.owner.owner_address.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Common appointment details section for both tabs */}
            <div className="bg-[#F9FAFB] border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CalendarIcon className="h-5 w-5 text-[#2C78E4] mr-2" />
                <h3 className="font-medium text-[#111827]">
                  Appointment Details
                </h3>
              </div>
              <p className="text-sm text-[#4B5563] mb-4">
                Enter details about the appointment
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="service_id"
                    className="text-[#111827] flex items-center"
                  >
                    Service <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select
                    value={form.watch("service_id")}
                    onValueChange={(value) =>
                      form.setValue("service_id", value)
                    }
                  >
                    <SelectTrigger
                      id="service_id"
                      className={`border-gray-200 transition-all hover:border-gray-300 focus:border-[#2C78E4] focus:ring-[#2C78E4] ${
                        form.formState.errors.service_id
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 text-[#4B5563] mr-2" />
                        <SelectValue placeholder="Select a service" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] border-gray-200">
                      {servicesLoading ? (
                        <div className="flex items-center justify-center py-2">
                          <div className="animate-spin h-5 w-5 border-2 border-[#2C78E4] border-t-transparent rounded-full mr-2"></div>
                          <span className="text-[#4B5563]">Loading services...</span>
                        </div>
                      ) : servicesData && servicesData.length > 0 ? (
                        servicesData.map((service: Service) => (
                          <SelectItem
                            key={service?.id}
                            value={service.id?.toString()}
                            className="focus:bg-[#2C78E4]/10 focus:text-[#2C78E4]"
                          >
                            {service.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-services" disabled>
                          No services available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.service_id && (
                    <p className="text-xs text-red-500 mt-1">
                      {form.formState.errors.service_id.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="doctor_id"
                    className="text-[#111827] flex items-center"
                  >
                    Doctor <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select
                    value={form.watch("doctor_id")}
                    onValueChange={(value) => {
                      form.setValue("doctor_id", value);
                      // Clear time slot when doctor changes
                      form.setValue("time_slot_id", "");
                    }}
                  >
                    <SelectTrigger
                      id="doctor_id"
                      className={`border-gray-200 transition-all hover:border-gray-300 focus:border-[#2C78E4] focus:ring-[#2C78E4] ${
                        form.formState.errors.doctor_id
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-center">
                        <Stethoscope className="h-4 w-4 text-[#4B5563] mr-2" />
                        <SelectValue placeholder="Select a doctor" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] border-gray-200">
                      {doctorsLoading ? (
                        <div className="flex items-center justify-center py-2">
                          <div className="animate-spin h-5 w-5 border-2 border-[#2C78E4] border-t-transparent rounded-full mr-2"></div>
                          <span className="text-[#4B5563]">Loading doctors...</span>
                        </div>
                      ) : doctorsData && doctorsData.data && doctorsData.data.length > 0 ? (
                        doctorsData.data.map((doctor: Doctor) => (
                          <SelectItem
                            key={doctor.doctor_id}
                            value={doctor.doctor_id.toString()}
                            className="focus:bg-[#2C78E4]/10 focus:text-[#2C78E4]"
                          >
                            {doctor.doctor_name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-doctors" disabled>
                          No doctors available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.doctor_id && (
                    <p className="text-xs text-red-500 mt-1">
                      {form.formState.errors.doctor_id.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="appointment_date"
                    className="text-[#111827] flex items-center"
                  >
                    Appointment Date <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="appointment_date"
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={selectedDate}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        console.log("Selected date from input:", newDate);
                        setSelectedDate(newDate);
                        // Clear time slot when date changes
                        form.setValue("time_slot_id", "");
                      }}
                      className="w-full border-gray-200 hover:border-gray-300 focus:border-[#2C78E4] focus:ring-[#2C78E4]"
                    />
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-200 hover:border-[#2C78E4] hover:text-[#2C78E4]"
                      onClick={() => {
                        const today = new Date().toISOString().split('T')[0];
                        setSelectedDate(today);
                        // Clear time slot when date changes
                        form.setValue("time_slot_id", "");
                      }}
                    >
                      Today
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label
                    htmlFor="time_slot_id"
                    className="text-[#111827] flex items-center"
                  >
                    Available Time Slot <span className="text-red-500 ml-1">*</span>
                  </Label>
                  
                  {/* Hidden input field for time slot ID */}
                  <input
                    type="hidden"
                    {...form.register("time_slot_id")}
                  />
                  
                  <div className="text-sm text-[#4B5563]">
                    Please select a time slot from the options below.
                  </div>
                  
                  {form.formState.errors.time_slot_id && (
                    <p className="text-xs text-red-500 mt-1">
                      {form.formState.errors.time_slot_id.message}
                    </p>
                  )}
                </div>
                
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <Label
                    htmlFor="reason"
                    className="text-[#111827] flex items-center"
                  >
                    Reason for Visit <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Textarea
                    id="reason"
                    {...form.register("reason")}
                    placeholder="Please describe the reason for the visit"
                    className={`min-h-[120px] border-gray-200 focus:border-[#2C78E4] focus:ring-[#2C78E4] ${
                      form.formState.errors.reason
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                  />
                  {form.formState.errors.reason && (
                    <p className="text-xs text-red-500 mt-1">
                      {form.formState.errors.reason.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Time slots displayed inline */}
            {form.watch("doctor_id") && selectedDate && (
              <Card className="border-gray-200 rounded-xl">
                <CardHeader className="pb-3 bg-[#F9FAFB] border-b border-gray-200 rounded-t-xl">
                  <CardTitle className="text-base flex items-center">
                    <Clock className="h-4 w-4 text-[#2C78E4] mr-2" />
                    Available Time Slots
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {timeSlotsLoading ? (
                    <div className="flex justify-center items-center py-10">
                      <div className="animate-spin h-8 w-8 border-2 border-[#2C78E4] border-t-transparent rounded-full"></div>
                    </div>
                  ) : timeSlotsData && timeSlotsData.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {timeSlotsData.map((slot: any) => (
                        <Button
                          key={slot.id}
                          type="button"
                          variant="outline"
                          onClick={() => slot.status === 'available' ? handleTimeSlotClick(slot.id.toString()) : null}
                          disabled={slot.status !== 'available'}
                          className={cn(
                            "h-auto py-3 relative",
                            slot.status === 'available' 
                              ? "border-gray-200 hover:bg-[#F9FAFB] hover:border-[#2C78E4] cursor-pointer" 
                              : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-70",
                            form.watch("time_slot_id") === slot.id.toString() && "bg-[#2C78E4]/10 border-[#2C78E4] text-[#2C78E4]"
                          )}
                        >
                          <div className="flex flex-col items-center">
                            <Clock className="h-4 w-4 mb-1" />
                            <span className="font-medium text-sm">{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</span>
                            {slot.status !== 'available' && (
                              <span className="text-xs mt-1 text-gray-500">Unavailable</span>
                            )}
                          </div>
                          {form.watch("time_slot_id") === slot.id.toString() && (
                            <Badge className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 bg-[#2C78E4] text-white px-1.5 py-0.5 text-xs">
                              Selected
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      <Clock className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                      <p>No available time slots for this date</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-gray-200 hover:bg-[#F9FAFB] hover:text-[#4B5563] rounded-lg"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#2C78E4] hover:bg-[#2C78E4]/90 text-white rounded-lg"
                disabled={isSubmitting || !isFormValid}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Create Appointment
                  </>
                )}
              </Button>
            </div>
          </form>
        </Tabs>
      </div>
    </div>
  );
};
