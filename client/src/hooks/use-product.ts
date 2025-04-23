import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  createProduct, 
  getProducts, 
  getProductById, 
  CreateProductRequest, 
  ProductResponse,
  PaginatedProductResponse
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

  return {
    products: data?.products || [],
    pagination: data ? {
      total: data.total,
      page: data.page,
      pageSize: data.pageSize,
      totalPages: data.totalPages
    } : null,
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