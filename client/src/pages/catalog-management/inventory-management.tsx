import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useProductDetails, useImportProductStock, useExportProductStock, useProductStockMovements } from "@/hooks/use-product";
import { ImportStockRequest, ExportStockRequest } from "@/services/product-services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowLeftCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  Loader2,
  AlertCircle,
  PackageCheck,
  ArrowLeft,
  BarChart2,
  ListFilter
} from "lucide-react";

const InventoryManagement: React.FC = () => {
  const { toast } = useToast();
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const numericProductId = productId ? parseInt(productId) : null;

  // UI State
  const [activeTab, setActiveTab] = useState("import");
  const [quantity, setQuantity] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);
  const [reason, setReason] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const pageSize = 10;

  // Fetch product details
  const { product, isLoading: isLoadingProduct } = useProductDetails(numericProductId);

  // Stock operations hooks
  const { importStock, isLoading: isImportLoading, reset: resetImport } = 
    useImportProductStock(numericProductId);
  const { exportStock, isLoading: isExportLoading, reset: resetExport } = 
    useExportProductStock(numericProductId);
  const { movements, pagination, isLoading: isMovementsLoading } = 
    useProductStockMovements(numericProductId, historyPage, pageSize);

  // Reset form on component unmount
  useEffect(() => {
    return () => {
      resetImport();
      resetExport();
    };
  }, [resetImport, resetExport]);

  // Handle stock import
  const handleImportStock = () => {
    if (numericProductId && quantity > 0) {
      const importData: ImportStockRequest = {
        quantity,
        unit_price: unitPrice,
        reason
      };
      
      importStock(importData, {
        onSuccess: () => {
          toast({
            title: "Cập nhật kho thành công",
            description: `Đã thêm ${quantity} đơn vị vào ${product?.name}`,
            className: "bg-green-50 text-green-800 border-green-200",
          });
          setQuantity(0);
          setUnitPrice(0);
          setReason("");
        },
        onError: (error) => {
          toast({
            title: "Lỗi cập nhật kho",
            description: error instanceof Error ? error.message : "Đã xảy ra lỗi không mong muốn",
            variant: "destructive",
          });
        }
      });
    } else {
      toast({
        title: "Dữ liệu không hợp lệ",
        description: "Vui lòng nhập số lượng hợp lệ lớn hơn 0",
        variant: "destructive",
      });
    }
  };

  // Handle stock export
  const handleExportStock = () => {
    if (numericProductId && quantity > 0 && product) {
      const exportData: ExportStockRequest = {
        quantity,
        unit_price: unitPrice,
        reason
      };
      
      exportStock(exportData, {
        onSuccess: () => {
          toast({
            title: "Cập nhật kho thành công",
            description: `Đã xóa ${quantity} đơn vị khỏi ${product.name}`,
            className: "bg-green-50 text-green-800 border-green-200",
          });
          setQuantity(0);
          setUnitPrice(0);
          setReason("");
        },
        onError: (error) => {
          toast({
            title: "Lỗi cập nhật kho",
            description: error instanceof Error 
              ? error.message 
              : "Đã xảy ra lỗi không mong muốn. Đảm bảo bạn có đủ hàng tồn kho.",
            variant: "destructive",
          });
        }
      });
    } else {
      toast({
        title: "Dữ liệu không hợp lệ",
        description: "Vui lòng nhập số lượng hợp lệ lớn hơn 0",
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
        return <Badge className="bg-green-100 text-green-800 border-green-200">Nhập kho</Badge>;
      case "export":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Xuất kho</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  if (isLoadingProduct) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-lg text-indigo-600">Đang tải thông tin sản phẩm...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-medium text-gray-800 mb-2">Không tìm thấy sản phẩm</h2>
        <p className="text-gray-500 mb-6">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <Button onClick={() => navigate("/catalog-management/products")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Trở về danh sách sản phẩm
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 rounded-xl shadow-md mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Quản lý kho</h1>
            <p className="text-indigo-100 text-sm">
              Quản lý tồn kho và ghi nhận biến động số lượng
            </p>
          </div>
          <Button 
            variant="outline" 
            className="bg-white hover:bg-indigo-50 text-indigo-700"
            onClick={() => navigate("/catalog-management/products")}
          >
            <ArrowLeftCircle className="h-4 w-4 mr-2" />
            Trở về danh sách sản phẩm
          </Button>
        </div>
      </div>

      <div className="container mx-auto">
        {/* Product Info Card */}
        <Card className="mb-6 border-indigo-100">
          <CardHeader className="pb-2 bg-indigo-50 border-b border-indigo-100">
            <div className="flex justify-between items-center">
              <CardTitle className="text-indigo-900">
                {product.name}
                <Badge className="ml-2 bg-indigo-100 text-indigo-700 border-indigo-200">
                  {product.category}
                </Badge>
              </CardTitle>
              <div className="flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${product.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-sm font-medium text-gray-700">
                  {product.isAvailable ? 'Có sẵn' : 'Không có sẵn'}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-1">
                {product.originalImage ? (
                  <div className="h-48 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img 
                      src={product.originalImage} 
                      alt={product.name}
                      className="object-contain max-h-full"
                    />
                  </div>
                ) : (
                  <div className="h-48 rounded-md bg-gray-100 flex items-center justify-center">
                    <PackageCheck className="h-16 w-16 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                    <p className="text-sm text-green-600 mb-1">Giá</p>
                    <p className="text-xl font-bold text-green-700">{formatCurrency(product.price)}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-600 mb-1">Tồn kho hiện tại</p>
                    <p className="text-xl font-bold text-blue-700">{product.stock} đơn vị</p>
                  </div>
                </div>
                
                {product.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Mô tả sản phẩm</h3>
                    <p className="text-gray-600">{product.description}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        
      </div>
    </div>
  );
};

export default InventoryManagement;