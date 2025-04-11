import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import TestScene from './scenes/TestScene';
import { MyScene } from './scenes/MyScene';
//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: window.innerWidth,  // Use full window width
    height: window.innerHeight, // Use full window height
    parent: 'game-container',
    backgroundColor: '#213433',
    scene: [
        Boot,
        Preloader,
        //MyScene
      //  TestScene,
        //MainMenu,
    ],
    scale: {
        mode: Phaser.Scale.RESIZE, // ✅ Makes game resize automatically
       // autoCenter: Phaser.Scale.CENTER_BOTH, // ✅ Centers the game
    },
   
    // fps:{
    //     target:1
    // }
   
};

const StartGame = (parent: string) => {
    config.width = window.innerWidth;
    config.height = window.innerHeight;
    const game = new Game({ ...config, parent });
    // window.addEventListener('resize', () => {
    //     game.scale.resize(window.innerWidth, window.innerHeight);
    // });

    return game;

}

export default StartGame;
