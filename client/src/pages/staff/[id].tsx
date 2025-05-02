import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Award,
  BookOpen,
  Briefcase,
  UserCircle,
  Calendar,
  Clock,
  Edit,
  Save,
  Loader2,
  Shield,
  Building,
  BadgeCheck,
  Pencil,
  X,
  CalendarClock,
  Users,
  FileText,
  User,
  Calendar as CalendarIcon,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useDoctorProfile, useEditDoctorProfile } from "@/hooks/use-doctor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DoctorDetail } from "@/types";
import { EditDoctorProfileRequest } from "@/services/doctor-services";

// Extended DoctorDetail type for the form
interface ExtendedDoctorDetail extends DoctorDetail {
  phone_number?: string;
  address?: string;
}

const StaffDetailPage = () => {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute<{ id: string }>("/staff/:id");
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<Partial<ExtendedDoctorDetail>>({});
  
  // Get staff ID from URL params
  const staffId = parseInt(params?.id || "0");
  const { data: doctorData, isLoading, refetch } = useDoctorProfile(staffId);
  const updateDoctorMutation = useEditDoctorProfile();

  useEffect(() => {
    if (doctorData) {
      setFormData({
        doctor_name: doctorData.doctor_name,
        email: doctorData.email,
        address: doctorData.address,
        role: doctorData.role,
        specialization: doctorData.specialization,
        certificate_number: doctorData.certificate_number,
        bio: doctorData.bio || "",
        years_of_experience: doctorData.years_of_experience || 0,
        education: doctorData.education || "",
        phone_number: doctorData.phone_number,
      });
    }
  }, [doctorData]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'years_of_experience' ? Number(value) : value
    }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = () => {
    // Create request object with only the fields expected by the API
    const requestData: EditDoctorProfileRequest = {
      specialization: formData.specialization || "",
      years_of_experience: formData.years_of_experience || 0,
      education: formData.education || "",
      certificate_number: formData.certificate_number || "",
      bio: formData.bio || ""
    };
    
    updateDoctorMutation.mutate(requestData, {
      onSuccess: () => {
        toast({
          title: "Profile updated successfully",
          description: "The staff member profile has been updated.",
          className: "bg-green-50 border-green-200 text-green-800",
        });
        setIsEditDialogOpen(false);
        refetch();
      },
      onError: (error: Error) => {
        toast({
          title: "Error updating profile",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!doctorData) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg border border-dashed border-red-300 h-64 mt-6">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium mb-2 text-red-700">Staff Member Not Found</h3>
          <p className="text-sm text-red-600 text-center mb-4">
            The staff member you're looking for doesn't exist or has been removed.
          </p>
          <Button 
            onClick={() => setLocation('/staff')}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Staff List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-6 rounded-xl shadow-md mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/staff")}
              className="bg-white/10 text-white hover:bg-white/20 rounded-full h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">{doctorData.doctor_name}</h1>
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white border-white/30">
                  {doctorData.role}
                </Badge>
                {doctorData.specialization && (
                  <span className="text-white/80 text-sm">{doctorData.specialization}</span>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={() => setIsEditDialogOpen(true)}
            className="bg-white text-indigo-700 hover:bg-indigo-50 flex items-center gap-1.5"
          >
            <Pencil className="w-4 h-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="border-none shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-white p-6 flex flex-col items-center border-b">
              <div className="h-32 w-32 rounded-full overflow-hidden bg-indigo-100 mb-4 ring-4 ring-white shadow-md">
                {doctorData.data_image ? (
                  <img
                    src={`data:image/png;base64,${doctorData.data_image}`}
                    alt={doctorData.doctor_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <UserCircle className="h-20 w-20 text-indigo-300" />
                  </div>
                )}
              </div>
              <h2 className="text-xl font-semibold text-indigo-900">
                {doctorData.doctor_name}
              </h2>
              <Badge className="mt-2 bg-indigo-100 text-indigo-700 border-indigo-200">
                {doctorData.role}
              </Badge>
              {doctorData.specialization && (
                <p className="text-indigo-500 text-sm mt-1">{doctorData.specialization}</p>
              )}
            </div>
            
            <CardContent className="p-5">
              <div className="space-y-4">
                {doctorData.email && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="h-5 w-5 text-indigo-500" />
                    <span className="text-sm">{doctorData.email}</span>
                  </div>
                )}
                {doctorData.phone_number && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="h-5 w-5 text-indigo-500" />
                    <span className="text-sm">{doctorData.phone_number}</span>
                  </div>
                )}
                {doctorData.address && (
                  <div className="flex items-start gap-3 text-gray-700">
                    <MapPin className="h-5 w-5 text-indigo-500 mt-0.5" />
                    <span className="text-sm">{doctorData.address}</span>
                  </div>
                )}
              </div>
              
              <Separator className="my-4" />
              
              {/* Credentials Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-indigo-700 uppercase">Credentials</h3>
                
                {doctorData.certificate_number && (
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-indigo-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">License Number</p>
                      <p className="text-sm text-gray-600">
                        {doctorData.certificate_number}
                      </p>
                    </div>
                  </div>
                )}
                {doctorData.education && (
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-indigo-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Education</p>
                      <p className="text-sm text-gray-600">
                        {doctorData.education}
                      </p>
                    </div>
                  </div>
                )}
                {doctorData.years_of_experience > 0 && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-indigo-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Experience</p>
                      <p className="text-sm text-gray-600">
                        {doctorData.years_of_experience} years
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <Separator className="my-4" />
              
              {/* Quick Actions */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-indigo-700 uppercase">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    onClick={() => setActiveTab("schedule")}
                  >
                    <CalendarClock className="h-4 w-4 mr-1.5" />
                    Schedule
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    onClick={() => setActiveTab("patients")}
                  >
                    <Users className="h-4 w-4 mr-1.5" />
                    Patients
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-indigo-50 p-1 rounded-lg border border-indigo-100 mb-6">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
              >
                <User className="h-4 w-4 mr-1.5" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="schedule" 
                className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
              >
                <CalendarIcon className="h-4 w-4 mr-1.5" />
                Schedule
              </TabsTrigger>
              <TabsTrigger 
                value="patients" 
                className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
              >
                <Users className="h-4 w-4 mr-1.5" />
                Patients
              </TabsTrigger>
              <TabsTrigger 
                value="records" 
                className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
              >
                <FileText className="h-4 w-4 mr-1.5" />
                Records
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-0 space-y-6">
              <Card className="border-none shadow-lg overflow-hidden">
                <CardHeader className="pb-3 border-b bg-gradient-to-r from-indigo-50 to-white">
                  <CardTitle className="flex items-center text-lg text-gray-800">
                    <User className="h-5 w-5 mr-2 text-indigo-600" />
                    About
                  </CardTitle>
                  <CardDescription>
                    Professional background and expertise
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-700 mb-6">
                    {doctorData.bio ? (
                      <p>{doctorData.bio}</p>
                    ) : (
                      <p className="text-gray-500 italic">No biography available.</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border border-indigo-100">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-indigo-100 rounded-full p-2">
                            <Calendar className="h-5 w-5 text-indigo-600" />
                          </div>
                          <h3 className="font-medium text-indigo-800">Experience</h3>
                        </div>
                        <p className="text-3xl font-bold text-indigo-900 mb-1">
                          {doctorData.years_of_experience || 0}
                        </p>
                        <p className="text-sm text-indigo-600">Years in practice</p>
                      </CardContent>
                    </Card>

                    <Card className="border border-indigo-100">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-green-100 rounded-full p-2">
                            <Clock className="h-5 w-5 text-green-600" />
                          </div>
                          <h3 className="font-medium text-green-800">Availability</h3>
                        </div>
                        <div className="space-y-2">
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Monday - Friday
                          </Badge>
                          <p className="text-sm text-green-600">9:00 AM - 5:00 PM</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-lg overflow-hidden">
                <CardHeader className="pb-3 border-b bg-gradient-to-r from-indigo-50 to-white">
                  <CardTitle className="flex items-center text-lg text-gray-800">
                    <Award className="h-5 w-5 mr-2 text-indigo-600" />
                    Skills & Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Badge className="py-2 px-3 bg-indigo-50 text-indigo-700 border-indigo-200 justify-start">
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
                    Diagnostics
                  </Badge>
                  <Badge className="py-2 px-3 bg-indigo-50 text-indigo-700 border-indigo-200 justify-start">
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
                    Surgery
                  </Badge>
                  <Badge className="py-2 px-3 bg-indigo-50 text-indigo-700 border-indigo-200 justify-start">
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
                    Treatment Planning
                  </Badge>
                  <Badge className="py-2 px-3 bg-indigo-50 text-indigo-700 border-indigo-200 justify-start">
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
                    Preventive Care
                  </Badge>
                  <Badge className="py-2 px-3 bg-indigo-50 text-indigo-700 border-indigo-200 justify-start">
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
                    Emergency Medicine
                  </Badge>
                  <Badge className="py-2 px-3 bg-indigo-50 text-indigo-700 border-indigo-200 justify-start">
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
                    Patient Education
                  </Badge>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="mt-0">
              <Card className="border-none shadow-lg overflow-hidden">
                <CardHeader className="pb-3 border-b bg-gradient-to-r from-indigo-50 to-white">
                  <CardTitle className="flex items-center text-lg text-gray-800">
                    <CalendarIcon className="h-5 w-5 mr-2 text-indigo-600" />
                    Work Schedule
                  </CardTitle>
                  <CardDescription>
                    Weekly schedule and availability
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="bg-indigo-50 p-4 rounded-lg border border-dashed border-indigo-200 text-center">
                    <CalendarIcon className="h-10 w-10 text-indigo-400 mx-auto mb-3" />
                    <p className="text-indigo-700 font-medium">Schedule information will be displayed here</p>
                    <p className="text-indigo-500 text-sm mt-1">Schedule management is coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="patients" className="mt-0">
              <Card className="border-none shadow-lg overflow-hidden">
                <CardHeader className="pb-3 border-b bg-gradient-to-r from-indigo-50 to-white">
                  <CardTitle className="flex items-center text-lg text-gray-800">
                    <Users className="h-5 w-5 mr-2 text-indigo-600" />
                    Assigned Patients
                  </CardTitle>
                  <CardDescription>
                    Patients currently under care
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="bg-indigo-50 p-4 rounded-lg border border-dashed border-indigo-200 text-center">
                    <Users className="h-10 w-10 text-indigo-400 mx-auto mb-3" />
                    <p className="text-indigo-700 font-medium">Patient information will be displayed here</p>
                    <p className="text-indigo-500 text-sm mt-1">Patient assignments coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="records" className="mt-0">
              <Card className="border-none shadow-lg overflow-hidden">
                <CardHeader className="pb-3 border-b bg-gradient-to-r from-indigo-50 to-white">
                  <CardTitle className="flex items-center text-lg text-gray-800">
                    <FileText className="h-5 w-5 mr-2 text-indigo-600" />
                    Medical Records
                  </CardTitle>
                  <CardDescription>
                    Records and procedures performed
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="bg-indigo-50 p-4 rounded-lg border border-dashed border-indigo-200 text-center">
                    <FileText className="h-10 w-10 text-indigo-400 mx-auto mb-3" />
                    <p className="text-indigo-700 font-medium">Medical records will be displayed here</p>
                    <p className="text-indigo-500 text-sm mt-1">Records management coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] border border-indigo-200 bg-white">
          <DialogHeader className="border-b border-indigo-100 pb-4">
            <DialogTitle className="text-indigo-900 flex items-center">
              <Pencil className="h-5 w-5 mr-2 text-indigo-600" />
              Edit Staff Profile
            </DialogTitle>
            <DialogDescription className="text-indigo-500">
              Update the details for {doctorData.doctor_name}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] px-1">
            <div className="space-y-6 p-1 pt-4">
              {/* Personal Information */}
              <div>
                <h3 className="text-sm font-medium mb-3 text-indigo-700 uppercase flex items-center">
                  <User className="h-4 w-4 mr-1.5 text-indigo-600" />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="doctor_name" className="mb-1.5 block">Full Name*</Label>
                    <Input
                      id="doctor_name"
                      name="doctor_name"
                      value={formData.doctor_name || ""}
                      onChange={handleInputChange}
                      placeholder="Dr. John Doe"
                      className="border-indigo-200 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="role" className="mb-1.5 block">Role*</Label>
                      <Select 
                        value={formData.role || ""} 
                        onValueChange={(value) => handleSelectChange("role", value)}
                      >
                        <SelectTrigger className="border-indigo-200 focus:border-indigo-500">
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
                    <div>
                      <Label htmlFor="specialization" className="mb-1.5 block">Specialization</Label>
                      <Input
                        id="specialization"
                        name="specialization"
                        value={formData.specialization || ""}
                        onChange={handleInputChange}
                        placeholder="e.g. Orthopedics, Surgery"
                        className="border-indigo-200 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Contact Information */}
              <div>
                <h3 className="text-sm font-medium mb-3 text-indigo-700 uppercase flex items-center">
                  <Mail className="h-4 w-4 mr-1.5 text-indigo-600" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="mb-1.5 block">Email Address*</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={handleInputChange}
                      placeholder="john.doe@example.com"
                      className="border-indigo-200 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone_number" className="mb-1.5 block">Phone Number</Label>
                    <Input
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number || ""}
                      onChange={handleInputChange}
                      placeholder="e.g. (123) 456-7890"
                      className="border-indigo-200 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address" className="mb-1.5 block">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address || ""}
                      onChange={handleInputChange}
                      placeholder="123 Main St, City, Country"
                      className="border-indigo-200 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Professional Information */}
              <div>
                <h3 className="text-sm font-medium mb-3 text-indigo-700 uppercase flex items-center">
                  <Briefcase className="h-4 w-4 mr-1.5 text-indigo-600" />
                  Professional Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bio" className="mb-1.5 block">Biography</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio || ""}
                      onChange={handleInputChange}
                      placeholder="Professional background and expertise..."
                      rows={4}
                      className="border-indigo-200 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="certificate_number" className="mb-1.5 block">License Number</Label>
                      <Input
                        id="certificate_number"
                        name="certificate_number"
                        value={formData.certificate_number || ""}
                        onChange={handleInputChange}
                        placeholder="e.g. LIC-12345678"
                        className="border-indigo-200 focus:border-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="years_of_experience" className="mb-1.5 block">Years of Experience</Label>
                      <Input
                        id="years_of_experience"
                        name="years_of_experience"
                        type="number"
                        value={formData.years_of_experience || ""}
                        onChange={handleInputChange}
                        min={0}
                        className="border-indigo-200 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="education" className="mb-1.5 block">Education</Label>
                    <Input
                      id="education"
                      name="education"
                      value={formData.education || ""}
                      onChange={handleInputChange}
                      placeholder="e.g. DVM, University of Veterinary Medicine"
                      className="border-indigo-200 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
          
          <DialogFooter className="border-t border-indigo-100 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={updateDoctorMutation.isPending}
            >
              {updateDoctorMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffDetailPage; 