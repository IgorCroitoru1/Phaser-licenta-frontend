// import { createContext, useContext, useState, useEffect } from "react";

// interface MediaStreamContextType {
//     stream: MediaStream | null;
//     setStream: (stream: MediaStream) => void;
    
// }

// const MediaStreamContext = createContext<MediaStreamContextType | undefined>(undefined);

// export const MediaStreamProvider = ({ children }: { children: React.ReactNode }) => {
//     const [stream, setStream] = useState<MediaStream | null>(null);

//     return (
//         <MediaStreamContext.Provider value={{ stream, setStream }}>
//             {children}
//         </MediaStreamContext.Provider>
//     );
// };

// export const useMediaStream = () => {
//     const context = useContext(MediaStreamContext);
//     if (!context) {
//         throw new Error("useMediaStream must be used within a MediaStreamProvider");
//     }
//     return context;
// };
