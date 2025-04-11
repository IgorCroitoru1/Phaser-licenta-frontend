import { forwardRef, useEffect, useRef } from "react";
import GameConfig from "../../../game-config";

interface PlayerProps {
    cameraStream: MediaStream | null;
    id:any
}

const Player = forwardRef<HTMLDivElement, PlayerProps>(({ cameraStream, id }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
      if (videoRef.current && cameraStream) {
          videoRef.current.srcObject = cameraStream;
          videoRef.current.play();
      }
  }, [cameraStream]);

  return (
      <div ref={ref} id= {id}
      className="absolute rounded-2xl bg-white shadow-lg z-0 "

      
      style={{ width: GameConfig.playerWidth, height: GameConfig.playerHeight }}
      
      >
          {cameraStream ? (
              <video ref={videoRef} className="w-full h-full object-cover rounded-2xl z-1" autoPlay playsInline muted />
          ) : (
              <div className="flex items-center justify-center rounded-2xl h-full text-gray-500">Camera Off</div>
          )}
            <div
                className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 bg-black text-white text-[8px] px-2 py-1 rounded-2xl 
                        w-[60px] overflow-hidden whitespace-nowrap text-ellipsis text-center"
                style={{ minWidth: `${GameConfig.playerWidth}px` }}
                title="Player Name"
            >
                Igor Croitoruxczxczcxxzc
            </div>

      </div>
  );
});

Player.displayName = "Player";
export default Player;



