import React, { useState } from "react";
import { useProducts, useCreateProduct, useImportProductStock, useExportProductStock, useProductStockMovements } from "@/hooks/use-product";
import { CreateProductRequest, ImportStockRequest, ExportStockRequest, ProductStockMovementResponse } from "@/services/product-services";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    ShoppingBag
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

// Product interface for type safety
interface Product {
    productId: number;
    name: string;
    description?: string;
    price: number;
    stock: number;
    category: string;
    dataImage?: Uint8Array;
    originalImage?: string;
    isAvailable?: boolean;
}

// Format currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
    }).format(amount);
};

// EmptyState component for when no products exist
const EmptyState = ({ onAdd }: { onAdd: () => void }) => (
    <div className="flex flex-col items-center justify-center p-8 bg-indigo-50 rounded-lg border border-dashed border-indigo-200 h-64">
        <div className="rounded-full bg-indigo-100 p-3 mb-4">
            <Package className="h-6 w-6 text-indigo-600" />
        </div>
        <h3 className="text-lg font-medium mb-2 text-indigo-700">No products found</h3>
        <p className="text-sm text-indigo-500 text-center mb-4">
            Get started by creating your first product
        </p>
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={onAdd}>
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
  currentStock
}) => {
  const { toast } = useToast();
  const [stockDialogTab, setStockDialogTab] = useState("import");
  const [quantity, setQuantity] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);
  const [reason, setReason] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const [movementType, setMovementType] = useState<"import" | "export">("import");
  const pageSize = 5;

  // Use hooks
  const { importStock, isLoading: isImportLoading, isSuccess: isImportSuccess, reset: resetImport } = 
    useImportProductStock(productId);
  const { exportStock, isLoading: isExportLoading, isSuccess: isExportSuccess, error: exportError, reset: resetExport } = 
    useExportProductStock(productId);
  const { movements, pagination, isLoading: isMovementsLoading } = 
    useProductStockMovements(productId, historyPage, pageSize);

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
        reason
      };
      
      importStock(importData, {
        onSuccess: () => {
          toast({
            title: "Stock updated successfully",
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
            description: error instanceof Error ? error.message : "An unexpected error occurred",
            variant: "destructive",
          });
        }
      });
    } else {
      toast({
        title: "Invalid input",
        description: "Please enter a valid quantity greater than zero",
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
        reason
      };
      
      exportStock(exportData, {
        onSuccess: () => {
          toast({
            title: "Stock updated successfully",
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
            description: error instanceof Error 
              ? error.message 
              : "An unexpected error occurred. Make sure you have enough stock.",
            variant: "destructive",
          });
        }
      });
    } else {
      toast({
        title: "Invalid input",
        description: "Please enter a valid quantity greater than zero",
        variant: "destructive",
      });
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(amount);
  };

  // Handle movement type badge color
  const getMovementTypeBadge = (type: string) => {
    switch (type) {
      case "import":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Import</Badge>;
      case "export":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Export</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-[600px] border border-indigo-200 bg-white">
        <DialogHeader className="border-b border-indigo-100 pb-4">
          <DialogTitle className="text-indigo-900">
            Manage Stock - {productName}
          </DialogTitle>
          <DialogDescription className="text-indigo-500">
            Current stock: <span className="font-medium text-indigo-700">{currentStock} units</span>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={stockDialogTab} onValueChange={setStockDialogTab} className="mt-2">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="import" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800">
              <ArrowDownCircle className="h-4 w-4 mr-2" />
              Import
            </TabsTrigger>
            <TabsTrigger value="export" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800">
              <ArrowUpCircle className="h-4 w-4 mr-2" />
              Export
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-800">
              <Clock className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import">
            <div className="space-y-4 p-1 pt-4">
              <div>
                <Label htmlFor="import-quantity" className="mb-1.5 block">Quantity to Import*</Label>
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
                <Label htmlFor="import-unit-price" className="mb-1.5 block">Unit Price (VND)*</Label>
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
                <Label htmlFor="import-reason" className="mb-1.5 block">Reason for Import</Label>
                <Textarea
                  id="import-reason"
                  placeholder="E.g., Restocking, New shipment received, etc."
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
                    Import Stock
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="export">
            <div className="space-y-4 p-1 pt-4">
              <div>
                <Label htmlFor="export-quantity" className="mb-1.5 block">Quantity to Export*</Label>
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
                <Label htmlFor="export-unit-price" className="mb-1.5 block">Unit Price (VND)*</Label>
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
                <Label htmlFor="export-reason" className="mb-1.5 block">Reason for Export</Label>
                <Textarea
                  id="export-reason"
                  placeholder="E.g., Used in treatment, Damaged items, etc."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="border-blue-200 focus:border-blue-500"
                />
              </div>

              <Button
                disabled={isExportLoading || quantity <= 0 || quantity > currentStock}
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
                    Export Stock
                  </>
                )}
              </Button>

              {quantity > currentStock && (
                <p className="text-xs text-red-500 flex items-center mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Cannot export more than current stock
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="p-1 pt-4">
              <h3 className="text-sm font-medium text-indigo-900 mb-2">Stock Movement History</h3>
              
              {isMovementsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                </div>
              ) : movements.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-md border border-dashed border-gray-200">
                  <Clock className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No stock movements found for this product</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[90px]">Type</TableHead>
                        <TableHead className="w-[60px] text-right">Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead className="text-right">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movements.map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell>{getMovementTypeBadge(movement.movement_type)}</TableCell>
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
                        onClick={() => setHistoryPage(prev => Math.max(1, prev - 1))}
                        disabled={historyPage === 1}
                        className="h-8 w-8 p-0 border-indigo-200"
                      >
                        &lt;
                      </Button>
                      <span className="text-sm flex items-center px-2 bg-indigo-50 rounded-md">
                        {historyPage} of {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setHistoryPage(prev => Math.min(pagination.totalPages, prev + 1))}
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
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [stockDialogOpen, setStockDialogOpen] = useState(false);
    const [stockDialogProduct, setStockDialogProduct] = useState<Product | null>(null);

    // Form state
    const [formData, setFormData] = useState<CreateProductRequest>({
        name: "",
        description: "",
        price: 0,
        stockQuantity: 0,
        category: "",
        isAvailable: true
    });

    // Hooks
    const { toast } = useToast();
    const { products, pagination, isLoading: isLoadingProducts, error: productsError, refetch } = useProducts(currentPage, pageSize);
    console.log("pagination", pagination);
    console.log("testing", products);
    const { createProduct, isLoading: isCreating } = useCreateProduct();

    // Filter products based on search term
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Handle opening add dialog
    const handleOpenAddDialog = () => {
        setFormData({
            name: "",
            description: "",
            price: 0,
            stockQuantity: 0,
            category: "",
            isAvailable: true
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
            stockQuantity: product.stock,
            category: product.category,
            isAvailable: product.isAvailable !== undefined ? product.isAvailable : true
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
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' || name === 'stockQuantity' ? Number(value) : value
        }));
    };

    // Handle checkbox change
    const handleCheckboxChange = (checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            isAvailable: checked
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

    // Handle create product submission
    const handleSubmit = () => {
        if (isAddingItem) {
            createProduct({
                productData: formData,
                imageFile: selectedImage || undefined
            }, {
                onSuccess: () => {
                    toast({
                        title: "Product created successfully",
                        description: "The new product has been added to the catalog.",
                        className: "bg-green-50 text-green-800 border-green-200",
                    });
                    setIsAddingItem(false);
                    refetch();
                },
                onError: (error) => {
                    toast({
                        title: "Error creating product",
                        description: error instanceof Error ? error.message : "An unexpected error occurred",
                        variant: "destructive",
                    });
                }
            });
        }
        // For now, we only handle adding products
    };

    // Handle pagination
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className="space-y-6">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 rounded-xl shadow-md mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Product Management</h1>
                        <p className="text-indigo-100 text-sm">
                            Manage your clinic's inventory and products
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto">
                <div className="bg-white rounded-lg border border-indigo-100 shadow-sm p-6 mb-6">
                    {/* Search and add section */}
                    <div className="flex justify-between items-center mb-6 bg-indigo-50 p-3 rounded-md border border-indigo-100">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-400" />
                            <Input
                                placeholder="Search products..."
                                className="pl-10 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={handleOpenAddDialog}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add New Product
                        </Button>
                    </div>

                    {/* Products listing */}
                    {isLoadingProducts ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                        </div>
                    ) : productsError ? (
                        <div className="flex flex-col items-center justify-center h-64 text-red-600">
                            <AlertCircle className="h-10 w-10 mb-2" />
                            <p>Error loading products. Please try again later.</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <EmptyState onAdd={handleOpenAddDialog} />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredProducts.map((product) => (
                                <Card key={product.productId} className="hover:shadow-md transition-shadow border border-indigo-100">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex justify-between items-start">
                                            <div>
                                                <span className="text-lg font-semibold text-indigo-900">{product.name}</span>
                                                <Badge className="ml-2 bg-indigo-100 text-indigo-700 border-indigo-200">
                                                    {product.category}
                                                </Badge>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-indigo-600 hover:bg-indigo-50"
                                                    onClick={() => handleOpenEditDialog(product)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:bg-red-50"
                                                    onClick={() => handleOpenDeleteDialog(product.productId)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {product.originalImage && (
                                                <div className="h-32 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                                                    <img 
                                                        src={product.originalImage} 
                                                        alt={product.name}
                                                        className="object-contain h-full w-full"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center text-sm text-indigo-600">
                                                    <span className={`w-3 h-3 rounded-full mr-2 ${product.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                    {product.isAvailable ? 'Available' : 'Unavailable'}
                                                </div>
                                                <span className="font-medium text-green-600">{formatCurrency(product.price)}</span>
                                            </div>
                                            {product.description && (
                                                <p className="text-sm text-gray-600">{product.description}</p>
                                            )}
                                            <div className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 border border-blue-200">
                                                <strong>In Stock:</strong> {product.stock} units
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-indigo-300 text-indigo-700 hover:bg-indigo-100 mt-2"
                                                onClick={() => handleOpenStockDialog(product)}
                                            >
                                                <ShoppingBag className="h-4 w-4 mr-2" />
                                                Manage Stock
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {/* {pagination && pagination.totalPages > 0 && (
                        <div className="flex flex-col items-center space-y-4 mt-8 pb-4">
                            <p className="text-sm text-indigo-600 font-medium">
                                Page {pagination.page} of {pagination.totalPages} • Showing {filteredProducts.length} of {pagination.total} products
                            </p>
                            <div className="flex justify-center items-center space-x-2 bg-indigo-50 px-4 py-3 rounded-lg shadow-sm border border-indigo-100">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="border-indigo-300 text-indigo-700 hover:bg-indigo-100"
                                >
                                    Previous
                                </Button>
                                {Array.from({ length: pagination.totalPages }).map((_, index) => (
                                    <Button
                                        key={index}
                                        variant={pagination.page === index + 1 ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handlePageChange(index + 1)}
                                        className={
                                            pagination.page === index + 1
                                                ? "bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                                                : "border-indigo-300 text-indigo-700 hover:bg-indigo-100"
                                        }
                                    >
                                        {index + 1}
                                    </Button>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="border-indigo-300 text-indigo-700 hover:bg-indigo-100"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )} */}
                </div>

                {/* Add/Edit Dialog */}
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
                    <DialogContent className="sm:max-w-[600px] border border-indigo-200 bg-white">
                        <DialogHeader className="border-b border-indigo-100 pb-4">
                            <DialogTitle className="text-indigo-900">
                                {isAddingItem ? "Add New Product" : "Edit Product"}
                            </DialogTitle>
                            <DialogDescription className="text-indigo-500">
                                Fill in the details below to {isAddingItem ? "create" : "update"} this product in your catalog.
                            </DialogDescription>
                        </DialogHeader>

                        <ScrollArea className="max-h-[60vh] px-1">
                            <div className="space-y-4 p-1">
                                <div>
                                    <Label htmlFor="name" className="mb-1.5 block">Product Name*</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter product name"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="category" className="mb-1.5 block">Category*</Label>
                                    <Input
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        placeholder="Product category (e.g., Medication, Food, Toys)"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="price" className="mb-1.5 block">Price (VND)*</Label>
                                        <Input
                                            id="price"
                                            name="price"
                                            type="number"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="stockQuantity" className="mb-1.5 block">Stock Quantity*</Label>
                                        <Input
                                            id="stockQuantity"
                                            name="stockQuantity"
                                            type="number"
                                            value={formData.stockQuantity}
                                            onChange={handleInputChange}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="description" className="mb-1.5 block">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Enter product description"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="isAvailable" 
                                        checked={formData.isAvailable}
                                        onCheckedChange={handleCheckboxChange}
                                    />
                                    <Label htmlFor="isAvailable">Product is available</Label>
                                </div>

                                <div>
                                    <Label htmlFor="image" className="mb-1.5 block">Product Image</Label>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            id="image"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="flex-1"
                                        />
                                        {imagePreview && (
                                            <div className="w-16 h-16 border rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                                                <img 
                                                    src={imagePreview} 
                                                    alt="Preview" 
                                                    className="object-contain max-w-full max-h-full"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>

                        <DialogFooter className="border-t border-indigo-100 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsAddingItem(false);
                                    setIsEditingItem(false);
                                }}
                                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={isCreating || !formData.name || formData.price <= 0}
                                onClick={handleSubmit}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                {isCreating ? (
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
                    <AlertDialogContent className="border border-red-200 bg-white">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-red-600">Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the selected product from your catalog.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                            >
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Stock Management Dialog */}
                {stockDialogProduct && (
                    <StockManagementDialog
                        open={stockDialogOpen}
                        onOpenChange={setStockDialogOpen}
                        productId={stockDialogProduct.productId}
                        productName={stockDialogProduct.name}
                        currentStock={stockDialogProduct.stock}
                    />
                )}
            </div>
        </div>
    );
};

export default ProductManagement;