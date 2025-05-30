import React from 'react';
import { useLocation } from 'wouter';
import { 
  Check,
  Calendar,
  FileText as FileTextIcon,
  ShieldCheck,
  Clock,
  Activity
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
    { id: 'health-card', label: 'Health Card', icon: Activity, path: `/patient/health-card${buildUrlParams()}` },
    { id: 'examination', label: 'Exam', icon: Calendar, path: `/examination${buildUrlParams()}` },
    { id: 'soap', label: 'SOAP', icon: Check, path: `/soap${buildUrlParams()}` },
    { id: 'diagnostic', label: 'Tests', icon: FileTextIcon, path: `/lab-management${buildUrlParams()}` },
    // { id: 'vaccination', label: 'Vaccine', icon: Clock, path: `/vaccination${buildUrlParams()}` },
    { id: 'treatment', label: 'Treatment', icon: ShieldCheck, path: `/treatment${buildUrlParams()}` },
  ];

  const handleNavigation = (path: string) => {
    if (!path.includes("undefined") && !path.includes("/undefined")) {
      navigate(path);
    }
  };

  const activeIndex = workflowSteps.findIndex(step => step.id === currentStep);
  
  return (
    <div className="bg-white shadow-sm border-b border-gray-100 mb-6">
      <div className="container mx-auto">
        <div className="flex justify-center">
          <div className="flex rounded-lg overflow-hidden">
            {workflowSteps.map((step, index) => {
              const isCurrent = step.id === currentStep;
              const isPast = index < activeIndex;
              const isDisabled = !appointmentId && (step.id !== 'patient-details' && step.id !== 'health-card');
              const IconComponent = step.icon;
              
              return (
                <button 
                  key={step.id}
                  className={`
                    group relative flex items-center py-3 px-7 cursor-pointer transition-all duration-200 ease-in-out
                    ${isCurrent ? 'bg-[#EBF5FF] text-[#2C78E4] font-medium' : 'bg-white text-[#6B7280]'}
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:text-[#2C78E4] hover:bg-[#F8FAFC]'}
                    border-r last:border-r-0 border-gray-100
                  `}
                  onClick={() => !isDisabled && handleNavigation(step.path)}
                  disabled={isDisabled}
                >
                  <IconComponent className={`h-5 w-5 mr-2.5 ${isCurrent ? 'text-[#2C78E4]' : 'text-[#6B7280] group-hover:text-[#2C78E4] transition-colors duration-200'}`} />
                  <span className="text-sm whitespace-nowrap">{step.label}</span>
                  {isCurrent && (
                    <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#2C78E4]"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowNavigation;