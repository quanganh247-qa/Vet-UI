import React, { useState, useEffect } from "react";
import {
  useCreateMedicine,
  useGetAllMedicines,
  useUpdateMedicine,
} from "@/hooks/use-medicine";
import { MedicineRequest } from "@/services/medicine-services";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Save,
  Loader2,
  AlertCircle,
  Pill,
  Calendar,
  Clock,
  Package,
  DollarSign,
  ShoppingBag,
} from "lucide-react";

// Medicine interface based on the API response
interface Medicine {
  id: number;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  side_effects: string;
  quantity: number;
  expiration_date: string;
  description: string;
  usage: string;
  supplier_id: number;
  unit_price: number;
  reorder_level: number;
  supplier_name?: string;
}

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Format date
const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

// Get stock status badge
const getStockStatusBadge = (stock: number) => {
  if (stock === 0) {
    return (
      <Badge className="bg-red-100 text-red-800 border-red-200">
        Out of stock
      </Badge>
    );
  } else if (stock <= 10) {
    return (
      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
        Low stock
      </Badge>
    );
  } else {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        In stock
      </Badge>
    );
  }
};

// EmptyState component for when no medicines exist
const EmptyState = ({ onAdd }: { onAdd: () => void }) => (
  <div className="flex flex-col items-center justify-center p-8 bg-[#F9FAFB] rounded-2xl border border-dashed border-[#2C78E4]/20 h-64 transition-all hover:border-[#2C78E4]/40">
    <div className="rounded-full bg-[#F0F7FF] p-4 mb-5 shadow-sm">
      <Pill className="h-7 w-7 text-[#2C78E4]" />
    </div>
    <h3 className="text-lg font-medium mb-2 text-[#111827]">
      No medicines found
    </h3>
    <p className="text-sm text-[#4B5563] text-center mb-6 max-w-xs">
      Get started by adding your first medicine to the inventory
    </p>
    <Button
      size="sm"
      className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg"
      onClick={onAdd}
    >
      <PlusCircle className="h-4 w-4 mr-2" />
      Add medicine
    </Button>
  </div>
);

const MedicineManagement: React.FC = () => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Items per page for table

  // State variables
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedMedicineId, setSelectedMedicineId] = useState<number | null>(
    null
  );

  // Form state
  const [formData, setFormData] = useState<MedicineRequest>({
    medicine_name: "",
    dosage: "",
    frequency: "",
    duration: "",
    side_effects: "",
    quantity: 0,
    expiration_date: "",
    description: "",
    usage: "",
    supplier_id: 1, // Default supplier ID
    unit_price: 0,
    reorder_level: 0,
  });

  // Hooks
  const { toast } = useToast();
  const {
    data: medicinesData,
    isLoading: isLoadingMedicines,
    error: medicinesError,
  } = useGetAllMedicines(currentPage, pageSize);

  console.log(medicinesData);
  const { mutateAsync: createMedicine, isPending: isCreating } =
    useCreateMedicine();
  const { mutateAsync: updateMedicine, isPending: isUpdating } =
    useUpdateMedicine();

  const medicines: Medicine[] = (() => {
    if (!medicinesData) {
      return [];
    }

    // Try different possible data structures
    if (Array.isArray(medicinesData)) {
      return medicinesData;
    }

    return [];
  })();

  // Filter medicines based on search term
  const filteredMedicines = medicines.filter((medicine: Medicine) => {
    // Handle cases where medicine_name might be undefined or null
    const medicineName = medicine.medicine_name || "";
    const description = medicine.description || "";
    const usage = medicine.usage || "";

    return (
      medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usage.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  console.log("Search term:", searchTerm);
  console.log("Total medicines:", medicines.length);
  console.log("Filtered medicines:", filteredMedicines.length);
  console.log("First medicine (if any):", medicines[0]);

  // Reset pagination when search changes
  useEffect(() => {
    if (searchTerm) {
      setCurrentPage(1);
    }
  }, [searchTerm]);

  // Handle opening add dialog
  const handleOpenAddDialog = () => {
    setFormData({
      medicine_name: "",
      dosage: "",
      frequency: "",
      duration: "",
      side_effects: "",
      quantity: 0,
      expiration_date: "",
      description: "",
      usage: "",
      supplier_id: 1,
      unit_price: 0,
      reorder_level: 0,
    });
    setIsAddingItem(true);
  };

  // Handle opening edit dialog
  const handleOpenEditDialog = (medicine: Medicine) => {
    setSelectedMedicineId(medicine.id);
    setFormData({
      medicine_name: medicine.medicine_name,
      dosage: medicine.dosage,
      frequency: medicine.frequency,
      duration: medicine.duration,
      side_effects: medicine.side_effects,
      quantity: medicine.quantity,
      expiration_date: medicine.expiration_date,
      description: medicine.description,
      usage: medicine.usage,
      supplier_id: medicine.supplier_id,
      unit_price: medicine.unit_price,
      reorder_level: medicine.reorder_level,
    });
    setIsEditingItem(true);
  };

  // Handle opening delete dialog
  const handleOpenDeleteDialog = (id: number) => {
    setSelectedMedicineId(id);
    setDeleteConfirmOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newValue =
        name === "quantity" ||
        name === "unit_price" ||
        name === "reorder_level" ||
        name === "supplier_id"
          ? Number(value)
          : value;
      return {
        ...prev,
        [name]: newValue,
      };
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (
      !formData.medicine_name ||
      formData.unit_price <= 0 ||
      formData.quantity < 0
    ) {
      toast({
        title: "Invalid data",
        description: "Please fill in all required fields with valid values",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isAddingItem) {
        await createMedicine(formData);
        toast({
          title: "Medicine created successfully",
          description: "The new medicine has been added to your inventory.",
          className: "bg-green-50 text-green-800 border-green-200",
        });
        setIsAddingItem(false);
      } else if (isEditingItem && selectedMedicineId) {
        await updateMedicine({
          data: formData,
          medicine_id: selectedMedicineId,
        });
        toast({
          title: "Medicine updated successfully",
          description: "The medicine has been updated in your inventory.",
          className: "bg-green-50 text-green-800 border-green-200",
        });
        setIsEditingItem(false);
      }
    } catch (error) {
      toast({
        title: isAddingItem
          ? "Error creating medicine"
          : "Error updating medicine",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-[#2C78E4] to-[#2C78E4]/80 px-6 py-4 md:px-8 md:py-5 rounded-2xl shadow-md mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">
              Medicine Management
            </h1>
            <p className="text-blue-100 text-sm mt-1">
              Manage your veterinary medicine inventory
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
              placeholder="Search medicines..."
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
            Add new medicine
          </Button>
        </div>

        {/* Medicine table */}
        {isLoadingMedicines ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-10 w-10 animate-spin text-[#2C78E4]" />
              <p className="text-[#4B5563]">Loading medicines...</p>
            </div>
          </div>
        ) : medicinesError ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-600">
            <AlertCircle className="h-12 w-12 mb-3" />
            <p className="text-lg font-medium">Error loading medicines</p>
            <p className="text-sm text-[#4B5563] mt-1">
              Please try again later
            </p>
          </div>
        ) : filteredMedicines.length === 0 ? (
          <EmptyState onAdd={handleOpenAddDialog} />
        ) : (
          <>
            <div className="rounded-xl border border-[#2C78E4]/10 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F9FAFB] hover:bg-[#F9FAFB]">
                    <TableHead className="font-semibold text-[#111827]">
                      Medicine
                    </TableHead>
                    <TableHead className="font-semibold text-[#111827]">
                      Dosage
                    </TableHead>
                    <TableHead className="font-semibold text-[#111827]">
                      Price
                    </TableHead>
                    <TableHead className="font-semibold text-[#111827]">
                      Stock
                    </TableHead>
                    <TableHead className="font-semibold text-[#111827]">
                      Supplier
                    </TableHead>
                    <TableHead className="font-semibold text-[#111827]">
                      Expiry
                    </TableHead>
                    <TableHead className="font-semibold text-[#111827] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMedicines.map((medicine: Medicine) => (
                    <TableRow
                      key={medicine.id}
                      className="hover:bg-[#F9FAFB]/50"
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium text-[#111827]">
                            {medicine.medicine_name}
                          </div>
                          {medicine.description && (
                            <div className="text-sm text-[#4B5563] max-w-xs truncate">
                              {medicine.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-[#4B5563]">
                          {medicine.dosage}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-[#111827]">
                        {formatCurrency(medicine.unit_price)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {medicine.quantity}
                          </span>
                          {getStockStatusBadge(medicine.quantity)}
                        </div>
                      </TableCell>
                      <TableCell className="text-[#4B5563]">
                        {medicine.supplier_name ||
                          `Supplier ${medicine.supplier_id}`}
                      </TableCell>
                      <TableCell className="text-[#4B5563]">
                        {formatDate(medicine.expiration_date)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#4B5563] hover:text-[#2C78E4] hover:bg-[#F0F7FF] rounded-xl h-8 w-8 p-0"
                            onClick={() => handleOpenEditDialog(medicine)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#4B5563] hover:text-red-600 hover:bg-red-50 rounded-xl h-8 w-8 p-0"
                            onClick={() => handleOpenDeleteDialog(medicine.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination info - simplified since we don't have pagination data */}
            {medicines.length > 0 && (
              <div className="flex justify-center mt-8 pb-2">
                <p className="text-sm text-[#4B5563] font-medium">
                  Showing {filteredMedicines.length} medicines
                </p>
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
        <DialogContent className="sm:max-w-[700px] border border-[#2C78E4]/20 bg-white rounded-2xl">
          <DialogHeader className="border-b border-[#2C78E4]/10 pb-4">
            <DialogTitle className="text-[#111827] text-xl">
              {isAddingItem ? "Add new medicine" : "Edit medicine"}
            </DialogTitle>
            <DialogDescription className="text-[#4B5563]">
              Fill in the details below to {isAddingItem ? "create" : "update"}{" "}
              this medicine in your inventory.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] px-1">
            <div className="space-y-4 p-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="medicine_name"
                    className="text-[#111827] font-medium"
                  >
                    Medicine name*
                  </Label>
                  <Input
                    id="medicine_name"
                    name="medicine_name"
                    value={formData.medicine_name}
                    onChange={handleInputChange}
                    placeholder="Enter medicine name"
                    className="mt-1.5 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="dosage"
                    className="text-[#111827] font-medium"
                  >
                    Dosage*
                  </Label>
                  <Input
                    id="dosage"
                    name="dosage"
                    value={formData.dosage}
                    onChange={handleInputChange}
                    placeholder="e.g. 10mg/ml"
                    className="mt-1.5 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label
                    htmlFor="unit_price"
                    className="text-[#111827] font-medium"
                  >
                    Unit Price (VND)*
                  </Label>
                  <Input
                    id="unit_price"
                    name="unit_price"
                    type="number"
                    value={formData.unit_price}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="mt-1.5 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="quantity"
                    className="text-[#111827] font-medium"
                  >
                    Stock quantity*
                  </Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="mt-1.5 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="reorder_level"
                    className="text-[#111827] font-medium"
                  >
                    Reorder Level
                  </Label>
                  <Input
                    id="reorder_level"
                    name="reorder_level"
                    type="number"
                    value={formData.reorder_level}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="mt-1.5 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="frequency"
                    className="text-[#111827] font-medium"
                  >
                    Frequency
                  </Label>
                  <Input
                    id="frequency"
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleInputChange}
                    placeholder="e.g. Twice daily"
                    className="mt-1.5 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="duration"
                    className="text-[#111827] font-medium"
                  >
                    Duration
                  </Label>
                  <Input
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g. 7 days"
                    className="mt-1.5 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="expiration_date"
                  className="text-[#111827] font-medium"
                >
                  Expiry date*
                </Label>
                <Input
                  id="expiration_date"
                  name="expiration_date"
                  type="date"
                  value={formData.expiration_date}
                  onChange={handleInputChange}
                  className="mt-1.5 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
                />
              </div>

              <div>
                <Label
                  htmlFor="description"
                  className="text-[#111827] font-medium"
                >
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter medicine description"
                  rows={3}
                  className="mt-1.5 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
                />
              </div>

              <div>
                <Label htmlFor="usage" className="text-[#111827] font-medium">
                  Usage Instructions
                </Label>
                <Textarea
                  id="usage"
                  name="usage"
                  value={formData.usage}
                  onChange={handleInputChange}
                  placeholder="Enter usage instructions"
                  rows={2}
                  className="mt-1.5 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
                />
              </div>

              <div>
                <Label
                  htmlFor="side_effects"
                  className="text-[#111827] font-medium"
                >
                  Side Effects
                </Label>
                <Textarea
                  id="side_effects"
                  name="side_effects"
                  value={formData.side_effects}
                  onChange={handleInputChange}
                  placeholder="List any known side effects"
                  rows={2}
                  className="mt-1.5 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
                />
              </div>

              <div>
                <Label
                  htmlFor="supplier_id"
                  className="text-[#111827] font-medium"
                >
                  Supplier ID
                </Label>
                <Input
                  id="supplier_id"
                  name="supplier_id"
                  type="number"
                  value={formData.supplier_id}
                  onChange={handleInputChange}
                  placeholder="1"
                  className="mt-1.5 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
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
              className="border-[#2C78E4]/20 text-[#4B5563] hover:bg-[#F9FAFB] rounded-xl"
            >
              Cancel
            </Button>
            <Button
              disabled={
                isCreating ||
                isUpdating ||
                !formData.medicine_name ||
                formData.unit_price <= 0
              }
              onClick={handleSubmit}
              className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
            >
              {isCreating || isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="border border-red-200 bg-white rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 text-xl">
              Delete Medicine
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#4B5563]">
              Are you sure you want to delete this medicine? This action cannot
              be undone and will permanently remove the medicine from your
              inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-t border-red-100 pt-4">
            <AlertDialogCancel className="border-[#2C78E4]/20 text-[#4B5563] hover:bg-[#F9FAFB] rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-md">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Medicine
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MedicineManagement;
