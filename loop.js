"use strict";

var Cylon = require("cylon");

Cylon.robot({
  connections: {
    audio: { adaptor: "audio" }
  },

  devices: {
    sound: { driver: "audio", file: "./RoboSapien/43_HIGH5_0xC4.wav" }
  },

  work: function(my) {
    my.sound.loop();
  }
}).start();
