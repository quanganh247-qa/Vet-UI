import React, { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  PlusCircle,
  Search,
  Stethoscope,
  Pill,
  Receipt,
  Edit,
  Trash2,
  AlertCircle,
  FileText,
  Clock,
  DollarSign,
  Tag,
  Save,
  X} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
// Types for our catalog items
interface Disease {
  id: string;
  name: string;
  description: string;
  symptoms: string[];
  category: string;
  commonTreatments: string[];
  severity: "mild" | "moderate" | "severe";
}

interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  dosageForm: string;
  strength: string;
  manufacturer: string;
  price: number;
  stock: number;
  reorderPoint: number;
  description: string;
  sideEffects: string[];
  contraindications: string[];
}

interface Service {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  description: string;
  requiredEquipment: string[];
  prerequisites: string[];
}

const CatalogManagement: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("diseases");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isEditingItem, setIsEditingItem] = useState(false);
  
  // Sample data - replace with actual API calls
  const [diseases, setDiseases] = useState<Disease[]>([
    {
      id: "d1",
      name: "Canine Parvovirus",
      description: "A highly contagious viral disease affecting dogs",
      symptoms: ["Severe vomiting", "Bloody diarrhea", "Lethargy", "Loss of appetite"],
      category: "Viral",
      commonTreatments: ["Fluid therapy", "Antibiotics", "Anti-nausea medication"],
      severity: "severe"
    }
  ]);

  const [medicines, setMedicines] = useState<Medicine[]>([
    {
      id: "m1",
      name: "Amoxicillin",
      genericName: "Amoxicillin trihydrate",
      category: "Antibiotic",
      dosageForm: "Tablet",
      strength: "250mg",
      manufacturer: "VetPharm",
      price: 150000,
      stock: 500,
      reorderPoint: 100,
      description: "Broad-spectrum antibiotic",
      sideEffects: ["Diarrhea", "Vomiting"],
      contraindications: ["Known allergy to penicillins"]
    }
  ]);

  const [services, setServices] = useState<Service[]>([
    {
      id: "s1",
      name: "General Checkup",
      category: "Preventive Care",
      duration: 30,
      price: 350000,
      description: "Comprehensive physical examination",
      requiredEquipment: ["Stethoscope", "Thermometer"],
      prerequisites: ["Fasting not required"]
    }
  ]);

  // Function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(amount);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Catalog Management</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="diseases" className="flex items-center">
            <Stethoscope className="h-4 w-4 mr-2" />
            Diseases
          </TabsTrigger>
          <TabsTrigger value="medicines" className="flex items-center">
            <Pill className="h-4 w-4 mr-2" />
            Medicines
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center">
            <Receipt className="h-4 w-4 mr-2" />
            Services
          </TabsTrigger>
        </TabsList>

        {/* Common search and add button section */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={`Search ${activeTab}...`}
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsAddingItem(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New {activeTab.slice(0, -1)}
          </Button>
        </div>

        {/* Diseases Tab */}
        <TabsContent value="diseases">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {diseases.map((disease) => (
              <Card key={disease.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <div>
                      <span className="text-lg font-semibold">{disease.name}</span>
                      <Badge 
                        variant={
                          disease.severity === "severe" ? "destructive" :
                          disease.severity === "moderate" ? "secondary" : "default"
                        }
                        className={cn(
                          "ml-2",
                          disease.severity === "moderate" && "bg-yellow-100 text-yellow-800 border-yellow-200"
                        )}
                      >
                        {disease.severity}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingItem(true)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{disease.description}</p>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Symptoms:</h4>
                      <div className="flex flex-wrap gap-2">
                        {disease.symptoms.map((symptom, index) => (
                          <Badge key={index} variant="outline">{symptom}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Common Treatments:</h4>
                      <div className="flex flex-wrap gap-2">
                        {disease.commonTreatments.map((treatment, index) => (
                          <Badge key={index} variant="secondary">{treatment}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Medicines Tab */}
        <TabsContent value="medicines">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {medicines.map((medicine) => (
              <Card key={medicine.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <div>
                      <span className="text-lg font-semibold">{medicine.name}</span>
                      <span className="text-sm text-gray-500 block">{medicine.genericName}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingItem(true)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{medicine.dosageForm} • {medicine.strength}</span>
                      <span className="font-medium text-green-600">{formatCurrency(medicine.price)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">In Stock:</span>
                      <Badge variant={medicine.stock <= medicine.reorderPoint ? "destructive" : "default"}>
                        {medicine.stock} units
                      </Badge>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Side Effects:</h4>
                      <div className="flex flex-wrap gap-2">
                        {medicine.sideEffects.map((effect, index) => (
                          <Badge key={index} variant="outline" className="text-yellow-700 bg-yellow-50">
                            {effect}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <div>
                      <span className="text-lg font-semibold">{service.name}</span>
                      <Badge className="ml-2">{service.category}</Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingItem(true)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        {service.duration} minutes
                      </div>
                      <span className="font-medium text-green-600">{formatCurrency(service.price)}</span>
                    </div>
                    <p className="text-sm text-gray-600">{service.description}</p>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Required Equipment:</h4>
                      <div className="flex flex-wrap gap-2">
                        {service.requiredEquipment.map((equipment, index) => (
                          <Badge key={index} variant="outline">{equipment}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddingItem || isEditingItem} onOpenChange={() => {
        setIsAddingItem(false);
        setIsEditingItem(false);
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isAddingItem ? `Add New ${activeTab.slice(0, -1)}` : `Edit ${activeTab.slice(0, -1)}`}
            </DialogTitle>
          </DialogHeader>
          
          {/* Form content will vary based on activeTab */}
          <div className="space-y-4">
            {/* Example form fields - customize based on the active tab */}
            <div>
              <Label>Name</Label>
              <Input />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea />
            </div>
            {/* Add more fields based on the type being edited */}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddingItem(false);
              setIsEditingItem(false);
            }}>
              Cancel
            </Button>
            <Button>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CatalogManagement; 