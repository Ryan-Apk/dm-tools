import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { apiFetch } from "../utils/api.js";

// Factory function so we can pass the openExpiryModal trigger from React
export const createQueryClient = (openExpiryModal) => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Default fetcher: the query key doubles as the API path, so regular
        // (non-auth) reads only need useQuery({ queryKey: ['/database/...'] })
        queryFn: ({ queryKey }) => apiFetch(queryKey[0]),
        // Prevent TanStack Query from retrying a request that failed due to a dead token
        retry: (failureCount, error) => {
          if (error?.status === 401) return false;
          return failureCount < 3;
        },
      },
    },
    queryCache: new QueryCache({
      onError: (error) => {
        if (error?.status === 401) {
          openExpiryModal();
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        if (error?.status === 401) {
          openExpiryModal();
        }
      },
    }),
  });
};
