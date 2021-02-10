/**
 * @author Kai Salmen / www.kaisalmen.de
 */

import {
	TransportBase,
	DataTransport,
	MaterialsTransport,
	MaterialUtils,
	GeometryTransport,
	MeshTransport,
	CodeUtils,
} from "../workerTaskManager/utils/TransferableUtils.js";
import { OBJLoader } from "../OBJLoader.js";
import { WorkerTaskManagerDefaultRouting } from "../workerTaskManager/comm/worker/defaultRouting.js";

const OBJLoaderWorker = {

	buildStandardWorkerDependencies: function ( threeJsLocation, objLoaderLocation ) {
		return [
			{ url: threeJsLocation },
			{ code: '\n\n' },
			{ code: 'const MaterialLoader = THREE.MaterialLoader;\n' },
			{ code: 'const Material = THREE.Material;\n' },
			{ code: 'const Texture = THREE.Texture;\n' },
			{ code: 'const BufferGeometry = THREE.BufferGeometry;\n' },
			{ code: '\n\n' },
			{ url: objLoaderLocation },
			{ code: '\n\nconst OBJLoader = THREE.OBJLoader;\n\n' },
			{ code: '\n\n' },
			{ code: CodeUtils.serializeClass( TransportBase ) },
			{ code: CodeUtils.serializeClass( DataTransport ) },
			{ code: CodeUtils.serializeClass( MaterialsTransport ) },
			{ code: CodeUtils.serializeClass( MaterialUtils ) },
			{ code: CodeUtils.serializeClass( GeometryTransport ) },
			{ code: CodeUtils.serializeClass( MeshTransport ) }
		]
	},

	init: function ( context, id, config ) {

		const materialsTransport = new MaterialsTransport().loadData( config );
		context.objLoader = {
			loader: null,
			buffer: null,
			materials: materialsTransport.getMaterials()
		}

		const buffer = materialsTransport.getBuffer( 'data' )
		if ( buffer !== undefined && buffer !== null ) context.objLoader.buffer = buffer;

		context.postMessage( {
			cmd: "init",
			id: id
		} );
	},

	execute: function ( context, id, config ) {

		context.objLoader.loader = new OBJLoader();
		context.objLoader.loader.objectId = config.id;
		context.objLoader.loader.setMaterials( context.objLoader.materials );

		const enc = new TextDecoder("utf-8");
		let meshes = context.objLoader.loader.parse( enc.decode( context.objLoader.buffer ) );
		for ( let mesh, i = 0; i < meshes.children.length; i ++ ) {

			mesh = meshes.children[ i ];
			mesh.name = mesh.name + config.id;

			const materialsTransport = new MaterialsTransport();
			const material = mesh.material;
			MaterialUtils.addMaterial( materialsTransport.main.materials, material, material.name, false, false );
			new MeshTransport( 'assetAvailable', config.id )
				.setMesh( mesh, 0 )
				.setMaterialsTransport( materialsTransport )
				.package( false )
				.postMessage( context );

		}

		// signal complete
		new TransportBase( 'execComplete' ).postMessage( context );

	}

};

self.addEventListener( 'message', message => WorkerTaskManagerDefaultRouting.comRouting( self, message, OBJLoaderWorker, 'init', 'execute' ), false );

export { OBJLoaderWorker };
