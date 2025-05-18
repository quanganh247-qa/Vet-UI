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

        {/* Inventory Management Tabs
        <div className="bg-white rounded-lg border border-indigo-100 shadow-sm p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="import" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800">
                <ArrowDownCircle className="h-4 w-4 mr-2" />
                Nhập kho
              </TabsTrigger>
              <TabsTrigger value="export" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800">
                <ArrowUpCircle className="h-4 w-4 mr-2" />
                Xuất kho
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-800">
                <Clock className="h-4 w-4 mr-2" />
                Lịch sử biến động
              </TabsTrigger>
            </TabsList>

            <TabsContent value="import">
              <Card className="border-green-100">
                <CardHeader className="bg-green-50 border-b border-green-100">
                  <CardTitle className="text-green-800">Nhập kho sản phẩm</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4 max-w-md mx-auto">
                    <div>
                      <Label htmlFor="import-quantity" className="mb-1.5 block text-green-700">Số lượng nhập*</Label>
                      <Input
                        id="import-quantity"
                        type="number"
                        placeholder="0"
                        min="1"
                        value={quantity || ""}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                        className="border-green-200 focus-visible:ring-green-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="import-unit-price" className="mb-1.5 block text-green-700">Đơn giá (VND)*</Label>
                      <Input
                        id="import-unit-price"
                        type="number"
                        placeholder="0"
                        min="0"
                        value={unitPrice || ""}
                        onChange={(e) => setUnitPrice(parseInt(e.target.value) || 0)}
                        className="border-green-200 focus-visible:ring-green-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="import-reason" className="mb-1.5 block text-green-700">Lý do nhập</Label>
                      <Textarea
                        id="import-reason"
                        placeholder="Ví dụ: Bổ sung hàng, Nhận lô hàng mới, v.v."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        className="border-green-200 focus-visible:ring-green-500"
                      />
                    </div>

                    <Button
                      disabled={isImportLoading || quantity <= 0 || unitPrice <= 0}
                      onClick={handleImportStock}
                      className="w-full bg-green-600 hover:bg-green-700 text-white mt-4"
                    >
                      {isImportLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Đang nhập kho...
                        </>
                      ) : (
                        <>
                          <ArrowDownCircle className="h-4 w-4 mr-2" />
                          Nhập kho
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="export">
              <Card className="border-blue-100">
                <CardHeader className="bg-blue-50 border-b border-blue-100">
                  <CardTitle className="text-blue-800">Xuất kho sản phẩm</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4 max-w-md mx-auto">
                    <div>
                      <Label htmlFor="export-quantity" className="mb-1.5 block text-blue-700">Số lượng xuất*</Label>
                      <Input
                        id="export-quantity"
                        type="number"
                        placeholder="0"
                        min="1"
                        max={product.stock}
                        value={quantity || ""}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                        className="border-blue-200 focus-visible:ring-blue-500"
                      />
                      {product.stock > 0 && (
                        <p className="text-xs mt-1 text-blue-600">
                          Tối đa có sẵn: {product.stock} đơn vị
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="export-unit-price" className="mb-1.5 block text-blue-700">Đơn giá (VND)*</Label>
                      <Input
                        id="export-unit-price"
                        type="number"
                        placeholder="0"
                        min="0"
                        value={unitPrice || ""}
                        onChange={(e) => setUnitPrice(parseInt(e.target.value) || 0)}
                        className="border-blue-200 focus-visible:ring-blue-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="export-reason" className="mb-1.5 block text-blue-700">Lý do xuất</Label>
                      <Textarea
                        id="export-reason"
                        placeholder="Ví dụ: Sử dụng trong điều trị, Hàng hóa bị hỏng, v.v."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        className="border-blue-200 focus-visible:ring-blue-500"
                      />
                    </div>

                    <Button
                      disabled={isExportLoading || quantity <= 0 || quantity > product.stock}
                      onClick={handleExportStock}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4"
                    >
                      {isExportLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Đang xuất kho...
                        </>
                      ) : (
                        <>
                          <ArrowUpCircle className="h-4 w-4 mr-2" />
                          Xuất kho
                        </>
                      )}
                    </Button>

                    {quantity > product.stock && (
                      <p className="text-xs text-red-500 flex items-center mt-1">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Không thể xuất nhiều hơn số lượng tồn kho
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader className="bg-indigo-50 border-b border-indigo-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-indigo-800">Lịch sử biến động kho</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="h-8 text-xs border-indigo-200">
                        <BarChart2 className="h-3.5 w-3.5 mr-1" />
                        Thống kê
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 text-xs border-indigo-200">
                        <ListFilter className="h-3.5 w-3.5 mr-1" />
                        Lọc
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {isMovementsLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                      <span className="ml-2 text-indigo-600">Đang tải lịch sử...</span>
                    </div>
                  ) : movements.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 text-lg font-medium">Không tìm thấy biến động kho nào</p>
                      <p className="text-gray-400">Sản phẩm này chưa có lịch sử nhập hoặc xuất kho</p>
                    </div>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="w-[100px] text-indigo-900">Loại</TableHead>
                            <TableHead className="w-[80px] text-right text-indigo-900">SL</TableHead>
                            <TableHead className="text-right text-indigo-900">Đơn giá</TableHead>
                            <TableHead className="w-[250px] text-indigo-900">Lý do</TableHead>
                            <TableHead className="text-right text-indigo-900">Ngày</TableHead>
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
                              <TableCell className="max-w-[250px] truncate">
                                {movement.reason || "-"}
                              </TableCell>
                              <TableCell className="text-right text-gray-500">
                                {formatDate(movement.movement_date)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      
                      {pagination.totalPages > 1 && (
                        <div className="flex justify-center py-4 border-t">
                          <div className="flex items-center space-x-6">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setHistoryPage(prev => Math.max(1, prev - 1))}
                              disabled={historyPage === 1}
                              className="h-8 border-indigo-200"
                            >
                              Trang trước
                            </Button>
                            
                            <div className="flex items-center">
                              <span className="text-sm text-indigo-800 font-medium mr-1">Trang</span>
                              <span className="bg-indigo-50 px-2 py-1 rounded-md font-medium text-indigo-800">
                                {historyPage}
                              </span>
                              <span className="text-sm text-indigo-800 font-medium mx-1">trên</span>
                              <span className="text-sm text-indigo-800 font-medium">{pagination.totalPages}</span>
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setHistoryPage(prev => Math.min(pagination.totalPages, prev + 1))}
                              disabled={historyPage === pagination.totalPages}
                              className="h-8 border-indigo-200"
                            >
                              Trang sau
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div> */}
      </div>
    </div>
  );
};

export default InventoryManagement;