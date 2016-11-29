"use strict";

var Cylon = require("cylon");

Cylon.robot({
  connections: {
    records: { adaptor: "audio", tracks: ["audio-sample.mp3"] }
  },

  devices: {
    jukebox: { driver: "audio" }
  },

  work: function(my) {
    my.jukebox.on("playing", function(song) {
      console.log("Playing this nice tune: \"" + song + "\"");
    });

    my.jukebox.play(0);
  }
}).start();
