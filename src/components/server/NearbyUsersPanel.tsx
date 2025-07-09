import * as React from "react";
import { ChevronsUpDown, Users } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
// import {
//   Avatar,
//   AvatarFallback,
//   AvatarImage,
// } from "@/components/ui/avatar";
// Assuming your store hook is named useAppStore and provides nearbyUsers
// You might need to adjust the import path and the store structure
import { useChannelStore } from "@/store/useChannelStore" // Adjust this path to your store


export function NearbyUsersPanel() {
  const [isOpen, setIsOpen] = React.useState(false);
  const nearbyUsers = useChannelStore((state) => state.nearbyUsers); // Adjust selector as needed

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full"
    >
      <div className="flex items-center justify-between space-x-4 px-2 py-2 bg-muted rounded-md text-zinc-600">
        <h4 className="text-sm font-semibold flex items-center">
          <Users className="mr-2 h-4 w-4" />
          Utilizatori in apropiere ({nearbyUsers.size})
        </h4>
        <CollapsibleTrigger>
          {/* <Button variant="ghost" size="sm" className="w-9 p-0"> */}
            <ChevronsUpDown className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          {/* </Button> */}
        </CollapsibleTrigger>
      </div>
      {Array.from(nearbyUsers).map((userId) => (
        <CollapsibleContent key={userId} className="text-zinc-500 px-2 py-2 border-b last:border-b-0">
          <div className="flex items-center  rounded-md hover:bg-accent cursor-pointer">
            {/* Replace with your Avatar component or any other user representation */}
            {/* <Avatar>
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar> */}
            <span className="text-sm font-medium">{
              useChannelStore.getState().users.get(userId)?.name || userId
            }
          </span>
          </div>
        </CollapsibleContent>
      ))}
      {/* <CollapsibleContent className="space-y-2 px-2 py-2">
        {nearbyUsers.size === 0 ? (
          <p className="text-sm text-muted-foreground">No users nearby.</p>
        ) : (
          Array.from(nearbyUsers).map((userId) => (
        <Collapsible key={userId} className="space-y-2">
          <CollapsibleTrigger asChild>
            <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent cursor-pointer">
          <span className="text-sm font-medium">User ID: {userId}</span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 py-2 border rounded-md">
            <p className="text-sm text-muted-foreground">
          Details for user {userId} go here.
            </p>
          </CollapsibleContent>
        </Collapsible>
          ))
        )}
      </CollapsibleContent> */}
    </Collapsible>
  );
}
