import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Plus, 
  Search, 
  Filter, 
  UserCircle, 
  Mail, 
  Phone, 
  List, 
  Grid, 
  ChevronRight,
  Award,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DoctorDetail } from "@/types";
import { useDoctors } from "@/hooks/use-doctor";

// // Mock data for development until API is connected
// const mockStaffData: Staff[] = [
//   {
//     id: 1,
//     name: "Dr. Sarah Johnson",
//     role: "Veterinarian",
//     specialty: "Surgery",
//     status: "Available",
//     is_active: true,
//     email: "sarah.johnson@vetclinic.com",
//     phone: "555-123-4567",
//     address: "123 Vet Street, Medical District",
//     bio: "Dr. Johnson is a board-certified veterinary surgeon with over 10 years of experience in complex surgical procedures.",
//     education: "Doctor of Veterinary Medicine, State University",
//     experience: ["Chief Surgeon at Animal Hospital (2018-Present)", "Associate Veterinarian at City Pet Clinic (2012-2018)"],
//     certifications: ["Board Certified in Veterinary Surgery", "Advanced Cardiac Surgery Certification"],
//     languages: ["English", "Spanish"],
//     schedule: [
//       { day: "Monday", hours: "9:00 AM - 5:00 PM" },
//       { day: "Wednesday", hours: "9:00 AM - 5:00 PM" },
//       { day: "Friday", hours: "9:00 AM - 3:00 PM" }
//     ],
//     image_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop"
//   },
//   {
//     id: 2,
//     name: "Dr. Michael Chen",
//     role: "Veterinarian",
//     specialty: "Dermatology",
//     status: "On Leave",
//     is_active: false,
//     email: "michael.chen@vetclinic.com",
//     phone: "555-987-6543",
//     bio: "Dr. Chen specializes in pet skin conditions and allergies, with particular expertise in treating chronic cases.",
//     education: "Veterinary Medicine, Pacific University",
//     experience: ["Dermatology Specialist at PetCare Plus (2015-Present)"],
//     certifications: ["Certified in Veterinary Dermatology"],
//     languages: ["English", "Mandarin"],
//     image_url: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop"
//   },
//   {
//     id: 3,
//     name: "Amy Rodriguez",
//     role: "Technician",
//     status: "Available",
//     is_active: true,
//     email: "amy.rodriguez@vetclinic.com",
//     phone: "555-456-7890",
//     experience: ["Senior Technician (2019-Present)", "Junior Technician (2016-2019)"],
//     certifications: ["Certified Veterinary Technician"],
//     schedule: [
//       { day: "Monday", hours: "8:00 AM - 4:00 PM" },
//       { day: "Tuesday", hours: "8:00 AM - 4:00 PM" },
//       { day: "Thursday", hours: "8:00 AM - 4:00 PM" },
//       { day: "Friday", hours: "8:00 AM - 4:00 PM" }
//     ],
//     image_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop"
//   },
//   {
//     id: 4,
//     name: "James Wilson",
//     role: "Receptionist",
//     status: "Available",
//     is_active: true,
//     email: "james.wilson@vetclinic.com",
//     phone: "555-789-0123",
//     bio: "James manages the front desk, scheduling, and ensures smooth clinic operations.",
//     schedule: [
//       { day: "Monday", hours: "8:00 AM - 6:00 PM" },
//       { day: "Tuesday", hours: "8:00 AM - 6:00 PM" },
//       { day: "Wednesday", hours: "8:00 AM - 6:00 PM" },
//       { day: "Thursday", hours: "8:00 AM - 6:00 PM" },
//       { day: "Friday", hours: "8:00 AM - 6:00 PM" }
//     ],
//     image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop"
//   },
//   {
//     id: 5,
//     name: "Dr. Emily Parker",
//     role: "Veterinarian",
//     specialty: "Internal Medicine",
//     status: "Available",
//     is_active: true,
//     email: "emily.parker@vetclinic.com",
//     phone: "555-234-5678",
//     bio: "Dr. Parker specializes in diagnosing and treating complex internal conditions in pets.",
//     education: "Doctor of Veterinary Medicine, East State University",
//     experience: ["Internist at Animal Care Hospital (2017-Present)"],
//     certifications: ["Board Certified in Veterinary Internal Medicine"],
//     languages: ["English", "French"],
//     schedule: [
//       { day: "Tuesday", hours: "9:00 AM - 5:00 PM" },
//       { day: "Thursday", hours: "9:00 AM - 5:00 PM" }
//     ],
//     image_url: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=1974&auto=format&fit=crop"
//   },
//   {
//     id: 6,
//     name: "Robert Thompson",
//     role: "Technician",
//     status: "Available",
//     is_active: true,
//     email: "robert.thompson@vetclinic.com",
//     phone: "555-345-6789",
//     certifications: ["Certified Veterinary Technician", "Emergency Care Certified"],
//     image_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1974&auto=format&fit=crop"
//   }
// ];



const StaffPage = () => {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  const { data: staffData, isLoading } = useDoctors();
  
  const filteredStaff = (staffData?.data || []).filter((staff: DoctorDetail) => {
  
    
    // Filter by role
    if (roleFilter !== "all" && staff.role.toLowerCase() !== roleFilter.toLowerCase()) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchFields = [
        staff.doctor_name,
        staff.role,
        staff.specialization,
        staff.email,
      ].map(field => field?.toLowerCase() || "");
      
      return searchFields.some(field => field.includes(searchTerm.toLowerCase()));
    }
    
    return true;
  });
  
  // Get unique roles for filter
  const uniqueRoles = staffData && Array.isArray(staffData.data) 
    ? Array.from(new Set(staffData?.data.map((s: DoctorDetail) => s.role)))
    : [];

  console.log("a", staffData?.data);
  const handleStaffClick = (staffId: number) => {
    setLocation(`/staff/${staffId}`);
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-700 dark:to-indigo-900 px-6 py-4 md:px-8 md:py-5 rounded-t-xl shadow-md mb-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Staff Management</h1>
            <p className="text-indigo-100 text-sm">
              Manage veterinarians and staff members
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => setLocation('/staff/new')}
              className="bg-white text-indigo-700 hover:bg-indigo-50 flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Staff
            </Button>
          </div>
        </div>
      </div>
      
      {/* Search and filter section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search by name, role, or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-200 dark:border-gray-700 dark:bg-gray-900/50 dark:placeholder:text-gray-500"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Select defaultValue="all" onValueChange={setRoleFilter}>
                <SelectTrigger className="border border-gray-200 dark:border-gray-700 rounded-md h-10 w-40 bg-white dark:bg-gray-900/50">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {uniqueRoles.map((role) => (
                    <SelectItem key={role as string} value={role as string}>
                      {role as string}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">View:</span>
              <div className="flex bg-gray-100 dark:bg-gray-900 rounded-md p-1">
                <Button 
                  size="sm" 
                  variant={viewMode === 'list' ? 'default' : 'ghost'} 
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "h-8 w-8 p-0",
                    viewMode === 'list' ? 'bg-white dark:bg-gray-800 shadow-sm' : 'bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
                  )}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "h-8 w-8 p-0",
                    viewMode === 'grid' ? 'bg-white dark:bg-gray-800 shadow-sm' : 'bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
                  )}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
        {/* <TabsList className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <TabsTrigger
            value="all"
            className={cn(
              "data-[state=active]:bg-indigo-600 data-[state=active]:text-white",
              "dark:data-[state=active]:bg-indigo-700"
            )}
          >
            All Staff
          </TabsTrigger>
          <TabsTrigger
            value="active"
            className={cn(
              "data-[state=active]:bg-indigo-600 data-[state=active]:text-white",
              "dark:data-[state=active]:bg-indigo-700"
            )}
          >
            Active
          </TabsTrigger>
          <TabsTrigger
            value="inactive"
            className={cn(
              "data-[state=active]:bg-indigo-600 data-[state=active]:text-white",
              "dark:data-[state=active]:bg-indigo-700"
            )}
          >
            Inactive
          </TabsTrigger>
        </TabsList>
         */}
        {/* Staff List/Grid Views */}
        <TabsContent value="all" className="mt-0">
          {renderStaffView(filteredStaff, viewMode, handleStaffClick)}
        </TabsContent>
        <TabsContent value="active" className="mt-0">
          {renderStaffView(filteredStaff, viewMode, handleStaffClick)}
        </TabsContent>
        <TabsContent value="inactive" className="mt-0">
          {renderStaffView(filteredStaff, viewMode, handleStaffClick)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper function to render staff grid or list view
const renderStaffView = (filteredStaff: DoctorDetail[] | undefined, viewMode: 'list' | 'grid', handleStaffClick: (id: number) => void) => {
  if (!filteredStaff || filteredStaff.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center mt-4 border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">No staff members found matching your criteria.</p>
      </div>
    );
  }
  
  // Grid View
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map((staff) => (
          <Card 
            key={staff.doctor_id} 
            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleStaffClick(staff.doctor_id)}
          >
            <div className="aspect-w-16 aspect-h-9 bg-indigo-50 dark:bg-indigo-900/20">
              {staff.data_image ? (
                <img 
                  src={`data:image/png;base64,${staff.data_image}`} 
                  alt={staff.doctor_name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-48 text-indigo-300 dark:text-indigo-700">
                  <UserCircle className="h-20 w-20" />
                </div>
              )}
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{staff.doctor_name}</CardTitle>
                {/* <Badge
                  variant={staff.is_active ? "default" : "outline"}
                  className={cn(
                    staff.is_active 
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                  )}
                >
                  {staff.is_active ? "Active" : "Inactive"}
                </Badge> */}
              </div>
              <CardDescription className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                <span>{staff.role}</span>
                {staff.specialization && <span className="text-gray-400 dark:text-gray-500"> • {staff.specialization}</span>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-y-2 text-sm">
                {staff.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                    <span className="text-gray-600 dark:text-gray-300">{staff.email}</span>
                  </div>
                )}
                {/* {staff.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                    <span className="text-gray-600 dark:text-gray-300">{staff.phone}</span>
                  </div>
                )} */}
                {staff.certificate_number && (
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                    <span className="text-gray-600 dark:text-gray-300">{staff.certificate_number}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                >
                  View Profile <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  // List View
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Staff Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Certifications
              </th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th> */}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredStaff.map((staff) => (
              <tr
                key={staff.doctor_id}
                className="hover:bg-gray-50 dark:hover:bg-gray-900/20 cursor-pointer transition-colors"
                onClick={() => handleStaffClick(staff.doctor_id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                      {staff.data_image ? (
                        <img 
                          // src={staff.image_url}
                          src={`data:image/png;base64,${staff.data_image}`} 
                          alt={staff.doctor_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full bg-indigo-100 dark:bg-indigo-900/30">
                          <UserCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{staff.doctor_name}</div>
                      {staff.specialization && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">{staff.specialization}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge 
                    variant="outline"
                    className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                  >
                    {staff.role}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-200">{staff.email || 'N/A'}</div>
                  {/* <div className="text-sm text-gray-500 dark:text-gray-400">{staff.phone || 'No phone'}</div> */}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-200">
                    {staff.certificate_number }
                  </div>
          
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    variant={staff.is_active ? "default" : "outline"}
                    className={cn(
                      staff.is_active 
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                    )}
                  >
                    {staff.is_active ? "Active" : "Inactive"}
                  </Badge>
                </td> */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 inline" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffPage;
