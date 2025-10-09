import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';

export function useUserProfile() {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: () => userService.getProfile(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUserSubscription() {
  return useQuery({
    queryKey: ['user-subscription'],
    queryFn: () => userService.getSubscription(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUserDevices() {
  return useQuery({
    queryKey: ['user-devices'],
    queryFn: () => userService.getDevices(),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { firstName?: string; lastName?: string }) =>
      userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
}

