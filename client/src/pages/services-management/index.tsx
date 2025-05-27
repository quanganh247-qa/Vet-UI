import React, { useState, useEffect } from "react";
import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from "@/hooks/use-services";
import {
  CreateServiceRequest,
  UpdateServiceRequest,
} from "@/services/catalog-services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Save,
  X,
  Clock,
  DollarSign,
  Loader2,
  Receipt,
  AlertCircle,
  Stethoscope,
} from "lucide-react";

// Service interface for type safety
interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  cost: number;
  category: string;
  notes?: string;
}

// Service Category interface
interface ServiceCategory {
  id: string;
  name: string;
  services: Service[];
}

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// EmptyState component for when no services exist
const EmptyState = ({ onAdd }: { onAdd: () => void }) => (
  <div className="flex flex-col items-center justify-center p-8 bg-[#F9FAFB] rounded-2xl border border-dashed border-[#2C78E4]/20 h-64 transition-all hover:border-[#2C78E4]/40">
    <div className="rounded-full bg-[#F0F7FF] p-4 mb-5 shadow-sm">
      <Receipt className="h-7 w-7 text-[#2C78E4]" />
    </div>
    <h3 className="text-lg font-medium mb-2 text-[#111827]">
      No services found
    </h3>
    <p className="text-sm text-[#4B5563] text-center mb-6 max-w-xs">
      Get started by creating your first veterinary service
    </p>
    <Button
      size="sm"
      className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg"
      onClick={onAdd}
    >
      <PlusCircle className="h-4 w-4 mr-2" />
      Add service
    </Button>
  </div>
);

const ServicesManagement: React.FC = () => {
  // State variables
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | undefined>(undefined);

  // Form state
  const [formData, setFormData] = useState<CreateServiceRequest>({
    name: "",
    description: "",
    duration: 0,
    cost: 0,
    category: "",
    notes: "",
  });

  // Hooks
  const { toast } = useToast();
  const {
    data: services,
    isLoading: isLoadingServices,
    error: servicesError,
  } = useServices();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  // Group services by category
  const serviceCategories: ServiceCategory[] = React.useMemo(() => {
    if (!services) return [];
    
    const groupedServices = (services as any[]).reduce((acc: { [key: string]: Service[] }, service: any) => {
      const category = service.category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(service as Service);
      return acc;
    }, {});

    return Object.entries(groupedServices).map(([categoryName, categoryServices]) => ({
      id: categoryName.toLowerCase().replace(/\s+/g, '-'),
      name: categoryName,
      services: categoryServices,
    }));
  }, [services]);

  // Filter service categories based on search term
  const filteredCategories = serviceCategories.map(category => ({
    ...category,
    services: category.services.filter(service => 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => 
    category.services.length > 0 || 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    searchTerm === ""
  );

  // Handle opening add dialog
  const handleOpenAddDialog = () => {
    setFormData({
      name: "",
      description: "",
      duration: 0,
      cost: 0,
      category: "",
      notes: "",
    });
    setIsAddingItem(true);
  };

  // Handle opening edit dialog
  const handleOpenEditDialog = (service: Service) => {
    setSelectedServiceId(service.id);
    setFormData({
      name: service.name,
      description: service.description,
      duration: service.duration,
      cost: service.cost,
      category: service.category,
      notes: service.notes || "",
    });
    setIsEditingItem(true);
  };

  // Handle opening delete dialog
  const handleOpenDeleteDialog = (id: string) => {
    setSelectedServiceId(id);
    setDeleteConfirmOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "duration" || name === "cost" ? Number(value) : value,
    }));
  };

  // Handle create/update service submission
  const handleSubmit = () => {
    if (isAddingItem) {
      createService.mutate(formData, {
        onSuccess: () => {
          toast({
            title: "Service created successfully",
            description: "The new service has been added to the catalog.",
            className: "bg-green-50 text-green-800 border-green-200",
          });
          setIsAddingItem(false);
        },
        onError: (error) => {
          toast({
            title: "Error creating service",
            description:
              error instanceof Error
                ? error.message
                : "An unexpected error occurred",
            variant: "destructive",
          });
        },
      });
    } else if (isEditingItem) {
      updateService.mutate(
        { id: selectedServiceId, data: formData as UpdateServiceRequest },
        {
          onSuccess: () => {
            toast({
              title: "Service updated successfully",
              description: "The service has been updated in the catalog.",
              className: "bg-green-50 text-green-800 border-green-200",
            });
            setIsEditingItem(false);
          },
          onError: (error) => {
            toast({
              title: "Error updating service",
              description:
                error instanceof Error
                  ? error.message
                  : "An unexpected error occurred",
              variant: "destructive",
            });
          },
        }
      );
    }
  };

  // Handle delete service
  const handleDeleteService = () => {
    deleteService.mutate(selectedServiceId, {
      onSuccess: () => {
        toast({
          title: "Service deleted successfully",
          description: "The service has been removed from the catalog.",
          className: "bg-green-50 text-green-800 border-green-200",
        });
        setDeleteConfirmOpen(false);
      },
      onError: (error) => {
        toast({
          title: "Error deleting service",
          description:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-[#2C78E4] to-[#2C78E4]/80 px-6 py-4 md:px-8 md:py-5 rounded-2xl shadow-md mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">Services Management</h1>
            <p className="text-blue-100 text-sm mt-1">
              Browse and manage service categories and individual services.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#2C78E4]/20 shadow-sm p-6 mb-6">
        {/* Search and add section */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 bg-[#F9FAFB] p-4 rounded-xl border border-[#2C78E4]/20">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#4B5563]" />
            <Input
              placeholder="Search by category, service name..."
              className="pl-10 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={handleOpenAddDialog}
            className="w-full sm:w-auto bg-[#2C78E4] hover:bg-[#1E40AF] text-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Service
          </Button>
        </div>

        {/* Services listing */}
        {isLoadingServices ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-10 w-10 animate-spin text-[#2C78E4]" />
              <p className="text-[#4B5563]">Loading services...</p>
            </div>
          </div>
        ) : servicesError ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-600">
            <AlertCircle className="h-12 w-12 mb-3" />
            <p className="text-lg font-medium">Error loading services</p>
            <p className="text-sm text-[#4B5563] mt-1">
              Please try again later
            </p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <EmptyState onAdd={handleOpenAddDialog} />
        ) : (
          <Accordion 
            type="single" 
            collapsible 
            className="w-full space-y-3"
            value={activeAccordionItem}
            onValueChange={setActiveAccordionItem}
          >
            {filteredCategories.map((category) => (
              <AccordionItem 
                value={category.id} 
                key={category.id} 
                className="border border-[#2C78E4]/10 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="px-6 py-4 text-lg font-medium text-[#111827] hover:bg-[#F0F7FF] data-[state=open]:bg-[#E0F2FE] data-[state=open]:text-[#0C4A6E]">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <Stethoscope className="h-5 w-5 mr-3 text-[#2C78E4]" /> 
                      {category.name}
                      <Badge variant="outline" className="ml-3 bg-white border-[#2C78E4]/30 text-[#2C78E4]">
                        {category.services.length} service{category.services.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-0 pt-0 pb-2 bg-white">
                  {category.services.length > 0 ? (
                    <Table className="mt-0">
                      <TableHeader className="bg-[#F9FAFB]">
                        <TableRow>
                          <TableHead className="pl-6 font-semibold text-[#111827]">Service Name</TableHead>
                          <TableHead className="font-semibold text-[#111827]">Description</TableHead>
                          <TableHead className="font-semibold text-[#111827]">Duration</TableHead>
                          <TableHead className="font-semibold text-[#111827]">Cost</TableHead>
                          <TableHead className="font-semibold text-[#111827]">Notes</TableHead>
                          <TableHead className="font-semibold text-[#111827] text-right pr-6">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {category.services.map((service) => (
                          <TableRow key={service.id} className="hover:bg-[#F9FAFB]/50">
                            <TableCell className="pl-6 font-medium text-[#111827]">{service.name}</TableCell>
                            <TableCell className="text-sm text-[#4B5563] max-w-xs truncate" title={service.description}>
                              {service.description}
                            </TableCell>
                            <TableCell className="text-sm text-[#4B5563]">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1.5 text-[#2C78E4]" />
                                {service.duration} min
                              </div>
                            </TableCell>
                            <TableCell className="text-sm font-medium text-[#FFA726]">
                              {formatCurrency(service.cost)}
                            </TableCell>
                            <TableCell className="text-sm text-[#4B5563] max-w-xs truncate" title={service.notes}>
                              {service.notes || "N/A"}
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-[#2C78E4] hover:bg-[#F0F7FF] rounded-xl"
                                  onClick={() => handleOpenEditDialog(service)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:bg-red-50 rounded-xl"
                                  onClick={() => handleOpenDeleteDialog(service.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="px-6 py-4 text-sm text-gray-500">
                      No services found in this category{searchTerm ? " matching your search" : ""}.
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog
        open={isAddingItem || isEditingItem}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddingItem(false);
            setIsEditingItem(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] border border-[#2C78E4]/20 bg-white rounded-2xl shadow-lg">
          <DialogHeader className="border-b border-[#2C78E4]/10 pb-4">
            <DialogTitle className="text-[#111827] text-xl font-semibold">
              {isAddingItem ? "Add New Service" : "Edit Service"}
            </DialogTitle>
            <DialogDescription className="text-[#4B5563] mt-1">
              Fill in the details below to {isAddingItem ? "create" : "update"}{" "}
              this service in your catalog.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] px-1">
            <div className="space-y-5 p-1">
              <div>
                <Label
                  htmlFor="name"
                  className="mb-2 block text-[#111827] font-medium"
                >
                  Service Name*
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter service name"
                  className="border-[#2C78E4]/20 focus:border-[#2C78E4] focus:ring-[#2C78E4]/20 rounded-xl"
                />
              </div>

              <div>
                <Label
                  htmlFor="category"
                  className="mb-2 block text-[#111827] font-medium"
                >
                  Category*
                </Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Service category (e.g., Preventive, Surgical, Dental)"
                  className="border-[#2C78E4]/20 focus:border-[#2C78E4] focus:ring-[#2C78E4]/20 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <Label
                    htmlFor="duration"
                    className="mb-2 block text-[#111827] font-medium"
                  >
                    Duration (minutes)*
                  </Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="border-[#2C78E4]/20 focus:border-[#2C78E4] focus:ring-[#2C78E4]/20 rounded-xl"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="cost"
                    className="mb-2 block text-[#111827] font-medium"
                  >
                    Cost (VND)*
                  </Label>
                  <Input
                    id="cost"
                    name="cost"
                    type="number"
                    value={formData.cost}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="border-[#2C78E4]/20 focus:border-[#2C78E4] focus:ring-[#2C78E4]/20 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="description"
                  className="mb-2 block text-[#111827] font-medium"
                >
                  Description*
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter service description"
                  rows={3}
                  className="border-[#2C78E4]/20 focus:border-[#2C78E4] focus:ring-[#2C78E4]/20 rounded-xl"
                />
              </div>

              <div>
                <Label
                  htmlFor="notes"
                  className="mb-2 block text-[#111827] font-medium"
                >
                  Additional Notes
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Enter any additional notes or requirements"
                  rows={2}
                  className="border-[#2C78E4]/20 focus:border-[#2C78E4] focus:ring-[#2C78E4]/20 rounded-xl"
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="border-t border-[#2C78E4]/10 pt-4 gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddingItem(false);
                setIsEditingItem(false);
              }}
              className="border-[#2C78E4]/20 text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#111827] rounded-xl transition-colors"
            >
              Cancel
            </Button>
            <Button
              disabled={
                createService.isPending ||
                updateService.isPending ||
                !formData.name ||
                !formData.description ||
                !formData.category
              }
              onClick={handleSubmit}
              className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white rounded-xl shadow-md transition-all duration-200 hover:shadow-lg"
            >
              {createService.isPending || updateService.isPending ? (
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="border border-red-200 bg-white rounded-2xl shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 text-xl">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#4B5563]">
              This action cannot be undone. This will permanently delete the
              selected service from your catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel
              disabled={deleteService.isPending}
              className="border-[#2C78E4]/20 text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#111827] rounded-xl transition-colors"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteService.isPending}
              onClick={handleDeleteService}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white rounded-xl shadow-md transition-all duration-200 hover:shadow-lg"
            >
              {deleteService.isPending ? (
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

export default ServicesManagement;
