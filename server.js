// local imports
import Player from "./player.js"
import Transition from "./transition.js"

import config from './config.js'

// create a server
const server = require('http').createServer();
const io = require('socket.io')(server);
const port = process.env.PORT ? process.env.PORT : 3333;


// listen for incoming connections
server.listen(port, (err) => {
  if (err) throw err;
  console.log(`Listening on port ${port}`);
});

// global data
var players = [];  // all connected players will be stored here
var transitions = []; // store the positions of the transition objects
var clientID = 0;  // unique ID for every client

io.on('connection', (client) => {
  var playerID = clientID++;

  if (clientID >= Number.MAX_SAFE_INTEGER) clientID = 0;
  var player;

  console.log(`Player "${playerID}" connected`);

  player = new Player({
    x: 100,
    y: 100 * (playerID % 4),
    socket: client,
    playerID: playerID,
  });

  // add to players list
  players.push(player);

  if (transitions.length == 0) {
    client.emit('collect_transitions', JSON.stringify({}));
  }

  console.log(JSON.stringify(players));

  client.on('update_key', (data) => {
    data = JSON.parse(data);
    player.keys[data.key] = data.status;
  });

  client.on('disconnect', () => {

    // remove player from list
    players.splice(players.indexOf(player), 1);

    console.log(`Player "${playerID}" disconnected`);
  });

  client.on('send_transitions', (data) => {
      transitions = [];
      data = JSON.parse(data);
      var t_list = data.t;
      t_list.forEach((item, index) => {
        var t = new Transition(item);
        transitions.push(t);
      });
      console.log(transitions);
  });

  client.on('send_character_sprite', (data) => {
      data = JSON.parse(data);
      console.log('updating sprite')
      player.spr_body = data.spr_body;
      player.spr_outfit = data.spr_outfit;
      player.spr_hair = data.spr_hair;
  });

});

setInterval(() => {

  if (players.length > 0) {
    players.forEach((player, index) => {
      var room = player.checkTransitions(transitions);
      if (room != undefined) {
        player.socket.emit('change_room', JSON.stringify({'dest_room': room}));
      };
      player.updatePosition();
    });
  }
}, 1000 / config.fps);

setInterval(() => {
  io.emit('position_update', JSON.stringify(players));
}, 1000 / (config.fps * 1.5));
