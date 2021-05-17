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
} from '../../../build/three.module.js';

const ifcAPI = new IfcAPI();

class IFCLoader extends Loader {

	constructor( manager ) {

		super( manager );

	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( scope.manager );
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

	}

	async parse( buffer ) {

		if ( ifcAPI.wasmModule === undefined ) {

			await ifcAPI.Init();

		}

		const data = new Uint8Array( buffer );
		const modelID = ifcAPI.OpenModel( 'example.ifc', data );
		return loadAllGeometry( modelID );

		function loadAllGeometry( modelID ) {

			const flatMeshes = getFlatMeshes( modelID );
			const mainObject = new Object3D();
			for ( let i = 0; i < flatMeshes.size(); i ++ ) {

				const placedGeometries = flatMeshes.get( i ).geometries;
				for ( let j = 0; j < placedGeometries.size(); j ++ )
					mainObject.add( getPlacedGeometry( modelID, placedGeometries.get( j ) ) );

			}

			return mainObject;

		}

		function getFlatMeshes( modelID ) {

			const flatMeshes = ifcAPI.LoadAllGeometry( modelID );
			return flatMeshes;

		}

		function getPlacedGeometry( modelID, placedGeometry ) {

			const geometry = getBufferGeometry( modelID, placedGeometry );
			const material = getMeshMaterial( placedGeometry.color );
			const mesh = new Mesh( geometry, material );
			mesh.matrix = getMeshMatrix( placedGeometry.flatTransformation );
			mesh.matrixAutoUpdate = false;
			return mesh;

		}

		function getBufferGeometry( modelID, placedGeometry ) {

			const geometry = ifcAPI.GetGeometry(
				modelID,
				placedGeometry.geometryExpressID
			);
			const verts = ifcAPI.GetVertexArray(
				geometry.GetVertexData(),
				geometry.GetVertexDataSize()
			);
			const indices = ifcAPI.GetIndexArray(
				geometry.GetIndexData(),
				geometry.GetIndexDataSize()
			);
			const bufferGeometry = ifcGeometryToBuffer( verts, indices );
			return bufferGeometry;

		}

		function getMeshMaterial( color ) {

			const col = new Color( color.x, color.y, color.z );
			const material = new MeshPhongMaterial( { color: col, side: DoubleSide } );
			material.transparent = color.w !== 1;
			if ( material.transparent ) material.opacity = color.w;
			return material;

		}

		function getMeshMatrix( matrix ) {

			const mat = new Matrix4();
			mat.fromArray( matrix );
			// mat.elements[15 - 3] *= 0.001;
			// mat.elements[15 - 2] *= 0.001;
			// mat.elements[15 - 1] *= 0.001;
			return mat;

		}

		function ifcGeometryToBuffer( vertexData, indexData ) {

			const geometry = new BufferGeometry();
			const buffer32 = new InterleavedBuffer( vertexData, 6 );
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

	setWasmPath( path ) {

		ifcAPI.SetWasmPath( path );

	}

}

export { IFCLoader };
