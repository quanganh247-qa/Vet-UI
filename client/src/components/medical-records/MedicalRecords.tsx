import React, { useState } from 'react';
import { FileText, Stethoscope, Pill, CalendarCheck, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMedicalRecord } from '@/hooks/use-medical-record';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SmartMedicalEntryForm } from './SmartMedicalEntryForm';
import { toast } from '@/hooks/use-toast';

interface MedicalRecord {
  id: string;
  type: 'checkup' | 'treatment' | 'surgery';
  date: string;
  diagnosis: string;
  symptoms: string;
  treatment: string;
  status: 'completed' | 'ongoing' | 'scheduled';
  prescriptions?: string[];
  followUpDate?: string;
}

interface MedicalRecordsProps {
  petId: number;
}

const MedicalRecords: React.FC<MedicalRecordsProps> = ({ petId }) => {
  const { data: response, isLoading, refetch } = useMedicalRecord(petId);
  const { data: doctorData } = useDoctor();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Handle the response structure properly
  const records = Array.isArray(response) ? response : response?.data || [];

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    refetch(); // Refresh the data
    toast({
      title: "Hồ sơ đã được tạo thành công",
      description: "Hồ sơ y tế và kết quả khám đã được lưu vào hệ thống.",
    });
  };

  const renderRecord = (record: MedicalRecord) => (
    <Card key={record.id} className="mb-4 border-none shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-white pb-3 border-b">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold text-indigo-900">
              {record.diagnosis || 'General Checkup'}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {format(new Date(record.date), 'MMMM d, yyyy')}
            </p>
          </div>
          <Badge 
            variant={record.status === 'completed' ? 'default' : 'secondary'}
            className="capitalize"
          >
            {record.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Symptoms</h4>
              <p className="text-gray-900">{record.symptoms || 'No symptoms recorded'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Treatment</h4>
              <p className="text-gray-900">{record.treatment || 'No treatment recorded'}</p>
            </div>
          </div>

          {record.prescriptions && record.prescriptions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Prescriptions</h4>
              <div className="space-y-2">
                {record.prescriptions.map((prescription, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm">
                    <Pill className="h-4 w-4 text-gray-400 mt-1" />
                    <span>{prescription}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {record.followUpDate && (
            <div className="flex items-center space-x-2 text-sm text-indigo-600">
              <CalendarCheck className="h-4 w-4" />
              <span>Follow-up scheduled for {format(new Date(record.followUpDate), 'MMMM d, yyyy')}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900">Medical Records</h2>
          <div className="flex gap-2">
            <Button 
              variant="default" 
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <PlusCircle className="h-4 w-4" />
              Create Record
            </Button>
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Export Records
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
          </div>
        ) : records.length === 0 ? (
          <Card className="border border-dashed border-gray-300 bg-gray-50">
            <CardContent className="py-12 flex flex-col items-center justify-center text-center">
              <Stethoscope className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No Medical Records Yet</h3>
              <p className="text-gray-500 mb-6 max-w-md">
                This patient doesn't have any medical records yet. Click the button below to create the first record.
              </p>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Create First Record
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="checkups">Checkups</TabsTrigger>
              <TabsTrigger value="treatments">Treatments</TabsTrigger>
              <TabsTrigger value="surgeries">Surgeries</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              {records.map(renderRecord)}
            </TabsContent>

            <TabsContent value="checkups" className="mt-6">
              {records.filter((r: MedicalRecord) => r.type === 'checkup').map(renderRecord)}
            </TabsContent>

            <TabsContent value="treatments" className="mt-6">
              {records.filter((r: MedicalRecord) => r.type === 'treatment').map(renderRecord)}
            </TabsContent>

            <TabsContent value="surgeries" className="mt-6">
              {records.filter((r: MedicalRecord) => r.type === 'surgery').map(renderRecord)}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Smart Medical Entry Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Medical Record & Examination</DialogTitle>
            <DialogDescription>
              Create a new medical record and enter examination details in one streamlined workflow.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <SmartMedicalEntryForm 
              petId={petId}
              doctorId={doctorData?.id || 0}
              onSuccess={handleCreateSuccess}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MedicalRecords;
