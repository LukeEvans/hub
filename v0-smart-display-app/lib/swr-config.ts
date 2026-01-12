import { SWRConfiguration } from 'swr';

export const swrConfig: SWRConfiguration = {
  fetcher: (resource, init) => fetch(resource, init).then(res => res.json()),
  revalidateOnFocus: true,
  revalidateIfStale: true,
  dedupingInterval: 2000, // 2 seconds
  refreshInterval: 60000, // 1 minute
};

