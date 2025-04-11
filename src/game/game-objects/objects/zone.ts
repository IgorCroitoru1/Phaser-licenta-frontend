import { GameObjects, Physics } from 'phaser';
import { CustomGameObject } from '../../common/types';

export class RoomZone extends GameObjects.Zone implements CustomGameObject {
  private _id: number;
  private _isOpen: boolean;
  private debugRect?: Phaser.GameObjects.Rectangle;
  public fog: Phaser.GameObjects.Graphics
  constructor(
    scene: Phaser.Scene,
    map: Phaser.Tilemaps.Tilemap,
    config: { x: number; y: number; width: number; height: number; id: number }
  ) {
    super(scene, config.x, config.y, config.width, config.height);

    this._id = config.id;
    this._isOpen = true;

    // Add to scene
    scene.add.existing(this);

    // Enable physics
    scene.physics.world.enable(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);

    // Optional: set origin
    this.setOrigin(0, 1);

    //this.fog = scene.add.graphics().setDepth(100);
    //this.fog.fillStyle(0x000000, 0.5);
    //this.fog.fillRect(config.x, config.y-config.height, map.widthInPixels, map.heightInPixels);
    // Optional debug rectangle
    // this.debugRect = scene.add.rectangle(config.x, config.y, config.width, config.height, 0xff0000, 0.2).setOrigin(0);
  }

  get id(): number {
    return this._id;
  }

  get isOpen(): boolean {
    return this._isOpen;
  }

  set isOpen(value: boolean) {
    this._isOpen = value;
  }

  toggleOpen(): void {
    this._isOpen = !this._isOpen;
  }

  enableObject(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    this.active = true;
    this.visible = true;
  }

  disableObject(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = false;
    this.active = false;
    this.visible = false;
  }
}
