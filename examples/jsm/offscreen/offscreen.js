import init from './scene.js';

self.onmessage = function ( message ) {

	var data = message.data;
	init( data.drawingSurface, data.width, data.height, data.pixelRatio, data.path );

};
