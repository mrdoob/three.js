/**
 * @author Kai Salmen / https://kaisalmen.de
 * Development repository: https://github.com/kaisalmen/WWOBJLoader
 */

import {
	BufferGeometry,
	Object3D
} from "../../../../../build/three.module.js";

/**
 * Define a fixed structure that is used to ship data in between main and workers.
 */
class MeshMessageStructure {

	/**
	 * Creates a new {@link MeshMessageStructure}.
	 *
	 * @param {string} cmd
	 * @param {string} id
	 * @param {string} meshName
	 */
	constructor( cmd, id, meshName ) {
		this.main = {
			cmd: cmd,
			type: 'mesh',
			id: id,
			meshName: meshName,
			progress: {
				numericalValue: 0
			},
			params: {
				// 0: mesh, 1: line, 2: point
				geometryType: 0
			},
			materials: {
				/** @type {string|null} */
				json: null,
				multiMaterial: false,
				/** @type {string[]} */
				materialNames: [],
				/** @type {object[]} */
				materialGroups: []
			},
			buffers: {
				/** @type {ArrayBuffer}	*/
				vertices: null,
				/** @type {ArrayBuffer}	*/
				indices: null,
				/** @type {ArrayBuffer}	*/
				colors: null,
				/** @type {ArrayBuffer}	*/
				normals: null,
				/** @type {ArrayBuffer}	*/
				uvs: null,
				/** @type {ArrayBuffer}	*/
				skinIndex: null,
				/** @type {ArrayBuffer}	*/
				skinWeight: null
			}
		};
		this.transferables = {
			/** @type {ArrayBuffer[]} */
			vertex: null,
			/** @type {ArrayBuffer[]} */
			index: null,
			/** @type {ArrayBuffer[]} */
			color: null,
			/** @type {ArrayBuffer[]} */
			normal: null,
			/** @type {ArrayBuffer[]} */
			uv: null,
			/** @type {ArrayBuffer[]} */
			skinIndex: null,
			/** @type {ArrayBuffer[]} */
			skinWeight: null
		};

	}

	/**
	 * Clone the input which can be a complete {@link MeshMessageStructure} or a config following the structure to a
	 * {@link MeshMessageStructure}.
	 *
	 * @param {object|MeshMessageStructure} input
	 * @return {MeshMessageStructure}
	 */
	static cloneMessageStructure( input ) {
		let output = new MeshMessageStructure( input.main.cmd, input.main.meshName );
		output.main.type = input.main.type;
		output.main.progress.numericalValue = input.main.progress.numericalValue;
		output.main.params.geometryType = input.main.params.geometryType;
		output.main.materials.multiMaterial = input.main.materials.multiMaterial;
		output.main.materials.materialNames = input.main.materials.materialNames;
		output.main.materials.materialGroups = input.main.materials.materialGroups;

		if ( input.main.buffers.vertices !== null ) {

			output.main.buffers.vertices = input.main.buffers.vertices;
			let arrayOut = new Float32Array( input.main.buffers.vertices.length );
			MeshMessageStructure.copyTypedArray( input.main.buffers.vertices, arrayOut )
			output.transferables.vertex = [ arrayOut.buffer ];

		}
		if ( input.main.buffers.indices !== null ) {

			output.main.buffers.indices = input.main.buffers.indices;
			let arrayOut = new Uint32Array( input.main.buffers.indices );
			MeshMessageStructure.copyTypedArray( input.main.buffers.indices, arrayOut );
			output.transferables.index = [ arrayOut.buffer ];

		}
		if ( input.main.buffers.colors !== null ) {

			output.main.buffers.colors = input.main.buffers.colors;
			let arrayOut = new Float32Array( input.main.buffers.colors.length );
			MeshMessageStructure.copyTypedArray( input.main.buffers.colors, arrayOut )
			output.transferables.color = [ arrayOut.buffer ];

		}
		if ( input.main.buffers.normals !== null ) {

			output.main.buffers.normals = input.main.buffers.normals;
			let arrayOut = new Float32Array( input.main.buffers.normals.length );
			MeshMessageStructure.copyTypedArray( input.main.buffers.normals, arrayOut )
			output.transferables.normal = [ arrayOut.buffer ];

		}
		if ( input.main.buffers.uvs !== null ) {

			output.main.buffers.uvs = input.main.buffers.uvs;
			let arrayOut = new Float32Array( input.main.buffers.uvs.length );
			MeshMessageStructure.copyTypedArray( input.main.buffers.uvs, arrayOut )
			output.transferables.uv = [ arrayOut.buffer ];

		}
		if ( input.main.buffers.skinIndex !== null ) {

			output.main.buffers.skinIndex = input.main.buffers.skinIndex;
			let arrayOut = new Float32Array( input.main.buffers.skinIndex.length );
			MeshMessageStructure.copyTypedArray( input.main.buffers.skinIndex, arrayOut )
			output.transferables.skinIndex = [ arrayOut.buffer ];

		}
		if ( input.main.buffers.skinWeight !== null ) {

			output.main.buffers.skinWeight = input.main.buffers.skinWeight;
			let arrayOut = new Float32Array( input.main.buffers.skinWeight.length );
			MeshMessageStructure.copyTypedArray( input.main.buffers.skinWeight, arrayOut )
			output.transferables.skinWeight = [ arrayOut.buffer ];

		}
		return output;

	}

	/**
	 * Copies all values of input {@link ArrayBuffer} to output {@link ArrayBuffer}.
	 * @param {ArrayBuffer} arrayIn
	 * @param {ArrayBuffer} arrayOut
	 */
	static copyTypedArray ( arrayIn, arrayOut ) {

		for ( let i = 0; i < arrayIn.length; i++ ) arrayOut[ i ] = arrayIn[ i ];

	}

	/**
	 * Posts a message by invoking the method on the provided object.
	 *
	 * @param {object} postMessageImpl
	 */
	postMessage( postMessageImpl ) {

		postMessageImpl.postMessage( this.main, this.transferables );

	}

}

/**
 * Utility class that helps to transform meshes and especially {@link BufferGeometry} to message with transferables.
 * Structure that is used to ship data in between main and workers is defined {@link MeshMessageStructure}.
 */
class TransferableUtils {

	/**
	 * Walk a mesh and on ever geometry call the callback function.
	 *
	 * @param {Object3D} rootNode
	 * @param {Function} callback
	 */
	static walkMesh( rootNode, callback ) {
		let scope = this;
		let _walk_ = function ( object3d ) {
			console.info( 'Walking: ' + object3d.name );

			if ( object3d.hasOwnProperty( 'geometry' ) && object3d[ 'geometry' ] instanceof BufferGeometry ) {
				let payload = TransferableUtils.packageBufferGeometry( object3d[ 'geometry' ], rootNode, object3d.name, 0,['TBD'] );
				callback( payload.main, payload.transferables );

			}
			if ( object3d.hasOwnProperty( 'material' ) ) {

				let mat = object3d.material;
				if ( mat.hasOwnProperty( 'materials' ) ) {

					let materials = mat.materials;
					for ( let name in materials ) {

						if ( materials.hasOwnProperty( name ) ) {

							console.log( materials[ name ] );

						}

					}

				} else {

					console.log( mat.name );

				}

			}
		};
		rootNode.traverse( _walk_ );

	}


	/**
	 * Package {@link BufferGeometry} into {@link MeshMessageStructure}
	 *
	 * @param {BufferGeometry} bufferGeometry
	 * @param {string} id
	 * @param {string} meshName
	 * @param {number} geometryType
	 * @param {string[]} [materialNames]
	 * @return {MeshMessageStructure}
	 */
	static packageBufferGeometry( bufferGeometry, id, meshName, geometryType, materialNames ) {
		let vertexBA = bufferGeometry.getAttribute( 'position' );
		let indexBA = bufferGeometry.getIndex();
		let colorBA = bufferGeometry.getAttribute( 'color' );
		let normalBA = bufferGeometry.getAttribute( 'normal' );
		let uvBA = bufferGeometry.getAttribute( 'uv' );
		let skinIndexBA = bufferGeometry.getAttribute( 'skinIndex' );
		let skinWeightBA = bufferGeometry.getAttribute( 'skinWeight' );
		let vertexFA = (vertexBA !== null && vertexBA !== undefined) ? vertexBA.array : null;
		let indexUA = (indexBA !== null && indexBA !== undefined) ? indexBA.array : null;
		let colorFA = (colorBA !== null && colorBA !== undefined) ? colorBA.array : null;
		let normalFA = (normalBA !== null && normalBA !== undefined) ? normalBA.array : null;
		let uvFA = (uvBA !== null && uvBA !== undefined) ? uvBA.array : null;
		let skinIndexFA = (skinIndexBA !== null && skinIndexBA !== undefined) ? skinIndexBA.array : null;
		let skinWeightFA = (skinWeightBA !== null && skinWeightBA !== undefined) ? skinWeightBA.array : null;


		let payload = new MeshMessageStructure( 'execComplete', id, meshName );
		payload.main.params.geometryType = geometryType;
		payload.main.materials.materialNames = materialNames;
		if ( vertexFA !== null ) {

			payload.main.buffers.vertices = vertexFA;
			payload.transferables.vertex = [ vertexFA.buffer ];

		}
		if ( indexUA !== null ) {

			payload.main.buffers.indices = indexUA;
			payload.transferables.index = [ indexUA.buffer ];

		}
		if ( colorFA !== null ) {

			payload.main.buffers.colors = colorFA;
			payload.transferables.color = [ colorFA.buffer ];

		}
		if ( normalFA !== null ) {

			payload.main.buffers.normals = normalFA;
			payload.transferables.normal = [ normalFA.buffer ];

		}
		if ( uvFA !== null ) {

			payload.main.buffers.uvs = uvFA;
			payload.transferables.uv = [ uvFA.buffer ];

		}
		if ( skinIndexFA !== null ) {

			payload.main.buffers.skinIndex = skinIndexFA;
			payload.transferables.skinIndex = [ skinIndexFA.buffer ];

		}
		if ( skinWeightFA !== null ) {

			payload.main.buffers.skinWeight = skinWeightFA;
			payload.transferables.skinWeight = [ skinWeightFA.buffer ];

		}
		return payload;
	}

}

class ObjectManipulator {

	/**
	 * Applies values from parameter object via set functions or via direct assignment.
	 *
	 * @param {Object} objToAlter The objToAlter instance
	 * @param {Object} params The parameter object
	 * @param {boolean} forceCreation Force the creation of a property
	 */
	static applyProperties ( objToAlter, params, forceCreation ) {

		// fast-fail
		if ( objToAlter === undefined || objToAlter === null || params === undefined || params === null ) return;

		let property, funcName, values;
		for ( property in params ) {

			funcName = 'set' + property.substring( 0, 1 ).toLocaleUpperCase() + property.substring( 1 );
			values = params[ property ];

			if ( typeof objToAlter[ funcName ] === 'function' ) {

				objToAlter[ funcName ]( values );

			} else if ( objToAlter.hasOwnProperty( property ) || forceCreation ) {

				objToAlter[ property ] = values;

			}

		}

	}
}

export { TransferableUtils, MeshMessageStructure, ObjectManipulator }
