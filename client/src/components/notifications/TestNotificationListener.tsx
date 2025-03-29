import React, { useEffect } from 'react';
import { addSocketListener, removeSocketListener } from '@/services/socket-service';
import { useNotifications } from '@/context/notification-context';
import { useQueryClient } from '@tanstack/react-query';

// Test result data that might come from the backend
interface TestResultData {
  testId?: number;
  appointmentId?: number;
  testType?: string;
  status?: string;
  petId?: number;
  // Go backend properties
  id?: string;
  patientId?: string;
  type?: string;
  message?: string;
  entityId?: string;
  title?: string;
}

const TestNotificationListener: React.FC = () => {
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Handler for test result notifications
    const handleTestResult = (data: TestResultData) => {
      console.log('Test result notification received:', data);
      
      // Extract IDs, handling both string and number types
      const testId = data.testId || (data.entityId ? parseInt(data.entityId) : null);
      const appointmentId = data.appointmentId || (data.id ? parseInt(data.id) : null);
      const petId = data.petId || (data.patientId ? parseInt(data.patientId) : null);
      const testType = data.testType || data.title || 'Test';
      
      if (testId && appointmentId) {
        // Add user notification
        addNotification({
          title: 'Test Result Ready',
          message: `Results for ${testType} test are now available.`,
          type: 'info',
          action: {
            label: 'View Patient',
            onClick: () => {
              window.location.href = `/appointment/${appointmentId}/diagnosis`;
            }
          }
        });

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['tests'] });
        
        if (petId) {
          queryClient.invalidateQueries({ queryKey: ['tests', 'pet', petId] });
        }
        
        queryClient.invalidateQueries({ queryKey: ['test', testId] });
        
        // Log success for debugging
        console.log(`Successfully processed test result notification for test #${testId}`);
      } else {
        console.warn('Received incomplete test result data:', data);
      }
    };
    
    // Also listen for notification type messages from backend
    const handleNotification = (data: any) => {
      console.log('Notification received:', data);
      
      // If it's a test result notification
      if (data.type === 'test_result' || data.type === 'testResult') {
        handleTestResult(data);
      }
    };

    // Register the listeners
    addSocketListener('testResultReady', handleTestResult);
    addSocketListener('notification', handleNotification);

    // Cleanup on unmount
    return () => {
      removeSocketListener('testResultReady', handleTestResult);
      removeSocketListener('notification', handleNotification);
    };
  }, [addNotification, queryClient]);

  // This component doesn't render anything
  return null;
};

export default TestNotificationListener; 