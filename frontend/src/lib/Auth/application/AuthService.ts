import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  AuthRepository,
  LoginCredentials,
  RegisterData,
} from '../domain/AuthRepository';
import {
  ensureEmailIsValid,
  ensureNameIsValid,
  ensurePasswordIsValid,
} from '../domain/User';

// Query keys for TanStack Query
export const AUTH_QUERY_KEYS = {
  user: ['auth', 'user'] as const,
  refresh: ['auth', 'refresh'] as const,
} as const;

export const createAuthService = (repository: AuthRepository) => {
  return {
    // Login mutation
    useLogin: () => {
      const queryClient = useQueryClient();

      return useMutation({
        mutationFn: async (credentials: LoginCredentials) => {
          // Validate credentials before sending
          ensureEmailIsValid(credentials.email);
          ensurePasswordIsValid(credentials.password);

          return await repository.login(credentials);
        },
        onSuccess: (data) => {
          // Cache the user data after successful login
          queryClient.setQueryData(AUTH_QUERY_KEYS.user, data.user);
        },
        onError: (error) => {
          console.error('Login failed:', error);
          // Clear any cached user data on login failure
          queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.user });
        },
      });
    },

    // Register mutation
    useRegister: () => {
      const queryClient = useQueryClient();

      return useMutation({
        mutationFn: async (data: RegisterData) => {
          // Validate data before sending
          ensureNameIsValid(data.name);
          ensureEmailIsValid(data.email);
          ensurePasswordIsValid(data.password);

          return await repository.register(data);
        },
        onSuccess: (data) => {
          // Cache the user data after successful registration
          queryClient.setQueryData(AUTH_QUERY_KEYS.user, data.user);
        },
        onError: (error) => {
          console.error('Registration failed:', error);
          // Clear any cached user data on registration failure
          queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.user });
        },
      });
    },

    // Refresh token mutation
    useRefresh: () => {
      const queryClient = useQueryClient();

      return useMutation({
        mutationFn: async () => {
          return await repository.refresh();
        },
        onSuccess: () => {
          // Invalidate user queries to refetch with new token
          queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.user });
        },
        onError: (error) => {
          console.error('Token refresh failed:', error);
          // Clear user data if refresh fails
          queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.user });
        },
      });
    },

    // Logout mutation
    useLogout: () => {
      const queryClient = useQueryClient();

      return useMutation({
        mutationFn: async () => {
          return await repository.logout();
        },
        onSuccess: () => {
          console.log('Logout successful - setting user data to null');
          // Set user data to null to trigger immediate re-render
          queryClient.setQueryData(AUTH_QUERY_KEYS.user, null);
          // Clear refresh token data
          queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.refresh });
          console.log('User data set to null, should trigger re-render');
        },
        onError: (error) => {
          console.error('Logout failed:', error);
          console.log('Logout failed - setting user data to null anyway');
          // Even if logout fails on server, clear local data
          queryClient.setQueryData(AUTH_QUERY_KEYS.user, null);
          queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.refresh });
        },
      });
    },

    // Get current user query (for checking auth status)
    useCurrentUser: () => {
      return useQuery({
        queryKey: AUTH_QUERY_KEYS.user,
        queryFn: async () => {
          // ¡Ahora llama al repositorio para obtener el perfil!
          try {
            return await repository.getProfile();
          } catch (error) {
            // Si hay un error (ej. token inválido, 401), devuelve null
            // para que la UI sepa que no hay usuario autenticado.
            console.log('No authenticated user found:', error);
            return null;
          }
        },
        staleTime: 0, // Siempre considerar los datos como stale para permitir actualizaciones inmediatas
        gcTime: 1000 * 60 * 60, // 1 hora
        retry: false, // No reintentar si falla la primera vez (significa que no está logueado)
        refetchOnWindowFocus: true, // Refetch cuando la ventana recibe foco
        refetchOnMount: true, // Refetch cuando el componente se monta
        notifyOnChangeProps: 'all', // Notificar sobre todos los cambios de propiedades
      });
    },
  };
};
