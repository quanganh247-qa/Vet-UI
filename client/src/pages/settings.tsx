import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft, 
  HelpCircle, 
  Plus, 
  Trash, 
  Pencil, 
  CheckCircle, 
  Send,
  Loader2
} from "lucide-react";
import { Link } from "wouter";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useEmailSettings } from "@/hooks/use-email-settings";
import { CreateSMTPConfigRequest, SMTPConfig, UpdateSMTPConfigRequest } from "@/services/email-settings-services";

// Types and schemas for email dialog forms
const smtpConfigFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  smtp_host: z.string().min(1, "SMTP host is required"),
  smtp_port: z.string().regex(/^\d+$/, "Port must be a number").default("587"),
  is_default: z.boolean().default(false)
});

// For updating a config, password is optional
const updateConfigFormSchema = smtpConfigFormSchema.extend({
  password: z.string().optional()
});

const testEmailFormSchema = z.object({
  test_email: z.string().email("Invalid email address")
});

type SMTPConfigFormValues = z.infer<typeof smtpConfigFormSchema>;
type UpdateConfigFormValues = z.infer<typeof updateConfigFormSchema>;
type TestEmailFormValues = z.infer<typeof testEmailFormSchema>;

const Settings = () => {
  // State for dialogs
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<SMTPConfig | null>(null);
  
  // Use our email settings hook
  const { 
    smtpConfigs, 
    defaultConfig,
    isLoadingConfigs, 
    isCreating,
    isUpdating,
    isDeleting,
    isSettingDefault,
    testLoading,
    testResult,
    createConfig,
    updateConfig,
    deleteConfig,
    setAsDefault,
    testSMTPConfig
  } = useEmailSettings();

  // Form for adding new config
  const addConfigForm = useForm<SMTPConfigFormValues>({
    resolver: zodResolver(smtpConfigFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      smtp_host: "smtp.gmail.com",
      smtp_port: "587",
      is_default: false
    }
  });

  // Form for editing config
  const editConfigForm = useForm<UpdateConfigFormValues>({
    resolver: zodResolver(updateConfigFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      smtp_host: "",
      smtp_port: "",
      is_default: false
    }
  });

  // Form for testing email
  const testEmailForm = useForm<TestEmailFormValues>({
    resolver: zodResolver(testEmailFormSchema),
    defaultValues: {
      test_email: ""
    }
  });

  // Handle adding a new config
  const handleAddConfig = (data: SMTPConfigFormValues) => {
    const newConfig: CreateSMTPConfigRequest = {
      name: data.name,
      email: data.email,
      password: data.password,
      smtp_host: data.smtp_host,
      smtp_port: data.smtp_port,
      is_default: data.is_default
    };
    
    createConfig(newConfig);
    setShowAddDialog(false);
    addConfigForm.reset();
  };

  // Handle editing a config
  const handleEditConfig = (data: UpdateConfigFormValues) => {
    if (!selectedConfig) return;

    const updatedConfig: UpdateSMTPConfigRequest = {
      name: data.name,
      email: data.email,
      smtp_host: data.smtp_host,
      smtp_port: data.smtp_port,
      is_default: data.is_default
    };

    // Only include password if provided
    if (data.password) {
      updatedConfig.password = data.password;
    }

    updateConfig({ id: selectedConfig.id, data: updatedConfig });
    setShowEditDialog(false);
    editConfigForm.reset();
  };

  // Handle deleting a config
  const handleDeleteConfig = () => {
    if (!selectedConfig) return;
    deleteConfig(selectedConfig.id);
    setShowDeleteDialog(false);
  };

  // Handle setting a config as default
  const handleSetAsDefault = (config: SMTPConfig) => {
    if (config.is_default) return; // Already default
    setAsDefault(config.id);
  };

  // Open edit dialog with selected config data
  const openEditDialog = (config: SMTPConfig) => {
    setSelectedConfig(config);
    editConfigForm.reset({
      name: config.name,
      email: config.email,
      smtp_host: config.smtp_host,
      smtp_port: config.smtp_port,
      is_default: config.is_default
    });
    setShowEditDialog(true);
  };

  // Open delete dialog
  const openDeleteDialog = (config: SMTPConfig) => {
    setSelectedConfig(config);
    setShowDeleteDialog(true);
  };

  // Open test dialog
  const openTestDialog = (config: SMTPConfig) => {
    setSelectedConfig(config);
    testEmailForm.reset({
      test_email: ""
    });
    setShowTestDialog(true);
  };

  // Handle test email submission
  const handleTestEmail = async (data: TestEmailFormValues) => {
    if (!selectedConfig) return;
    
    await testSMTPConfig({
      smtp_id: selectedConfig.id,
      test_email: data.test_email
    });
    
    // Note: We're not closing the dialog here so the user can see the result
  };

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-[#2C78E4] to-[#2C78E4]/80 px-6 py-4 md:px-8 md:py-5 rounded-2xl shadow-md mb-6 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 rounded-xl">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Settings</h1>
          </div>
        </div>
      </div>

      <Tabs defaultValue="mail" className="space-y-6">
        <TabsList className="bg-white/5 p-1 rounded-xl border border-[#F9FAFB] shadow-sm">
          <TabsTrigger value="mail" className="text-sm font-medium rounded-lg data-[state=active]:bg-[#2C78E4] data-[state=active]:text-white">Mail Settings</TabsTrigger>
          <TabsTrigger value="smtp" className="text-sm font-medium rounded-lg data-[state=active]:bg-[#2C78E4] data-[state=active]:text-white">SMTP Configurations</TabsTrigger>
        </TabsList>

        <TabsContent value="mail">
          <Card className="border-none shadow-lg rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-[#F9FAFB] to-white pb-4 border-b">
              <CardTitle className="text-lg font-semibold text-[#111827]">Mail Settings</CardTitle>
              <CardDescription className="text-[#2C78E4]/70">
                Configure common settings for sending emails.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 py-4 px-4 bg-[#F9FAFB] rounded-xl mb-6">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="font-medium">Using SMTP Configuration:</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white border border-gray-200 shadow-lg rounded-xl">
                      <p className="w-80 text-sm">
                        This is the current default SMTP configuration being used for sending emails.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {defaultConfig ? (
                  <div className="ml-2 p-2 bg-white rounded-xl border border-[#F9FAFB] flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{defaultConfig.name}</p>
                        <p className="text-sm text-[#4B5563]">{defaultConfig.email}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200 rounded-full">
                        Default
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-[#4B5563]">
                      SMTP Server: {defaultConfig.smtp_host}:{defaultConfig.smtp_port}
                    </div>
                  </div>
                ) : (
                  <div className="ml-2 p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex-1">
                    <p className="text-yellow-700 flex items-center">
                      <HelpCircle className="h-4 w-4 mr-1" />
                      No default SMTP configuration set. Please add a configuration in the SMTP tab.
                    </p>
                  </div>
                )}
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="smtp" id="smtp">
          <Card className="border-none shadow-lg rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-[#F9FAFB] to-white pb-4 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg font-semibold text-[#111827]">SMTP Configurations</CardTitle>
                  <CardDescription className="text-[#2C78E4]/70">
                    Manage email server configurations for sending emails from the system.
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => {
                    addConfigForm.reset();
                    setShowAddDialog(true);
                  }}
                  className="bg-[#2C78E4] hover:bg-[#2C78E4]/90 text-white rounded-xl"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Configuration
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isLoadingConfigs ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 text-[#2C78E4] animate-spin" />
                </div>
              ) : !smtpConfigs || smtpConfigs.length === 0 ? (
                <div className="bg-[#F9FAFB] p-8 text-center rounded-xl border border-dashed border-gray-200">
                  <h3 className="text-lg font-medium text-[#4B5563] mb-2">No SMTP Configurations</h3>
                  <p className="text-[#4B5563] mb-4">
                    Add your first SMTP configuration to start sending emails.
                  </p>
                  <Button 
                    onClick={() => {
                      addConfigForm.reset();
                      setShowAddDialog(true);
                    }}
                    className="bg-[#2C78E4] hover:bg-[#2C78E4]/90 rounded-xl"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Configuration
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {smtpConfigs.map((config) => (
                    <div 
                      key={config.id} 
                      className={`border rounded-xl p-4 ${
                        config.is_default ? 'border-green-300 bg-green-50' : 'border-[#F9FAFB]'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium text-[#111827]">{config.name}</h3>
                            {config.is_default && (
                              <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200 rounded-full">
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-[#4B5563] mt-1">{config.email}</p>
                          <p className="text-xs text-[#4B5563] mt-2">
                            Server: {config.smtp_host}:{config.smtp_port}
                          </p>
                          <p className="text-xs text-[#4B5563]/70 mt-1">
                            Last updated: {new Date(config.updated_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openTestDialog(config)}
                            className="text-xs py-1 px-2 h-auto rounded-lg"
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Test
                          </Button>
                          {!config.is_default && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs py-1 px-2 h-auto text-green-700 hover:text-green-800 hover:bg-green-50 rounded-lg"
                              onClick={() => handleSetAsDefault(config)}
                              disabled={isSettingDefault}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs py-1 px-2 h-auto text-amber-700 hover:text-amber-800 hover:bg-amber-50 rounded-lg"
                            onClick={() => openEditDialog(config)}
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          {!config.is_default && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs py-1 px-2 h-auto text-red-700 hover:text-red-800 hover:bg-red-50 rounded-lg"
                              onClick={() => openDeleteDialog(config)}
                            >
                              <Trash className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add SMTP Config Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add SMTP Configuration</DialogTitle>
            <DialogDescription>
              Add a new SMTP server configuration for sending emails.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={addConfigForm.handleSubmit(handleAddConfig)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Configuration Name</Label>
                  <Input
                    id="name"
                    {...addConfigForm.register("name")}
                    placeholder="Gmail SMTP"
                    className="rounded-xl border-[#2C78E4]/20 focus:border-[#2C78E4]"
                  />
                  {addConfigForm.formState.errors.name && (
                    <p className="text-xs text-red-500">{addConfigForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...addConfigForm.register("email")}
                    placeholder="your@email.com"
                    className="rounded-xl border-[#2C78E4]/20 focus:border-[#2C78E4]"
                  />
                  {addConfigForm.formState.errors.email && (
                    <p className="text-xs text-red-500">{addConfigForm.formState.errors.email.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password / App Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...addConfigForm.register("password")}
                  placeholder="••••••••"
                  className="rounded-xl border-[#2C78E4]/20 focus:border-[#2C78E4]"
                />
                <p className="text-xs text-[#4B5563]">
                  For Gmail, you may need to use an App Password. 
                  <a href="https://support.google.com/accounts/answer/185833" target="_blank" rel="noreferrer" className="text-[#2C78E4] hover:underline ml-1">
                    Learn more
                  </a>
                </p>
                {addConfigForm.formState.errors.password && (
                  <p className="text-xs text-red-500">{addConfigForm.formState.errors.password.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp_host">SMTP Host</Label>
                  <Input
                    id="smtp_host"
                    {...addConfigForm.register("smtp_host")}
                    placeholder="smtp.gmail.com"
                    className="rounded-xl border-[#2C78E4]/20 focus:border-[#2C78E4]"
                  />
                  {addConfigForm.formState.errors.smtp_host && (
                    <p className="text-xs text-red-500">{addConfigForm.formState.errors.smtp_host.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_port">SMTP Port</Label>
                  <Input
                    id="smtp_port"
                    {...addConfigForm.register("smtp_port")}
                    placeholder="587"
                    className="rounded-xl border-[#2C78E4]/20 focus:border-[#2C78E4]"
                  />
                  {addConfigForm.formState.errors.smtp_port && (
                    <p className="text-xs text-red-500">{addConfigForm.formState.errors.smtp_port.message}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_default"
                  checked={addConfigForm.watch("is_default")}
                  onCheckedChange={(checked) => {
                    addConfigForm.setValue("is_default", checked);
                  }}
                />
                <Label htmlFor="is_default" className="cursor-pointer">
                  Set as default configuration
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)} className="rounded-xl border-[#2C78E4]/20">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl bg-[#2C78E4] hover:bg-[#2C78E4]/90" disabled={isCreating}>
                {isCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Save Configuration
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit SMTP Config Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit SMTP Configuration</DialogTitle>
            <DialogDescription>
              Update the SMTP server configuration details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editConfigForm.handleSubmit(handleEditConfig)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_name">Configuration Name</Label>
                  <Input
                    id="edit_name"
                    {...editConfigForm.register("name")}
                    placeholder="Gmail SMTP"
                    className="rounded-xl border-[#2C78E4]/20 focus:border-[#2C78E4]"
                  />
                  {editConfigForm.formState.errors.name && (
                    <p className="text-xs text-red-500">{editConfigForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_email">Email Address</Label>
                  <Input
                    id="edit_email"
                    type="email"
                    {...editConfigForm.register("email")}
                    placeholder="your@email.com"
                    className="rounded-xl border-[#2C78E4]/20 focus:border-[#2C78E4]"
                  />
                  {editConfigForm.formState.errors.email && (
                    <p className="text-xs text-red-500">{editConfigForm.formState.errors.email.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_password">
                  Password / App Password <span className="text-xs text-[#4B5563]">(Leave empty to keep current)</span>
                </Label>
                <Input
                  id="edit_password"
                  type="password"
                  {...editConfigForm.register("password")}
                  placeholder="••••••••"
                  className="rounded-xl border-[#2C78E4]/20 focus:border-[#2C78E4]"
                />
                {editConfigForm.formState.errors.password && (
                  <p className="text-xs text-red-500">{editConfigForm.formState.errors.password.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_smtp_host">SMTP Host</Label>
                  <Input
                    id="edit_smtp_host"
                    {...editConfigForm.register("smtp_host")}
                    placeholder="smtp.gmail.com"
                    className="rounded-xl border-[#2C78E4]/20 focus:border-[#2C78E4]"
                  />
                  {editConfigForm.formState.errors.smtp_host && (
                    <p className="text-xs text-red-500">{editConfigForm.formState.errors.smtp_host.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_smtp_port">SMTP Port</Label>
                  <Input
                    id="edit_smtp_port"
                    {...editConfigForm.register("smtp_port")}
                    placeholder="587"
                    className="border-[#F9FAFB] focus:border-[#2C78E4] focus:ring-[#2C78E4] bg-[#F9FAFB] rounded-xl"
                    disabled
                    readOnly
                  />
                  <p className="text-xs text-[#4B5563] italic">Port cannot be changed</p>
                  {editConfigForm.formState.errors.smtp_port && (
                    <p className="text-xs text-red-500">{editConfigForm.formState.errors.smtp_port.message}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit_is_default"
                  checked={editConfigForm.watch("is_default")}
                  onCheckedChange={(checked) => {
                    editConfigForm.setValue("is_default", checked);
                  }}
                  disabled={selectedConfig?.is_default}
                />
                <Label htmlFor="edit_is_default" className={`cursor-pointer ${selectedConfig?.is_default ? 'text-[#4B5563]' : ''}`}>
                  Set as default configuration
                  {selectedConfig?.is_default && <span className="text-xs ml-2">(Already default)</span>}
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)} className="rounded-xl border-[#2C78E4]/20">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl bg-[#2C78E4] hover:bg-[#2C78E4]/90" disabled={isUpdating}>
                {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Update Configuration
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the SMTP configuration "{selectedConfig?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-[#2C78E4]/20">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfig}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Test SMTP Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Test SMTP Configuration</DialogTitle>
            <DialogDescription>
              Send a test email to verify your SMTP configuration works correctly.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-[#F9FAFB] p-3 rounded-xl mb-4">
            <div className="text-sm">
              <div><span className="font-semibold">Configuration:</span> {selectedConfig?.name}</div>
              <div><span className="font-semibold">Email:</span> {selectedConfig?.email}</div>
              <div><span className="font-semibold">Server:</span> {selectedConfig?.smtp_host}:{selectedConfig?.smtp_port}</div>
            </div>
          </div>
          
          {testResult && (
            <div className={`p-3 rounded-xl mb-4 ${
              testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start">
                {testResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                ) : (
                  <Trash className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                )}
                <div>
                  <p className={`font-medium ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                    {testResult.success ? 'Test successful!' : 'Test failed'}
                  </p>
                  <p className="text-sm mt-1">
                    {testResult.message}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={testEmailForm.handleSubmit(handleTestEmail)}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test_email">Send test email to</Label>
                <Input
                  id="test_email"
                  type="email"
                  {...testEmailForm.register("test_email")}
                  placeholder="recipient@example.com"
                  className="rounded-xl border-[#2C78E4]/20 focus:border-[#2C78E4]"
                />
                {testEmailForm.formState.errors.test_email && (
                  <p className="text-xs text-red-500">{testEmailForm.formState.errors.test_email.message}</p>
                )}
              </div>
              
              <div className="text-xs text-[#4B5563]">
                A test email will be sent to verify your SMTP configuration is working correctly.
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setShowTestDialog(false)} className="rounded-xl border-[#2C78E4]/20">
                Close
              </Button>
              <Button type="submit" className="rounded-xl bg-[#2C78E4] hover:bg-[#2C78E4]/90" disabled={testLoading}>
                {testLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Send Test Email
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;