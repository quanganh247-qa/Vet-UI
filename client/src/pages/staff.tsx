import { useState } from "react";
import { Link, useLocation } from "wouter";
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
  FileText,
  RotateCcw,
  MoreHorizontal,
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DoctorDetail } from "@/types";
import { useDoctors, useAddNewStaff, useResetDoctorPassword } from "@/hooks/use-doctor";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const StaffPage = () => {
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  
  // Password reset state
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({
    doctor_username: "",
    email: "",
  });
  const [selectedStaffForReset, setSelectedStaffForReset] = useState<DoctorDetail | null>(null);

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
    is_verified_email: false,
  });

  const { data: staffData, isLoading } = useDoctors();
  const resetPasswordMutation = useResetDoctorPassword();

  // Check if we're on the new staff page
  const isNewStaffPage = location === "/staff/new";

  const filteredStaff = (staffData?.data || []).filter(
    (staff: DoctorDetail) => {
      // Filter by role
      if (
        roleFilter !== "all" &&
        staff.role.toLowerCase() !== roleFilter.toLowerCase()
      ) {
        return false;
      }

      // Filter by search term
      if (searchTerm) {
        const searchFields = [
          staff.doctor_name,
          staff.role,
          staff.specialization,
          staff.email,
        ].map((field) => field?.toLowerCase() || "");

        return searchFields.some((field) =>
          field.includes(searchTerm.toLowerCase())
        );
      }

      return true;
    }
  );

  // Get unique roles for filter
  const uniqueRoles =
    staffData && Array.isArray(staffData.data)
      ? Array.from(new Set(staffData?.data.map((s: DoctorDetail) => s.role)))
      : [];

  const handleStaffClick = (staffId: number) => {
    setLocation(`/staff/${staffId}`);
  };

  // Handle changes in staff form
  const handleStaffChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewStaff((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle select change for role
  const handleRoleChange = (value: string) => {
    setNewStaff((prev) => ({
      ...prev,
      role: value,
    }));
  };

  // Handle delete staff confirmation
  const handleDeleteStaff = (staffId: number) => {
    setSelectedStaffId(staffId);
    setIsDeleteDialogOpen(true);
  };

  // Handle password reset
  const handleResetPassword = (staff: DoctorDetail) => {
    setSelectedStaffForReset(staff);
    setResetPasswordData({
      doctor_username: staff.username || "",
      email: staff.email || "",
    });
    setIsResetPasswordDialogOpen(true);
  };

  const handleResetPasswordSubmit = () => {
    if (!resetPasswordData.doctor_username || !resetPasswordData.email) {
      toast({
        title: "Error",
        description: "Username and email are required",
        variant: "destructive",
      });
      return;
    }

    resetPasswordMutation.mutate(resetPasswordData, {
      onSuccess: () => {
        setIsResetPasswordDialogOpen(false);
        setResetPasswordData({ doctor_username: "", email: "" });
        setSelectedStaffForReset(null);
      },
    });
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

        if (error && typeof error === "object" && "response" in error) {
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
      },
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
      <div className="space-y-6">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-[#2C78E4] to-[#2C78E4]/80 px-6 py-4 md:px-8 md:py-5 rounded-2xl shadow-md mb-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">
                New Staff Member
              </h1>
              <p className="text-white/90 text-sm">
                Add a new veterinarian or staff member to your clinic
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setLocation("/staff")}
                className="bg-white text-[#2C78E4] hover:bg-white/90 rounded-2xl"
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
            <Card className="border-none shadow-lg overflow-hidden rounded-2xl">
              <CardHeader className="pb-4 border-b bg-gradient-to-r from-[#F9FAFB] to-white">
                <CardTitle className="text-lg font-semibold text-[#111827] flex items-center">
                  <UserPlus className="h-5 w-5 mr-2 text-[#2C78E4]" />
                  Staff Information
                </CardTitle>
                <CardDescription className="text-[#4B5563]">
                  Complete the form below to add a new staff member
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-8">
                  {/* Section: Account Info */}
                  <div>
                    <h3 className="text-sm font-medium mb-3 text-[#2C78E4] uppercase flex items-center">
                      <UserCircle className="h-4 w-4 mr-1.5 text-[#2C78E4]" />
                      Account Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="username" className="mb-1.5 block">
                          Username *
                        </Label>
                        <Input
                          id="username"
                          name="username"
                          value={newStaff.username}
                          onChange={handleStaffChange}
                          required
                          autoComplete="off"
                          placeholder="e.g. johndoe"
                          className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-2xl"
                        />
                        <p className="text-xs text-[#4B5563] mt-1">
                          This will be used for login.
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="full_name" className="mb-1.5 block">
                          Full Name *
                        </Label>
                        <Input
                          id="full_name"
                          name="full_name"
                          value={newStaff.full_name}
                          onChange={handleStaffChange}
                          required
                          placeholder="e.g. John Doe"
                          className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-2xl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section: Security */}
                  <div>
                    <h3 className="text-sm font-medium mb-3 text-[#2C78E4] uppercase flex items-center">
                      <Shield className="h-4 w-4 mr-1.5 text-[#2C78E4]" />
                      Security
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="password" className="mb-1.5 block">
                          Password *
                        </Label>
                        <div className="flex items-center">
                          <Lock className="mr-2 h-4 w-4 text-[#4B5563]" />
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            value={newStaff.password}
                            onChange={handleStaffChange}
                            required
                            className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-2xl"
                          />
                        </div>
                      </div>
                      <div>
                        <Label
                          htmlFor="passwordConfirm"
                          className="mb-1.5 block"
                        >
                          Confirm Password *
                        </Label>
                        <div className="flex items-center">
                          <Lock className="mr-2 h-4 w-4 text-[#4B5563]" />
                          <Input
                            id="passwordConfirm"
                            name="passwordConfirm"
                            type="password"
                            value={newStaff.passwordConfirm}
                            onChange={handleStaffChange}
                            required
                            className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-2xl"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section: Contact Info */}
                  <div>
                    <h3 className="text-sm font-medium mb-3 text-[#2C78E4] uppercase flex items-center">
                      <Mail className="h-4 w-4 mr-1.5 text-[#2C78E4]" />
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email" className="mb-1.5 block">
                          Email *
                        </Label>
                        <div className="flex items-center">
                          <Mail className="mr-2 h-4 w-4 text-[#4B5563]" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={newStaff.email}
                            onChange={handleStaffChange}
                            required
                            placeholder="e.g. johndoe@email.com"
                            className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-2xl"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="phone_number" className="mb-1.5 block">
                          Phone Number
                        </Label>
                        <div className="flex items-center">
                          <Phone className="mr-2 h-4 w-4 text-[#4B5563]" />
                          <Input
                            id="phone_number"
                            name="phone_number"
                            value={newStaff.phone_number}
                            onChange={handleStaffChange}
                            placeholder="e.g. 0123456789"
                            className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-2xl"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label htmlFor="address" className="mb-1.5 block">
                        Address
                      </Label>
                      <div className="flex items-center">
                        <Building className="mr-2 h-4 w-4 text-[#4B5563]" />
                        <Input
                          id="address"
                          name="address"
                          value={newStaff.address}
                          onChange={handleStaffChange}
                          placeholder="e.g. 123 Main St, City, Country"
                          className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-2xl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section: Role & Verification */}
                  <div>
                    <h3 className="text-sm font-medium mb-3 text-[#2C78E4] uppercase flex items-center">
                      <BadgeCheck className="h-4 w-4 mr-1.5 text-[#2C78E4]" />
                      Role & Verification
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="role" className="mb-1.5 block">
                          Role *
                        </Label>
                        <div className="flex items-center">
                          <UserCog className="mr-2 h-4 w-4 text-[#4B5563]" />
                          <Select
                            value={newStaff.role}
                            onValueChange={handleRoleChange}
                            required
                          >
                            <SelectTrigger className="w-full border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-2xl">
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                              <SelectItem value="doctor">Doctor</SelectItem>
                              <SelectItem value="receptionist">
                                Receptionist
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label className="mb-1.5 block">
                          Email Verification
                        </Label>
                        <div className="flex items-center gap-3 mt-2 bg-[#F9FAFB] p-3 rounded-2xl">
                          <Switch
                            id="is_verified_email"
                            name="is_verified_email"
                            checked={newStaff.is_verified_email}
                            onCheckedChange={(checked) =>
                              setNewStaff((prev) => ({
                                ...prev,
                                is_verified_email: checked,
                              }))
                            }
                          />
                          <Label
                            htmlFor="is_verified_email"
                            className="text-[#2C78E4] font-medium text-sm"
                          >
                            Verified Email
                          </Label>
                          <span className="text-xs text-[#4B5563]">
                            (Can login immediately if checked)
                          </span>
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
            <Card className="border-none shadow-lg mb-6 rounded-2xl">
              <CardHeader className="pb-3 border-b bg-gradient-to-r from-[#F9FAFB] to-white">
                <CardTitle className="text-lg font-semibold text-[#111827] flex items-center">
                  <UserCircle className="h-5 w-5 mr-2 text-[#2C78E4]" />
                  Staff Preview
                </CardTitle>
                <CardDescription className="text-[#4B5563]">
                  Preview how the staff profile will appear
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-20 w-20 rounded-full bg-[#F9FAFB] flex items-center justify-center text-4xl font-bold text-[#2C78E4]">
                    {newStaff.full_name ? (
                      newStaff.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    ) : (
                      <UserCircle className="w-10 h-10" />
                    )}
                  </div>
                  <div className="text-lg font-semibold text-[#111827]">
                    {newStaff.full_name || "Full Name"}
                  </div>
                  <Badge className="bg-[#F9FAFB] text-[#2C78E4] border-[#2C78E4]/20">
                    {newStaff.role || "Role"}
                  </Badge>
                  <div className="text-[#4B5563] text-sm">
                    {newStaff.email || "Email Address"}
                  </div>
                  <Separator className="my-3" />
                  <div className="w-full space-y-2">
                    <div className="grid grid-cols-3 text-sm">
                      <span className="font-medium text-[#2C78E4]">
                        Username:
                      </span>
                      <span className="col-span-2 text-[#4B5563]">
                        {newStaff.username || "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 text-sm">
                      <span className="font-medium text-[#2C78E4]">Phone:</span>
                      <span className="col-span-2 text-[#4B5563]">
                        {newStaff.phone_number || "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 text-sm">
                      <span className="font-medium text-[#2C78E4]">
                        Address:
                      </span>
                      <span className="col-span-2 text-[#4B5563]">
                        {newStaff.address || "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 text-sm">
                      <span className="font-medium text-[#2C78E4]">
                        Verified:
                      </span>
                      <span className="col-span-2 text-[#4B5563]">
                        {newStaff.is_verified_email ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button Card */}
            <Card className="border-none shadow-lg rounded-2xl">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-3 text-[#2C78E4]">
                  Ready to add this staff member?
                </h3>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleCreateStaff}
                    className="bg-[#2C78E4] hover:bg-[#2C78E4]/90 text-white w-full rounded-2xl"
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
                    onClick={() => setLocation("/staff")}
                    className="border-[#2C78E4]/20 text-[#2C78E4] hover:bg-[#F9FAFB] w-full rounded-2xl"
                  >
                    Cancel
                  </Button>
                </div>

                {/* Validation Hints */}
                <div className="mt-4 bg-[#FFA726]/10 border border-[#FFA726]/20 rounded-2xl p-3">
                  <div className="flex gap-2 text-[#4B5563]">
                    <AlertCircle className="h-5 w-5 text-[#FFA726] flex-shrink-0" />
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
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-[#2C78E4] to-[#2C78E4]/80 px-6 py-4 rounded-2xl shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center">
            <h1 className="text-xl text-white font-semibold">Staff Management</h1>
            </div>
            <p className="text-sm text-white">Manage your staff members</p>
          </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setLocation("/staff/new")}
            className="bg-white text-[#2C78E4] hover:bg-white/90 flex items-center gap-1.5 shadow-sm rounded-2xl"
          >
            <Plus className="w-4 h-4" />
            Add New Staff
          </Button>
        </div>
        </div>
      </div>

      <Card className="border border-[#F9FAFB] shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2C78E4] h-4 w-4" />
              <Input
                placeholder="Search staff by name, role, or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-2xl"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#2C78E4]" />
                <Select defaultValue="all" onValueChange={setRoleFilter}>
                  <SelectTrigger className="border border-[#2C78E4]/20 rounded-2xl h-9 w-40 bg-white">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
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
                <span className="text-sm text-[#4B5563]">View:</span>
                <div className="flex bg-[#F9FAFB] rounded-2xl p-1">
                  <Button
                    size="sm"
                    variant={viewMode === "list" ? "default" : "ghost"}
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "h-8 w-8 p-0 rounded-2xl",
                      viewMode === "list"
                        ? "bg-white shadow-md"
                        : "bg-transparent hover:bg-[#F9FAFB]"
                    )}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "h-8 w-8 p-0 rounded-2xl",
                      viewMode === "grid"
                        ? "bg-white shadow-md"
                        : "bg-transparent hover:bg-[#F9FAFB]"
                    )}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff List/Grid Views */}
      {filteredStaff.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-[#F9FAFB] rounded-2xl border border-dashed border-[#2C78E4]/20 h-64 mt-6">
          <div className="rounded-full bg-[#F9FAFB] p-3 mb-4">
            <UserCircle className="h-6 w-6 text-[#2C78E4]" />
          </div>
          <h3 className="text-lg font-medium mb-2 text-[#111827]">
            No staff members found
          </h3>
          <p className="text-sm text-[#4B5563] text-center mb-4">
            {searchTerm || roleFilter !== "all"
              ? "Try adjusting your search filters"
              : "Get started by adding your first staff member"}
          </p>
          {!searchTerm && roleFilter === "all" && (
            <Button
              size="sm"
              className="bg-[#2C78E4] hover:bg-[#2C78E4]/90 text-white rounded-2xl"
              onClick={() => setLocation("/staff/new")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add staff member
            </Button>
          )}
        </div>
      ) : (
        <div className="mt-6">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStaff.map((staff: DoctorDetail) => (
                <Card
                  key={staff.doctor_id}
                  className="border border-[#F9FAFB] hover:shadow-lg transition-shadow cursor-pointer rounded-2xl"
                  onClick={() => handleStaffClick(staff.doctor_id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-[#111827]">
                        {staff.doctor_name}
                      </CardTitle>
                      <Badge className="bg-[#F9FAFB] text-[#2C78E4] border-[#2C78E4]/20 rounded-full">
                        {staff.role}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1 text-[#4B5563]">
                      <Briefcase className="h-3.5 w-3.5 text-[#4B5563]" />
                      <span>{staff.specialization || "Staff Member"}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center mb-4">
                      <div className="h-16 w-16 rounded-full overflow-hidden bg-[#F9FAFB] flex-shrink-0 flex items-center justify-center mr-3">
                        {staff.data_image ? (
                          <img
                            src={`data:image/png;base64,${staff.data_image}`}
                            alt={staff.doctor_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserCircle className="h-8 w-8 text-[#2C78E4]" />
                        )}
                      </div>
                      <div>
                        <div className="grid grid-cols-1 gap-y-1 text-sm">
                          {staff.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-[#2C78E4]" />
                              <span className="text-[#4B5563]">
                                {staff.email}
                              </span>
                            </div>
                          )}
                          {staff.certificate_number && (
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4 text-[#2C78E4]" />
                              <span className="text-[#4B5563]">
                                {staff.certificate_number}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[#2C78E4] border-[#2C78E4]/20 hover:bg-[#F9FAFB] rounded-2xl"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStaffClick(staff.doctor_id);
                        }}
                      >
                        View Profile <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#2C78E4] hover:bg-[#F9FAFB] h-8 w-8 p-0 rounded-2xl"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48" align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStaffClick(staff.doctor_id);
                            }}
                            className="cursor-pointer"
                          >
                            <UserCircle className="w-4 h-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResetPassword(staff);
                            }}
                            className="cursor-pointer text-orange-600"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset Password
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden border border-[#F9FAFB] rounded-2xl shadow-md">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-[#F9FAFB]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider">
                        Staff Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider">
                        Certifications
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-[#4B5563] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#F9FAFB]">
                    {filteredStaff.map((staff: DoctorDetail) => (
                      <tr
                        key={staff.doctor_id}
                        className="hover:bg-[#F9FAFB] cursor-pointer transition-colors"
                        onClick={() => handleStaffClick(staff.doctor_id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden border border-[#F9FAFB]">
                              {staff.data_image ? (
                                <img
                                  src={`data:image/png;base64,${staff.data_image}`}
                                  alt={staff.doctor_name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full w-full bg-[#F9FAFB]">
                                  <UserCircle className="h-6 w-6 text-[#2C78E4]" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-[#111827]">
                                {staff.doctor_name}
                              </div>
                              {staff.specialization && (
                                <div className="text-sm text-[#4B5563]">
                                  {staff.specialization}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className="bg-[#F9FAFB] text-[#2C78E4] border-[#2C78E4]/20 rounded-full"
                          >
                            {staff.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-[#4B5563]">
                            {staff.email || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-[#4B5563]">
                            {staff.certificate_number || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-[#2C78E4] hover:bg-[#F9FAFB] h-8 rounded-2xl"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-48" align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStaffClick(staff.doctor_id);
                                }}
                                className="cursor-pointer"
                              >
                                <UserCircle className="w-4 h-4 mr-2" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleResetPassword(staff);
                                }}
                                className="cursor-pointer text-orange-600"
                              >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reset Password
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="border border-red-200 bg-white rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#4B5563]">
              This action cannot be undone. This will permanently delete the
              selected staff member and their account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#2C78E4]/20 text-[#2C78E4] hover:bg-[#F9FAFB] rounded-2xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 focus:ring-red-600 rounded-2xl">
              <XCircle className="h-4 w-4 mr-2" />
              Delete Staff
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Password Reset Dialog */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md border border-orange-200 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <RotateCcw className="h-5 w-5" />
              Reset Password
            </DialogTitle>
            <DialogDescription className="text-[#4B5563]">
              Send a password reset email to {selectedStaffForReset?.doctor_name}. 
              Please verify the details below before proceeding.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Staff Info Display */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                  {selectedStaffForReset?.data_image ? (
                    <img
                      src={`data:image/png;base64,${selectedStaffForReset.data_image}`}
                      alt={selectedStaffForReset.doctor_name}
                      className="h-full w-full object-cover rounded-full"
                    />
                  ) : (
                    <UserCircle className="h-8 w-8 text-orange-600" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-orange-900">
                    {selectedStaffForReset?.doctor_name}
                  </div>
                  <div className="text-sm text-orange-700">
                    {selectedStaffForReset?.role}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="reset-username" className="text-sm font-medium">
                  Username
                </Label>
                <Input
                  id="reset-username"
                  value={resetPasswordData.doctor_username}
                  onChange={(e) => setResetPasswordData(prev => ({
                    ...prev,
                    doctor_username: e.target.value
                  }))}
                  className="mt-1 border-orange-200 focus:border-orange-400 rounded-xl"
                  placeholder="Enter username"
                />
              </div>
              
              <div>
                <Label htmlFor="reset-email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={resetPasswordData.email}
                  onChange={(e) => setResetPasswordData(prev => ({
                    ...prev,
                    email: e.target.value
                  }))}
                  className="mt-1 border-orange-200 focus:border-orange-400 rounded-xl"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Important:</p>
                  <ul className="list-disc pl-5 space-y-1 text-xs">
                    <li>A password reset email will be sent to the provided email address</li>
                    <li>The staff member will need to check their email and follow the reset link</li>
                    <li>Their current password will remain active until they complete the reset process</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsResetPasswordDialogOpen(false);
                setResetPasswordData({ doctor_username: "", email: "" });
                setSelectedStaffForReset(null);
              }}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetPasswordSubmit}
              disabled={resetPasswordMutation.isPending || !resetPasswordData.doctor_username || !resetPasswordData.email}
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl"
            >
              {resetPasswordMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Reset Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffPage;
