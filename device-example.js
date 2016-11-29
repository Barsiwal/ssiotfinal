
const deviceModule   = require('..').device;
const cmdLineProcess = require('./lib/cmdline');

function processTest( args ) {

const device = deviceModule({
  keyPath: args.privateKey,
  certPath: args.clientCert,
  caPath: args.caCert,
  clientId: args.clientId,
  region: args.region,
  reconnectPeriod: args.reconnectPeriod
});

var timeout;
var count=0;

device
  .on('connect', function() {
    const minimumDelay=250;
    console.log('connect');
    if (args.testMode === 1)
    {
        device.subscribe('topic_1');
    }
    else
    {
        device.subscribe('topic_2');
    }
    if ((Math.max(args.delay,minimumDelay) ) !== args.delay)
    {
        console.log( 'substituting '+ minimumDelay + 'ms delay for ' + args.delay + 'ms...' );
    }
    timeout = setInterval( function() {
        count++;
   
        if (args.testMode === 1)
        {
            device.publish('topic_2', JSON.stringify({
            mode1Process: count }));
        }
        else
        {
            device.publish('topic_1', JSON.stringify({
            mode2Process: count }));
        }
    }, Math.max(args.delay,minimumDelay) );  // clip to minimum
    });
device 
  .on('close', function() {
    console.log('close');
    clearInterval( timeout );
    count=0;
  });
device 
  .on('reconnect', function() {
    console.log('reconnect');
  });
device 
  .on('offline', function() {
    console.log('offline');
    clearInterval( timeout );
    count=0;
  });
device
  .on('error', function(error) {
    console.log('error', error);
    clearInterval( timeout );
    count=0;
  });
device
  .on('message', function(topic, payload) {
    console.log('message', topic, payload.toString());
  });

}

module.exports = cmdLineProcess;

if (require.main === module) {
  cmdLineProcess('connect to the AWS IoT service and publish/subscribe to topics using MQTT, test modes 1-2',
                 process.argv.slice(2), processTest );
}
