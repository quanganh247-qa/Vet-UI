import { useEffect } from "react";
import { useLocation } from "wouter";

const StaffDetailIndexPage = () => {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to the staff listing page
    setLocation("/staff");
  }, [setLocation]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
};

export default StaffDetailIndexPage;