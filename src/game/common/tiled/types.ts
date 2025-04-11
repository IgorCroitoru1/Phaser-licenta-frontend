import {  DOOR_TYPE} from './common';

export type TiledObject = {
  x: number;
  y: number;
  width: number;
  height: number;
  gid?: number;
};

export type TiledObjectProperty = {
  name: string;
  type: string;
  value: string | number | boolean;
};

export type TiledObjectWithProperties = {
  properties: TiledObjectProperty[];
} & TiledObject;

export type TiledZoneObject = {
  id: number;
} & TiledObject;

export type TiledDoorObject = {
  id: number;
  isOpen: boolean;
  zoneId: number;
} & TiledObject;

export type DoorType = keyof typeof DOOR_TYPE;


export type TiledPotObject = TiledObject;






