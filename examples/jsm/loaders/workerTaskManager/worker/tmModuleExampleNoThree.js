/**
 * Development repository: https://github.com/kaisalmen/WWOBJLoader
 */

import { GeometryTransport } from "../utils/TransportUtils.js";
import { WorkerTaskManagerDefaultRouting } from "./defaultRouting.js";

function init ( context, id, config ) {

	context.config = config;
	context.postMessage( {
		cmd: "init",
		id: id
	} );

}

function execute ( context, id, config ) {

	const geometry = new GeometryTransport().loadData( context.config ).reconstruct( true ).getBufferGeometry();
	geometry.name = 'tmProto' + config.id;
	let vertexArray = geometry.getAttribute( 'position' ).array;
	for ( let i = 0; i < vertexArray.length; i++ ) {

		vertexArray[ i ] = vertexArray[ i ] + 10 * ( Math.random() - 0.5 );

	}

	const sender = new GeometryTransport( 'execComplete', config.id )
		.setGeometry( geometry, 1 )
		.package( false );

	let randArray = new Uint8Array( 3 );
	context.crypto.getRandomValues( randArray );
	sender.main.params.color = {
		r: randArray[ 0 ] / 255,
		g: randArray[ 1 ] / 255,
		b: randArray[ 2 ] / 255
	};

	sender.postMessage( context );

}

self.addEventListener( 'message', message => WorkerTaskManagerDefaultRouting.comRouting( self, message, null, init, execute ), false );
