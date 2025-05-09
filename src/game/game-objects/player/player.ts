import * as Phaser from 'phaser';
import { GameObject, Position } from '../../common/types';
import { NETWORK_TRESHOLD, PLAYER_SPEED } from '../../common/config';
import { CharacterGameObject } from '../common/character-game-object';
import { CollidingObjectsComponent } from '../../components/game-object/colliding-objects-component';
import GameConfig from '../../../../game-config';
import { GameEvents } from '@/game/common/common';
import { GameEventPayloads } from '@/game/Events';


export type PlayerConfig = {
  scene: Phaser.Scene;
  position: Position;
  isLocal?: boolean;
  playerId: any;
};

export class Player extends CharacterGameObject {
  private _collidingObjectsComponent: CollidingObjectsComponent;
  private _cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  private _isLocal: boolean;
  private _lerpFactor: number = 0.3;
  private _lastPosition: Position = { x: 0, y: 0 };
  private _id: any
  constructor(config: PlayerConfig) {
    super({
      scene: config.scene,
      position: config.position,
      frame: 0,
      isPlayer: true,
      speed: PLAYER_SPEED,
      assetKey: "",});

      this._id = config.playerId;
      this._isLocal = config.isLocal || false;
      this._targetPosition = { ...config.position };
  
      if (this._isLocal) {
        this._cursors = config.scene.input.keyboard?.createCursorKeys();
        // this.setTint(0x00ff00); // Green tint for local player
      } else {
        // this.setTint(0xff0000); // Red tint for network players
      }
    this.setupPhysics();
    this.setDepth(100);
    //this.setVisible(false);
    // add components
    this._collidingObjectsComponent = new CollidingObjectsComponent(this);

    // enable auto update functionality
    config.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    config.scene.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      () => {
        config.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
      },
      this,
    );

    // update physics body
    //this.physicsBody.setSize(12, 16, true).setOffset(this.width / 2 - 5, this.height / 2);
  }

  get id(): any {
    return this._id;
  }
  private setupPhysics(): void {
    //this.setCollideWorldBounds(true);
    //this.setSize(32, 32); // Set appropriate size for your sprite
   // this.setOffset(0, 0); // Adjust offset if needed
  }

  get physicsBody(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  public collidedWithGameObject(gameObject: GameObject): void {
    this._collidingObjectsComponent.add(gameObject);
  }

 
  get collidingObjects(): GameObject[] {
    return this._collidingObjectsComponent.objects;
  }
  get lastPosition(): Position {
    return this._lastPosition;
  }

  public update(): void {
    if (this._isLocal) {
      this.handleMovement();
    } else {
      this.handleNetworkMovement();
    }

    super.update();
    this._collidingObjectsComponent.reset();
  }

  private handleMovement(): void {
    if (!this._cursors) return;

    // Reset velocity each frame
    this.setVelocity(0);

    // Get input from keyboard
    if (this._cursors.left.isDown) this.setVelocityX(-this.speed);
    if (this._cursors.right.isDown) this.setVelocityX(this.speed);
    if (this._cursors.up.isDown) this.setVelocityY(-this.speed);
    if (this._cursors.down.isDown) this.setVelocityY(this.speed);
    
    const currentPosition: Position = {
      x: this.x,
      y: this.y,
    };

    // ✅ Only emit event if position changed
    if (currentPosition.x !== this._lastPosition.x || currentPosition.y !== this._lastPosition.y) {
      this.scene.events.emit(GameEvents.PLAYER_MOVE, currentPosition as GameEventPayloads[GameEvents.PLAYER_MOVE]);

        
        // ✅ Update last known position
        this._lastPosition = { ...currentPosition };
    }
    // Normalize diagonal movement
    if (this.body?.velocity.x !== 0 && this.body?.velocity.y !== 0) {
      this.body?.velocity.normalize().scale(this.speed);
    }
  }

  private handleNetworkMovement(): void {
    // Smoothly interpolate to target position
    this.x = Phaser.Math.Linear(this.x, this._targetPosition.x, this._lerpFactor);
    this.y = Phaser.Math.Linear(this.y, this._targetPosition.y, this._lerpFactor);
  }

  public updateFromNetwork(position: Position): void {
    if (this._isLocal) {
      // 🔥 Reconciliation logic
      const dx = Math.abs(this.x - position.x);
      const dy = Math.abs(this.y - position.y);
  
      if (dx > NETWORK_TRESHOLD || dy > NETWORK_TRESHOLD) {
        // Correct hard if too far
        this.x = Phaser.Math.Linear(this.x, position.x, this._lerpFactor);
        this.y = Phaser.Math.Linear(this.y, position.y, this._lerpFactor);
      }
      return;
    }
    this._targetPosition = position;
  }

}