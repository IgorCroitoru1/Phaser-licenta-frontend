import { TiledDoorObject } from "@/game/common/tiled/types";
import { CustomGameObject } from "@/game/common/types";
import GameConfig from "../../../../game-config";
import { GameEvents } from "@/game/common/common";
import { GameEventPayloads } from "@/game/Events";
import { GameObject, GameObjectConfig } from "./game-object";

export type TiledDoorConfig = GameObjectConfig & TiledDoorObject;

export class Door extends GameObject {
  private readonly _zoneId: number;
  /**
   * Indică dacă ușa este de tip deschis sau închis.
   * Acest parametru este folosit numai pentru a identifica tipul ușii,
   * nu pentru a-i modifica starea.
   * 
   * @private
   */
  private _isOpen: boolean;

  constructor(scene: Phaser.Scene, config: TiledDoorConfig) {
    super(scene, config);

    this._zoneId = config.zoneId;
    this._isOpen = config.isOpen;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setInteractive({useHandCursor: true});
    this.on('pointerdown', () => {
      this.scene.events.emit(GameEvents.DOOR_TRIGGER, { zoneId: this._zoneId} as GameEventPayloads[GameEvents.DOOR_TRIGGER]);
    });
    // this.setOrigin(0, 1).setImmovable(true);

    if (this._isOpen) {
    this.enableObject()
    }
    else {
      this.disableObject();
    }
  }


  // Optional: zone-related getters
  public get zoneId(): number {
    return this._zoneId;
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
