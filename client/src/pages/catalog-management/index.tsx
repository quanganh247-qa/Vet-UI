import React, { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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
  X,
  CheckCircle2,
  Loader2,
  ChevronRight
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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

// Helper components
const EmptyState = ({ type, onAdd }: { type: string; onAdd: () => void }) => (
  <div className="flex flex-col items-center justify-center p-8 bg-indigo-50 rounded-lg border border-dashed border-indigo-200 h-64">
    <div className="rounded-full bg-indigo-100 p-3 mb-4">
      {type === "diseases" ? (
        <Stethoscope className="h-6 w-6 text-indigo-600" />
      ) : type === "medicines" ? (
        <Pill className="h-6 w-6 text-indigo-600" />
      ) : (
        <Receipt className="h-6 w-6 text-indigo-600" />
      )}
    </div>
    <h3 className="text-lg font-medium mb-2 text-indigo-700">No {type} found</h3>
    <p className="text-sm text-indigo-500 text-center mb-4">
      Get started by creating your first {type.slice(0, -1)} entry
    </p>
    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={onAdd}>
      <PlusCircle className="h-4 w-4 mr-2" />
      Add {type.slice(0, -1)}
    </Button>
  </div>
);

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND"
  }).format(amount);
};

// Main component
const CatalogManagement: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("diseases");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
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

  // Memoized filtered items
  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) {
      return { diseases, medicines, services };
    }
    
    return {
      diseases: diseases.filter(d => 
        d.name.toLowerCase().includes(term) || 
        d.description.toLowerCase().includes(term) ||
        d.category.toLowerCase().includes(term)
      ),
      medicines: medicines.filter(m => 
        m.name.toLowerCase().includes(term) || 
        m.genericName.toLowerCase().includes(term) ||
        m.category.toLowerCase().includes(term)
      ),
      services: services.filter(s => 
        s.name.toLowerCase().includes(term) || 
        s.description.toLowerCase().includes(term) ||
        s.category.toLowerCase().includes(term)
      )
    };
  }, [diseases, medicines, services, searchTerm]);

  const handleOpenAddDialog = () => {
    setIsAddingItem(true);
  };

  const handleOpenEditDialog = (id: string) => {
    setSelectedItemId(id);
    setIsEditingItem(true);
  };

  const handleOpenDeleteDialog = (id: string) => {
    setSelectedItemId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteItem = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      if (activeTab === "diseases") {
        setDiseases(prev => prev.filter(item => item.id !== selectedItemId));
      } else if (activeTab === "medicines") {
        setMedicines(prev => prev.filter(item => item.id !== selectedItemId));
      } else if (activeTab === "services") {
        setServices(prev => prev.filter(item => item.id !== selectedItemId));
      }
      
      setDeleteConfirmOpen(false);
      setSelectedItemId("");
      setIsLoading(false);
      
      toast({
        title: "Item deleted successfully",
        description: `The ${activeTab.slice(0, -1)} has been removed from the catalog.`,
        variant: "default",
      });
    }, 500); // Simulate API call
  };

  const handleSaveItem = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      setIsAddingItem(false);
      setIsEditingItem(false);
      setIsLoading(false);
      
      toast({
        title: isAddingItem ? "Item added successfully" : "Item updated successfully",
        description: `The ${activeTab.slice(0, -1)} has been ${isAddingItem ? "added to" : "updated in"} the catalog.`,
        variant: "default",
      });
    }, 500); // Simulate API call
  };

  // Add tab steps array for workflow-style navigation
  const tabSteps = [
    { id: "diseases", label: "Diseases", icon: Stethoscope },
    { id: "medicines", label: "Medicines", icon: Pill },
    { id: "services", label: "Services", icon: Receipt }
  ];
  
  const activeIndex = tabSteps.findIndex(tab => tab.id === activeTab);
  const progressPercentage = ((activeIndex + 1) / tabSteps.length) * 100;

  return (
    <div className="container mx-auto py-6">
      <div className="bg-white rounded-lg border border-indigo-100 shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-indigo-900">Catalog Management</h1>
        </div>

        {/* Workflow-style navigation */}
        <div className="flex flex-col space-y-3 mb-6">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
              Catalog Sections
            </div>
            <div className="text-xs text-gray-500 font-medium">
              Section {activeIndex + 1} of {tabSteps.length}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Tabs as workflow steps */}
          <div className="relative flex items-center space-x-1 overflow-x-auto hide-scrollbar py-2 px-1">
            {tabSteps.map((step, index) => {
              const isCurrent = step.id === activeTab;
              const isPast = index < activeIndex;
              const isFuture = index > activeIndex;
              const IconComponent = step.icon;
              
              return (
                <React.Fragment key={step.id}>
                  <Button
                    variant={isCurrent ? "default" : "outline"}
                    size="sm"
                    className={`
                      flex items-center gap-1.5 whitespace-nowrap transition-all duration-200
                      ${isCurrent ? 'bg-indigo-600 text-white shadow-md border-transparent scale-105 hover:bg-indigo-700' : ''}
                      ${isPast ? 'border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : ''}
                      ${isFuture ? 'border-gray-200 text-gray-500 hover:border-indigo-200 hover:text-indigo-600' : ''}
                    `}
                    onClick={() => setActiveTab(step.id)}
                  >
                    <IconComponent className={`h-4 w-4 ${isCurrent ? 'text-white' : isPast ? 'text-indigo-500' : 'text-gray-400'}`} />
                    <span className="text-xs font-medium">{step.label}</span>
                  </Button>
                  
                  {index < tabSteps.length - 1 && (
                    <ChevronRight className={`h-4 w-4 flex-shrink-0 ${
                      index < activeIndex ? 'text-indigo-400' : 'text-gray-300'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Search and add section */}
        <div className="flex justify-between items-center mb-6 bg-indigo-50 p-3 rounded-md border border-indigo-100">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-400" />
            <Input
              placeholder={`Search ${activeTab}...`}
              className="pl-10 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleOpenAddDialog} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New {activeTab.slice(0, -1)}
          </Button>
        </div>

        {/* Current active content */}
        <div>
          {activeTab === "diseases" && (
            filteredItems.diseases.length === 0 ? (
              <EmptyState type="diseases" onAdd={handleOpenAddDialog} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.diseases.map((disease) => (
                  <Card key={disease.id} className="hover:shadow-md transition-shadow border border-indigo-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex justify-between items-start">
                        <div>
                          <span className="text-lg font-semibold text-indigo-900">{disease.name}</span>
                          <Badge 
                            variant={
                              disease.severity === "severe" ? "destructive" :
                              disease.severity === "moderate" ? "secondary" : "default"
                            }
                            className={cn(
                              "ml-2",
                              disease.severity === "severe" && "bg-red-100 text-red-800 border-red-200",
                              disease.severity === "moderate" && "bg-yellow-100 text-yellow-800 border-yellow-200"
                            )}
                          >
                            {disease.severity}
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50" onClick={() => handleOpenEditDialog(disease.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleOpenDeleteDialog(disease.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">{disease.description}</p>
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-xs font-medium text-indigo-700 uppercase tracking-wide mb-1">Symptoms:</h4>
                          <div className="flex flex-wrap gap-2">
                            {disease.symptoms.map((symptom, index) => (
                              <Badge key={index} variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                                {symptom}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-medium text-indigo-700 uppercase tracking-wide mb-1">Common Treatments:</h4>
                          <div className="flex flex-wrap gap-2">
                            {disease.commonTreatments.map((treatment, index) => (
                              <Badge key={index} className="bg-indigo-100 text-indigo-700 border-indigo-200">{treatment}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          )}

          {activeTab === "medicines" && (
            filteredItems.medicines.length === 0 ? (
              <EmptyState type="medicines" onAdd={handleOpenAddDialog} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.medicines.map((medicine) => (
                  <Card key={medicine.id} className="hover:shadow-md transition-shadow border border-indigo-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex justify-between items-start">
                        <div>
                          <span className="text-lg font-semibold text-indigo-900">{medicine.name}</span>
                          <span className="text-sm text-indigo-500 block">{medicine.genericName}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50" onClick={() => handleOpenEditDialog(medicine.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleOpenDeleteDialog(medicine.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-indigo-600">{medicine.dosageForm} • {medicine.strength}</span>
                          <span className="font-medium text-green-600">{formatCurrency(medicine.price)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-indigo-500">In Stock:</span>
                          <Badge variant={medicine.stock <= medicine.reorderPoint ? "destructive" : "default"}
                            className={medicine.stock <= medicine.reorderPoint ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                            {medicine.stock} units
                          </Badge>
                        </div>
                        <div>
                          <h4 className="text-xs font-medium text-indigo-700 uppercase tracking-wide mb-1">Side Effects:</h4>
                          <div className="flex flex-wrap gap-2">
                            {medicine.sideEffects.map((effect, index) => (
                              <Badge key={index} variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
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
            )
          )}

          {activeTab === "services" && (
            filteredItems.services.length === 0 ? (
              <EmptyState type="services" onAdd={handleOpenAddDialog} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.services.map((service) => (
                  <Card key={service.id} className="hover:shadow-md transition-shadow border border-indigo-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex justify-between items-start">
                        <div>
                          <span className="text-lg font-semibold text-indigo-900">{service.name}</span>
                          <Badge className="ml-2 bg-indigo-100 text-indigo-700 border-indigo-200">{service.category}</Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50" onClick={() => handleOpenEditDialog(service.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleOpenDeleteDialog(service.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center text-sm text-indigo-600">
                            <Clock className="h-4 w-4 mr-1" />
                            {service.duration} minutes
                          </div>
                          <span className="font-medium text-green-600">{formatCurrency(service.price)}</span>
                        </div>
                        <p className="text-sm text-gray-600">{service.description}</p>
                        <div>
                          <h4 className="text-xs font-medium text-indigo-700 uppercase tracking-wide mb-1">Required Equipment:</h4>
                          <div className="flex flex-wrap gap-2">
                            {service.requiredEquipment.map((equipment, index) => (
                              <Badge key={index} variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                                {equipment}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Add/Edit Dialog - updating styles */}
      <Dialog open={isAddingItem || isEditingItem} onOpenChange={(open) => {
        if (!open) {
          setIsAddingItem(false);
          setIsEditingItem(false);
        }
      }}>
        <DialogContent className="sm:max-w-[600px] border border-indigo-200">
          <DialogHeader className="border-b border-indigo-100 pb-4">
            <DialogTitle className="text-indigo-900">
              {isAddingItem ? `Add New ${activeTab.slice(0, -1)}` : `Edit ${activeTab.slice(0, -1)}`}
            </DialogTitle>
            <DialogDescription className="text-indigo-500">
              Fill in the details below to {isAddingItem ? "create" : "update"} this {activeTab.slice(0, -1)} in your catalog.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] px-1">
            <div className="space-y-4 p-1">
              {activeTab === "diseases" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="mb-1.5 block">Name</Label>
                      <Input id="name" placeholder="Enter disease name" />
                    </div>
                    <div>
                      <Label htmlFor="category" className="mb-1.5 block">Category</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viral">Viral</SelectItem>
                          <SelectItem value="bacterial">Bacterial</SelectItem>
                          <SelectItem value="parasitic">Parasitic</SelectItem>
                          <SelectItem value="fungal">Fungal</SelectItem>
                          <SelectItem value="genetic">Genetic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="mb-1.5 block">Description</Label>
                    <Textarea id="description" placeholder="Enter disease description" rows={3} />
                  </div>
                  
                  <div>
                    <Label htmlFor="symptoms" className="mb-1.5 block">Symptoms (comma separated)</Label>
                    <Textarea id="symptoms" placeholder="Fever, Cough, Loss of appetite, etc." rows={2} />
                  </div>
                  
                  <div>
                    <Label htmlFor="treatments" className="mb-1.5 block">Common Treatments (comma separated)</Label>
                    <Textarea id="treatments" placeholder="Antibiotics, Rest, Hydration, etc." rows={2} />
                  </div>
                  
                  <div>
                    <Label htmlFor="severity" className="mb-1.5 block">Severity</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mild">Mild</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="severe">Severe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              
              {activeTab === "medicines" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="mb-1.5 block">Name</Label>
                      <Input id="name" placeholder="Medicine name" />
                    </div>
                    <div>
                      <Label htmlFor="genericName" className="mb-1.5 block">Generic Name</Label>
                      <Input id="genericName" placeholder="Generic name" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category" className="mb-1.5 block">Category</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="antibiotic">Antibiotic</SelectItem>
                          <SelectItem value="antiparasitic">Antiparasitic</SelectItem>
                          <SelectItem value="antifungal">Antifungal</SelectItem>
                          <SelectItem value="painkiller">Painkiller</SelectItem>
                          <SelectItem value="vitamin">Vitamin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="manufacturer" className="mb-1.5 block">Manufacturer</Label>
                      <Input id="manufacturer" placeholder="Manufacturer name" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dosageForm" className="mb-1.5 block">Dosage Form</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select form" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tablet">Tablet</SelectItem>
                          <SelectItem value="capsule">Capsule</SelectItem>
                          <SelectItem value="liquid">Liquid</SelectItem>
                          <SelectItem value="injection">Injection</SelectItem>
                          <SelectItem value="topical">Topical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="strength" className="mb-1.5 block">Strength</Label>
                      <Input id="strength" placeholder="e.g. 250mg" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price" className="mb-1.5 block">Price (VND)</Label>
                      <Input id="price" type="number" placeholder="0" />
                    </div>
                    <div>
                      <Label htmlFor="stock" className="mb-1.5 block">Stock</Label>
                      <Input id="stock" type="number" placeholder="0" />
                    </div>
                    <div>
                      <Label htmlFor="reorderPoint" className="mb-1.5 block">Reorder Point</Label>
                      <Input id="reorderPoint" type="number" placeholder="0" />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="mb-1.5 block">Description</Label>
                    <Textarea id="description" placeholder="Enter medicine description" rows={2} />
                  </div>
                  
                  <div>
                    <Label htmlFor="sideEffects" className="mb-1.5 block">Side Effects (comma separated)</Label>
                    <Textarea id="sideEffects" placeholder="Nausea, Dizziness, Drowsiness, etc." rows={2} />
                  </div>
                  
                  <div>
                    <Label htmlFor="contraindications" className="mb-1.5 block">Contraindications (comma separated)</Label>
                    <Textarea id="contraindications" placeholder="Pregnancy, Liver disease, etc." rows={2} />
                  </div>
                </>
              )}
              
              {activeTab === "services" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="mb-1.5 block">Name</Label>
                      <Input id="name" placeholder="Service name" />
                    </div>
                    <div>
                      <Label htmlFor="category" className="mb-1.5 block">Category</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="preventive">Preventive Care</SelectItem>
                          <SelectItem value="diagnostic">Diagnostic</SelectItem>
                          <SelectItem value="surgical">Surgical</SelectItem>
                          <SelectItem value="dental">Dental</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="duration" className="mb-1.5 block">Duration (minutes)</Label>
                      <Input id="duration" type="number" placeholder="0" />
                    </div>
                    <div>
                      <Label htmlFor="price" className="mb-1.5 block">Price (VND)</Label>
                      <Input id="price" type="number" placeholder="0" />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="mb-1.5 block">Description</Label>
                    <Textarea id="description" placeholder="Enter service description" rows={3} />
                  </div>
                  
                  <div>
                    <Label htmlFor="equipment" className="mb-1.5 block">Required Equipment (comma separated)</Label>
                    <Textarea id="equipment" placeholder="Stethoscope, Thermometer, etc." rows={2} />
                  </div>
                  
                  <div>
                    <Label htmlFor="prerequisites" className="mb-1.5 block">Prerequisites (comma separated)</Label>
                    <Textarea id="prerequisites" placeholder="Fasting required, No water for 2 hours, etc." rows={2} />
                  </div>
                </>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="border-t border-indigo-100 pt-4">
            <Button variant="outline" onClick={() => {
              setIsAddingItem(false);
              setIsEditingItem(false);
            }}
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
              Cancel
            </Button>
            <Button 
              disabled={isLoading} 
              onClick={handleSaveItem}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog - updating styles */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="border border-red-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected {activeTab.slice(0, -1)} from your catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading} className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              disabled={isLoading}
              onClick={handleDeleteItem}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CatalogManagement; 