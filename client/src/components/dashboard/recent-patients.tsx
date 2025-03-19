import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { Patient } from "@shared/schema";
import { getRelativeTime } from "@/lib/utils";

const RecentPatients = () => {
  const { data: patientsData, isLoading } = useQuery({
    queryKey: ['/api/patients/recent/4'],
  });
  
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <h2 className="text-lg font-display font-semibold text-[#12263F]">Recent Patients</h2>
        <div>
          <Button variant="ghost" className="text-sm text-[#2C7BE5] hover:text-[#2361b8]">
            View All
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        {isLoading ? (
          // Loading skeletons
          Array(4).fill(0).map((_, index) => (
            <div key={index} className={`flex items-center p-2 hover:bg-gray-50 rounded-md -mx-2 ${index > 0 ? 'mt-2' : ''}`}>
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="ml-3 flex-1">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-3 w-40 mt-1" />
                <Skeleton className="h-3 w-32 mt-1" />
              </div>
            </div>
          ))
        ) : patientsData?.length > 0 ? (
          // Patient list
          patientsData.map((patient: Patient, index: number) => (
            <div 
              key={patient.id} 
              className={`flex items-center p-2 hover:bg-gray-50 rounded-md -mx-2 ${index > 0 ? 'mt-2' : ''} cursor-pointer`}
            >
              <img 
                className="h-12 w-12 rounded-lg object-cover" 
                src={patient.image_url || "https://via.placeholder.com/48"} 
                alt={patient.name} 
              />
              <div className="ml-3 flex-1">
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-[#12263F]">{patient.name}</p>
                  <p className="text-xs text-gray-500">{getRelativeTime(new Date())}</p>
                </div>
                <p className="text-xs text-gray-500">
                  {patient.species} • {patient.age} years • {patient.gender}
                </p>
                <p className="text-xs text-gray-600 mt-1">{patient.notes}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 italic text-center py-4">No recent patients found</p>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-100">
        <Button 
          className="w-full py-2 text-sm font-medium bg-[#2C7BE5] bg-opacity-10 text-[#2C7BE5] hover:bg-opacity-20 rounded-md"
          variant="ghost"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add New Patient
        </Button>
      </div>
    </div>
  );
};

export default RecentPatients;
