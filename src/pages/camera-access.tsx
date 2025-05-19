"use client"
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useDeviceSelection } from "@/context/DeviceSelectionContext";
import { createLocalVideoTrack, createLocalAudioTrack } from "livekit-client";
// import { useMediaStream } from "@/context/MediaStreamContext";
import { Button } from "@/components/ui/button";
import { Button as CustomButton } from "@/components/ui/custom_button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {  useDeviceStore } from "@/store/useChannelStore";
import { permanentRedirect } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function CameraAccessPage() {
  const {
    cameraId,
    microphoneId,
    setCameraId,
    setMicrophoneId,
    availableCameras,
    availableMicrophones,
    setAvailableCameras,
    setAvailableMicrophones,
    permissionsGranted,
    setPermissionsGranted
  } = useDeviceStore();
  const accessToken = useAuthStore().accessToken;
  // console.log("accessToken", accessToken);
//   const { setStream } = useMediaStream();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [localCameraId, setLocalCameraId] = useState<string | null>("off");
  const [localMicrophoneId, setLocalMicrophoneId] = useState<string | null>("off");
  // const [devicesPermissionsGranted, setDevicesPermissionsGranted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // ✅ Check for existing permissions when component mounts
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const cameras = devices.filter((device) => device.kind === "videoinput"&&device.deviceId !== "");
      const microphones = devices.filter(
        (device) => device.kind === "audioinput" && device.deviceId !== ""
      );
      console.log(cameras);
      console.log(microphones);
      if (cameras.length > 0 || microphones.length > 0) {
        setAvailableCameras(cameras);
        setAvailableMicrophones(microphones);
        setPermissionsGranted(true);
      }
    });
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, []);

  const onAudioSelectChange = async (value: string) => {
    setLocalMicrophoneId(value);
    //localAudioTrack?.stop(); // Stop the previous audio track if it exists
    if (value === 'off') {
      //setLocalAudioTrack(null);
      return;
    }

    try {
      // const audioTrack = await createLocalAudioTrack({
      //   deviceId: { exact: value },
      // });
      //setLocalAudioTrack(audioTrack);
    } catch (err: any) {
      console.error("⚠️ Could not start audio track:", err);

      if (err.name === "OverconstrainedError") {
        alert("Selected microphone is not available. Please choose another.");
      }

      // Optional: reset to off
      setLocalMicrophoneId("off");
      //setLocalAudioTrack(null);
    }
  };

  const onVideoSelectChange = async (value: string) => {
    setLocalCameraId(value);
    //localVideoTrack?.stop(); // Stop the previous video track if it exists
    if (value === 'off') {
      //setLocalVideoTrack(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      return;
    }
  
    try {
      const videoTrack = await createLocalVideoTrack({
        deviceId: { exact: value },
        resolution: {
          width: 1280,
          height: 720,
        }
      });
  
      //setLocalVideoTrack(videoTrack);
  
      if (videoRef.current) {
        const mediaStream = new MediaStream([videoTrack.mediaStreamTrack]);
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.error("⚠️ Could not start video track:", err);
  
      if (err.name === "OverconstrainedError") {
        alert("Selected camera is not available. Please choose another.");
      }
  
      // Optional: reset to off
      setLocalCameraId("off");
      //setLocalVideoTrack(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };
  
  // ✅ Function to request permissions and get devices
  const requestPermissions = async () => {
    setLoading(true); // Start loading
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((device) => device.kind === "videoinput");
      const microphones = devices.filter(
        (device) => device.kind === "audioinput"
      );

      setAvailableCameras(cameras);
      setAvailableMicrophones(microphones);
      setPermissionsGranted(true);
      
    } catch (err) {
    setError(
      "Accesul la cameră și microfon a fost refuzat. Te rugăm să activezi permisiunile."
    );
    }
    setLoading(false); // Stop loading
  };

  // ✅ Function to request media access
  const goNext = async () => {
    if (!localCameraId || !localMicrophoneId) {
    setError("Te rugăm să selectezi o cameră și un microfon.");
      return;
    }

     try {

      setCameraId(localCameraId);
      setMicrophoneId(localMicrophoneId);
    } catch (err) {
      setError(
        "Accesul la cameră și microfon a fost refuzat. Te rugăm să activezi permisiunile."
      );
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      {localCameraId !== 'off' && (
        <div className="w-40 h-40 rounded-lg overflow-hidden border border-gray-300 shadow-md">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
          />
        </div>
      )}
      <h1 className="text-2xl font-bold">Slectează Camera & Microfon</h1>

      {!permissionsGranted ? (
        <div className="flex flex-col items-center space-y-4">
         
          <CustomButton
            isLoading={loading} // ✅ Use isLoading prop to show a spinner
            className="w-80 text-white"
            onClick={requestPermissions}
          >
            {loading ? "Solocitare..." : "Solocita accesul la camera & microfon"}
          </CustomButton>
        </div>
      ) : (
        <>
          {/* Camera Selection */}
          <div className="w-80">
            <label className="block text-gray-700 mb-1">Camera</label>
            <Select onValueChange={onVideoSelectChange} value={localCameraId || "off"}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a camera" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="off" value="off">
                  Turn Off Camera
                </SelectItem>
                {availableCameras
                  .filter((device) => device.deviceId.trim() !== "")
                  .map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label.trim() !== ""
                        ? device.label
                        : `Camera ${device.deviceId}`}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Microphone Selection */}
          <div className="w-80">
            <label className="block text-gray-700 mb-1">Microfon</label>
            <Select onValueChange={onAudioSelectChange} value={localMicrophoneId || "off"}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a microphone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="off" value="off">
                  Turn Off Microphone
                </SelectItem>
                {availableMicrophones
                  .filter((device) => device.deviceId.trim() !== "")
                  .map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label || `Microphone ${device.deviceId}`}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Continue Button */}
          <Button className="w-80 text-white" onClick={goNext}>
            Continue to Game
          </Button>
        </>
      )}

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
