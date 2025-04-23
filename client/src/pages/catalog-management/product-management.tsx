import React, { useState } from "react";
import { useProducts, useCreateProduct } from "@/hooks/use-product";
import { CreateProductRequest } from "@/services/product-services";
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
    Package,
    DollarSign,
    Loader2,
    AlertCircle,
    Image as ImageIcon
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
                                            {/* <div className="flex justify-between items-center"> */}
                                                {/* <div className="flex items-center text-sm text-indigo-600">
                                                    <span className={`w-3 h-3 rounded-full mr-2 ${product.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                    {product.isAvailable ? 'Available' : 'Unavailable'}
                                                </div>
                                                <span className="font-medium text-green-600">{formatCurrency(product.price)}</span>
                                            </div>
                                            {product.description && (
                                                <p className="text-sm text-gray-600">{product.description}</p>
                                            )} */}
                                            <div className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 border border-blue-200">
                                                <strong>In Stock:</strong> {product.stock} units
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-2 mt-6">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="border-indigo-200 text-indigo-600"
                            >
                                Previous
                            </Button>
                            {Array.from({ length: pagination.totalPages }).map((_, index) => (
                                <Button
                                    key={index}
                                    variant={currentPage === index + 1 ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handlePageChange(index + 1)}
                                    className={
                                        currentPage === index + 1
                                            ? "bg-indigo-600 text-white"
                                            : "border-indigo-200 text-indigo-600"
                                    }
                                >
                                    {index + 1}
                                </Button>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === pagination.totalPages}
                                className="border-indigo-200 text-indigo-600"
                            >
                                Next
                            </Button>
                        </div>
                    )}
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
            </div>
        </div>
    );
};

export default ProductManagement;