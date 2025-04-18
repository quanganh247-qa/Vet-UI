import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, HelpCircle, Upload } from "lucide-react";
import { Link } from "wouter";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  // Mail settings state
  const [mailSettings, setMailSettings] = useState({
    senderName: "Support",
    senderAddress: "support@example.com",
    useSmtp: true,
    smtpHost: "smtp.example.com",
    smtpPort: "587",
    smtpUsername: "",
    smtpPassword: "",
    encryption: "tls",
    authentication: true
  });

  // Staff form state
  const [newStaff, setNewStaff] = useState({
    id: "",
    email: "",
    password: "",
    passwordConfirm: "",
    verified: false,
    name: "",
    avatar: null as File | null
  });

  // Handle changes in mail settings
  const handleMailSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMailSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle toggle changes for mail settings
  const handleToggleChange = (checked: boolean) => {
    setMailSettings(prev => ({
      ...prev,
      useSmtp: checked
    }));
  };
  
  // Handle form submission for mail settings
  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically save the settings to your backend
    console.log("Saving mail settings:", mailSettings);
    // Show success message or handle errors
  };
  
  // Handle changes in staff form
  const handleStaffChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewStaff(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
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
    
    // Reset form
    setNewStaff({
      id: "",
      email: "",
      password: "",
      passwordConfirm: "",
      verified: false,
      name: "",
      avatar: null
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
      </div>

      <Tabs defaultValue="mail">
        <TabsList className="mb-6">
          <TabsTrigger value="mail">Mail Settings</TabsTrigger>
          <TabsTrigger value="staff">Staff Management</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Mail Settings */}
        <TabsContent value="mail">
          <Card>
            <CardHeader>
              <CardTitle>Mail Settings</CardTitle>
              <CardDescription>Configure common settings for sending emails.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveChanges} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sender Information */}
                  <div>
                    <Label htmlFor="senderName" className="mb-1 block">
                      Sender name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="senderName"
                      name="senderName"
                      value={mailSettings.senderName}
                      onChange={handleMailSettingChange}
                      placeholder="Support"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="senderAddress" className="mb-1 block">
                      Sender address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="senderAddress"
                      name="senderAddress"
                      type="email"
                      value={mailSettings.senderAddress}
                      onChange={handleMailSettingChange}
                      placeholder="support@example.com"
                      required
                    />
                  </div>
                </div>

                {/* SMTP Settings Toggle */}
                <div className="flex items-center space-x-2 mt-6">
                  <Switch
                    id="useSmtp"
                    checked={mailSettings.useSmtp}
                    onCheckedChange={handleToggleChange}
                  />
                  <Label htmlFor="useSmtp" className="flex items-center">
                    Use SMTP mail server 
                    <span className="text-sm text-gray-500 ml-2">(recommended)</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-gray-400 ml-1" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-80 text-sm">
                            Using an SMTP server is recommended for reliable email delivery.
                            If disabled, the system will use the default PHP mail function.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                </div>

                {/* SMTP Server Configuration */}
                {mailSettings.useSmtp && (
                  <div className="grid grid-cols-1 gap-4 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="smtpHost" className="mb-1 block">
                          SMTP server host <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="smtpHost"
                          name="smtpHost"
                          value={mailSettings.smtpHost}
                          onChange={handleMailSettingChange}
                          placeholder="smtp.example.com"
                          required={mailSettings.useSmtp}
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtpPort" className="mb-1 block">
                          Port <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="smtpPort"
                          name="smtpPort"
                          value={mailSettings.smtpPort}
                          onChange={handleMailSettingChange}
                          placeholder="587"
                          required={mailSettings.useSmtp}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="smtpUsername" className="mb-1 block">
                          Username
                        </Label>
                        <Input
                          id="smtpUsername"
                          name="smtpUsername"
                          value={mailSettings.smtpUsername}
                          onChange={handleMailSettingChange}
                          placeholder="Your SMTP username"
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtpPassword" className="mb-1 block">
                          Password
                        </Label>
                        <Input
                          id="smtpPassword"
                          name="smtpPassword"
                          type="password"
                          value={mailSettings.smtpPassword}
                          onChange={handleMailSettingChange}
                          placeholder="Your SMTP password"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="text-sm"
                        onClick={() => {
                          // Here you would typically test the SMTP connection
                          console.log("Testing SMTP connection...");
                        }}
                      >
                        Test Connection
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">
                        Test if the SMTP server is working correctly.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-6">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      // Reset form to default values
                      setMailSettings({
                        senderName: "Support",
                        senderAddress: "support@example.com",
                        useSmtp: true,
                        smtpHost: "smtp.example.com",
                        smtpPort: "587",
                        smtpUsername: "",
                        smtpPassword: "",
                        encryption: "tls",
                        authentication: true
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Save changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Management */}
        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle>Staff Management</CardTitle>
              <CardDescription>Add and manage staff accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">New Staff Member</h3>
                <Separator className="mb-4" />
                
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
                      <span className="text-sm font-medium text-gray-500 mr-2">Name</span>
                    </div>
                    <Input 
                      id="staff-name"
                      name="name"
                      value={newStaff.name}
                      onChange={handleStaffChange}
                    />
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
                      onClick={() => {
                        setNewStaff({
                          id: "",
                          email: "",
                          password: "",
                          passwordConfirm: "",
                          verified: false,
                          name: "",
                          avatar: null
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-gray-900 text-white hover:bg-gray-800">
                      Create
                    </Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other settings tabs (placeholders) */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your general application settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">General settings content coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your security preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Security settings content coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage your notification preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Notification settings content coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings; 