import { Channel, useChannelStore } from "@/store/useChannelStore";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import React from "react";
import { Hash, Settings } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

interface ServerChannelProps {
    channel: Channel;
    userCount?: number;
    onChannelUpdateRequest?: (channel: Channel) => void;
  }

export function SidebarChannel({
    channel,
    userCount = 0,
    onChannelUpdateRequest,
  }: ServerChannelProps) {

     const switchChannel = useChannelStore((state) => state.switchChannel);
    const activeChannel = useChannelStore((state) => state.activeChannel);
    const setActiveChannel = useChannelStore((state) => state.setActiveChannel);
    const user = useAuthStore((state) => state.user);
    
    const [isHovered, setIsHovered] = React.useState(false);
    
    // Check if current user is admin (you can adjust this logic based on your role system)
    const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('ADMIN');
    
    const onClick = async (e: React.MouseEvent) => {
      // Prevent channel switching when clicking settings
      if ((e.target as HTMLElement).closest('.settings-button')) {
        return;
      }
      
      if (activeChannel?.id !== channel.id) {
          const success = await switchChannel(channel);
          if (success) {
              setActiveChannel(channel);
          }
      }
  };
    const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChannelUpdateRequest?.(channel);
  };return (
      <SidebarMenuItem>
        <SidebarMenuButton 
          asChild 
          onClick={onClick} 
          isActive={activeChannel?.id === channel.id}
        >
          <a 
            className="cursor-pointer relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Hash/>
            {channel.name}
            {!isHovered ? (
              <span className="ml-auto text-xs text-muted-foreground">
                {`${userCount}/${channel.maxUsers}`}
              </span>
            ) : isAdmin ? (
              <button
                className="settings-button ml-auto p-1 hover:bg-gray-200 rounded-sm transition-colors"
                onClick={handleSettingsClick}
                title="Setări canal"
              >
                <Settings className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            ) : (
              <span className="ml-auto text-xs text-muted-foreground">
                {`${userCount}/${channel.maxUsers}`}
              </span>
            )}
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }