import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, Filter, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Appointment, Patient, Staff } from "@shared/schema";
import { getFormattedStatus, getStatusColor } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
    queryKey: [`/api/appointments/date/${format(selectedDate, 'yyyy-MM-dd')}`],
  });
  
  const { data: patientsData, isLoading: patientsLoading } = useQuery({
    queryKey: ['/api/patients'],
  });
  
  const { data: staffData, isLoading: staffLoading } = useQuery({
    queryKey: ['/api/staff'],
  });
  
  const isLoading = appointmentsLoading || patientsLoading || staffLoading;
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      setSelectedDate(date);
    }
  };
  
  const getPatientById = (id: number) => {
    return patientsData?.find((patient: Patient) => patient.id === id);
  };
  
  const getDoctorById = (id: number) => {
    return staffData?.find((staff: Staff) => staff.id === id);
  };
  
  const filteredAppointments = appointmentsData?.filter((appointment: Appointment) => {
    // Filter by status
    if (statusFilter !== "all" && appointment.status !== statusFilter) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const patient = getPatientById(appointment.patient_id);
      const doctor = getDoctorById(appointment.doctor_id);
      
      const searchFields = [
        patient?.name,
        patient?.owner_name,
        doctor?.name,
        appointment.type,
      ].map(field => field?.toLowerCase() || "");
      
      return searchFields.some(field => field.includes(searchTerm.toLowerCase()));
    }
    
    return true;
  });
  
  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold text-[#12263F]">Appointments</h1>
          <p className="text-sm text-gray-500">Manage and view all appointments</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button className="bg-[#2C7BE5] text-white rounded-md px-4 py-2 text-sm font-medium flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
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
              placeholder="Search appointments..." 
              className="pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:border-[#2C7BE5] w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Input
                type="date"
                className="border border-gray-200 rounded-md text-sm px-3 py-2 focus:outline-none focus:border-[#2C7BE5] w-36"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={handleDateChange}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select defaultValue="all" onValueChange={setStatusFilter}>
                <SelectTrigger className="border border-gray-200 rounded-md text-sm h-10 w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Appointments Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pet & Owner</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                // Loading skeletons
                Array(6).fill(0).map((_, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="ml-3">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32 mt-1" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <Skeleton className="h-8 w-16 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredAppointments?.length > 0 ? (
                // Appointments data
                filteredAppointments.map((appointment: Appointment) => {
                  const patient = getPatientById(appointment.patient_id);
                  const doctor = getDoctorById(appointment.doctor_id);
                  const statusColors = getStatusColor(appointment.status);
                  
                  if (!patient || !doctor) return null;
                  
                  return (
                    <tr key={appointment.id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <img 
                            className="h-8 w-8 rounded-full object-cover" 
                            src={patient.image_url || "https://via.placeholder.com/40"} 
                            alt={patient.name} 
                          />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-[#12263F]">{patient.name}</p>
                            <p className="text-xs text-gray-500">{patient.owner_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-sm text-[#12263F]">{format(new Date(appointment.date), 'h:mm a')}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-sm text-[#12263F] capitalize">{appointment.type.replace(/_/g, ' ')}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-sm text-[#12263F]">{doctor.name}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`h-2 w-2 rounded-full mr-2 ${statusColors.dotColor}`}></span>
                          <span className={`text-sm font-medium ${statusColors.textColor}`}>
                            {getFormattedStatus(appointment.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-sm text-gray-600">{appointment.notes}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs text-[#2C7BE5] border-[#2C7BE5] hover:bg-[#2C7BE5] hover:text-white"
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                    No appointments found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-100 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Showing {filteredAppointments?.length || 0} appointments
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
      </div>
    </>
  );
};

export default Appointments;
