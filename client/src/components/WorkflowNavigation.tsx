import React from 'react';
import { useLocation } from 'wouter';
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
  Syringe,
  Heart
} from 'lucide-react';

interface WorkflowNavigationProps {
  appointmentId?: string;
  petId?: string | number;
  currentStep: 'check-in' | 'examination' | 'soap' | 'diagnostic' | 'treatment' | 'prescription' | 'follow-up' | 'patient-details' | 'pending-lab' | 'records' | 'vaccination' | 'invoice' | 'health-card';
  isNurseView?: boolean;
}

const WorkflowNavigation: React.FC<WorkflowNavigationProps> = ({ appointmentId, petId, currentStep, isNurseView = false }) => {
  const [, navigate] = useLocation();

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

  // Doctor workflow - starts with patient-management and continues with examination
  const workflowSteps = [
    // { id: 'patient-details', label: 'Patient', icon: ClipboardList, path: `/patient${buildUrlParams()}` },
    { id: 'health-card', label: 'Health Card', icon: Heart, path: `/patient/health-card${buildUrlParams()}` },
    { id: 'examination', label: 'Exam', icon: Stethoscope, path: `/examination${buildUrlParams()}` },
    { id: 'soap', label: 'SOAP', icon: FileText, path: `/soap${buildUrlParams()}` },
    { id: 'diagnostic', label: 'Tests', icon: FlaskConical, path: `/lab-management${buildUrlParams()}` },
    { id: 'treatment', label: 'Treatment', icon: Tablets, path: `/treatment${buildUrlParams()}` },
    { id: 'vaccination', label: 'Vaccine', icon: Syringe, path: `/vaccination${buildUrlParams()}` },
  ];

  const handleNavigation = (path: string) => {
    if (!path.includes("undefined") && !path.includes("/undefined")) {
      navigate(path);
    }
  };

  const activeIndex = workflowSteps.findIndex(step => step.id === currentStep);
  
  return (
    <div className="bg-white border-b border-gray-200 py-2">
      <div className="flex justify-center">
        <div className="flex space-x-1">
          {workflowSteps.map((step, index) => {
            const isCurrent = step.id === currentStep;
            const isPast = index < activeIndex;
            const isDisabled = !appointmentId && (step.id !== 'patient-details' && step.id !== 'health-card');
            const IconComponent = step.icon;
            
            return (
              <div 
                key={step.id}
                className={`
                  flex flex-col items-center cursor-pointer px-4 py-2 rounded-md transition-all
                  ${isCurrent ? 'bg-indigo-100 text-indigo-800' : ''}
                  ${isPast ? 'text-indigo-600' : 'text-gray-500'}
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}
                `}
                onClick={() => !isDisabled && handleNavigation(step.path)}
              >
                <IconComponent className={`h-5 w-5 mb-1 ${isCurrent ? 'text-indigo-600' : isPast ? 'text-indigo-500' : 'text-gray-400'}`} />
                <span className="text-xs font-medium">{step.label}</span>
                {isCurrent && <div className="h-1 w-8 bg-indigo-600 rounded-full mt-1"></div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkflowNavigation;