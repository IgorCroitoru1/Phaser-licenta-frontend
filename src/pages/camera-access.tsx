// import { useState, useEffect } from "react";
// import { useRouter } from "next/router";
// import { useDeviceSelection } from "@/context/DeviceSelectionContext";
// import { useMediaStream } from "@/context/MediaStreamContext";
// import { Button } from "@/components/ui/button";
// import { Button as CustomButton } from "@/components/ui/custom_button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// export default function CameraAccessPage() {
//   const {
//     cameraId,
//     microphoneId,
//     setCameraId,
//     setMicrophoneId,
//     availableCameras,
//     availableMicrophones,
//     setAvailableCameras,
//     setAvailableMicrophones,
//   } = useDeviceSelection();

//   const { setStream } = useMediaStream();
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [permissionsGranted, setPermissionsGranted] = useState(false);
//   const router = useRouter();

//   // ✅ Check for existing permissions when component mounts
//   useEffect(() => {
//     navigator.mediaDevices.enumerateDevices().then((devices) => {
//       const cameras = devices.filter((device) => device.kind === "videoinput"&&device.deviceId !== "");
//       const microphones = devices.filter(
//         (device) => device.kind === "audioinput" && device.deviceId !== ""
//       );
//       console.log(cameras);
//       console.log(microphones);
//       if (cameras.length > 0 || microphones.length > 0) {
//         setAvailableCameras(cameras);
//         setAvailableMicrophones(microphones);
//         setPermissionsGranted(true);
//       }
//     });
//   }, []);

//   // ✅ Function to request permissions and get devices
//   const requestPermissions = async () => {
//     setLoading(true); // Start loading
//     try {
//       await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//       const devices = await navigator.mediaDevices.enumerateDevices();
//       const cameras = devices.filter((device) => device.kind === "videoinput");
//       const microphones = devices.filter(
//         (device) => device.kind === "audioinput"
//       );

//       setAvailableCameras(cameras);
//       setAvailableMicrophones(microphones);
//       setPermissionsGranted(true);
//     } catch (err) {
//       setError(
//         "Camera and microphone access denied. Please enable permissions."
//       );
//     }
//     setLoading(false); // Stop loading
//   };

//   // ✅ Function to request media access
//   const requestAccess = async () => {
//     if (!cameraId || !microphoneId) {
//       setError("Please select a camera and a microphone.");
//       return;
//     }

//     try {
//       const constraints: MediaStreamConstraints = {};

//       if (cameraId !== "off") {
//         constraints.video = { deviceId: cameraId };
//       }
//       if (microphoneId !== "off") {
//         constraints.audio = { deviceId: microphoneId };
//       }

//       if (constraints.video || constraints.audio) {
//         const userStream = await navigator.mediaDevices.getUserMedia(
//           constraints
//         );
//         setStream(userStream);
//       }
//       router.push("/"); // Redirect to the game page
//     } catch (err) {
//       setError(
//         "Camera and microphone access denied. Please enable permissions."
//       );
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center h-screen space-y-4">
//       <h1 className="text-2xl font-bold">Slectează Camera & Microfon</h1>

//       {!permissionsGranted ? (
//         <div className="flex flex-col items-center space-y-4">
         
//           <CustomButton
//             isLoading={loading} // ✅ Use isLoading prop to show a spinner
//             className="w-80 text-white"
//             onClick={requestPermissions}
//           >
//             {loading ? "Solocitare..." : "Solocita accesul la camera & microfon"}
//           </CustomButton>
//         </div>
//       ) : (
//         <>
//           {/* Camera Selection */}
//           <div className="w-80">
//             <label className="block text-gray-700 mb-1">Camera</label>
//             <Select onValueChange={setCameraId} value={cameraId || undefined}>
//               <SelectTrigger className="w-full">
//                 <SelectValue placeholder="Select a camera" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem key="off" value="off">
//                   Turn Off Camera
//                 </SelectItem>
//                 {availableCameras
//                   .filter((device) => device.deviceId.trim() !== "")
//                   .map((device) => (
//                     <SelectItem key={device.deviceId} value={device.deviceId}>
//                       {device.label.trim() !== ""
//                         ? device.label
//                         : `Camera ${device.deviceId}`}
//                     </SelectItem>
//                   ))}
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Microphone Selection */}
//           <div className="w-80">
//             <label className="block text-gray-700 mb-1">Microfon</label>
//             <Select onValueChange={setMicrophoneId} value={microphoneId || undefined}>
//               <SelectTrigger className="w-full">
//                 <SelectValue placeholder="Select a microphone" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem key="off" value="off">
//                   Turn Off Microphone
//                 </SelectItem>
//                 {availableMicrophones
//                   .filter((device) => device.deviceId.trim() !== "")
//                   .map((device) => (
//                     <SelectItem key={device.deviceId} value={device.deviceId}>
//                       {device.label || `Microphone ${device.deviceId}`}
//                     </SelectItem>
//                   ))}
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Continue Button */}
//           <Button className="w-80 text-white" onClick={requestAccess}>
//             Continue to Game
//           </Button>
//         </>
//       )}

//       {error && <p className="text-red-500 mt-2">{error}</p>}
//     </div>
//   );
// }
