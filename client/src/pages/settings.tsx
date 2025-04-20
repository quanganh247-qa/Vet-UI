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
        </TabsList>

        <TabsContent value="mail">
          <Card>
            <CardHeader>
              <CardTitle>Mail Settings</CardTitle>
              <CardDescription>Configure common settings for sending emails.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="senderName" className="mb-1 block">
                      Sender name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="senderName"
                      {...register("senderName")}
                      placeholder="Support"
                      aria-invalid={!!errors.senderName}
                    />
                    {errors.senderName && (
                      <p className="text-sm text-red-500 mt-1">{errors.senderName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="senderAddress" className="mb-1 block">
                      Sender address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="senderAddress"
                      type="email"
                      {...register("senderAddress")}
                      placeholder="support@example.com"
                      aria-invalid={!!errors.senderAddress}
                    />
                    {errors.senderAddress && (
                      <p className="text-sm text-red-500 mt-1">{errors.senderAddress.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-6">
                  <Switch
                    id="useSmtp"
                    checked={useSmtp}
                    onCheckedChange={(checked) => {
                      register("useSmtp").onChange({ target: { value: checked } });
                    }}
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

                {useSmtp && (
                  <div className="grid grid-cols-1 gap-4 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="smtpHost" className="mb-1 block">
                          SMTP server host <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="smtpHost"
                          {...register("smtpHost")}
                          placeholder="smtp.example.com"
                          aria-invalid={!!errors.smtpHost}
                        />
                        {errors.smtpHost && (
                          <p className="text-sm text-red-500 mt-1">{errors.smtpHost.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="smtpPort" className="mb-1 block">
                          Port <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="smtpPort"
                          {...register("smtpPort")}
                          placeholder="587"
                          aria-invalid={!!errors.smtpPort}
                        />
                        {errors.smtpPort && (
                          <p className="text-sm text-red-500 mt-1">{errors.smtpPort.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="smtpUsername" className="mb-1 block">
                          Username
                        </Label>
                        <Input
                          id="smtpUsername"
                          {...register("smtpUsername")}
                          placeholder="Your SMTP username"
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtpPassword" className="mb-1 block">
                          Password
                        </Label>
                        <Input
                          id="smtpPassword"
                          type="password"
                          {...register("smtpPassword")}
                          placeholder="Your SMTP password"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="text-sm"
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

                <div className="flex justify-between mt-6">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => reset()}
                    disabled={!isDirty || isLoading}
                  >
                    Reset
                  </Button>
                  <Button type="submit" disabled={!isDirty || isLoading}>
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