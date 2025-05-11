import { Events, Game } from 'phaser';
import { GameEvents } from './common/common';
import { PlayerPositionUpdate, Position } from './common/types';
import { Door } from './game-objects/objects/door';

// Used to emit events between React components and Phaser scenes
// https://newdocs.phaser.io/docs/3.70.0/Phaser.Events.EventEmitter
export const EventBus = new Events.EventEmitter();

export interface GameEventPayloads {
    [GameEvents.PLAYER_MOVE]: Position; // Player position and velocity
    [GameEvents.DOOR_TRIGGER]: { zoneId: number };
    [GameEvents.PLAYER_JOINED]: { playerId: string };
    [GameEvents.CURRENT_ZONE]: { zoneId: number };
    [GameEvents.ZOOM_CHANGE]: number; // Zoom level
    [GameEvents.CAMERA_CHANGE]: { worldX: number; worldY: number; scrollX: number; scrollY:number; zoom: number }; // Camera position and zoom level
    [GameEvents.PLAYERS_POSITION_UPDATE]: PlayerPositionUpdate[]; // Array of player position updates
    // [GameEvents.LOCAL_PLAYER_MOVED]: { id: any, x: number; y: number; zoom: number }; // Local player position and zoom level
  }

  

export class GameEventEmitter {
constructor(private eventEmitter: Events.EventEmitter) {}

emit<K extends keyof GameEventPayloads>(event: K, payload: GameEventPayloads[K]): void {
        this.eventEmitter.emit(event, payload);
    }

on<K extends keyof GameEventPayloads>(event: K, listener: (payload: GameEventPayloads[K]) => void): void {
        this.eventEmitter.on(event, listener);
    }

off<K extends keyof GameEventPayloads>(event: K, listener: (payload: GameEventPayloads[K]) => void ): void {
        this.eventEmitter.off(event, listener);
    }
}