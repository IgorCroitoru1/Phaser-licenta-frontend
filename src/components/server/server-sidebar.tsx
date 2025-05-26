// "use client";

// import { useRouter } from "next/navigation";
// import { UserGroup } from "./user-group"
// // import { GameManager } from "../ChannelManager";
// import { ScrollArea } from "../ui/scroll-area";
// import { Separator } from "../ui/separator";
// import { ServerSection } from "./server-section";
// import { Channel, useChannelStore } from "@/store/useChannelStore";
// import { ServerChannel } from "./server-channel";
// import toast from "react-hot-toast";
// import { useEffect } from "react";
// import { useColyseus } from "@/hooks/useColyseus";
// import { Button } from "../ui/custom_button";
// import { cn } from "@/lib/utils";
// import { NearbyUsersPanel } from "./NearbyUsersPanel";

// const channels: Channel[] = [
//     {
//       id: "1",
//       name: "General",
//       sceneName: "TestScene",
//       colyseusRoomName: "game_room",
//       mapName: "office-1",
//       livekitRoomName: "game_room",
//     },
//     {
//       id: "2",
//       name: "Sala",
//       sceneName: "MainMenu",
//       colyseusRoomName: "game_room2",
//       mapName: "office-1",
//       livekitRoomName: "game_room2",
//     },
//     // {
//     //   id: "3",
//     //   name: "voice-chat",
//     //   sceneName: "TestScene",
//     //   colyseusRoomName: "game_room2"
//     // },
//   ];



// export function ServerSidebar({ serverId }: { serverId?: string }) {
//   const router = useRouter();
//   const nearbyUsers = useChannelStore((state) => state.nearbyUsers);
//   const debugNearbyUsers = useChannelStore((state) => state.debugNearbyUsers);
//   return (
//     <div className="flex flex-col h-full text-zinc-600 dark:bg-[#2b2d31] bg-[#f2f3f5]">
//       <ScrollArea className="flex-1 px-2">
//         <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2" />
        
//         {!!channels?.length && (
//           <div className="mb-2">
//             <ServerSection sectionType="channels" label="Canale" />
//             <div className="space-y-[2px]">
//               {channels.map((channel) => (
//                 <ServerChannel key={channel.id} channel={channel} />
//               ))}
//             </div>
//             <button
//               onClick={() => toast("Coming soon!")}
//               className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//             >
//               Add Channel
//             </button>
//           </div>
//         )}

//         <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2" />
//         <div>
//         <NearbyUsersPanel/>
//           <ServerSection sectionType="members" label="Membri" />
//           <div className="space-y-[2px]">
//             {Array.from(debugNearbyUsers.entries()).map(([key, valueSet]) => (
//               <div key={key} className="flex flex-col gap-y-2">
//               <p className="text-sm font-semibold">{key}</p>
//               <div className="pl-4">
//               {Array.from(valueSet).map((user) => (
//                 <p key={user} className="text-sm">{user}</p>
//             ))}
//           </div>
//               </div>
//             ))}
//           </div>
//         </div>
       
//       </ScrollArea>
//     </div>
//   );
// }
