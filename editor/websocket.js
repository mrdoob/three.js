/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var wsUri = "ws://" + document.location.host + "/visEndpoint";
var websocket = new WebSocket(wsUri);

websocket.onerror = function(evt) { onError(evt) };

function onError(evt) {
    //alert('<span style="color: red;">ERROR:</span> ' + evt.data);
}
// For testing purposes
//var output = document.getElementById("output");
websocket.onopen = function(evt) { onOpen(evt) };

function writeToScreen(message) {
    //output.innerHTML += message + "<br>";
};

function onOpen() {
    //alert("Connected to " + wsUri);
}
websocket.onmessage = function(evt) { onMessage(evt) };

function sendText(json) {
    console.log("sending text: " + json);
    //alert('Sending msg '+json);
    websocket.send(json);
}
                
function onMessage(evt) {
    console.log("received: " + evt.data);
    msg = JSON.parse(evt.data);
    //alert("received: " + msg);
    if (msg.Op=="Select")
        editor.selectByUuid( msg.UUID, true );
    else if (msg.Op=="Frame") {
        //alert("uuid: " + msg.name);
        var o = editor.scene.getObjectByName( msg.name);
        //alert("mat before: " + o.matrix);
        o.matrixAutoUpdate = false;
        o.matrix.fromArray(msg.matrix);
        onWindowResize();
        //o.updateMatrix();
        //alert("mat after: " + o.matrix);
   }
    //drawImageText(evt.data);
}
// End test functions
