import React, { useState, useEffect } from "react";
import { useServices, useCreateService, useUpdateService, useDeleteService } from "@/hooks/use-services";
import { CreateServiceRequest, UpdateServiceRequest } from "@/services/catalog-services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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
    AlertCircle
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

// Format currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
    }).format(amount);
};

// EmptyState component for when no services exist
const EmptyState = ({ onAdd }: { onAdd: () => void }) => (
    <div className="flex flex-col items-center justify-center p-8 bg-[#F0F7FF]/50 rounded-xl border border-dashed border-[#2C78E4]/20 h-64">
        <div className="rounded-full bg-[#F0F7FF] p-3 mb-4">
            <Receipt className="h-6 w-6 text-[#2C78E4]" />
        </div>
        <h3 className="text-lg font-medium mb-2 text-[#2C78E4]">No services found</h3>
        <p className="text-sm text-[#2C78E4]/70 text-center mb-4">
            Get started by creating your first service
        </p>
        <Button size="sm" className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white rounded-lg" onClick={onAdd}>
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
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    // Form state
    const [formData, setFormData] = useState<CreateServiceRequest>({
        name: "",
        description: "",
        duration: 0,
        cost: 0,
        category: "",
        notes: ""
    });

    // Hooks
    const { toast } = useToast();
    const { data: services, isLoading: isLoadingServices, error: servicesError } = useServices();
    const createService = useCreateService();
    const updateService = useUpdateService();
    const deleteService = useDeleteService();

    // Filter services based on search term
    const filteredServices = services?.filter((service: any) =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    // Pagination calculations
    const totalItems = filteredServices.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedServices = filteredServices.slice(startIndex, endIndex);

    // Reset pagination when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Handle opening add dialog
    const handleOpenAddDialog = () => {
        setFormData({
            name: "",
            description: "",
            duration: 0,
            cost: 0,
            category: "",
            notes: ""
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
            notes: service.notes || ""
        });
        setIsEditingItem(true);
    };

    // Handle opening delete dialog
    const handleOpenDeleteDialog = (id: string) => {
        setSelectedServiceId(id);
        setDeleteConfirmOpen(true);
    };

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'duration' || name === 'cost' ? Number(value) : value
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
                        description: error instanceof Error ? error.message : "An unexpected error occurred",
                        variant: "destructive",
                    });
                }
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
                            description: error instanceof Error ? error.message : "An unexpected error occurred",
                            variant: "destructive",
                        });
                    }
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
                    description: error instanceof Error ? error.message : "An unexpected error occurred",
                    variant: "destructive",
                });
            }
        });
    };

    // Handle pagination
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className="space-y-6">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-[#2C78E4] to-[#1E40AF] px-6 py-4 rounded-xl shadow-md mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Services Management</h1>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-sm rounded-xl border border-[#2C78E4]/20 p-5 mb-6">
                {/* Search and add section */}
                <div className="flex justify-between items-center mb-6 bg-[#F0F7FF] p-3 rounded-lg border border-[#2C78E4]/20">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#2C78E4]" />
                        <Input
                            placeholder="Search services..."
                            className="pl-10 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={handleOpenAddDialog}
                        className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white rounded-lg"
                    >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add New Service
                    </Button>
                </div>

                {/* Services listing */}
                {isLoadingServices ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-[#2C78E4]" />
                    </div>
                ) : servicesError ? (
                    <div className="flex flex-col items-center justify-center h-64 text-red-600">
                        <AlertCircle className="h-10 w-10 mb-2" />
                        <p>Error loading services. Please try again later.</p>
                    </div>
                ) : filteredServices.length === 0 ? (
                    <EmptyState onAdd={handleOpenAddDialog} />
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {paginatedServices.map((service: any) => (
                                <Card key={service.id} className="hover:shadow-md transition-shadow border border-[#2C78E4]/10 rounded-xl overflow-hidden">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex justify-between items-start">
                                            <div>
                                                <span className="text-lg font-semibold text-[#2C78E4]">{service.name}</span>
                                                <Badge className="ml-2 bg-[#F0F7FF] text-[#2C78E4] border-[#2C78E4]/20 rounded-full">
                                                    {service.category}
                                                </Badge>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-[#2C78E4] hover:bg-[#F0F7FF] rounded-lg"
                                                    onClick={() => handleOpenEditDialog(service)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:bg-red-50 rounded-lg"
                                                    onClick={() => handleOpenDeleteDialog(service.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center text-sm text-[#2C78E4]">
                                                    <Clock className="h-4 w-4 mr-1" />
                                                    {service.duration} minutes
                                                </div>
                                                <span className="font-medium text-green-600">{formatCurrency(service.cost)}</span>
                                            </div>
                                            <p className="text-sm text-gray-600">{service.description}</p>
                                            {service.notes && (
                                                <div className="bg-[#F0F7FF]/70 p-2 rounded-lg text-xs text-[#2C78E4] border border-[#2C78E4]/20">
                                                    <strong>Notes:</strong> {service.notes}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination controls */}
                        {totalPages > 1 && (
                            <div className="flex flex-col items-center space-y-4 mt-8 pb-4">
                                <p className="text-sm text-[#2C78E4] font-medium">
                                    Page {currentPage} / {totalPages} • Showing {startIndex + 1}-{endIndex} of {totalItems} services
                                </p>
                                <div className="flex justify-center items-center space-x-2 bg-[#F0F7FF] px-4 py-3 rounded-lg shadow-sm border border-[#2C78E4]/20">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="border-[#2C78E4]/20 text-[#2C78E4] hover:bg-[#F0F7FF]/70 rounded-lg"
                                    >
                                        Previous
                                    </Button>
                                    
                                    {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                                        // Calculate which page numbers to show
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = index + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = index + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + index;
                                        } else {
                                            pageNum = currentPage - 2 + index;
                                        }
                                        
                                        return (
                                            <Button
                                                key={index}
                                                variant={currentPage === pageNum ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handlePageChange(pageNum)}
                                                className={
                                                    currentPage === pageNum
                                                        ? "bg-[#2C78E4] text-white font-bold hover:bg-[#1E40AF] rounded-lg"
                                                        : "border-[#2C78E4]/20 text-[#2C78E4] hover:bg-[#F0F7FF]/70 rounded-lg"
                                                }
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}
                                    
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="border-[#2C78E4]/20 text-[#2C78E4] hover:bg-[#F0F7FF]/70 rounded-lg"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
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
                <DialogContent className="sm:max-w-[600px] border border-[#2C78E4]/20 bg-white rounded-xl">
                    <DialogHeader className="border-b border-[#2C78E4]/10 pb-4">
                        <DialogTitle className="text-[#2C78E4]">
                            {isAddingItem ? "Add New Service" : "Edit Service"}
                        </DialogTitle>
                        <DialogDescription className="text-[#2C78E4]/70">
                            Fill in the details below to {isAddingItem ? "create" : "update"} this service in your catalog.
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="max-h-[60vh] px-1">
                        <div className="space-y-4 p-1">
                            <div>
                                <Label htmlFor="name" className="mb-1.5 block">Service Name*</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter service name"
                                    className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-lg"
                                />
                            </div>

                            <div>
                                <Label htmlFor="category" className="mb-1.5 block">Category*</Label>
                                <Input
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    placeholder="Service category (e.g., Preventive, Surgical, Dental)"
                                    className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-lg"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="duration" className="mb-1.5 block">Duration (minutes)*</Label>
                                    <Input
                                        id="duration"
                                        name="duration"
                                        type="number"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                        placeholder="0"
                                        className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-lg"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="cost" className="mb-1.5 block">Cost (VND)*</Label>
                                    <Input
                                        id="cost"
                                        name="cost"
                                        type="number"
                                        value={formData.cost}
                                        onChange={handleInputChange}
                                        placeholder="0"
                                        className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-lg"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description" className="mb-1.5 block">Description*</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter service description"
                                    rows={3}
                                    className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-lg"
                                />
                            </div>

                            <div>
                                <Label htmlFor="notes" className="mb-1.5 block">Additional Notes</Label>
                                <Textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    placeholder="Enter any additional notes or requirements"
                                    rows={2}
                                    className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-lg"
                                />
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="border-t border-[#2C78E4]/10 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsAddingItem(false);
                                setIsEditingItem(false);
                            }}
                            className="border-[#2C78E4]/20 text-[#2C78E4] hover:bg-[#F0F7FF] rounded-lg"
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={createService.isPending || updateService.isPending || !formData.name || !formData.description || !formData.category}
                            onClick={handleSubmit}
                            className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white rounded-lg"
                        >
                            {(createService.isPending || updateService.isPending) ? (
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
                <AlertDialogContent className="border border-red-200 bg-white rounded-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-600">Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the selected service from your catalog.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={deleteService.isPending}
                            className="border-[#2C78E4]/20 text-[#2C78E4] hover:bg-[#F0F7FF] rounded-lg"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={deleteService.isPending}
                            onClick={handleDeleteService}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600 rounded-lg"
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