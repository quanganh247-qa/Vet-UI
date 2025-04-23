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
import { ClipboardCheck, Stethoscope, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useMedicalHistory } from '@/hooks/use-medical-history';
import { ExaminationRequest } from '@/services/medical-record-services';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ExaminationFormProps {
  medicalHistoryId: number;
  petId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ExaminationForm({ 
  medicalHistoryId, 
  petId, 
  onSuccess, 
  onCancel 
}: ExaminationFormProps) {
  const { createExamination } = useMedicalHistory();
  const { data: doctorData } = useDoctor();

  const [formData, setFormData] = useState<ExaminationRequest>({
    medical_history_id: medicalHistoryId,
    exam_date: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    exam_type: '',
    findings: '',
    vet_notes: '',
    doctor_id: doctorData?.id || 0
  });

  const [errors, setErrors] = useState<{
    exam_type?: string;
    findings?: string;
    doctor_id?: string;
  }>({});

  const [touched, setTouched] = useState<{
    exam_type: boolean;
    findings: boolean;
    doctor_id: boolean;
  }>({
    exam_type: false,
    findings: false,
    doctor_id: false
  });

  const examTypes = [
    'General Check-up',
    'Annual Wellness',
    'Urgent Care',
    'Post-operative',
    'Specialist Consult',
    'Dental',
    'Emergency',
    'Follow-up'
  ];

  const handleChange = (field: keyof ExaminationRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    
    // Validate field
    validateField(field, value);
  };
  
  const validateField = (field: keyof ExaminationRequest, value: any) => {
    let newErrors = { ...errors };
    
    switch (field) {
      case 'exam_type':
        if (!value) {
          newErrors.exam_type = 'Examination type is required';
        } else {
          delete newErrors.exam_type;
        }
        break;
      case 'findings':
        if (!value) {
          newErrors.findings = 'Findings are required';
        } else {
          delete newErrors.findings;
        }
        break;
      case 'doctor_id':
        if (!value || value === 0) {
          newErrors.doctor_id = 'Doctor is required';
        } else {
          delete newErrors.doctor_id;
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateForm = () => {
    const fieldsToValidate: (keyof ExaminationRequest)[] = ['exam_type', 'findings', 'doctor_id'];
    let isValid = true;
    
    fieldsToValidate.forEach(field => {
      const fieldValid = validateField(field, formData[field]);
      isValid = isValid && fieldValid;
      
      // Mark all fields as touched to show errors
      setTouched(prev => ({
        ...prev,
        [field]: true
      }));
    });
    
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    createExamination.mutate(formData, {
      onSuccess: () => {
        onSuccess?.();
      }
    });
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
        <CardTitle className="flex items-center">
          <Stethoscope className="mr-2 h-5 w-5 text-blue-600" />
          New Examination
        </CardTitle>
        <CardDescription>
          Record a new examination for this patient
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          {createExamination.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {createExamination.error instanceof Error 
                  ? createExamination.error.message 
                  : 'Failed to create examination'}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-1">
            <Label htmlFor="exam_type">
              Examination Type <span className="text-red-500">*</span>
            </Label>
            <Select 
              onValueChange={(value) => handleChange('exam_type', value)}
              defaultValue={formData.exam_type}
            >
              <SelectTrigger 
                className={touched.exam_type && errors.exam_type ? 'border-red-500' : ''}
              >
                <SelectValue placeholder="Select examination type" />
              </SelectTrigger>
              <SelectContent>
                {examTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {touched.exam_type && errors.exam_type && (
              <p className="text-xs text-red-500 mt-1">{errors.exam_type}</p>
            )}
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="exam_date">
              Examination Date & Time
            </Label>
            <Input 
              id="exam_date" 
              type="datetime-local"
              value={formData.exam_date.replace(' ', 'T')}
              onChange={(e) => handleChange('exam_date', e.target.value.replace('T', ' '))}
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="findings">
              Findings <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="findings"
              placeholder="Enter examination findings"
              className={`min-h-[120px] ${touched.findings && errors.findings ? 'border-red-500' : ''}`}
              value={formData.findings}
              onChange={(e) => handleChange('findings', e.target.value)}
            />
            {touched.findings && errors.findings && (
              <p className="text-xs text-red-500 mt-1">{errors.findings}</p>
            )}
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="vet_notes">
              Veterinarian Notes
            </Label>
            <Textarea
              id="vet_notes"
              placeholder="Additional notes for the record (optional)"
              className="min-h-[100px]"
              value={formData.vet_notes || ''}
              onChange={(e) => handleChange('vet_notes', e.target.value)}
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="doctor_id">
              Examining Doctor <span className="text-red-500">*</span>
            </Label>
            <Input 
              id="doctor_id" 
              type="number"
              className={touched.doctor_id && errors.doctor_id ? 'border-red-500' : ''}
              value={formData.doctor_id}
              onChange={(e) => handleChange('doctor_id', parseInt(e.target.value) || 0)}
              disabled={!!doctorData}
            />
            {touched.doctor_id && errors.doctor_id && (
              <p className="text-xs text-red-500 mt-1">{errors.doctor_id}</p>
            )}
            {doctorData && (
              <p className="text-xs text-gray-500 mt-1">
                Dr. {doctorData.name}
              </p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={createExamination.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {createExamination.isPending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Saving...
              </>
            ) : (
              <>
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Save Examination
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function useDoctor(): { data: any; } {
    throw new Error('Function not implemented.');
}
