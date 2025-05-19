// import * as Phaser from 'phaser';
import {
  TiledDoorObject,
  TiledObject,
  TiledObjectProperty,
  TiledObjectWithProperties,
  TiledPotObject,
  TiledZoneObject,
} from './types';
import {
  OBJECT_TYPES,
  TILED_DOOR_OBJECT_PROPERTY,
  TILED_OBJECT_PROPERTY,
  TILED_ZONE_OBJECT_PROPERTY,
} from './common';
import { Types } from 'phaser';


export function getTilesetForTileObjects(map: Phaser.Tilemaps.Tilemap, layerName: string): { object: Partial<TiledObject>; tileset: Phaser.Tilemaps.Tileset }[] {
  const results: { object: Partial<TiledObject>; tileset: Phaser.Tilemaps.Tileset }[] = [];

  const objects = map.getObjectLayer(layerName)?.objects ?? [];
  for (const obj of objects) {
    if (obj.gid != null) {
      const tileset = map.tilesets.find(
        (ts) => obj.gid! >= ts.firstgid && obj.gid! < ts.firstgid + ts.total
      );

      if (tileset) {
        results.push({ object: obj, tileset });
      }
    }
  }

  return results;
}


/**
 * Validates that the provided property is of the type TiledObjectProperty.
 */

export function isTiledObjectProperty(property: unknown): property is TiledObjectProperty {
  if (typeof property !== 'object' || property === null || property === undefined) {
    return false;
  }
  return (
    typeof property === 'object' &&
    property !== null &&
    'name' in property &&
    'type' in property &&
    'value' in property
  );
}
/**
 * Returns an array of validated TiledObjectProperty objects from the provided Phaser Tiled Object properties.
 */
export function getTiledProperties(properties: unknown): TiledObjectProperty[] {
  const validProperties: TiledObjectProperty[] = [];
  if (typeof properties !== 'object' || properties === null || properties === undefined || !Array.isArray(properties)) {
    return validProperties;
  }
  properties.forEach((property) => {
    if (!isTiledObjectProperty(property)) {
      return;
    }
    validProperties.push(property);
  });
  return validProperties;
}

/**
 * Returns the value of the given Tiled property name on an object. In Tiled the object properties are
 * stored on an array, and we need to loop through the Array to find the property we are looking for.
 */
export function getTiledPropertyByName<T>(properties: TiledObjectProperty[], propertyName: string): T | undefined {
  const tiledProperty = properties.find((prop) => {
    return prop.name === propertyName;
  });
  if (tiledProperty === undefined) {
    return undefined;
  }
  return tiledProperty.value as T;
}

export function getObjectsByProprietyType(map: Phaser.Tilemaps.Tilemap, type: string): TiledObjectWithProperties[] {
  const result: TiledObjectWithProperties[] = [];
  map.objects.forEach((layer, index) => {
    layer.objects.forEach((tiledObject) => {
      if (tiledObject.type === type) {
         if (
          tiledObject.x !== undefined &&
          tiledObject.y !== undefined &&
          tiledObject.width !== undefined &&
          tiledObject.height !== undefined &&
          tiledObject.id !== undefined
        ) {
          //ajustam daca e un tiledObject cu gid
          //const adjustedY = tiledObject.gid !== undefined ? tiledObject.y - tiledObject.height : tiledObject.y;
          result.push({
            id: tiledObject.id,
            x: tiledObject.x,
            y: tiledObject.y,
            width: tiledObject.width,
            height: tiledObject.height,
            gid: tiledObject.gid,
            properties: getTiledProperties(tiledObject.properties),
          });
        }
      }
    })
  });

  return result;
}

    
export function isValidObject(
  obj: Phaser.Types.Tilemaps.TiledObject
): obj is Phaser.Types.Tilemaps.TiledObject & Required<Pick<Phaser.Types.Tilemaps.TiledObject, 'x' | 'y' | 'width' | 'height' | 'id'>> {
  return (
    obj.x !== undefined &&
    obj.y !== undefined &&
    obj.width !== undefined &&
    obj.height !== undefined &&
    obj.id !== undefined
  );
}

/**
 * Finds all of the Tiled Objects for a given layer of a Tilemap, and filters to only objects that include
 * the basic properties for an objects position, width, and height.
 */
export function getTiledObjectsFromLayer(map: Phaser.Tilemaps.Tilemap, layerName: string): TiledObjectWithProperties[] {
  const result: TiledObjectWithProperties[] = [];
  // Go through all object layers manually
  map.objects.forEach((layer, index) => {
    if (layer.name === layerName) {
      layer.objects.forEach((tiledObject) => {
        if (
          tiledObject.x !== undefined &&
          tiledObject.y !== undefined &&
          tiledObject.width !== undefined &&
          tiledObject.height !== undefined &&
          tiledObject.id !== undefined 
        ) {
          //ajustam daca e un tiledObject cu gid
          //const adjustedY = tiledObject.gid !== undefined ? tiledObject.y - tiledObject.height : tiledObject.y;
          result.push({
            id: tiledObject.id,
            x: tiledObject.x,
            y: tiledObject.y,
            width: tiledObject.width,
            height: tiledObject.height,
            gid: tiledObject.gid,
            properties: getTiledProperties(tiledObject.properties),
          });
        }
      });
    }
  });

  return result;
}

export function toTiledZoneObject(tiledObject: Phaser.Types.Tilemaps.TiledObject): TiledZoneObject | undefined {
  if (
          tiledObject.x !== undefined &&
          tiledObject.y !== undefined &&
          tiledObject.width !== undefined &&
          tiledObject.height !== undefined &&
          tiledObject.id !== undefined 
        )
  return {
    x: tiledObject.x,
    y: tiledObject.y,
    width: tiledObject.width,
    height: tiledObject.height,
    zoneId: getTiledPropertyByName<number>(tiledObject.properties, TILED_ZONE_OBJECT_PROPERTY.ID) ?? -1,
    id: tiledObject.id
  };
}
/**
 * Finds all of the valid 'Zone' Tiled Objects on a given layer of a Tilemap.
 */
export function getTiledZoneObjectsFromLayer(map: Phaser.Tilemaps.Tilemap, layerName: string): TiledZoneObject[] {
  const roomObjects: TiledZoneObject[] = [];

  // loop through each object and validate object has properties for the object we are planning to build
  const tiledObjects = getTiledObjectsFromLayer(map, layerName);
  tiledObjects.forEach((tiledObject) => {
    const id = getTiledPropertyByName<number>(tiledObject.properties, TILED_ZONE_OBJECT_PROPERTY.ID);
    if (id === undefined) {
      return;
    }

    roomObjects.push({
      x: tiledObject.x,
      y: tiledObject.y,
      width: tiledObject.width,
      height: tiledObject.height,
      zoneId: id,
      id: tiledObject.id
    });
  });

  return roomObjects;
}

/**
 * Parses the provided Phaser Tilemap and returns all Object layer names with the provided prefix.
 * This function expects the layer names to be in a format like: rooms/1/enemies.
 */
export function getAllLayerNamesWithPrefix(map: Phaser.Tilemaps.Tilemap, prefix: string): string[] {
  return map
    .getObjectLayerNames()
    .filter((layerName) => layerName.startsWith(`${prefix}/`))
    .filter((layerName) => {
      const layerData = layerName.split('/');
      if (layerData.length !== 3) {
        return false;
      }
      return true;
    });
}




export function getTextureFromGid(map: Phaser.Tilemaps.Tilemap ,gid?: number): string {
  if (!gid) return ''; // fallback

  for (const tileset of map.tilesets) {
    if (gid >= tileset.firstgid && gid < tileset.firstgid + tileset.total) {
      return tileset.name;
    }
  }

  console.warn("No tileset found for gid:", gid);
  return '';
}


export function getTilesetsUsedInTiledObjects(map: Phaser.Tilemaps.Tilemap): Set<Phaser.Tilemaps.Tileset> {
  const usedTilesets = new Set<Phaser.Tilemaps.Tileset>();
  map.objects.forEach((objectLayer) => {
    objectLayer.objects.forEach((obj) => {
      if (typeof obj.gid === 'number') {
        const tileset = map.tilesets.find(ts =>
          obj.gid! >= ts.firstgid && obj.gid! < ts.firstgid + ts.total
        );

        if (tileset) {
          usedTilesets.add(tileset);
        }
      }
    });
  });

  return usedTilesets;
}
export function getDoorObjectsFromMap(map: Phaser.Tilemaps.Tilemap): TiledDoorObject[] {
  const doorObjects: TiledDoorObject[] = [];

  // loop through each object and validate object has properties for the object we are planning to build
  const tiledObjects = getObjectsByProprietyType(map, OBJECT_TYPES.DOOR);
  tiledObjects.forEach((tiledObject) => {
    const isOpen = getTiledPropertyByName<boolean>(
      tiledObject.properties,
      TILED_DOOR_OBJECT_PROPERTY.IS_OPEN
    );
    const zoneId = getTiledPropertyByName<number>(
      tiledObject.properties,
      TILED_DOOR_OBJECT_PROPERTY.ZONE_ID
    );
    const id = getTiledPropertyByName<number>(
      tiledObject.properties,
      TILED_DOOR_OBJECT_PROPERTY.ID
    )!;
    const zindex = getTiledPropertyByName<number>(
      tiledObject.properties,
      TILED_OBJECT_PROPERTY.ZINDEX
    )
    if (isOpen === undefined || zoneId === undefined) {
      return; // Skip invalid objects
    }

    doorObjects.push({
      x: tiledObject.x!,
      y: tiledObject.y!,
      width: tiledObject.width!,
      height: tiledObject.height!,
      gid: tiledObject.gid,
      isOpen,
      zoneId,
      id,
      zindex: zindex,
    });
  });
  return doorObjects;
}
/**
 * Finds all of the valid 'Door' Tiled Objects on a given layer of a Tilemap.
 */
export function getTiledDoorObjectsFromLayer(
  map: Phaser.Tilemaps.Tilemap,
  layerName: string
): TiledDoorObject[] {
  const doorObjects: TiledDoorObject[] = [];

  const tiledObjects = getTiledObjectsFromLayer(map, layerName);
  tiledObjects.forEach((tiledObject) => {
    const isOpen = getTiledPropertyByName<boolean>(
      tiledObject.properties,
      TILED_DOOR_OBJECT_PROPERTY.IS_OPEN
    );
    const zoneId = getTiledPropertyByName<number>(
      tiledObject.properties,
      TILED_DOOR_OBJECT_PROPERTY.ZONE_ID
    );
    const id = getTiledPropertyByName<number>(
      tiledObject.properties,
      TILED_DOOR_OBJECT_PROPERTY.ID
    )!;
    if (isOpen === undefined || zoneId === undefined) {
      return; // Skip invalid objects
    }

    doorObjects.push({
      x: tiledObject.x!,
      y: tiledObject.y!,
      width: tiledObject.width!,
      height: tiledObject.height!,
      gid: tiledObject.gid,
      isOpen,
      zoneId,
      id
    });
  });
  return doorObjects;
}
export function getTilesetsUsedInLayer(map: Phaser.Tilemaps.Tilemap, layerName: string): Set<Phaser.Tilemaps.Tileset> {
  const tilesetSet = new Set<Phaser.Tilemaps.Tileset>();
  const layer = map.getLayer(layerName);
  if (!layer) return tilesetSet;
  const data = layer.data;

  data.forEach(row => {
    row.forEach(tile => {
      if (tile && tile.index !== -1) {
        const tileset = map.tilesets.find(ts => tile.index >= ts.firstgid && tile.index < ts.firstgid + ts.total);
        if (tileset) tilesetSet.add(tileset);
      }
    });
  });

  return tilesetSet;
}
