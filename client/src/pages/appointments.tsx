import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { parse, format } from "date-fns";
import { Calendar, Filter, Inbox, PawPrint, Plus, Search, Download, Printer, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFormattedStatus, getStatusColor } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Appointment } from "@/types";
import { getAllAppointments } from "@/services/appointment-services";
import { useLocation } from "wouter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const Appointments = () => {
  const [, setLocation] = useLocation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["appointments", format(selectedDate, "yyyy-MM-dd")],
    queryFn: () => getAllAppointments(selectedDate,"true"),
  });

  const isLoading = appointmentsLoading;

  const filteredAppointments =
    appointmentsData?.data && Array.isArray(appointmentsData.data)
      ? appointmentsData.data.filter((appointment: Appointment) => {
          if (statusFilter !== "all") {
            return (
              appointment.state.toLowerCase() === statusFilter.toLowerCase()
            );
          }

          if (searchTerm) {
            const searchFields = [
              appointment.pet.pet_name,
              appointment.owner.owner_name,
              appointment.doctor.doctor_name,
              appointment.service.service_name,
            ].map((field) => field?.toLowerCase() || "");

            return searchFields.some((field) =>
              field.includes(searchTerm.toLowerCase())
            );
          }

          return true;
        })
      : [];

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      setSelectedDate(date);
    }
  };

  return (
    <div className="container max-w-screen-xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 md:p-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 -mx-6 -mt-6 md:-mx-8 md:-mt-8 px-6 py-4 md:px-8 md:py-5 mb-6 rounded-br-xl rounded-bl-xl shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon"
              className="mr-2 h-8 w-8 text-white hover:bg-white/20"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-white">Appointments</h1>
              <p className="text-indigo-100 text-sm">Manage and view all appointments</p>
            </div>
          </div>

          <div className="flex space-x-2 sm:mt-0">
            <Button className="bg-white text-indigo-600 hover:bg-white/90 font-medium shadow-sm flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              New Appointment
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <h2 className="text-sm font-medium text-gray-800">Filters & Search</h2>
        </div>
        <div className="p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-grow md:max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="search"
                placeholder="Search appointments..."
                className="pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-indigo-500" />
                </div>
                <Input
                  type="date"
                  className="border border-gray-200 rounded-md text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-36"
                  value={format(selectedDate, "yyyy-MM-dd")}
                  onChange={handleDateChange}
                />
              </div>

              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Filter className="h-4 w-4 text-indigo-500" />
                </div>
                <Select defaultValue="all" onValueChange={setStatusFilter}>
                  <SelectTrigger className="border border-gray-200 rounded-md text-sm h-10 w-44 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="checked in">Checked In</SelectItem>
                    <SelectItem value="in progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 ml-auto mt-4 md:mt-0">
              <Button variant="outline" size="sm" className="bg-white shadow-sm flex items-center gap-1.5 border-gray-200 hover:bg-gray-50 transition-colors">
                <Printer className="h-4 w-4 text-gray-600" />
                <span>Print</span>
              </Button>
              <Button variant="outline" size="sm" className="bg-white shadow-sm flex items-center gap-1.5 border-gray-200 hover:bg-gray-50 transition-colors">
                <Download className="h-4 w-4 text-gray-600" />
                <span>Export</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-sm font-medium text-gray-800 flex items-center">
            <Clock className="mr-2 h-4 w-4 text-indigo-500" />
            Appointments List
          </h2>
          
          <div className="text-xs text-gray-500">
            {!isLoading && filteredAppointments && (
              <span>{filteredAppointments.length} appointments found</span>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pet & Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Veterinarian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                Array(6)
                  .fill(0)
                  .map((_, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {[...Array(6)].map((_, i) => (
                        <td key={i} className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-3/4 rounded" />
                            {i === 0 && (
                              <Skeleton className="h-3 w-1/2 rounded" />
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))
              ) : filteredAppointments?.length > 0 ? (
                filteredAppointments.map((appointment: Appointment) => {
                  const {
                    pet: patient,
                    doctor,
                    owner,
                    service,
                    state,
                  } = appointment;
                  const statusColors = getStatusColor(state);

                  return (
                    <tr
                      key={appointment.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <PawPrint className="w-5 h-5 text-indigo-500" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {patient?.pet_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {owner?.owner_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {format(
                            parse(
                              appointment.time_slot.start_time,
                              "HH:mm:ss",
                              new Date()
                            ),
                            "h:mm a"
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(selectedDate, "MMM d, yyyy")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 capitalize">
                          {service.service_name.replace(/_/g, " ")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
                            <AvatarImage
                              // src={
                              //   doctor?.image_url ||
                              //   "https://via.placeholder.com/40"
                              // }
                            />
                            <AvatarFallback className="bg-indigo-100 text-indigo-600">
                              {doctor?.doctor_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-900 font-medium">
                            {doctor?.doctor_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={`px-2.5 py-0.5 inline-flex items-center rounded-full text-xs font-medium ${statusColors.bgColor} ${statusColors.textColor} border ${state === 'completed' ? 'border-green-200' : state === 'in progress' ? 'border-blue-200' : state === 'checked in' ? 'border-indigo-200' : state === 'confirmed' ? 'border-purple-200' : state === 'canceled' ? 'border-red-200' : 'border-gray-200'}`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full mr-1.5 ${statusColors.dotColor}`}
                          />
                          {getFormattedStatus(state)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white shadow-sm border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          onClick={() =>
                            setLocation(`appointment/${appointment.id}/check-in`)
                          }
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                        <Inbox className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="text-sm text-gray-500 font-medium">
                        No appointments found
                      </div>
                      <div className="text-xs text-gray-400">
                        Try adjusting your search or filter criteria
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
