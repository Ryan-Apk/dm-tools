import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";

// Factory function so we can pass the openExpiryModal trigger from React
export const createQueryClient = (openExpiryModal) => {
  return new QueryClient({
    defaultOptions: {
      queries: {
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
