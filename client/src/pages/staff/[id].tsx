import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Award,
  BookOpen,
  Briefcase,
  UserCircle,
  Calendar,
  Clock,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useDoctorProfile } from "@/hooks/use-doctor";

const StaffDetailPage = () => {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Get staff ID from URL
  const staffId = parseInt(window.location.pathname.split("/").pop() || "0");
  const { data: doctorData, isLoading } = useDoctorProfile(staffId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-700 dark:to-indigo-900 px-6 py-4 md:px-8 md:py-5 rounded-t-xl shadow-md mb-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/staff")}
              className="bg-white/10 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">{doctorData?.doctor_name}</h1>
              <p className="text-indigo-100 text-sm">{doctorData?.role}</p>
            </div>
          </div>

          <Button
            onClick={() => setLocation(`/staff/edit/${doctorData?.doctor_id}`)}
            className="bg-white text-indigo-700 hover:bg-indigo-50 flex items-center gap-1.5"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="h-32 w-32 rounded-full overflow-hidden bg-indigo-50 mb-4">
                  {doctorData?.data_image ? (
                    <img
                      src={`data:image/png;base64,${doctorData.data_image}`}
                      alt={doctorData.doctor_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <UserCircle className="h-16 w-16 text-indigo-300" />
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {doctorData?.doctor_name}
                </h2>
                <p className="text-gray-500">{doctorData?.role}</p>

                <div className="mt-4 w-full">
                  <Separator className="my-4" />
                  <div className="space-y-3">
                    {doctorData?.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{doctorData.email}</span>
                      </div>
                    )}
                    {doctorData?.phone_number && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{doctorData.phone_number}</span>
                      </div>
                    )}
                    {doctorData?.address && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{doctorData.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credentials Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Credentials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {doctorData?.certificate_number && (
                <div className="flex items-start gap-2">
                  <Award className="h-5 w-5 text-indigo-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">License Number</p>
                    <p className="text-sm text-gray-500">
                      {doctorData.certificate_number}
                    </p>
                  </div>
                </div>
              )}
              {doctorData?.education && (
                <div className="flex items-start gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Education</p>
                    <p className="text-sm text-gray-500">
                      {doctorData.education}
                    </p>
                  </div>
                </div>
              )}
              {doctorData?.specialization && (
                <div className="flex items-start gap-2">
                  <Briefcase className="h-5 w-5 text-indigo-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Specialization</p>
                    <p className="text-sm text-gray-500">
                      {doctorData.specialization}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="patients">Patients</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {doctorData?.bio || "No biography available."}
                  </p>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-5 w-5 text-indigo-500" />
                        <h3 className="font-medium">Years of Experience</h3>
                      </div>
                      <p className="text-2xl font-semibold text-gray-900">
                        {doctorData?.years_of_experience || 0}
                      </p>
                      <p className="text-sm text-gray-500">Years in practice</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-indigo-500" />
                        <h3 className="font-medium">Availability</h3>
                      </div>
                      <div className="space-y-2">
                        <Badge className="bg-green-100 text-green-800">
                          Monday - Friday
                        </Badge>
                        <p className="text-sm text-gray-500">9:00 AM - 5:00 PM</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule">
              {/* Add schedule content here */}
              <Card>
                <CardHeader>
                  <CardTitle>Work Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">Schedule information will be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="patients">
              {/* Add patients content here */}
              <Card>
                <CardHeader>
                  <CardTitle>Patient List</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">Patient information will be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default StaffDetailPage;