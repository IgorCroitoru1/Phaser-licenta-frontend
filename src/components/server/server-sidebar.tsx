"use client";

import { useRouter } from "next/navigation";

// import { GameManager } from "../ChannelManager";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { ServerSection } from "./server-section";
import { Channel, useChannelStore } from "@/store/useChannelStore";
import { ServerChannel } from "./server-channel";
import toast from "react-hot-toast";

const channels: Channel[] = [
    {
      id: "1",
      name: "general",
      sceneName: "TestScene",
      colyseusRoomName: "game_room",
      mapName: "office-1",
      livekitRoomName: "game_room",
    },
    {
      id: "2",
      name: "announcements",
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



export function ServerSidebar({ serverId }: { serverId?: string }) {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full text-primary w-full dark:bg-[#2b2d31] bg-[#f2f3f5]">
      <ScrollArea className="flex-1 px-3">
        <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2" />
        
        {!!channels?.length && (
          <div className="mb-2">
            <ServerSection sectionType="channels" label="Text Channels" />
            <div className="space-y-[2px]">
              {channels.map((channel) => (
                <ServerChannel key={channel.id} channel={channel} />
              ))}
            </div>
            <button
              onClick={() => toast("Coming soon!")}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Channel
            </button>
          </div>
        )}

        <button
          onClick={() => router.push("/video")}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Go to Video
        </button>
      </ScrollArea>
    </div>
  );
}
