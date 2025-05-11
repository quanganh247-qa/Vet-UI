import { Switch, Route, useLocation, RouteComponentProps } from "wouter";
import Dashboard from "@/pages/dashboard";
import Appointments from "@/pages/appointments";
import Staff from "@/pages/staff";
import Analytics from "@/pages/analytics";
import NotFound from "@/pages/not-found";
import { LoginForm } from "@/pages/login";
import React, { lazy, Suspense, useEffect, useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import { PatientsPage } from "@/pages/patient/patients";
import Billing from "@/pages/billing";
import Chatbot from "./pages/chatbot";
import ScheduleManagement from "./pages/schedule-management";
import ShiftManagement from "@/pages/shift-management";
import StaffPageDetail from "@/pages/staff";
import { WalkInDialog } from "./components/appointment/WalkInDialog";
import Settings from "./pages/settings";
import EditProfilePage from "./pages/profile";
import StaffDetailPage from "@/pages/staff/index";
import { NotificationsProvider } from "@/context/notifications-context";
import 'react-toastify/dist/ReactToastify.css';
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
const ShiftAssignment = lazy(() => import("@/pages/shift-assignment"));
const StaffPage = lazy(() => import("@/pages/staff"));
const PrescriptionInvoice = lazy(() => import("@/pages/prescription/invoice"));
const LabManagement = lazy(() => import("@/pages/lab-management"));
const ServicesManagement = lazy(() => import("@/pages/services-management"));
const PatientDetailsPage = lazy(() => import("@/pages/patient/patient-details"));
const ProductManagement = lazy(() => import("@/pages/catalog-management/product-management"));
const InventoryPage = lazy(() => import("@/pages/inventory"));
const HealthCard = lazy(() => import("@/pages/patient/health-card"));

// Create LoginPage component that uses LoginForm
const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <LoginForm />
    </div>
  );
};

// Add the route in the Router component's Switch block
function Router() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><p>Loading...</p></div>}>
      <Switch>
        <Route path="/dashboard" component={Dashboard as React.ComponentType<RouteComponentProps>} />
        <Route path="/appointments" component={Appointments as React.ComponentType<RouteComponentProps>} />
        <Route path="/staff" component={Staff as React.ComponentType<RouteComponentProps>} />
        <Route path="/analytics" component={Analytics as React.ComponentType<RouteComponentProps>} />
        <Route path="/inventory" component={InventoryPage as React.ComponentType<RouteComponentProps>} />
        <Route path="/appointment-flow" component={AppointmentFlow as React.ComponentType<RouteComponentProps>} />
        <Route path="/appointment/walk-in" component={WalkInDialog as React.ComponentType<RouteComponentProps>} />

        {/* Workflow routes - updated to use query params instead of route params */}
        <Route path="/check-in" component={CheckIn as React.ComponentType<RouteComponentProps>} />
        <Route path="/patient/health-card" component={HealthCard as React.ComponentType<RouteComponentProps>} />
        <Route path="/patient/:id" component={PatientDetailsPage as React.ComponentType<RouteComponentProps>} />
        <Route path="/patient" component={PatientManagement as React.ComponentType<RouteComponentProps>} />
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
        <Route path="/appointment/:id/health-card" component={HealthCard as React.ComponentType<RouteComponentProps>} />

        <Route path="/patient/:patientId/vaccination" component={Vaccination as React.ComponentType<RouteComponentProps>} />
        <Route path="/patient/:patientId/health-card" component={HealthCard as React.ComponentType<RouteComponentProps>} />
        <Route path="/vaccination" component={Vaccination as React.ComponentType<RouteComponentProps>} />
        <Route path="/notifications" component={NotificationsPage as React.ComponentType<RouteComponentProps>} />
        <Route path="/chatbot" component={Chatbot as React.ComponentType<RouteComponentProps>} />
        <Route path="/patients" component={PatientsPage as React.ComponentType<RouteComponentProps>} />
        <Route path="/billing" component={Billing as React.ComponentType<RouteComponentProps>} />
        <Route path="/catalog-management" component={ProductManagement as React.ComponentType<RouteComponentProps>} />
        <Route path="/services-management" component={ServicesManagement as React.ComponentType<RouteComponentProps>} />
        <Route path="/schedule-management" component={ScheduleManagement as React.ComponentType<RouteComponentProps>} />
        <Route path="/shift-management" component={ShiftManagement as React.ComponentType<RouteComponentProps>} />
        <Route path="/shift-assignment" component={ShiftAssignment as React.ComponentType<RouteComponentProps>} />
        <Route path="/staff/new" component={StaffPage as React.ComponentType<RouteComponentProps>} />
        <Route path="/staff" component={StaffPage as React.ComponentType<RouteComponentProps>} />
        <Route path="/staff/:staffId" component={StaffDetailPage as React.ComponentType<RouteComponentProps>} />
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
      <>
        <LoginPage />
      </>
    );
  }

  // Otherwise render the main layout with sidebar and content
  return (
    <NotificationsProvider>
      <div className="flex h-screen overflow-hidden bg-background text-darkText">
        <Sidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-[#F9FBFD] p-4">
            <Router />
          </main>
        </div>
      </div>
    </NotificationsProvider>
  );
}

export default App;
