import { useState } from "react";
import { useLocation } from "wouter";
import {
  Plus,
  Search,
  Filter,
  UserCircle,
  Mail,
  List,
  Grid,
  ChevronRight,
  Award,
  Briefcase,
  Upload,
  ArrowLeft,
  Save,
  Loader2,
  UserCog,
  UserPlus,
  Building,
  Phone,
  Lock,
  AlertCircle,
  Shield,
  CalendarCheck,
  BadgeCheck,
  XCircle,
  CheckCircle,
  FileText
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DoctorDetail } from "@/types";
import { useDoctors, useAddNewStaff } from "@/hooks/use-doctor";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const StaffPage = () => {
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);

  // Staff form state
  const [newStaff, setNewStaff] = useState({
    username: "",
    password: "",
    passwordConfirm: "",
    full_name: "",
    email: "",
    phone_number: "",
    address: "",
    role: "",
    is_verified_email: false
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

  // Handle delete staff confirmation
  const handleDeleteStaff = (staffId: number) => {
    setSelectedStaffId(staffId);
    setIsDeleteDialogOpen(true);
  };

  // Handle staff form submission
  const addNewStaffMutation = useAddNewStaff();
  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate passwords match
    if (newStaff.password !== newStaff.passwordConfirm) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    // Prepare data for API (remove passwordConfirm, handle avatar if needed)
    const { passwordConfirm, ...submitData } = newStaff;
    addNewStaffMutation.mutate(submitData, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Staff member created successfully",
          className: "bg-green-50 border-green-200 text-green-800",
        });
        setNewStaff({
          username: "",
          password: "",
          passwordConfirm: "",
          full_name: "",
          email: "",
          phone_number: "",
          address: "",
          role: "",
          is_verified_email: false,
        });
        setLocation("/staff");
      },
      onError: (error) => {
        let errorMessage = "Failed to create staff member";
        
        if (error && typeof error === 'object' && 'response' in error) {
          // Extract message from server response if available
          const responseData = (error as any).response?.data;
          if (responseData?.message) {
            errorMessage = responseData.message;
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    });
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
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-6 rounded-xl shadow-md mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">New Staff Member</h1>
              <p className="text-indigo-100 text-sm">
                Add a new veterinarian or staff member to your clinic
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => setLocation('/staff')}
                className="bg-white text-indigo-700 hover:bg-indigo-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Staff List
              </Button>
            </div>
          </div>
        </div>

        {/* Staff Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Section */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-lg overflow-hidden">
              <CardHeader className="pb-4 border-b bg-gradient-to-r from-indigo-50 to-white">
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                  <UserPlus className="h-5 w-5 mr-2 text-indigo-600" />
                  Staff Information
                </CardTitle>
                <CardDescription className="text-indigo-500">
                  Complete the form below to add a new staff member
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-8">
                  {/* Section: Account Info */}
                  <div>
                    <h3 className="text-sm font-medium mb-3 text-indigo-700 uppercase flex items-center">
                      <UserCircle className="h-4 w-4 mr-1.5 text-indigo-600" />
                      Account Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="username" className="mb-1.5 block">Username *</Label>
                        <Input
                          id="username"
                          name="username"
                          value={newStaff.username}
                          onChange={handleStaffChange}
                          required
                          autoComplete="off"
                          placeholder="e.g. johndoe"
                          className="border-indigo-200 focus:border-indigo-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">This will be used for login.</p>
                      </div>
                      <div>
                        <Label htmlFor="full_name" className="mb-1.5 block">Full Name *</Label>
                        <Input
                          id="full_name"
                          name="full_name"
                          value={newStaff.full_name}
                          onChange={handleStaffChange}
                          required
                          placeholder="e.g. John Doe"
                          className="border-indigo-200 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section: Security */}
                  <div>
                    <h3 className="text-sm font-medium mb-3 text-indigo-700 uppercase flex items-center">
                      <Shield className="h-4 w-4 mr-1.5 text-indigo-600" />
                      Security
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="password" className="mb-1.5 block">Password *</Label>
                        <div className="flex items-center">
                          <Lock className="mr-2 h-4 w-4 text-gray-400" />
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            value={newStaff.password}
                            onChange={handleStaffChange}
                            required
                            className="border-indigo-200 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="passwordConfirm" className="mb-1.5 block">Confirm Password *</Label>
                        <div className="flex items-center">
                          <Lock className="mr-2 h-4 w-4 text-gray-400" />
                          <Input
                            id="passwordConfirm"
                            name="passwordConfirm"
                            type="password"
                            value={newStaff.passwordConfirm}
                            onChange={handleStaffChange}
                            required
                            className="border-indigo-200 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section: Contact Info */}
                  <div>
                    <h3 className="text-sm font-medium mb-3 text-indigo-700 uppercase flex items-center">
                      <Mail className="h-4 w-4 mr-1.5 text-indigo-600" />
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email" className="mb-1.5 block">Email *</Label>
                        <div className="flex items-center">
                          <Mail className="mr-2 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={newStaff.email}
                            onChange={handleStaffChange}
                            required
                            placeholder="e.g. johndoe@email.com"
                            className="border-indigo-200 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="phone_number" className="mb-1.5 block">Phone Number</Label>
                        <div className="flex items-center">
                          <Phone className="mr-2 h-4 w-4 text-gray-400" />
                          <Input
                            id="phone_number"
                            name="phone_number"
                            value={newStaff.phone_number}
                            onChange={handleStaffChange}
                            placeholder="e.g. 0123456789"
                            className="border-indigo-200 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label htmlFor="address" className="mb-1.5 block">Address</Label>
                      <div className="flex items-center">
                        <Building className="mr-2 h-4 w-4 text-gray-400" />
                        <Input
                          id="address"
                          name="address"
                          value={newStaff.address}
                          onChange={handleStaffChange}
                          placeholder="e.g. 123 Main St, City, Country"
                          className="border-indigo-200 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section: Role & Verification */}
                  <div>
                    <h3 className="text-sm font-medium mb-3 text-indigo-700 uppercase flex items-center">
                      <BadgeCheck className="h-4 w-4 mr-1.5 text-indigo-600" />
                      Role & Verification
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="role" className="mb-1.5 block">Role *</Label>
                        <div className="flex items-center">
                          <UserCog className="mr-2 h-4 w-4 text-gray-400" />
                          <Select value={newStaff.role} onValueChange={handleRoleChange} required>
                            <SelectTrigger className="w-full border-indigo-200 focus:border-indigo-500">
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
                      </div>
                      <div>
                        <Label className="mb-1.5 block">Email Verification</Label>
                        <div className="flex items-center gap-3 mt-2 bg-indigo-50 p-3 rounded-md">
                          <Switch
                            id="is_verified_email"
                            name="is_verified_email"
                            checked={newStaff.is_verified_email}
                            onCheckedChange={(checked) => setNewStaff(prev => ({ ...prev, is_verified_email: checked }))}
                          />
                          <Label htmlFor="is_verified_email" className="text-indigo-700 font-medium text-sm">
                            Verified Email
                          </Label>
                          <span className="text-xs text-indigo-500">(Can login immediately if checked)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview and Action Cards */}
          <div>
            <Card className="border-none shadow-lg mb-6">
              <CardHeader className="pb-3 border-b bg-gradient-to-r from-indigo-50 to-white">
                <CardTitle className="text-lg font-semibold text-indigo-900 flex items-center">
                  <UserCircle className="h-5 w-5 mr-2 text-indigo-600" />
                  Staff Preview
                </CardTitle>
                <CardDescription className="text-indigo-500">
                  Preview how the staff profile will appear
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-4xl font-bold text-indigo-600">
                    {newStaff.full_name ? newStaff.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : <UserCircle className="w-10 h-10" />}
                  </div>
                  <div className="text-lg font-semibold text-indigo-900">{newStaff.full_name || 'Full Name'}</div>
                  <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
                    {newStaff.role || 'Role'}
                  </Badge>
                  <div className="text-gray-500 text-sm">{newStaff.email || 'Email Address'}</div>
                  <Separator className="my-3" />
                  <div className="w-full space-y-2">
                    <div className="grid grid-cols-3 text-sm">
                      <span className="font-medium text-indigo-700">Username:</span>
                      <span className="col-span-2">{newStaff.username || '-'}</span>
                    </div>
                    <div className="grid grid-cols-3 text-sm">
                      <span className="font-medium text-indigo-700">Phone:</span>
                      <span className="col-span-2">{newStaff.phone_number || '-'}</span>
                    </div>
                    <div className="grid grid-cols-3 text-sm">
                      <span className="font-medium text-indigo-700">Address:</span>
                      <span className="col-span-2">{newStaff.address || '-'}</span>
                    </div>
                    <div className="grid grid-cols-3 text-sm">
                      <span className="font-medium text-indigo-700">Verified:</span>
                      <span className="col-span-2">{newStaff.is_verified_email ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Submit Button Card */}
            <Card className="border-none shadow-lg">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-3 text-indigo-700">Ready to add this staff member?</h3>
                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={handleCreateStaff}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white w-full"
                    disabled={addNewStaffMutation.isPending}
                  >
                    {addNewStaffMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Create Staff Member
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setLocation('/staff')}
                    className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 w-full"
                  >
                    Cancel
                  </Button>
                </div>
                
                {/* Validation Hints */}
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-md p-3">
                  <div className="flex gap-2 text-amber-800">
                    <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium mb-1">Required fields:</p>
                      <ul className="list-disc pl-5 text-xs space-y-1">
                        <li>Username</li>
                        <li>Full Name</li>
                        <li>Password (and confirmation)</li>
                        <li>Email</li>
                        <li>Role</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-6 rounded-xl shadow-md mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Staff Management</h1>
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
              Add New Staff
            </Button>
          </div>
        </div>
      </div>

      {/* Search and filter section */}
      <div className="bg-white shadow-sm rounded-lg border border-indigo-100 p-5 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-indigo-50 p-3 rounded-md border border-indigo-100">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-4 w-4" />
            <Input
              placeholder="Search staff by name, role, or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-indigo-200 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-indigo-500" />
              <Select defaultValue="all" onValueChange={setRoleFilter}>
                <SelectTrigger className="border border-indigo-200 rounded-md h-9 w-40 bg-white">
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
              <span className="text-sm text-gray-500">View:</span>
              <div className="flex bg-gray-100 rounded-md p-1">
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "h-8 w-8 p-0",
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'bg-transparent hover:bg-gray-200'
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
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'bg-transparent hover:bg-gray-200'
                  )}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Staff List/Grid Views */}
        {filteredStaff.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-indigo-50 rounded-lg border border-dashed border-indigo-200 h-64 mt-6">
            <div className="rounded-full bg-indigo-100 p-3 mb-4">
              <UserCircle className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-indigo-700">No staff members found</h3>
            <p className="text-sm text-indigo-500 text-center mb-4">
              {searchTerm || roleFilter !== "all" 
                ? "Try adjusting your search filters"
                : "Get started by adding your first staff member"}
            </p>
            {!searchTerm && roleFilter === "all" && (
              <Button 
                size="sm" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => setLocation('/staff/new')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add staff member
              </Button>
            )}
          </div>
        ) : (
          <div className="mt-6">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStaff.map((staff: DoctorDetail) => (
                  <Card
                    key={staff.doctor_id}
                    className="border border-indigo-100 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleStaffClick(staff.doctor_id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{staff.doctor_name}</CardTitle>
                        <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
                          {staff.role}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5 text-gray-400" />
                        <span>{staff.specialization || 'Staff Member'}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center mb-4">
                        <div className="h-16 w-16 rounded-full overflow-hidden bg-indigo-100 flex-shrink-0 flex items-center justify-center mr-3">
                          {staff.data_image ? (
                            <img
                              src={`data:image/png;base64,${staff.data_image}`}
                              alt={staff.doctor_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserCircle className="h-8 w-8 text-indigo-600" />
                          )}
                        </div>
                        <div>
                          <div className="grid grid-cols-1 gap-y-1 text-sm">
                            {staff.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-indigo-500" />
                                <span className="text-gray-600">{staff.email}</span>
                              </div>
                            )}
                            {staff.certificate_number && (
                              <div className="flex items-center gap-2">
                                <Award className="h-4 w-4 text-indigo-500" />
                                <span className="text-gray-600">{staff.certificate_number}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-indigo-600 hover:bg-indigo-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStaffClick(staff.doctor_id);
                          }}
                        >
                          View Profile <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="overflow-hidden border border-indigo-100 rounded-lg shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-indigo-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">
                          Staff Member
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">
                          Certifications
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-indigo-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-indigo-100">
                      {filteredStaff.map((staff: DoctorDetail) => (
                        <tr
                          key={staff.doctor_id}
                          className="hover:bg-indigo-50 cursor-pointer transition-colors"
                          onClick={() => handleStaffClick(staff.doctor_id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden border border-indigo-100">
                                {staff.data_image ? (
                                  <img
                                    src={`data:image/png;base64,${staff.data_image}`}
                                    alt={staff.doctor_name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full w-full bg-indigo-100">
                                    <UserCircle className="h-6 w-6 text-indigo-600" />
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{staff.doctor_name}</div>
                                {staff.specialization && (
                                  <div className="text-sm text-gray-500">{staff.specialization}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              variant="outline"
                              className="bg-indigo-50 text-indigo-600 border-indigo-200"
                            >
                              {staff.role}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{staff.email || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {staff.certificate_number || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-indigo-600 hover:bg-indigo-50 h-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStaffClick(staff.doctor_id);
                              }}
                            >
                              View <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="border border-red-200 bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected staff member and their account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Delete Staff
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StaffPage;
