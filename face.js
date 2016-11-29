"use strict";

var Cylon = require("cylon");

Cylon.robot({
  connections: {
    opencv: { adaptor: "opencv" }
  },

  devices: {
    window: { driver: "window" },
    camera: {
      driver: "camera",
      camera: 0,
      haarcascade: "./data/haarcascade_frontalface_alt.xml"
    }
  },

  work: function(my) {
    
    my.camera.once("cameraReady", function() {
      console.log("The camera is ready!");

      my.camera.on("facesDetected", function(err, im, faces) {
        if (err) { console.log(err); }

        for (var i = 0; i < faces.length; i++) {
          var face = faces[i];
          im.rectangle(
            [face.x, face.y],
            [face.x + face.width, face.y + face.height],
            [0, 255, 0],
            2
          );
        }

        
        my.window.show(im, 40);

        
        my.camera.readFrame();
      });

      
      my.camera.on("frameReady", function(err, im) {
        if (err) { console.log(err); }
        my.camera.detectFaces(im);
      });

      my.camera.readFrame();
    });
  }
}).start();
