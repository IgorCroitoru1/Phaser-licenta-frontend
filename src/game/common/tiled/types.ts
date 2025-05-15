import {  DOOR_TYPE} from './common';

export type TiledObject = {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  gid?: number;
  zindex?: number;
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
  // id: number;
  zoneId: number;
} & TiledObject;

export type TiledDoorObject = {
  // id: number;
  
  isOpen: boolean;
  zoneId: number;
} & TiledObject;

export type DoorType = keyof typeof DOOR_TYPE;


export type TiledPotObject = TiledObject;






