/**
 * @author Kai Salmen / www.kaisalmen.de
 */

import {
	TorusKnotBufferGeometry,
	Color,
	MeshPhongMaterial
} from "../../../../../build/three.module.js";
import {
	MeshTransport,
	MaterialsTransport
} from "../utils/TransportUtils.js";
import {
	MaterialUtils
} from '../utils/MaterialUtils.js';
import { WorkerTaskManagerDefaultRouting } from "./defaultRouting.js";


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
	bufferGeometry.name = 'tmProto' + config.id;

	let vertexBA = bufferGeometry.getAttribute( 'position' ) ;
	let vertexArray = vertexBA.array;
	for ( let i = 0; i < vertexArray.length; i++ ) {

		vertexArray[ i ] = vertexArray[ i ] + 10 * ( Math.random() - 0.5 );

	}

	const randArray = new Uint8Array( 3 );
	context.crypto.getRandomValues( randArray );
	const color = new Color();
	color.r = randArray[ 0 ] / 255;
	color.g = randArray[ 1 ] / 255;
	color.b = randArray[ 2 ] / 255;
	const material = new MeshPhongMaterial( { color: color } );

	const materialsTransport = new MaterialsTransport();
	MaterialUtils.addMaterial( materialsTransport.main.materials, material, 'randomColor' + config.id, false, false );
	materialsTransport.cleanMaterials();

	new MeshTransport( 'execComplete', config.id )
		.setGeometry( bufferGeometry, 2 )
	 	.setMaterialsTransport( materialsTransport )
		.package( false )
		.postMessage( context );

}

self.addEventListener( 'message', message => WorkerTaskManagerDefaultRouting.comRouting( self, message, null, init, execute ), false );
