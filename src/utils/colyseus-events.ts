import { GameEvents } from "@/game/common/common";
import { Position } from "@/game/common/types";

export interface ColyseusEventPayloads {
  [GameEvents.PLAYER_MOVE]: Position;
  [GameEvents.DOOR_TRIGGER]: { doorId: number };
  [GameEvents.PLAYER_JOINED]: { playerId: string };
  [GameEvents.CURRENT_ZONE]: { zoneId: number };
}

