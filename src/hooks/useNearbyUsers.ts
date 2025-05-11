import { useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useChannelStore } from '@/store/useChannelStore';
import { ChannelUser } from '@/user/ChannelUser';

export function useNearbyUsers(): ChannelUser[] {
  const user = useAuthStore((state) => state.user);
  const userZones = useChannelStore((state) => state.userZones);
  const nearbyUsersMap = useChannelStore((state) => state.nearbyUsers); // Map or Set depending on your structure
  const users = useChannelStore((state) => state.users); // Adjust selector as needed
   return useMemo(() => {
    // Early return if no user
    if (!user?.id) return [];

    const userId = user.id;
    const currentUserZoneId = userZones.get(userId) ?? -1;
    const isInZone = currentUserZoneId !== -1;
    const result: ChannelUser[] = [];

    // Helper function to safely add users
    const addUserIfExists = (userId: string) => {
      const user = users.get(userId);
      if (user) result.push(user);
    };

    if (isInZone) {
      // Find all users in the same zone
      for (const [id, zoneId] of Array.from(userZones.entries())) {
        if (zoneId === currentUserZoneId && id !== userId) { // Exclude self
          addUserIfExists(id);
        }
      }
    } else {
      // Add nearby users
      nearbyUsersMap.forEach((id) => {
        if (id !== userId) { // Exclude self
          addUserIfExists(id);
        }
      });
    }

    return result;
  }, [user?.id, userZones, nearbyUsersMap, users]);
}
