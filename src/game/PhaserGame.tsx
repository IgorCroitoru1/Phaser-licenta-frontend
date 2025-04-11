import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import StartGame from './main';

import { EventBus } from './Events';
import Player from '../components/ui/Player';
import { MainMenu } from './scenes/MainMenu';
import GameConfig from '../../game-config';
import { useGameStore } from '@/store/useGameStore';
import { set } from 'react-hook-form';
import { stat } from 'fs';
import TestScene from './scenes/TestScene';
import { MyScene } from './scenes/MyScene';
import { Toaster } from '@/components/ui/toaster';

export interface IRefPhaserGame {
    game: Phaser.Game | null;
    scene: Phaser.Scene | null;
}

interface IProps {
    currentActiveScene?: (scene_instance: Phaser.Scene) => void;
    width?: number;
    height?: number;

}

export const PhaserGame = forwardRef<IRefPhaserGame, IProps>(function PhaserGame({ currentActiveScene }, ref) {
    const game = useRef<Phaser.Game | null>(null);
    const setGameLoaded = useGameStore((state) => state.setGameLoaded);
    const setSceneLoaded = useGameStore((state) => state.setSceneLoaded);
    const sceneLoaded = useGameStore((state) => state.sceneLoaded);
    const containerRef = useRef<HTMLDivElement>(null);
    const currentSceneRef = useRef<Phaser.Scene | null>(null);
    useLayoutEffect(() => {
        if (game.current === null) {
            game.current = StartGame("game-container");
            game.current.events.once('ready', () => {
                setGameLoaded(true);

            });
            if (typeof ref === 'function') {
                ref({ game: game.current, scene: null });
            } else if (ref) {
                ref.current = { game: game.current, scene: null };
            }
        }

        return () => {
            if (game.current) {
                game.current.destroy(true);
                game.current = null;
            }
        };
    }, [ref]);

    useEffect(() => {
        if (!containerRef.current) return;
        // Create a ResizeObserver to watch for changes
        const observer = new ResizeObserver((entries) => {
            if(game.current)
            { 
                for (let entry of entries) {
                if (entry.contentRect.width === 0 || entry.contentRect.height === 0) { 
                    console.log("ResizeObserver: width or height is 0, skipping resize");
                    return
                };
                if (currentSceneRef.current && currentSceneRef.current instanceof MyScene ) {
                    currentSceneRef.current.onResize();
                }
            }

            }
           
        });

        observer.observe(containerRef.current);

        return () => observer.disconnect(); // Cleanup observer on unmount
    },[]);

    useEffect(() => {
        const onSceneReady = (scene_instance: Phaser.Scene) => {
            if (currentActiveScene) {
                currentActiveScene(scene_instance);
            }

            if (typeof ref === 'function') {
                ref({ game: game.current, scene: scene_instance });
            } else if (ref) {
                ref.current = { game: game.current, scene: scene_instance };
            }
            currentSceneRef.current = scene_instance;
            setSceneLoaded(true);
            console.log("Scene Loaded PhaserGame.tsx", sceneLoaded);
            console.log("Scene Loaded PhaserGame.tsx", scene_instance);
        };

        EventBus.on('current-scene-ready', onSceneReady);

     

        return () => {
            EventBus.off('current-scene-ready', onSceneReady);
        };
    }, [currentActiveScene, ref]);

    return (
        <div ref={containerRef} id="game-container" style={{position: 'relative',  width: '100%', height: '100%', minHeight: '50px', minWidth: '50px'}}>
            {/* <Player ref={playerRef} id="player1" cameraStream={stream} /> */}
            <Toaster />
        </div>
    );
});
