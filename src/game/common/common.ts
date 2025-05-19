import { Door } from "../game-objects/objects/door";
import { Position } from "./types";

export const DIRECTION = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
} as const;

export const CHEST_STATE = {
  HIDDEN: 'HIDDEN',
  REVEALED: 'REVEALED',
  OPEN: 'OPEN',
} as const;

export const INTERACTIVE_OBJECT_TYPE = {
  AUTO: 'AUTO',
  PICKUP: 'PICKUP',
  OPEN: 'OPEN',
} as const;

export const LEVEL_NAME = {
  WORLD: 'WORLD',
  DUNGEON_1: 'DUNGEON_1',
} as const;

export enum GameEvents  {
  PLAYER_MOVE = "move",
  PLAYER_JOINED = "player_joined",
  PLAYERS_POSITION_UPDATE = "players_position_update",
  INIT_USERS = "init_users",
  // LOCAL_PLAYER_MOVED = "local_player_moved",
  PLAYER_LEFT = "player_left",
  CURRENT_ZONE = "current_zone",
  CAMERA_CHANGE = "camera_change",
  //ZONE_CHANGED = "zone_changed",
  //DOOR_OPENED = "door_open",
  ZOOM_CHANGE = "zoom_change", // Event name for zoom changes
  DOOR_TRIGGER = "door_trigger", // Event name for door click events
  MESSAGE = "message",
  DOOR_RING = "door_ring",
}