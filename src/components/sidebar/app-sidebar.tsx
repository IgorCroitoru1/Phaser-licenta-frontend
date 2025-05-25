import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import SidebarCollapsibleGroup from "./sidebar-collapsible-group";
import { SidebarChannel } from "./sidebar-channel";
import { Channel, useChannelStore } from "@/store/useChannelStore";
import { ChevronDown, Plus } from "lucide-react";
import { Collapsible, CollapsibleContent } from "../ui/collapsible";
import { CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { ChannelGroupProps } from "./sidebar-collapsible-group";
import { NearbyUses, OnlineUsers } from "./users";
import { ChannelUser } from "@/user/ChannelUser";
import { useNearbyUsers } from "@/hooks/useNearbyUsers";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { ChevronsUpDown } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { ChannelCreationDialog } from "../channel-creation-dialog";
import React from "react";

const channels: Channel[] = [
    {
        id: "1",
        name: "General",
        sceneName: "TestScene",
        colyseusRoomName: "game_room",
        mapName: "office-1",
        livekitRoomName: "game_room",
    },
    {
        id: "2",
        name: "Sala",
        sceneName: "MainMenu",
        colyseusRoomName: "game_room2",
        mapName: "office-1",
        livekitRoomName: "game_room2",
    },
    // {
    //   id: "3",
    //   name: "voice-chat",
    //   sceneName: "TestScene",
    //   colyseusRoomName: "game_room2"
    // },
];
const nearbyUsers: ChannelUser[] = [
    {
        id: "1",
        name: "John Doe",
        avatar: "",
        email: "user@mail.com",
        isLocal: false,
        currentZoneId: 1,
    },
    {
        id: "2",
        name: "Jane Smith",
        avatar: "",
        email: "jane@mail.com",
        isLocal: false,
        currentZoneId: 1,
    },
    {
        id: "3",
        name: "Alex Johnson",
        avatar: "",
        email: "alex@mail.com",
        isLocal: false,
        currentZoneId: 2,
    },
];

export function AppSidebar() {
    const [isChannelDialogOpen, setIsChannelDialogOpen] = React.useState(false);
    const user = useAuthStore((state) => state.user);
    
    // Check if user has admin role
    const isAdmin = user?.roles?.includes('admin') || false;

    return (
        <>
            <Sidebar>
              <SidebarHeader>
                <SidebarMenu>
                  <SidebarMenuItem>                    
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                          <SidebarMenuButton className="text-lg font-medium">
                              Salut
                              <ChevronsUpDown className="ml-auto" />
                          </SidebarMenuButton>
                      </DropdownMenuTrigger><DropdownMenuContent 
                        className="w-56" 
                        side="right"
                        avoidCollisions={true}
                        collisionPadding={8}
                      >
                        <DropdownMenuLabel>Setari</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                          <DropdownMenuItem>
                              <span>Acme Inc</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                              <span>Acme Corp.</span>
                          </DropdownMenuItem>
                          
                          {isAdmin && (
                              <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                      onClick={() => setIsChannelDialogOpen(true)}
                                      className="cursor-pointer"
                                  >
                                      <Plus className="mr-2 h-4 w-4" />
                                      <span>Adauga canal</span>
                                  </DropdownMenuItem>
                              </>
                          )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
              </SidebarHeader>
                <SidebarContent>
                    {/* <CollapsibleGroup name="Canale" /> */}
                    <SidebarCollapsibleGroup name="Canale">
                        {channels.map((channel) => (
                            <SidebarChannel key={channel.id} channel={channel} />
                        ))}
                    </SidebarCollapsibleGroup>
                    <NearbyUses />
                    <OnlineUsers />
                </SidebarContent>
            </Sidebar>
            
            {/* Channel Creation Dialog */}
            <ChannelCreationDialog 
                open={isChannelDialogOpen} 
                onOpenChange={setIsChannelDialogOpen} 
            />
        </>
    );
}
