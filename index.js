
var myThingName = 'carcounter';
mythingstate = {
  "state": {
    "reported": {
      "ip": "unknown"
    }
  }
}

//app deps
var awsIot = require('aws-iot-device-sdk');
const thingShadow = awsIot.thingShadow;
const isUndefined = require('./node_modules/aws-iot-device-sdk/common/lib/is-undefined');

"use strict";


var thingShadows = awsIot.thingShadow({
    keyPath: './certs/ssiot.private.key',
  certPath: './certs/ssiot.cert.pem',
    caPath: './certs/root-CA.crt',
  clientId: 'ssiot',
    region: 'us-east-1'
});

var Cylon = require("cylon");
var carsDetected = 0;
var cars = { };

Cylon.robot({
  connections: {
    opencv: { adaptor: "opencv" }
  },

  devices: {
    window: { driver: "window" },
    camera: {
      driver: "camera",
      camera: 0,
      haarcascade: __dirname + "/data/hogcascade_cars_sideview.xml"

    }
  },

  work: function(my) {
   
    my.camera.once("cameraReady", function() {
      console.log("The camera is ready!");

      my.camera.on("facesDetected", function(err, im, faces) {
	if (err) { console.log(err); }

	carsDetected = faces.length;
	cars = faces;

	if (carsDetected > 0)
	{

	mythingstate = {
 	 "state": {
    		"reported": {
			"carsDetected" : carsDetected,
			"cars" : cars
    				}
 	 	}
	};
		console.log("send");
		var response = thingShadows.update(myThingName,  mythingstate);
		console.log(response);
		thingShadows.publish('topic/CarCounter', 
                  'Someone is using your parking lot!');
	}


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
	carsDetected = 0;
	cars = { };
        my.camera.detectFaces(im);
      });

      my.camera.readFrame();
    });
  }
}).start();


function processTest() {

  thingShadows.on('connect', function() {
  console.log("Connected...");
  console.log("Registering...");
  thingShadows.register( myThingName );
  

  setTimeout( function() {
    console.log("Updating my IP address...");
    clientTokenIP = thingShadows.update(myThingName, mythingstate);
    console.log("Update:" + clientTokenIP);
  }, 2500 );

  thingShadows.on('status',
    function(thingName, stat, clientToken, stateObject) {
       console.log('received '+stat+' on '+thingName+': '+
                   JSON.stringify(stateObject));
    });

  thingShadows.on('update',
      function(thingName, stateObject) {
         console.log('received update '+' on '+thingName+': '+
                     JSON.stringify(stateObject));
      });

  thingShadows.on('delta',
      function(thingName, stateObject) {
         console.log('received delta '+' on '+thingName+': '+
                     JSON.stringify(stateObject));
      });

  thingShadows.on('timeout',
      function(thingName, clientToken) {
         console.log('received timeout for '+ clientToken)
      });

  thingShadows
    .on('close', function() {
      console.log('close');
    });
  thingShadows
    .on('reconnect', function() {
      console.log('reconnect');
    });
  thingShadows
    .on('offline', function() {
      console.log('offline');
    });
  thingShadows
    .on('error', function(error) {
      console.log('error', error);
    });

});	

}


if (require.main === module) {
    processTest();
}

