if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
  console.warn("VITE_API_URL is not set! If your backend is hosted separately (e.g., EC2) and your frontend is on Amplify, API requests will fail. Please set VITE_API_URL in your Amplify environment variables.");
}

export const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3001');
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
