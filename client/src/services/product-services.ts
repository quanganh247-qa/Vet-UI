export interface CreateProductRequest {
    name: string;              // Product name (required)
    description?: string;      // Product description (optional)
    price: number;             // Product price (required)
    stockQuantity?: number;    // Stock quantity (optional, default 0)
    category?: string;         // Product category (optional)
    dataImage?: Uint8Array;    // Binary image data (optional)
    originalImage?: string;    // Image file name or URL (optional)
    isAvailable?: boolean;     // Availability status (optional, default true)
}

export interface ProductResponse {
    productId: number;
    name: string;
    price: number;
    stock: number;
    category: string;
    dataImage: Uint8Array;
    originalImage: string;
}

export interface PaginatedProductResponse {
    products: ProductResponse[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

import api from "@/lib/api";

/**
 * Creates a new product with the provided information and optional image
 * @param productData - The product data including name, price, etc.
 * @param imageFile - Optional image file to upload
 * @returns Promise with the created product response
 */
export const createProduct = async (
    productData: CreateProductRequest, 
    imageFile?: File
): Promise<ProductResponse> => {
    try {
        const formData = new FormData();
        
        // Add the product data as a JSON string in the 'data' field
        formData.append('data', JSON.stringify(productData));
        
        // Add the image file if provided
        if (imageFile) {
            formData.append('image', imageFile);
        }
        
        const response = await api.post('/api/v1/products', formData, {
            headers: {
                // Don't set Content-Type - axios will set it automatically with boundary
                'Content-Type': undefined
            }
        });
        
        return response.data.data;
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
};

/**
 * Retrieves a paginated list of products
 * @param page - Page number to retrieve (default: 1)
 * @param pageSize - Number of products per page (default: 10)
 * @returns Promise with paginated product response
 */
export const getProducts = async (
    page: number = 1, 
    pageSize: number = 10
): Promise<PaginatedProductResponse> => {
    try {
        const response = await api.get('/api/v1/products', {
            params: {
                page,
                pageSize: pageSize
            }
        });
        
        // Transform snake_case to camelCase
        const transformProduct = (product: any): ProductResponse => ({
            productId: product.product_id,
            name: product.name,
            price: product.price,
            stock: product.stock,
            category: product.category,
            dataImage: product.data_image,
            originalImage: product.original_image,
        });
        
        // Check if response.data has the expected structure
        if (response.data && Array.isArray(response.data)) {
            const products = response.data.map(transformProduct);
            return {
                products: products,
                total: products.length,
                page: page,
                pageSize: pageSize,
                totalPages: Math.ceil(products.length / pageSize)
            };
        }
        
        // Handle nested products array
        if (response.data && Array.isArray(response.data.products)) {
            const products = response.data.products.map(transformProduct);
            return {
                products: products,
                total: response.data.total || products.length,
                page: response.data.page || page,
                pageSize: response.data.pageSize || pageSize,
                totalPages: response.data.totalPages || Math.ceil(products.length / pageSize)
            };
        }
        
        // If data is nested in data.data
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
            const products = response.data.data.map(transformProduct);
            return {
                products: products,
                total: response.data.total || products.length,
                page: response.data.page || page,
                pageSize: response.data.pageSize || pageSize,
                totalPages: response.data.totalPages || Math.ceil(products.length / pageSize)
            };
        }
        
        console.error('Unexpected API response format:', response.data);
        return {
            products: [],
            total: 0,
            page: page,
            pageSize: pageSize,
            totalPages: 0
        };
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

/**
 * Retrieves a product by its ID
 * @param productId - The unique identifier of the product
 * @returns Promise with the product response
 */
export const getProductById = async (productId: number): Promise<ProductResponse> => {
    try {
        const response = await api.get(`/api/v1/products/${productId}`);
        
        return response.data;
    } catch (error) {
        console.error(`Error fetching product ${productId}:`, error);
        throw error;
    }
};