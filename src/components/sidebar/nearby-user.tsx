import { ChannelUser } from "@/user/ChannelUser";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import SidebarCollapsibleGroup from "./sidebar-collapsible-group";
import { useNearbyUsers } from "@/hooks/useNearbyUsers";

export interface NearbyUserProps {
    user: ChannelUser;
}
export const NearbyUser = ({ user }: NearbyUserProps) => {
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
                        <NearbyUser key={user.id} user={user} />
                    )
                  })
                  }
                </SidebarCollapsibleGroup>
    )
}