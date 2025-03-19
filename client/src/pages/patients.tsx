import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Patient } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const Patients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  
  const { data: patientsData, isLoading } = useQuery({
    queryKey: ['/api/patients'],
  });
  
  const filteredPatients = patientsData?.filter((patient: Patient) => {
    // Filter by species
    if (speciesFilter !== "all" && patient.species.toLowerCase() !== speciesFilter.toLowerCase()) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchFields = [
        patient.name,
        patient.owner_name,
        patient.breed,
      ].map(field => field?.toLowerCase() || "");
      
      return searchFields.some(field => field.includes(searchTerm.toLowerCase()));
    }
    
    return true;
  });
  
  // Get unique species for filter
  const uniqueSpecies = patientsData 
    ? Array.from(new Set(patientsData.map((p: Patient) => p.species)))
    : [];
  
  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold text-[#12263F]">Patients</h1>
          <p className="text-sm text-gray-500">Manage and view all patient records</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button className="bg-[#2C7BE5] text-white rounded-md px-4 py-2 text-sm font-medium flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add New Patient
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-grow md:max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input 
              type="search" 
              placeholder="Search patients..." 
              className="pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:border-[#2C7BE5] w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select defaultValue="all" onValueChange={setSpeciesFilter}>
              <SelectTrigger className="border border-gray-200 rounded-md text-sm h-10 w-40">
                <SelectValue placeholder="Filter by species" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Species</SelectItem>
                {uniqueSpecies.map((species) => (
                  <SelectItem key={species} value={species.toLowerCase()}>
                    {species}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Patients Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex p-4">
                  <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
                  <div className="ml-4 flex-grow">
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-4 w-full max-w-[150px] mb-1" />
                    <Skeleton className="h-4 w-full max-w-[100px]" />
                  </div>
                </div>
                <div className="border-t border-gray-100 px-4 py-3">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 flex justify-between">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPatients?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient: Patient) => (
            <Card key={patient.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex p-4">
                  <img 
                    className="h-16 w-16 rounded-lg object-cover flex-shrink-0" 
                    src={patient.image_url || "https://via.placeholder.com/64"} 
                    alt={patient.name} 
                  />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-[#12263F]">{patient.name}</h3>
                    <p className="text-sm text-gray-600">{patient.species} • {patient.breed}</p>
                    <p className="text-sm text-gray-500">{patient.age} years • {patient.gender}</p>
                  </div>
                </div>
                <div className="border-t border-gray-100 px-4 py-3">
                  <p className="text-sm font-medium text-[#12263F]">Owner: {patient.owner_name}</p>
                  <p className="text-sm text-gray-500">{patient.owner_phone}</p>
                </div>
                <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 flex justify-between">
                  <Button variant="outline" size="sm" className="text-xs text-[#00A9B5] border-[#00A9B5] hover:bg-[#00A9B5] hover:text-white">
                    View History
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs text-[#2C7BE5] border-[#2C7BE5] hover:bg-[#2C7BE5] hover:text-white">
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">No patients found matching your criteria.</p>
          <Button className="mt-4 bg-[#2C7BE5] text-white">Add New Patient</Button>
        </div>
      )}
      
      {/* Pagination */}
      {filteredPatients && filteredPatients.length > 0 && (
        <div className="mt-6 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Showing {filteredPatients.length} patients
          </p>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" disabled={isLoading}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={isLoading}>
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default Patients;
