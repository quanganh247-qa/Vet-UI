import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, MoreVertical, Loader2, Pencil, Trash, Users, Search, RefreshCw } from "lucide-react";
import { MedicineSupplierResponse } from "@/types";
import Pagination from "@/components/ui/pagination";
import { toast } from "@/components/ui/use-toast";
import api from "@/lib/api";

interface SupplierListProps {
  searchQuery: string;
  onOperationComplete?: () => void;
}

const SupplierList: React.FC<SupplierListProps> = ({ searchQuery, onOperationComplete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSupplier, setSelectedSupplier] = useState<MedicineSupplierResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [suppliers, setSuppliers] = useState<MedicineSupplierResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false); 
  const [error, setError] = useState<Error | null>(null);
  const pageSize = 10;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    contact_name: "",
    notes: "",
  });

  // Use the search query from props when it changes
  useEffect(() => {
    if (searchQuery) {
      setLocalSearchTerm(searchQuery);
    }
  }, [searchQuery]);

  // Fetch suppliers directly from API
  const fetchSuppliers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get(`/api/v1/medicine/suppliers?page=${currentPage}&pageSize=${pageSize}`);
      console.log("Suppliers API response:", response.data);
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setSuppliers(response.data.data);
        
        // Set pagination if available
        if (response.data.meta) {
          setTotalPages(response.data.meta.totalPages || response.data.meta.total_pages || 1);
        }
      } else {
        console.warn("Unexpected API response format:", response.data);
        // Try to handle any possible response format
        if (Array.isArray(response.data)) {
          setSuppliers(response.data);
        } else if (typeof response.data === 'object' && response.data !== null) {
          // Look for any array property
          for (const key in response.data) {
            if (Array.isArray(response.data[key])) {
              setSuppliers(response.data[key]);
              break;
            }
          }
        } else {
          setSuppliers([]);
        }
      }
      return Promise.resolve(); // Return resolved promise for successful operations
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast({
        title: "Error",
        description: "Failed to load suppliers. Please try again.",
        variant: "destructive",
      });
      setSuppliers([]);
      return Promise.reject(err); // Return rejected promise for error handling
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchSuppliers().catch(err => {
      console.error("Error in initial supplier fetch:", err);
      // Already handled in fetchSuppliers
    });
  }, [currentPage]);

  // Add a supplier
  const handleAddSupplier = async () => {
    try {
      setIsFormSubmitting(true);
      await api.post('/api/v1/medicine/supplier', formData);
      
      toast({
        title: "Success",
        description: "Supplier added successfully!",
        className: "bg-green-50 text-green-800 border-green-200",
      });
      
      resetForm();
      await fetchSuppliers(); // Refresh the list
      if (onOperationComplete) onOperationComplete();
    } catch (err) {
      console.error("Error adding supplier:", err);
      toast({
        title: "Error",
        description: "Failed to add supplier. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // Update a supplier
  const handleUpdateSupplier = async () => {
    if (!selectedSupplier) return;
    
    try {
      setIsFormSubmitting(true);
      await api.put(`/api/v1/medicine/supplier/${selectedSupplier.id}`, formData);
      
      toast({
        title: "Success",
        description: "Supplier updated successfully!",
        className: "bg-green-50 text-green-800 border-green-200",
      });
      
      resetForm();
      setIsEditing(false); // Close dialog first
      setSelectedSupplier(null);
      await fetchSuppliers(); // Refresh the list
      if (onOperationComplete) onOperationComplete();
    } catch (err) {
      console.error("Error updating supplier:", err);
      toast({
        title: "Error",
        description: "Failed to update supplier. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // Delete a supplier
  const handleDeleteSupplier = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;
    
    try {
      setIsLoading(true);
      await api.delete(`/api/v1/medicine/supplier/${id}`);
      
      toast({
        title: "Success",
        description: "Supplier deleted successfully!",
        className: "bg-green-50 text-green-800 border-green-200",
      });
      
      await fetchSuppliers(); // Refresh the list
      if (onOperationComplete) onOperationComplete();
    } catch (err) {
      console.error("Error deleting supplier:", err);
      toast({
        title: "Error",
        description: "Failed to delete supplier. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit button click
  const handleEditClick = (supplier: MedicineSupplierResponse) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
      contact_name: supplier.contact_name || "",
      notes: supplier.notes || "",
    });
    setIsEditing(true);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedSupplier(null);
    resetForm();
  };

  // Reset form fields
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      contact_name: "",
      notes: "",
    });
  };

  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter((supplier) => {
    if (!localSearchTerm) return true;
    
    const searchLower = localSearchTerm.toLowerCase();
    return (
      supplier.name?.toLowerCase().includes(searchLower) ||
      supplier.contact_name?.toLowerCase().includes(searchLower) ||
      supplier.email?.toLowerCase().includes(searchLower) ||
      supplier.phone?.toLowerCase().includes(searchLower)
    );
  });

  // Separate refresh function to handle both auto-refresh and manual refresh
  const handleRefresh = async () => {
    await fetchSuppliers();
    if (onOperationComplete) onOperationComplete();
  };

  // Component rendering
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-[#2C78E4] flex items-center">
          <Users className="h-5 w-5 mr-2 text-[#2C78E4]" />
          Suppliers ({suppliers.length})
        </h2>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={isLoading}
            className="border-[#2C78E4]/20 text-[#2C78E4] hover:bg-[#F0F7FF] rounded-lg"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white rounded-lg">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white sm:max-w-[500px] border border-[#2C78E4]/20 rounded-xl">
              <DialogHeader className="border-b border-[#2C78E4]/20 pb-3">
                <DialogTitle className="text-[#2C78E4]">Add New Supplier</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-[#2C78E4]">Supplier Name*</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter supplier name"
                    className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-lg"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-[#2C78E4]">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Email address"
                      className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-lg"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone" className="text-[#2C78E4]">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Phone number"
                      className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-lg"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address" className="text-[#2C78E4]">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Full address"
                    className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-lg"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact_name" className="text-[#2C78E4]">Contact Person</Label>
                  <Input
                    id="contact_name"
                    name="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    placeholder="Contact person name"
                    className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-lg"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes" className="text-[#2C78E4]">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes"
                    rows={3}
                    className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-lg"
                  />
                </div>
              </div>
              <DialogFooter className="border-t border-[#2C78E4]/20 pt-3">
                <DialogClose asChild>
                  <Button 
                    variant="outline" 
                    className="border-[#2C78E4]/20 text-[#2C78E4] hover:bg-[#F0F7FF] rounded-lg"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  onClick={handleAddSupplier}
                  disabled={!formData.name || isFormSubmitting}
                  className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white rounded-lg"
                >
                  {isFormSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Supplier"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search box */}
      <div className="flex flex-wrap gap-3 mb-6 bg-[#F0F7FF] p-3 rounded-xl border border-[#2C78E4]/20">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#2C78E4]" />
          <Input
            placeholder="Search suppliers..."
            className="pl-10 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-lg"
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
          />
        </div>
        
        {localSearchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocalSearchTerm("")}
            className="h-9 text-[#2C78E4] hover:text-[#1E40AF] hover:bg-[#F0F7FF]"
          >
            Clear Search
          </Button>
        )}
      </div>

      {/* Debug info */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
          <p className="font-semibold">Error loading suppliers:</p>
          <p>{error.message}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-[#2C78E4]" />
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-[#2C78E4]/20 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F0F7FF]">
                  <TableHead className="text-[#2C78E4]">Supplier Name</TableHead>
                  <TableHead className="text-[#2C78E4]">Contact Person</TableHead>
                  <TableHead className="text-[#2C78E4]">Phone</TableHead>
                  <TableHead className="text-[#2C78E4]">Email</TableHead>
                  <TableHead className="w-[100px] text-[#2C78E4]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-[#2C78E4]/70">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="h-8 w-8 text-[#2C78E4]/40 mb-2" />
                        <p>
                          {localSearchTerm 
                            ? "No suppliers match your search." 
                            : "No suppliers found. Add a new supplier to get started."}
                        </p>
                        {localSearchTerm && (
                          <Button 
                            variant="link" 
                            onClick={() => setLocalSearchTerm("")} 
                            className="text-[#2C78E4] mt-2"
                          >
                            Clear Search
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSuppliers.map((supplier: MedicineSupplierResponse) => (
                    <TableRow key={supplier.id} className="hover:bg-[#F0F7FF]/50">
                      <TableCell className="font-medium text-[#2C78E4]">
                        {supplier.name}
                      </TableCell>
                      <TableCell>{supplier.contact_name || "-"}</TableCell>
                      <TableCell>{supplier.phone || "-"}</TableCell>
                      <TableCell>{supplier.email || "-"}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 p-0 text-[#2C78E4] hover:bg-[#F0F7FF] rounded-lg">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="border-[#2C78E4]/20 bg-white rounded-lg">
                            <DropdownMenuItem
                              onSelect={() => handleEditClick(supplier)}
                              className="text-[#2C78E4] hover:bg-[#F0F7FF] cursor-pointer"
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600 hover:bg-red-50 cursor-pointer" 
                              onSelect={() => handleDeleteSupplier(supplier.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}

      {/* Edit Supplier Dialog */}
      <Dialog
        open={isEditing}
        onOpenChange={(open) => {
          if (!open && !isFormSubmitting) {
            setIsEditing(false);
            setSelectedSupplier(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="bg-white sm:max-w-[500px] border border-[#2C78E4]/20 rounded-xl">
          <DialogHeader className="border-b border-[#2C78E4]/20 pb-3">
            <DialogTitle className="text-[#2C78E4]">Edit Supplier</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name" className="text-[#2C78E4]">Supplier Name*</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter supplier name"
                className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-lg"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-email" className="text-[#2C78E4]">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email address"
                  className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-lg"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phone" className="text-[#2C78E4]">Phone</Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone number"
                  className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-lg"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-address" className="text-[#2C78E4]">Address</Label>
              <Input
                id="edit-address"
                name="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full address"
                className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-lg"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-contact_name" className="text-[#2C78E4]">Contact Person</Label>
              <Input
                id="edit-contact_name"
                name="contact_name"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                placeholder="Contact person name"
                className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-lg"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-notes" className="text-[#2C78E4]">Notes</Label>
              <Textarea
                id="edit-notes"
                name="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes"
                rows={3}
                className="border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-lg"
              />
            </div>
          </div>
          <DialogFooter className="border-t border-[#2C78E4]/20 pt-3">
            <Button 
              variant="outline" 
              onClick={handleCancelEdit}
              disabled={isFormSubmitting}
              className="border-[#2C78E4]/20 text-[#2C78E4] hover:bg-[#F0F7FF] rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateSupplier}
              disabled={!formData.name || isFormSubmitting}
              className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white rounded-lg"
            >
              {isFormSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Supplier"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplierList;
