import { Door } from "./door";

type DoorPairConfig = {
    scene: Phaser.Scene;
    openSprite: Door;
    closedSprite: Door;
    zoneId: number;
  };
  
  export class DoorGroup {
    private scene: Phaser.Scene;
    private openDoor: Door;
    private closedDoor: Door;
    private zoneId: number;
    private isOpen: boolean = false;
  
    constructor(config: DoorPairConfig) {
      this.scene = config.scene;
      this.openDoor = config.openSprite;
      this.closedDoor = config.closedSprite;
      this.zoneId = config.zoneId;
  
      this.setupSprites();
      this.setClosed();
    }
  
    private setupSprites(): void {
      this.scene.physics.add.existing(this.closedDoor, true);
      this.closedDoor.setVisible(true);
      this.openDoor.setVisible(false);
    }
  
    public open(): void {
      this.isOpen = true;
      this.openDoor.setVisible(true);
      this.closedDoor.setVisible(false);
      const body = this.closedDoor.body as Phaser.Physics.Arcade.Body;
      body.enable = false;
    }
  
    public close(): void {
      this.isOpen = false;
      this.openDoor.setVisible(false);
      this.closedDoor.setVisible(true);
      const body = this.closedDoor.body as Phaser.Physics.Arcade.Body;
      body.enable = true;
    }
  
    public toggle(): void {
      this.isOpen ? this.close() : this.open();
    }
  
    public setClosed(): void {
      this.close();
    }
  
    public getZoneId(): number {
      return this.zoneId;
    }
  
    public destroy(): void {
      this.openDoor.destroy();
      this.closedDoor.destroy();
    }
  }
  