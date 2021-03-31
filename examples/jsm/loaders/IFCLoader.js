//Example: https://github.com/tomvandig/web-ifc-three/tree/main/examples/jsm

import { IfcAPI } from './ifc/web-ifc-api.js';
import {
	FileLoader,
	Loader,
	Object3D,
	Mesh,
	Color,
	MeshPhongMaterial,
	DoubleSide,
	Matrix4,
	BufferGeometry,
	InterleavedBuffer,
	InterleavedBufferAttribute,
	BufferAttribute,
} from '../../../../build/three.module.js';

var ifcAPI = new IfcAPI();

function IFCLoader( manager ) {

	Loader.call( this, manager );

}

IFCLoader.prototype = Object.assign( Object.create( Loader.prototype ), {

	constructor: IFCLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( scope.requestHeader );
		loader.setWithCredentials( scope.withCredentials );
		loader.load(
			url,
			async function ( buffer ) {

				try {

					onLoad( await scope.parse( buffer ) );

				} catch ( e ) {

					if ( onError ) {

						onError( e );

					} else {

						console.error( e );

					}

					scope.manager.itemError( url );

				}

			},
			onProgress,
			onError
		);

	},

	parse: async function ( buffer ) {

		if ( ifcAPI.wasmModule === undefined ) {

			await ifcAPI.Init();

		}

		var data = new Uint8Array( buffer );
		var modelID = ifcAPI.OpenModel( 'example.ifc', data );
		return loadAllGeometry( modelID );

		function loadAllGeometry( modelID ) {

			var flatMeshes = getFlatMeshes( modelID );
			var mainObject = new Object3D();
			for ( var i = 0; i < flatMeshes.size(); i ++ ) {

				var placedGeometries = flatMeshes.get( i ).geometries;
				for ( var j = 0; j < placedGeometries.size(); j ++ )
					mainObject.add( getPlacedGeometry( modelID, placedGeometries.get( j ) ) );

			}

			return mainObject;

		}

		function getFlatMeshes( modelID ) {

			var flatMeshes = ifcAPI.LoadAllGeometry( modelID );
			return flatMeshes;

		}

		function getPlacedGeometry( modelID, placedGeometry ) {

			var geometry = getBufferGeometry( modelID, placedGeometry );
			var material = getMeshMaterial( placedGeometry.color );
			var mesh = new Mesh( geometry, material );
			mesh.matrix = getMeshMatrix( placedGeometry.flatTransformation );
			mesh.matrixAutoUpdate = false;
			return mesh;

		}

		function getBufferGeometry( modelID, placedGeometry ) {

			var geometry = ifcAPI.GetGeometry(
				modelID,
				placedGeometry.geometryExpressID
			);
			var verts = ifcAPI.GetVertexArray(
				geometry.GetVertexData(),
				geometry.GetVertexDataSize()
			);
			var indices = ifcAPI.GetIndexArray(
				geometry.GetIndexData(),
				geometry.GetIndexDataSize()
			);
			var bufferGeometry = ifcGeometryToBuffer( verts, indices );
			return bufferGeometry;

		}

		function getMeshMaterial( color ) {

			var col = new Color( color.x, color.y, color.z );
			var material = new MeshPhongMaterial( { color: col, side: DoubleSide } );
			material.transparent = color.w !== 1;
			if ( material.transparent ) material.opacity = color.w;
			return material;

		}

		function getMeshMatrix( matrix ) {

			var mat = new Matrix4();
			mat.fromArray( matrix );
			// mat.elements[15 - 3] *= 0.001;
			// mat.elements[15 - 2] *= 0.001;
			// mat.elements[15 - 1] *= 0.001;
			return mat;

		}

		function ifcGeometryToBuffer( vertexData, indexData ) {

			var geometry = new BufferGeometry();
			var buffer32 = new InterleavedBuffer( vertexData, 6 );
			geometry.setAttribute(
				'position',
				new InterleavedBufferAttribute( buffer32, 3, 0 )
			);
			geometry.setAttribute(
				'normal',
				new InterleavedBufferAttribute( buffer32, 3, 3 )
			);
			geometry.setIndex( new BufferAttribute( indexData, 1 ) );
			return geometry;

		}

	}
} );

export { IFCLoader };
