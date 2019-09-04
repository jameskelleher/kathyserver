import {Key, Facing} from "./enums.js";
import config from "./config.js"

class Player {

    constructor(data) {
      this.x = data.x;
      this.y = data.y;
      this.socket = data.socket;
      this.playerID = data.playerID;
  
      // initialize to a room that doesn't exist
      this.room_id = -1;
  
      // initialize keys
      this.keys = {}
  
      for (let k in Key) {
        this.keys[Key[k]] = 0;
      }
  
      // animation and movement
      this.spd = 1;
      this.frame_size = 32;
  
      this.anim_length = 4;
      this.anim_speed = 12;
      this.frame_speed = this.anim_speed / config.fps;
  
      this.spr_left = 0;
      this.spr_top = 0;
  
      // initialize animation frame to just before movement
      this.x_frame = 1 - this.frame_speed;
      this.facing = Facing.DOWN;
  
      // initialize sprites indices
      this.spr_body = 0;
      this.spr_outfit = 0;
      this.spr_hair = 0;
    }
  
    toJSON() {
      return {
        "x": this.x,
        "y": this.y,
        "spr_left": this.spr_left,
        "spr_top": this.spr_top,
        "room_id": this.room_id,
        "spr_body": this.spr_body,
        "spr_outfit": this.spr_outfit,
        "spr_hair": this.spr_hair,
      };
    }
  
    toString() {
      return JSON.stringify(this, this.replacer);
    }
  
    replacer(key, value) {
      if (key == "socket") return undefined;
      else return value;
    }
  
    checkTransition(t) {
      if (this.room_id != t.room) return undefined;
  
      var xx = this.x + this.frame_size * 0.5;
      var yy = this.y + this.frame_size * 0.666;
  
      // console.log(`xx: "${xx}"`)
      // console.log(`yy: "${yy}"`)
      //
      // console.log(`checking transition in room "${t.room}"`);
      // console.log(`left bound: "${t.x}"`);
      // console.log(`right bound: "${t.x + t.w}"`);
      // console.log(`top bound: "${t.y}"`);
      // console.log(`bottom bound: "${t.y + t.h}"`);
  
      if ( t.x < xx
          && xx < t.x + t.w
          && t.y < yy
          && yy < t.y + t.h) {
        console.log(`Player "${this.playerID}" transition to "${t.dest_room}"`)
        this.room_id = t.dest_room;
        this.x = t.dest_x;
        this.y = t.dest_y;
        this.x_frame = 0;
        console.log(`Sending to coordinates ${t.dest_x}, ${t.dest_y}`);
  
        for (let k in this.keys) {
          this.keys[k] = 0;
        }
        return t.dest_room;
      }
  
      // console.log(`Player "${this.playerID}" does not transition`)
      return undefined;
    }
  
    checkTransitions(t_array) {
      for (let i = 0; i < t_array.length; i++) {
          var room = this.checkTransition(t_array[i]);
          if (room != undefined) return room;
      }
    }
  
    updatePosition() {
      var moveX = (this.keys[Key.RIGHT] - this.keys[Key.LEFT]) * this.spd;
      if (moveX == 0) {
        var moveY = (this.keys[Key.DOWN] - this.keys[Key.UP]) * this.spd;
      } else {
        var moveY = 0;
      }
  
      this.x += moveX;
      this.y += moveY;
  
      if (moveX > 0) this.facing = Facing.RIGHT;
      else if (moveX < 0) this.facing = Facing.LEFT;
      else if (moveY > 0) this.facing = Facing.DOWN;
      else if (moveY < 0) this.facing = Facing.UP;
  
      var move = moveX + moveY;
  
      if (move == 0) {
        this.x_frame = 1 - this.frame_speed;
      } else {
        this.x_frame += this.frame_speed;
      }
  
      this.x_frame %= this.anim_length;
  
      // maybe do this in the client?
      this.spr_left = Math.floor(this.x_frame) * this.frame_size;
      this.spr_top = this.facing * this.frame_size;
    }
  
    setSprites(spr_body, spr_outfit, spr_hair, room_id) {
      this.spr_body = spr_body;
      this.spr_outfit = spr_outfit;
      this.spr_hair = spr_hair;

      this.room_id = room_id;
    }
  }

  export default Player;