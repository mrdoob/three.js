import { OBJLoader } from '../../OBJLoader.js';
import {
	DataTransport,
	MaterialsTransport,
	GeometryTransport,
	MeshTransport,
	ObjectUtils,
	DeUglify
} from '../utils/TransportUtils.js';
import { MaterialUtils } from '../utils/MaterialUtils.js';;
import { WorkerTaskManagerDefaultRouting } from "./defaultRouting.js";

class OBJLoaderWorker {

	static buildStandardWorkerDependencies ( threeJsLocation, objLoaderLocation ) {
		return [
			{ url: threeJsLocation },
			{ code: '\n\n' },
			{ code: DeUglify.buildThreeConst() },
			{ code: '\n\n' },
			{ code: DeUglify.buildUglifiedThreeMapping() },
			{ code: '\n\n' },
			{ url: objLoaderLocation },
			{ code: '\n\nconst OBJLoader = THREE.OBJLoader;\n\n' },
			{ code: '\n\n' },
			{ code: ObjectUtils.serializeClass( DataTransport ) },
			{ code: ObjectUtils.serializeClass( MaterialsTransport ) },
			{ code: ObjectUtils.serializeClass( MaterialUtils ) },
			{ code: ObjectUtils.serializeClass( GeometryTransport ) },
			{ code: ObjectUtils.serializeClass( MeshTransport ) },
			{ code: DeUglify.buildUglifiedThreeWtmMapping() },
			{ code: '\n\n' }
		]
	}

	static init ( context, id, config ) {

		const materialsTransport = new MaterialsTransport().loadData( config );
		context.objLoader = {
			loader: null,
			buffer: null,
			materials: materialsTransport.getMaterials()
		}

		const buffer = materialsTransport.getBuffer( 'modelData' )
		if ( buffer !== undefined && buffer !== null ) context.objLoader.buffer = buffer;

		context.postMessage( {
			cmd: "init",
			id: id
		} );
	}

	static execute ( context, id, config ) {

		context.objLoader.loader = new OBJLoader();
		const dataTransport = new DataTransport().loadData( config );

		context.objLoader.loader.objectId = dataTransport.getId();
		let materials = context.objLoader.materials;
		materials[ 'create' ] = function fakeMat( name ) { return materials[ name ]; };
		context.objLoader.loader.setMaterials( context.objLoader.materials );

		const enc = new TextDecoder("utf-8");
		let meshes = context.objLoader.loader.parse( enc.decode( context.objLoader.buffer ) );
		for ( let mesh, i = 0; i < meshes.children.length; i ++ ) {

			mesh = meshes.children[ i ];
			mesh.name = mesh.name + dataTransport.getId();

			const materialsTransport = new MaterialsTransport();
			const material = mesh.material;
			MaterialUtils.addMaterial( materialsTransport.main.materials, material, material.name, false, false );
			new MeshTransport( 'assetAvailable', dataTransport.getId() )
				.setMesh( mesh, 0 )
				.setMaterialsTransport( materialsTransport )
				.package( false )
				.postMessage( context );

		}

		// signal complete
		new DataTransport( 'execComplete' ).postMessage( context );

	}

}

self.addEventListener( 'message', message => WorkerTaskManagerDefaultRouting.comRouting( self, message, OBJLoaderWorker, 'init', 'execute' ), false );

export { OBJLoaderWorker };
