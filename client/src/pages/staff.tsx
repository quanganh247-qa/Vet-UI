import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Staff } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const StaffPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  
  const { data: staffData, isLoading } = useQuery({
    queryKey: ['/api/staff'],
  });
  
  const filteredStaff = staffData?.filter((staff: Staff) => {
    // Filter by active status
    if (activeTab === "active" && !staff.is_active) {
      return false;
    }
    if (activeTab === "inactive" && staff.is_active) {
      return false;
    }
    
    // Filter by role
    if (roleFilter !== "all" && staff.role.toLowerCase() !== roleFilter.toLowerCase()) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchFields = [
        staff.name,
        staff.role,
        staff.specialty,
      ].map(field => field?.toLowerCase() || "");
      
      return searchFields.some(field => field.includes(searchTerm.toLowerCase()));
    }
    
    return true;
  });
  
  // Get unique roles for filter
  const uniqueRoles = staffData 
    ? Array.from(new Set(staffData.map((s: Staff) => s.role)))
    : [];
  
  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold text-[#12263F]">Staff Management</h1>
          <p className="text-sm text-gray-500">Manage veterinarians and staff members</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button className="bg-[#2C7BE5] text-white rounded-md px-4 py-2 text-sm font-medium flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Staff Member
          </Button>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
        <TabsList className="bg-white rounded-lg shadow-sm border border-gray-100">
          <TabsTrigger value="all" className="data-[state=active]:bg-[#2C7BE5] data-[state=active]:text-white">
            All Staff
          </TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:bg-[#2C7BE5] data-[state=active]:text-white">
            Active
          </TabsTrigger>
          <TabsTrigger value="inactive" className="data-[state=active]:bg-[#2C7BE5] data-[state=active]:text-white">
            Inactive
          </TabsTrigger>
        </TabsList>
        
        {/* Filter container - shown for all tabs */}
        <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-grow md:max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input 
                type="search" 
                placeholder="Search staff members..." 
                className="pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:border-[#2C7BE5] w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select defaultValue="all" onValueChange={setRoleFilter}>
                <SelectTrigger className="border border-gray-200 rounded-md text-sm h-10 w-40">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {uniqueRoles.map((role) => (
                    <SelectItem key={role} value={role.toLowerCase()}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Staff Grid - Same content for all tabs, filtered by JS */}
        <TabsContent value="all" className="mt-0">
          {renderStaffGrid(filteredStaff, isLoading)}
        </TabsContent>
        <TabsContent value="active" className="mt-0">
          {renderStaffGrid(filteredStaff, isLoading)}
        </TabsContent>
        <TabsContent value="inactive" className="mt-0">
          {renderStaffGrid(filteredStaff, isLoading)}
        </TabsContent>
      </Tabs>
    </>
  );
};

// Helper function to render staff grid
const renderStaffGrid = (filteredStaff: Staff[] | undefined, isLoading: boolean) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {Array(6).fill(0).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex p-4">
                <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" />
                <div className="ml-4 flex-grow">
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-full max-w-[150px] mb-1" />
                  <Skeleton className="h-4 w-full max-w-[100px]" />
                </div>
                <div className="ml-auto">
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
              </div>
              <div className="border-t border-gray-100 px-4 py-3">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 flex justify-end">
                <Skeleton className="h-8 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (!filteredStaff || filteredStaff.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center mt-4">
        <p className="text-gray-500">No staff members found matching your criteria.</p>
        <Button className="mt-4 bg-[#2C7BE5] text-white">Add Staff Member</Button>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {filteredStaff.map((staff: Staff) => (
        <Card key={staff.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex p-4">
              <img 
                className="h-16 w-16 rounded-full object-cover flex-shrink-0" 
                src={staff.image_url || "https://via.placeholder.com/64"} 
                alt={staff.name} 
              />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-[#12263F]">{staff.name}</h3>
                <p className="text-sm text-gray-600">{staff.role}</p>
                {staff.specialty && (
                  <Badge className="mt-1 bg-[#00A9B5] hover:bg-[#00A9B5]">
                    {staff.specialty}
                  </Badge>
                )}
              </div>
              <div className="ml-auto">
                {staff.is_active ? (
                  <span className="h-3 w-3 bg-green-500 rounded-full inline-block"></span>
                ) : (
                  <span className="h-3 w-3 bg-gray-300 rounded-full inline-block"></span>
                )}
              </div>
            </div>
            <div className="border-t border-gray-100 px-4 py-3">
              <h4 className="text-sm font-medium text-[#12263F] mb-1">Status</h4>
              <div className="flex items-center">
                {staff.is_active ? (
                  <>
                    <Check className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-700">Available</span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-500">Unavailable</span>
                  </>
                )}
              </div>
            </div>
            <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 flex justify-end">
              <Button variant="outline" size="sm" className="text-xs text-[#2C7BE5] border-[#2C7BE5] hover:bg-[#2C7BE5] hover:text-white">
                View Schedule
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StaffPage;
