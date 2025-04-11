import * as Phaser from 'phaser';
import { CustomGameObject, Direction, Position } from '../../common/types';
import { SpeedComponent } from '@/game/components/game-object/speed-component';
import GameConfig from '../../../../game-config';
import { PLAYER_HEIGHT, PLAYER_WIDTH } from '@/game/common/config';

export type CharacterConfig = {
  scene: Phaser.Scene;
  position: Position;
  assetKey: string;
  frame?: number;
  speed: number;
  id?: string;
  isPlayer: boolean;
};

export abstract class CharacterGameObject extends Phaser.Physics.Arcade.Sprite implements CustomGameObject {
  protected _speedComponent: SpeedComponent;
  protected _isPlayer: boolean;
  protected _targetPosition: Position;
  constructor(config: CharacterConfig) {
    const {
      scene,
      position,
      assetKey,
      frame,
      speed,
      id,
      isPlayer,
    } = config;
    const { x, y } = position;
    super(scene, x, y, assetKey, frame || 0);

    // add object to scene and enable phaser physics
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT)
    // add shared components
    this._speedComponent = new SpeedComponent(this, speed);

    // create state machine

    // general config
    this._isPlayer = isPlayer;
  }
  
  

  get speed(): number {
    return this._speedComponent.speed;
  }


  public update(): void {
  }

  public disableObject(): void {
    // disable body on game object so we stop triggering the collision
    (this.body as Phaser.Physics.Arcade.Body).enable = false;

    // make not active and not visible until player re-enters room
    this.active = false;
    if (!this._isPlayer) {
      this.visible = false;
    }
  }

  public enableObject(): void {
    (this.body as Phaser.Physics.Arcade.Body).enable = true;
    this.active = true;
    this.visible = true;
  }
}
