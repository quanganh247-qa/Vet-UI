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
import { 
  PlusCircle, 
  MoreVertical, 
  Loader2, 
  Pencil, 
  Trash, 
  Users, 
  Search, 
  RefreshCw,
  Filter,
  Download,
  Eye,
  Building,
  Phone,
  Mail,
  MapPin,
  User,
  FileText
} from "lucide-react";
import { MedicineSupplierResponse } from "@/types";
import Pagination from "@/components/ui/pagination";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";

interface SupplierListProps {
  searchQuery: string;
  onOperationComplete?: () => void;
}

const SupplierList: React.FC<SupplierListProps> = ({ searchQuery, onOperationComplete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedSupplier, setSelectedSupplier] = useState<MedicineSupplierResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [suppliers, setSuppliers] = useState<MedicineSupplierResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false); 
  const [error, setError] = useState<Error | null>(null);

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
      
      const response = await api.get(`/api/v1/medicine/suppliers?page=${currentPage}&pageSize=${itemsPerPage}`);
      console.log("Suppliers API response:", response.data);
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setSuppliers(response.data.data);
        setTotalItems(response.data.meta?.total || response.data.data.length);
        
        // Set pagination if available
        if (response.data.meta) {
          setTotalPages(response.data.meta.totalPages || response.data.meta.total_pages || 1);
        }
      } else {
        console.warn("Unexpected API response format:", response.data);
        // Try to handle any possible response format
        if (Array.isArray(response.data)) {
          setSuppliers(response.data);
          setTotalItems(response.data.length);
        } else if (typeof response.data === 'object' && response.data !== null) {
          // Look for any array property
          for (const key in response.data) {
            if (Array.isArray(response.data[key])) {
              setSuppliers(response.data[key]);
              setTotalItems(response.data[key].length);
              break;
            }
          }
        } else {
          setSuppliers([]);
          setTotalItems(0);
        }
      }
      return Promise.resolve();
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast({
        title: "Error",
        description: "Failed to load suppliers. Please try again.",
        variant: "destructive",
      });
      setSuppliers([]);
      setTotalItems(0);
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchSuppliers().catch(err => {
      console.error("Error in initial supplier fetch:", err);
    });
  }, [currentPage, itemsPerPage]);

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
      setIsAddDialogOpen(false);
      await fetchSuppliers();
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
      setIsEditing(false);
      setSelectedSupplier(null);
      await fetchSuppliers();
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
      
      await fetchSuppliers();
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


  const clearAllFilters = () => {
    setLocalSearchTerm("");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 font-['Open_Sans',_sans-serif]">
      {/* Enhanced Filters Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#4B5563]" />
            <Input
              placeholder="Search by name, contact person, email, or phone..."
              className="pl-10 border-gray-200 focus:border-[#2C78E4] focus:ring-[#2C78E4]/20 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white"
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-3">
           

            {/* Add Supplier Button */}
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-[#2C78E4] hover:bg-[#2C78E4]/90 text-white rounded-xl"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>

            {/* Clear Filters Button */}
            {localSearchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-[#EF4444] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-xl transition-all duration-200"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {localSearchTerm && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm text-[#4B5563] flex items-center">
              <Filter className="h-3.5 w-3.5 mr-2 text-[#2C78E4]" />
              Active filters:
            </span>
            
            <Badge className="bg-[#2C78E4]/10 text-[#2C78E4] border-[#2C78E4]/20 font-normal rounded-full px-3 py-1">
              Search: "{localSearchTerm}"
            </Badge>
          </div>
        )}
      </div>

      {/* Enhanced Suppliers Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-[#2C78E4] mx-auto mb-4" />
              <p className="text-[#4B5563] font-medium">Loading suppliers...</p>
              <p className="text-sm text-[#6B7280] mt-1">Please wait while we fetch your data</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-[#F9FAFB] to-gray-50 border-b border-gray-200">
                    <TableHead className="text-[#111827] font-semibold px-6 py-4">Supplier</TableHead>
                    <TableHead className="text-[#111827] font-semibold px-6 py-4">Contact Person</TableHead>
                    <TableHead className="text-[#111827] font-semibold px-6 py-4">Phone</TableHead>
                    <TableHead className="text-[#111827] font-semibold px-6 py-4">Email</TableHead>
                    <TableHead className="text-[#111827] font-semibold px-6 py-4">Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-16 px-6"
                      >
                        <div className="flex flex-col items-center">
                          <div className="bg-[#2C78E4]/10 p-4 rounded-full mb-4">
                            <Building className="h-12 w-12 text-[#2C78E4]" />
                          </div>
                          <h3 className="font-semibold text-[#111827] mb-2 text-lg">No suppliers found</h3>
                          <p className="text-[#4B5563] mb-4 max-w-sm">
                            {localSearchTerm
                              ? "Try adjusting your search criteria"
                              : "No suppliers have been added yet"}
                          </p>
                          {localSearchTerm ? (
                            <Button
                              variant="outline"
                              onClick={clearAllFilters}
                              className="border-[#2C78E4] text-[#2C78E4] hover:bg-[#2C78E4] hover:text-white rounded-xl"
                            >
                              Clear Filters
                            </Button>
                          ) : (
                            <Button
                              onClick={() => setIsAddDialogOpen(true)}
                              className="bg-[#2C78E4] hover:bg-[#2C78E4]/90 text-white rounded-xl"
                            >
                              <PlusCircle className="h-4 w-4 mr-2" />
                              Add First Supplier
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSuppliers.map((supplier: MedicineSupplierResponse) => (
                      <TableRow 
                        key={supplier.id} 
                        className="hover:bg-[#F9FAFB]/60 border-b border-gray-100 transition-colors duration-200"
                      >
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="bg-[#2C78E4]/10 p-2 rounded-full">
                              <Building className="h-4 w-4 text-[#2C78E4]" />
                            </div>
                            <div>
                              <div className="font-semibold text-[#111827]">{supplier.name}</div>
                              {supplier.notes && (
                                <div className="text-xs text-[#4B5563] mt-1 max-w-[200px] truncate">
                                  {supplier.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-[#4B5563] px-6 py-4">
                          {supplier.contact_name ? (
                            <div className="flex items-center">
                              <User className="h-3 w-3 mr-2 text-[#2C78E4]" />
                              {supplier.contact_name}
                            </div>
                          ) : (
                            <span className="text-[#6B7280]">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-[#4B5563] px-6 py-4">
                          {supplier.phone ? (
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-2 text-[#2C78E4]" />
                              {supplier.phone}
                            </div>
                          ) : (
                            <span className="text-[#6B7280]">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-[#4B5563] px-6 py-4">
                          {supplier.email ? (
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-2 text-[#2C78E4]" />
                              <a 
                                href={`mailto:${supplier.email}`}
                                className="text-[#2C78E4] hover:underline transition-all duration-200"
                              >
                                {supplier.email}
                              </a>
                            </div>
                          ) : (
                            <span className="text-[#6B7280]">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-[#4B5563] px-6 py-4">
                          {supplier.address ? (
                            <div className="flex items-center max-w-[200px]">
                              <MapPin className="h-3 w-3 mr-2 text-[#2C78E4] flex-shrink-0" />
                              <span className="truncate">{supplier.address}</span>
                            </div>
                          ) : (
                            <span className="text-[#6B7280]">-</span>
                          )}
                        </TableCell>
                      
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="py-4 px-6 border-t border-gray-100 bg-gradient-to-r from-[#F9FAFB] to-gray-50">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  showItemsPerPage={true}
                  className="text-sm"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Supplier Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] border-none shadow-lg bg-white rounded-2xl">
          <DialogHeader className="border-b border-gray-100 pb-4">
            <DialogTitle className="text-xl font-bold text-[#111827] flex items-center">
              <Building className="h-5 w-5 mr-2 text-[#2C78E4]" />
              Add New Supplier
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-[#111827] font-medium">Supplier Name*</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter supplier name"
                className="border-gray-200 focus:border-[#2C78E4] focus:ring-[#2C78E4]/20 rounded-xl"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-[#111827] font-medium">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email address"
                  className="border-gray-200 focus:border-[#2C78E4] focus:ring-[#2C78E4]/20 rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-[#111827] font-medium">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone number"
                  className="border-gray-200 focus:border-[#2C78E4] focus:ring-[#2C78E4]/20 rounded-xl"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address" className="text-[#111827] font-medium">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full address"
                className="border-gray-200 focus:border-[#2C78E4] focus:ring-[#2C78E4]/20 rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact_name" className="text-[#111827] font-medium">Contact Person</Label>
              <Input
                id="contact_name"
                name="contact_name"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                placeholder="Contact person name"
                className="border-gray-200 focus:border-[#2C78E4] focus:ring-[#2C78E4]/20 rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes" className="text-[#111827] font-medium">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this supplier"
                rows={3}
                className="border-gray-200 focus:border-[#2C78E4] focus:ring-[#2C78E4]/20 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="border-t border-gray-100 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
              className="border-gray-200 hover:bg-[#F9FAFB] hover:border-[#2C78E4]/20 rounded-xl text-[#4B5563]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddSupplier}
              disabled={!formData.name || isFormSubmitting}
              className="bg-[#2C78E4] hover:bg-[#2C78E4]/90 text-white rounded-xl disabled:opacity-50"
            >
              {isFormSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Supplier
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
        <DialogContent className="sm:max-w-[600px] border-none shadow-lg bg-white rounded-2xl">
          <DialogHeader className="border-b border-gray-100 pb-4">
            <DialogTitle className="text-xl font-bold text-[#111827] flex items-center">
              <Pencil className="h-5 w-5 mr-2 text-[#FFA726]" />
              Edit Supplier
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name" className="text-[#111827] font-medium">Supplier Name*</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter supplier name"
                className="border-gray-200 focus:border-[#2C78E4] focus:ring-[#2C78E4]/20 rounded-xl"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-email" className="text-[#111827] font-medium">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email address"
                  className="border-gray-200 focus:border-[#2C78E4] focus:ring-[#2C78E4]/20 rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phone" className="text-[#111827] font-medium">Phone</Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone number"
                  className="border-gray-200 focus:border-[#2C78E4] focus:ring-[#2C78E4]/20 rounded-xl"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-address" className="text-[#111827] font-medium">Address</Label>
              <Input
                id="edit-address"
                name="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full address"
                className="border-gray-200 focus:border-[#2C78E4] focus:ring-[#2C78E4]/20 rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-contact_name" className="text-[#111827] font-medium">Contact Person</Label>
              <Input
                id="edit-contact_name"
                name="contact_name"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                placeholder="Contact person name"
                className="border-gray-200 focus:border-[#2C78E4] focus:ring-[#2C78E4]/20 rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-notes" className="text-[#111827] font-medium">Notes</Label>
              <Textarea
                id="edit-notes"
                name="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this supplier"
                rows={3}
                className="border-gray-200 focus:border-[#2C78E4] focus:ring-[#2C78E4]/20 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="border-t border-gray-100 pt-4">
            <Button 
              variant="outline" 
              onClick={handleCancelEdit}
              disabled={isFormSubmitting}
              className="border-gray-200 hover:bg-[#F9FAFB] hover:border-[#2C78E4]/20 rounded-xl text-[#4B5563]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateSupplier}
              disabled={!formData.name || isFormSubmitting}
              className="bg-[#2C78E4] hover:bg-[#2C78E4]/90 text-white rounded-xl disabled:opacity-50"
            >
              {isFormSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4 mr-2" />
                  Update Supplier
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplierList;
