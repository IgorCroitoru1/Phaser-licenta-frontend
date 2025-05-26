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
import { getAllChannels } from "@/services/channelService";
import React from "react";

export function AppSidebar() {
    const [isChannelDialogOpen, setIsChannelDialogOpen] = React.useState(false);
    const [channels, setChannels] = React.useState<Channel[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);    const user = useAuthStore((state) => state.user);
    
    // Check if user has admin role
    const isAdmin = user?.roles?.includes('admin') || false;

    // Fetch channels from API
    const fetchChannels = React.useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const channelsData = await getAllChannels();
            setChannels(channelsData);
        } catch (error: any) {
            console.error('Failed to fetch channels:', error);
            setError(error.message || 'Failed to load channels');
            setChannels([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load channels on component mount
    React.useEffect(() => {
        fetchChannels();
    }, [fetchChannels]);

    // Refresh channels when dialog closes (channel might have been created)
    const handleChannelDialogChange = (open: boolean) => {
        setIsChannelDialogOpen(open);
        if (!open) {
            // Refresh channels when dialog closes
            fetchChannels();
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
                        {isLoading ? (
                            <div className="px-3 py-2">
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                                    <span className="text-sm text-muted-foreground">Loading channels...</span>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="px-3 py-2">
                                <div className="text-sm text-red-600 mb-2">{error}</div>
                                <button 
                                    onClick={fetchChannels}
                                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                                >
                                    Try again
                                </button>
                            </div>
                        ) : channels.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-muted-foreground">
                                No channels available
                            </div>
                        ) : (
                            channels.map((channel) => (
                                <SidebarChannel key={channel.id} channel={channel} />
                            ))
                        )}
                    </SidebarCollapsibleGroup>
                    <NearbyUses />
                    <OnlineUsers />
                </SidebarContent>
            </Sidebar>
              {/* Channel Creation Dialog */}
            <ChannelCreationDialog 
                open={isChannelDialogOpen} 
                onOpenChange={handleChannelDialogChange} 
            />
        </>
    );
}
