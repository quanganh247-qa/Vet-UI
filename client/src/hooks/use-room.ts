import { getRooms } from '@/services/room-services';
import { Room, RoomResponse } from '@/types';
import { useQuery } from '@tanstack/react-query';


export const useRoomData = (enabled = true) => {
    return useQuery<RoomResponse, Error, Room[]>({
      queryKey: ['rooms'],
      queryFn: getRooms,
      enabled,
      select: (data) => data.data || [],
    });
  };