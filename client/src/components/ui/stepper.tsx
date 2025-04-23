import React, { createContext, useContext } from 'react';
import { cn } from '@/lib/utils';
import { CheckIcon } from 'lucide-react';

// Types
export type StepStatus = 'complete' | 'current' | 'upcoming';

// Props interfaces
interface StepperContextValue {
  currentStep: number;
}

interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  currentStep: number;
  className?: string;
  children: React.ReactNode;
}

interface StepProps {
  status?: StepStatus;
  className?: string;
  children: React.ReactNode;
}

// Context
const StepperContext = createContext<StepperContextValue>({
  currentStep: 0
});

// Step component
export function Step({ status = 'upcoming', className, children }: StepProps) {
  return (
    <li className={cn('flex flex-1 relative', className)}>
      <div className="group flex flex-col items-center w-full">
        {/* Step indicator */}
        <div 
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors',
            status === 'complete' && 'bg-green-600 border-green-600 text-white',
            status === 'current' && 'border-blue-600 text-blue-600',
            status === 'upcoming' && 'border-gray-300 text-gray-300',
          )}
        >
          {status === 'complete' ? (
            <CheckIcon className="w-5 h-5" />
          ) : (
            <span className="text-sm font-medium"></span>
          )}
        </div>
        
        {/* Step label */}
        <div className="mt-2 text-center">
          <span 
            className={cn(
              'text-sm font-medium',
              status === 'complete' && 'text-gray-900',
              status === 'current' && 'text-gray-900',
              status === 'upcoming' && 'text-gray-500',
            )}
          >
            {children}
          </span>
        </div>
      </div>
    </li>
  );
}

// Stepper component
export function Stepper({ currentStep, className, children, ...props }: StepperProps) {
  // Filter out only Step components and count them
  const steps = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && child.type === Step
  );
  
  return (
    <StepperContext.Provider value={{ currentStep }}>
      <div className={cn('w-full', className)} {...props}>
        <ol className="flex items-center w-full">
          {steps.map((step, index) => {
            // Clone the element to add the connecting line
            const isLast = index === steps.length - 1;
            
            if (React.isValidElement(step)) {
              return (
                <React.Fragment key={index}>
                  {step}
                  {!isLast && (
                    <div 
                      className={cn(
                        'flex-1 h-0.5 mx-2',
                        index < currentStep ? 'bg-green-600' : 'bg-gray-300'
                      )}
                    />
                  )}
                </React.Fragment>
              );
            }
            return null;
          })}
        </ol>
      </div>
    </StepperContext.Provider>
  );
}