"use client";

import { useState, useCallback } from "react";
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

type ApiResponseState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
};

export type ApiError = Error & {
  status?: number;
  response?: AxiosError["response"];
};

export function useApi<T = any>() {
  const [apiState, setApiState] = useState<ApiResponseState<T>>({
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
        const isFormData = body instanceof FormData;
        const res: AxiosResponse<T> = await axios({
          url,
          method,
          data: body,
          withCredentials: true,
          headers: {
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
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

        const apiError = new Error(errorMessage) as ApiError;
        apiError.status = axiosError.response?.status;
        apiError.response = axiosError.response;
        throw apiError;
      }
    },
    []
  );

  return { ...apiState, sendRequest };
}
