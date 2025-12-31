import useSWR, { SWRConfiguration } from 'swr';

export function useApi<T>(url: string | null, config?: SWRConfiguration) {
  const { data, error, isLoading, mutate, isValidating } = useSWR<T>(url, config);

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}

