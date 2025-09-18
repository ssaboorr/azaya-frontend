import axios, { AxiosRequestConfig } from 'axios';

const LOCALHOST_URL = process.env.NEXT_PUBLIC_LOCALHOST_URL!;
const DEV_URL = process.env.NEXT_PUBLIC_DEV_URL!;

// Create the instance without a baseURL
const axiosInstance = axios.create();

axiosInstance.interceptors.request.use((config) => {
    // Use the local Next.js server which will proxy to the backend
    config.baseURL = '';
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong!')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];
    const res = await axiosInstance.get(url, { ...config });
    return res.data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
};



export const endpoints = {
  auth: {
    signIn: '/api/users/login',
    signUp: '/api/users',
  },
};
