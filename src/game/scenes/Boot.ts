import { Scene } from 'phaser';
import { ASSET_PACK_KEYS } from '../common/assets';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.
        // this.load.image('wood-floor', 'tiles/wood-floor.png')
        // this.load.image('white-wall', 'tiles/white-wall.png')
        // this.load.image('dry-wall', 'tiles/dry-wall.png')
        // this.load.image('x-floor', 'tiles/x-floor.png')
        // this.load.image("wall", "tiles/wall.png");
        // this.load.image("grass", "tiles/grass.png");
        // this.load.image("flowers", "tiles/flowers.png");
        // this.load.image("wood-floor-100px", "tiles/wood-floor-100px.png");
        // this.load.tilemapTiledJSON('map', 'tiles/map.json');
        // this.load.tilemapTiledJSON('test', 'tiles/test.json');

        //this.load.image('background', 'assets/bg.png');
    }

    create ()
    {
        this.scene.start('Preloader');
    }
}
