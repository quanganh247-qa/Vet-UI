import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Pill, 
  Activity, 
  Calendar, 
  AlertTriangle,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { useMedicalHistory } from '@/hooks/use-medical-history';
import { MedicalHistorySummary } from '@/services/medical-record-services';

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy h:mm a');
  } catch (error) {
    return dateString;
  }
};

interface CompleteMedicalHistoryProps {
  petId: number;
}

export function CompleteMedicalHistory({ petId }: CompleteMedicalHistoryProps) {
  // Use the hook to get complete medical history
  const { getCompleteMedicalHistory } = useMedicalHistory();
  const { 
    data: medicalHistory,
    isLoading,
    isError,
    error 
  } = getCompleteMedicalHistory(petId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading medical history...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-red-200 shadow-sm">
        <CardHeader className="bg-red-50">
          <CardTitle className="text-red-800 flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Error Loading Medical History
          </CardTitle>
          <CardDescription className="text-red-700">
            {error instanceof Error ? error.message : 'Failed to load medical history'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!medicalHistory) {
    return (
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50">
          <CardTitle>No Medical History</CardTitle>
          <CardDescription>This pet doesn't have any medical records yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
        <CardTitle className="text-xl flex items-center">
          <FileText className="mr-2 h-5 w-5 text-primary" />
          Complete Medical History
        </CardTitle>
        <CardDescription>
          Comprehensive medical records and history for this patient
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="conditions" className="w-full">
        <div className="px-6 pt-2">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
            <TabsTrigger value="examinations">Examinations</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="test-results">Test Results</TabsTrigger>
          </TabsList>
        </div>
        
        {/* Conditions Tab */}
        <TabsContent value="conditions" className="p-0">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {medicalHistory.conditions && medicalHistory.conditions.length > 0 ? (
                medicalHistory.conditions.map((condition) => (
                  <div 
                    key={condition.id} 
                    className="rounded-lg border border-gray-200 overflow-hidden"
                  >
                    <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b">
                      <div>
                        <h3 className="font-medium text-gray-900">{condition.condition}</h3>
                        <p className="text-sm text-gray-600">
                          <Calendar className="inline h-3.5 w-3.5 mr-1" />
                          Diagnosed on {formatDate(condition.diagnosis_date)}
                        </p>
                      </div>
                      <Badge variant="outline">{condition.status || 'Active'}</Badge>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-700">{condition.notes}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No conditions recorded for this patient.
                </div>
              )}
            </div>
          </CardContent>
        </TabsContent>
        
        {/* Examinations Tab */}
        <TabsContent value="examinations" className="p-0">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {medicalHistory.examinations && medicalHistory.examinations.length > 0 ? (
                medicalHistory.examinations.map((exam) => (
                  <div 
                    key={exam.id} 
                    className="rounded-lg border border-gray-200 overflow-hidden"
                  >
                    <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b">
                      <div>
                        <h3 className="font-medium text-gray-900">{exam.exam_type}</h3>
                        <p className="text-sm text-gray-600">
                          <Calendar className="inline h-3.5 w-3.5 mr-1" />
                          {formatDate(exam.exam_date)} by Dr. {exam.doctor_name}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                    <div className="p-4">
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Findings</h4>
                        <p className="text-sm text-gray-700">{exam.findings}</p>
                      </div>
                      
                      {exam.vet_notes && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Vet Notes</h4>
                          <p className="text-sm text-gray-700">{exam.vet_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No examinations recorded for this patient.
                </div>
              )}
            </div>
          </CardContent>
        </TabsContent>
        
        {/* Prescriptions Tab */}
        <TabsContent value="prescriptions" className="p-0">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {medicalHistory.prescriptions && medicalHistory.prescriptions.length > 0 ? (
                medicalHistory.prescriptions.map((prescription) => (
                  <div 
                    key={prescription.id} 
                    className="rounded-lg border border-gray-200 overflow-hidden"
                  >
                    <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b">
                      <div>
                        <h3 className="font-medium text-gray-900">Prescription #{prescription.id}</h3>
                        <p className="text-sm text-gray-600">
                          <Calendar className="inline h-3.5 w-3.5 mr-1" />
                          {formatDate(prescription.prescription_date)} by Dr. {prescription.doctor_name}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Download className="h-3.5 w-3.5 mr-1" />
                          Print
                        </Button>
                        <Button size="sm" variant="outline">View</Button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Medications</h4>
                      <div className="space-y-2">
                        {prescription.medications.map((med) => (
                          <div key={med.id} className="flex items-start p-2 border border-gray-100 rounded-md bg-gray-50">
                            <Pill className="h-4 w-4 text-blue-500 mt-0.5 mr-2" />
                            <div>
                              <h5 className="text-sm font-medium">{med.medicine_name}</h5>
                              <p className="text-xs text-gray-600">
                                {med.dosage}, {med.frequency} for {med.duration}
                              </p>
                              {med.instructions && (
                                <p className="text-xs text-gray-700 italic mt-1">
                                  {med.instructions}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {prescription.notes && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
                          <p className="text-sm text-gray-700">{prescription.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No prescriptions recorded for this patient.
                </div>
              )}
            </div>
          </CardContent>
        </TabsContent>
        
        {/* Test Results Tab */}
        <TabsContent value="test-results" className="p-0">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {medicalHistory.test_results && medicalHistory.test_results.length > 0 ? (
                medicalHistory.test_results.map((test) => (
                  <div 
                    key={test.id} 
                    className="rounded-lg border border-gray-200 overflow-hidden"
                  >
                    <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b">
                      <div>
                        <h3 className="font-medium text-gray-900">{test.test_type}</h3>
                        <p className="text-sm text-gray-600">
                          <Calendar className="inline h-3.5 w-3.5 mr-1" />
                          {formatDate(test.test_date)} by Dr. {test.doctor_name}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {test.file_url && (
                          <Button size="sm" variant="outline">
                            <Download className="h-3.5 w-3.5 mr-1" />
                            Download
                          </Button>
                        )}
                        <Button size="sm" variant="outline">View Details</Button>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Results</h4>
                        <div className="p-3 bg-gray-50 border border-gray-100 rounded-md text-sm">
                          {test.results}
                        </div>
                      </div>
                      
                      {test.interpretation && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Interpretation</h4>
                          <p className="text-sm text-gray-700 italic">{test.interpretation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No test results recorded for this patient.
                </div>
              )}
            </div>
          </CardContent>
        </TabsContent>
        
        {/* Allergies Section (Always visible) */}
        <div className="px-6 pb-6 pt-2 border-t mt-4">
          <div className="mb-2">
            <h3 className="text-sm font-medium text-gray-700 flex items-center">
              <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
              Allergies
            </h3>
          </div>
          
          {medicalHistory.allergies && medicalHistory.allergies.length > 0 ? (
            <div className="space-y-1">
              {medicalHistory.allergies.map((allergy) => (
                <Badge 
                  key={allergy.id} 
                  variant="secondary" 
                  className="bg-amber-50 text-amber-800 border-amber-200 mr-2 mb-2"
                >
                  {allergy.allergen} ({allergy.severity})
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No known allergies.</p>
          )}
        </div>
      </Tabs>
    </Card>
  );
}