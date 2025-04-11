import GameConfig from "../../../game-config";
import { EventBus } from "../Events";
import {Move} from "../../shared/event-data";
import { Position } from "../common/types";
import { GameEvents } from "../common/common";
export default class TestScene extends Phaser.Scene{
    private playerSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
    minZoom:number;
    graphics: Phaser.GameObjects.Graphics;
    fog: Phaser.GameObjects.Graphics;
    visionMask: Phaser.GameObjects.Graphics;
    mask: Phaser.Display.Masks.GeometryMask;
    private playerContainer: Phaser.Physics.Arcade.Sprite | null;
    cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    speed = GameConfig.playerSpeed;
    uiPlayer:HTMLElement | null;
    wallsLayer: Phaser.Tilemaps.TilemapLayer | null;
    private map: Phaser.Tilemaps.Tilemap;
    private lastPosition: Move = { x: 0, y: 0 };
    private threshold = 5;
    roomAreas: { x: number; y: number; width: number; height: number; id: string }[] = [];
    currentRoomId: any;
    constructor() {
        super({ key: 'TestScene', physics: { arcade: { debug: true } } }); // ✅ Enable Physics
    }

    create(){
        if (!this.input.keyboard) {
            console.warn('Phaser keyboard plugin is not setup properly.');
            return;
        }
        
        
        this.cursors = this.input.keyboard?.createCursorKeys();
        this.map = this.make.tilemap({ key: "map" });

        this.roomAreas = this.map.getObjectLayer("room")?.objects.map(obj => ({
            x: obj.x!,
            y: obj.y!,
            width: obj.width!,
            height: obj.height!,
            id: Phaser.Math.RND.uuid() // Generate a random ID for each room
          })) ?? [];

        const xfloorTileset = this.map.addTilesetImage("x-floor", "x-floor");
        const wallsTileset = this.map.addTilesetImage("wall", "wall");
        this.graphics = this.add.graphics();
        if (!xfloorTileset || !wallsTileset) {
            console.error("Tilesets not found! Check names in Tiled and Phaser.");
            return;
        }

        const xfloorLayer = this.map.createLayer("floor", xfloorTileset, 0,0);
        this.wallsLayer = this.map.createLayer("walls", wallsTileset, 0,0);
        
        if (!xfloorLayer || !this.wallsLayer) {
            console.error("Tilemap layers not found! Check your Tiled map.");
            return;
        }
    
        if (this.wallsLayer) {
            this.wallsLayer.setCollisionByExclusion([-1]); 
        }
        
        this.wallsLayer.setCollisionByProperty({ collides: true });

       
       this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    // ✅ Enable Collision Between Player & Walls
       
        
        const camera = this.cameras.main;
        this.minZoom = this.scale.height / (this.map.heightInPixels * GameConfig.mapScaleY);
        camera.zoom = this.minZoom;
        EventBus.emit(GameConfig.zoomChange, camera.zoom);
      
        console.log("Min Zoom: ", this.minZoom);
        let calculatedBounds = this.calculateBounds(this.map.heightInPixels, this.map.widthInPixels);
        camera.setBounds(calculatedBounds.x, calculatedBounds.y, calculatedBounds.width, calculatedBounds.height);
        this.graphics.lineStyle(2, 0xff0000, 1);
        this.graphics.strokeRect(calculatedBounds.x, calculatedBounds.y, calculatedBounds.width, calculatedBounds.height,);

        console.log(this.roomAreas)
        const debugGraphics = this.add.graphics();
        debugGraphics.lineStyle(1, 0x00ff00);
        this.roomAreas.forEach(room => {
        debugGraphics.strokeRect(room.x, room.y, room.width, room.height);
        });

        this.fog = this.add.graphics();
        this.fog.fillStyle(0x000000, 0.5); // Semi-transparent black
        this.fog.fillRect(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.visionMask = this.make.graphics({});
        this.visionMask.fillStyle(0xffffff);
//        this.visionMask.setBlendMode(Phaser.BlendModes.DESTINATION_OUT);
        
        // Create the mask and apply it
        this.mask = this.visionMask.createGeometryMask();
        this.mask.invertAlpha = true;
        this.fog.setMask(this.mask);
        
     
        let cameraDragStartX:number;
        let cameraDragStartY:number;

        this.input.on('pointerdown', (pointer:Phaser.Input.Pointer) => {
            if (pointer.rightButtonDown()) return;
            cameraDragStartX = camera.scrollX;
            cameraDragStartY = camera.scrollY;
            const worldX = pointer.worldX;
            const worldY = pointer.worldY;
           console.log("Current zoom: ", camera.zoom);
            console.log(`Mouse Clicked World: (${worldX}, ${worldY})`);
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (pointer.rightButtonDown()) return;
        
            if (pointer.isDown) {
                // Calculate the new scroll position
                const newScrollX = cameraDragStartX + (pointer.downX - pointer.x) / camera.zoom;
                const newScrollY = cameraDragStartY + (pointer.downY - pointer.y) / camera.zoom;
        
                // console.log("Camera Drag Start X:", cameraDragStartX, "Camera Drag Start Y:", cameraDragStartY);
                // console.log("Pointer Down X:", pointer.downX, "Pointer Down Y:", pointer.downY);
                // console.log("Pointer X:", pointer.x, "Pointer Y:", pointer.y);
                // console.log("-----------------------------------------------------------------")
        
                camera.scrollX = newScrollX;
                camera.scrollY = newScrollY;
                // console.log("Clamped Camera ScrollX:", camera.scrollX, "Clamped Camera ScrollY:", camera.scrollY, "Zoom:", camera.zoom);
            }
        });
        
        

        this.input.on('wheel', (pointer:Phaser.Input.Pointer, gameObjects:any, deltaX:any, deltaY:any, deltaZ:any) => {
            // Get the current world point under pointer.
            const worldPoint = camera.getWorldPoint(pointer.x, pointer.y);
            const newZoom = camera.zoom - camera.zoom * 0.001 * deltaY;
            //console.log("Scene Height: ", this.scale.height, "Map Height: ", map.heightInPixels);
           //console.log("Min Zoom: ", minZoom);
            //console.log("New Zoom: ", newZoom);
            camera.zoom = Phaser.Math.Clamp(newZoom, this.minZoom, 2);
            EventBus.emit(GameConfig.zoomChange, camera.zoom);
            // Update camera matrix, so `getWorldPoint` returns zoom-adjusted coordinates.
            camera.preRender();
            const newWorldPoint = camera.getWorldPoint(pointer.x, pointer.y);
            // Scroll the camera to keep the pointer under the same world point.
            camera.scrollX -= newWorldPoint.x - worldPoint.x;
            camera.scrollY -= newWorldPoint.y - worldPoint.y;
        });

     
        EventBus.emit("current-scene-ready", this);
        this.events.on("shutdown", () => {
            this.playerContainer?.destroy();
            this.playerSprites.clear();
            // this.physics.shutdown();
            console.log("Scene shutdown");

        })
        console.log(this)
    }
  
    update() {
        this.fog.clear();
        this.fog.fillStyle(0x000000, 0.25);
        this.fog.fillRect(0, 0, this.map.widthInPixels, this.map.heightInPixels);
      
        if(this.playerContainer && this.cursors && this.playerContainer.active){
           //console.log(this.playerContainer)
            this.playerContainer.setVelocity(0);
    
            const { left, right, up, down } = this.cursors;
            if (left.isDown) this.playerContainer.setVelocityX(-this.speed);
            if (right.isDown) this.playerContainer.setVelocityX(this.speed);
            if (up.isDown) this.playerContainer.setVelocityY(-this.speed);
            if (down.isDown) this.playerContainer.setVelocityY(this.speed);

            const currentPosition: Position = {
                x: this.playerContainer.x,
                y: this.playerContainer.y,
            };
        
            // ✅ Only emit event if position changed
            if (currentPosition.x !== this.lastPosition.x || currentPosition.y !== this.lastPosition.y) {
                this.events.emit(GameEvents.PLAYER_MOVE, currentPosition);
                
                // ✅ Update last known position
                this.lastPosition = { ...currentPosition };
            }

              this.visionMask.clear();

            let currentRoom = this.roomAreas.find(room =>
                this.playerContainer!.x >= room.x &&
                this.playerContainer!.x <= room.x + room.width &&
                this.playerContainer!.y >= room.y &&
                this.playerContainer!.y <= room.y + room.height
              );
            if (this.currentRoomId !== currentRoom?.id) {
            this.currentRoomId = currentRoom?.id;
            console.log("Player entered room:", this.currentRoomId);
            }
            // this.visionMask.clear();
            
            if (currentRoom) {
            //this.visionMask.fillStyle(0x12dfef);
            this.visionMask.fillRect(currentRoom.x, currentRoom.y, currentRoom.width, currentRoom.height);
            }
            else {
             this.visionMask.fillCircle(this.playerContainer.x, this.playerContainer.y, 150); // radius

            }
          
                        
        }
       
      
    
      
        this.fog.clear();
        this.fog.fillStyle(0x000000, 0.2);
        this.fog.fillRect(0, 0, this.map.widthInPixels, this.map.heightInPixels);
            
    }
    
    
    onResize() {
        const camera = this.cameras.main;
        this.graphics.clear();
        let calculatedBounds = this.calculateBounds(this.map.heightInPixels, this.map.widthInPixels);
        camera.setBounds(calculatedBounds.x, calculatedBounds.y, calculatedBounds.width, calculatedBounds.height);
        this.graphics.lineStyle(2, 0xff0000, 1);
        this.graphics.strokeRect(calculatedBounds.x, calculatedBounds.y, calculatedBounds.width, calculatedBounds.height,);
    
     
        const worldCenterBefore = camera.getWorldPoint(camera.centerX, camera.centerY);
    
        // ✅ Get new scene dimensions
        const sceneWidth = this.scale.width;
        const sceneHeight = this.scale.height;
    
       
        this.minZoom = this.scale.height / (this.map.heightInPixels * GameConfig.mapScaleY);
        camera.zoom = this.minZoom;
       
        const worldCenterAfter = camera.getWorldPoint(sceneWidth / 2, sceneHeight / 2);
    
        // ✅ Adjust the camera scroll so the world point remains in the same place
        camera.scrollX += worldCenterBefore.x - worldCenterAfter.x;
        camera.scrollY += worldCenterBefore.y - worldCenterAfter.y;
    }
    private calculateBounds(mapHeight:number, mapWidth: number) :{x:number, y:number, width:number, height:number}{
        let aspectRatio = this.scale.width / this.scale.height;
         let yHeight = mapHeight * GameConfig.mapScaleY;
         let yBounds = (yHeight - mapHeight) / 2;
         let xWidth = Math.max((mapHeight + Math.abs(yBounds*2))*aspectRatio, mapHeight);
         let xBound = (xWidth - mapWidth) / 2;
        //  console.log("Width: ", xWidth, "Height: ", yHeight);
        //  console.log("Scene width: ", this.scale.width, "Scene height: ", this.scale.height);
        return {x: -xBound, y: -yBounds, width: xWidth, height: yHeight};
    }
  
    addPlayer(id: string, localPlayer:boolean,x: number = 700, y: number = 1030) {
        if(localPlayer){
            console.log("Creating local player")
            this.playerContainer = this.physics.add.sprite(700, 1030, "")
            .setOrigin(0.5)
            .setVisible(false)
            .setDisplaySize(GameConfig.playerWidth, GameConfig.playerHeight)
            .setCollideWorldBounds(true);
            if(this.wallsLayer) 
                this.physics.add.collider(this.playerContainer, this.wallsLayer);
            console.log("Player Container: ", this.playerContainer);

        
        }
        else{
            if (!this.playerSprites.has(id)) {
                const sprite = this.physics.add.sprite(700, 1030, "")
                .setOrigin(0.5)
                .setVisible(true)
                .setDisplaySize(GameConfig.playerWidth, GameConfig.playerHeight)
                .setCollideWorldBounds(true);
                this.playerSprites.set(id, sprite);
                if(this.wallsLayer) 
                    this.physics.add.collider(sprite, this.wallsLayer);

            }
        }
       
    }

    updatePlayer(id: string, x: number, y: number) {
        const sprite = this.playerSprites.get(id);
        if (!sprite) return;

        const distance = Phaser.Math.Distance.Between(sprite.x, sprite.y, x, y);

        if (distance > this.threshold) {
        // If desynchronized, snap to position
        sprite.setPosition(x, y);
            } else {
            // Otherwise, smoothly move
            sprite.x = Phaser.Math.Linear(sprite.x, x, 0.2);
            sprite.y = Phaser.Math.Linear(sprite.y, y, 0.2);
        }
    }

    removePlayer(id: string, localPlayer:boolean) {
        if(localPlayer){
            this.playerContainer?.destroy();
        }
        else{
            const sprite = this.playerSprites.get(id);
            if (sprite) {
                sprite.destroy();
                this.playerSprites.delete(id);
            }
        }
      
    }
    
}