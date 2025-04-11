import { Events } from 'phaser';
import { GameEvents } from './common/common';
import { Position } from './common/types';
import { Door } from './game-objects/objects/door';

// Used to emit events between React components and Phaser scenes
// https://newdocs.phaser.io/docs/3.70.0/Phaser.Events.EventEmitter
export const EventBus = new Events.EventEmitter();

export interface GameEventPayloads {
    [GameEvents.PLAYER_MOVE]: Position;
    [GameEvents.DOOR_TRIGGER]: { door:Door, doorId: number };
    [GameEvents.PLAYER_JOINED]: { playerId: string };
    [GameEvents.CURRENT_ZONE]: { zoneId: number };
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