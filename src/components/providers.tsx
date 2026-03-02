'use client';

import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query';
import { store } from '@/lib/store';
import { setApiUnauthorizedHandler } from '@/lib/api-client';
import { logout } from '@/lib/store/slices/authSlice';
import { error as alertError } from '@/lib/store/slices/alertSlice';
import { getErrorMessage } from '@/lib/utils/errors';
import { ThemeProvider } from '@/components/ThemeProvider';

const mutationCache = new MutationCache({
  onError: (err) => {
    const msg = getErrorMessage(err);
    store.dispatch(alertError(msg));
  },
});

const queryClient = new QueryClient({
  mutationCache,
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </Provider>
    </ThemeProvider>
  );
}

export function setupApiInterceptors() {
  setApiUnauthorizedHandler(() => {
    store.dispatch(logout());
    window.location.href = '/auth/signin';
  });
}
