import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as MedicalRecordService from '@/services/medical-record-services';
import { toast } from '@/hooks/use-toast';

export function useMedicalHistory() {
  const queryClient = useQueryClient();

  // Complete Medical History
  const getCompleteMedicalHistory = (petId: number) => {
    return useQuery({
      queryKey: ['completeMedicalHistory', petId],
      queryFn: () => MedicalRecordService.getCompleteMedicalHistory(petId),
    });
  };

  // Examination Queries & Mutations
  const createExamination = useMutation({
    mutationFn: MedicalRecordService.createExamination,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examinations'] });
      toast({
        title: 'Success',
        description: 'Examination created successfully',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create examination',
        variant: 'destructive',
      });
      console.error('Error creating examination:', error);
    },
  });

  const getExamination = (examinationId: number) => {
    return useQuery({
      queryKey: ['examination', examinationId],
      queryFn: () => MedicalRecordService.getExamination(examinationId),
      enabled: !!examinationId,
    });
  };

  const listExaminations = (filters?: {
    medical_history_id?: number;
    pet_id?: number;
    doctor_id?: number;
    date_from?: string;
    date_to?: string;
  }) => {
    return useQuery({
      queryKey: ['examinations', filters],
      queryFn: () => MedicalRecordService.listExaminations(filters),
    });
  };

  // Prescription Queries & Mutations
  const createPrescription = useMutation({
    mutationFn: MedicalRecordService.createPrescription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      toast({
        title: 'Success',
        description: 'Prescription created successfully',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create prescription',
        variant: 'destructive',
      });
      console.error('Error creating prescription:', error);
    },
  });

  const getPrescription = (prescriptionId: number) => {
    return useQuery({
      queryKey: ['prescription', prescriptionId],
      queryFn: () => MedicalRecordService.getPrescription(prescriptionId),
      enabled: !!prescriptionId,
    });
  };

  const listPrescriptions = (filters?: {
    medical_history_id?: number;
    examination_id?: number;
    pet_id?: number;
    doctor_id?: number;
    date_from?: string;
    date_to?: string;
  }) => {
    return useQuery({
      queryKey: ['prescriptions', filters],
      queryFn: () => MedicalRecordService.listPrescriptions(filters),
    });
  };

  // Test Result Queries & Mutations
  const createTestResult = useMutation({
    mutationFn: MedicalRecordService.createTestResult,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testResults'] });
      toast({
        title: 'Success',
        description: 'Test result created successfully',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create test result',
        variant: 'destructive',
      });
      console.error('Error creating test result:', error);
    },
  });

  const getTestResult = (testResultId: number) => {
    return useQuery({
      queryKey: ['testResult', testResultId],
      queryFn: () => MedicalRecordService.getTestResult(testResultId),
      enabled: !!testResultId,
    });
  };

  const listTestResults = (filters?: {
    medical_history_id?: number;
    examination_id?: number;
    pet_id?: number;
    doctor_id?: number;
    test_type?: string;
    date_from?: string;
    date_to?: string;
  }) => {
    return useQuery({
      queryKey: ['testResults', filters],
      queryFn: () => MedicalRecordService.listTestResults(filters),
    });
  };

  return {
    // Complete Medical History
    getCompleteMedicalHistory,
    
    // Examinations
    createExamination,
    getExamination,
    listExaminations,
    
    // Prescriptions
    createPrescription,
    getPrescription,
    listPrescriptions,
    
    // Test Results
    createTestResult,
    getTestResult,
    listTestResults,
  };
}