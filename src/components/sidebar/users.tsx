import { ChannelUser } from "@/user/ChannelUser";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import SidebarCollapsibleGroup from "./sidebar-collapsible-group";
import { useNearbyUsers } from "@/hooks/useNearbyUsers";
import { useChannelStore } from "@/store/useChannelStore";
import { UserDto } from "@/dtos/UserDto";
import { ChevronsUpDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { UserAccountDialog } from "@/components/user-account-dialog";
import { useState } from "react";
import { authService } from "@/services/auth";
// import { authManager } from "@/services/authManager";

export interface NearbyUserProps {
    user: ChannelUser;
}

export interface CurrentUserProps {
    user: UserDto;
}
export const SidebarUser = ({ user }: NearbyUserProps) => {
    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild>
                <a className="cursor-pointer">
                    <Avatar className="w-7 h-7 rounded-full">
                        <AvatarImage src="https://github.com/shadcn.png"/>
                        <AvatarFallback className="">
                            {user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    {user.name}
                </a>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
};

export const NearbyUses = ()=>{
    const nearbyUsers = useNearbyUsers();
    return (
          <SidebarCollapsibleGroup name="Persoane in apropiere">
                  {nearbyUsers.map((user) => {
                    return (
                        <SidebarUser key={user.id} user={user} />
                    )
                  })
                  }
                </SidebarCollapsibleGroup>
    )
}

export const OnlineUsers = () => {
    const users = useChannelStore((state) => state.users);
    return (
        <SidebarCollapsibleGroup name="Utilizatori online">
            {Array.from(users.values()).map((user) => {
                return (
                    <SidebarUser key={user.id} user={user} />
                )
            })
            }
        </SidebarCollapsibleGroup>
    )
}

export const CurrentUser = ({user}: CurrentUserProps) => {
    const [showAccountDialog, setShowAccountDialog] = useState(false);
    
    return (
        <>
                  <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="h-12" asChild>
                  <SidebarMenuButton>
                    <Avatar className="w-8.5 h-8.5 rounded-lg">
                        <AvatarImage src="https://github.com/shadcn.png"/>
                        <AvatarFallback className="">
                            {user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{user.name}</span>
                        <span className="truncate text-xs">{user.email}</span>
                    </div>
                    <ChevronsUpDown className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >                  <DropdownMenuItem onClick={() => setShowAccountDialog(true)}>
                    <span>Cont</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={()=> authService.logout()}>
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
          
          <UserAccountDialog 
            open={showAccountDialog} 
            onOpenChange={setShowAccountDialog} 
          />
        </>
    )
}