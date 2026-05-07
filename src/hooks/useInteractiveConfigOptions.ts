import { useCallback, useEffect, useRef, useState } from "react";
import { getInteractiveConfigOptions } from "../api";
import {
  ApiConfig,
  RenderBuildRequest,
  RenderInteractiveConfigOptions,
} from "../types";
import { stableStringify } from "../utils/stableStringify";

export interface UseInteractiveConfigOptionsReturn {
  options: RenderInteractiveConfigOptions | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useInteractiveConfigOptions = (
  parts: RenderBuildRequest["parts"],
  apiConfig: ApiConfig
): UseInteractiveConfigOptionsReturn => {
  const [options, setOptions] = useState<RenderInteractiveConfigOptions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestKey = stableStringify({
    apiBaseUrl: apiConfig.apiBaseUrl,
    authMode: apiConfig.authMode,
    environment: apiConfig.environment,
    parts,
  });
  const lastRequestKey = useRef<string | null>(null);
  const requestId = useRef(0);

  const refetch = useCallback(async () => {
    const currentRequestId = requestId.current + 1;
    requestId.current = currentRequestId;
    setIsLoading(true);
    setError(null);

    try {
      const nextOptions = await getInteractiveConfigOptions(parts, apiConfig);
      if (currentRequestId !== requestId.current) {
        return;
      }

      setOptions(nextOptions);
      lastRequestKey.current = requestKey;
    } catch (requestError) {
      if (currentRequestId !== requestId.current) {
        return;
      }

      setError(requestError instanceof Error ? requestError.message : "Failed to load interactive options");
    } finally {
      if (currentRequestId === requestId.current) {
        setIsLoading(false);
      }
    }
  }, [apiConfig, parts, requestKey]);

  useEffect(() => {
    if (lastRequestKey.current === requestKey) {
      return;
    }

    void refetch();
  }, [refetch, requestKey]);

  return {
    options,
    isLoading,
    error,
    refetch,
  };
};
