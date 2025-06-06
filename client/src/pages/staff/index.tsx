import { useState } from "react";
import { useLocation, useParams } from "wouter";
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
  Pencil,
  User,
  Calendar as CalendarIcon,
  Clock,
  Users,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useDoctorProfile, useGetDoctorById } from "@/hooks/use-doctor";
import { useDoctorShiftsByDoctorId } from "@/hooks/use-shifts";

// Simple doctor data interface for the component
interface DoctorDisplayData {
  doctor_id: number;
  doctor_name: string;
  email: string;
  role: string;
  specialization?: string;
  certificate_number?: string;
  bio?: string;
  years_of_experience?: number;
  education?: string;
  phone_number?: string;
  address?: string;
  data_image?: string;
}

const StaffDetailPage = () => {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const { staffId } = useParams();

  const { data: doctorData } = useGetDoctorById(Number(staffId));

  return (
    <div className="space-y-6">
      {/* Simple header */}
      <div className="bg-gradient-to-r from-[#2C78E4] to-[#1E40AF] px-6 py-4 rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/staff")}
              className="bg-white/10 text-white hover:bg-white/20 rounded-full h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {doctorData?.data?.doctor_name}
              </h1>
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white border-white/30 rounded-full">
                  {doctorData?.data?.role}
                </Badge>
                {doctorData?.data?.specialization && (
                  <span className="text-white/80 text-sm">
                    {doctorData?.data?.specialization}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content with simplified layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left sidebar */}
        <div>
          <Card className="shadow-md rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#F0F7FF] to-white p-6 flex flex-col items-center border-b">
              <div className="h-28 w-28 rounded-full overflow-hidden bg-[#F0F7FF] mb-4 ring-2 ring-white shadow-md">
                <div className="h-full w-full flex items-center justify-center">
                    {doctorData?.data?.data_image ? (
                      <img src={`data:image/png;base64,${doctorData?.data?.data_image}`} 
                      alt="Doctor" className="h-full w-full object-cover" />
                    ) : (
                      <UserCircle className="h-20 w-20 text-[#2C78E4]" />
                    )}
                </div>
              </div>
              <h2 className="text-xl font-semibold text-[#2C78E4]">
                {doctorData?.data?.doctor_name}
              </h2>
              <Badge className="mt-2 bg-[#F0F7FF] text-[#2C78E4] border-[#2C78E4]/20 rounded-full">
                {doctorData?.data?.role}
              </Badge>
              {doctorData?.data?.specialization && (
                <p className="text-[#2C78E4]/80 text-sm mt-1">
                  {doctorData?.data?.specialization}
                </p>
              )}
            </div>

            <CardContent className="p-5">
              <div className="space-y-4">
                {doctorData?.data?.email && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="h-5 w-5 text-[#2C78E4]" />
                    <span className="text-sm">{doctorData?.data?.email}</span>
                  </div>
                )}
                {doctorData?.data?.phone_number && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="h-5 w-5 text-[#2C78E4]" />
                    <span className="text-sm">
                      {doctorData?.data?.phone_number}
                    </span>
                  </div>
                )}
                {doctorData?.data?.address && (
                  <div className="flex items-start gap-3 text-gray-700">
                    <MapPin className="h-5 w-5 text-[#2C78E4] mt-0.5" />
                    <span className="text-sm">{doctorData?.data?.address}</span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              {/* Credentials */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-[#2C78E4] uppercase">
                  Credentials
                </h3>

                {doctorData?.data?.certificate_number && (
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-[#2C78E4] mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        License Number
                      </p>
                      <p className="text-sm text-gray-600">
                        {doctorData?.data?.certificate_number}
                      </p>
                    </div>
                  </div>
                )}
                {doctorData?.data?.education && (
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-[#2C78E4] mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Education
                      </p>
                      <p className="text-sm text-gray-600">
                        {doctorData?.data?.education}
                      </p>
                    </div>
                  </div>
                )}
                {doctorData?.data?.years_of_experience &&
                  doctorData?.data?.years_of_experience > 0 && (
                    <div className="flex items-start gap-3">
                      <Briefcase className="h-5 w-5 text-[#2C78E4] mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Experience
                        </p>
                        <p className="text-sm text-gray-600">
                          {doctorData?.data?.years_of_experience} years
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content area */}
        <div className="lg:col-span-2">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            {/* Overview tab */}
            <Card className="shadow-md rounded-xl overflow-hidden">
              <CardHeader className="pb-3 border-b bg-gradient-to-r from-[#F0F7FF] to-white">
                <CardTitle className="flex items-center text-lg text-gray-800">
                  <User className="h-5 w-5 mr-2 text-[#2C78E4]" />
                  About
                </CardTitle>
                <CardDescription className="text-[#2C78E4]/80">
                  Professional background and expertise
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <div className="bg-[#F0F7FF]/50 p-4 rounded-xl border border-[#2C78E4]/10 text-gray-700 mb-6">
                  {doctorData?.data?.bio ? (
                    <p>{doctorData?.data?.bio}</p>
                  ) : (
                    <p className="text-gray-500 italic">
                      No biography available.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border border-[#2C78E4]/10 rounded-xl">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-[#F0F7FF] rounded-full p-2">
                          <Calendar className="h-5 w-5 text-[#2C78E4]" />
                        </div>
                        <h3 className="font-medium text-[#2C78E4]">
                          Experience
                        </h3>
                      </div>
                      <p className="text-3xl font-bold text-gray-800 mb-1">
                        {doctorData?.data?.years_of_experience || 0}
                      </p>
                      <p className="text-sm text-[#2C78E4]/80">
                        Years in practice
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default StaffDetailPage;
