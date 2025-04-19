import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, Loader2, KeyRound } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useDoctorProfile, useEditDoctorProfile, useUpdateUser, useUpdateUserAvatar, useUpdatePassword } from "@/hooks/use-doctor";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";

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
    }
}, [doctorData]);

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
      setPreviewUrl(URL.createObjectURL(file));
      
      const formData = new FormData();
      formData.append('avatar', file);
      
      try {
        await updateAvatar.mutateAsync(formData);
      } catch (error) {
        console.error('Error uploading avatar:', error);
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
        old_assword: passwordData.currentPassword,
        password: passwordData.newPassword
      });

      // Clear password fields after successful update
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      console.error('Error updating password:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

      // Update doctor profile
      await editDoctorProfile.mutateAsync({
        specialization: formData.specialization,
        years_of_experience: parseInt(formData.years_of_experience),
        education: formData.education,
        certificate_number: formData.certificate_number,
        bio: formData.bio
      });

    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-6 max-w-[100vw]">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 rounded-xl shadow-md mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 h-8 w-8 text-white hover:bg-white/20"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Profile Photo</Label>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {previewUrl || doctorData?.data_image ? (
                      <img
                        src={previewUrl || `data:image/png;base64,${doctorData?.data_image}`}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        <Upload className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <Button variant="outline" type="button" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload new photo
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>Update your professional details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="years_of_experience">Years of Experience</Label>
                <Input
                  id="years_of_experience"
                  name="years_of_experience"
                  type="number"
                  value={formData.years_of_experience}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Input
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certificate_number">Certificate Number</Label>
                <Input
                  id="certificate_number"
                  name="certificate_number"
                  value={formData.certificate_number}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Password Update Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-indigo-600" />
              Change Password
            </CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button 
                  type="submit"
                  disabled={updatePassword.isPending}
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

        <div className="flex justify-end mt-6">
          <Button
            type="button"
            variant="outline"
            className="mr-2"
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={updateUser.isPending || editDoctorProfile.isPending || updateAvatar.isPending}
          >
            {(updateUser.isPending || editDoctorProfile.isPending) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;