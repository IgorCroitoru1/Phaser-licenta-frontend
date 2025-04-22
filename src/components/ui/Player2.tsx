import { useEffect, useRef } from 'react';
import { Participant, Track, VideoTrack } from 'livekit-client';
import { isTrackReference, TrackReferenceOrPlaceholder } from '@livekit/components-react';

type PlayerVideoProps = {
  trackRef: TrackReferenceOrPlaceholder;
  width?: number;
  height?: number;
};

export const PlayerVideo = ({ trackRef, width = 120, height = 90 }: PlayerVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isTrackReference(trackRef)) return;

    const mediaStream = new MediaStream([trackRef.publication.track?.mediaStreamTrack!]);
    if (videoRef.current && trackRef.publication.isSubscribed) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current
        .play()
        .catch((e) => console.warn('play() failed', e));
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [trackRef]);

  return (
    <div className="rounded bg-gray-100 relative shadow-md" style={{ width, height }}>
      {isTrackReference(trackRef) && trackRef.publication.isSubscribed ? (
        <video
          ref={videoRef}
          autoPlay
          muted={trackRef.participant.isLocal}
          playsInline
          className="w-full h-full object-cover rounded"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
          No Camera
        </div>
      )}
    </div>
  );
};

export default PlayerVideo;
