import { Switch, Route, useLocation, RouteComponentProps } from "wouter";
import Dashboard from "@/pages/dashboard";
import Appointments from "@/pages/appointments";
import Staff from "@/pages/staff";
import Analytics from "@/pages/analytics";
import NotFound from "@/pages/not-found";
import { LoginForm } from "@/pages/login";
import React, { lazy, Suspense } from "react";
import { AuthProvider } from "@/context/auth-context";
import { NotificationProvider } from "@/context/notification-context";
import NotificationsAdmin from "@/pages/notifications-admin";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { useState } from "react"; 
import Chatbot from "./pages/chatbot";
// Use lazy loading for new components
const AppointmentFlow = lazy(() => import("@/pages/appointment-flow"));
const CheckIn = lazy(() => import("@/pages/check-in"));
const PatientManagement = lazy(() => import("@/pages/patient-management"));
const SoapNotes = lazy(() => import("@/pages/soap-notes"));
const MedicalRecords = lazy(() => import("@/pages/medical-records"));
const WorkflowNavigation = lazy(() => import("@/components/WorkflowNavigation")); 
const TreatmentManagement = lazy(() => import("@/pages/treatment"));

// Create LoginPage component that uses LoginForm
const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <LoginForm />
    </div>
  );
};

function Router() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><p>Loading...</p></div>}>
      <Switch>
        <Route path="/" component={Dashboard as React.ComponentType<RouteComponentProps>} />
        <Route path="/appointments" component={Appointments as React.ComponentType<RouteComponentProps>} />
        <Route path="/staff" component={Staff as React.ComponentType<RouteComponentProps>} />
        <Route path="/analytics" component={Analytics as React.ComponentType<RouteComponentProps>} />
        <Route path="/appointment-flow" component={AppointmentFlow as React.ComponentType<RouteComponentProps>} />
        <Route path="/appointment/:id/check-in" component={CheckIn as React.ComponentType<RouteComponentProps>} />
        <Route path="/appointment/:id" component={PatientManagement as React.ComponentType<RouteComponentProps>} />
        <Route path="/appointment/:id/soap" component={SoapNotes as React.ComponentType<RouteComponentProps>} />
        <Route path="/appointment/:id/patient/:petId/treatment" component={TreatmentManagement as React.ComponentType<RouteComponentProps>} />
        <Route path="/treatment/:petId" component={TreatmentManagement as React.ComponentType<RouteComponentProps>} />
        <Route path="/notifications" component={NotificationsAdmin as React.ComponentType<RouteComponentProps>} />
        <Route path="/chatbot" component={Chatbot as React.ComponentType<RouteComponentProps>} />
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
            {/* <Topbar openSidebar={() => setSidebarOpen(true)} /> */}
            
            <main className="flex-1 overflow-y-auto bg-[#F9FBFD] p-4">
              <Router />
            </main>
          </div>
        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
