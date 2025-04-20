import React from 'react';
import { FileText, Stethoscope, Pill, CalendarCheck } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMedicalRecord } from '@/hooks/use-medical-record';

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
  const { data: response, isLoading } = useMedicalRecord(petId);

  if (isLoading) {
    return <div>Loading medical records...</div>;
  }

  // Handle the response structure properly
  const records = Array.isArray(response) ? response : response?.data || [];

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Medical Records</h2>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Export Records
        </Button>
      </div>

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
    </div>
  );
};

export default MedicalRecords;