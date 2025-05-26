import React, { useState, useEffect } from "react";
import {
  useProducts,
  useCreateProduct,
  useImportProductStock,
  useExportProductStock,
  useProductStockMovements,
} from "@/hooks/use-product";
import {
  CreateProductRequest,
  ImportStockRequest,
  ExportStockRequest,
  ProductStockMovementResponse,
} from "@/services/product-services";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Package,
  DollarSign,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  PackageOpen,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  ShoppingBag,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

// Product interface for type safety
interface Product {
  productId: number;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  category: string;
  dataImage?: Uint8Array;
  originalImage?: string;
  isAvailable?: boolean;
}

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(date);
};

// Handle movement type badge color
const getMovementTypeBadge = (type: string) => {
  switch (type) {
    case "import":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          Import
        </Badge>
      );
    case "export":
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          Export
        </Badge>
      );
    default:
      return <Badge>{type}</Badge>;
  }
};

// EmptyState component for when no products exist
const EmptyState = ({ onAdd }: { onAdd: () => void }) => (
  <div className="flex flex-col items-center justify-center p-8 bg-[#F9FAFB] rounded-2xl border border-dashed border-[#2C78E4]/20 h-64 transition-all hover:border-[#2C78E4]/40">
    <div className="rounded-full bg-[#F0F7FF] p-4 mb-5 shadow-sm">
      <Package className="h-7 w-7 text-[#2C78E4]" />
    </div>
    <h3 className="text-lg font-medium mb-2 text-[#111827]">
      No products found
    </h3>
    <p className="text-sm text-[#4B5563] text-center mb-6 max-w-xs">
      Get started by creating your first product in your catalog
    </p>
    <Button
      size="sm"
      className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg"
      onClick={onAdd}
    >
      <PlusCircle className="h-4 w-4 mr-2" />
      Add product
    </Button>
  </div>
);

// StockManagementDialog component
interface StockManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: number | null;
  productName: string;
  currentStock: number;
}

const StockManagementDialog: React.FC<StockManagementDialogProps> = ({
  open,
  onOpenChange,
  productId,
  productName,
  currentStock,
}) => {
  const { toast } = useToast();
  const [stockDialogTab, setStockDialogTab] = useState("import");
  const [quantity, setQuantity] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);
  const [reason, setReason] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const [movementType, setMovementType] = useState<"import" | "export">(
    "import"
  );
  const pageSize = 5;

  // Use hooks
  const {
    importStock,
    isLoading: isImportLoading,
    isSuccess: isImportSuccess,
    reset: resetImport,
  } = useImportProductStock(productId);
  const {
    exportStock,
    isLoading: isExportLoading,
    isSuccess: isExportSuccess,
    error: exportError,
    reset: resetExport,
  } = useExportProductStock(productId);
  const {
    movements,
    pagination,
    isLoading: isMovementsLoading,
  } = useProductStockMovements(productId, historyPage, pageSize);

  // Reset form on dialog close
  const handleCloseDialog = () => {
    setQuantity(0);
    setUnitPrice(0);
    setReason("");
    resetImport();
    resetExport();
    onOpenChange(false);
  };

  // Handle stock import
  const handleImportStock = () => {
    if (productId && quantity > 0) {
      const importData: ImportStockRequest = {
        quantity,
        unit_price: unitPrice,
        reason,
      };

      importStock(importData, {
        onSuccess: () => {
          toast({
            title: "Update stock successfully",
            description: `Added ${quantity} units to ${productName}`,
            className: "bg-green-50 text-green-800 border-green-200",
          });
          setQuantity(0);
          setUnitPrice(0);
          setReason("");
        },
        onError: (error) => {
          toast({
            title: "Error updating stock",
            description:
              error instanceof Error
                ? error.message
                : "An unexpected error occurred",
            variant: "destructive",
          });
        },
      });
    } else {
      toast({
        title: "Invalid data",
        description: "Please enter a valid quantity greater than 0",
        variant: "destructive",
      });
    }
  };

  // Handle stock export
  const handleExportStock = () => {
    if (productId && quantity > 0) {
      const exportData: ExportStockRequest = {
        quantity,
        unit_price: unitPrice,
        reason,
      };

      exportStock(exportData, {
        onSuccess: () => {
          toast({
            title: "Update stock successfully",
            description: `Removed ${quantity} units from ${productName}`,
            className: "bg-green-50 text-green-800 border-green-200",
          });
          setQuantity(0);
          setUnitPrice(0);
          setReason("");
        },
        onError: (error) => {
          toast({
            title: "Error updating stock",
            description:
              error instanceof Error
                ? error.message
                : "An unexpected error occurred. Ensure you have enough stock.",
            variant: "destructive",
          });
        },
      });
    } else {
      toast({
        title: "Invalid data",
        description: "Please enter a valid quantity greater than 0",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-[600px] border border-indigo-200 bg-white">
        <DialogHeader className="border-b border-indigo-100 pb-4">
          <DialogTitle className="text-indigo-900">
            Stock Management - {productName}
          </DialogTitle>
          <DialogDescription className="text-indigo-500">
            Current stock:{" "}
            <span className="font-medium text-indigo-700">
              {currentStock} units
            </span>
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={stockDialogTab}
          onValueChange={setStockDialogTab}
          className="mt-2"
        >
          <TabsList className="grid grid-cols-3">
            <TabsTrigger
              value="import"
              className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800"
            >
              <ArrowDownCircle className="h-4 w-4 mr-2" />
              Import
            </TabsTrigger>
            <TabsTrigger
              value="export"
              className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800"
            >
              <ArrowUpCircle className="h-4 w-4 mr-2" />
              Export
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-800"
            >
              <Clock className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import">
            <div className="space-y-4 p-1 pt-4">
              <div>
                <Label htmlFor="import-quantity" className="mb-1.5 block">
                  Import quantity*
                </Label>
                <Input
                  id="import-quantity"
                  type="number"
                  placeholder="0"
                  min="1"
                  value={quantity || ""}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  className="border-green-200 focus:border-green-500"
                />
              </div>

              <div>
                <Label htmlFor="import-unit-price" className="mb-1.5 block">
                  Unit price (VND)*
                </Label>
                <Input
                  id="import-unit-price"
                  type="number"
                  placeholder="0"
                  min="0"
                  value={unitPrice || ""}
                  onChange={(e) => setUnitPrice(parseInt(e.target.value) || 0)}
                  className="border-green-200 focus:border-green-500"
                />
              </div>

              <div>
                <Label htmlFor="import-reason" className="mb-1.5 block">
                  Reason for import
                </Label>
                <Textarea
                  id="import-reason"
                  placeholder="Example: Supplement stock, Receive new stock, etc."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="border-green-200 focus:border-green-500"
                />
              </div>

              <Button
                disabled={isImportLoading || quantity <= 0 || unitPrice <= 0}
                onClick={handleImportStock}
                className="w-full bg-green-600 hover:bg-green-700 text-white mt-2"
              >
                {isImportLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <ArrowDownCircle className="h-4 w-4 mr-2" />
                    Import
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="export">
            <div className="space-y-4 p-1 pt-4">
              <div>
                <Label htmlFor="export-quantity" className="mb-1.5 block">
                  Export quantity*
                </Label>
                <Input
                  id="export-quantity"
                  type="number"
                  placeholder="0"
                  min="1"
                  max={currentStock}
                  value={quantity || ""}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  className="border-blue-200 focus:border-blue-500"
                />
                {currentStock > 0 && (
                  <p className="text-xs mt-1 text-blue-600">
                    Maximum available: {currentStock} units
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="export-unit-price" className="mb-1.5 block">
                  Unit price (VND)*
                </Label>
                <Input
                  id="export-unit-price"
                  type="number"
                  placeholder="0"
                  min="0"
                  value={unitPrice || ""}
                  onChange={(e) => setUnitPrice(parseInt(e.target.value) || 0)}
                  className="border-blue-200 focus:border-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="export-reason" className="mb-1.5 block">
                  Reason for export
                </Label>
                <Textarea
                  id="export-reason"
                  placeholder="Example: Used in treatment, Product damaged, etc."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="border-blue-200 focus:border-blue-500"
                />
              </div>

              <Button
                disabled={
                  isExportLoading || quantity <= 0 || quantity > currentStock
                }
                onClick={handleExportStock}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2"
              >
                {isExportLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <ArrowUpCircle className="h-4 w-4 mr-2" />
                    Export
                  </>
                )}
              </Button>

              {quantity > currentStock && (
                <p className="text-xs text-red-500 flex items-center mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Cannot export more than stock quantity
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="p-1 pt-4">
              <h3 className="text-sm font-medium text-indigo-900 mb-2">
                Stock movement history
              </h3>

              {isMovementsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                </div>
              ) : movements.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-md border border-dashed border-gray-200">
                  <Clock className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">
                    No stock movement found for this product
                  </p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[90px]">Type</TableHead>
                        <TableHead className="w-[60px] text-right">
                          Quantity
                        </TableHead>
                        <TableHead className="text-right">Unit price</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead className="text-right">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movements.map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell>
                            {getMovementTypeBadge(movement.movement_type)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {movement.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(movement.price || 0)}
                          </TableCell>
                          <TableCell className="max-w-[120px] truncate">
                            {movement.reason || "-"}
                          </TableCell>
                          <TableCell className="text-right text-gray-500 text-xs">
                            {formatDate(movement.movement_date)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {pagination.totalPages > 1 && (
                    <div className="flex justify-center mt-4 space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setHistoryPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={historyPage === 1}
                        className="h-8 w-8 p-0 border-indigo-200"
                      >
                        &lt;
                      </Button>
                      <span className="text-sm flex items-center px-2 bg-indigo-50 rounded-md">
                        {historyPage} / {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setHistoryPage((prev) =>
                            Math.min(pagination.totalPages, prev + 1)
                          )
                        }
                        disabled={historyPage === pagination.totalPages}
                        className="h-8 w-8 p-0 border-indigo-200"
                      >
                        &gt;
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

const ProductManagement: React.FC = () => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9; // Items per page

  // State variables
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [stockDialogProduct, setStockDialogProduct] = useState<Product | null>(
    null
  );

  // Form state
  const [formData, setFormData] = useState<CreateProductRequest>({
    name: "",
    description: "",
    price: 0,
    stock_quantity: 0,
    category: "",
    isAvailable: true,
  });

  // Hooks
  const { toast } = useToast();
  const {
    products,
    pagination,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch,
  } = useProducts(currentPage, pageSize);
  const { createProduct, isLoading: isCreating } = useCreateProduct();

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category &&
        product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Reset pagination when search changes
  useEffect(() => {
    if (searchTerm) {
      setCurrentPage(1);
    }
  }, [searchTerm]);

  // Handle opening add dialog
  const handleOpenAddDialog = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      stock_quantity: 0,
      category: "",
      isAvailable: true,
    });
    setSelectedImage(null);
    setImagePreview(null);
    setIsAddingItem(true);
  };

  // Handle opening edit dialog
  const handleOpenEditDialog = (product: Product) => {
    setSelectedProductId(product.productId);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock_quantity: product.stock_quantity,
      category: product.category,
      isAvailable: product.isAvailable !== undefined ? product.isAvailable : true,
    });
    setImagePreview(product.originalImage || null);
    setIsEditingItem(true);
  };

  // Handle opening delete dialog
  const handleOpenDeleteDialog = (id: number) => {
    setSelectedProductId(id);
    setDeleteConfirmOpen(true);
  };

  // Handle opening stock management dialog
  const handleOpenStockDialog = (product: Product) => {
    setStockDialogProduct(product);
    setStockDialogOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    console.log('Input Change:', name, value, typeof value);
    setFormData((prev) => {
      const newValue = name === "price" || name === "stock_quantity" ? Number(value) : value;
      console.log('Setting formData:', name, newValue, typeof newValue);
      return {
        ...prev,
        [name]: newValue,
      };
    });
  };

  // Handle checkbox change
  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isAvailable: checked,
    }));
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (isAddingItem) {
      console.log('Form Data before submission:', formData);

      if (!selectedImage) {
        toast({
          title: "Image required",
          description: "Please select a product image",
          variant: "destructive",
        });
        return;
      }

      if (!formData.name || formData.price <= 0) {
        toast({
          title: "Invalid data",
          description: "Please fill in all required fields with valid values",
          variant: "destructive",
        });
        return;
      }

      // Transform the data to match API expectations
      const apiFormData = {
        ...formData,
        stock: formData.stock_quantity, // Use stock_quantity directly
      };
      console.log('API Form Data:', apiFormData);

      createProduct(
        {
          productData: apiFormData,
          imageFile: selectedImage,
        },
        {
          onSuccess: () => {
            toast({
              title: "Product created successfully",
              description: "The new product has been added to your catalog.",
              className: "bg-green-50 text-green-800 border-green-200",
            });
            setIsAddingItem(false);
            setSelectedImage(null);
            setImagePreview(null);
            refetch();
          },
          onError: (error) => {
            toast({
              title: "Error creating product",
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
            <h1 className="text-xl font-semibold text-white">Product Management</h1>
            <p className="text-sm text-white">Manage your product catalog and inventory</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#2C78E4]/20 shadow-sm p-6 mb-6">
        {/* Search and add section */}
        <div className="flex justify-between items-center mb-6 bg-[#F9FAFB] p-4 rounded-xl border border-[#2C78E4]/20">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#4B5563]" />
            <Input
              placeholder="Search products..."
              className="pl-10 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={handleOpenAddDialog}
            className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add new product
          </Button>
        </div>

        {/* Products listing */}
        {isLoadingProducts ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#2C78E4]" />
          </div>
        ) : productsError ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-600">
            <AlertCircle className="h-10 w-10 mb-2" />
            <p>Error loading products. Please try again later.</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState onAdd={handleOpenAddDialog} />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <Card
                  key={product.productId}
                  className="hover:shadow-lg transition-all duration-200 border border-[#2C78E4]/10 rounded-2xl overflow-hidden bg-white"
                >
                  <CardHeader className="pb-2 space-y-1">
                    <CardTitle className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-lg font-semibold text-[#111827]">
                          {product.name}
                        </span>
                        <Badge className="bg-[#F0F7FF] text-[#2C78E4] border-[#2C78E4]/20 rounded-full">
                          {product.category}
                        </Badge>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#4B5563] hover:text-[#2C78E4] hover:bg-[#F0F7FF] rounded-xl h-8 w-8 p-0"
                          onClick={() => handleOpenEditDialog(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#4B5563] hover:text-red-600 hover:bg-red-50 rounded-xl h-8 w-8 p-0"
                          onClick={() => handleOpenDeleteDialog(product.productId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {product.originalImage && (
                        <div className="h-32 rounded-xl overflow-hidden bg-[#F9FAFB] flex items-center justify-center border border-[#2C78E4]/10">
                          <img
                            src={product.originalImage}
                            alt={product.name}
                            className="object-contain h-full w-full"
                          />
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-sm text-[#4B5563]">
                          <span
                            className={`w-2 h-2 rounded-full mr-2 ${
                              product.isAvailable ? "bg-green-500" : "bg-red-500"
                            }`}
                          ></span>
                          {product.isAvailable ? "Available" : "Not available"}
                        </div>
                        <span className="font-medium text-[#111827]">
                          {formatCurrency(product.price)}
                        </span>
                      </div>
                      {product.description && (
                        <p className="text-sm text-[#4B5563] line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <div className="bg-[#F9FAFB] p-3 rounded-xl text-sm text-[#4B5563] border border-[#2C78E4]/10 flex items-center justify-between">
                        <span className="font-medium">Stock</span>
                        <span>{product.stock_quantity} units</span>
                      </div>
                  
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

          </>
        )}
      </div>

      {/* Dialog boxes, etc... */}
      <Dialog
        open={isAddingItem || isEditingItem}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddingItem(false);
            setIsEditingItem(false);
            setSelectedImage(null);
            setImagePreview(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] border border-[#2C78E4]/20 bg-white rounded-2xl">
          <DialogHeader className="border-b border-[#2C78E4]/10 pb-4">
            <DialogTitle className="text-[#111827] text-xl">
              {isAddingItem ? "Add new product" : "Edit product"}
            </DialogTitle>
            <DialogDescription className="text-[#4B5563]">
              Fill in the details below to {isAddingItem ? "create" : "update"} this product in your catalog.
              {isAddingItem && <span className="text-red-500"> * Image is required</span>}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] px-1">
            <div className="space-y-4 p-1">
              <div>
                <Label htmlFor="name" className="text-[#111827] font-medium">
                  Product name*
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  className="mt-1.5 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-[#111827] font-medium">
                  Category*
                </Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Product category (e.g. Medicine, Food, Toys)"
                  className="mt-1.5 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price" className="text-[#111827] font-medium">
                    Price (VND)*
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="mt-1.5 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="stock_quantity" className="text-[#111827] font-medium">
                    Stock quantity*
                  </Label>
                  <Input
                    id="stock_quantity"
                    name="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="mt-1.5 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-[#111827] font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  rows={3}
                  className="mt-1.5 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl"
                />
              </div>

              {/* <div className="flex items-center space-x-2">
                <Checkbox
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onCheckedChange={handleCheckboxChange}
                  className="border-[#2C78E4]/20 data-[state=checked]:bg-[#2C78E4] data-[state=checked]:border-[#2C78E4]"
                />
                <Label htmlFor="isAvailable" className="text-[#4B5563]">
                  Product available
                </Label>
              </div> */}

              <div>
                <Label htmlFor="image" className="text-[#111827] font-medium">
                  Product image{isAddingItem && <span className="text-red-500">*</span>}
                </Label>
                <div className="flex items-center gap-4 mt-1.5">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={`flex-1 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl ${
                      isAddingItem && !selectedImage ? 'border-red-300' : ''
                    }`}
                    required={isAddingItem}
                  />
                  {imagePreview && (
                    <div className="w-16 h-16 border border-[#2C78E4]/20 rounded-xl overflow-hidden bg-[#F9FAFB] flex items-center justify-center">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="object-contain max-w-full max-h-full"
                      />
                    </div>
                  )}
                </div>
                {isAddingItem && !selectedImage && (
                  <p className="text-xs text-red-500 mt-1">Please select a product image</p>
                )}
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="border-t border-[#2C78E4]/10 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddingItem(false);
                setIsEditingItem(false);
                setSelectedImage(null);
                setImagePreview(null);
              }}
              className="border-[#2C78E4]/20 text-[#4B5563] hover:bg-[#F9FAFB] rounded-xl"
            >
              Cancel
            </Button>
            <Button
              disabled={
                isCreating ||
                !formData.name ||
                formData.price <= 0 ||
                (isAddingItem && !selectedImage)
              }
              onClick={handleSubmit}
              className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
            >
              {isCreating ? (
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
              Delete Product
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#4B5563]">
              Are you sure you want to delete this product? This action cannot be undone and will permanently remove the product from your catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-t border-red-100 pt-4">
            <AlertDialogCancel className="border-[#2C78E4]/20 text-[#4B5563] hover:bg-[#F9FAFB] rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-md">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductManagement;
