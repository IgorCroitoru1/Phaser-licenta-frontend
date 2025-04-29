import * as Phaser from 'phaser';
import { CHEST_STATE, DIRECTION, INTERACTIVE_OBJECT_TYPE, LEVEL_NAME } from './common';

export type Position = {
  x: number;
  y: number;
};

export type Direction = keyof typeof DIRECTION;

export type GameObject = Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;

export type InteractiveObjectType = keyof typeof INTERACTIVE_OBJECT_TYPE;

export interface CustomGameObject {
  enableObject(): void;
  disableObject(): void;
}

export type PlayerPositionUpdate = {
  id: string;
} & Position;