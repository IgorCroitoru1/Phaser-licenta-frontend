import { useEffect, useRef, useState } from 'react';
import { IRefPhaserGame, PhaserGame } from './game/PhaserGame';
import { MainMenu } from './game/scenes/MainMenu';
import { EventBus } from './game/Events';
import TestScene from './game/scenes/TestScene';
import GameConfig from '../game-config';
import { ChannelManager } from './components/ChannelManager';
import { ServerSidebar } from './components/server/server-sidebar';
function App()
{
    // The sprite can only be moved in the MainMenu Scene

    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const changeScene = () => {

        if(phaserRef.current)
        {     
            const scene = phaserRef.current.scene as MainMenu;
            
            if (scene)
            {
                //scene.changeScene();
            }
        }
    }
    useEffect(() => {
        
        // EventBus.on(GameConfig.eventBusPlayerMoved, ({x,y,zoom}: {x: number, y: number, zoom: number}) => {
        //     setSpritePosition({ x, y, zoom });
        // });
    }, []);
    

   

    // Event emitted from the PhaserGame component
    const currentScene = (scene: Phaser.Scene) => {

       // setCanMoveSprite(scene.scene.key !== 'TestScene');
        
    }

    return (
        <div id="app" className="flex h-screen" >
             <div className="w-64 bg-gray-800 text-white">
            <ServerSidebar />
            </div>
            <ChannelManager/>
            {/* <div>
                <div>
                    <button className="button" onClick={changeScene}>Change Scene</button>
                </div>
                <div>
                    <button disabled={canMoveSprite} className="button" onClick={moveSprite}>Toggle Movement</button>
                </div>
                <div className="spritePosition">Sprite Position:
                    <pre>{`{\n  x: ${spritePosition.x.toFixed(2)}\n  y: ${spritePosition.y.toFixed(2)}\n zoom: ${spritePosition.zoom.toFixed(2)}\n}`}</pre>
                </div>
                <div>
                    <button className="button" onClick={addSprite}>Add New Sprite</button>
                </div>
            </div> */}
        </div>
    )
}

export default App
