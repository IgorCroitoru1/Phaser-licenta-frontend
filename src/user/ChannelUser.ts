import { Player } from "@/components/ChannelManager";
import { ChannelUserDto } from "@/dtos/ChannelUserDto";

export class ChannelUser {
  id: string;
  // x: number;
  // y: number;
  currentZoneId: number = -1;
  email: string;
  name: string;
  avatar: string;
  isLocal: boolean = false;
  constructor(userDto: ChannelUserDto){
    this.id = userDto.id;
    // this.x = userDto.x;
    // this.y = userDto.y;
    this.currentZoneId = userDto.currentZoneId;
    this.email = userDto.email;
    this.name = userDto.name;
    this.avatar = userDto.avatar;
  }

}