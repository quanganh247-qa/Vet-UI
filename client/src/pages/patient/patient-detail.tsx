import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  Activity,
  Syringe,
  FileText,
  Calendar,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { getPatientById } from "@/services/pet-services";
import { getVaccinations } from "@/services/vaccine-services";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/auth-context";
import VaccinationHistory from "@/components/vaccination/VaccinationHistory";
import MedicalRecords from "@/components/medical-records/MedicalRecords";

// Lazy load heavy components

interface Pet {
  petid: number;
  name: string;
  type: string;
  breed: string;
  age: number;
  birth_date: string;
  weight: number;
  microchip_number: string;
  data_image: string;
  original_name: string;
  username: string;
}

interface Vaccine {
  vaccination_id: number;
  vaccine_name: string;
  date_administered: string;
  next_due_date: string;
  batch_number: string;
  vaccine_provider: string;
  notes: string;
  pet_id: number;
}

interface Treatment {
  id: string;
  name: string;
  date: string;
  status: "completed" | "ongoing" | "scheduled";
  description: string;
  nextAppointment?: string;
  prescribedMedications?: string[];
  followUpNotes?: string;
}

const LoadingSpinner = () => (
  <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
    <p className="text-indigo-600 font-medium">Loading patient details...</p>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-red-600">{message}</div>
  </div>
);

const PatientHeader = ({ pet, selectedDate, onDateChange, onBack }: any) => (
  <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 rounded-xl shadow-md mb-6">
    <div className="flex justify-between items-center">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="mr-2 h-8 w-8 text-white hover:bg-white/20"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">{pet.name}</h1>
          <p className="text-indigo-100 text-sm">Patient Profile</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex items-center bg-white/10 text-white border-white/20 rounded-md px-3 py-1">
          <Calendar className="h-4 w-4 text-white/70 mr-2" />
          <input
            type="date"
            value={format(selectedDate, "yyyy-MM-dd")}
            onChange={onDateChange}
            className="text-sm bg-transparent border-none focus:outline-none text-white"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="bg-white text-indigo-700 hover:bg-white/90"
        >
          Edit Patient
        </Button>
      </div>
    </div>
  </div>
);

export const PatientDetailPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("info");
  const [pet, setPet] = useState<Pet | null>(null);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { logout } = useAuth();

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        const petId = window.location.pathname.split("/").pop();
        if (!petId) throw new Error("No pet ID provided");
        
        const numericPetId = parseInt(petId);
        const [petData, vaccinesData] = await Promise.all([
          getPatientById(numericPetId),
          getVaccinations(numericPetId),
        ]);

        setPet(petData);
        setVaccines(vaccinesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch pet data");
      } finally {
        setLoading(false);
      }
    };

    fetchPetData();
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      setSelectedDate(date);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error || !pet) return <ErrorState message={error || "Pet not found"} />;

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-6 max-w-[100vw]">
      <PatientHeader
        pet={pet}
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        onBack={() => setLocation("/patients")}
      />

      <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="info">Information</TabsTrigger>
          <TabsTrigger value="vaccines">Vaccines</TabsTrigger>
          <TabsTrigger value="records">Medical Records</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Photo Section */}
            <div className="md:col-span-1">
              <Card className="border-none shadow-md overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-w-1 aspect-h-1 relative h-80">
                    <img
                      src={
                        `data:image/png;base64,${pet.data_image}` ||
                        "https://i.pinimg.com/736x/2a/25/b6/2a25b650a1d075d3f5cff5182cbca1f0.jpg"
                      }
                      alt={pet.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 bg-gradient-to-b from-indigo-50 to-white">
                    <h2 className="text-lg font-bold text-gray-900">{pet.name}</h2>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
                        {pet.breed}
                      </Badge>
                      <Badge variant="outline" className="border-gray-200">
                        {pet.type}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pet Info Card */}
            <div className="md:col-span-2">
              <Card className="border-none shadow-md overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-white pb-3 border-b">
                  <CardTitle className="text-lg font-semibold text-indigo-900 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-indigo-600" />
                    Patient Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-gray-500">Species</h3>
                      <p className="text-base text-gray-900">{pet.type}</p>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-gray-500">Breed</h3>
                      <p className="text-base text-gray-900">{pet.breed}</p>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-gray-500">Age</h3>
                      <p className="text-base text-gray-900">{pet.age} years</p>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-gray-500">Gender</h3>
                      <p className="text-base text-gray-900">
                        {pet.type === "Dog" ? "Male" : "Female"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-gray-500">Weight</h3>
                      <p className="text-base text-gray-900">{pet.weight} kg</p>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-gray-500">
                        Microchip ID
                      </h3>
                      <p className="text-base text-gray-900">
                        {pet.microchip_number || "Not registered"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-indigo-600" />
                      <h3 className="font-medium text-gray-900">
                        Owner Information
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <h4 className="text-sm text-gray-500">Name</h4>
                        <p className="text-base text-gray-900">{pet.username}</p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm text-gray-500">Phone</h4>
                        <p className="text-base text-gray-900">0978710192</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="vaccines">
          <Suspense fallback={<LoadingSpinner />}>
            <VaccinationHistory vaccines={vaccines} />
          </Suspense>
        </TabsContent>

        <TabsContent value="records">
          <Suspense fallback={<LoadingSpinner />}>
            <MedicalRecords petId={pet.petid} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
};
