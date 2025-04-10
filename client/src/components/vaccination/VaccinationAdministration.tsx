import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CheckCircle, AlertCircle, Syringe, Plus, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Vaccination } from "@/types";
import { saveVaccinationRecord, SaveVaccinationRequest } from "@/services/vaccine-services";

interface VaccinationAdministrationProps {
  appointmentId: string;
  petId: string;
  onComplete: () => void;
  onCancel: () => void;
}

const VaccinationAdministration: React.FC<VaccinationAdministrationProps> = ({
  appointmentId,
  petId,
  onComplete,
  onCancel,
}) => {
  const { toast } = useToast();
  
  const [administrationSite, setAdministrationSite] = useState<string>("subcutaneous");
  const [administrationSites, setAdministrationSites] = useState<string[]>([
    "subcutaneous", 
    "intramuscular", 
    "intradermal", 
    "intranasal"
  ]);
  
  const [vaccinationData, setVaccinationData] = useState<Partial<Vaccination>>({
    pet_id: Number(petId),
    vaccine_name: "",
    date_administered: new Date().toISOString().split("T")[0],
    next_due_date: "",
    vaccine_provider: "",
    batch_number: "",
    notes: "",
  });

  const [vaccineOptions, setVaccineOptions] = useState([
    { name: "Rabies", manufacturer: "PetVax", interval: "12" },
    { name: "DHPP", manufacturer: "VetGuard", interval: "12" },
    { name: "Bordetella", manufacturer: "ImmunoPet", interval: "6" },
    { name: "Leptospirosis", manufacturer: "AnimalShield", interval: "12" },
    { name: "Feline Distemper", manufacturer: "FeliFort", interval: "12" },
    { name: "Feline Leukemia", manufacturer: "CatGuard", interval: "12" },
  ]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [vaccinationSiteImage, setVaccinationSiteImage] = useState<string>("/assets/vaccination-sites/subcutaneous.png");

  // Update next due date based on vaccine selection
  const handleVaccineSelect = (vaccineName: string) => {
    const selectedVaccine = vaccineOptions.find(v => v.name === vaccineName);
    if (selectedVaccine) {
      const today = new Date();
      const nextDueDate = new Date(today);
      nextDueDate.setMonth(today.getMonth() + parseInt(selectedVaccine.interval));
      
      setVaccinationData({
        ...vaccinationData,
        vaccine_name: vaccineName,
        vaccine_provider: selectedVaccine.manufacturer,
        next_due_date: nextDueDate.toISOString().split("T")[0],
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVaccinationData({
      ...vaccinationData,
      [name]: value,
    });
  };

  const handleAdministrationSiteChange = (site: string) => {
    setAdministrationSite(site);
    setVaccinationSiteImage(`/assets/vaccination-sites/${site}.png`);
  };

  const validateForm = () => {
    if (!vaccinationData.vaccine_name) {
      toast({
        title: "Missing Information",
        description: "Please select a vaccine",
        variant: "destructive",
      });
      return false;
    }
    
    if (!vaccinationData.batch_number) {
      toast({
        title: "Missing Information",
        description: "Please enter the batch number",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Call the saveVaccinationRecord function with the required data
      await saveVaccinationRecord({
        pet_id: Number(petId),
        vaccine_name: vaccinationData.vaccine_name || "",
        date_administered: vaccinationData.date_administered || new Date().toISOString().split("T")[0],
        next_due_date: vaccinationData.next_due_date || "",
        vaccine_provider: vaccinationData.vaccine_provider || "",
        batch_number: vaccinationData.batch_number || "",
        notes: vaccinationData.notes || "",
        administration_site: administrationSite,
        appointment_id: appointmentId
      });
      
      setIsCompleted(true);
      toast({
        title: "Vaccination Administered",
        description: "Vaccination has been successfully recorded",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      console.error("Error administering vaccination:", error);
      toast({
        title: "Error",
        description: "Failed to record vaccination. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  return (
    <Card className="w-full shadow-md border-blue-100">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Syringe className="h-5 w-5 text-blue-500 mr-2" />
            <CardTitle className="text-lg text-blue-700">Vaccination Administration</CardTitle>
          </div>
          {isCompleted && (
            <Badge className="bg-green-100 text-green-800 flex items-center">
              <Check className="h-3.5 w-3.5 mr-1" />
              <span>Completed</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 pb-2">
        {isCompleted ? (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Vaccination Complete</h3>
            <p className="text-gray-500 text-center mb-6">
              {vaccinationData.vaccine_name} vaccine has been administered successfully.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 w-full">
              <h4 className="font-medium text-blue-700 mb-2">Vaccination Details</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <p className="text-gray-500">Vaccine</p>
                  <p className="font-medium">{vaccinationData.vaccine_name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Batch #</p>
                  <p className="font-medium">{vaccinationData.batch_number}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium">{vaccinationData.date_administered}</p>
                </div>
                <div>
                  <p className="text-gray-500">Next Due</p>
                  <p className="font-medium">{vaccinationData.next_due_date}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Administration Site</p>
                  <p className="font-medium capitalize">{administrationSite}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="vaccine">Select Vaccine</Label>
                  <Select 
                    onValueChange={handleVaccineSelect}
                    value={vaccinationData.vaccine_name}
                  >
                    <SelectTrigger id="vaccine" className="w-full">
                      <SelectValue placeholder="Select a vaccine" />
                    </SelectTrigger>
                    <SelectContent>
                      {vaccineOptions.map((vaccine) => (
                        <SelectItem key={vaccine.name} value={vaccine.name}>
                          {vaccine.name} ({vaccine.manufacturer})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="batch_number">Batch Number</Label>
                  <Input
                    id="batch_number"
                    name="batch_number"
                    value={vaccinationData.batch_number}
                    onChange={handleInputChange}
                    placeholder="Enter vaccine batch number"
                  />
                </div>
                
                <div>
                  <Label htmlFor="date_administered">Administration Date</Label>
                  <Input
                    id="date_administered"
                    name="date_administered"
                    type="date"
                    value={vaccinationData.date_administered}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="next_due_date">Next Due Date</Label>
                  <Input
                    id="next_due_date"
                    name="next_due_date"
                    type="date"
                    value={vaccinationData.next_due_date || ""}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={vaccinationData.notes}
                    onChange={handleInputChange}
                    placeholder="Enter any observations or reactions"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>Administration Site</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {administrationSites.map((site) => (
                      <Button
                        key={site}
                        type="button"
                        variant={administrationSite === site ? "default" : "outline"}
                        className={`justify-start text-sm capitalize ${
                          administrationSite === site
                            ? "bg-blue-600 text-white"
                            : "text-gray-700"
                        }`}
                        onClick={() => handleAdministrationSiteChange(site)}
                      >
                        {site}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="border rounded-md p-4 mt-4">
                  <h3 className="font-medium text-gray-700 mb-2 text-center">Recommended Injection Site</h3>
                  <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center p-4">
                    {/* Would be replaced with actual vaccination site image */}
                    <div className="text-center text-gray-500 text-sm">
                      <p className="capitalize">{administrationSite} injection site</p>
                      <p className="text-xs mt-1">Image would show recommended site</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-amber-800 text-sm">Important Notes</h3>
                      <p className="text-amber-700 text-xs mt-1">
                        Always monitor the patient for at least 15-30 minutes after vaccination 
                        to observe for any immediate adverse reactions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between py-4 bg-gray-50 border-t">
        {isCompleted ? (
          <Button
            onClick={handleComplete}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Continue to Next Step
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2">Processing...</span>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </>
              ) : (
                "Record Vaccination"
              )}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default VaccinationAdministration;

// Helper component for Badge
const Badge = ({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) => {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className || ''}`}>
      {children}
    </span>
  );
}; 