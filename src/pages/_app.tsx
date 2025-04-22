import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { LiveKitProvider, MyVideoConference } from "@/components/LiveKit";
import { DeviceSelectionProvider } from "@/context/DeviceSelectionContext";
// import { MediaStreamProvider, useMediaStream } from "@/context/MediaStreamContext";
// import { DeviceSelectionProvider, useDeviceSelection } from "@/context/DeviceSelectionContext";

function AppContent({ Component, pageProps }: AppProps) {
    // const { cameraId, microphoneId } = useDeviceSelection();
    const router = useRouter();

    // useEffect(() => {
    //     // ✅ Redirect if no selection has been made (cameraId or microphoneId is null)
    //     if ((!cameraId || !microphoneId) && router.pathname !== "/camera-access") {
    //         router.push("/camera-access");
    //     }
    // }, [cameraId, microphoneId, router]);

    return (
        <>
         <Component {...pageProps} />
        </>
       
       
    );
   
}

// export default function App(props: AppProps) {
//     return (
//         <MediaStreamProvider>
//             <DeviceSelectionProvider>
//                 <AppContent {...props} />
//             </DeviceSelectionProvider>
//         </MediaStreamProvider>
//     );
// }
export default function App(props: AppProps) {
    return (
        <DeviceSelectionProvider>
            <LiveKitProvider>
                <AppContent {...props} />
            </LiveKitProvider>
        </DeviceSelectionProvider>

    );
}