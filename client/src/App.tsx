import { Switch, Route, useLocation, RouteComponentProps } from "wouter";
import Dashboard from "@/pages/dashboard";
import Appointments from "@/pages/appointments";
import Staff from "@/pages/staff";
import Analytics from "@/pages/analytics";
import NotFound from "@/pages/not-found";
import { LoginForm } from "@/pages/login";
import React, { lazy, Suspense, useEffect, useState } from "react";
import { AuthProvider } from "@/context/auth-context";
import { NotificationProvider } from "@/context/notification-context";
import Sidebar from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { PatientsPage } from "@/pages/patient/patients";
import Billing from "@/pages/billing";
import Chatbot from "./pages/chatbot";
import ScheduleManagement from "./pages/schedule-management";
import ShiftManagement from "@/pages/shift-management";
import StaffPageDetail from "@/pages/staff";
import { WalkInDialog } from "./components/appointment/WalkInDialog";
import Settings from "./pages/settings";
import EditProfilePage from "./pages/profile/edit";

// Lazy load the TestNotificationListener to avoid hook errors
const NotificationsPage = lazy(() => import("@/pages/notifications"));
// Use lazy loading for new components
const AppointmentFlow = lazy(() => import("@/pages/appointment-flow"));
const CheckIn = lazy(() => import("@/pages/check-in"));
const PatientManagement = lazy(() => import("@/pages/patient-management"));
const SoapNotes = lazy(() => import("@/pages/soap-notes"));
const TreatmentManagement = lazy(() => import("@/pages/treatment"));
const MedicalRecords = lazy(() => import("@/pages/medical-records"));
const WorkflowNavigation = lazy(() => import("@/components/WorkflowNavigation"));
const FollowUp = lazy(() => import("@/pages/follow-up"));
const Examination = lazy(() => import("@/pages/examination"));
const Vaccination = lazy(() => import("@/pages/vaccination"));
const TestOrdersManagement = lazy(() => import("@/pages/test-orders-management"));
const ShiftAssignment = lazy(() => import("@/pages/shift-assignment"));
const StaffPage = lazy(() => import("@/pages/staff"));
const PrescriptionInvoice = lazy(() => import("@/pages/prescription/invoice"));
const LabManagement = lazy(() => import("@/pages/lab-management"));
const ServicesManagement = lazy(() => import("@/pages/services-management"));
const PatientDetailsPage = lazy(() => import("@/pages/patient/patient-details"));
const ProductManagement = lazy(() => import("@/pages/catalog-management/product-management"));
// Create LoginPage component that uses LoginForm
const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <LoginForm />
    </div>
  );
};

// WebSocket initializer component
const WebSocketInitializer = () => {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  
  // This is a valid React component that can use hooks
  useEffect(() => {
    // Initialize socket connection
    const initSocket = async () => {
      try {
        console.log('Initializing WebSocket connection...');
        const { initializeSocket, addSocketListener, removeSocketListener } = await import('@/services/socket-service');
        
        // Setup connection status listeners
        const handleConnect = () => {
          console.log('WebSocket connected from App component');
          setConnectionStatus('connected');
        };
        
        const handleDisconnect = () => {
          console.log('WebSocket disconnected from App component');
          setConnectionStatus('disconnected');
        };
        
        const handleError = (error: any) => {
          console.error('WebSocket error from App component:', error);
          setConnectionStatus('error');
        };
        
        // Register listeners
        addSocketListener('connect', handleConnect);
        addSocketListener('disconnect', handleDisconnect);
        addSocketListener('error', handleError);
        
        // Initialize connection
        initializeSocket();
        
        // Cleanup function
        return () => {
          removeSocketListener('connect', handleConnect);
          removeSocketListener('disconnect', handleDisconnect);
          removeSocketListener('error', handleError);
        };
      } catch (error) {
        console.error('Error initializing WebSocket:', error);
        setConnectionStatus('error');
      }
    };
    
    initSocket();
    
    return () => {
      // Cleanup on unmount
      import('@/services/socket-service').then(({ disconnectSocket }) => {
        console.log('Disconnecting WebSocket...');
        disconnectSocket();
      }).catch(error => {
        console.error('Error during WebSocket cleanup:', error);
      });
    };
  }, []);
  
  // This component could provide a small indicator but we'll keep it hidden for now
  return null;
};

// Add the route in the Router component's Switch block
function Router() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><p>Loading...</p></div>}>
      <Switch>
        <Route path="/" component={Dashboard as React.ComponentType<RouteComponentProps>} />
        <Route path="/appointments" component={Appointments as React.ComponentType<RouteComponentProps>} />
        <Route path="/staff" component={Staff as React.ComponentType<RouteComponentProps>} />
        <Route path="/analytics" component={Analytics as React.ComponentType<RouteComponentProps>} />
        <Route path="/appointment-flow" component={AppointmentFlow as React.ComponentType<RouteComponentProps>} />
        <Route path="/appointment/walk-in" component={WalkInDialog as React.ComponentType<RouteComponentProps>} />
        
        {/* Workflow routes - updated to use query params instead of route params */}
        <Route path="/check-in" component={CheckIn as React.ComponentType<RouteComponentProps>} />
        <Route path="/patient" component={PatientManagement as React.ComponentType<RouteComponentProps>} />
        <Route path="/patient/:id" component={PatientDetailsPage as React.ComponentType<RouteComponentProps>} />
        <Route path="/soap" component={SoapNotes as React.ComponentType<RouteComponentProps>} />
        <Route path="/treatment" component={TreatmentManagement as React.ComponentType<RouteComponentProps>} />
        <Route path="/invoice" component={PrescriptionInvoice as React.ComponentType<RouteComponentProps>} />
        <Route path="/follow-up" component={FollowUp as React.ComponentType<RouteComponentProps>} />
        <Route path="/examination" component={Examination as React.ComponentType<RouteComponentProps>} />
        <Route path="/lab-management" component={LabManagement as React.ComponentType<RouteComponentProps>} />
        <Route path="/medical-records" component={MedicalRecords as React.ComponentType<RouteComponentProps>} />
        
        {/* Maintain legacy routes for backward compatibility */}
        <Route path="/appointment/:id/check-in" component={CheckIn as React.ComponentType<RouteComponentProps>} />
        <Route path="/appointment/:id" component={PatientManagement as React.ComponentType<RouteComponentProps>} />
        <Route path="/appointment/:id/soap" component={SoapNotes as React.ComponentType<RouteComponentProps>} />
        <Route path="/appointment/:id/treatment" component={TreatmentManagement as React.ComponentType<RouteComponentProps>} />
        <Route path="/appointment/:id/prescription/invoice" component={PrescriptionInvoice as React.ComponentType<RouteComponentProps>} />
        <Route path="/appointment/:id/follow-up" component={FollowUp as React.ComponentType<RouteComponentProps>} />
        <Route path="/appointment/:id/examination" component={Examination as React.ComponentType<RouteComponentProps>} />
        <Route path="/appointment/:id/lab-management" component={LabManagement as React.ComponentType<RouteComponentProps>} />
        <Route path="/appointment/:id/medical-records" component={MedicalRecords as React.ComponentType<RouteComponentProps>} />
        
        <Route path="/vaccination" component={Vaccination as React.ComponentType<RouteComponentProps>} />

        <Route path="/notifications" component={NotificationsPage as React.ComponentType<RouteComponentProps>} />
        <Route path="/chatbot" component={Chatbot as React.ComponentType<RouteComponentProps>} />
        <Route path="/patients" component={PatientsPage as React.ComponentType<RouteComponentProps>} />
        <Route path="/billing" component={Billing as React.ComponentType<RouteComponentProps>} />
        <Route path="/catalog-management" component={ProductManagement as React.ComponentType<RouteComponentProps>} />
        <Route path="/test-orders" component={TestOrdersManagement as React.ComponentType<RouteComponentProps>} />
        <Route path="/services-management" component={ServicesManagement as React.ComponentType<RouteComponentProps>} />
        <Route path="/schedule" component={ScheduleManagement as React.ComponentType<RouteComponentProps>} />
        <Route path="/shift-management" component={ShiftManagement as React.ComponentType<RouteComponentProps>} />
        <Route path="/shift-assignment" component={ShiftAssignment as React.ComponentType<RouteComponentProps>} />
        <Route path="/staff" component={StaffPage as React.ComponentType<RouteComponentProps>} />
        <Route path="/staff/:id" component={StaffPageDetail as React.ComponentType<RouteComponentProps>} />
        <Route path="/settings" component={Settings as React.ComponentType<RouteComponentProps>} />
        <Route path="/profile" component={EditProfilePage as React.ComponentType<RouteComponentProps>} />
        <Route component={NotFound as React.ComponentType<RouteComponentProps>} />
      </Switch>
    </Suspense>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();

  React.useEffect(() => {
    if (!localStorage.getItem('access_token') && location !== '/login') {
      window.location.href = '/login';
    }
  }, [location]);

  // If we're on the login page, render only the LoginPage
  if (location === '/login') {
    return (
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );
  }

  // Otherwise render the main layout with sidebar and content
  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="flex h-screen overflow-hidden bg-background text-darkText">
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-y-auto bg-[#F9FBFD] p-4">
              <WebSocketInitializer />
              <Router />
            </main>
          </div>
        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
