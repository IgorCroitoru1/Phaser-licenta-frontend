import GameConfig from "../../game-config";

export class UserRefsManager {
  private refs = new Map<string, {
    element: HTMLDivElement,
    worldX: number,
    worldY: number,
    hasReceivedUpdate: boolean
  }>();

  private _camera = {
    worldX: 0,
    worldY: 0,
    zoom: 1,
    scrollX: 0,
    scrollY: 0,
  };
  rafPending: boolean = false;

  get camera() {
    return this._camera;
  }
  getRef(id: string) {
    return this.refs.get(id);
  }  // Register a new user element with world coordinates
  register(id: string, element: HTMLDivElement, worldX: number, worldY: number) {
    this.refs.set(id, { element, worldX, worldY, hasReceivedUpdate: false });
    // Initially hide the element
    element.style.visibility = 'hidden';
    this.updateElement(id);
  }
  // Update user's world position
  updateWorldPosition(id: string, worldX: number, worldY: number) {
    const data = this.refs.get(id);
    if (!data) return;
    
    data.worldX = worldX;
    data.worldY = worldY;
    data.hasReceivedUpdate = true;
    this.updateElement(id);
  }

  // Update camera parameters
  updateCamera(worldX: number, worldY: number, scrollX: number, scrollY: number, zoom: number) {
    this._camera = { worldX, worldY, scrollX, scrollY, zoom };
    this.updateAllElements();
      // 2. Use requestAnimationFrame for smooth sync
    if (!this.rafPending) {
      this.rafPending = true;
      requestAnimationFrame(() => {
        this.updateAllElements();
        this.rafPending = false;
      });
  }
  }

  // Unregister a user
  unregister(id: string) {
    this.refs.delete(id);
  }
  // Private helper to update a single element's transform
  private updateElement(id: string) {
    const data = this.refs.get(id);
    if (!data) return;

    const { element, worldX, worldY, hasReceivedUpdate } = data;
    
    // Keep element invisible until it receives its first coordinate update
    if (!hasReceivedUpdate) {
      element.style.visibility = 'hidden';
      return;
    }
    
    // Make element visible once coordinates are received
    element.style.visibility = 'visible';
    
    const { worldX: camX, worldY: camY, scrollX, scrollY, zoom } = this._camera;

    const screenX = (worldX - camX) * zoom;
    const screenY = (worldY - camY) * zoom;
    //console.log("RefManager: Player screen coords: ", "playerX: ", worldX, "playerY: ", worldY, "screenX: ", screenX, "screenY: ", screenY);

    element.style.transform = `translate(${screenX}px, ${screenY}px) scale(${zoom})`;
  }

  // Update all registered elements
  private updateAllElements() {
    this.refs.forEach((_, id) => this.updateElement(id));
  }
}

export const userRefsManager = new UserRefsManager();