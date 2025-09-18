import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './App.css';
import AuthApp from './Components/AuthApp/AuthApp';
import { initializeAuth } from './lib/services';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        // Don't retry on 4xx errors except 408 (timeout)
        const err = error as { statusCode?: number };
        if (
          err?.statusCode &&
          err.statusCode >= 400 &&
          err.statusCode < 500 &&
          err.statusCode !== 408
        ) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: (failureCount, error: unknown) => {
        // Don't retry mutations on client errors
        const err = error as { statusCode?: number };
        if (err?.statusCode && err.statusCode >= 400 && err.statusCode < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

// Initialize auth with callbacks
initializeAuth(
  () => {
    console.log('Token refreshed successfully');
  },
  () => {
    console.log('Token refresh failed - user needs to login again');
    queryClient.clear();
  },
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <AuthApp />
      </div>
      {/* Only show devtools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

export default App;
