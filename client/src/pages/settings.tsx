import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { Link } from "wouter";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

// Define types for mail settings
interface MailSettings {
  senderName: string;
  senderAddress: string;
  useSmtp: boolean;
  smtpHost: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;
  encryption: "tls" | "ssl";
  authentication: boolean;
}

// Validation schema
const mailSettingsSchema = z.object({
  senderName: z.string().min(1, "Sender name is required"),
  senderAddress: z.string().email("Invalid email address"),
  useSmtp: z.boolean(),
  smtpHost: z.string(),
  smtpPort: z.string(),
  smtpUsername: z.string().optional(),
  smtpPassword: z.string().optional(),
  encryption: z.enum(["tls", "ssl"]),
  authentication: z.boolean()
}).refine((data) => {
  if (data.useSmtp && !data.smtpHost) {
    return false;
  }
  return true;
}, {
  message: "SMTP host is required when using SMTP",
  path: ["smtpHost"]
}).refine((data) => {
  if (data.useSmtp) {
    if (!data.smtpPort) {
      return false;
    }
    if (!/^\d+$/.test(data.smtpPort)) {
      return false;
    }
  }
  return true;
}, {
  message: "Port must be a valid number when using SMTP",
  path: ["smtpPort"]
});

const Settings = () => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty }
  } = useForm<MailSettings>({
    resolver: zodResolver(mailSettingsSchema),
    defaultValues: {
      senderName: "Support",
      senderAddress: "support@example.com",
      useSmtp: true,
      smtpHost: "smtp.example.com",
      smtpPort: "587",
      smtpUsername: "",
      smtpPassword: "",
      encryption: "tls",
      authentication: true
    }
  });

  const useSmtp = watch("useSmtp");

  const onSubmit = async (data: MailSettings) => {
    try {
      setIsLoading(true);
      // Here you would typically save the settings to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      toast.success("Mail settings saved successfully");
    } catch (error) {
      toast.error("Failed to save mail settings");
      console.error("Error saving mail settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setIsLoading(true);
      // Here you would typically test the SMTP connection
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      toast.success("SMTP connection test successful");
    } catch (error) {
      toast.error("SMTP connection test failed");
      console.error("Error testing SMTP connection:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 rounded-xl shadow-md mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
          </div>
        </div>
      </div>

      <Tabs defaultValue="mail" className="space-y-6">
        <TabsList className="bg-white/5 p-1 rounded-lg border border-gray-100 shadow-sm">
          <TabsTrigger value="mail" className="text-sm font-medium">Mail Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="mail">
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-white pb-4 border-b">
              <CardTitle className="text-lg font-semibold text-indigo-900">Mail Settings</CardTitle>
              <CardDescription className="text-indigo-600/70">
                Configure common settings for sending emails.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="senderName" className="text-sm font-medium text-gray-700">
                      Sender name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="senderName"
                      {...register("senderName")}
                      placeholder="Support"
                      className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                      aria-invalid={!!errors.senderName}
                    />
                    {errors.senderName && (
                      <p className="text-sm text-red-500">{errors.senderName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senderAddress" className="text-sm font-medium text-gray-700">
                      Sender address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="senderAddress"
                      type="email"
                      {...register("senderAddress")}
                      placeholder="support@example.com"
                      className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                      aria-invalid={!!errors.senderAddress}
                    />
                    {errors.senderAddress && (
                      <p className="text-sm text-red-500">{errors.senderAddress.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 py-4 px-4 bg-gray-50 rounded-lg">
                  <Switch
                    id="useSmtp"
                    checked={useSmtp}
                    onCheckedChange={(checked) => {
                      register("useSmtp").onChange({ target: { value: checked } });
                    }}
                    className="data-[state=checked]:bg-indigo-600"
                  />
                  <Label htmlFor="useSmtp" className="flex items-center cursor-pointer">
                    <span className="font-medium">Use SMTP mail server</span>
                    <span className="text-sm text-gray-500 ml-2">(recommended)</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-gray-400 ml-1" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-white border border-gray-200 shadow-lg">
                          <p className="w-80 text-sm">
                            Using an SMTP server is recommended for reliable email delivery.
                            If disabled, the system will use the default PHP mail function.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                </div>

                {useSmtp && (
                  <div className="space-y-6 bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="smtpHost" className="text-sm font-medium text-gray-700">
                          SMTP server host <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="smtpHost"
                          {...register("smtpHost")}
                          placeholder="smtp.example.com"
                          className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                          aria-invalid={!!errors.smtpHost}
                        />
                        {errors.smtpHost && (
                          <p className="text-sm text-red-500">{errors.smtpHost.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpPort" className="text-sm font-medium text-gray-700">
                          Port <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="smtpPort"
                          {...register("smtpPort")}
                          placeholder="587"
                          className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                          aria-invalid={!!errors.smtpPort}
                        />
                        {errors.smtpPort && (
                          <p className="text-sm text-red-500">{errors.smtpPort.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="smtpUsername" className="text-sm font-medium text-gray-700">
                          Username
                        </Label>
                        <Input
                          id="smtpUsername"
                          {...register("smtpUsername")}
                          placeholder="Your SMTP username"
                          className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpPassword" className="text-sm font-medium text-gray-700">
                          Password
                        </Label>
                        <Input
                          id="smtpPassword"
                          type="password"
                          {...register("smtpPassword")}
                          placeholder="Your SMTP password"
                          className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="text-sm hover:bg-indigo-50"
                        onClick={handleTestConnection}
                        disabled={isLoading}
                      >
                        {isLoading ? "Testing..." : "Test Connection"}
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">
                        Test if the SMTP server is working correctly.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-6 border-t">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => reset()}
                    disabled={!isDirty || isLoading}
                    className="hover:bg-indigo-50"
                  >
                    Reset
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={!isDirty || isLoading}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isLoading ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;