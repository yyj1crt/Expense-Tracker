import api from "./api";

export const checkApiHealth = async (): Promise<{ isHealthy: boolean; message: string; timestamp: string }> => {
  try {
    const response = await api.get("/", {
      timeout: 5000,
    });
    return {
      isHealthy: true,
      message: "Backend server is running ✓",
      timestamp: response.data.timestamp || new Date().toISOString(),
    };
  } catch (error: any) {
    const apiUrl = api.defaults.baseURL;
    console.error("Backend Health Check Failed:", {
      url: apiUrl,
      error: error.message,
    });

    if (!error.response) {
      return {
        isHealthy: false,
        message: `Cannot connect to backend at ${apiUrl}. Make sure:\n1. Backend server is running (npm run dev in server folder)\n2. Port 4000 is not blocked`,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      isHealthy: false,
      message: `Backend error: ${error.response?.statusText || error.message}`,
      timestamp: new Date().toISOString(),
    };
  }
};
