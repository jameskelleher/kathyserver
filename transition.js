class Transition {
    constructor(data) {
      this.x = data.x;
      this.y = data.y;
      this.w = data.w;
      this.h = data.h;
      this.room = data.room;
      this.dest_room = data.dest_room;
      this.dest_x = data.dest_x;
      this.dest_y = data.dest_y;
    }
  }

  export default Transition;