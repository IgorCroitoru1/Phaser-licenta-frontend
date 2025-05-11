import { TiledDoorObject } from "@/game/common/tiled/types";
import { CustomGameObject } from "@/game/common/types";
import GameConfig from "../../../../game-config";
import { GameEvents } from "@/game/common/common";
import { GameEventPayloads } from "@/game/Events";

export type TiledDoorConfig = {
  texture: string;
} & TiledDoorObject;

export class Door extends Phaser.Physics.Arcade.Sprite implements CustomGameObject {
  private readonly zoneId: number;
  private readonly _x: number;
  private readonly _y: number;
  private readonly _width: number;
  private readonly _height: number;
 
  /**
   * Indică dacă ușa este de tip deschis sau închis.
   * Acest parametru este folosit numai pentru a identifica tipul ușii,
   * nu pentru a-i modifica starea.
   * 
   * @private
   */
  private _isOpen: boolean;

  constructor(scene: Phaser.Scene, config: TiledDoorConfig) {
    super(scene, config.x, config.y, config.texture);

    this.zoneId = config.zoneId;
    this._x = config.x;
    this._y = config.y;
    this._width = config.width;
    this._height = config.height;
    this._isOpen = config.isOpen;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setInteractive({useHandCursor: true});
    this.on('pointerdown', () => {
      this.scene.events.emit(GameEvents.DOOR_TRIGGER, { zoneId: this.zoneId} as GameEventPayloads[GameEvents.DOOR_TRIGGER]);
    });
    this.setOrigin(0, 1).setImmovable(true);

    if (this._isOpen) {
    this.enableObject()
    }
    else {
      this.disableObject();
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

  

  // Optional: zone-related getters
  public getZoneId(): number {
    return this.zoneId;
  }

  public get position() {
    return { x: this._x, y: this._y };
  }
  public get isOpen(){
    return this._isOpen;
  }
  public toggleState(toOpen: boolean): void {
    if (toOpen && this._isOpen === false) this.disableObject();
    else if (toOpen && this._isOpen === true)this.enableObject();
    else if(!toOpen && this._isOpen === true) this.disableObject();
    else if(!toOpen && this._isOpen === false) this.enableObject();
  }
}
