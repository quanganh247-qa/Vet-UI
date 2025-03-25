import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { MoreVertical, Filter } from "lucide-react";
import { getFormattedStatus, getStatusColor } from "@/lib/utils";
import { Appointment, Patient, Staff } from "@/types";
interface AppointmentRowProps {
  appointment: Appointment;
  patient: Patient;
  doctor: Staff;
}

const AppointmentRow = ({ appointment, patient, doctor }: AppointmentRowProps) => {
  const statusColors = getStatusColor(appointment.status);
  
  return (
    <tr>
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
        <p className="text-sm text-[#12263F]">{appointment.type.replace('_', ' ')}</p>
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
      <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#2C7BE5]">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </td>
    </tr>
  );
};

const AppointmentsTable = () => {
  const dateToFetch = "today";
  
  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
    queryKey: [`/api/appointments/date/${dateToFetch}`],
  });
  
  const { data: patientsData, isLoading: patientsLoading } = useQuery({
    queryKey: ['/api/patients'],
  });
  
  const { data: staffData, isLoading: staffLoading } = useQuery({
    queryKey: ['/api/staff'],
  });
  
  const isLoading = appointmentsLoading || patientsLoading || staffLoading;
  
  const getPatientById = (id: number) => {
    return patientsData?.find((patient: Patient) => patient.id === id);
  };
  
  const getDoctorById = (id: number) => {
    return staffData?.find((staff: Staff) => staff.id === id);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <h2 className="text-lg font-display font-semibold text-[#12263F]">Today's Appointments</h2>
        <div className="flex">
          <Button variant="ghost" className="text-sm text-[#2C7BE5] hover:text-[#2361b8]">
            <Filter className="h-4 w-4 mr-1" />
            Filter
          </Button>
          <Button variant="ghost" className="text-sm text-[#2C7BE5] hover:text-[#2361b8] ml-4">
            View All
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pet & Owner</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              // Loading skeletons
              Array(5).fill(0).map((_, index) => (
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
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <Skeleton className="h-6 w-6 ml-auto" />
                  </td>
                </tr>
              ))
            ) : appointmentsData?.length > 0 ? (
              appointmentsData.map((appointment: Appointment) => {
                const patient = getPatientById(appointment.patient_id);
                const doctor = getDoctorById(appointment.doctor_id);
                
                if (!patient || !doctor) return null;
                
                return (
                  <AppointmentRow 
                    key={appointment.id} 
                    appointment={appointment} 
                    patient={patient} 
                    doctor={doctor} 
                  />
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                  No appointments found for today
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-gray-100 text-center">
        <Button variant="ghost" className="text-sm text-[#2C7BE5] font-medium hover:text-[#2361b8]">
          Load More Appointments
        </Button>
      </div>
    </div>
  );
};

export default AppointmentsTable;
