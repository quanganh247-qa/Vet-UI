import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  createProduct, 
  getProducts, 
  getProductById, 
  CreateProductRequest, 
  ProductResponse,
  PaginatedProductResponse,
  importProductStock,
  exportProductStock,
  ImportStockRequest,
  ExportStockRequest,
  getProductStockMovements,
  PaginatedProductMovementResponse,
  ProductStockMovementResponse
} from '../services/product-services';

export const useProducts = (page: number = 1, pageSize: number = 10) => {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery<PaginatedProductResponse>({
    queryKey: ['products', page, pageSize],
    queryFn: () => getProducts(page, pageSize),
  });

  console.log("Products data from API:", data);
  
  // Đảm bảo rằng pagination object luôn được trả về đúng, ngay cả khi dữ liệu null
  const pagination = {
    total: data?.total || 0,
    page: data?.page || page,
    pageSize: data?.pageSize || pageSize,
    totalPages: data?.totalPages || 1
  };
  
  console.log("Pagination info:", pagination);

  return {
    products: data?.products || [],
    pagination,
    isLoading,
    error,
    refetch
  };
};

export const useProductDetails = (productId: number | null) => {
  const {
    data: product,
    isLoading,
    error
  } = useQuery<ProductResponse>({
    queryKey: ['product', productId],
    queryFn: () => getProductById(productId as number),
    enabled: !!productId, // Only run the query if productId is provided
  });

  return {
    product,
    isLoading,
    error
  };
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  
  const mutation = useMutation({
    mutationFn: ({ productData, imageFile }: { 
      productData: CreateProductRequest,
      imageFile?: File 
    }) => {
      setIsUploading(true);
      return createProduct(productData, imageFile);
    },
    onSuccess: () => {
      // Invalidate products queries to refetch the updated data
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsUploading(false);
    },
    onError: () => {
      setIsUploading(false);
    },
  });

  return {
    createProduct: mutation.mutate,
    isLoading: mutation.isPending || isUploading,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error
  };
};

export const useProductStockMovements = (productId: number | null, page: number = 1, pageSize: number = 10) => {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery<PaginatedProductMovementResponse>({
    queryKey: ['product-stock-movements', productId, page, pageSize],
    queryFn: () => getProductStockMovements(productId as number, page, pageSize),
    enabled: !!productId, // Only run the query if productId is provided
  });

  const pagination = {
    total: data?.total || 0,
    page: data?.page || page,
    pageSize: data?.pageSize || pageSize,
    totalPages: data?.totalPages || 1
  };

  return {
    movements: data?.movements || [],
    pagination,
    isLoading,
    error,
    refetch
  };
};

export const useImportProductStock = (productId: number | null) => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: (importData: ImportStockRequest) => {
      if (!productId) throw new Error('Product ID is required');
      return importProductStock(productId, importData);
    },
    onSuccess: () => {
      // Invalidate product queries to refetch the updated data
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      // Also invalidate stock movements
      queryClient.invalidateQueries({ queryKey: ['product-stock-movements', productId] });
      // Invalidate products list as the stock might have changed
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  return {
    importStock: mutation.mutate,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset
  };
};

export const useExportProductStock = (productId: number | null) => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: (exportData: ExportStockRequest) => {
      if (!productId) throw new Error('Product ID is required');
      return exportProductStock(productId, exportData);
    },
    onSuccess: () => {
      // Invalidate product queries to refetch the updated data
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      // Also invalidate stock movements
      queryClient.invalidateQueries({ queryKey: ['product-stock-movements', productId] });
      // Invalidate products list as the stock might have changed
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  return {
    exportStock: mutation.mutate,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset
  };
};