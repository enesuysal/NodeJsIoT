'use strict';
//Import the package for Storage
var azure = require('azure-storage');
var unzip = require('unzip');
var blobSvc = azure.createBlobServiceAnonymous('https://testenesq.blob.core.windows.net/');
//Iot 
var Mqtt = require('azure-iot-device-mqtt').Mqtt;
var DeviceClient = require('azure-iot-device').Client;

var connectionString = 'HostName=IotDevDays.azure-devices.net;DeviceId=device1;SharedAccessKey=CJRrB0op+UTIWSzjLBWmyX+SyxJWA+JGpbNpUFEbrdI=';
var client = DeviceClient.fromConnectionString(connectionString, Mqtt);

function onWriteLine(request, response) {
    console.log(request.payload);
     
    response.send(200, 'Success', function(err) {
        if(err) {
            console.error('An error ocurred when sending a method response:\n' + err.toString());
        } else {
            console.log('Response to method \'' + request.methodName + '\' sent successfully.' );
            var fs = require('fs');
            blobSvc.getBlobToStream('simulated', request.payload.fileName, fs.createWriteStream(request.payload.fileName), function(error, result, response){
              if(!error){
                console.log('Blob file Downloaded');
                fs.createReadStream(request.payload.fileName).pipe(unzip.Extract({ path: '../SimulatedDevice' }));
				console.log('Deployment Completed');
				fs.unlinkSync(request.payload.fileName);
              }
            });
        }
    });
}

client.open(function(err) {
    if (err) {
        console.error('could not open IotHub client');
    }  else {
        console.log('client opened');
        client.onDeviceMethod('Deploy', onWriteLine);
    }
});