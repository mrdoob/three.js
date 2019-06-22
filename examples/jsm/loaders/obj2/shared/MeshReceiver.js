/**
 * @author Kai Salmen / https://kaisalmen.de
 * Development repository: https://github.com/kaisalmen/WWOBJLoader
 */

import {
	BufferAttribute,
	BufferGeometry,
	LineSegments,
	Mesh,
	Points
} from "../../../../../build/three.module.js";

import { MaterialHandler } from "./MaterialHandler.js";


/**
 *
 * @param {MaterialHandler} materialHandler
 * @constructor
 */
const MeshReceiver = function( materialHandler ) {
	this.logging = {
		enabled: true,
		debug: false
	};

	this.callbacks = {
		onParseProgress: null,
		onMeshAlter: null
	};
	this.materialHandler = materialHandler;
};

MeshReceiver.prototype = {

	constructor: MeshReceiver,

	/**
	 * Enable or disable logging in general (except warn and error), plus enable or disable debug logging.
	 *
	 * @param {boolean} enabled True or false.
	 * @param {boolean} debug True or false.
	 */
	setLogging:	function ( enabled, debug ) {
		this.logging.enabled = enabled === true;
		this.logging.debug = debug === true;
	},

	/**
	 *
	 * @param {Function} onParseProgress
	 * @param {Function} onMeshAlter
	 * @private
	 */
	_setCallbacks: function ( onParseProgress, onMeshAlter ) {
		if ( onParseProgress !== undefined && onParseProgress !== null ) {

			this.callbacks.onParseProgress = onParseProgress;

		}
		if ( onMeshAlter !== undefined && onMeshAlter !== null ) {

			this.callbacks.onMeshAlter = onMeshAlter;

		}
	},

	/**
	 * Builds one or multiple meshes from the data described in the payload (buffers, params, material info).
	 *
	 * @param {Object} meshPayload Raw mesh description (buffers, params, materials) used to build one to many meshes.
	 * @returns {Mesh[]} mesh Array of {@link Mesh}
	 */
	buildMeshes: function ( meshPayload ) {
		let meshName = meshPayload.params.meshName;

		let bufferGeometry = new BufferGeometry();
		bufferGeometry.addAttribute( 'position', new BufferAttribute( new Float32Array( meshPayload.buffers.vertices ), 3 ) );
		if ( meshPayload.buffers.indices !== null ) {

			bufferGeometry.setIndex( new BufferAttribute( new Uint32Array( meshPayload.buffers.indices ), 1 ) );

		}
		let haveVertexColors = meshPayload.buffers.colors  !== null;
		if ( haveVertexColors ) {

			bufferGeometry.addAttribute( 'color', new BufferAttribute( new Float32Array( meshPayload.buffers.colors ), 3 ) );

		}
		if ( meshPayload.buffers.normals !== null ) {

			bufferGeometry.addAttribute( 'normal', new BufferAttribute( new Float32Array( meshPayload.buffers.normals ), 3 ) );

		} else {

			bufferGeometry.computeVertexNormals();

		}
		if ( meshPayload.buffers.uvs  !== null ) {

			bufferGeometry.addAttribute( 'uv', new BufferAttribute( new Float32Array( meshPayload.buffers.uvs ), 2 ) );

		}
		if ( meshPayload.buffers.skinIndex !== null ) {

			bufferGeometry.addAttribute( 'skinIndex', new BufferAttribute( new Uint16Array( meshPayload.buffers.skinIndex ), 4 ) );

		}
		if ( meshPayload.buffers.skinWeight !== null ) {

			bufferGeometry.addAttribute( 'skinWeight', new BufferAttribute( new Float32Array( meshPayload.buffers.skinWeight ), 4 ) );

		}

		let material, materialName, key;
		let materialNames = meshPayload.materials.materialNames;
		let createMultiMaterial = meshPayload.materials.multiMaterial;
		let multiMaterials = [];
		for ( key in materialNames ) {

			materialName = materialNames[ key ];
			material = this.materialHandler.getMaterial( materialName );
			if ( createMultiMaterial ) multiMaterials.push( material );

		}
		if ( createMultiMaterial ) {

			material = multiMaterials;
			let materialGroups = meshPayload.materials.materialGroups;
			let materialGroup;
			for ( key in materialGroups ) {

				materialGroup = materialGroups[ key ];
				bufferGeometry.addGroup( materialGroup.start, materialGroup.count, materialGroup.index );

			}

		}

		let meshes = [];
		let mesh;
		let callbackOnMeshAlter = this.callbacks.onMeshAlter;
		let callbackOnMeshAlterResult;
		let useOrgMesh = true;
		let geometryType = meshPayload.geometryType === null ? 0 : meshPayload.geometryType;

		if ( callbackOnMeshAlter ) {

			callbackOnMeshAlterResult = callbackOnMeshAlter(
				{
					detail: {
						meshName: meshName,
						bufferGeometry: bufferGeometry,
						material: material,
						geometryType: geometryType
					}
				}
			);
		}

		// here LoadedMeshUserOverride is required to be provided by the callback used to alter the results
		if ( callbackOnMeshAlterResult ) {

			if ( callbackOnMeshAlterResult.isDisregardMesh() ) {

				useOrgMesh = false;

			} else if ( callbackOnMeshAlterResult.providesAlteredMeshes() ) {

				for ( let i in callbackOnMeshAlterResult.meshes ) {

					meshes.push( callbackOnMeshAlterResult.meshes[ i ] );

				}
				useOrgMesh = false;

			}

		}
		if ( useOrgMesh ) {

			if ( meshPayload.computeBoundingSphere ) bufferGeometry.computeBoundingSphere();
			if ( geometryType === 0 ) {

				mesh = new Mesh( bufferGeometry, material );

			} else if ( geometryType === 1 ) {

				mesh = new LineSegments( bufferGeometry, material );

			} else {

				mesh = new Points( bufferGeometry, material );

			}
			mesh.name = meshName;
			meshes.push( mesh );

		}

		let progressMessage = meshPayload.params.meshName;
		if ( meshes.length > 0 ) {

			let meshNames = [];
			for ( let i in meshes ) {

				mesh = meshes[ i ];
				meshNames[ i ] = mesh.name;

			}
			progressMessage += ': Adding mesh(es) (' + meshNames.length + ': ' + meshNames + ') from input mesh: ' + meshName;
			progressMessage += ' (' + ( meshPayload.progress.numericalValue * 100).toFixed( 2 ) + '%)';

		} else {

			progressMessage += ': Not adding mesh: ' + meshName;
			progressMessage += ' (' + ( meshPayload.progress.numericalValue * 100).toFixed( 2 ) + '%)';

		}
		let callbackOnParseProgress = this.callbacks.onParseProgress;
		if ( callbackOnParseProgress ) {

			callbackOnParseProgress( 'progress', progressMessage, meshPayload.progress.numericalValue );

		}

		return meshes;
	}

};

/**
 * Object to return by callback onMeshAlter. Used to disregard a certain mesh or to return one to many meshes.
 * @class
 *
 * @param {boolean} disregardMesh=false Tell implementation to completely disregard this mesh
 * @param {boolean} disregardMesh=false Tell implementation that mesh(es) have been altered or added
 */
const LoadedMeshUserOverride = function( disregardMesh, alteredMesh ) {
	this.disregardMesh = disregardMesh === true;
	this.alteredMesh = alteredMesh === true;
	this.meshes = [];
};


LoadedMeshUserOverride.prototype = {

	constructor: LoadedMeshUserOverride,

	/**
	 * Add a mesh created within callback.
	 *
	 * @param {Mesh} mesh
	 */
	addMesh: function ( mesh ) {
		this.meshes.push( mesh );
		this.alteredMesh = true;
	},

	/**
	 * Answers if mesh shall be disregarded completely.
	 *
	 * @returns {boolean}
	 */
	isDisregardMesh: function () {
		return this.disregardMesh;
	},

	/**
	 * Answers if new mesh(es) were created.
	 *
	 * @returns {boolean}
	 */
	providesAlteredMeshes: function () {
		return this.alteredMesh;
	}
};

export {
	MeshReceiver,
	LoadedMeshUserOverride
};
