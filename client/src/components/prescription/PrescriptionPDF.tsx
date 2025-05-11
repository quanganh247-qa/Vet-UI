import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Printer, Download, FileText, Calendar, Clock, Layers, Filter, Check, Pill, Upload, FileUp, AlertCircle } from "lucide-react";
import { Treatment, TreatmentPhase, PhaseMedicine } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useGetMedicineByPhaseId } from "@/hooks/use-medicine";
import { useUploadFile } from "@/hooks/use-file";
import { toast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { format } from "date-fns";

interface PrescriptionPDFProps {
  treatment: Treatment | null;
  phases: TreatmentPhase[];
  patientData: any;
  appointmentData: any;
  onPrint: () => void;
  onDownload: () => void;
  onUpload: () => void;
  isPdfGenerating: boolean;
}

const PrescriptionPDF: React.FC<PrescriptionPDFProps> = ({
  treatment,
  phases,
  patientData,
  appointmentData,
  onPrint,
  onDownload,
  isPdfGenerating
}) => {
  const [viewMode, setViewMode] = useState<"all" | "byPhase">("all");
  const [selectedPhases, setSelectedPhases] = useState<number[]>([]);
  const [selectedSinglePhase, setSelectedSinglePhase] = useState<TreatmentPhase | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const uploadFileMutation = useUploadFile();
  
  // Initialize selected phases with all phases on component mount
  useEffect(() => {
    if (phases && phases.length > 0) {
      setSelectedPhases(phases.map(phase => phase.id));
      // Set the first phase as default for single phase view
      setSelectedSinglePhase(phases[0] || null);
    }
  }, [phases]);
  
  // Handle selecting all phases
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPhases(phases.map(phase => phase.id));
    } else {
      setSelectedPhases([]);
    }
  };
  
  // Handle individual phase selection for multi-select
  const handlePhaseToggle = (phaseId: number, checked: boolean) => {
    if (checked) {
      setSelectedPhases(prev => [...prev, phaseId]);
    } else {
      setSelectedPhases(prev => prev.filter(id => id !== phaseId));
    }
  };
  
  // Handle selecting a single phase for single-phase view
  const handleSinglePhaseSelect = (phaseId: number) => {
    setSelectedSinglePhase(phases.find(p => p.id === phaseId) || null);
  };

  // Convert IDs to strings for API call as required by the hook
  const selectedTreatmentId = selectedSinglePhase?.treatment_id?.toString() || "0";
  const selectedPhaseId = selectedSinglePhase?.id?.toString() || "0";
  
  const { data: medicines } = useGetMedicineByPhaseId(
    Number(selectedTreatmentId), 
    Number(selectedPhaseId)
  );
  
  // Get medications based on view mode and selected phases
  const getSelectedMedications = () => {
    if (viewMode === "all") {
      if (selectedPhases.length === 0) {
        return [];
      }
      return phases
        .filter(phase => selectedPhases.includes(phase.id))
        .flatMap(phase => phase.medications || []);
    } else {
      // Single phase view
      if (!selectedSinglePhase) return [];
      
      // Check if medicines data exists and has the expected structure
      if (!medicines || !medicines.data) {
        console.log("No medicines data available");
        return [];
      }
      
      // First try to filter by phase_id if the data is an array
      if (Array.isArray(medicines.data)) {
        return medicines.data.filter((medicine: PhaseMedicine) => 
          medicine && medicine.phase_id === selectedSinglePhase.id
        );
      }
      
      // If it's not an array but data exists, try to use it directly
      return Array.isArray(medicines.data) ? medicines.data : [];
    }
  };
  
  // Function to handle file upload
  const handleUploadPrescription = async () => {
    if (!patientData?.petid) {
      toast({
        title: "Error",
        description: "Patient information not available for upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Get the prescription content element
      const prescriptionElement = document.getElementById('prescription-pdf-content');
      
      if (!prescriptionElement) {
        throw new Error('Prescription content not found');
      }

      // Hide the buttons during capturing
      const actionButtons = prescriptionElement.querySelector(".print\\:hidden");
      if (actionButtons) {
        actionButtons.classList.add("hidden");
      }
      
      toast({
        title: "Generating PDF",
        description: "Please wait while we prepare your prescription for upload...",
      });

      // Use html2canvas to capture the prescription element - same as download
      const canvas = await html2canvas(prescriptionElement, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: "#ffffff", // Ensure white background
      });
      
      // Create PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      // Generate filename with treatment information
      const fileName = `Prescription_${treatment?.id || 'Unknown'}_${format(new Date(), "yyyy-MM-dd")}`;
      
      // Convert PDF to blob to upload
      const pdfBlob = pdf.output('blob');
      
      // Create a File object from the Blob
      const file = new File([pdfBlob], `${fileName}.pdf`, { 
        type: 'application/pdf' 
      });

      // Upload the file using the mutation
      await uploadFileMutation.mutateAsync({
        file,
        pet_id: Number(patientData.petid)
      });

      toast({
        title: "Upload Success",
        description: "Prescription has been uploaded to patient records",
        className: "bg-green-50 border-green-200 text-green-800",
      });

      
    } catch (error) {
      console.error("Error uploading prescription:", error);
      toast({
        title: "Upload Failed",
        description: "An error occurred while uploading the prescription",
        variant: "destructive",
      });
    } finally {
      // Show buttons again
      const prescriptionElement = document.getElementById('prescription-pdf-content');
      const actionButtons = prescriptionElement?.querySelector(".print\\:hidden");
      if (actionButtons) {
        actionButtons.classList.remove("hidden");
      }
      setIsUploading(false);
    }
  };
  
  const selectedMedications = getSelectedMedications();
  const isAllSelected = phases.length > 0 && selectedPhases.length === phases.length;

  return (
    <div className="space-y-4">
      {/* View Mode Tabs */}
      <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setViewMode(value as "all" | "byPhase")}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Prescription View Mode</h3>
          <TabsList className="grid grid-cols-2 w-[300px]">
            <TabsTrigger value="all">All Phases</TabsTrigger>
            <TabsTrigger value="byPhase">Single Phase</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all" className="mt-0">
          {/* Multi-phase Selection Controls */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                <Filter className="h-4 w-4 mr-2 text-indigo-500" />
                Select Phases to Include
              </h3>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="select-all" 
                  checked={isAllSelected}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                />
                <Label htmlFor="select-all" className="text-xs font-medium cursor-pointer">
                  {isAllSelected ? "Deselect All" : "Select All Phases"}
                </Label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {phases.map(phase => (
                <div 
                  key={phase.id} 
                  className={cn(
                    "flex items-start space-x-2 p-2 rounded-md transition-colors",
                    selectedPhases.includes(phase.id) ? "bg-indigo-50 border border-indigo-100" : "hover:bg-gray-100 border border-transparent"
                  )}
                >
                  <Checkbox 
                    id={`phase-${phase.id}`} 
                    checked={selectedPhases.includes(phase.id)}
                    onCheckedChange={(checked) => handlePhaseToggle(phase.id, !!checked)}
                    className="mt-0.5"
                  />
                  <Label 
                    htmlFor={`phase-${phase.id}`} 
                    className="text-sm cursor-pointer flex-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{phase.phase_name}</span>
                      <Badge variant="outline" className={cn(
                        "text-xs",
                        phase.status === "Completed" ? "bg-green-50 text-green-700" : 
                        phase.status === "In Progress" ? "bg-blue-50 text-blue-700" : 
                        "bg-gray-50 text-gray-700"
                      )}>
                        {phase.status}
                      </Badge>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(phase.start_date).toLocaleDateString()}
                      <span className="mx-2">•</span>
                      <Pill className="h-3 w-3 mr-1" />
                      {phase.medications?.length || 0} medications
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="byPhase" className="mt-0">
          {/* Single Phase Selection */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
              <Layers className="h-4 w-4 mr-2 text-indigo-500" />
              Select Single Phase
            </h3>
            
            <div className="grid grid-cols-1 gap-2">
              {phases.map(phase => (
                <div 
                  key={phase.id}
                  onClick={() => handleSinglePhaseSelect(phase.id)}
                  className={cn(
                    "p-3 rounded-md border cursor-pointer transition-all",
                    selectedSinglePhase?.id === phase.id 
                      ? "bg-indigo-50 border-indigo-200 shadow-sm" 
                      : "border-gray-200 hover:border-indigo-200 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center">
                    {selectedSinglePhase?.id === phase.id && (
                      <Check className="h-4 w-4 text-indigo-600 mr-2" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{phase.phase_name}</span>
                        <Badge variant="outline" className={cn(
                          "text-xs",
                          phase.status === "Completed" ? "bg-green-50 text-green-700" : 
                          phase.status === "In Progress" ? "bg-blue-50 text-blue-700" : 
                          "bg-gray-50 text-gray-700"
                        )}>
                          {phase.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{phase.description}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(phase.start_date).toLocaleDateString()}
                        <span className="mx-2">•</span>
                        <Pill className="h-3 w-3 mr-1" />
                        {phase.medications?.length || 0} medications
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Prescription PDF Content */}
      <div id="prescription-pdf-content" className="bg-white p-6 border rounded-lg">
        {/* Header */}
        <div className="mb-8 border-b pb-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-indigo-800">VetClinic</h2>
              <p className="text-gray-500">Professional Veterinary Care</p>
              <p className="text-gray-500 mt-1">123 Animal Health Street, Vet City</p>
              <p className="text-gray-500">Phone: (123) 456-7890</p>
            </div>
            <div className="text-right">
              <h3 className="font-bold text-lg text-gray-800">PRESCRIPTION</h3>
              <p className="text-gray-500">Date: {new Date().toLocaleDateString()}</p>
              <p className="text-gray-500">Treatment ID: {treatment?.id}</p>
              {viewMode === "byPhase" && selectedSinglePhase && (
                <p className="text-gray-500">Phase: {selectedSinglePhase.phase_name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Patient & Doctor Information */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="border-r pr-4">
            <h4 className="font-semibold text-gray-600 mb-2">PATIENT INFORMATION</h4>
            <p className="text-gray-800">{patientData?.pet_name}</p>
            <p className="text-gray-600">Species: {patientData?.pet_type}</p>
            <p className="text-gray-600">Breed: {patientData?.breed}</p>
            <p className="text-gray-600">Age: {patientData?.age} years</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-600 mb-2">PRESCRIBING VETERINARIAN</h4>
            <p className="text-gray-800">{appointmentData?.doctor?.doctor_name}</p>
            <p className="text-gray-600">License #: VET-{appointmentData?.doctor?.doctor_id || "0000"}</p>
            <p className="text-gray-600">Appointment Date: {appointmentData?.time ? new Date(appointmentData.time).toLocaleDateString() : "N/A"}</p>
          </div>
        </div>

        {/* Treatment Information */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-600 mb-2">TREATMENT</h4>
          <p className="text-gray-800">{treatment?.name}</p>
          <p className="text-gray-600">Type: {treatment?.type}</p>
          <p className="text-gray-600">Start Date: {treatment?.start_date ? new Date(treatment.start_date).toLocaleDateString() : "N/A"}</p>
          <p className="text-gray-600">Status: {treatment?.status}</p>
          {treatment?.diseases && (
            <p className="text-gray-600">Condition: {treatment.diseases}</p>
          )}
        </div>

        {/* Medications Table */}
        <div className="mb-8">
          <h4 className="font-semibold text-gray-600 mb-4 border-b pb-2 flex items-center justify-between">
            <span>
              PRESCRIBED MEDICATIONS 
              {viewMode === "byPhase" && selectedSinglePhase && (
                <span className="ml-2 text-sm font-normal text-indigo-600">
                  (Phase: {selectedSinglePhase.phase_name})
                </span>
              )}
              {viewMode === "all" && selectedPhases.length > 0 && selectedPhases.length < phases.length && (
                <span className="text-xs font-normal text-gray-500 ml-2">
                  (Showing medications from {selectedPhases.length} selected phases)
                </span>
              )}
            </span>
            
            <span className="text-xs text-gray-500">
              {selectedMedications.length} items
            </span>
          </h4>
          
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr className="text-left">
                <th className="py-2 px-1 font-semibold text-gray-600">Medication</th>
                <th className="py-2 px-1 font-semibold text-gray-600">Dosage</th>
                <th className="py-2 px-1 font-semibold text-gray-600">Frequency</th>
                <th className="py-2 px-1 font-semibold text-gray-600">Duration</th>
                <th className="py-2 px-1 font-semibold text-gray-600">Quantity</th>
                {viewMode === "all" && <th className="py-2 px-1 font-semibold text-gray-600">Phase</th>}
              </tr>
            </thead>
            <tbody>
              {selectedMedications.length > 0 ? (
                selectedMedications.map((med: PhaseMedicine, idx: number) => {
                  // Find phase this medication belongs to
                  const phase = phases.find(p => p.medications?.some(m => m.medicine_id === med.medicine_id));
                  
                  return (
                    <tr key={`${med.medicine_id}-${idx}`} className="border-b border-gray-100">
                      <td className="py-3 px-1 text-gray-800">{med.medicine_name}</td>
                      <td className="py-3 px-1 text-gray-600">{med.dosage}</td>
                      <td className="py-3 px-1 text-gray-600">{med.frequency}</td>
                      <td className="py-3 px-1 text-gray-600">{med.duration || "As directed"}</td>
                      <td className="py-3 px-1 text-gray-600">{med.quantity || 1}</td>
                      {viewMode === "all" && (
                        <td className="py-3 px-1">
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 text-xs">
                            {phase?.phase_name || ""}
                          </Badge>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={viewMode === "all" ? 6 : 5} className="py-4 text-center text-gray-500">
                    {viewMode === "all" 
                      ? "No medications from selected phases" 
                      : "No medications in selected phase"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Notes & Signature */}
        <div className="border-t pt-6 mt-8">
          <div className="mb-8">
            <h4 className="font-semibold text-gray-600 mb-2">SPECIAL INSTRUCTIONS</h4>
            {viewMode === "byPhase" && selectedSinglePhase?.description ? (
              <div>
                <p className="text-gray-700">{selectedSinglePhase.description}</p>
                <p className="text-gray-500 mt-2 text-sm italic">Phase Notes</p>

                {treatment?.notes && (
                  <>
                    <p className="text-gray-700 mt-4 pt-4 border-t">{treatment?.notes}</p>
                    <p className="text-gray-500 text-sm italic">Treatment Notes</p>
                  </>
                )}
              </div>
            ) : (
              <p className="text-gray-700">{treatment?.notes || "No special instructions provided."}</p>
            )}
          </div>

          <div className="flex justify-between mt-12">
            <div className="w-1/2 pr-4">
              <p className="text-gray-500 text-xs mb-10">This prescription is valid for 30 days from the issue date.</p>
            </div>
            <div className="w-1/2 border-t pt-2">
              <p className="text-center font-semibold">{appointmentData?.doctor?.doctor_name}</p>
              <p className="text-center text-gray-500 text-sm">Veterinarian Signature</p>
            </div>
          </div>
        </div>

        {/* Print buttons - will be hidden during PDF generation */}
        <div className="mt-8 pt-4 border-t flex justify-center gap-4 print:hidden">
          <Button 
            variant="outline" 
            size="sm"
            className="border-gray-200"
            onClick={onPrint}
            disabled={isPdfGenerating || isUploading}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="border-gray-200"
            onClick={onDownload}
            disabled={isPdfGenerating || isUploading}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="border-gray-200"
            onClick={handleUploadPrescription}
            disabled={isPdfGenerating || isUploading}
          >
            {isUploading ? (
              <>
                <div className="h-4 w-4 border-2 border-indigo-600 border-opacity-50 border-t-transparent rounded-full animate-spin mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </div>
        
        {!patientData?.petid && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-center text-amber-700 text-sm">
            <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
            Patient information is incomplete. Upload feature may not work properly.
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionPDF; 