import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "../utils/env";
import { tokenStore } from "./tokenStore";

export const axiosClient = axios.create({
  baseURL: env.API_URL,
  withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        `${env.API_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      )
      .then((res) => res.data.data.accessToken as string)
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;

    if (error.response?.status === 401 && original && !original._retried && !original.url?.includes("/auth/")) {
      original._retried = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        tokenStore.set(newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(original);
      }
      tokenStore.set(null);
    }

    return Promise.reject(error);
  }
);

export const getErrorMessage = (err: unknown, fallback = "Something went wrong"): string => {
  if (axios.isAxiosError(err)) {
    return (err.response?.data as { message?: string } | undefined)?.message ?? fallback;
  }
  return fallback;
};
