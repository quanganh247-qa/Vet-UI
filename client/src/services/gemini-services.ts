import { ChatResponse, ErrorResponse } from "@/types";
import axios from "axios";

/**
 * Sends a chat message to the backend API
 * @param message - The message to send
 * @returns Promise that resolves with the response data
 */
export const sendChatMessage = async (message: string): Promise<ChatResponse> => {
    try {
      const response = await axios.post<ChatResponse>(`/chat`, {
        message,
      });
  
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Properly handle API errors
        const errorData = error.response.data as ErrorResponse;
        let errorText = errorData.error || 'Failed to get response';
        
        if (errorData.details) {
          errorText += `: ${errorData.details}`;
        }
        
        throw new Error(errorText);
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('An unknown error occurred');
      }
    }
  };
  
  /**
   * Checks if the API is available
   * @returns Promise that resolves with true if API is available
   */
  export const checkAPIHealth = async (): Promise<boolean> => {
    try {
      const response = await axios.get(`/health`);
      return response.status === 200;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }; 