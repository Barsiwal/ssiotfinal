
var awsIot = require('aws-iot-device-sdk');
const thingShadow = awsIot.thingShadow;
const isUndefined = require('./node_modules/aws-iot-device-sdk/common/lib/is-undefined');


function processTest( args ) {
var thingShadows = awsIot.thingShadow({
   keyPath: './certs/ssiot.private.key',
  certPath: './certs/ssiot.cert.pem',
    caPath: './certs/root-CA.crt',
  clientId: 'ssiot',
    region: 'us-east-1'
});
var operationCallbacks = { };

var role='DEVICE';

if (args.testMode===1)
{
   role='MOBILE APP';
}
var rgbValues={ red: 0, green: 0, blue: 0 };

var mobileAppOperation='update';

thingShadows
  .on('connect', function() {
    console.log('connected to things instance, registering thing name');

    if (args.testMode === 1)
    {
       thingShadows.register( 'carcounter', { ignoreDeltas: true,
                                              persistentSubscribe: true } );
    }
    else
    {
       thingShadows.register( 'carcounter' );
    }
    var rgbLedLampState = { };

    var opFunction = function() {
       if (args.testMode === 1)
       {

          rgbValues.red   = Math.floor(Math.random() * 255);
          rgbValues.green = Math.floor(Math.random() * 255);
          rgbValues.blue  = Math.floor(Math.random() * 255);

          rgbLedLampState={state: { desired: rgbValues }};
       }

       var clientToken;
 
       if (args.testMode === 1)
       {
          if (mobileAppOperation === 'update')
          {
             clientToken = thingShadows[mobileAppOperation]('carcounter',
                                                            rgbLedLampState );
          }
          else // mobileAppOperation === 'get'
          {
             clientToken = thingShadows[mobileAppOperation]('carcounter' );
          }
          operationCallbacks[clientToken] = { operation: mobileAppOperation,
                                              cb: null };

          mobileAppOperation = 'update';
       }
       else
       {

          clientToken = thingShadows.get('carcounter');
          operationCallbacks[clientToken] = { operation: 'get', cb: null };
       }
       if (args.testMode === 1)
       {
          operationCallbacks[clientToken].cb =
             function( thingName, operation, statusType, stateObject ) {

                console.log(role+':'+operation+' '+statusType+' on '+thingName+': '+
                            JSON.stringify(stateObject));

                if (statusType !== 'accepted')
                {
                   mobileAppOperation = 'get';
                }
                opFunction();
             };
       }
       else
       {
          operationCallbacks[clientToken].cb =
             function( thingName, operation, statusType, stateObject ) { 

                console.log(role+':'+operation+' '+statusType+' on '+thingName+': '+
                            JSON.stringify(stateObject));
             };
       }
    };
    opFunction();
    });
thingShadows 
  .on('close', function() {
    console.log('close');
    thingShadows.unregister( 'carcounter' );
  });
thingShadows 
  .on('reconnect', function() {
    console.log('reconnect');
    if (args.testMode === 1)
    {
       thingShadows.register( 'carcounter', { ignoreDeltas: true,
                                              persistentSubscribe: true } );
    }
    else
    {
       thingShadows.register( 'carcounter' );
    }
  });
thingShadows 
  .on('offline', function() {
    console.log('offline');
  });
thingShadows
  .on('error', function(error) {
    console.log('error', error);
  });
thingShadows
  .on('message', function(topic, payload) {
    console.log('message', topic, payload.toString());
  });
thingShadows
  .on('status', function(thingName, stat, clientToken, stateObject) {
      if (!isUndefined( operationCallbacks[clientToken] ))
      {
         setTimeout( function() {
         operationCallbacks[clientToken].cb( thingName, 
              operationCallbacks[clientToken].operation,
              stat,
              stateObject );

         delete operationCallbacks[clientToken];
         }, 2000 );
      }
      else
      {
         console.warn( 'status:unknown clientToken \''+clientToken+'\' on \''+
                       thingName+'\'' );
      }

  });

if (args.testMode===2)
{
   thingShadows
     .on('delta', function(thingName, stateObject) {
         console.log(role+':delta on '+thingName+': '+
                     JSON.stringify(stateObject));
         rgbValues=stateObject.state;
     });
}

thingShadows
  .on('timeout', function(thingName, clientToken) {
      if (!isUndefined( operationCallbacks[clientToken] ))
      {
         operationCallbacks[clientToken].cb( thingName,
              operationCallbacks[clientToken].operation,
              'timeout',
              { } );
         delete operationCallbacks[clientToken];
      }
      else
      {
         console.warn( 'timeout:unknown clientToken \''+clientToken+'\' on \''+
                       thingName+'\'' );
      }
  });
}


if (require.main === module) {
    processTest({testMode : 1});
}
