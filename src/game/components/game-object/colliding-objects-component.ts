import { GameObject } from '../../common/types';
import { BaseGameObjectComponent } from './base-game-object-component';

export class CollidingObjectsComponent extends BaseGameObjectComponent {
  private _objects: GameObject[];

  constructor(gameObject: GameObject) {
    super(gameObject);
    this._objects = [];
  }

  get objects(): GameObject[] {
    return this._objects;
  }

  public add(gameObject: GameObject): void {
    this._objects.push(gameObject);
  }

  public reset(): void {
    this._objects = [];
  }
}
