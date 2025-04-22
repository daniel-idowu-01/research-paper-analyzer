"use client";

import { useState, useCallback } from "react";
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export function useApi<T = any>() {
  const [apiState, setApiState] = useState<ApiResponse<T>>({
    data: null,
    error: null,
    loading: false,
  });

  const sendRequest = useCallback(
    async (
      url: string,
      method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
      body?: any,
      config?: AxiosRequestConfig
    ): Promise<T> => {
      setApiState({ data: null, error: null, loading: true });

      try {
        const res: AxiosResponse<T> = await axios({
          url,
          method,
          data: body,
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            ...(config?.headers || {}),
          },
          ...config,
        });

        setApiState({ data: res.data, error: null, loading: false });
        return res.data;
      } catch (error: any) {
        const axiosError = error as AxiosError<{
          message?: string;
          error?: string;
        }>;
        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          axiosError.message;

        setApiState({
          data: null,
          error: errorMessage,
          loading: false,
        });

        throw {
          response: axiosError.response,
          message: errorMessage,
        };
      }
    },
    []
  );

  return { ...apiState, sendRequest };
}
