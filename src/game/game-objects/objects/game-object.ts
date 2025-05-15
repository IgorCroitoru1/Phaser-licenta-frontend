import { CustomGameObject } from "@/game/common/types";
import { TiledObjectProperty, TiledObjectWithProperties } from "@/game/common/tiled/types";
import { GameEvents } from "@/game/common/common";
import { GameEventPayloads } from "@/game/Events";
import { getTiledProperties, getTiledPropertyByName } from "@/game/common/tiled/tiled-utils";

export type GameObjectConfig = {
  texture: string;
  frame?: string | number;
} & TiledObjectWithProperties;

export class GameObject extends Phaser.Physics.Arcade.Sprite implements CustomGameObject {
  private readonly _id: number;
  private readonly _x: number;
  private readonly _y: number;
  private readonly _width: number;
  private readonly _height: number;
  private readonly _properties: TiledObjectProperty[];
//   private _interactive: boolean;

  constructor(scene: Phaser.Scene, config: GameObjectConfig) {
    super(scene, config.x, config.y, config.texture, config.frame);
    this._id = config.id;
    this._x = config.x;
    this._y = config.y;
    this._width = config.width;
    this._height = config.height;
    this._properties = config.properties
    // this._properties = config.properties;
    // this._interactive = getTiledPropertyByName<boolean>(this._properties, 'interactive') || false;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Set origin based on Tiled's coordinate system (bottom-left for objects with GID)
    this.setOrigin(0, 1);
    
    // Adjust for Tiled's y-coordinate system if it's a tile object
    if (config.gid) {
      this.y += config.height;
    }

    // Set up physics body
    this.setImmovable(true);
    (this.body as Phaser.Physics.Arcade.Body).setSize(config.width, config.height);
    
    // // Make interactive if specified in properties
    // if (this._interactive) {
    //   this.setupInteractivity();
    // }

    // Apply initial state from properties
    this.applyInitialState();
  }

//   private setupInteractivity(): void {
//     this.setInteractive({ 
//       useHandCursor: true,
//       hitArea: new Phaser.Geom.Rectangle(0, 0, this._width, this._height),
//       hitAreaCallback: Phaser.Geom.Rectangle.Contains
//     });
    
//     this.on('pointerdown', () => {
//     //   this.scene.events.emit(GameEvents.OBJECT_INTERACTION, { 
//     //     object: this,
//     //     properties: this._properties
//     //   } as GameEventPayloads[GameEvents.OBJECT_INTERACTION]);
//     });
//   }

  private applyInitialState(): void {
    // Apply visibility from properties
    // const visible = getTiledPropertyByName<boolean>(this._properties, 'visible');
    // if (visible !== undefined) {
    //   this.setVisible(visible);
    // }

    // // Apply active state from properties
    // const active = getTiledPropertyByName<boolean>(this._properties, 'active');
    // if (active !== undefined) {
    //   this.setActive(active);
    //   (this.body as Phaser.Physics.Arcade.Body).enable = active;
    // }

    // Apply depth from properties
    const zindex = getTiledPropertyByName<number>(this._properties, 'zindex');
    if (zindex !== undefined) {
      this.setDepth(zindex);
    } else {
      // Default depth based on y-position for pseudo-3D effect
      this.setDepth(this.y);
    }
  }

  public enableObject(): void {
    this.setVisible(true);
    (this.body as Phaser.Physics.Arcade.Body).enable = true;
    this.setActive(true);
  }

  public disableObject(): void {
    this.setVisible(false);
    (this.body as Phaser.Physics.Arcade.Body).enable = false;
    this.setActive(false);
  }

  public get position() {
    return { x: this._x, y: this._y };
  }

  public get size() {
    return { width: this._width, height: this._height };
  }

  public get properties() {
    return this._properties;
  }
    public get id() {
        return this._id;
    }
  public getProperty<T>(name: string): T | undefined {
    return getTiledPropertyByName<T>(this._properties, name);
  }

//   public setInteractiveState(interactive: boolean): void {
//     if (this._interactive === interactive) return;
    
//     this._interactive = interactive;
//     if (interactive) {
//       this.setupInteractivity();
//     } else {
//       this.removeInteractive();
//     }
//   }
}