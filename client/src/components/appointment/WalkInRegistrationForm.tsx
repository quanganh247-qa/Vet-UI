
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
  Calendar,
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
import { Patient } from "@/types";
import { AppointmentRequest } from "@/services/appointment-services";
import { useEffect } from "react";

// Form validation schema
const formSchema = z.object({
  pet_id: z.string().optional(),
  doctor_id: z.string().min(1, "Please select a doctor"),
  service_id: z.string().min(1, "Please select a service"),
  reason: z.string().min(1, "Please provide a reason for the visit"),
  priority: z.string().optional(),
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
      pet_breed: z.string().min(1, "Breed is required"),
      pet_gender: z.string().min(1, "Gender is required"),
      pet_dob: z.string().optional(),
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

export const WalkInRegistrationForm: React.FC<WalkInRegistrationFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [formMode, setFormMode] = useState<"new" | "existing">("new");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [selectedPet, setSelectedPet] = useState<Patient | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedPetId, setSelectedPetId] = useState<number | undefined>(
    undefined
  );
  const [isFormValid, setIsFormValid] = useState(false);

  const { data: servicesData, isLoading: servicesLoading } = useServices();
  const { data: doctorsData, isLoading: doctorsLoading } = useDoctors();
  const createWalkInMutation = useCreateWalkInAppointment();
  const isSubmitting = createWalkInMutation.isPending;

  const {
    data: patientsData,
    isLoading: isLoading,
    isError,
  } = usePatientsData(currentPage, pageSize);

  const { data: petOwnerData, isLoading: isPetOwnerLoading } =
    usePetOwnerByPetId(selectedPetId);

  const { data: petData, isLoading: isPetLoading } = usePatientData(
    selectedPetId?.toString()
  );

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pet_id: "",
      doctor_id: "",
      service_id: "",
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
        pet_breed: "",
        pet_gender: "",
        pet_dob: "",
      },
    },
  });

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
      const formattedBirthDate = selectedPet.birth_date
        ? formatDateForInput(selectedPet.birth_date)
        : "";

      form.setValue("pet_id", selectedPet.petid.toString());
      form.setValue("pet.pet_name", selectedPet.name || "");
      form.setValue("pet.pet_species", selectedPet.type || "");
      form.setValue("pet.pet_breed", selectedPet.breed || "");
      form.setValue("pet.pet_gender", selectedPet.gender || "");
      form.setValue("pet.pet_dob", formattedBirthDate);
      form.setValue("owner.owner_name", petOwnerData.username || "");
      form.setValue("owner.owner_number", petOwnerData.phone_number || "");
      form.setValue("owner.owner_email", petOwnerData.email || "");
      form.setValue("owner.owner_address", petOwnerData.address || "");
    }
  }, [petOwnerData, selectedPet, form]);

  // New effect to check form validity
  useEffect(() => {
    const checkFormValidity = () => {
      const values = form.getValues();
      const commonFieldsValid = 
        values.doctor_id && 
        values.service_id && 
        values.reason;
      
      if (formMode === "new") {
        const newPetFieldsValid = 
          values.pet?.pet_name && 
          values.pet?.pet_species && 
          values.pet?.pet_breed && 
          values.pet?.pet_gender && 
          values.owner.owner_name && 
          values.owner.owner_number && 
          values.owner.owner_email && 
          values.owner.owner_address;
        
        setIsFormValid(!!commonFieldsValid && !!newPetFieldsValid);
      } else {
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
              reason: data.reason,
              create_pet: true,
              create_owner: true,
              pet: data.pet
                ? {
                    name: data.pet.pet_name,
                    species: data.pet.pet_species,
                    breed: data.pet.pet_breed,
                    gender: data.pet.pet_gender,
                    birth_date: data.pet.pet_dob || "",
                  }
                : {
                    name: "",
                    species: "",
                    breed: "",
                    gender: "",
                    birth_date: "",
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
              reason: data.reason,
              create_pet: false,
              create_owner: false,
              pet: {
                name: selectedPet!.name,
                species: selectedPet!.type,
                breed: selectedPet!.breed,
                gender: selectedPet!.gender,
                birth_date: selectedPet!.birth_date || "",
              },
              // owner: petOwnerData
              //   ? {
              //       owner_name: petOwnerData.username,
              //       owner_number: petOwnerData.phone_number,
              //       owner_email: petOwnerData.email,
              //       owner_address: petOwnerData.address,
              //     }
              //   : {
              //       owner_name: data.owner.owner_name,
              //       owner_number: data.owner.owner_number,
              //       owner_email: data.owner.owner_email,
              //       owner_address: data.owner.owner_address,
              //     },
            };

      console.log("Submitting appointment data:", appointmentData);
      await createWalkInMutation.mutateAsync(appointmentData as AppointmentRequest);

      toast({
        title: "Success",
        description: "Walk-in appointment created successfully",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      onSuccess?.();
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error creating walk-in appointment",
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
      toast({
        title: "Error",
        description: "Failed to search for pets",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const selectPet = (pet: Patient) => {
    setSelectedPet(pet);
    setSelectedPetId(pet.petid);

    // Format the birth date as YYYY-MM-DD for the input field
    const formattedBirthDate = pet.birth_date
      ? formatDateForInput(pet.birth_date)
      : "";
    console.log("Formatted birth date:", formattedBirthDate);

    // Set pet information immediately from the selected pet
    form.setValue("pet_id", pet.petid.toString());
    form.setValue("pet.pet_name", pet.name || "");

    // Set these fields directly from the pet object when available
    form.setValue("pet.pet_species", pet.type || "");
    form.setValue("pet.pet_breed", pet.breed || "");
    form.setValue("pet.pet_gender", pet.gender || "");
    form.setValue("pet.pet_dob", formattedBirthDate);
  };

  // Function to format date string to YYYY-MM-DD format for input fields
  const formatDateForInput = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.log("Invalid date:", dateString);
        return "";
      }

      // Format as YYYY-MM-DD
      return date.toISOString().split("T")[0];
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const clearPetSelection = () => {
    setSelectedPet(null);
    setSelectedPetId(undefined);
    form.reset();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50 text-red-700 border-red-300 hover:bg-red-100";
      case "medium":
        return "bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100";
      case "low":
        return "bg-green-50 text-green-700 border-green-300 hover:bg-green-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100";
    }
  };

  // Function to format date for display in a readable format
  const formatDateDisplay = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }

      // Format as MM/DD/YYYY or localized date
      return date.toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date for display:", error);
      return "Invalid date";
    }
  };

  return (
    <div className="bg-white w-full h-full overflow-auto">
      <div className="p-6">
        <Tabs
          defaultValue="new"
          onValueChange={(value) => setFormMode(value as "new" | "existing")}
        >
          <TabsList className="w-full mb-6">
            <TabsTrigger value="new" className="flex-1">
              <UserPlus className="h-4 w-4 mr-2" />
              <span>New Pet & Owner</span>
            </TabsTrigger>
            <TabsTrigger value="existing" className="flex-1">
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
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Search className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="font-medium text-blue-900">
                      Find Existing Pet
                    </h3>
                  </div>
                  <p className="text-sm text-blue-700 mb-4">
                    Search for a patient by name, ID, or owner name
                  </p>

                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Search by pet name, ID, or owner name"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                    {isSearching && (
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                    )}
                  </div>

                  {searchResults.length > 0 && (
                    <div className="mt-4 bg-white rounded-lg shadow-md p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Search Results ({searchResults.length})
                      </h4>
                      <div className="space-y-2">
                        {searchResults.map((pet) => (
                          <div
                            key={`pet-${pet.petid}`}
                            className="p-3 hover:bg-gray-50 cursor-pointer transition-colors border rounded-md"
                            onClick={() => selectPet(pet)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center">
                                  <PawPrint className="h-4 w-4 text-indigo-500 mr-1.5" />
                                  <span className="font-medium text-gray-900">
                                    {pet.name}
                                  </span>
                                  <Badge
                                    className="ml-2 text-xs"
                                    variant="outline"
                                  >
                                    {pet.breed}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  ID: {pet.petid}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">
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
                    <div className="mt-4 text-center text-gray-500">
                      No pets found matching "{searchTerm}"
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <PawPrint className="h-5 w-5 text-indigo-600 mr-2" />
                      <h3 className="font-medium text-indigo-900">
                        Selected Pet
                      </h3>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearPetSelection}
                      className="text-xs h-8"
                    >
                      Change Pet
                    </Button>
                  </div>

                  <div className="bg-white rounded-md border border-indigo-200 p-4 mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900 text-lg">
                            {selectedPet.name}
                          </span>
                          <Badge className="ml-2" variant="outline">
                            {selectedPet.breed}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          ID: {selectedPet.petid}
                        </div>
                        {selectedPet.birth_date && (
                          <div className="text-sm text-gray-500 mt-1">
                            Birth Date:{" "}
                            {formatDateDisplay(selectedPet.birth_date)}
                          </div>
                        )}
                      </div>
                      {isPetOwnerLoading ? (
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                      ) : petOwnerData ? (
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {petOwnerData.username}
                          </div>
                          <div className="text-xs text-gray-500">
                            {petOwnerData.phone_number}
                          </div>
                          <div className="text-xs text-gray-500">
                            {petOwnerData.email}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="new" className="space-y-6 m-0">
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <PawPrint className="h-5 w-5 text-indigo-600 mr-2" />
                  <h3 className="font-medium text-indigo-900">
                    Pet Information
                  </h3>
                </div>
                <p className="text-sm text-indigo-700 mb-4">
                  Enter details about the new pet
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="pet.pet_name"
                      className="text-gray-700 flex items-center"
                    >
                      Pet Name <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="pet.pet_name"
                      {...form.register("pet.pet_name")}
                      placeholder="Pet's name"
                      className={`transition-all border-gray-300 focus:border-indigo-500 ${
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
                      className="text-gray-700 flex items-center"
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
                        className={`border-gray-300 transition-all hover:border-gray-400 focus:border-indigo-500 ${
                          form.formState.errors.pet?.pet_species
                            ? "border-red-500 focus:ring-red-500"
                            : ""
                        }`}
                      >
                        <SelectValue placeholder="Select species" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dog">Dog</SelectItem>
                        <SelectItem value="Cat">Cat</SelectItem>
                        <SelectItem value="Bird">Bird</SelectItem>
                        <SelectItem value="Rabbit">Rabbit</SelectItem>
                        <SelectItem value="Hamster">Hamster</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.pet?.pet_species && (
                      <p className="text-xs text-red-500 mt-1">
                        {form.formState.errors.pet.pet_species.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pet.pet_breed" className="text-gray-700">
                      Breed <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="pet.pet_breed"
                      {...form.register("pet.pet_breed")}
                      placeholder="Breed"
                      className={`transition-all border-gray-300 focus:border-indigo-500 ${
                        form.formState.errors.pet?.pet_breed
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                    />
                    {form.formState.errors.pet?.pet_breed && (
                      <p className="text-xs text-red-500 mt-1">
                        {form.formState.errors.pet.pet_breed.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pet.pet_gender" className="text-gray-700">
                      Gender <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select
                      value={form.watch("pet.pet_gender")}
                      onValueChange={(value) =>
                        form.setValue("pet.pet_gender", value)
                      }
                    >
                      <SelectTrigger
                        className={`border-gray-300 transition-all hover:border-gray-400 focus:border-indigo-500 ${
                          form.formState.errors.pet?.pet_gender
                            ? "border-red-500 focus:ring-red-500"
                            : ""
                        }`}
                      >
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.pet?.pet_gender && (
                      <p className="text-xs text-red-500 mt-1">
                        {form.formState.errors.pet.pet_gender.message}
                      </p>
                    )}
                  </div>

                  {/* <div className="space-y-2">
                    <Label htmlFor="pet.pet_dob" className="text-gray-700">
                      Date of Birth <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        id="pet.pet_dob"
                        type="date"
                        {...form.register("pet.pet_dob")}
                        className={`pl-10 transition-all border-gray-300 focus:border-indigo-500 ${
                          form.formState.errors.pet?.pet_dob
                            ? "border-red-500 focus:ring-red-500"
                            : ""
                        }`}
                      />
                    </div>
                    {form.formState.errors.pet?.pet_dob && (
                      <p className="text-xs text-red-500 mt-1">
                        {form.formState.errors.pet.pet_dob.message}
                      </p>
                    )}
                  </div> */}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <User className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-medium text-blue-900">
                    Owner Information
                  </h3>
                </div>
                <p className="text-sm text-blue-700 mb-4">
                  Enter the pet owner's contact details
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="owner.owner_name"
                      className="text-gray-700 flex items-center"
                    >
                      Full Name <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="owner.owner_name"
                      {...form.register("owner.owner_name")}
                      placeholder="John Doe"
                      className={`transition-all border-gray-300 focus:border-blue-500 ${
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
                      className="text-gray-700 flex items-center"
                    >
                      Phone Number <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="owner.owner_number"
                      {...form.register("owner.owner_number")}
                      placeholder="(555) 123-4567"
                      className={`transition-all border-gray-300 focus:border-blue-500 ${
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
                      className="text-gray-700 flex items-center"
                    >
                      Email <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="owner.owner_email"
                      type="email"
                      {...form.register("owner.owner_email")}
                      placeholder="email@example.com"
                      className={`transition-all border-gray-300 focus:border-blue-500 ${
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
                      className="text-gray-700 flex items-center"
                    >
                      Address <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="owner.owner_address"
                      {...form.register("owner.owner_address")}
                      placeholder="123 Main St, City, State"
                      className={`transition-all border-gray-300 focus:border-blue-500 ${
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
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="font-medium text-purple-900">
                  Appointment Details
                </h3>
              </div>
              <p className="text-sm text-purple-700 mb-4">
                Enter details about the appointment
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="service_id"
                    className="text-gray-700 flex items-center"
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
                      className={`border-gray-300 transition-all hover:border-gray-400 focus:border-purple-500 ${
                        form.formState.errors.service_id
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 text-gray-500 mr-2" />
                        <SelectValue placeholder="Select a service" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {servicesLoading ? (
                        <div className="flex items-center justify-center py-2">
                          <div className="animate-spin h-5 w-5 border-2 border-purple-500 border-t-transparent rounded-full mr-2"></div>
                          <span>Loading services...</span>
                        </div>
                      ) : servicesData && servicesData.length > 0 ? (
                        servicesData.map((service: Service) => (
                          <SelectItem
                            key={service?.id}
                            value={service.id?.toString()}
                            className="focus:bg-purple-50"
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
                    className="text-gray-700 flex items-center"
                  >
                    Doctor <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select
                    value={form.watch("doctor_id")}
                    onValueChange={(value) => form.setValue("doctor_id", value)}
                  >
                    <SelectTrigger
                      className={`border-gray-300 transition-all hover:border-gray-400 focus:border-purple-500 ${
                        form.formState.errors.doctor_id
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-center">
                        <Stethoscope className="h-4 w-4 text-gray-500 mr-2" />
                        <SelectValue placeholder="Select a doctor" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {doctorsLoading ? (
                        <div className="flex items-center justify-center py-2">
                          <div className="animate-spin h-5 w-5 border-2 border-purple-500 border-t-transparent rounded-full mr-2"></div>
                          <span>Loading doctors...</span>
                        </div>
                      ) : doctorsData?.data && doctorsData.data.length > 0 ? (
                        doctorsData.data.map((doctor: Doctor) => (
                          <SelectItem
                            key={doctor.doctor_id}
                            value={doctor.doctor_id.toString()}
                            className="focus:bg-purple-50"
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

                {/* <div className="space-y-2">
                  <Label htmlFor="priority" className="text-gray-700">
                    Priority <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select
                    value={form.watch("priority")}
                    onValueChange={(value) => form.setValue("priority", value)}
                  >
                    <SelectTrigger
                      className={`border-gray-300 transition-all hover:border-gray-400 focus:border-purple-500 ${
                        form.formState.errors.priority
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-500 mr-2" />
                        <SelectValue placeholder="Select priority" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high" className="focus:bg-red-50">
                        <div className="flex items-center">
                          <Badge
                            variant="outline"
                            className={`mr-2 ${getPriorityColor("high")}`}
                          >
                            High
                          </Badge>
                          <span>Emergency/Urgent</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="medium" className="focus:bg-orange-50">
                        <div className="flex items-center">
                          <Badge
                            variant="outline"
                            className={`mr-2 ${getPriorityColor("medium")}`}
                          >
                            Medium
                          </Badge>
                          <span>Moderate concern</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="low" className="focus:bg-green-50">
                        <div className="flex items-center">
                          <Badge
                            variant="outline"
                            className={`mr-2 ${getPriorityColor("low")}`}
                          >
                            Normal
                          </Badge>
                          <span>Routine visit</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.priority && (
                    <p className="text-xs text-red-500 mt-1">
                      {form.formState.errors.priority.message}
                    </p>
                  )}
                </div> */}
              </div>

              <div className="mt-5 space-y-2">
                <Label
                  htmlFor="reason"
                  className="text-gray-700 flex items-center"
                >
                  Reason for Visit <span className="text-red-500 ml-1">*</span>
                </Label>
                <Textarea
                  id="reason"
                  {...form.register("reason")}
                  placeholder="Please describe the reason for the visit in detail..."
                  className={`min-h-[120px] transition-all border-gray-300 focus:border-purple-500 resize-y ${
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

            <div className="flex justify-between items-center pt-6 border-t border-gray-100">
              <div className="text-sm text-gray-500">
                <span className="text-red-500">*</span> Required fields
              </div>
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="border-gray-300 hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white transition-all"
                  disabled={isSubmitting || !isFormValid}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    "Register Walk-in"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Tabs>
      </div>
    </div>
  );
};
