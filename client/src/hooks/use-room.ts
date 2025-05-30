import { getRooms } from '@/services/room-services';
import { Room, RoomResponse } from '@/types';
import { useQuery } from '@tanstack/react-query';

export const useRoomData = (enabled = true) => {
    return useQuery<RoomResponse, Error, Room[]>({
      queryKey: ['rooms'],
      queryFn: getRooms,
      enabled,
      select: (data) => {
        // Handle both array and object responses
        if (Array.isArray(data)) {
          return data;
        }
        // Handle response with data property
        if (data && data.data) {
          return data.data;
        }
        // Return empty array as fallback
        return [];
      },
      retry: 3,
      staleTime: 30000, // Consider data fresh for 30 seconds
    });
};