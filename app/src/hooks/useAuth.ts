import { useAuthStore } from '../state/authStore';
import { authService } from '../services/authService';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      // Call API to logout
      await authService.logout();
    } catch (error) {
      console.error('API logout failed:', error);
    } finally {
      // Always clear local state
      await logout();
    }
  };

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    login,
    logout: handleLogout,
  };
}

