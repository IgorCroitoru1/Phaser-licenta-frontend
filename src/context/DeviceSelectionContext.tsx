// import { createContext, useContext, useState, useEffect } from "react";

// interface DeviceSelectionContextType {
//     cameraId: string | null;
//     microphoneId: string | null;
//     setCameraId: (id: string) => void;
//     setMicrophoneId: (id: string) => void;
//     availableCameras: MediaDeviceInfo[];
//     availableMicrophones: MediaDeviceInfo[];
//     setAvailableCameras: (cameras: MediaDeviceInfo[]) => void;
//     setAvailableMicrophones: (microphones: MediaDeviceInfo[]) => void;
// }

// const DeviceSelectionContext = createContext<DeviceSelectionContextType | undefined>(undefined);

// export const DeviceSelectionProvider = ({ children }: { children: React.ReactNode }) => {
//     const [cameraId, setCameraId] = useState<string | null>(null);
//     const [microphoneId, setMicrophoneId] = useState<string | null>(null);
//     const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
//     const [availableMicrophones, setAvailableMicrophones] = useState<MediaDeviceInfo[]>([]);

//     useEffect(() => {
//         navigator.mediaDevices.enumerateDevices().then((devices) => {
//             setAvailableCameras(devices.filter((device) => device.kind === "videoinput"));
//             setAvailableMicrophones(devices.filter((device) => device.kind === "audioinput"));
//         });
//     }, []);

//     return (
//         <DeviceSelectionContext.Provider value={{ cameraId, microphoneId, setCameraId, setMicrophoneId, availableCameras, availableMicrophones, setAvailableCameras, setAvailableMicrophones }}>
//             {children}
//         </DeviceSelectionContext.Provider>
//     );
// };

// export const useDeviceSelection = () => {
//     const context = useContext(DeviceSelectionContext);
//     if (!context) {
//         throw new Error("useDeviceSelection must be used within a DeviceSelectionProvider");
//     }
//     return context;
// };
