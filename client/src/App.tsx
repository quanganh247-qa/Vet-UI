import { Switch, Route, useLocation } from "wouter";
import Dashboard from "@/pages/dashboard";
import Appointments from "@/pages/appointments";
import Patients from "@/pages/patients";
import Staff from "@/pages/staff";
import Analytics from "@/pages/analytics";
import NotFound from "@/pages/not-found";
import { LoginForm } from "@/pages/login";
import React, { lazy, Suspense } from "react";
import { AuthProvider } from "@/context/auth-context"; // Add this import


// Use lazy loading for new components
const AppointmentFlow = lazy(() => import("@/pages/appointment-flow"));
const CheckIn = lazy(() => import("@/pages/check-in"));
const PatientManagement = lazy(() => import("@/pages/patient-management"));
const SoapNotes = lazy(() => import("@/pages/soap-notes"));
const MedicalRecords = lazy(() => import("@/pages/medical-records"));
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { useState } from "react";

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
        <Route path="/" component={Dashboard} />
        <Route path="/appointments" component={Appointments} />
        <Route path="/patients" component={Patients} />
        <Route path="/staff" component={Staff} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/appointment-flow" component={AppointmentFlow} />
        <Route path="/check-in/:id?" component={CheckIn} />
        <Route path="/patient/:id" component={PatientManagement} />
        <Route path="/soap-notes/:id" component={SoapNotes} />
        <Route path="/medical-records/:patientId?" component={MedicalRecords} />
        <Route component={NotFound} />
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
      <div className="flex h-screen overflow-hidden bg-background text-darkText">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar openSidebar={() => setSidebarOpen(true)} />
          
          <main className="flex-1 overflow-y-auto bg-[#F9FBFD] p-4">
            <Router />
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
