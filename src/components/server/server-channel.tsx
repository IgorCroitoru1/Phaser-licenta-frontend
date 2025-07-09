// import { cn } from "@/lib/utils";
// import { Channel, useChannelStore } from "@/store/useChannelStore";
// import { on } from "events";
// import { useParams, useRouter } from "next/navigation";
// import { useEffect } from "react";



// type Server = {
//     id: string;
// }

// interface ServerChannelProps {
//     channel: Channel;
  
//   }
// export function ServerChannel({
//     channel,
//   }: ServerChannelProps) {

//   const switchChannel = useChannelStore((state) => state.switchChannel);
//   const activeChannel = useChannelStore((state) => state.activeChannel);
//   const setActiveChannel = useChannelStore((state) => state.setActiveChannel);
//     //const { onOpen } = useModal();
  
  
//     // const onClick = () =>
//     //   router.push(`/servers/${params?.serverId}/channels/${channel.id}`);
  
//     // const onAction = (e: React.MouseEvent, action: ModalType) => {
//     //   e.stopPropagation();
  
//     //   onOpen(action, { channel, server });
//     // };
  
//     useEffect(() => {
//       return () => {
//         console.log("Unmounting channel", channel.id);
//         setActiveChannel(null);
//       }
//     }, []);
    
//     const onClick = async () => {
//       if (activeChannel?.id !== channel.id) {
//           const success = await switchChannel(channel);
//           if (success) {
//               setActiveChannel(channel);
//           }
//       }
//   };
   
//     return (
//       <button
//         className={cn(
//           "group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
//           activeChannel?.id === channel.id &&
//             "bg-zinc-700/20 dark:bg-zinc-700"
//         )}
//         onClick = {onClick}

//       >

//         <p
//           className={cn(
//             "line-clamp-1 font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition",
//             activeChannel?.id === channel.id &&
//               "text-zinc-600 group-hover:text-primary-400 dark:text-zinc-200 dark:group-hover:text-white"
//           )}
//         >
//           {channel.name}
//         </p>
       
//       </button>
//     );
//   }