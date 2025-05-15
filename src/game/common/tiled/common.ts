export const TILED_ZONE_OBJECT_PROPERTY = {
  ID: 'id',
} as const;


//nu sunt complete
export const TILED_LAYER_NAMES = {
  DOOR: 'door',
  COLLIDES: 'collides',
  BACKGROUND: 'background',
  FOREGROUND: 'foreground',
  ZONES: 'zones',
} as const;

export const OBJECT_TYPES = {
  DOOR: 'door',
  ZONE: "zone"
}
export const TILED_TILESET_NAMES = {
  GLASS_WOODEN_WALL: 'glass-wooden-wall',
  COLLISION: 'collision',
  WALL: 'wall',
  WOOD_DOOR_RIGHT: 'wood-door-right',
  WOOD_DOOR_LEFT: 'wood-door-left',
  WOOD_FLOOR: 'wood-floor',
  FLOWERS: 'flowers',
  GRASS: 'grass',
  WINDOW: 'window',
  GREEN_CARPET: 'green-carpet',
  WALL_SIDE_PART: 'wall-side-part',
  TOP_DOOR_WALL: 'top-door-wall',
  DOOR_VERTICAL_OBJECT: 'door-vertical-object',
  WOOD_DOOR_RIGHT_OBJECT: 'wood-door-right-object',
} as const;

export const DOOR_TYPE = {
  OPEN: 'OPEN',
  LOCK: 'LOCK',
} as const;

export const TILED_OBJECT_PROPERTY = {
  ZINDEX: "zindex"
} as const;

export const TILED_DOOR_OBJECT_PROPERTY =  {
  ID: 'id',
  IS_OPEN: 'isOpen',
  ZONE_ID: 'zoneId',
} as const;



