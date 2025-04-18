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
  Briefcase,
  Upload,
  ArrowLeft
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const StaffPage = () => {
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  // Staff form state
  const [newStaff, setNewStaff] = useState({
    id: "",
    email: "",
    password: "",
    passwordConfirm: "",
    verified: false,
    name: "",
    role: "",
    specialization: "",
    certificateNumber: "",
    avatar: null as File | null
  });
  
  const { data: staffData, isLoading } = useDoctors();

  // Check if we're on the new staff page
  const isNewStaffPage = location === "/staff/new";
  
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
  
  // Handle changes in staff form
  const handleStaffChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewStaff(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };
  
  // Handle select change for role
  const handleRoleChange = (value: string) => {
    setNewStaff(prev => ({
      ...prev,
      role: value
    }));
  };
  
  // Handle file upload for avatar
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewStaff(prev => ({
        ...prev,
        avatar: e.target.files![0]
      }));
    }
  };
  
  // Handle staff form submission
  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate passwords match
    if (newStaff.password !== newStaff.passwordConfirm) {
      alert("Passwords do not match");
      return;
    }
    
    // Here you would typically send data to your backend
    console.log("Creating new staff member:", newStaff);
    
    // Reset form and navigate back to staff list
    setNewStaff({
      id: "",
      email: "",
      password: "",
      passwordConfirm: "",
      verified: false,
      name: "",
      role: "",
      specialization: "",
      certificateNumber: "",
      avatar: null
    });
    
    setLocation("/staff");
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }
  
  if (isNewStaffPage) {
    return (
      <div className="container mx-auto py-6">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-700 dark:to-indigo-900 px-6 py-4 md:px-8 md:py-5 rounded-t-xl shadow-md mb-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold">New Staff Member</h1>
              <p className="text-indigo-100 text-sm">
                Add a new veterinarian or staff member
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => setLocation('/staff')}
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white/10 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Staff List
              </Button>
            </div>
          </div>
        </div>
        
        {/* Staff Creation Form */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-gray-500 mr-2">ID</span>
                  <span className="text-xs bg-gray-200 rounded px-2 py-1">Auto</span>
                </div>
                <Input 
                  id="staff-id"
                  name="id"
                  value={newStaff.id}
                  onChange={handleStaffChange}
                  className="bg-gray-100"
                  placeholder="Leave empty to auto generate..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium text-gray-500 mr-2">Name</span>
                    <span className="text-red-500 text-sm">*</span>
                  </div>
                  <Input 
                    id="staff-name"
                    name="name"
                    value={newStaff.name}
                    onChange={handleStaffChange}
                    required
                  />
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 mr-2">Email</span>
                      <span className="text-red-500 text-sm">*</span>
                    </div>
                    <span className="text-xs bg-gray-200 rounded px-2 py-1">Public: Off</span>
                  </div>
                  <Input 
                    id="staff-email"
                    name="email"
                    type="email"
                    value={newStaff.email}
                    onChange={handleStaffChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium text-gray-500 mr-2">Password</span>
                    <span className="text-red-500 text-sm">*</span>
                  </div>
                  <Input 
                    id="staff-password"
                    name="password"
                    type="password"
                    value={newStaff.password}
                    onChange={handleStaffChange}
                    required
                  />
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium text-gray-500 mr-2">Password confirm</span>
                    <span className="text-red-500 text-sm">*</span>
                  </div>
                  <Input 
                    id="staff-password-confirm"
                    name="passwordConfirm"
                    type="password"
                    value={newStaff.passwordConfirm}
                    onChange={handleStaffChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium text-gray-500 mr-2">Role</span>
                    <span className="text-red-500 text-sm">*</span>
                  </div>
                  <Select value={newStaff.role} onValueChange={handleRoleChange} required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Veterinarian">Veterinarian</SelectItem>
                      <SelectItem value="Technician">Technician</SelectItem>
                      <SelectItem value="Receptionist">Receptionist</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Assistant">Assistant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium text-gray-500 mr-2">Specialization</span>
                  </div>
                  <Input 
                    id="staff-specialization"
                    name="specialization"
                    value={newStaff.specialization}
                    onChange={handleStaffChange}
                    placeholder="E.g., Surgery, Dermatology, etc."
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-gray-500 mr-2">Certificate Number</span>
                </div>
                <Input 
                  id="staff-certificate"
                  name="certificateNumber"
                  value={newStaff.certificateNumber}
                  onChange={handleStaffChange}
                  placeholder="Professional certification number"
                />
              </div>
              
              <div className="flex items-center space-x-2 py-2">
                <Switch
                  id="staff-verified"
                  name="verified"
                  checked={newStaff.verified}
                  onCheckedChange={(checked) => setNewStaff(prev => ({ ...prev, verified: checked }))}
                />
                <Label htmlFor="staff-verified">Verified</Label>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-gray-500 mr-2">Avatar</span>
                </div>
                <div className="w-full p-2 border border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:bg-gray-100 transition-colors">
                  <label htmlFor="avatar-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center py-4">
                    <Upload className="h-6 w-6 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Upload new file</span>
                    <input 
                      id="avatar-upload" 
                      name="avatar"
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden" 
                    />
                  </label>
                </div>
                {newStaff.avatar && (
                  <p className="text-sm text-gray-500 mt-1">Selected: {newStaff.avatar.name}</p>
                )}
              </div>
              
              <Separator className="my-6" />
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation('/staff')}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-gray-900 text-white hover:bg-gray-800">
                  Create
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
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
