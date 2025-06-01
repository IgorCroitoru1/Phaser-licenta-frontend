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
import { ChevronDown, ChevronUp, Plus, User2 } from "lucide-react";
import { Collapsible, CollapsibleContent } from "../ui/collapsible";
import { CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { ChannelGroupProps } from "./sidebar-collapsible-group";
import { CurrentUser, NearbyUses, OnlineUsers } from "./users";
import { ChannelUser } from "@/user/ChannelUser";
import { useNearbyUsers } from "@/hooks/useNearbyUsers";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { ChevronsUpDown } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { ChannelCreationDialog } from "../channel-creation-dialog";
import { ChannelUpdateDialog } from "../channel-update-dialog";
import { getAllChannels } from "@/services/channelService";
import ChannelsList, { ChannelsListRef } from "../ChannelsList";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function AppSidebar() {
    const [isChannelDialogOpen, setIsChannelDialogOpen] = React.useState(false);
    const [channelToUpdate, setChannelToUpdate] = React.useState<Channel | null>(null);
    const [isChannelUpdateDialogOpen, setIsChannelUpdateDialogOpen] = React.useState(false);
    const channelsListRef = React.useRef<ChannelsListRef>(null);
    const user = useAuthStore((state) => state.user);
    
    // Check if user has admin role
    const isAdmin = user?.roles?.includes('admin') || false;    // Refresh channels when dialog closes (channel might have been created)
    const handleChannelDialogChange = async (open: boolean) => {
        setIsChannelDialogOpen(open);
        // If dialog is closing, refresh the channels list
        if (!open && channelsListRef.current) {
            await channelsListRef.current.refreshChannels();
        }
    };

    // Handle channel update request from SidebarChannel
    const handleChannelUpdateRequest = (channel: Channel) => {
        setChannelToUpdate(channel);
        setIsChannelUpdateDialogOpen(true);
    };    // Handle channel update success
    const handleChannelUpdated = async (updatedChannel: Channel) => {
        // Refresh the channels list to show updated data
        if (channelsListRef.current) {
            await channelsListRef.current.refreshChannels();
        }
        console.log('Channel updated successfully:', updatedChannel);
    };

    // Handle channel deletion success
    const handleChannelDeleted = async (deletedChannelId: string) => {
        // Refresh the channels list to remove the deleted channel
        if (channelsListRef.current) {
            await channelsListRef.current.refreshChannels();
        }
        console.log('Channel deleted successfully:', deletedChannelId);
    };

    // Handle channel update dialog close
    const handleChannelUpdateDialogChange = (open: boolean) => {
        setIsChannelUpdateDialogOpen(open);
        if (!open) {
            setChannelToUpdate(null);
        }
    };

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
              </SidebarHeader>                <SidebarContent>
                    {/* <CollapsibleGroup name="Canale" /> */}
                    <SidebarCollapsibleGroup name="Canale">
                        <ChannelsList ref={channelsListRef} onChannelUpdateRequest={handleChannelUpdateRequest} />
                    </SidebarCollapsibleGroup>
                    <NearbyUses />
                    <OnlineUsers />
                </SidebarContent>
                <SidebarFooter>
                    {user &&
                          <CurrentUser user={user} />}
                </SidebarFooter>            </Sidebar>
              {/* Channel Creation Dialog */}
            <ChannelCreationDialog 
                open={isChannelDialogOpen} 
                onOpenChange={handleChannelDialogChange} 
            />
              {/* Shared Channel Update Dialog */}
            <ChannelUpdateDialog
                open={isChannelUpdateDialogOpen}
                onOpenChange={handleChannelUpdateDialogChange}
                channel={channelToUpdate}
                onChannelUpdated={handleChannelUpdated}
                onChannelDeleted={handleChannelDeleted}
            />
        </>
    );
}
