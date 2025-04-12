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
  petId?: string | number;
  currentStep: 'check-in' | 'examination' | 'soap' | 'diagnostic' | 'treatment' | 'prescription' | 'follow-up' | 'patient-details' | 'pending-lab' | 'records' | 'vaccination' | 'invoice';
  isNurseView?: boolean;
}

const WorkflowNavigation: React.FC<WorkflowNavigationProps> = ({ appointmentId, petId, currentStep, isNurseView = false }) => {
  const [, navigate] = useLocation();

  useEffect(() => {
    // Log props when component mounts or updates to help debug
    console.log("WorkflowNavigation props:", { appointmentId, petId, currentStep });
  }, [appointmentId, petId, currentStep]);

  // Chuẩn hóa các tham số thành chuỗi an toàn cho URL
  const safeAppointmentId = appointmentId || '';
  const safePetId = petId ? petId.toString() : '';

  // Tạo chuỗi query parameters cho URL
  const buildUrlParams = () => {
    const params = new URLSearchParams();
    if (safeAppointmentId) params.append('appointmentId', safeAppointmentId);
    if (safePetId) params.append('petId', safePetId);
    return params.toString() ? `?${params.toString()}` : '';
  };

  // Nurse workflow - only check-in step
  const nurseWorkflowSteps = [
    { id: 'check-in', label: 'Check-in', icon: UserRound, path: `/appointment/${safeAppointmentId}/check-in` },
  ];

  // Doctor workflow - starts with patient-management and continues with examination
  const doctorWorkflowSteps = [
    { id: 'patient-details', label: 'Patient Info', icon: ClipboardList, path: `/patient${buildUrlParams()}` },
    { id: 'examination', label: 'Examination', icon: Stethoscope, path: `/examination${buildUrlParams()}` },
    { id: 'soap', label: 'SOAP', icon: FileText, path: `/soap${buildUrlParams()}` },
    { id: 'diagnostic', label: 'Lab/Imaging', icon: FlaskConical, path: `/lab-management${buildUrlParams()}` },
    { id: 'treatment', label: 'Treatment', icon: Tablets, path: `/treatment${buildUrlParams()}` },
    { id: 'invoice', label: 'Invoice', icon: Receipt, path: `/invoice${buildUrlParams()}` },
    { id: 'records', label: 'Medical Records', icon: FileText, path: `/medical-records${buildUrlParams()}` },
  ];

  // Choose workflow based on role
  const workflowSteps = isNurseView ? nurseWorkflowSteps : doctorWorkflowSteps;

  const handleNavigation = (path: string) => {
    if (!path.includes("undefined") && !path.includes("/undefined")) {
      console.log("Navigating to:", path);
      navigate(path);
    } else {
      console.error("Navigation prevented: path contains undefined values", path);
    }
  };

  const activeIndex = workflowSteps.findIndex(step => step.id === currentStep);
  const progressPercentage = activeIndex !== -1 ? ((activeIndex + 1) / workflowSteps.length) * 100 : 0;
  
  // Get the current step icon component
  const CurrentStepIcon = activeIndex !== -1 ? workflowSteps[activeIndex].icon : undefined;

  return (
    <div className="workflow-navigation bg-white rounded-lg border border-indigo-100 shadow-sm p-4 mb-4">
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
            Workflow Steps
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Step {activeIndex !== -1 ? activeIndex + 1 : 0} of {workflowSteps.length}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        {/* Workflow steps */}
        <div className="relative flex items-center space-x-1 overflow-x-auto hide-scrollbar py-2 px-1">
          {workflowSteps.map((step, index) => {
            const isCurrent = step.id === currentStep;
            const isPast = index < activeIndex;
            const isFuture = index > activeIndex;
            const IconComponent = step.icon;
            
            return (
              <React.Fragment key={step.id}>
                <Button
                  variant={isCurrent ? "default" : "outline"}
                  size="sm"
                  className={`
                    flex items-center gap-1.5 whitespace-nowrap transition-all duration-200
                    ${isCurrent ? 'bg-indigo-600 text-white shadow-md border-transparent scale-105 hover:bg-indigo-700' : ''}
                    ${isPast ? 'border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : ''}
                    ${isFuture ? 'border-gray-200 text-gray-500 hover:border-indigo-200 hover:text-indigo-600' : ''}
                    ${!appointmentId && (step.id !== 'patient-details' && step.id !== 'records') ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  onClick={() => handleNavigation(step.path)}
                  disabled={!appointmentId && (step.id !== 'patient-details' && step.id !== 'records')}
                >
                  <IconComponent className={`h-4 w-4 ${isCurrent ? 'text-white' : isPast ? 'text-indigo-500' : 'text-gray-400'}`} />
                  <span className="hidden sm:inline text-xs font-medium">{step.label}</span>
                </Button>
                
                {index < workflowSteps.length - 1 && (
                  <ChevronRight className={`h-4 w-4 flex-shrink-0 ${
                    index < activeIndex ? 'text-indigo-400' : 'text-gray-300'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Current step indicator */}
        <div className="text-center bg-indigo-50 py-2 px-4 rounded-md border border-indigo-100">
          <div className="flex items-center justify-center gap-2">
            {CurrentStepIcon && <CurrentStepIcon className="h-5 w-5 text-indigo-600" />}
            <span className="text-sm font-medium text-indigo-700">
              Current: {activeIndex !== -1 ? workflowSteps[activeIndex].label : 'Unknown Step'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowNavigation; 