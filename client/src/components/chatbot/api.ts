import axios from 'axios';

// Define the response shape
interface ChartData {
  labels: string[];
  datasets: {
    label?: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface ChatResponse {
  message: string;
  data?: any;
  chartData?: ChartData;
  chartType?: string;
  chartTitle?: string;
}


export const sendChatMessage = async (message: string, botType: string = 'HealthTrendBot') => {
  try {
    const response = await fetch(`/api/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, botType }),
    });

    if (!response.ok) {
      let errorText = 'Failed to get response';
      
      try {
        const errorData = await response.json();
        errorText = errorData.error || errorText;
        if (errorData.details) {
          errorText += `: ${errorData.details}`;
        }
      } catch (e) {
        errorText = `Server error (${response.status})`;
      }
      
      throw new Error(errorText);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

/**
 * Checks if the API is available
 * @returns {Promise<boolean>} Promise that resolves with true if API is available
 */
export const checkAPIHealth = async () => {
  try {
    const response = await fetch(`/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};
