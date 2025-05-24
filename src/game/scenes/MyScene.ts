import GameConfig from "../../../game-config";
import { ASSET_KEYS, ASSET_PACK_KEYS } from "../common/assets";
import {
    OBJECT_TYPES,
    TILED_LAYER_NAMES,
    TILED_OBJECT_PROPERTY,
    TILED_TILESET_NAMES,
} from "../common/tiled/common";
import {
    getAllLayerNamesWithPrefix,
    getTextureFromGid,
    getTiledDoorObjectsFromLayer,
    getTiledProperties,
    getTiledPropertyByName,
    getTiledZoneObjectsFromLayer,
    isValidObject,
    toTiledZoneObject,
} from "../common/tiled/tiled-utils";
import { TiledZoneObject } from "../common/tiled/types";
import { EventBus, GameEventEmitter } from "../Events";
import { Door } from "../game-objects/objects/door-object";
import { DoorGroup } from "../game-objects/objects/door-group";
import { Player } from "../game-objects/player/player";
import { RoomZone } from "../game-objects/objects/zone";
import { PLAYER_VISION_MASK_SIZE } from "../common/config";
import { GameEvents } from "../common/common";
import { userRefsManager } from "@/user/UserRefsManager";
import { PlayerPositionUpdate, Position } from "../common/types";
import {
    GameObject,
    GameObjectConfig,
} from "../game-objects/objects/game-object";
import { get } from "http";

export class MyScene extends Phaser.Scene {
    public customEvents: GameEventEmitter;
    private lastCameraState = {
        worldX: 0,
        worldY: 0,
        scrollX: 0,
        scrollY: 0,
        zoom: 1,
    };
    private text: Phaser.GameObjects.Text;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private map: Phaser.Tilemaps.Tilemap;
    // private graphics: Phaser.GameObjects.Graphics;
    // private debugGraphics: Phaser.GameObjects.Graphics;
    private fog: Phaser.GameObjects.Graphics;
    private visionMask: Phaser.GameObjects.Graphics;
    private mask: Phaser.Display.Masks.GeometryMask;
    private minZoom: number;
    private _player: Player | null = null;
    private threshold = 5;
    private cfg: { name: string };
    //private layerDepthMap: Record<string, number> = {};
    private currentZoneId: number | undefined = undefined;
    private networkPlayers: Map<string, Player> = new Map();
    private gameObjects: GameObject[] = [];
    private doorObjects: Door[] = [];
    private objectsByZoneId: {
        [key: number]: {
            //doorMap: { [key: number]: Door };
            doors: Door[];
            zone: TiledZoneObject;
            zoneObject: RoomZone;
            isOpen: boolean;
        };
    };
    private collisionLayer: Phaser.Tilemaps.TilemapLayer;
    constructor() {
        super({ key: "MyScene", physics: { arcade: { debug: false } } });
    }
    init(data: { cfg: { name: string } }) {
        this.cfg = data.cfg;
    }
    preload() {
        // this.load.image("grass", "tiles/grass.png");
        // this.load.image("wood-floor-100px", "tiles/wood-floor-100px.png");
        this.load.pack(
            ASSET_PACK_KEYS.MAIN,
            `assets/data/${this.cfg.name}/assets.json`
        );
        // this.load.json(
        //     "layerOrder",
        //     `assets/data/${this.cfg.name}/layers-order.json`
        // );
    }
    create() {
        if (!this.input.keyboard) {
            console.warn("Phaser keyboard plugin is not setup properly.");
            return;
        }
        this.customEvents = new GameEventEmitter(this.events);
        this.cursors = this.input.keyboard?.createCursorKeys();
        this.objectsByZoneId = {};
        this.map = this.make.tilemap({ key: this.cfg.name });
        // console.log("Map: ", this.map);
        this.createFogLayer();
        this.createMap(this.map);
        console.log(this.objectsByZoneId)
        this.setupCamera();
        this.setupCameraDrag(this.cameras.main);
        this.setupCameraZoom(this.cameras.main);
        this.setupColliders();

        this.game.events.on(Phaser.Core.Events.DESTROY, () => {
            this.destroy();
        });

        this.scale.on(Phaser.Scale.Events.RESIZE, () => {
            //    this.onResize();
        });

        this.cameras.main.on(Phaser.Scenes.Events.PRE_RENDER, () => {
            this.checkCameraChanges();
            this.emitPlayersPosition();
        });
        this.events.on(Phaser.Scenes.Events.PRE_RENDER, this.preRender, this);
        
        // })
        EventBus.emit("current-scene-ready", this);
        //const doorsLayers = zone.filter((layer) =>  layer.name.endsWith(`/${TILED_LAYER_NAMES.OPEN_DOOR}`) || layer.name.endsWith(`/${TILED_LAYER_NAMES.CLOSED_DOOR}`));
    }
    preRender() {
        this.updateFog();
    }
    update() {
        this.trackUserZone();
        this.checkCameraChanges();
        // this.emitPlayersPosition();
        //  this.updatePlayerPosition()

        // this.game.events.on(Phaser.Core., () => {
        //     this.onResize();
        // }
    }

    public emitPlayersPosition(): void {
        const playersPositions: PlayerPositionUpdate[] = [];
        if (this._player) {
            // if(this._player.lastPosition.x !== this._player.x || this._player.lastPosition.y !== this._player.y){
            playersPositions.push({
                x: this._player.x,
                y: this._player.y,
                id: this._player.id,
            });
            // }
        }
        this.networkPlayers.forEach((player) => {
            // if (player.lastPosition.x !== player.x || player.lastPosition.y !== player.y) {
            playersPositions.push({
                x: player.x,
                y: player.y,
                id: player.id,
            });
            // }
        });
        if (playersPositions.length > 0) {
            this.customEvents.emit(
                GameEvents.PLAYERS_POSITION_UPDATE,
                playersPositions
            );
        }
    }
    // private updateDebug() {
    //     const camera = this.cameras.main;
    //     const { scrollX, scrollY, worldView, zoom } = camera;

    //     // Clear previous drawings
    //     this.debugGraphics.clear();

    //     // 3. Draw camera center point (scrollX/Y)
    //     this.debugGraphics.fillStyle(0xff0000, 1); // Red
    //     this.debugGraphics.fillCircle(scrollX, scrollY, 10);

    //     // 4. Draw worldView rectangle (visible area)
    //     this.debugGraphics.lineStyle(2, 0x00ff00); // Green
    //     this.debugGraphics.strokeRect(
    //       worldView.x,
    //       worldView.y,
    //       worldView.width,
    //       worldView.height
    //     );

    //     // 5. Update debug text
    //     this.text.setText([
    //       `ScrollX/Y: ${scrollX.toFixed(1)}, ${scrollY.toFixed(1)}`,
    //       `WorldView: X=${worldView.x.toFixed(1)}, Y=${worldView.y.toFixed(1)}`,
    //       `Zoom: ${zoom.toFixed(2)}`,
    //       `Viewport: ${worldView.width.toFixed(0)}x${worldView.height.toFixed(0)}`
    //     ]);
    //   }
    private cameraChanged(): boolean {
        try {
            // const changed = (
            //     this.cameras.main.scrollX !== this.lastCameraState.x ||
            //     this.cameras.main.scrollY !== this.lastCameraState.y ||
            //     this.cameras.main.zoom !== this.lastCameraState.zoom
            //   );
            const changed =
                this.cameras.main.worldView.x !== this.lastCameraState.worldX ||
                this.cameras.main.worldView.y !== this.lastCameraState.worldY ||
                this.cameras.main.scrollX !== this.lastCameraState.worldX ||
                this.cameras.main.scrollY !== this.lastCameraState.worldY ||
                this.cameras.main.zoom !== this.lastCameraState.zoom;
            if (changed) {
                //  console.log( "Camera worldX: ", this.cameras.main.worldView.x, "Camera worldY: ", this.cameras.main.worldView.y, "Camera Zoom: ", this.cameras.main.zoom);
                this.lastCameraState = {
                    worldX: this.cameras.main.worldView.x,
                    worldY: this.cameras.main.worldView.y,
                    scrollX: this.cameras.main.scrollX,
                    scrollY: this.cameras.main.scrollY,
                    zoom: this.cameras.main.zoom,
                };
            }
            return changed;
        } catch (e) {
            console.error("Error in cameraChanged: ", e);
            return false;
        }
    }

    destroy() {
        console.log("Destroying MyScene");
    }

    private assignDoorsToZone(){
        this.doorObjects.forEach((door) => {
            const zoneObject = this.objectsByZoneId[door.zoneId];
            if (zoneObject) {
                zoneObject.doors.push(door);
            }
        })
    }
    private createMapObjects(map: Phaser.Tilemaps.Tilemap) {
        // Then process object layers
        map.objects.forEach((objectLayer) => {
            objectLayer.objects.forEach((tiledObject) => {
                this.createObjectFromTiled(tiledObject);
            });
        });
    }

    private createObjectFromTiled(
        tiledObject: Phaser.Types.Tilemaps.TiledObject
    ) {
        const type = tiledObject.type
           
        // Handle special object types
        switch (type) {
            case OBJECT_TYPES.DOOR:
                this.createDoor(tiledObject);
                break;
            case OBJECT_TYPES.ZONE:
                this.createZone(tiledObject);
                break;
            default:
                this.createGenericObject(tiledObject);
                break;
        }
    }

    private createGenericObject(
        tiledObject: Phaser.Types.Tilemaps.TiledObject
    ) {
        if (!isValidObject(tiledObject)) return;
        const gameObjectConfig: GameObjectConfig = {
            id: tiledObject.id,
            x: tiledObject.x,
            y: tiledObject.y,
            width: tiledObject.width,
            height: tiledObject.height,
            texture: getTextureFromGid(this.map, tiledObject.gid),
            gid: tiledObject.gid,
            properties: getTiledProperties(tiledObject.properties),
            frame: tiledObject.gid ? undefined : 0, // Use frame 0 if no GID
        };

        const gameObject = new GameObject(this, gameObjectConfig);
        this.gameObjects.push(gameObject);
    }
    private createDoor(tiledObject: Phaser.Types.Tilemaps.TiledObject) {
        if (!isValidObject(tiledObject)) return;
        const proprieties = getTiledProperties(tiledObject.properties);
        const zoneId = getTiledPropertyByName<number>(proprieties, "zoneId") || 0;
        const door = new Door(this, {
            x: tiledObject.x,
            y: tiledObject.y,
            width: tiledObject.width,
            height: tiledObject.height,
            id: tiledObject.id,
            texture: getTextureFromGid(this.map, tiledObject.gid),
            isOpen:
                getTiledPropertyByName<boolean>(proprieties, "isOpen") || false,
            zoneId: zoneId,
            properties: proprieties,
        });
        this.doorObjects.push(door);
    }

    private setupColliders() {
        this.collisionLayer.setCollision([
            this.collisionLayer.tileset[0].firstgid,
        ]);
    }

    private createMap(map: Phaser.Tilemaps.Tilemap): void {
        // 1. First handle tilesets and tile layers using your existing logic
        const loadedTilesets: Record<string, Phaser.Tilemaps.Tileset> = {};

        // Add all tilesets from the map using texture keys
        map.tilesets.forEach((tileset) => {
            const key = tileset.name;
            if (!this.textures.exists(key)) {
                console.warn(
                    `Texture with key '${key}' not found for tileset '${tileset.name}'`
                );
                return;
            }

            const addedTileset = map.addTilesetImage(tileset.name, key);
            if (addedTileset) {
                loadedTilesets[tileset.name] = addedTileset;
            }
        });

        // Process tile layers
        map.layers.forEach((layer) => {
            const usedTilesets: Phaser.Tilemaps.Tileset[] = [];

            // Check which tilesets are used in this layer
            for (const tileset of Object.values(loadedTilesets)) {
                const tilesetFirstGid = tileset.firstgid;
                const tilesetLastGid = tilesetFirstGid + tileset.total - 1;

                if (!layer || !layer.data) continue;

                const usedInLayer = layer.data.some((row) =>
                    row.some(
                        (tile) =>
                            tile.index >= tilesetFirstGid &&
                            tile.index <= tilesetLastGid
                    )
                );

                if (usedInLayer) {
                    usedTilesets.push(tileset);
                }
            }

            // Create the layer with only the used tilesets
            // const shortName = layer.name.split("/").pop() ?? layer.name;
            const createdLayer = map.createLayer(
                layer.name,
                usedTilesets,
                0,
                0
            );

            if (createdLayer) {
                console.log("Created layer: ", layer.name);
                const proprieties = getTiledProperties(layer.properties);
                const zindex = getTiledPropertyByName<number>(
                    proprieties,
                    TILED_OBJECT_PROPERTY.ZINDEX
                );
                createdLayer.setDepth(zindex || 0);

                if(layer.name === TILED_LAYER_NAMES.COLLIDES) {
                    this.collisionLayer = createdLayer;
                }
                //this.createdLayers[shortName] = createdLayer;
            }
        });
         this.collisionLayer.setAlpha(0);
        // 2. Then process object layers and create game objects
        this.createMapObjects(map);
        this.assignDoorsToZone();
    }

    private createZone(tiledObject: Phaser.Types.Tilemaps.TiledObject): void {
        if (!isValidObject(tiledObject)) return;
        const proprieties = getTiledProperties(tiledObject.properties);
        const zoneId = getTiledPropertyByName<number>(proprieties, "id") || 0;
        const zone = new RoomZone(this, this.map, {
            x: tiledObject.x,
            y: tiledObject.y,
            width: tiledObject.width,
            height: tiledObject.height,
            id: zoneId,
        });
        this.objectsByZoneId[zoneId] = {
            doors: [],
            zone: toTiledZoneObject(tiledObject)!,
            isOpen: true,
            zoneObject: zone,
        };
    }
    private checkCameraChanges() {
        // this.cameras.main.
        if (this.cameraChanged()) {
            this.customEvents.emit(GameEvents.CAMERA_CHANGE, {
                worldX: this.cameras.main.worldView.x,
                worldY: this.cameras.main.worldView.y,
                scrollX: this.cameras.main.scrollX,
                scrollY: this.cameras.main.scrollY,
                zoom: this.cameras.main.zoom,
            });
            //  console.log("Camera changed: ", this.cameras.main.worldView.x, this.cameras.main.worldView.y, this.cameras.main.zoom);
        }
    }
    private setupCamera(): void {
        const camera = this.cameras.main;
        this.minZoom =
            this.scale.height /
            (this.map.heightInPixels * GameConfig.mapScaleY);
        camera.zoom = this.minZoom;
        //EventBus.emit(GameEvents.ZOOM_CHANGE, camera.zoom);
        //this.customEvents.emit(GameEvents.ZOOM_CHANGE, camera.zoom);
        //console.log("Min Zoom: ", this.minZoom);
        let calculatedBounds = this.calculateBounds(
            this.map.heightInPixels,
            this.map.widthInPixels
        );
        camera.setBounds(
            calculatedBounds.x,
            calculatedBounds.y,
            calculatedBounds.width,
            calculatedBounds.height
        );
    }

    private calculateBounds(
        mapHeight: number,
        mapWidth: number
    ): { x: number; y: number; width: number; height: number } {
        let aspectRatio = this.scale.width / this.scale.height;
        let yHeight = mapHeight * GameConfig.mapScaleY;
        let yBounds = (yHeight - mapHeight) / 2;
        let xWidth = Math.max(
            (mapHeight + Math.abs(yBounds * 2)) * aspectRatio,
            mapHeight
        );
        let xBound = (xWidth - mapWidth) / 2;
        //  console.log("Width: ", xWidth, "Height: ", yHeight);
        //  console.log("Scene width: ", this.scale.width, "Scene height: ", this.scale.height);
        return { x: -xBound, y: -yBounds, width: xWidth, height: yHeight };
    }
    public onResize() {
        const camera = this.cameras.main;
        // this.graphics?.clear();
        let calculatedBounds = this.calculateBounds(
            this.map.heightInPixels,
            this.map.widthInPixels
        );
        camera.setBounds(
            calculatedBounds.x,
            calculatedBounds.y,
            calculatedBounds.width,
            calculatedBounds.height
        );
        // this.graphics?.lineStyle(2, 0xff0000, 1);
        // this.graphics?.strokeRect(
        //     calculatedBounds.x,
        //     calculatedBounds.y,
        //     calculatedBounds.width,
        //     calculatedBounds.height
        // );

        const worldCenterBefore = camera.getWorldPoint(
            camera.centerX,
            camera.centerY
        );

        // ✅ Get new scene dimensions
        const sceneWidth = this.scale.width;
        const sceneHeight = this.scale.height;

        this.minZoom =
            this.scale.height /
            (this.map.heightInPixels * GameConfig.mapScaleY);
        camera.zoom = this.minZoom;

        const worldCenterAfter = camera.getWorldPoint(
            sceneWidth / 2,
            sceneHeight / 2
        );
        // ✅ Adjust the camera scroll so the world point remains in the same place
        camera.scrollX += worldCenterBefore.x - worldCenterAfter.x;
        camera.scrollY += worldCenterBefore.y - worldCenterAfter.y;
    }

    private setupCameraDrag(camera: Phaser.Cameras.Scene2D.Camera): void {
        let cameraDragStartX: number;
        let cameraDragStartY: number;

        this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            if (pointer.rightButtonDown()) return;

            cameraDragStartX = camera.scrollX;
            cameraDragStartY = camera.scrollY;

            const worldX = pointer.worldX;
            const worldY = pointer.worldY;

            if (this._player) {
                const screenX =
                    (this._player.x - camera.worldView.x) *
                    this.cameras.main.zoom;
                const screenY =
                    (this._player.y - camera.worldView.y) *
                    this.cameras.main.zoom;

                console.log(`Player screen coords: (${screenX}, ${screenY})`);
            }
            console.log(
                "Camera scrollX: ",
                camera.scrollX,
                "Camera scrollY: ",
                camera.scrollY
            );
            console.log(
                "Camera x: ",
                camera.worldView.x,
                "Camera y: ",
                camera.worldView.y
            );
            console.log("Current zoom: ", camera.zoom);
            console.log(`Mouse Clicked World: (${worldX}, ${worldY})`);
            console.log("Mouse Clicked Screen: ", pointer.x, pointer.y);
        });

        this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
            if (pointer.rightButtonDown()) return;
            if (pointer.isDown) {
                const newScrollX =
                    cameraDragStartX +
                    (pointer.downX - pointer.x) / camera.zoom;
                const newScrollY =
                    cameraDragStartY +
                    (pointer.downY - pointer.y) / camera.zoom;
                camera.scrollX = newScrollX;
                camera.scrollY = newScrollY;
            }
        });
    }

    // private setupDoorsInteractivity(): void {
    //     this.events.on(GameEvents.DOOR_CLICK, (zoneId: number) => {
    //         const doors = this.objectsByZoneId[zoneId].doors;
    //         const zone = this.objectsByZoneId[zoneId].zone;
    //         const isOpen = this.objectsByZoneId[zoneId].isOpen;
    //         doors.forEach((door) => {
    //             door.toggleState(!isOpen);
    //         });
    //         this.objectsByZoneId[zoneId].isOpen = !isOpen;
    //     });
    // }
    private setupCameraZoom(camera: Phaser.Cameras.Scene2D.Camera): void {
        this.input.on(
            "wheel",
            (
                pointer: Phaser.Input.Pointer,
                _gameObjects: any,
                _deltaX: any,
                deltaY: any
            ) => {
                const worldPoint = camera.getWorldPoint(pointer.x, pointer.y);
                const newZoom = camera.zoom - camera.zoom * 0.001 * deltaY;

                camera.zoom = Phaser.Math.Clamp(newZoom, this.minZoom, 2);
                //EventBus.emit(GameEvents.ZOOM_CHANGE, camera.zoom);
                this.customEvents.emit(GameEvents.ZOOM_CHANGE, camera.zoom);
                camera.preRender();
                const newWorldPoint = camera.getWorldPoint(
                    pointer.x,
                    pointer.y
                );

                camera.scrollX -= newWorldPoint.x - worldPoint.x;
                camera.scrollY -= newWorldPoint.y - worldPoint.y;
            }
        );
    }
    private createFogLayer(): void {
        this.fog = this.add.graphics().setDepth(100);
        this.fog.fillStyle(0x000000, 0.5); // Semi-transparent black
        this.fog.fillRect(
            0,
            0,
            this.map.widthInPixels,
            this.map.heightInPixels
        );
        this.visionMask = this.make.graphics({}).setDepth(101);
        this.visionMask.fillStyle(0xffffff);

        this.mask = this.visionMask.createGeometryMask();
        this.mask.invertAlpha = true;
        this.fog.setMask(this.mask);
    }

    private trackUserZone() {
        if (!this._player) return;
        const currentZone = Object.values(this.objectsByZoneId).find(
            ({ zone, zoneObject }) => {
                const originY = zoneObject.originY ?? 0; // default to 0 if undefined

                let zoneY = zoneObject.y;
                if (originY === 1) {
                    // If origin is bottom-left, shift Y up by the height of the zone
                    zoneY -= zone.height;
                }

                return (
                    this._player!.x >= zone.x &&
                    this._player!.x <= zone.x + zone.width &&
                    this._player!.y >= zoneY &&
                    this._player!.y <= zoneY + zone.height
                );
            }
        );

        if (this.currentZoneId !== currentZone?.zone.zoneId) {
            this.currentZoneId = currentZone?.zone.zoneId;
            console.log("Player entered room:", this.currentZoneId);
            this.customEvents.emit(GameEvents.CURRENT_ZONE, {
                zoneId: this.currentZoneId ?? -1,
            });
        }
    }

    private updateFog(): void {
        this.fog.clear();
        this.fog.fillStyle(0x000000, 0.2);
        this.fog.fillRect(
            0,
            0,
            this.map.widthInPixels,
            this.map.heightInPixels
        );

        this.visionMask.clear();

        if (!this._player) return;

        if (this.currentZoneId) {
            const zone = this.objectsByZoneId[this.currentZoneId]
            if(!zone) return;
            const zoneObj = zone.zoneObject;
            const originY = zoneObj.originY ?? 0;
            const adjustedY =
                originY === 1 ? zoneObj.y - zoneObj.height : zoneObj.y;

            this.visionMask.fillRect(
                zoneObj.x,
                adjustedY,
                zoneObj.width,
                zoneObj.height
            );
        } else {
            this.visionMask.fillCircle(
                this._player.x,
                this._player.y,
                PLAYER_VISION_MASK_SIZE
            );
            // this.visionMask.fill();
        }
    }

    private setupPlayer(isLocal: boolean, id?: string): void {
        this._player = new Player({
            scene: this,
            position: { x: this.scale.width / 2, y: this.scale.height / 2 },
            isLocal: isLocal,
            playerId: id,
        });
        if (this._player) {
            this.physics.add.collider(this._player, this.collisionLayer);
        }
    }

    addPlayer(id: string, localPlayer: boolean, x: number, y: number) {
        if (localPlayer) {
            this._player = new Player({
                scene: this,
                position: { x, y },
                isLocal: localPlayer,
                playerId: id,
            });
            if (this._player) {
                this.physics.add.collider(this._player, this.collisionLayer);
                this.doorObjects.forEach((door) => {
                    if(!door.isOpen) {
                        this.physics.add.collider(this._player!, door);
                    }
                })
            }
        } else {
            if (!this.networkPlayers.has(id)) {
                const player = new Player({
                    scene: this,
                    position: {
                        x,
                        y,
                    },
                    isLocal: false,
                    playerId: id,
                });
                this.networkPlayers.set(id, player);

                this.physics.add.collider(player, this.collisionLayer);
                this.doorObjects.forEach((door) => {
                    if(!door.isOpen) {
                        this.physics.add.collider(player, door);
                    }
                })
            }
        }
    }

    updatePlayer(id: any, x: number, y: number) {
        let sprite;
        if (this._player && this._player.id === id) {
            sprite = this._player;
        } else if (this.networkPlayers.has(id)) {
            sprite = this.networkPlayers.get(id);
        }
        if (!sprite) return;
        // const distance = Phaser.Math.Distance.Between(sprite.x, sprite.y, x, y);
        sprite.updateFromNetwork({
            x,
            y,
        });
    }

    removePlayer(id: string) {
        if (this._player && this._player.id === id) {
            this._player.destroy();
        } else {
            const sprite = this.networkPlayers.get(id);
            if (sprite) {
                sprite.destroy();
                this.networkPlayers.delete(id);
            }
        }
    }
    toggleZoneState(zoneId: number): void {
        const doors = this.objectsByZoneId[zoneId].doors;
        const isOpen = this.objectsByZoneId[zoneId].isOpen;
        doors.forEach((door) => {
            door.toggleState(!isOpen);
        });
        this.objectsByZoneId[zoneId].isOpen = !isOpen;
    }
    setZoneState(zoneId: number, newOpenState: boolean): void {
        const doors = this.objectsByZoneId[zoneId].doors;
        doors.forEach((door) => {
            door.toggleState(newOpenState);
        });
        this.objectsByZoneId[zoneId].isOpen = newOpenState;
    }
}
