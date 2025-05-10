import { Channel } from "@/store/useChannelStore";
import { ChevronDown, Plus } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu } from "../ui/sidebar";
// import { CollapsibleTrigger } from "@radix-ui/react-collapsible";



export interface ChannelGroupProps {
    name: string
    children?: React.ReactNode; 
}
const SidebarCollapsibleGroup = ({
  name,
  children
}: ChannelGroupProps) => {
  return (
    <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
            <SidebarGroupLabel asChild>
                <CollapsibleTrigger>
                    {name}
                    <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
            <SidebarGroupContent>
                <SidebarMenu>
                    {children}
                </SidebarMenu>
              {/* <SidebarGroupContent /> */}
              </SidebarGroupContent>
            </CollapsibleContent>
            
        </SidebarGroup>
    </Collapsible>
  )
}

export default SidebarCollapsibleGroup;