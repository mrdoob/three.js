/**
  * @author Kai Salmen / https://kaisalmen.de
  * Development repository: https://github.com/kaisalmen/WWOBJLoader
  */

'use strict';


if ( THREE.LoaderSupport === undefined ) { THREE.LoaderSupport = {} }


THREE.LoaderSupport.Validator = {

	/**
	 * If given input is null or undefined, false is returned otherwise true.
	 *
	 * @param input Can be anything
	 * @returns {boolean}
	 */
	isValid: function( input ) {
		return ( input !== null && input !== undefined );
	},

	/**
	 * If given input is null or undefined, the defaultValue is returned otherwise the given input.
	 *
	 * @param input Can be anything
	 * @param defaultValue Can be anything
	 * @returns {*}
	 */
	verifyInput: function( input, defaultValue ) {
		return ( input === null || input === undefined ) ? defaultValue : input;
	}
};


THREE.LoaderSupport.MeshReceiver = function() {
	console.info( 'Using THREE.LoaderSupport.MeshReceiver version: ' + THREE.LoaderSupport.MeshReceiver.MESH_RECEIVER_VERSION );

	this.validator = THREE.LoaderSupport.Validator;

	this.logging = {
		enabled: true,
		debug: false
	};

	this.callbacks = {
		onParseProgress: null,
		onMeshAlter: null,
		onLoadMaterials: null
	};
	this.materials = [];
};
THREE.LoaderSupport.MeshReceiver.MESH_RECEIVER_VERSION = '2.0.0-dev';


THREE.LoaderSupport.MeshReceiver.prototype = {

	constructor: THREE.LoaderSupport.MeshReceiver,

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
	 * Initializes the MeshBuilder (currently only default material initialisation).
	 *
	 */
	setBaseObject3d: function ( baseObject3d ) {
		this.baseObject3d = baseObject3d;
	},

	createDefaultMaterials: function () {
		var defaultMaterial = new THREE.MeshStandardMaterial( { color: 0xDCF1FF } );
		defaultMaterial.name = 'defaultMaterial';

		var defaultVertexColorMaterial = new THREE.MeshStandardMaterial( { color: 0xDCF1FF } );
		defaultVertexColorMaterial.name = 'defaultVertexColorMaterial';
		defaultVertexColorMaterial.vertexColors = THREE.VertexColors;

		var defaultLineMaterial = new THREE.LineBasicMaterial();
		defaultLineMaterial.name = 'defaultLineMaterial';

		var defaultPointMaterial = new THREE.PointsMaterial( { size: 0.1 } );
		defaultPointMaterial.name = 'defaultPointMaterial';

		var runtimeMaterials = {};
		runtimeMaterials[ defaultMaterial.name ] = defaultMaterial;
		runtimeMaterials[ defaultVertexColorMaterial.name ] = defaultVertexColorMaterial;
		runtimeMaterials[ defaultLineMaterial.name ] = defaultLineMaterial;
		runtimeMaterials[ defaultPointMaterial.name ] = defaultPointMaterial;

		this.updateMaterials(
			{
				cmd: 'data',
				type: 'material',
				materials: {
					materialCloneInstructions: null,
					serializedMaterials: null,
					runtimeMaterials: runtimeMaterials
				}
			}
		);
	},

	/**
	 * Set materials loaded by any supplier of an Array of {@link THREE.Material}.
	 *
	 * @param {THREE.Material[]} materials Array of {@link THREE.Material}
	 */
	setMaterials: function ( materials ) {
		var payload = {
			cmd: 'data',
			type: 'material',
			materials: {
				materialCloneInstructions: null,
				serializedMaterials: null,
				runtimeMaterials: this.validator.isValid( this.callbacks.onLoadMaterials ) ? this.callbacks.onLoadMaterials( materials ) : materials
			}
		};
		this.updateMaterials( payload );
	},

	_setCallbacks: function ( onParseProgress, onMeshAlter, onLoadMaterials ) {
		if ( this.validator.isValid( onParseProgress ) ) this.callbacks.onParseProgress = onParseProgress;
		if ( this.validator.isValid( onMeshAlter ) ) this.callbacks.onMeshAlter = onMeshAlter;
		if ( this.validator.isValid( onLoadMaterials ) ) this.callbacks.onLoadMaterials = onLoadMaterials;
	},

	/**
	 * Delegates processing of the payload (mesh building or material update) to the corresponding functions (BW-compatibility).
	 *
	 * @param {Object} payload Raw Mesh or Material descriptions.
	 * @returns {THREE.Mesh[]} mesh Array of {@link THREE.Mesh} or null in case of material update
	 */
	processPayload: function ( payload ) {
		if ( payload.type === 'mesh' ) {

			return this.buildMeshes( payload );

		} else if ( payload.type === 'material' ) {

			this.updateMaterials( payload );
			return null;

		}
	},

	/**
	 * Builds one or multiple meshes from the data described in the payload (buffers, params, material info).
	 *
	 * @param {Object} meshPayload Raw mesh description (buffers, params, materials) used to build one to many meshes.
	 * @returns {THREE.Mesh[]} mesh Array of {@link THREE.Mesh}
	 */
	buildMeshes: function ( meshPayload ) {
		var meshName = meshPayload.params.meshName;

		var bufferGeometry = new THREE.BufferGeometry();
		bufferGeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( meshPayload.buffers.vertices ), 3 ) );
		if ( this.validator.isValid( meshPayload.buffers.indices ) ) {

			bufferGeometry.setIndex( new THREE.BufferAttribute( new Uint32Array( meshPayload.buffers.indices ), 1 ) );

		}
		var haveVertexColors = this.validator.isValid( meshPayload.buffers.colors );
		if ( haveVertexColors ) {

			bufferGeometry.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( meshPayload.buffers.colors ), 3 ) );

		}
		if ( this.validator.isValid( meshPayload.buffers.normals ) ) {

			bufferGeometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( meshPayload.buffers.normals ), 3 ) );

		} else {

			bufferGeometry.computeVertexNormals();

		}
		if ( this.validator.isValid( meshPayload.buffers.uvs ) ) {

			bufferGeometry.addAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( meshPayload.buffers.uvs ), 2 ) );

		}

		var material, materialName, key;
		var materialNames = meshPayload.materials.materialNames;
		var createMultiMaterial = meshPayload.materials.multiMaterial;
		var multiMaterials = [];
		for ( key in materialNames ) {

			materialName = materialNames[ key ];
			material = this.materials[ materialName ];
			if ( createMultiMaterial ) multiMaterials.push( material );

		}
		if ( createMultiMaterial ) {

			material = multiMaterials;
			var materialGroups = meshPayload.materials.materialGroups;
			var materialGroup;
			for ( key in materialGroups ) {

				materialGroup = materialGroups[ key ];
				bufferGeometry.addGroup( materialGroup.start, materialGroup.count, materialGroup.index );

			}

		}

		var meshes = [];
		var mesh;
		var callbackOnMeshAlter = this.callbacks.onMeshAlter;
		var callbackOnMeshAlterResult;
		var useOrgMesh = true;
		var geometryType = this.validator.verifyInput( meshPayload.geometryType, 0 );
		if ( this.validator.isValid( callbackOnMeshAlter ) ) {

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
			if ( this.validator.isValid( callbackOnMeshAlterResult ) ) {

				if ( callbackOnMeshAlterResult.isDisregardMesh() ) {

					useOrgMesh = false;

				} else if ( callbackOnMeshAlterResult.providesAlteredMeshes() ) {

					for ( var i in callbackOnMeshAlterResult.meshes ) {

						meshes.push( callbackOnMeshAlterResult.meshes[ i ] );

					}
					useOrgMesh = false;

				}

			}

		}
		if ( useOrgMesh ) {

			if ( meshPayload.computeBoundingSphere ) bufferGeometry.computeBoundingSphere();
			if ( geometryType === 0 ) {

				mesh = new THREE.Mesh( bufferGeometry, material );

			} else if ( geometryType === 1 ) {

				mesh = new THREE.LineSegments( bufferGeometry, material );

			} else {

				mesh = new THREE.Points( bufferGeometry, material );

			}
			mesh.name = meshName;
			meshes.push( mesh );

		}

		var progressMessage = meshPayload.params.meshName;
		if ( this.validator.isValid( meshes ) && meshes.length > 0 ) {

			var meshNames = [];
			for ( var i in meshes ) {

				mesh = meshes[ i ];
				meshNames[ i ] = mesh.name;

			}
			progressMessage += ': Adding mesh(es) (' + meshNames.length + ': ' + meshNames + ') from input mesh: ' + meshName;
			progressMessage += ' (' + ( meshPayload.progress.numericalValue * 100).toFixed( 2 ) + '%)';

		} else {

			progressMessage += ': Not adding mesh: ' + meshName;
			progressMessage += ' (' + ( meshPayload.progress.numericalValue * 100).toFixed( 2 ) + '%)';

		}
		var callbackOnParseProgress = this.callbacks.onParseProgress;
		if ( this.validator.isValid( callbackOnParseProgress ) ) {

			callbackOnParseProgress( 'progress', progressMessage, meshPayload.progress.numericalValue );

		}

		this.addToBaseObject3d( meshes );
	},

	addToBaseObject3d: function( meshes ) {
		var mesh;
		for ( var i in meshes ) {

			mesh = meshes[ i ];
			this.baseObject3d.add( mesh );

		}
	},

	/**
	 * Updates the materials with contained material objects (sync) or from alteration instructions (async).
	 s	 *
	 * @param {Object} materialPayload Material update instructions
	 */
	updateMaterials: function ( materialPayload ) {
		var material, materialName;
		var materialCloneInstructions = materialPayload.materials.materialCloneInstructions;
		if ( this.validator.isValid( materialCloneInstructions ) ) {

			var materialNameOrg = materialCloneInstructions.materialNameOrg;
			if ( this.validator.isValid( materialNameOrg ) ) {

				var materialOrg = this.materials[ materialNameOrg ];
				material = materialOrg.clone();

				materialName = materialCloneInstructions.materialName;
				material.name = materialName;

				var materialProperties = materialCloneInstructions.materialProperties;
				for ( var key in materialProperties ) {

					if ( material.hasOwnProperty( key ) && materialProperties.hasOwnProperty( key ) ) material[ key ] = materialProperties[ key ];

				}
				this.materials[ materialName ] = material;

			} else {

				console.warn( 'Requested material "' + materialNameOrg + '" is not available!' );

			}
		}

		var materials = materialPayload.materials.serializedMaterials;
		if ( this.validator.isValid( materials ) && Object.keys( materials ).length > 0 ) {

			var loader = new THREE.MaterialLoader();
			var materialJson;
			for ( materialName in materials ) {

				materialJson = materials[ materialName ];
				if ( this.validator.isValid( materialJson ) ) {

					material = loader.parse( materialJson );
					if ( this.logging.enabled ) console.info( 'De-serialized material with name "' + materialName + '" will be added.' );
					this.materials[ materialName ] = material;
				}

			}

		}

		materials = materialPayload.materials.runtimeMaterials;
		if ( this.validator.isValid( materials ) && Object.keys( materials ).length > 0 ) {

			for ( materialName in materials ) {

				material = materials[ materialName ];
				if ( this.logging.enabled ) console.info( 'Material with name "' + materialName + '" will be added.' );
				this.materials[ materialName ] = material;

			}

		}
	},

	/**
	 * Returns the mapping object of material name and corresponding jsonified material.
	 *
	 * @returns {Object} Map of Materials in JSON representation
	 */
	getMaterialsJSON: function () {
		var materialsJSON = {};
		var material;
		for ( var materialName in this.materials ) {

			material = this.materials[ materialName ];
			materialsJSON[ materialName ] = material.toJSON();
		}

		return materialsJSON;
	},

	/**
	 * Returns the mapping object of material name and corresponding material.
	 *
	 * @returns {Object} Map of {@link THREE.Material}
	 */
	getMaterials: function () {
		return this.materials;
	}

};


/**
 * Object to return by callback onMeshAlter. Used to disregard a certain mesh or to return one to many meshes.
 * @class
 *
 * @param {boolean} disregardMesh=false Tell implementation to completely disregard this mesh
 * @param {boolean} disregardMesh=false Tell implementation that mesh(es) have been altered or added
 */
THREE.LoaderSupport.LoadedMeshUserOverride = function( disregardMesh, alteredMesh ) {
	this.disregardMesh = disregardMesh === true;
	this.alteredMesh = alteredMesh === true;
	this.meshes = [];
};


THREE.LoaderSupport.LoadedMeshUserOverride.prototype = {

	constructor: THREE.LoaderSupport.LoadedMeshUserOverride,

	/**
	 * Add a mesh created within callback.
	 *
	 * @param {THREE.Mesh} mesh
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


/**
 *
 * @constructor
 */
THREE.LoaderSupport.MeshTransmitter = function () {
	this.callbackDataReceiver = null;
	this.defaultGeometryType = 2;
	this.defaultMaterials = [ 'defaultMaterial', 'defaultLineMaterial', 'defaultPointMaterial' ];
};

THREE.LoaderSupport.MeshTransmitter.MESH_TRANSMITTER_VERSION = '1.0.0-dev';


THREE.LoaderSupport.MeshTransmitter.prototype = {

	constructor: THREE.LoaderSupport.MeshTransmitter,

	setCallbackDataReceiver: function ( callbackDataReceiver ) {
		this.callbackDataReceiver = callbackDataReceiver;
	},

	setDefaultGeometryType: function ( defaultGeometryType ) {
		this.defaultGeometryType = defaultGeometryType;
	},

	walkMesh: function ( rootNode ) {
		var scope = this;
		var _walk_ = function ( object3d ) {
			console.info( 'Walking: ' + object3d.name );

			if ( object3d.hasOwnProperty( 'geometry' ) && object3d[ 'geometry' ] instanceof THREE.BufferGeometry ) {

				scope.handleBufferGeometry( object3d[ 'geometry' ], object3d.name );

			}
			if ( object3d.hasOwnProperty( 'material' ) ) {

				var mat = object3d.material;
				if ( mat.hasOwnProperty( 'materials' ) ) {

					var materials = mat.materials;
					for ( var name in materials ) {

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

	},

	handleBufferGeometry: function ( bufferGeometry, objectName ) {
//			console.log ( bufferGeometry.attributes );
		var vertexBA = bufferGeometry.getAttribute( 'position' ) ;
		var indexBA = bufferGeometry.getIndex();
		var colorBA = bufferGeometry.getAttribute( 'color' );
		var normalBA = bufferGeometry.getAttribute( 'normal' );
		var uvBA = bufferGeometry.getAttribute( 'uv' );
		var vertexFA = ( vertexBA !== null && vertexBA !== undefined ) ? vertexBA.array: null;
		var indexUA = ( indexBA !== null && indexBA !== undefined ) ? indexBA.array: null;
		var colorFA = ( colorBA !== null && colorBA !== undefined ) ? colorBA.array: null;
		var normalFA = ( normalBA !== null && normalBA !== undefined ) ? normalBA.array: null;
		var uvFA = ( uvBA !== null && uvBA !== undefined ) ? uvBA.array: null;

		var materialNames = [ this.defaultMaterials[ this.defaultGeometryType ] ];
		this.callbackDataReceiver(
			{
				cmd: 'data',
				type: 'mesh',
				progress: {
					numericalValue: 0
				},
				params: {
					meshName: objectName
				},
				materials: {
					multiMaterial: false,
					materialNames: materialNames,
					materialGroups: []
				},
				buffers: {
					vertices: vertexFA,
					indices: indexUA,
					colors: colorFA,
					normals: normalFA,
					uvs: uvFA
				},
				// 0: mesh, 1: line, 2: point
				geometryType: this.defaultGeometryType
			},
			vertexFA !== null ?  [ vertexFA.buffer ] : null,
			indexUA !== null ?  [ indexUA.buffer ] : null,
			colorFA !== null ? [ colorFA.buffer ] : null,
			normalFA !== null ? [ normalFA.buffer ] : null,
			uvFA !== null ? [ uvFA.buffer ] : null
		);
	}
};