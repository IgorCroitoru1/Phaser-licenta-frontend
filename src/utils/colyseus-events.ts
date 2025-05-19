import { ChannelUserDto } from "@/dtos/ChannelUserDto";
import { GameEvents } from "@/game/common/common";
import { Position } from "@/game/common/types";

export interface ColyseusEventPayloads {
  [GameEvents.PLAYER_MOVE]: Position;
  [GameEvents.DOOR_TRIGGER]: { zoneId: number };
  [GameEvents.PLAYER_JOINED]:  ChannelUserDto ;
  [GameEvents.CURRENT_ZONE]: { zoneId: number };
  [GameEvents.INIT_USERS]: ChannelUserDto[];
  [GameEvents.MESSAGE]: { message: string;};
  [GameEvents.DOOR_RING]: { zoneId: number; by: string; };
}

