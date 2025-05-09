import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
  } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"

export function UserGroup() {
    return (
        <Collapsible defaultOpen className="group/collapsible text-zinc-500">
        <CollapsibleTrigger className="  py-1 rounded-md flex w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1 group-data-[state=open]:bg-zinc-700/20 dark:group-data-[state=open]:bg-zinc-700">
            <p className="ml-1">Utilizatori alaturi</p>
            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
        </CollapsibleTrigger>
        <div className="px-2">
        <CollapsibleContent>
            Eu
        </CollapsibleContent>
        <CollapsibleContent>
            Ameu
        </CollapsibleContent>
        </div>
       
        </Collapsible>
    )
 
}