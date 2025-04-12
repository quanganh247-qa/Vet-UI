import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAppointmentData } from "@/hooks/use-appointment";
import { usePatientData } from "@/hooks/use-pet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, MinusCircle, Save, ArrowLeft, Printer, AlertCircle, CheckCircle, Info, Receipt } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import WorkflowNavigation from "@/components/WorkflowNavigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Define types for prescription items
interface MedicationItem {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
}

const PrescriptionPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { data: appointment, isLoading: isAppointmentLoading } = useAppointmentData(id);
  const { data: patient, isLoading: isPatientLoading } = usePatientData(appointment?.pet?.pet_id);
  
  // Medication state
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [newMedication, setNewMedication] = useState<MedicationItem>({
    id: Date.now(),
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
    quantity: 1
  });
  
  // Additional prescription fields
  const [prescriptionNotes, setPrescriptionNotes] = useState("");
  const [refills, setRefills] = useState(0);
  const [warningChecked, setWarningChecked] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  
  // Common medications for quick selection
  const commonMedications = [
    { name: "Amoxicillin", dosage: "10 mg/kg", frequency: "Twice daily", duration: "7 days" },
    { name: "Prednisolone", dosage: "0.5 mg/kg", frequency: "Once daily", duration: "5 days" },
    { name: "Meloxicam", dosage: "0.1 mg/kg", frequency: "Once daily", duration: "3 days" },
    { name: "Metronidazole", dosage: "15 mg/kg", frequency: "Twice daily", duration: "5 days" },
  ];

  const addMedication = () => {
    if (!newMedication.name || !newMedication.dosage) {
      toast({
        title: "Missing information",
        description: "Please fill in at least the medication name and dosage",
        variant: "destructive",
      });
      return;
    }
    
    setMedications([...medications, { ...newMedication, id: Date.now() }]);
    
    // Reset new medication form
    setNewMedication({
      id: Date.now() + 1,
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
      quantity: 1
    });
  };

  const removeMedication = (id: number) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  const handleQuickAdd = (medication: any) => {
    setNewMedication({
      ...newMedication,
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      duration: medication.duration,
    });
  };

  const savePrescription = async () => {
    if (medications.length === 0) {
      toast({
        title: "No medications added",
        description: "Please add at least one medication to the prescription",
        variant: "destructive",
      });
      return;
    }

    try {
      // Here you would implement the API call to save the prescription
      // For now, we'll just show a success message
      toast({
        title: "Prescription saved",
        description: "Prescription has been saved successfully",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      
      // Show the invoice dialog after saving
      setShowInvoiceDialog(true);
    } catch (error) {
      toast({
        title: "Error saving prescription",
        description: "There was a problem saving the prescription. Please try again.",
        variant: "destructive",
      });
    }
  };

  const navigateToInvoice = () => {
    // Navigate to the invoice page
    navigate(`/appointment/${id}/patient/${appointment?.pet?.pet_id}/prescription/invoice`);
  };

  const printPrescription = () => {
    window.print();
  };

  if (isAppointmentLoading || isPatientLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-t-indigo-600 border-b-indigo-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          <p className="text-indigo-600 font-medium">Loading prescription data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4">
      <div className="flex justify-between items-center mb-4">
        <Button 
          variant="ghost" 
          className="flex items-center text-gray-600"
          onClick={() => navigate(`/appointment/${id}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Appointment
        </Button>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="flex items-center"
            onClick={printPrescription}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button 
            variant="outline"
            className="flex items-center"
            onClick={navigateToInvoice}
            disabled={medications.length === 0}
          >
            <Receipt className="h-4 w-4 mr-2" />
            Generate Invoice
          </Button>
          <Button 
            className="flex items-center"
            onClick={savePrescription}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Prescription
          </Button>
        </div>
      </div>

      <WorkflowNavigation
        appointmentId={id}
        petId={appointment?.pet?.pet_id?.toString()}
        currentStep="prescription"
      />

      {/* Invoice Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Prescription Saved Successfully</DialogTitle>
            <DialogDescription>
              Your prescription has been saved. Would you like to generate an invoice now?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>
              Later
            </Button>
            <Button onClick={navigateToInvoice} className="bg-indigo-600 hover:bg-indigo-700">
              <Receipt className="h-4 w-4 mr-2" />
              Generate Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <PlusCircle className="h-5 w-5 mr-2 text-indigo-600" />
                Prescription Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="new">
                <TabsList className="mb-4">
                  <TabsTrigger value="new">New Medication</TabsTrigger>
                  <TabsTrigger value="quick">Quick Add</TabsTrigger>
                </TabsList>
                
                <TabsContent value="new" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Medication Name
                      </label>
                      <Input 
                        value={newMedication.name}
                        onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                        placeholder="Enter medication name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dosage
                      </label>
                      <Input 
                        value={newMedication.dosage}
                        onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                        placeholder="e.g., 10mg/kg"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency
                      </label>
                      <Select
                        value={newMedication.frequency}
                        onValueChange={(value) => setNewMedication({...newMedication, frequency: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Once daily">Once daily</SelectItem>
                          <SelectItem value="Twice daily">Twice daily</SelectItem>
                          <SelectItem value="Three times daily">Three times daily</SelectItem>
                          <SelectItem value="Every 12 hours">Every 12 hours</SelectItem>
                          <SelectItem value="Every 8 hours">Every 8 hours</SelectItem>
                          <SelectItem value="As needed">As needed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration
                      </label>
                      <Select
                        value={newMedication.duration}
                        onValueChange={(value) => setNewMedication({...newMedication, duration: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3 days">3 days</SelectItem>
                          <SelectItem value="5 days">5 days</SelectItem>
                          <SelectItem value="7 days">7 days</SelectItem>
                          <SelectItem value="10 days">10 days</SelectItem>
                          <SelectItem value="14 days">14 days</SelectItem>
                          <SelectItem value="30 days">30 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <Input 
                        type="number" 
                        min="1"
                        value={newMedication.quantity}
                        onChange={(e) => setNewMedication({...newMedication, quantity: parseInt(e.target.value) || 1})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Instructions
                    </label>
                    <Textarea 
                      value={newMedication.instructions}
                      onChange={(e) => setNewMedication({...newMedication, instructions: e.target.value})}
                      placeholder="e.g., Give with food"
                      rows={2}
                    />
                  </div>
                  
                  <Button 
                    className="w-full flex items-center justify-center mt-4"
                    onClick={addMedication}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Medication
                  </Button>
                </TabsContent>
                
                <TabsContent value="quick">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {commonMedications.map((med, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="justify-start h-auto py-3 px-4"
                        onClick={() => handleQuickAdd(med)}
                      >
                        <div className="text-left">
                          <div className="font-medium">{med.name}</div>
                          <div className="text-xs text-gray-500">
                            {med.dosage} • {med.frequency} • {med.duration}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
              
              {/* Medication List */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Prescription Items</h3>
                
                {medications.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No medications added yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {medications.map((med) => (
                      <div 
                        key={med.id} 
                        className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-start shadow-sm"
                      >
                        <div>
                          <div className="font-medium text-gray-800">{med.name}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            <span className="inline-block bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-medium mr-2">
                              {med.dosage}
                            </span>
                            <span className="text-gray-500">
                              {med.frequency} for {med.duration} • Qty: {med.quantity}
                            </span>
                          </div>
                          {med.instructions && (
                            <div className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Instructions:</span> {med.instructions}
                            </div>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-500 hover:text-red-600"
                          onClick={() => removeMedication(med.id)}
                        >
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Additional Prescription Details */}
              <div className="mt-8 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <Textarea 
                    value={prescriptionNotes}
                    onChange={(e) => setPrescriptionNotes(e.target.value)}
                    placeholder="Enter any additional notes for the prescription"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Refills
                  </label>
                  <Select
                    value={refills.toString()}
                    onValueChange={(value) => setRefills(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select number of refills" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 - No refills</SelectItem>
                      <SelectItem value="1">1 refill</SelectItem>
                      <SelectItem value="2">2 refills</SelectItem>
                      <SelectItem value="3">3 refills</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-start p-4 bg-yellow-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-yellow-700">
                      I confirm that I have checked for potential drug interactions and allergies for this patient.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`mt-2 ${warningChecked ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white'}`}
                      onClick={() => setWarningChecked(!warningChecked)}
                    >
                      {warningChecked ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <Info className="h-4 w-4 mr-2" />
                      )}
                      {warningChecked ? 'Confirmed' : 'Confirm'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Patient Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patient Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <img
                    src={patient?.data_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient?.name || 'Pet')}`}
                    alt={patient?.name}
                    className="h-12 w-12 rounded-full mr-3 object-cover"
                  />
                  <div>
                    <div className="font-medium text-gray-800">{patient?.name}</div>
                    <div className="text-sm text-gray-500">
                      {patient?.breed} • {patient?.age} years old
                    </div>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-100">
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Owner:</span> {appointment?.owner?.owner_name}
                  </div>
                  <div className="text-sm mt-1">
                    <span className="font-medium text-gray-700">Diagnosis:</span> {appointment?.reason || 'Not specified'}
                  </div>
                  <div className="text-sm mt-1">
                    <span className="font-medium text-gray-700">Allergies:</span> {patient?.allergies || 'None known'}
                  </div>
                  <div className="text-sm mt-1">
                    <span className="font-medium text-gray-700">Weight:</span> {patient?.weight || 'N/A'} kg
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Prescription History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No previous prescriptions</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionPage; 