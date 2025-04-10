import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  UserRound, 
  ClipboardCheck, 
  Stethoscope, 
  Tablets, 
  FileClock,
  FileText,
  ChevronRight,
  UserCircle,
  Receipt,
  FlaskConical,
  CalendarClock,
  ClipboardList,
  Syringe
} from 'lucide-react';

interface WorkflowNavigationProps {
  appointmentId?: string;
  petId?: string;
  currentStep: 'check-in' | 'examination' | 'soap' | 'diagnostic' | 'treatment' | 'prescription' | 'follow-up' | 'patient-details' | 'pending-lab' | 'records' | 'vaccination';
  isNurseView?: boolean;
}

const WorkflowNavigation: React.FC<WorkflowNavigationProps> = ({ appointmentId, petId, currentStep, isNurseView = false }) => {
  const [, navigate] = useLocation();

  useEffect(() => {
    // Log props when component mounts or updates to help debug
    console.log("WorkflowNavigation props:", { appointmentId, petId, currentStep });
  }, [appointmentId, petId, currentStep]);

  // Nurse workflow - only check-in step
  const nurseWorkflowSteps = [
    { id: 'check-in', label: 'Check-in', icon: UserRound, path: `/appointment/${appointmentId}/check-in` },
  ];

  // Doctor workflow - starts with patient-management and continues with examination
  const doctorWorkflowSteps = [
    { id: 'patient-details', label: 'Patient Info', icon: ClipboardList, path: `/appointment/${appointmentId}` },
    { id: 'examination', label: 'Examination', icon: Stethoscope, path: `/appointment/${appointmentId}/examination` },
    { id: 'vaccination', label: 'Vaccination', icon: Syringe, path: `/appointment/${appointmentId}/vaccination` },
    { id: 'soap', label: 'SOAP', icon: FileText, path: `/appointment/${appointmentId}/soap` },
    { id: 'diagnostic', label: 'Lab/Imaging', icon: FlaskConical, path: `/appointment/${appointmentId}/lab-management` },
    { id: 'treatment', label: 'Treatment', icon: Tablets, path: `/appointment/${appointmentId}/patient/${petId}/treatment?appointmentId=${appointmentId}` },
    { id: 'records', label: 'Medical Records', icon: FileText, path: `/appointment/${appointmentId}/patient/${petId}/medical-records?appointmentId=${appointmentId}` },
    // { id: 'prescription', label: 'Prescription', icon: Receipt, path: `/appointment/${appointmentId}/prescription` },
    // { id: 'follow-up', label: 'Follow-up', icon: CalendarClock, path: `/appointment/${appointmentId}/follow-up` },
  ];

  // Choose workflow based on role
  const workflowSteps = isNurseView ? nurseWorkflowSteps : doctorWorkflowSteps;

  const handleNavigation = (path: string) => {
    console.log("Navigating to:", path);
    if (!path.includes("undefined")) {
      navigate(path);
    } else {
      console.error("Navigation prevented: path contains undefined values", path);
    }
  };

  const activeIndex = workflowSteps.findIndex(step => step.id === currentStep);
  const progressPercentage = activeIndex !== -1 ? ((activeIndex + 1) / workflowSteps.length) * 100 : 0;

  return (
    <div className="workflow-navigation bg-white shadow-sm rounded-lg border border-gray-200 p-2 mb-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-gray-500 uppercase pl-2">Workflow</div>
        
        <div className="flex items-center space-x-1 overflow-x-auto hide-scrollbar">
          {workflowSteps.map((step, index) => {
            const isCurrent = step.id === currentStep;
            const IconComponent = step.icon;
            
            return (
              <React.Fragment key={step.id}>
                <Button
                  variant={isCurrent ? "default" : "outline"}
                  size="sm"
                  className={`flex items-center gap-1 ${isCurrent ? 'bg-indigo-600 text-white' : 'text-gray-700'}`}
                  onClick={() => handleNavigation(step.path)}
                  disabled={!appointmentId && (step.id !== 'patient-details' && step.id !== 'records')}
                >
                  <IconComponent className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{step.label}</span>
                </Button>
                
                {index < workflowSteps.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      {/* Progress Indicator */}
      <div className="w-full bg-gray-200 h-2 rounded-full mt-4">
        <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
      </div>
    </div>
  );
};

export default WorkflowNavigation; 