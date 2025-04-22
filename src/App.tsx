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
