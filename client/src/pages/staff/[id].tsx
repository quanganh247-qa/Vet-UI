import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  Calendar, 
  GraduationCap, 
  Briefcase, 
  Languages, 
  Clock,
  CalendarClock,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Staff } from "@/types";

// Mock data for development until API is connected
const mockStaffData: Staff[] = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    role: "Veterinarian",
    specialty: "Surgery",
    status: "Available",
    is_active: true,
    email: "sarah.johnson@vetclinic.com",
    phone: "555-123-4567",
    address: "123 Vet Street, Medical District",
    bio: "Dr. Johnson is a board-certified veterinary surgeon with over 10 years of experience in complex surgical procedures.",
    education: "Doctor of Veterinary Medicine, State University",
    experience: ["Chief Surgeon at Animal Hospital (2018-Present)", "Associate Veterinarian at City Pet Clinic (2012-2018)"],
    certifications: ["Board Certified in Veterinary Surgery", "Advanced Cardiac Surgery Certification"],
    languages: ["English", "Spanish"],
    schedule: [
      { day: "Monday", hours: "9:00 AM - 5:00 PM" },
      { day: "Wednesday", hours: "9:00 AM - 5:00 PM" },
      { day: "Friday", hours: "9:00 AM - 3:00 PM" }
    ],
    image_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    role: "Veterinarian",
    specialty: "Dermatology",
    status: "On Leave",
    is_active: false,
    email: "michael.chen@vetclinic.com",
    phone: "555-987-6543",
    bio: "Dr. Chen specializes in pet skin conditions and allergies, with particular expertise in treating chronic cases.",
    education: "Veterinary Medicine, Pacific University",
    experience: ["Dermatology Specialist at PetCare Plus (2015-Present)"],
    certifications: ["Certified in Veterinary Dermatology"],
    languages: ["English", "Mandarin"],
    image_url: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Amy Rodriguez",
    role: "Technician",
    status: "Available",
    is_active: true,
    email: "amy.rodriguez@vetclinic.com",
    phone: "555-456-7890",
    experience: ["Senior Technician (2019-Present)", "Junior Technician (2016-2019)"],
    certifications: ["Certified Veterinary Technician"],
    schedule: [
      { day: "Monday", hours: "8:00 AM - 4:00 PM" },
      { day: "Tuesday", hours: "8:00 AM - 4:00 PM" },
      { day: "Thursday", hours: "8:00 AM - 4:00 PM" },
      { day: "Friday", hours: "8:00 AM - 4:00 PM" }
    ],
    image_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop"
  },
  {
    id: 4,
    name: "James Wilson",
    role: "Receptionist",
    status: "Available",
    is_active: true,
    email: "james.wilson@vetclinic.com",
    phone: "555-789-0123",
    bio: "James manages the front desk, scheduling, and ensures smooth clinic operations.",
    schedule: [
      { day: "Monday", hours: "8:00 AM - 6:00 PM" },
      { day: "Tuesday", hours: "8:00 AM - 6:00 PM" },
      { day: "Wednesday", hours: "8:00 AM - 6:00 PM" },
      { day: "Thursday", hours: "8:00 AM - 6:00 PM" },
      { day: "Friday", hours: "8:00 AM - 6:00 PM" }
    ],
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop"
  },
  {
    id: 5,
    name: "Dr. Emily Parker",
    role: "Veterinarian",
    specialty: "Internal Medicine",
    status: "Available",
    is_active: true,
    email: "emily.parker@vetclinic.com",
    phone: "555-234-5678",
    bio: "Dr. Parker specializes in diagnosing and treating complex internal conditions in pets.",
    education: "Doctor of Veterinary Medicine, East State University",
    experience: ["Internist at Animal Care Hospital (2017-Present)"],
    certifications: ["Board Certified in Veterinary Internal Medicine"],
    languages: ["English", "French"],
    schedule: [
      { day: "Tuesday", hours: "9:00 AM - 5:00 PM" },
      { day: "Thursday", hours: "9:00 AM - 5:00 PM" }
    ],
    image_url: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=1974&auto=format&fit=crop"
  },
  {
    id: 6,
    name: "Robert Thompson",
    role: "Technician",
    status: "Available",
    is_active: true,
    email: "robert.thompson@vetclinic.com",
    phone: "555-345-6789",
    certifications: ["Certified Veterinary Technician", "Emergency Care Certified"],
    image_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1974&auto=format&fit=crop"
  }
];

const StaffDetailPage = () => {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('info');
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        // Get staff ID from URL
        const staffId = parseInt(window.location.pathname.split('/').pop() || '0');
        if (!staffId) {
          throw new Error('No staff ID provided');
        }
        
        // In a real application, you would fetch data from an API
        // For now, we'll use mock data
        const staffData = mockStaffData.find(s => s.id === staffId);
        
        if (!staffData) {
          throw new Error('Staff not found');
        }
        
        setStaff(staffData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch staff data');
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 dark:text-red-400">{error || 'Staff member not found'}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-700 dark:to-indigo-900 px-6 py-4 md:px-8 md:py-5 rounded-t-xl shadow-md mb-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/staff')}
              className="mr-4 h-8 w-8 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">{staff.name}</h1>
              <p className="text-indigo-100 text-sm">
                {staff.role} {staff.specialty ? `• ${staff.specialty}` : ''}
              </p>
            </div>
          </div>
          <div>
            <Badge
              variant={staff.is_active ? "default" : "secondary"}
              className={cn(
                "px-3 py-1",
                staff.is_active 
                  ? "bg-green-500 hover:bg-green-600 text-white" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
              )}
            >
              {staff.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Staff Photo and Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Photo Section */}
        <div className="md:col-span-1">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-w-1 aspect-h-1 relative h-80">
                {staff.image_url ? (
                  <img
                    src={staff.image_url}
                    alt={`${staff.name} - ${staff.role}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30">
                    <User className="h-20 w-20 text-indigo-300 dark:text-indigo-700" />
                  </div>
                )}
              </div>
              <div className="p-4 bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-900/30 dark:to-gray-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{staff.name}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:border-indigo-800">
                    {staff.role}
                  </Badge>
                  {staff.specialty && (
                    <Badge variant="outline" className="border-gray-200 dark:border-gray-700">
                      {staff.specialty}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Contact Card */}
          <Card className="mt-6">
            <CardHeader className="pb-3 border-b dark:border-gray-700">
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-3">
              {staff.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-indigo-500 dark:text-indigo-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-gray-900 dark:text-gray-200">{staff.email}</p>
                  </div>
                </div>
              )}
              
              {staff.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-indigo-500 dark:text-indigo-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="text-gray-900 dark:text-gray-200">{staff.phone}</p>
                  </div>
                </div>
              )}
              
              {staff.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-indigo-500 dark:text-indigo-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                    <p className="text-gray-900 dark:text-gray-200">{staff.address}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Staff Info Card */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-3 border-b dark:border-gray-700">
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Staff Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {staff.bio && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Bio</h3>
                  <p className="text-gray-900 dark:text-gray-200">{staff.bio}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {staff.education && (
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Education</h3>
                    <p className="text-base text-gray-900 dark:text-gray-200">{staff.education}</p>
                  </div>
                )}
                
                {staff.certifications && staff.certifications.length > 0 && (
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Certifications</h3>
                    <div className="flex flex-wrap gap-2">
                      {staff.certifications.map((cert, index) => (
                        <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {staff.languages && staff.languages.length > 0 && (
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {staff.languages.map((language, index) => (
                        <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {staff.schedule && staff.schedule.length > 0 && (
                <div className="mt-6 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4 border border-indigo-100 dark:border-indigo-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="font-medium text-gray-900 dark:text-gray-200">Work Schedule</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {staff.schedule.map((schedule, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{schedule.day}:</span>
                        <span className="text-gray-600 dark:text-gray-400">{schedule.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Experience Card - if there's experience data */}
          {staff.experience && staff.experience.length > 0 && (
            <Card className="mt-6">
              <CardHeader className="pb-3 border-b dark:border-gray-700">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Professional Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-4">
                  {staff.experience.map((exp, index) => (
                    <li key={index} className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-indigo-500 dark:before:bg-indigo-400">
                      <p className="text-gray-900 dark:text-gray-200">{exp}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Tabs Section */}
      <Card className="mt-6 overflow-hidden">
        <Tabs defaultValue="schedule" onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-none border-b dark:border-gray-700 bg-transparent p-0">
            <TabsTrigger 
              value="schedule" 
              className={cn(
                "data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600",
                "dark:data-[state=active]:border-indigo-400 dark:data-[state=active]:text-indigo-400",
                "rounded-none border-b-2 border-transparent py-3 font-medium text-gray-500 dark:text-gray-400",
                "hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              )}
            >
              Schedule
            </TabsTrigger>
            <TabsTrigger 
              value="patients" 
              className={cn(
                "data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600",
                "dark:data-[state=active]:border-indigo-400 dark:data-[state=active]:text-indigo-400",
                "rounded-none border-b-2 border-transparent py-3 font-medium text-gray-500 dark:text-gray-400",
                "hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              )}
            >
              Patients
            </TabsTrigger>
            <TabsTrigger 
              value="performance" 
              className={cn(
                "data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600",
                "dark:data-[state=active]:border-indigo-400 dark:data-[state=active]:text-indigo-400",
                "rounded-none border-b-2 border-transparent py-3 font-medium text-gray-500 dark:text-gray-400",
                "hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              )}
            >
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Upcoming Appointments
              </h3>
            </div>
            
            <div className="text-center p-8 text-gray-500 dark:text-gray-400">
              <p>No upcoming appointments scheduled.</p>
              <Button className="mt-4" variant="outline">
                Schedule an Appointment
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="patients" className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Assigned Patients
              </h3>
            </div>
            
            <div className="text-center p-8 text-gray-500 dark:text-gray-400">
              <p>No patients currently assigned to this staff member.</p>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Performance Metrics
              </h3>
            </div>
            
            <div className="text-center p-8 text-gray-500 dark:text-gray-400">
              <p>Performance data not available.</p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default StaffDetailPage; 