import { Channel, useChannelStore } from "@/store/useChannelStore";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import React from "react";
import { Hash } from "lucide-react";

interface ServerChannelProps {
    channel: Channel;
  
  }

export function SidebarChannel({
    channel,
  }: ServerChannelProps) {

     const switchChannel = useChannelStore((state) => state.switchChannel);
    const activeChannel = useChannelStore((state) => state.activeChannel);
    const setActiveChannel = useChannelStore((state) => state.setActiveChannel);
    //const { onOpen } = useModal();
  
  
   
  
    // React.useEffect(() => {
    //   return () => {
    //     console.log("Unmounting channel", channel.id);
    //     setActiveChannel(null);
    //   }
    // }, []);
    
    const onClick = async () => {
      if (activeChannel?.id !== channel.id) {
          const success = await switchChannel(channel);
          console.log("Success", success);
          if (success) {
              setActiveChannel(channel);
          }
      }
  };
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild onClick={onClick} isActive={activeChannel?.id === channel.id}>
          <a className="cursor-pointer">
            <Hash/>
            {channel.name}
          </a>
          
        </SidebarMenuButton>
       </SidebarMenuItem>

    );
  }