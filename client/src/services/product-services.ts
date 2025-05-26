import api from "@/lib/api";

export interface CreateProductRequest {
    name: string;              // Product name (required)
    description?: string;      // Product description (optional)
    price: number;             // Product price (required)
    stock_quantity?: number;    // Stock quantity (optional, default 0)
    category?: string;         // Product category (optional)
    dataImage?: Uint8Array;    // Binary image data (optional)
    originalImage?: string;    // Image file name or URL (optional)
    isAvailable?: boolean;     // Availability status (optional, default true)
}

export interface ProductResponse {
    productId: number;
    name: string;
    description?: string; // Add optional description
    price: number;
    stock_quantity: number;
    category: string;
    dataImage?: Uint8Array; // Make optional if not always present
    originalImage?: string; // Make optional if not always present
    isAvailable?: boolean; // Add optional availability
}

export interface PaginatedProductResponse {
    products: ProductResponse[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}



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
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json'
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
                pageSize
            }
        });
        // Transform snake_case to camelCase
        const transformProduct = (product: any) => ({
            productId: product.product_id,
            name: product.name,
            description: product.description,
            price: product.price,
            stock_quantity: product.stock,
            category: product.category,
            dataImage: product.data_image,
            originalImage: product.original_image,
            isAvailable: product.is_available !== undefined ? product.is_available : true,
        });

        // Handle response.data.rows format (common pagination format)
        if (response.data && response.data.rows && Array.isArray(response.data.rows)) {
            const products = response.data.rows.map(transformProduct);
            const total = response.data.count || products.length;

            return {
                products: products,
                total: total,
                page: page,
                pageSize: pageSize,
                totalPages: Math.ceil(total / pageSize)
            };
        }

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
        if (response.data && response.data.data) {
            // Handle data.data as array
            if (Array.isArray(response.data.data)) {
                const products = response.data.data.map(transformProduct);
                return {
                    products: products,
                    total: response.data.total || products.length,
                    page: response.data.page || page,
                    pageSize: response.data.pageSize || pageSize,
                    totalPages: Math.ceil(products.length / pageSize)
                };
            }

            // Handle data.data.rows format
            if (response.data.data.rows && Array.isArray(response.data.data.rows)) {
                const products = response.data.data.rows.map(transformProduct);
                const total = response.data.data.count || products.length;

                return {
                    products: products,
                    total: total,
                    page: page,
                    pageSize: pageSize,
                    totalPages: Math.ceil(total / pageSize)
                };
            }
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

export type ImportStockRequest = {
    quantity: number,
    unit_price: number,
    reason: string,
}

export type ExportStockRequest = {
    quantity: number,
    unit_price: number,
    reason: string,
}

export type ProductStockMovementResponse = {
    id: number,
    product_name: string,
    product_id: number
    movement_type: string
    quantity: number,
    reason: string,
    movement_date: string,
    current_stock: number,
    price: number,
}


export const importProductStock = async (
    productId: number,
    importStockRequest: ImportStockRequest
): Promise<ProductStockMovementResponse> => {
    try {
        const response = await api.post(`/api/v1/products/${productId}/import`, importStockRequest);
        return response.data;
    } catch (error) {
        console.error(`Error importing stock for product ${productId}:`, error);
        throw error;
    }
}

export const exportProductStock = async (
    productId: number,
    exportStockRequest: ExportStockRequest
): Promise<ProductStockMovementResponse> => {
    try {
        const response = await api.post(`/api/v1/products/${productId}/export`, exportStockRequest);
        return response.data;
    } catch (error) {
        console.error(`Error importing stock for product ${productId}:`, error);
        throw error;
    }
}

export type PaginatedProductMovementResponse = {
    movements: ProductStockMovementResponse[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}


export const getProductStockMovements = async (
    productId: number,
    page: number ,
    pageSize: number,
): Promise<PaginatedProductMovementResponse> => {   
    try {
        const response = await api.get(`/api/v1/products/${productId}/movements`, {
            params: {
                page,
                pageSize
            }
        });
        // Transform snake_case to camelCase
        const transformMovement = (movement: any): ProductStockMovementResponse => ({
            id: movement.id,
            product_id: movement.product_id,
            product_name: movement.product_name,
            movement_type: movement.movement_type,
            quantity: movement.quantity,
            reason: movement.reason,
            movement_date: movement.movement_date,
            current_stock: movement.current_stock,
            price: movement.price,
        });
        // Handle response.data.rows format (common pagination format)
        if (response.data && response.data.rows && Array.isArray(response.data.rows)) {
            const movements = response.data.rows.map(transformMovement);
            const total = response.data.count || movements.length;

            return {
                movements: movements,
                total: total,
                page: page,
                pageSize: pageSize,
                totalPages: Math.ceil(total / pageSize)
            };
        }
        // Check if response.data has the expected structure
        if (response.data && Array.isArray(response.data)) {
            const movements = response.data.map(transformMovement);
            return {
                movements: movements,
                total: movements.length,
                page: page,
                pageSize: pageSize,
                totalPages: Math.ceil(movements.length / pageSize)
            };
        }
        // Handle nested products array
        if (response.data && Array.isArray(response.data.movements)) {
            const movements = response.data.movements.map(transformMovement);
            return {
                movements: movements,
                total: response.data.total || movements.length,
                page: response.data.page || page,
                pageSize: response.data.pageSize || pageSize,
                totalPages: response.data.totalPages || Math.ceil(movements.length / pageSize)
            };
        }
        // If data is nested in data.data
        if (response.data && response.data.data) {
            // Handle data.data as array
            if (Array.isArray(response.data.data)) {
                const movements = response.data.data.map(transformMovement);
                return {
                    movements: movements,
                    total: response.data.total || movements.length,
                    page: response.data.page || page,
                    pageSize: response.data.pageSize || pageSize,
                    totalPages: Math.ceil(movements.length / pageSize)
                };
            }
            // Handle data.data.rows format
            if (response.data.data.rows && Array.isArray(response.data.data.rows)) {
                const movements = response.data.data.rows.map(transformMovement);
                const total = response.data.data.count || movements.length;

                return {
                    movements: movements,
                    total: total,
                    page: page,
                    pageSize: pageSize,
                    totalPages: Math.ceil(total / pageSize)
                };
            }
        }
        console.error('Unexpected API response format:', response.data);
        return {
            movements: [],
            total: 0,
            page: page,
            pageSize: pageSize,
            totalPages: 0
        };
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

// authRoute.GET("/movements", petApi.controller.GetAllProductStockMovements)

export const getAllProductStockMovements = async (): Promise<ProductStockMovementResponse[]> => {
    try {
        const response = await api.get('/api/v1/products/movements');
        console.log('All product stock movements API response:', response);
        
        // Handle the specific response structure we're getting
        if (response.data && response.data.code === 'S' && Array.isArray(response.data.data)) {
            console.log('Successfully extracted stock movements data:', response.data.data);
            return response.data.data;
        }
        
        // Fallback handling for other potential structures
        if (response.data && Array.isArray(response.data)) {
            return response.data;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
            return response.data.data;
        } else if (response.data && response.data.movements && Array.isArray(response.data.movements)) {
            return response.data.movements;
        } else if (response.data && Array.isArray(response.data.rows)) {
            return response.data.rows;
        } else {
            console.error('Unexpected API response format:', response.data);
            return [];
        }
    } catch (error) {
        console.error('Error fetching product stock movements:', error);
        throw error;
    }
}