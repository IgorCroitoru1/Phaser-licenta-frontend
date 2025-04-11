import { GameObject } from '../../common/types';

export class BaseGameObjectComponent {
  protected scene: Phaser.Scene;
  protected gameObject: GameObject;

  constructor(gameObject: GameObject) {
    this.scene = gameObject.scene;
    this.gameObject = gameObject;
    this.assignComponentToObject(gameObject);
  }

  static getComponent<T>(gameObject: GameObject): T {
    return (gameObject as any)[`_${this.name}`] as T;
  }
  
  static removeComponent(gameObject: GameObject): void {
    delete (gameObject as any)[`_${this.name}`];
  }
  
  protected assignComponentToObject(object: GameObject | Phaser.Physics.Arcade.Body): void {
    (object as any)[`_${this.constructor.name}`] = this;
  }
  
}
