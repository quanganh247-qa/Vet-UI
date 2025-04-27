import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  emailSettingsService, 
  SMTPConfig, 
  CreateSMTPConfigRequest, 
  UpdateSMTPConfigRequest,
  TestSMTPConfigRequest,
  TestSMTPConfigResponse
} from '@/services/email-settings-services';
import { useToast } from '@/hooks/use-toast';

export const useEmailSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestSMTPConfigResponse | null>(null);

  // Query to fetch all SMTP configurations
  const { 
    data: smtpConfigs,
    isLoading: isLoadingConfigs,
    error: configsError,
    refetch: refetchConfigs
  } = useQuery({
    queryKey: ['smtp-configs'],
    queryFn: emailSettingsService.listSMTPConfigs
  });

  // Query to fetch the default SMTP configuration
  const {
    data: defaultConfig,
    isLoading: isLoadingDefault,
    error: defaultConfigError,
    refetch: refetchDefault
  } = useQuery({
    queryKey: ['default-smtp-config'],
    queryFn: emailSettingsService.getDefaultSMTPConfig
  });

  // Mutation to create a new SMTP configuration
  const createConfigMutation = useMutation({
    mutationFn: (data: CreateSMTPConfigRequest) => 
      emailSettingsService.createSMTPConfig(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "SMTP configuration created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['smtp-configs'] });
      queryClient.invalidateQueries({ queryKey: ['default-smtp-config'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create SMTP configuration",
        variant: "destructive",
      });
      console.error("Create config error:", error);
    }
  });

  // Mutation to update an existing SMTP configuration
  const updateConfigMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: UpdateSMTPConfigRequest }) =>
      emailSettingsService.updateSMTPConfig(id, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "SMTP configuration updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['smtp-configs'] });
      queryClient.invalidateQueries({ queryKey: ['default-smtp-config'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update SMTP configuration",
        variant: "destructive",
      });
      console.error("Update config error:", error);
    }
  });

  // Mutation to delete a SMTP configuration
  const deleteConfigMutation = useMutation({
    mutationFn: (id: number) => emailSettingsService.deleteSMTPConfig(id),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "SMTP configuration deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['smtp-configs'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete SMTP configuration. Note that you cannot delete the default configuration.",
        variant: "destructive",
      });
      console.error("Delete config error:", error);
    }
  });

  // Mutation to set a configuration as default
  const setAsDefaultMutation = useMutation({
    mutationFn: (id: number) => emailSettingsService.setDefaultSMTPConfig(id),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Default SMTP configuration updated",
      });
      queryClient.invalidateQueries({ queryKey: ['smtp-configs'] });
      queryClient.invalidateQueries({ queryKey: ['default-smtp-config'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to set default SMTP configuration",
        variant: "destructive",
      });
      console.error("Set default error:", error);
    }
  });

  // Function to test a SMTP configuration
  const testSMTPConfig = async (data: TestSMTPConfigRequest): Promise<TestSMTPConfigResponse> => {
    setTestLoading(true);
    setTestResult(null);
    
    try {
      const result = await emailSettingsService.testSMTPConfig(data);
      setTestResult(result);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "SMTP test successful! Test email sent.",
        });
      } else {
        toast({
          title: "Failed",
          description: `SMTP test failed: ${result.message}`,
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      const errorResult = {
        success: false,
        message: "An error occurred during the test."
      };
      setTestResult(errorResult);
      
      toast({
        title: "Error",
        description: "Failed to test SMTP configuration",
        variant: "destructive",
      });
      console.error("Test SMTP error:", error);
      
      return errorResult;
    } finally {
      setTestLoading(false);
    }
  };

  // Get a specific SMTP configuration by ID
  const getConfigById = async (id: number): Promise<SMTPConfig | null> => {
    try {
      return await emailSettingsService.getSMTPConfig(id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch SMTP configuration",
        variant: "destructive",
      });
      console.error("Get config error:", error);
      return null;
    }
  };

  return {
    // Data
    smtpConfigs,
    defaultConfig,
    testResult,
    
    // Loading states
    isLoadingConfigs,
    isLoadingDefault,
    isCreating: createConfigMutation.isPending,
    isUpdating: updateConfigMutation.isPending,
    isDeleting: deleteConfigMutation.isPending,
    isSettingDefault: setAsDefaultMutation.isPending,
    testLoading,
    
    // Errors
    configsError,
    defaultConfigError,
    
    // Functions
    createConfig: createConfigMutation.mutate,
    updateConfig: updateConfigMutation.mutate,
    deleteConfig: deleteConfigMutation.mutate,
    setAsDefault: setAsDefaultMutation.mutate,
    testSMTPConfig,
    getConfigById,
    refetchConfigs,
    refetchDefault
  };
};