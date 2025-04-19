
// Helper function to handle API errors
export const handleApiError = (error: any) => {
    // Check if the error object has a response property and data within it
    if (error.response && error.response.data) {
        // Throw the specific error data from the server response
        throw error.response.data;
    } else {
        // Fallback for network errors or other issues where response might not exist
        // Re-throw the original error object or its message
        throw error;
    }
};

