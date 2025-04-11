import { GameObject } from '../../common/types';
import { BaseGameObjectComponent } from './base-game-object-component';

export class SpeedComponent extends BaseGameObjectComponent {
  private _speed: number;

  constructor(gameObject: GameObject, speed: number) {
    super(gameObject);
    this._speed = speed;
  }

  get speed(): number {
    return this._speed;
  }
}
