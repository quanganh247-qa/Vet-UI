import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Loader2, CheckCircle2, ClipboardList, FilePlus2, Stethoscope } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { useMedicalHistory } from '@/hooks/use-medical-history';
import { useCreateMedicalRecord } from '@/hooks/use-medical-record';
import { 
  ExaminationRequest, 
  MedicalHistoryRequest 
} from '@/services/medical-record-services';
import { Stepper, Step } from '@/components/ui/stepper';

interface SmartMedicalEntryFormProps {
  petId: number;
  doctorId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SmartMedicalEntryForm({
  petId,
  doctorId,
  onSuccess,
  onCancel
}: SmartMedicalEntryFormProps) {
  const { createExamination } = useMedicalHistory();
  const createMedicalRecord = useCreateMedicalRecord(petId);
  
  // Form states
  const [currentStep, setCurrentStep] = useState(0);
  const [medicalRecordId, setMedicalRecordId] = useState<number | null>(null);
  
  // Step 1: Medical History Record
  const [medicalHistoryForm, setMedicalHistoryForm] = useState<MedicalHistoryRequest>({
    condition: '',
    diagnosis_date: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    notes: ''
  });
  
  // Step 2: Examination Details
  const [examinationForm, setExaminationForm] = useState<ExaminationRequest>({
    medical_history_id: 0,
    exam_date: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    exam_type: '',
    findings: '',
    vet_notes: '',
    doctor_id: doctorId
  });
  
  // Form validation
  const [medicalHistoryErrors, setMedicalHistoryErrors] = useState<{
    condition?: string;
  }>({});
  
  const [examinationErrors, setExaminationErrors] = useState<{
    exam_type?: string;
    findings?: string;
  }>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Examination types for dropdown
  const examTypes = [
    'General Check-up',
    'Annual Wellness',
    'Follow-up',
    'Emergency',
    'Specialist Consult',
    'Pre-surgery',
    'Post-surgery',
    'Dental',
    'Vaccination'
  ];
  
  // Handle medical history form changes
  const handleMedicalHistoryChange = (field: keyof MedicalHistoryRequest, value: string) => {
    setMedicalHistoryForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Validate
    if (field === 'condition' && !value) {
      setMedicalHistoryErrors(prev => ({
        ...prev,
        condition: 'Condition is required'
      }));
    } else if (field === 'condition') {
      setMedicalHistoryErrors(prev => ({
        ...prev,
        condition: undefined
      }));
    }
  };
  
  // Handle examination form changes
  const handleExaminationChange = (field: keyof ExaminationRequest, value: string) => {
    setExaminationForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Validate
    if (field === 'exam_type' && !value) {
      setExaminationErrors(prev => ({
        ...prev,
        exam_type: 'Examination type is required'
      }));
    } else if (field === 'exam_type') {
      setExaminationErrors(prev => ({
        ...prev,
        exam_type: undefined
      }));
    }
    
    if (field === 'findings' && !value) {
      setExaminationErrors(prev => ({
        ...prev,
        findings: 'Findings are required'
      }));
    } else if (field === 'findings') {
      setExaminationErrors(prev => ({
        ...prev,
        findings: undefined
      }));
    }
  };
  
  // Validate medical history form
  const validateMedicalHistoryForm = () => {
    const errors: { condition?: string } = {};
    
    if (!medicalHistoryForm.condition) {
      errors.condition = 'Condition is required';
    }
    
    setMedicalHistoryErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Validate examination form
  const validateExaminationForm = () => {
    const errors: { exam_type?: string; findings?: string } = {};
    
    if (!examinationForm.exam_type) {
      errors.exam_type = 'Examination type is required';
    }
    
    if (!examinationForm.findings) {
      errors.findings = 'Findings are required';
    }
    
    setExaminationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle continue to next step
  const handleContinue = async () => {
    if (currentStep === 0) {
      // Validate medical history form
      if (!validateMedicalHistoryForm()) {
        return;
      }
      
      setIsSubmitting(true);
      
      try {
        // Create medical history record
        const result = await createMedicalRecord.mutateAsync(medicalHistoryForm);
        const newRecordId = result.id || result.medical_history_id;
        
        if (!newRecordId) {
          throw new Error("Failed to get medical history record ID");
        }
        
        setMedicalRecordId(newRecordId);
        setExaminationForm(prev => ({
          ...prev,
          medical_history_id: newRecordId
        }));
        
        setCurrentStep(1);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create medical history record",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    } else if (currentStep === 1) {
      // Validate examination form
      if (!validateExaminationForm()) {
        return;
      }
      
      setIsSubmitting(true);
      
      try {
        // Create examination
        await createExamination.mutateAsync(examinationForm);
        
        toast({
          title: "Success",
          description: "Medical record and examination created successfully",
        });
        
        // Call success callback
        onSuccess?.();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create examination",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  // Go back to previous step
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Cancel form
  const handleCancel = () => {
    onCancel?.();
  };
  
  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <CardTitle className="text-lg text-indigo-900 flex items-center">
          {currentStep === 0 ? (
            <>
              <FilePlus2 className="mr-2 h-5 w-5 text-indigo-600" />
              Create Medical Record
            </>
          ) : (
            <>
              <Stethoscope className="mr-2 h-5 w-5 text-indigo-600" />
              Add Examination Details
            </>
          )}
        </CardTitle>
        <CardDescription>
          {currentStep === 0 
            ? "Step 1: Enter the patient's condition and medical history details" 
            : "Step 2: Record the examination findings and details"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Progress stepper */}
        <div className="mb-6">
          <Stepper 
            currentStep={currentStep} 
            className="mb-10"
          >
            <Step status={currentStep === 0 ? 'current' : 'complete'}>
              Medical Record
            </Step>
            <Step status={currentStep === 0 ? 'upcoming' : 'current'}>
              Examination
            </Step>
          </Stepper>
        </div>
        
        {/* Step 1: Medical History Form */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="condition">
                Condition / Diagnosis <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="condition"
                value={medicalHistoryForm.condition}
                onChange={(e) => handleMedicalHistoryChange('condition', e.target.value)}
                placeholder="Enter condition or diagnosis"
                className={medicalHistoryErrors.condition ? "border-red-500" : ""}
              />
              {medicalHistoryErrors.condition && (
                <p className="text-sm text-red-500">{medicalHistoryErrors.condition}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="diagnosis_date">Diagnosis Date</Label>
              <Input 
                id="diagnosis_date"
                type="datetime-local"
                value={medicalHistoryForm.diagnosis_date.replace(' ', 'T')}
                onChange={(e) => handleMedicalHistoryChange('diagnosis_date', e.target.value.replace('T', ' '))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea 
                id="notes"
                value={medicalHistoryForm.notes}
                onChange={(e) => handleMedicalHistoryChange('notes', e.target.value)}
                placeholder="Enter any additional notes about the condition"
                rows={4}
              />
            </div>
          </div>
        )}
        
        {/* Step 2: Examination Form */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exam_type">
                Examination Type <span className="text-red-500">*</span>
              </Label>
              <Select 
                onValueChange={(value) => handleExaminationChange('exam_type', value)}
                defaultValue={examinationForm.exam_type}
              >
                <SelectTrigger className={examinationErrors.exam_type ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select examination type" />
                </SelectTrigger>
                <SelectContent>
                  {examTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {examinationErrors.exam_type && (
                <p className="text-sm text-red-500">{examinationErrors.exam_type}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="exam_date">Examination Date</Label>
              <Input 
                id="exam_date"
                type="datetime-local"
                value={examinationForm.exam_date.replace(' ', 'T')}
                onChange={(e) => handleExaminationChange('exam_date', e.target.value.replace('T', ' '))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="findings">
                Findings <span className="text-red-500">*</span>
              </Label>
              <Textarea 
                id="findings"
                value={examinationForm.findings}
                onChange={(e) => handleExaminationChange('findings', e.target.value)}
                placeholder="Enter examination findings"
                rows={4}
                className={examinationErrors.findings ? "border-red-500" : ""}
              />
              {examinationErrors.findings && (
                <p className="text-sm text-red-500">{examinationErrors.findings}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vet_notes">Veterinarian Notes</Label>
              <Textarea 
                id="vet_notes"
                value={examinationForm.vet_notes || ""}
                onChange={(e) => handleExaminationChange('vet_notes', e.target.value)}
                placeholder="Enter any additional notes from the examination"
                rows={3}
              />
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-6 bg-gray-50">
        <div>
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              Back
            </Button>
          )}
          {currentStep === 0 && (
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          )}
        </div>
        
        <Button
          onClick={handleContinue}
          disabled={isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {currentStep === 0 ? 'Saving...' : 'Finalizing...'}
            </>
          ) : (
            <>
              {currentStep === 0 ? (
                <>
                  Continue
                  <ClipboardList className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Complete Entry
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                </>
              )}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}