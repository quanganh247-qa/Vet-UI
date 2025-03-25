import React from 'react';
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
  Receipt
} from 'lucide-react';

type WorkflowNavigationProps = {
  appointmentId?: string;
  petId?: string;
  currentStep: 'patient-details' | 'check-in' | 'examination' | 'soap' | 'treatment' | 'prescription' | 'records';
};

const WorkflowNavigation = ({ appointmentId, petId, currentStep }: WorkflowNavigationProps) => {
  const [, navigate] = useLocation();

  // Định nghĩa các bước trong quy trình khám bệnh
  const workflowSteps = [
    { id: 'check-in', label: 'Check-in', icon: UserRound, path: `/appointment/${appointmentId}/check-in` },
    { id: 'examination', label: 'Khám', icon: Stethoscope, path: `/appointment/${appointmentId}` },
    { id: 'soap', label: 'SOAP', icon: FileText, path: `/appointment/${appointmentId}/soap` },
    { id: 'treatment', label: 'Điều trị', icon: Tablets, path: `/appointment/${appointmentId}/patient/${petId}/treatment` },
    { id: 'prescription', label: 'Kê đơn', icon: Receipt, path: `/appointment/${appointmentId}/prescription` },
  ];

  return (
    <div className="workflow-navigation bg-white shadow-sm rounded-lg border border-gray-200 p-2 mb-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-gray-500 uppercase pl-2">Quy trình khám</div>
        
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
                  onClick={() => navigate(step.path)}
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
    </div>
  );
};

export default WorkflowNavigation; 