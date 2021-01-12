/**
 * @author Kai Salmen / www.kaisalmen.de
 */

import { TorusKnotBufferGeometry } from "../../../../../build/three.module.js";
import { TransferableUtils } from "../utils/TransferableUtils.js";
import { WorkerTaskManagerDefaultRouting } from "./tmDefaultComRouting.js";


function init ( context, id, config ) {
	context.storage = {
		whoami: id,
	};

	context.postMessage( {
		cmd: "init",
		id: id
	} );

}

function execute ( context, id, config ) {

	let bufferGeometry = new TorusKnotBufferGeometry( 20, 3, 100, 64 );

	let vertexBA = bufferGeometry.getAttribute( 'position' ) ;
	let vertexArray = vertexBA.array;
	for ( let i = 0; i < vertexArray.length; i++ ) {

		vertexArray[ i ] = vertexArray[ i ] + 10 * ( Math.random() - 0.5 );

	}
	let payload = TransferableUtils.packageBufferGeometry( bufferGeometry, config.id, 'tmProto' + config.id, 2,[ 'defaultPointMaterial' ] );

	let randArray = new Uint8Array( 3 );
	context.crypto.getRandomValues( randArray );
	payload.main.params.color = {
		r: randArray[ 0 ] / 255,
		g: randArray[ 1 ] / 255,
		b: randArray[ 2 ] / 255
	};
	payload.postMessage( context );

}

self.addEventListener( 'message', message => WorkerTaskManagerDefaultRouting.comRouting( self, message, null, init, execute ), false );
