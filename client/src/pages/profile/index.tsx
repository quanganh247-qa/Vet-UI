import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Upload, 
  Loader2, 
  KeyRound, 
  UserCircle, 
  Briefcase, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap,
  Award,
  FileText,
  Shield,
  User,
  Settings
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useDoctorProfile, useEditDoctorProfile, useUpdateUser, useUpdateUserAvatar, useUpdatePassword } from "@/hooks/use-doctor";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { queryClient } from "@/lib/queryClient";

const EditProfilePage = () => {
  const [, navigate] = useLocation();
  const { doctor } = useAuth();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const editDoctorProfile = useEditDoctorProfile();
  const updateUser = useUpdateUser();
  const updateAvatar = useUpdateUserAvatar();
  const updatePassword = useUpdatePassword();

  const { data: doctorData } = useDoctorProfile();

  const [formData, setFormData] = useState({
    username: doctor?.username || "",
    full_name: doctorData?.full_name || "",
    email: doctorData?.email || "",
    phone_number: doctorData?.phone_number || "",
    address: doctorData?.address || "",
    specialization: doctorData?.specialization || "",
    years_of_experience: doctorData?.years_of_experience || "",
    education: doctorData?.education || "",
    certificate_number: doctorData?.certificate_number || "",
    bio: doctorData?.bio || ""
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (doctorData) {
      setFormData(prev => ({
        ...prev,
        full_name: doctorData.doctor_name || prev.full_name,
        username: doctorData.username || prev.username,
        email: doctorData.email || prev.email,
        phone_number: doctorData.phone_number || prev.phone_number,
        address: doctorData.address || prev.address,
        specialization: doctorData.specialization || prev.specialization,
        years_of_experience: doctorData.years_of_experience || prev.years_of_experience,
        education: doctorData.education || prev.education,
        certificate_number: doctorData.certificate_number || prev.certificate_number,
        bio: doctorData.bio || prev.bio
      }));

      // Clear preview URL when doctor data updates (after successful upload)
      if (previewUrl && doctorData.data_image) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
  }, [doctorData, previewUrl]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log('Selected file:', file);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select a valid image file",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size should be less than 5MB",
          variant: "destructive"
        });
        return;
      }

      // Create FormData and append file with the correct field name
      const formData = new FormData();
      formData.append('image', file);
      console.log('FormData created:', formData.get('image'));

      // Set preview before upload
      const previewURL = URL.createObjectURL(file);
      setPreviewUrl(previewURL);
      console.log('Preview URL set:', previewURL);

      try {
        // Upload avatar
        console.log('Starting avatar upload...');
        const result = await updateAvatar.mutateAsync(formData);
        console.log('Upload result:', result);

        // Success is handled by the mutation's onSuccess callback
      } catch (error: any) {
        console.error('Error uploading avatar:', error);
        console.error('Error details:', error?.response?.data);
        
        // Revert preview on error
        URL.revokeObjectURL(previewURL);
        setPreviewUrl(null);
        
        // Don't show additional toast since the mutation's onError will handle it
      } finally {
        // Reset the file input
        if (e.target) {
          e.target.value = '';
        }
      }
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive"
      });
      return;
    }

    try {
      await updatePassword.mutateAsync({
        old_password: passwordData.currentPassword,
        password: passwordData.newPassword
      });

      // Clear password fields after successful update
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error: any) {
      console.error('Error updating password:', error);
      // Display the error message from the API
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update password",
        variant: "destructive"
      });
    }
  };

  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Update user profile
      await updateUser.mutateAsync({
        username: formData.username,
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number,
        address: formData.address
      });

      // Refresh the doctor profile data
      queryClient.invalidateQueries({ queryKey: ['doctor-profile'] });

      toast({
        title: "Success",
        description: "Personal information updated successfully!",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error: any) {
      console.error('Error updating personal information:', error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update personal information",
        variant: "destructive",
      });
    }
  };

  const handleProfessionalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Update doctor profile
      await editDoctorProfile.mutateAsync({
        specialization: formData.specialization,
        years_of_experience: parseInt(formData.years_of_experience),
        education: formData.education,
        certificate_number: formData.certificate_number,
        bio: formData.bio
      });

      toast({
        title: "Success",
        description: "Professional information updated successfully!",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error: any) {
      console.error('Error updating professional information:', error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update professional information",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-[#2C78E4] to-[#2C78E4]/80 px-6 py-4 md:px-8 md:py-5 rounded-2xl shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-white flex items-center hover:bg-white/10 rounded-lg px-3 py-2 transition-all mr-4"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Back</span>
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-white">Profile Management</h1>
              <p className="text-white/80 text-sm mt-1">
                Update your personal and professional information
              </p>
            </div>
          </div>
          
          {/* Profile Status Badge */}
          <div className="hidden md:flex items-center gap-3">
            <Badge className="bg-white/20 text-white border-white/30">
              <Shield className="h-3 w-3 mr-1" />
              Verified Doctor
            </Badge>
          </div>
        </div>
      </div>

      {/* Profile Overview Card */}
      <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            {/* Profile Photo */}
            <div className="relative">
              <div className="h-24 w-24 rounded-full overflow-hidden bg-[#F9FAFB] flex items-center justify-center ring-4 ring-white shadow-lg">
                {previewUrl || doctorData?.data_image ? (
                  <img
                    src={previewUrl || `data:image/png;base64,${doctorData?.data_image}`}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserCircle className="h-16 w-16 text-[#2C78E4]" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="avatar-upload"
                  onChange={handleAvatarChange}
                />
                <Button 
                  size="sm" 
                  className="h-8 w-8 rounded-full p-0 bg-[#2C78E4] hover:bg-[#2C78E4]/90" 
                  type="button"
                  disabled={updateAvatar.isPending}
                  onClick={() => {
                    const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
                    fileInput?.click();
                  }}
                >
                  {updateAvatar.isPending ? (
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 text-white" />
                  )}
                </Button>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#111827] mb-1">
                {doctorData?.doctor_name || formData.full_name || "Doctor Name"}
              </h2>
              <p className="text-[#2C78E4] font-medium mb-2">
                {doctorData?.specialization || "Veterinary Specialist"}
              </p>
              
              <div className="flex flex-wrap gap-4 text-sm text-[#4B5563]">
                {doctorData?.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {doctorData.email}
                  </div>
                )}
                {doctorData?.phone_number && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {doctorData.phone_number}
                  </div>
                )}
                {doctorData?.years_of_experience && (
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    {doctorData.years_of_experience} years experience
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
        <Tabs defaultValue="personal" className="w-full">
          <div className="border-b border-gray-200 bg-gradient-to-r from-[#F9FAFB] to-white px-6 py-4">
            <TabsList className="grid w-full grid-cols-3 bg-white rounded-xl p-1 shadow-sm">
              <TabsTrigger 
                value="personal" 
                className="flex items-center gap-2 data-[state=active]:bg-[#2C78E4] data-[state=active]:text-white rounded-lg"
              >
                <User className="h-4 w-4" />
                Personal Info
              </TabsTrigger>
              <TabsTrigger 
                value="professional"
                className="flex items-center gap-2 data-[state=active]:bg-[#2C78E4] data-[state=active]:text-white rounded-lg"
              >
                <Briefcase className="h-4 w-4" />
                Professional
              </TabsTrigger>
              <TabsTrigger 
                value="security"
                className="flex items-center gap-2 data-[state=active]:bg-[#2C78E4] data-[state=active]:text-white rounded-lg"
              >
                <Settings className="h-4 w-4" />
                Security
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border border-gray-100 rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-[#111827] flex items-center gap-2">
                    <UserCircle className="h-5 w-5 text-[#2C78E4]" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePersonalInfoSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-sm font-medium text-[#374151]">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
                        placeholder="Enter username"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="full_name" className="text-sm font-medium text-[#374151]">Full Name</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
                        placeholder="Enter full name"
                      />
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button
                        type="submit"
                        disabled={updateUser.isPending}
                        className="bg-[#2C78E4] text-white hover:bg-[#2C78E4]/90 rounded-xl"
                      >
                        {updateUser.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="border border-gray-100 rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-[#111827] flex items-center gap-2">
                    <Mail className="h-5 w-5 text-[#2C78E4]" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePersonalInfoSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-[#374151]">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
                        placeholder="Enter email address"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone_number" className="text-sm font-medium text-[#374151]">Phone Number</Label>
                      <Input
                        id="phone_number"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-medium text-[#374151]">Address</Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
                        placeholder="Enter address"
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button
                        type="submit"
                        disabled={updateUser.isPending}
                        className="bg-[#2C78E4] text-white hover:bg-[#2C78E4]/90 rounded-xl"
                      >
                        {updateUser.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Professional Information Tab */}
          <TabsContent value="professional" className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border border-gray-100 rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-[#111827] flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-[#2C78E4]" />
                    Education & Experience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfessionalInfoSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="specialization" className="text-sm font-medium text-[#374151]">Specialization</Label>
                      <Input
                        id="specialization"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
                        placeholder="e.g., Small Animal Medicine"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="years_of_experience" className="text-sm font-medium text-[#374151]">Years of Experience</Label>
                      <Input
                        id="years_of_experience"
                        name="years_of_experience"
                        type="number"
                        value={formData.years_of_experience}
                        onChange={handleInputChange}
                        className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
                        placeholder="Enter years of experience"
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="education" className="text-sm font-medium text-[#374151]">Education</Label>
                      <Input
                        id="education"
                        name="education"
                        value={formData.education}
                        onChange={handleInputChange}
                        className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
                        placeholder="e.g., DVM, University Name"
                      />
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button
                        type="submit"
                        disabled={editDoctorProfile.isPending}
                        className="bg-[#2C78E4] text-white hover:bg-[#2C78E4]/90 rounded-xl"
                      >
                        {editDoctorProfile.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="border border-gray-100 rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-[#111827] flex items-center gap-2">
                    <Award className="h-5 w-5 text-[#2C78E4]" />
                    Certifications & Bio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfessionalInfoSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="certificate_number" className="text-sm font-medium text-[#374151]">Certificate Number</Label>
                      <Input
                        id="certificate_number"
                        name="certificate_number"
                        value={formData.certificate_number}
                        onChange={handleInputChange}
                        className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
                        placeholder="Enter certificate number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-sm font-medium text-[#374151]">Professional Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={6}
                        className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
                        placeholder="Write a brief professional bio..."
                      />
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button
                        type="submit"
                        disabled={editDoctorProfile.isPending}
                        className="bg-[#2C78E4] text-white hover:bg-[#2C78E4]/90 rounded-xl"
                      >
                        {editDoctorProfile.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="p-6">
            <div className="max-w-2xl mx-auto">
              <Card className="border border-orange-200 rounded-xl">
                <CardHeader className="pb-4 bg-orange-50 rounded-t-xl">
                  <CardTitle className="text-lg text-orange-900 flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-orange-600" />
                    Change Password
                  </CardTitle>
                  <CardDescription className="text-orange-700">
                    Update your account password for better security
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-sm font-medium text-[#374151]">Current Password</Label>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="border-orange-200 focus:border-orange-400 rounded-xl"
                        placeholder="Enter current password"
                        required
                      />
                    </div>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-sm font-medium text-[#374151]">New Password</Label>
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="border-orange-200 focus:border-orange-400 rounded-xl"
                          placeholder="Enter new password"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium text-[#374151]">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="border-orange-200 focus:border-orange-400 rounded-xl"
                          placeholder="Confirm new password"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button
                        type="submit"
                        disabled={updatePassword.isPending}
                        className="bg-orange-600 text-white hover:bg-orange-700 rounded-xl"
                      >
                        {updatePassword.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating Password...
                          </>
                        ) : (
                          'Update Password'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default EditProfilePage;