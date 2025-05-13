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
import  SidebarCollapsibleGroup  from "./sidebar-collapsible-group";
import { SidebarChannel } from "./sidebar-channel";
import { Channel, useChannelStore } from "@/store/useChannelStore";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent } from "../ui/collapsible";
import { CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { ChannelGroupProps } from "./sidebar-collapsible-group";
import { NearbyUser, NearbyUses } from "./nearby-user";
import { ChannelUser } from "@/user/ChannelUser";
import { useNearbyUsers } from "@/hooks/useNearbyUsers";
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
  }
]

export function AppSidebar() {
  console.log("AppSidebar rerender");
    return (
        <Sidebar>
            <SidebarContent>
                
                 {/* <CollapsibleGroup name="Canale" /> */}
                <SidebarCollapsibleGroup name="Canale">
                             {channels.map((channel) => (
                    <SidebarChannel key={channel.id} channel={channel} />
                ))}
                </SidebarCollapsibleGroup>
               <NearbyUses/>
            </SidebarContent>
        </Sidebar>
    );
}





