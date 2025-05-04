"use client"
import { LocalAudioTrack, LocalVideoTrack } from "livekit-client";
import { createContext, useContext, useState, useEffect } from "react";

interface DeviceSelectionContextType {
    cameraId: string | null;
    microphoneId: string | null;
    setCameraId: (id: string) => void;
    setMicrophoneId: (id: string) => void;
    availableCameras: MediaDeviceInfo[];
    availableMicrophones: MediaDeviceInfo[];
    localVideoTrack: LocalVideoTrack | null;    
    localAudioTrack: LocalAudioTrack | null;
    setLocalVideoTrack: (track: LocalVideoTrack | null) => void;
    setLocalAudioTrack: (track: LocalAudioTrack | null) => void;
    setAvailableCameras: (cameras: MediaDeviceInfo[]) => void;
    setAvailableMicrophones: (microphones: MediaDeviceInfo[]) => void;
    devicePermissionGranted: boolean;
    setDevicePermissionsGranted: (v: boolean) => void;
    
}

const DeviceSelectionContext = createContext<DeviceSelectionContextType | undefined>(undefined);

export const DeviceSelectionProvider = ({ children }: { children: React.ReactNode }) => {
    const [devicePermissionGranted, setDevicePermissionsGranted] = useState(false);

    const [cameraId, setCameraId] = useState<string | null>(null);
    const [microphoneId, setMicrophoneId] = useState<string | null>(null);
    const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
    const [availableMicrophones, setAvailableMicrophones] = useState<MediaDeviceInfo[]>([]);
    const [localVideoTrack, setLocalVideoTrack] = useState<LocalVideoTrack | null>(null);
    const [localAudioTrack, setLocalAudioTrack] = useState<LocalAudioTrack | null>(null);
    useEffect(() => {
        // navigator.mediaDevices.enumerateDevices().then((devices) => {
        //     setAvailableCameras(devices.filter((device) => device.kind === "videoinput"));
        //     setAvailableMicrophones(devices.filter((device) => device.kind === "audioinput"));
        // });
    }, []);

    return (
        <DeviceSelectionContext.Provider
         value={{ 
            setLocalVideoTrack,
            setLocalAudioTrack,
            localAudioTrack,
            localVideoTrack, 
            devicePermissionGranted,
            setDevicePermissionsGranted,
            cameraId, 
            microphoneId, 
            setCameraId,
            setMicrophoneId, 
            availableCameras, 
            availableMicrophones, 
            setAvailableCameras, 
            setAvailableMicrophones }}>
            {children}
        </DeviceSelectionContext.Provider>
    );
};

export const useDeviceSelection = () => {
    const context = useContext(DeviceSelectionContext);
    if (!context) {
        throw new Error("useDeviceSelection must be used within a DeviceSelectionProvider");
    }
    return context;
};
