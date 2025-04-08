import React, { useState } from "react";
import { useCreateWalkInAppointment } from "@/hooks/use-appointment";
import { useServices } from "@/hooks/use-services";
import { useDoctors } from "@/hooks/use-doctors";
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

// Form validation schema
const formSchema = z.object({
  pet_id: z.string().optional(),
  doctor_id: z.string().min(1, "Please select a doctor"),
  service_id: z.string().min(1, "Please select a service"),
  reason: z.string().min(1, "Please provide a reason for the visit"),
  priority: z.string().min(1, "Please select a priority level"),
  owner: z.object({
    owner_name: z.string().min(1, "Owner name is required"),
    owner_number: z.string().min(1, "Phone number is required"),
    owner_email: z.string().email("Invalid email address"),
    owner_address: z.string().min(1, "Address is required"),
  }),
  pet: z.object({
    pet_name: z.string().min(1, "Pet name is required"),
    pet_species: z.string().min(1, "Species is required"),
    pet_breed: z.string().min(1, "Breed is required"),
    pet_gender: z.string().min(1, "Gender is required"),
    pet_dob: z.string().min(1, "Date of birth is required"),
  }),
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

interface Pet {
  pet_id: number;
  pet_name: string;
  pet_species: string;
  pet_breed: string;
  pet_gender: string;
  pet_dob: string;
  owner_id: number;
  owner_name: string;
  owner_number: string;
  owner_email: string;
  owner_address: string;
}

export const WalkInRegistrationForm: React.FC<WalkInRegistrationFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [formMode, setFormMode] = useState<"new" | "existing">("new");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const { data: servicesData, isLoading: servicesLoading } = useServices();
  const { data: doctorsData, isLoading: doctorsLoading } = useDoctors();
  const createWalkInMutation = useCreateWalkInAppointment();
  const isSubmitting = createWalkInMutation.isPending;

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

  const handleSubmit = async (data: FormData) => {
    try {
      const appointmentData = formMode === "new"
        ? {
            ...data,
            pet_id: 0,
            doctor_id: parseInt(data.doctor_id),
            service_id: parseInt(data.service_id),
            create_pet: true,
            create_owner: true,
            owner: {
              owner_name: data.owner.owner_name,
              owner_number: data.owner.owner_number,
              owner_email: data.owner.owner_email,
              owner_address: data.owner.owner_address,
            },
          }
        : {
            pet_id: selectedPet?.pet_id || parseInt(data.pet_id || "0"),
            doctor_id: parseInt(data.doctor_id),
            service_id: parseInt(data.service_id),
            reason: data.reason,
            priority: data.priority,
            owner: selectedPet
              ? {
                  owner_name: selectedPet.owner_name,
                  owner_number: selectedPet.owner_number,
                  owner_email: selectedPet.owner_email,
                  owner_address: selectedPet.owner_address,
                }
              : {
                  owner_name: data.owner.owner_name,
                  owner_number: data.owner.owner_number,
                  owner_email: data.owner.owner_email,
                  owner_address: data.owner.owner_address,
                },
          };

      await createWalkInMutation.mutateAsync(appointmentData);
      toast({
        title: "Success",
        description: "Walk-in appointment created successfully",
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error creating walk-in appointment",
        variant: "destructive",
      });
    }
  };

  const handlePetSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      // Mocked search functionality for demo - replace with actual API call
      setTimeout(() => {
        const mockResults: Pet[] = [
          {
            pet_id: 101,
            pet_name: "Max",
            pet_species: "Dog",
            pet_breed: "Golden Retriever",
            pet_gender: "Male",
            pet_dob: "2019-05-15",
            owner_id: 201,
            owner_name: "John Smith",
            owner_number: "555-123-4567",
            owner_email: "john@example.com",
            owner_address: "123 Main St, Anytown",
          },
          {
            pet_id: 102,
            pet_name: "Bella",
            pet_species: "Cat",
            pet_breed: "Siamese",
            pet_gender: "Female",
            pet_dob: "2020-08-22",
            owner_id: 202,
            owner_name: "Sarah Johnson",
            owner_number: "555-987-6543",
            owner_email: "sarah@example.com",
            owner_address: "456 Oak Ave, Somewhere",
          },
        ];

        const results = mockResults.filter(
          (pet) =>
            pet.pet_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pet.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pet.pet_id.toString().includes(searchTerm)
        );

        setSearchResults(results);
        setIsSearching(false);
      }, 800);
    } catch (error) {
      console.error("Error searching for pets:", error);
      setIsSearching(false);
      toast({
        title: "Error",
        description: "Failed to search for pets",
        variant: "destructive",
      });
    }
  };

  const selectPet = (pet: Pet) => {
    setSelectedPet(pet);
    form.setValue("pet_id", pet.pet_id.toString());
    form.setValue("owner.owner_name", pet.owner_name);
    form.setValue("owner.owner_number", pet.owner_number);
    form.setValue("owner.owner_email", pet.owner_email);
    form.setValue("owner.owner_address", pet.owner_address);
  };

  const clearPetSelection = () => {
    setSelectedPet(null);
    setSearchResults([]);
    setSearchTerm("");
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

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                    <Button
                      type="button"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handlePetSearch}
                      disabled={isSearching || !searchTerm.trim()}
                    >
                      {isSearching ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                          Searching...
                        </>
                      ) : (
                        "Search"
                      )}
                    </Button>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Search Results
                      </h4>
                      <div className="bg-white rounded-md border border-gray-200 overflow-hidden divide-y divide-gray-200 max-h-60 overflow-y-auto">
                        {searchResults.map((pet) => (
                          <div
                            key={pet.pet_id}
                            className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => selectPet(pet)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center">
                                  <PawPrint className="h-4 w-4 text-indigo-500 mr-1.5" />
                                  <span className="font-medium text-gray-900">
                                    {pet.pet_name}
                                  </span>
                                  <Badge
                                    className="ml-2 text-xs"
                                    variant="outline"
                                  >
                                    {pet.pet_species}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  ID: {pet.pet_id} • {pet.pet_breed} •{" "}
                                  {pet.pet_gender}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">
                                  {pet.owner_name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {pet.owner_number}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.length === 0 && searchTerm && !isSearching && (
                    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md text-center">
                      <p className="text-gray-600">
                        No pets found matching "{searchTerm}"
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2"
                        onClick={() => setFormMode("new")}
                      >
                        Create New Pet & Owner
                      </Button>
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
                            {selectedPet.pet_name}
                          </span>
                          <Badge className="ml-2" variant="outline">
                            {selectedPet.pet_species}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          ID: {selectedPet.pet_id} • {selectedPet.pet_breed} •{" "}
                          {selectedPet.pet_gender}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {selectedPet.owner_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {selectedPet.owner_number}
                        </div>
                        <div className="text-xs text-gray-500">
                          {selectedPet.owner_email}
                        </div>
                      </div>
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

                  <div className="space-y-2">
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
                  </div>
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
                    onValueChange={(value) => form.setValue("service_id", value)}
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

                <div className="space-y-2">
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
                            Low
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
                </div>
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
                  disabled={
                    isSubmitting || (formMode === "existing" && !selectedPet)
                  }
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
