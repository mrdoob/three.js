/**
  * @author Kai Salmen / https://kaisalmen.de
  * Development repository: https://github.com/kaisalmen/WWOBJLoader
  */

'use strict';

if ( THREE.LoaderSupport === undefined ) { THREE.LoaderSupport = {} }

/**
 * Validation functions.
 * @class
 */
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


/**
 * Logging wrapper for console.
 * @class
 *
 * @param {boolean} enabled=true Tell if logger is enabled.
 * @param {boolean} debug=false Toggle debug logging.
 */
THREE.LoaderSupport.ConsoleLogger = (function () {

	function ConsoleLogger( enabled, debug ) {
		this.enabled = enabled !== false;
		this.debug = debug === true;
	}

	/**
	 * Enable or disable debug logging.
	 * @memberOf THREE.LoaderSupport.ConsoleLogger
	 *
	 * @param {boolean} debug True or False
	 */
	ConsoleLogger.prototype.setDebug = function ( debug ) {
		this.debug = debug === true;
	};

	/**
	 * Returns if is enabled and debug.
	 * @memberOf THREE.LoaderSupport.ConsoleLogger
	 *
	 * @returns {boolean}
	 */
	ConsoleLogger.prototype.isDebug = function () {
		return this.isEnabled() && this.debug;
	};

	/**
	 * Enable or disable info, debug and time logging.
	 * @memberOf THREE.LoaderSupport.ConsoleLogger
	 *
	 * @param {boolean} enabled True or False
	 */
	ConsoleLogger.prototype.setEnabled = function ( enabled ) {
		this.enabled = enabled === true;
	};

	/**
	 * Returns if is enabled.
	 * @memberOf THREE.LoaderSupport.ConsoleLogger
	 *
	 * @returns {boolean}
	 */
	ConsoleLogger.prototype.isEnabled = function () {
		return this.enabled;
	};

	/**
	 * Log a debug message if enabled and debug is set.
	 * @memberOf THREE.LoaderSupport.ConsoleLogger
	 *
	 * @param {string} message Message to log
	 */
	ConsoleLogger.prototype.logDebug = function ( message ) {
		if ( this.enabled && this.debug ) console.info( message );
	};

	/**
	 * Log an info message if enabled.
	 * @memberOf THREE.LoaderSupport.ConsoleLogger
	 *
	 * @param {string} message Message to log
	 */
	ConsoleLogger.prototype.logInfo = function ( message ) {
		if ( this.enabled ) console.info( message );
	};

	/**
	 * Log a warn message (always).
	 * @memberOf THREE.LoaderSupport.ConsoleLogger
	 *
	 * @param {string} message Message to log
	 */
	ConsoleLogger.prototype.logWarn = function ( message ) {
		console.warn( message );
	};

	/**
	 * Log an error message (always).
	 * @memberOf THREE.LoaderSupport.ConsoleLogger
	 *
	 * @param {string} message Message to log
	 */
	ConsoleLogger.prototype.logError = function ( message ) {
		console.error( message );
	};

	/**
	 * Start time measurement with provided id.
	 * @memberOf THREE.LoaderSupport.ConsoleLogger
	 *
	 * @param {string} id Time identification
	 */
	ConsoleLogger.prototype.logTimeStart = function ( id ) {
		if ( this.enabled ) console.time( id );
	};

	/**
	 * Stop time measurement started with provided id.
	 * @memberOf THREE.LoaderSupport.ConsoleLogger
	 *
	 * @param {string} id Time identification
	 */
	ConsoleLogger.prototype.logTimeEnd = function ( id ) {
		if ( this.enabled ) console.timeEnd( id );
	};

	return ConsoleLogger;
})();

/**
 * Callbacks utilized by loaders and builder.
 * @class
 */
THREE.LoaderSupport.Callbacks = (function () {

	var Validator = THREE.LoaderSupport.Validator;

	function Callbacks() {
		this.onProgress = null;
		this.onMeshAlter = null;
		this.onLoad = null;
		this.onLoadMaterials = null;
	}

	/**
	 * Register callback function that is invoked by internal function "announceProgress" to print feedback.
	 * @memberOf THREE.LoaderSupport.Callbacks
	 *
	 * @param {callback} callbackOnProgress Callback function for described functionality
	 */
	Callbacks.prototype.setCallbackOnProgress = function ( callbackOnProgress ) {
		this.onProgress = Validator.verifyInput( callbackOnProgress, this.onProgress );
	};

	/**
	 * Register callback function that is called every time a mesh was loaded.
	 * Use {@link THREE.LoaderSupport.LoadedMeshUserOverride} for alteration instructions (geometry, material or disregard mesh).
	 * @memberOf THREE.LoaderSupport.Callbacks
	 *
	 * @param {callback} callbackOnMeshAlter Callback function for described functionality
	 */
	Callbacks.prototype.setCallbackOnMeshAlter = function ( callbackOnMeshAlter ) {
		this.onMeshAlter = Validator.verifyInput( callbackOnMeshAlter, this.onMeshAlter );
	};

	/**
	 * Register callback function that is called once loading of the complete OBJ file is completed.
	 * @memberOf THREE.LoaderSupport.Callbacks
	 *
	 * @param {callback} callbackOnLoad Callback function for described functionality
	 */
	Callbacks.prototype.setCallbackOnLoad = function ( callbackOnLoad ) {
		this.onLoad = Validator.verifyInput( callbackOnLoad, this.onLoad );
	};

	/**
	 * Register callback function that is called when materials have been loaded.
	 * @memberOf THREE.LoaderSupport.Callbacks
	 *
	 * @param {callback} callbackOnLoadMaterials Callback function for described functionality
	 */
	Callbacks.prototype.setCallbackOnLoadMaterials = function ( callbackOnLoadMaterials ) {
		this.onLoadMaterials = Validator.verifyInput( callbackOnLoadMaterials, this.onLoadMaterials );
	};

	return Callbacks;
})();


/**
 * Object to return by callback onMeshAlter. Used to disregard a certain mesh or to return one to many meshes.
 * @class
 *
 * @param {boolean} disregardMesh=false Tell implementation to completely disregard this mesh
 * @param {boolean} disregardMesh=false Tell implementation that mesh(es) have been altered or added
 */
THREE.LoaderSupport.LoadedMeshUserOverride = (function () {

	function LoadedMeshUserOverride( disregardMesh, alteredMesh ) {
		this.disregardMesh = disregardMesh === true;
		this.alteredMesh = alteredMesh === true;
		this.meshes = [];
	}

	/**
	 * Add a mesh created within callback.
	 *
	 * @memberOf THREE.OBJLoader2.LoadedMeshUserOverride
	 *
	 * @param {THREE.Mesh} mesh
	 */
	LoadedMeshUserOverride.prototype.addMesh = function ( mesh ) {
		this.meshes.push( mesh );
		this.alteredMesh = true;
	};

	/**
	 * Answers if mesh shall be disregarded completely.
	 *
	 * @returns {boolean}
	 */
	LoadedMeshUserOverride.prototype.isDisregardMesh = function () {
		return this.disregardMesh;
	};

	/**
	 * Answers if new mesh(es) were created.
	 *
	 * @returns {boolean}
	 */
	LoadedMeshUserOverride.prototype.providesAlteredMeshes = function () {
		return this.alteredMesh;
	};

	return LoadedMeshUserOverride;
})();


/**
 * A resource description used by {@link THREE.LoaderSupport.PrepData} and others.
 * @class
 *
 * @param {string} url URL to the file
 * @param {string} extension The file extension (type)
 */
THREE.LoaderSupport.ResourceDescriptor = (function () {

	var Validator = THREE.LoaderSupport.Validator;

	function ResourceDescriptor( url, extension ) {
		var urlParts = url.split( '/' );

		if ( urlParts.length < 2 ) {

			this.path = null;
			this.name = url;
			this.url = url;

		} else {

			this.path = Validator.verifyInput( urlParts.slice( 0, urlParts.length - 1).join( '/' ) + '/', null );
			this.name = Validator.verifyInput( urlParts[ urlParts.length - 1 ], null );
			this.url = url;

		}
		this.extension = Validator.verifyInput( extension, "default" );
		this.extension = this.extension.trim();
		this.content = null;
	}

	/**
	 * Set the content of this resource (String)
	 * @memberOf THREE.LoaderSupport.ResourceDescriptor
	 *
	 * @param {Object} content The file content as arraybuffer or text
	 */
	ResourceDescriptor.prototype.setContent = function ( content ) {
		this.content = Validator.verifyInput( content, null );
	};

	return ResourceDescriptor;
})();


/**
 * Configuration instructions to be used by run method.
 * @class
 */
THREE.LoaderSupport.PrepData = (function () {

	var Validator = THREE.LoaderSupport.Validator;

	function PrepData( modelName ) {
		this.modelName = Validator.verifyInput( modelName, '' );
		this.resources = [];
		this.streamMeshesTo = null;
		this.materialPerSmoothingGroup = false;
		this.useIndices = false;
		this.disregardNormals = false;
		this.callbacks = new THREE.LoaderSupport.Callbacks();
		this.crossOrigin;
		this.useAsync = false;
	}

	/**
	 * Set the node where the loaded objects will be attached directly.
	 * @memberOf THREE.LoaderSupport.PrepData
	 *
	 * @param {THREE.Object3D} streamMeshesTo Object already attached to scenegraph where new meshes will be attached to
	 */
	PrepData.prototype.setStreamMeshesTo = function ( streamMeshesTo ) {
		this.streamMeshesTo = Validator.verifyInput( streamMeshesTo, null );
	};

	/**
	 * Tells whether a material shall be created per smoothing group.
	 * @memberOf THREE.LoaderSupport.PrepData
	 *
	 * @param {boolean} materialPerSmoothingGroup=false
	 */
	PrepData.prototype.setMaterialPerSmoothingGroup = function ( materialPerSmoothingGroup ) {
		this.materialPerSmoothingGroup = materialPerSmoothingGroup === true;
	};

	/**
	 * Tells whether indices should be used
	 * @memberOf THREE.LoaderSupport.PrepData
	 *
	 * @param {boolean} useIndices=false
	 */
	PrepData.prototype.setUseIndices = function ( useIndices ) {
		this.useIndices = useIndices === true;
	};

	/**
	 * Tells whether normals should be completely disregarded and regenerated.
	 * @memberOf THREE.LoaderSupport.PrepData
	 *
	 * @param {boolean} disregardNormals=false
	 */
	PrepData.prototype.setDisregardNormals = function ( disregardNormals ) {
		this.disregardNormals = disregardNormals === true;
	};

	/**
	 * Returns all callbacks as {@link THREE.LoaderSupport.Callbacks}
	 * @memberOf THREE.LoaderSupport.PrepData
	 *
	 * @returns {THREE.LoaderSupport.Callbacks}
	 */
	PrepData.prototype.getCallbacks = function () {
		return this.callbacks;
	};

	/**
	 * Sets the CORS string to be used.
	 * @memberOf THREE.LoaderSupport.PrepData
	 *
	 * @param {string} crossOrigin CORS value
	 */
	PrepData.prototype.setCrossOrigin = function ( crossOrigin ) {
		this.crossOrigin = crossOrigin;
	};

	/**
	 * Add a resource description.
	 * @memberOf THREE.LoaderSupport.PrepData
	 *
	 * @param {THREE.LoaderSupport.ResourceDescriptor}
	 */
	PrepData.prototype.addResource = function ( resource ) {
		this.resources.push( resource );
	};

	/**
	 * If true uses async loading with worker, if false loads data synchronously.
	 * @memberOf THREE.LoaderSupport.PrepData
	 *
	 * @param {boolean} useAsync
	 */
	PrepData.prototype.setUseAsync = function ( useAsync ) {
		this.useAsync = useAsync === true;
	};

	/**
	 * Clones this object and returns it afterwards.
	 * @memberOf THREE.LoaderSupport.PrepData
	 *
	 * @returns {@link THREE.LoaderSupport.PrepData}
	 */
	PrepData.prototype.clone = function () {
		var clone = new THREE.LoaderSupport.PrepData( this.modelName );
		clone.resources = this.resources;
		clone.streamMeshesTo = this.streamMeshesTo;
		clone.materialPerSmoothingGroup = this.materialPerSmoothingGroup;
		clone.useIndices = this.useIndices;
		clone.disregardNormals = this.disregardNormals;
		clone.callbacks = this.callbacks;
		clone.crossOrigin = this.crossOrigin;
		clone.useAsync = this.useAsync;
		return clone;
	};

	return PrepData;
})();

/**
 * Builds one or many THREE.Mesh from one raw set of Arraybuffers, materialGroup descriptions and further parameters.
 * Supports vertex, vertexColor, normal, uv and index buffers.
 * @class
 */
THREE.LoaderSupport.Builder = (function () {

	var LOADER_BUILDER_VERSION = '1.1.1';

	var Validator = THREE.LoaderSupport.Validator;
	var ConsoleLogger = THREE.LoaderSupport.ConsoleLogger;

	function Builder( logger ) {
		this.logger = Validator.verifyInput( logger, new ConsoleLogger() );
		this.logger.logInfo( 'Using THREE.LoaderSupport.Builder version: ' + LOADER_BUILDER_VERSION );
		this.callbacks = new THREE.LoaderSupport.Callbacks();
		this.materials = [];
	}

	/**
	 * Set materials loaded by any supplier of an Array of {@link THREE.Material}.
	 * @memberOf THREE.LoaderSupport.Builder
	 *
	 * @param {THREE.Material[]} materials Array of {@link THREE.Material}
	 */
	Builder.prototype.setMaterials = function ( materials ) {
		var payload = {
			cmd: 'materialData',
			materials: {
				materialCloneInstructions: null,
				serializedMaterials: null,
				runtimeMaterials: Validator.isValid( this.callbacks.onLoadMaterials ) ? this.callbacks.onLoadMaterials( materials ) : materials
			}
		};
		this.updateMaterials( payload );
	};

	Builder.prototype._setCallbacks = function ( callbacks ) {
		if ( Validator.isValid( callbacks.onProgress ) ) this.callbacks.setCallbackOnProgress( callbacks.onProgress );
		if ( Validator.isValid( callbacks.onMeshAlter ) ) this.callbacks.setCallbackOnMeshAlter( callbacks.onMeshAlter );
		if ( Validator.isValid( callbacks.onLoad ) ) this.callbacks.setCallbackOnLoad( callbacks.onLoad );
		if ( Validator.isValid( callbacks.onLoadMaterials ) ) this.callbacks.setCallbackOnLoadMaterials( callbacks.onLoadMaterials );
	};

	/**
	 * Delegates processing of the payload (mesh building or material update) to the corresponding functions (BW-compatibility).
	 * @memberOf THREE.LoaderSupport.Builder
	 *
	 * @param {Object} payload Raw Mesh or Material descriptions.
	 * @returns {THREE.Mesh[]} mesh Array of {@link THREE.Mesh} or null in case of material update
	 */
	Builder.prototype.processPayload = function ( payload ) {
		if ( payload.cmd === 'meshData' ) {

			return this.buildMeshes( payload );

		} else if ( payload.cmd === 'materialData' ) {

			this.updateMaterials( payload );
			return null;

		}
	};

	/**
	 * Builds one or multiple meshes from the data described in the payload (buffers, params, material info).
	 * @memberOf THREE.LoaderSupport.Builder
	 *
	 * @param {Object} meshPayload Raw mesh description (buffers, params, materials) used to build one to many meshes.
	 * @returns {THREE.Mesh[]} mesh Array of {@link THREE.Mesh}
	 */
	Builder.prototype.buildMeshes = function ( meshPayload ) {
		var meshName = meshPayload.params.meshName;

		var bufferGeometry = new THREE.BufferGeometry();
		bufferGeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( meshPayload.buffers.vertices ), 3 ) );
		if ( Validator.isValid( meshPayload.buffers.indices ) ) {

			bufferGeometry.setIndex( new THREE.BufferAttribute( new Uint32Array( meshPayload.buffers.indices ), 1 ));

		}
		var haveVertexColors = Validator.isValid( meshPayload.buffers.colors );
		if ( haveVertexColors ) {

			bufferGeometry.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( meshPayload.buffers.colors ), 3 ) );

		}
		if ( Validator.isValid( meshPayload.buffers.normals ) ) {

			bufferGeometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( meshPayload.buffers.normals ), 3 ) );

		} else {

			bufferGeometry.computeVertexNormals();

		}
		if ( Validator.isValid( meshPayload.buffers.uvs ) ) {

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
		if ( Validator.isValid( callbackOnMeshAlter ) ) {

			callbackOnMeshAlterResult = callbackOnMeshAlter(
				{
					detail: {
						meshName: meshName,
						bufferGeometry: bufferGeometry,
						material: material
					}
				}
			);
			if ( Validator.isValid( callbackOnMeshAlterResult ) ) {

				if ( ! callbackOnMeshAlterResult.isDisregardMesh() && callbackOnMeshAlterResult.providesAlteredMeshes() ) {

					for ( var i in callbackOnMeshAlterResult.meshes ) {

						meshes.push( callbackOnMeshAlterResult.meshes[ i ] );

					}

				}
				useOrgMesh = false;

			}

		}
		if ( useOrgMesh ) {

			mesh = new THREE.Mesh( bufferGeometry, material );
			mesh.name = meshName;
			meshes.push( mesh );

		}

		var progressMessage;
		if ( Validator.isValid( meshes ) && meshes.length > 0 ) {

			var meshNames = [];
			for ( var i in meshes ) {

				mesh = meshes[ i ];
				meshNames[ i ] = mesh.name;

			}
			progressMessage = 'Adding mesh(es) (' + meshNames.length + ': ' + meshNames + ') from input mesh: ' + meshName;
			progressMessage += ' (' + ( meshPayload.progress.numericalValue * 100 ).toFixed( 2 ) + '%)';

		} else {

			progressMessage = 'Not adding mesh: ' + meshName;
			progressMessage += ' (' + ( meshPayload.progress.numericalValue * 100 ).toFixed( 2 ) + '%)';

		}
		var callbackOnProgress = this.callbacks.onProgress;
		if ( Validator.isValid( callbackOnProgress ) ) {

			var event = new CustomEvent( 'BuilderEvent', {
				detail: {
					type: 'progress',
					modelName: meshPayload.params.meshName,
					text: progressMessage,
					numericalValue: meshPayload.progress.numericalValue
				}
			} );
			callbackOnProgress( event );

		}

		return meshes;
	};

	/**
	 * Updates the materials with contained material objects (sync) or from alteration instructions (async).
	 * @memberOf THREE.LoaderSupport.Builder
	 *
	 * @param {Object} materialPayload Material update instructions
	 */
	Builder.prototype.updateMaterials = function ( materialPayload ) {
		var material, materialName;
		var materialCloneInstructions = materialPayload.materials.materialCloneInstructions;
		if ( Validator.isValid( materialCloneInstructions ) ) {

			var materialNameOrg = materialCloneInstructions.materialNameOrg;
			var materialOrg = this.materials[ materialNameOrg ];
			material = materialOrg.clone();

			materialName = materialCloneInstructions.materialName;
			material.name = materialName;

			var materialProperties = materialCloneInstructions.materialProperties;
			for ( var key in materialProperties ) {

				if ( material.hasOwnProperty( key ) && materialProperties.hasOwnProperty( key ) ) material[ key ] = materialProperties[ key ];

			}
			this.materials[ materialName ] = material;

		}

		var materials = materialPayload.materials.serializedMaterials;
		if ( Validator.isValid( materials ) && Object.keys( materials ).length > 0 ) {

			var loader = new THREE.MaterialLoader();
			var materialJson;
			for ( materialName in materials ) {

				materialJson = materials[ materialName ];
				if ( Validator.isValid( materialJson ) ) {

					material = loader.parse( materialJson );
					this.logger.logInfo( 'De-serialized material with name "' + materialName + '" will be added.' );
					this.materials[ materialName ] = material;
				}

			}

		}

		materials = materialPayload.materials.runtimeMaterials;
		if ( Validator.isValid( materials ) && Object.keys( materials ).length > 0 ) {

			for ( materialName in materials ) {

				material = materials[ materialName ];
				this.logger.logInfo( 'Material with name "' + materialName + '" will be added.' );
				this.materials[ materialName ] = material;

			}

		}
	};

	/**
	 * Returns the mapping object of material name and corresponding jsonified material.
	 *
	 * @returns {Object} Map of Materials in JSON representation
	 */
	Builder.prototype.getMaterialsJSON = function () {
		var materialsJSON = {};
		var material;
		for ( var materialName in this.materials ) {

			material = this.materials[ materialName ];
			materialsJSON[ materialName ] = material.toJSON();
		}

		return materialsJSON;
	};

	/**
	 * Returns the mapping object of material name and corresponding material.
	 *
	 * @returns {Object} Map of {@link THREE.Material}
	 */
	Builder.prototype.getMaterials = function () {
		return this.materials;
	};

	return Builder;
})();

/**
 * Base class to be used by loaders.
 * @class
 *
 * @param {THREE.DefaultLoadingManager} [manager] The loadingManager for the loader to use. Default is {@link THREE.DefaultLoadingManager}
 * @param {THREE.LoaderSupport.ConsoleLogger} logger logger to be used
 */
THREE.LoaderSupport.LoaderBase = (function () {

	var Validator = THREE.LoaderSupport.Validator;
	var ConsoleLogger = THREE.LoaderSupport.ConsoleLogger;

	function LoaderBase( manager, logger ) {
		this.manager = Validator.verifyInput( manager, THREE.DefaultLoadingManager );
		this.logger = Validator.verifyInput( logger, new ConsoleLogger() );

		this.modelName = '';
		this.instanceNo = 0;
		this.path = '';
		this.useIndices = false;
		this.disregardNormals = false;

		this.loaderRootNode = new THREE.Group();
		this.builder = new THREE.LoaderSupport.Builder( this.logger );
		this._createDefaultMaterials();
		this.callbacks = new THREE.LoaderSupport.Callbacks();
	};

	LoaderBase.prototype._createDefaultMaterials = function () {
		var defaultMaterial = new THREE.MeshStandardMaterial( { color: 0xDCF1FF } );
		defaultMaterial.name = 'defaultMaterial';

		var vertexColorMaterial = new THREE.MeshStandardMaterial( { color: 0xDCF1FF } );
		vertexColorMaterial.name = 'vertexColorMaterial';
		vertexColorMaterial.vertexColors = THREE.VertexColors;

		var runtimeMaterials = {};
		runtimeMaterials[ defaultMaterial.name ] = defaultMaterial;
		runtimeMaterials[ vertexColorMaterial.name ] = vertexColorMaterial;

		this.builder.updateMaterials(
			{
				cmd: 'materialData',
				materials: {
					materialCloneInstructions: null,
					serializedMaterials: null,
					runtimeMaterials: runtimeMaterials
				}
			}
		);
	};

	LoaderBase.prototype._applyPrepData = function ( prepData ) {
		if ( Validator.isValid( prepData ) ) {

			this.setModelName( prepData.modelName );
			this.setStreamMeshesTo( prepData.streamMeshesTo );
			this.builder.setMaterials( prepData.materials );
			this.setUseIndices( prepData.useIndices );
			this.setDisregardNormals( prepData.disregardNormals );

			this._setCallbacks( prepData.getCallbacks() );
		}
	};

	LoaderBase.prototype._setCallbacks = function ( callbacks ) {
		if ( Validator.isValid( callbacks.onProgress ) ) this.callbacks.setCallbackOnProgress( callbacks.onProgress );
		if ( Validator.isValid( callbacks.onMeshAlter ) ) this.callbacks.setCallbackOnMeshAlter( callbacks.onMeshAlter );
		if ( Validator.isValid( callbacks.onLoad ) ) this.callbacks.setCallbackOnLoad( callbacks.onLoad );
		if ( Validator.isValid( callbacks.onLoadMaterials ) ) this.callbacks.setCallbackOnLoadMaterials( callbacks.onLoadMaterials );

		this.builder._setCallbacks( this.callbacks );
	};

	/**
	 * Provides access to console logging wrapper.
	 *
	 * @returns {THREE.LoaderSupport.ConsoleLogger}
	 */
	LoaderBase.prototype.getLogger = function () {
		return this.logger;
	};

	/**
	 * Set the name of the model.
	 * @memberOf THREE.LoaderSupport.LoaderBase
	 *
	 * @param {string} modelName
	 */
	LoaderBase.prototype.setModelName = function ( modelName ) {
		this.modelName = Validator.verifyInput( modelName, this.modelName );
	};

	/**
	 * The URL of the base path.
	 * @memberOf THREE.LoaderSupport.LoaderBase
	 *
	 * @param {string} path URL
	 */
	LoaderBase.prototype.setPath = function ( path ) {
		this.path = Validator.verifyInput( path, this.path );
	};

	/**
	 * Set the node where the loaded objects will be attached directly.
	 * @memberOf THREE.LoaderSupport.LoaderBase
	 *
	 * @param {THREE.Object3D} streamMeshesTo Object already attached to scenegraph where new meshes will be attached to
	 */
	LoaderBase.prototype.setStreamMeshesTo = function ( streamMeshesTo ) {
		this.loaderRootNode = Validator.verifyInput( streamMeshesTo, this.loaderRootNode );
	};

	/**
	 * Set materials loaded by MTLLoader or any other supplier of an Array of {@link THREE.Material}.
	 * @memberOf THREE.LoaderSupport.LoaderBase
	 *
	 * @param {THREE.Material[]} materials Array of {@link THREE.Material}
	 */
	LoaderBase.prototype.setMaterials = function ( materials ) {
		this.builder.setMaterials( materials );
	};

	/**
	 * Instructs loaders to create indexed {@link THREE.BufferGeometry}.
	 * @memberOf THREE.LoaderSupport.LoaderBase
	 *
	 * @param {boolean} useIndices=false
	 */
	LoaderBase.prototype.setUseIndices = function ( useIndices ) {
		this.useIndices = useIndices === true;
	};

	/**
	 * Tells whether normals should be completely disregarded and regenerated.
	 * @memberOf THREE.LoaderSupport.LoaderBase
	 *
	 * @param {boolean} disregardNormals=false
	 */
	LoaderBase.prototype.setDisregardNormals = function ( disregardNormals ) {
		this.disregardNormals = disregardNormals === true;
	};

	/**
	 * Announce feedback which is give to the registered callbacks.
	 * @memberOf THREE.LoaderSupport.LoaderBase
	 * @private
	 *
	 * @param {string} type The type of event
	 * @param {string} text Textual description of the event
	 * @param {number} numericalValue Numerical value describing the progress
	 */
	LoaderBase.prototype.onProgress = function ( type, text, numericalValue ) {
		var content = Validator.isValid( text ) ? text: '';
		var event = {
			detail: {
				type: type,
				modelName: this.modelName,
				instanceNo: this.instanceNo,
				text: content,
				numericalValue: numericalValue
			}
		};

		if ( Validator.isValid( this.callbacks.onProgress ) ) this.callbacks.onProgress( event );

		this.logger.logDebug( content );
	};

	return LoaderBase;
})();

/**
 * Default implementation of the WorkerRunner responsible for creation and configuration of the parser within the worker.
 *
 * @class
 */
THREE.LoaderSupport.WorkerRunnerRefImpl = (function () {

	function WorkerRunnerRefImpl() {
		var scope = this;
		var scopedRunner = function( event ) {
			scope.processMessage( event.data );
		};
		self.addEventListener( 'message', scopedRunner, false );
	}

	/**
	 * Applies values from parameter object via set functions or via direct assignment.
	 * @memberOf THREE.LoaderSupport.WorkerRunnerRefImpl
	 *
	 * @param {Object} parser The parser instance
	 * @param {Object} params The parameter object
	 */
	WorkerRunnerRefImpl.prototype.applyProperties = function ( parser, params ) {
		var property, funcName, values;
		for ( property in params ) {
			funcName = 'set' + property.substring( 0, 1 ).toLocaleUpperCase() + property.substring( 1 );
			values = params[ property ];

			if ( typeof parser[ funcName ] === 'function' ) {

				parser[ funcName ]( values );

			} else if ( parser.hasOwnProperty( property ) ) {

				parser[ property ] = values;

			}
		}
	};

	/**
	 * Configures the Parser implementation according the supplied configuration object.
	 * @memberOf THREE.LoaderSupport.WorkerRunnerRefImpl
	 *
	 * @param {Object} payload Raw mesh description (buffers, params, materials) used to build one to many meshes.
	 */
	WorkerRunnerRefImpl.prototype.processMessage = function ( payload ) {
		var logEnabled = payload.logger.enabled;
		var logDebug = payload.logger.enabled;
		if ( payload.cmd === 'run' ) {

			var callbacks = {
				callbackBuilder: function ( payload ) {
					self.postMessage( payload );
				},
				callbackProgress: function ( text ) {
					if ( logEnabled && logDebug ) console.debug( 'WorkerRunner: progress: ' + text );
				}
			};

			// Parser is expected to be named as such
			var parser = new Parser();
			if ( typeof parser[ 'setLogConfig' ] === 'function' ) parser.setLogConfig( logEnabled, logDebug );
			this.applyProperties( parser, payload.params );
			this.applyProperties( parser, payload.materials );
			this.applyProperties( parser, callbacks );
			parser.workerScope = self;
			parser.parse( payload.data.input, payload.data.options );

			if ( logEnabled ) console.log( 'WorkerRunner: Run complete!' );

			callbacks.callbackBuilder( {
				cmd: 'complete',
				msg: 'WorkerRunner completed run.'
			} );

		} else {

			console.error( 'WorkerRunner: Received unknown command: ' + payload.cmd );

		}
	};

	return WorkerRunnerRefImpl;
})();

/**
 * This class provides means to transform existing parser code into a web worker. It defines a simple communication protocol
 * which allows to configure the worker and receive raw mesh data during execution.
 * @class
 *
 * @param {THREE.LoaderSupport.ConsoleLogger} logger logger to be used
 */
THREE.LoaderSupport.WorkerSupport = (function () {

	var WORKER_SUPPORT_VERSION = '2.0.1';

	var Validator = THREE.LoaderSupport.Validator;

	var LoaderWorker = (function () {

		function LoaderWorker( logger ) {
			this.logger = Validator.verifyInput( logger, new THREE.LoaderSupport.ConsoleLogger() );
			this._reset();
		}

		LoaderWorker.prototype._reset = function () {
			this.worker = null;
			this.runnerImplName = null;
			this.callbacks = {
				builder: null,
				onLoad: null
			};
			this.terminateRequested = false;
			this.queuedMessage = null;
			this.started = false;
		};

		LoaderWorker.prototype.initWorker = function ( code, runnerImplName ) {
			this.runnerImplName = runnerImplName;
			var blob = new Blob( [ code ], { type: 'application/javascript' } );
			this.worker = new Worker( window.URL.createObjectURL( blob ) );
			this.worker.onmessage = this._receiveWorkerMessage;

			// set referemce to this, then processing in worker scope within "_receiveWorkerMessage" can access members
			this.worker.runtimeRef = this;

			// process stored queuedMessage
			this._postMessage();
		};

		/**
		 * Executed in worker scope
 		 */
		LoaderWorker.prototype._receiveWorkerMessage = function ( e ) {
			var payload = e.data;
			switch ( payload.cmd ) {
				case 'meshData':
				case 'materialData':
				case 'imageData':
					this.runtimeRef.callbacks.builder( payload );
					break;

				case 'complete':
					this.runtimeRef.queuedMessage = null;
					this.started = false;
					this.runtimeRef.callbacks.onLoad( payload.msg );

					if ( this.runtimeRef.terminateRequested ) {

						this.runtimeRef.logger.logInfo( 'WorkerSupport [' + this.runtimeRef.runnerImplName + ']: Run is complete. Terminating application on request!' );
						this.runtimeRef._terminate();

					}
					break;

				case 'error':
					this.runtimeRef.logger.logError( 'WorkerSupport [' + this.runtimeRef.runnerImplName + ']: Reported error: ' + payload.msg );
					this.runtimeRef.queuedMessage = null;
					this.started = false;
					this.runtimeRef.callbacks.onLoad( payload.msg );

					if ( this.runtimeRef.terminateRequested ) {

						this.runtimeRef.logger.logInfo( 'WorkerSupport [' + this.runtimeRef.runnerImplName + ']: Run reported error. Terminating application on request!' );
						this.runtimeRef._terminate();

					}
					break;

				default:
					this.runtimeRef.logger.logError( 'WorkerSupport [' + this.runtimeRef.runnerImplName + ']: Received unknown command: ' + payload.cmd );
					break;

			}
		};

		LoaderWorker.prototype.setCallbacks = function ( builder, onLoad ) {
			this.callbacks.builder = Validator.verifyInput( builder, this.callbacks.builder );
			this.callbacks.onLoad = Validator.verifyInput( onLoad, this.callbacks.onLoad );
		};

		LoaderWorker.prototype.run = function( payload ) {
			if ( Validator.isValid( this.queuedMessage ) ) {

				console.warn( 'Already processing message. Rejecting new run instruction' );
				return;

			} else {

				this.queuedMessage = payload;
				this.started = true;

			}
			if ( ! Validator.isValid( this.callbacks.builder ) ) throw 'Unable to run as no "builder" callback is set.';
			if ( ! Validator.isValid( this.callbacks.onLoad ) ) throw 'Unable to run as no "onLoad" callback is set.';
			if ( payload.cmd !== 'run' ) payload.cmd = 'run';
			if ( Validator.isValid( payload.logger ) ) {

				payload.logger.enabled = Validator.verifyInput( payload.logger.enabled, true );
				payload.logger.debug = Validator.verifyInput( payload.logger.debug, false );

			} else {

				payload.logger = {
					enabled: true,
					debug: false
				}

			}
			this._postMessage();
		};

		LoaderWorker.prototype._postMessage = function () {
			if ( Validator.isValid( this.queuedMessage ) && Validator.isValid( this.worker ) ) {

				if ( this.queuedMessage.data.input instanceof ArrayBuffer ) {

					this.worker.postMessage( this.queuedMessage, [ this.queuedMessage.data.input ] );

				} else {

					this.worker.postMessage( this.queuedMessage );

				}

			}
		};

		LoaderWorker.prototype.setTerminateRequested = function ( terminateRequested ) {
			this.terminateRequested = terminateRequested === true;
			if ( this.terminateRequested && Validator.isValid( this.worker ) && ! Validator.isValid( this.queuedMessage ) && this.started ) {

				this.logger.logInfo( 'Worker is terminated immediately as it is not running!' );
				this._terminate();

			}
		};

		LoaderWorker.prototype._terminate = function () {
			this.worker.terminate();
			this._reset();
		};

		return LoaderWorker;

	})();

	function WorkerSupport( logger ) {
		this.logger = Validator.verifyInput( logger, new THREE.LoaderSupport.ConsoleLogger() );
		this.logger.logInfo( 'Using THREE.LoaderSupport.WorkerSupport version: ' + WORKER_SUPPORT_VERSION );

		// check worker support first
		if ( window.Worker === undefined ) throw "This browser does not support web workers!";
		if ( window.Blob === undefined  ) throw "This browser does not support Blob!";
		if ( typeof window.URL.createObjectURL !== 'function'  ) throw "This browser does not support Object creation from URL!";

		this.loaderWorker = new LoaderWorker( this.logger );
	}

	/**
	 * Validate the status of worker code and the derived worker.
	 * @memberOf THREE.LoaderSupport.WorkerSupport
	 *
	 * @param {Function} functionCodeBuilder Function that is invoked with funcBuildObject and funcBuildSingelton that allows stringification of objects and singletons.
	 * @param {String[]} libLocations URL of libraries that shall be added to worker code relative to libPath
	 * @param {String} libPath Base path used for loading libraries
	 * @param {THREE.LoaderSupport.WorkerRunnerRefImpl} runnerImpl The default worker parser wrapper implementation (communication and execution). An extended class could be passed here.
	 */
	WorkerSupport.prototype.validate = function ( functionCodeBuilder, libLocations, libPath, runnerImpl ) {
		if ( Validator.isValid( this.loaderWorker.worker ) ) return;

		this.logger.logInfo( 'WorkerSupport: Building worker code...' );
		this.logger.logTimeStart( 'buildWebWorkerCode' );

		if ( Validator.isValid( runnerImpl ) ) {

			this.logger.logInfo( 'WorkerSupport: Using "' + runnerImpl.name + '" as Runncer class for worker.' );

		} else {

			runnerImpl = THREE.LoaderSupport.WorkerRunnerRefImpl;
			this.logger.logInfo( 'WorkerSupport: Using DEFAULT "THREE.LoaderSupport.WorkerRunnerRefImpl" as Runncer class for worker.' );

		}

		var userWorkerCode = functionCodeBuilder( buildObject, buildSingelton );
		userWorkerCode += buildSingelton( runnerImpl.name, runnerImpl.name, runnerImpl );
		userWorkerCode += 'new ' + runnerImpl.name + '();\n\n';

		var scope = this;
		if ( Validator.isValid( libLocations ) && libLocations.length > 0 ) {

			var libsContent = '';
			var loadAllLibraries = function ( path, locations ) {
				if ( locations.length === 0 ) {

					scope.loaderWorker.initWorker( libsContent + userWorkerCode, scope.logger, runnerImpl.name );
					scope.logger.logTimeEnd( 'buildWebWorkerCode' );

				} else {

					var loadedLib = function ( contentAsString ) {
						libsContent += contentAsString;
						loadAllLibraries( path, locations );
					};

					var fileLoader = new THREE.FileLoader();
					fileLoader.setPath( path );
					fileLoader.setResponseType( 'text' );
					fileLoader.load( locations[ 0 ], loadedLib );
					locations.shift();

				}
			};
			loadAllLibraries( libPath, libLocations );

		} else {

			this.loaderWorker.initWorker( userWorkerCode, this.logger, runnerImpl.name );
			this.logger.logTimeEnd( 'buildWebWorkerCode' );

		}
	};

	/**
	 * Specify functions that should be build when new raw mesh data becomes available and when the parser is finished.
	 * @memberOf THREE.LoaderSupport.WorkerSupport
	 *
	 * @param {Function} builder The builder function. Default is {@link THREE.LoaderSupport.Builder}.
	 * @param {Function} onLoad The function that is called when parsing is complete.
	 */
	WorkerSupport.prototype.setCallbacks = function ( builder, onLoad ) {
		this.loaderWorker.setCallbacks( builder, onLoad );
	};

	/**
	 * Runs the parser with the provided configuration.
	 * @memberOf THREE.LoaderSupport.WorkerSupport
	 *
	 * @param {Object} payload Raw mesh description (buffers, params, materials) used to build one to many meshes.
	 */
	WorkerSupport.prototype.run = function ( payload ) {
		this.loaderWorker.run( payload );
	};

	/**
	 * Request termination of worker once parser is finished.
	 * @memberOf THREE.LoaderSupport.WorkerSupport
	 *
	 * @param {boolean} terminateRequested True or false.
	 */
	WorkerSupport.prototype.setTerminateRequested = function ( terminateRequested ) {
		this.loaderWorker.setTerminateRequested( terminateRequested );
	};

	var buildObject = function ( fullName, object ) {
		var objectString = fullName + ' = {\n';
		var part;
		for ( var name in object ) {

			part = object[ name ];
			if ( typeof( part ) === 'string' || part instanceof String ) {

				part = part.replace( '\n', '\\n' );
				part = part.replace( '\r', '\\r' );
				objectString += '\t' + name + ': "' + part + '",\n';

			} else if ( part instanceof Array ) {

				objectString += '\t' + name + ': [' + part + '],\n';

			} else if ( Number.isInteger( part ) ) {

				objectString += '\t' + name + ': ' + part + ',\n';

			} else if ( typeof part === 'function' ) {

				objectString += '\t' + name + ': ' + part + ',\n';

			}

		}
		objectString += '}\n\n';

		return objectString;
	};

	var buildSingelton = function ( fullName, internalName, object ) {
		var objectString = fullName + ' = (function () {\n\n';
		objectString += '\t' + object.prototype.constructor.toString() + '\n\n';
		objectString = objectString.replace( object.name, internalName );

		var funcString;
		var objectPart;
		for ( var name in object.prototype ) {

			objectPart = object.prototype[ name ];
			if ( typeof objectPart === 'function' ) {

				funcString = objectPart.toString();
				objectString += '\t' + internalName + '.prototype.' + name + ' = ' + funcString + ';\n\n';

			}

		}
		objectString += '\treturn ' + internalName + ';\n';
		objectString += '})();\n\n';

		return objectString;
	};

	return WorkerSupport;

})();

/**
 * Orchestrate loading of multiple OBJ files/data from an instruction queue with a configurable amount of workers (1-16).
 * Workflow:
 *   prepareWorkers
 *   enqueueForRun
 *   processQueue
 *   tearDown (to force stop)
 *
 * @class
 *
 * @param {string} classDef Class definition to be used for construction
 * @param {THREE.LoaderSupport.ConsoleLogger} logger logger to be used
 */
THREE.LoaderSupport.WorkerDirector = (function () {

	var LOADER_WORKER_DIRECTOR_VERSION = '2.1.0';

	var Validator = THREE.LoaderSupport.Validator;

	var MAX_WEB_WORKER = 16;
	var MAX_QUEUE_SIZE = 8192;

	function WorkerDirector( classDef, logger ) {
		this.logger = Validator.verifyInput( logger, new THREE.LoaderSupport.ConsoleLogger() );
		this.logger.logInfo( 'Using THREE.LoaderSupport.WorkerDirector version: ' + LOADER_WORKER_DIRECTOR_VERSION );

		this.maxQueueSize = MAX_QUEUE_SIZE ;
		this.maxWebWorkers = MAX_WEB_WORKER;
		this.crossOrigin = null;

		if ( ! Validator.isValid( classDef ) ) throw 'Provided invalid classDef: ' + classDef;

		this.workerDescription = {
			classDef: classDef,
			globalCallbacks: {},
			workerSupports: {}
		};
		this.objectsCompleted = 0;
		this.instructionQueue = [];
		this.instructionQueuePointer = 0;

		this.callbackOnFinishedProcessing = null;
	}

	/**
	 * Returns the maximum length of the instruction queue.
	 * @memberOf THREE.LoaderSupport.WorkerDirector
	 *
	 * @returns {number}
	 */
	WorkerDirector.prototype.getMaxQueueSize = function () {
		return this.maxQueueSize;
	};

	/**
	 * Returns the maximum number of workers.
	 * @memberOf THREE.LoaderSupport.WorkerDirector
	 *
	 * @returns {number}
	 */
	WorkerDirector.prototype.getMaxWebWorkers = function () {
		return this.maxWebWorkers;
	};

	/**
	 * Sets the CORS string to be used.
	 * @memberOf THREE.LoaderSupport.WorkerDirector
	 *
	 * @param {string} crossOrigin CORS value
	 */
	WorkerDirector.prototype.setCrossOrigin = function ( crossOrigin ) {
		this.crossOrigin = crossOrigin;
	};

	/**
	 * Create or destroy workers according limits. Set the name and register callbacks for dynamically created web workers.
	 * @memberOf THREE.LoaderSupport.WorkerDirector
	 *
	 * @param {THREE.OBJLoader2.WWOBJLoader2.PrepDataCallbacks} globalCallbacks  Register global callbacks used by all web workers
	 * @param {number} maxQueueSize Set the maximum size of the instruction queue (1-1024)
	 * @param {number} maxWebWorkers Set the maximum amount of workers (1-16)
	 */
	WorkerDirector.prototype.prepareWorkers = function ( globalCallbacks, maxQueueSize, maxWebWorkers ) {
		if ( Validator.isValid( globalCallbacks ) ) this.workerDescription.globalCallbacks = globalCallbacks;
		this.maxQueueSize = Math.min( maxQueueSize, MAX_QUEUE_SIZE );
		this.maxWebWorkers = Math.min( maxWebWorkers, MAX_WEB_WORKER );
		this.maxWebWorkers = Math.min( this.maxWebWorkers, this.maxQueueSize );
		this.objectsCompleted = 0;
		this.instructionQueue = [];
		this.instructionQueuePointer = 0;

		for ( var instanceNo = 0; instanceNo < this.maxWebWorkers; instanceNo++ ) {

			this.workerDescription.workerSupports[ instanceNo ] = {
				instanceNo: instanceNo,
				inUse: false,
				terminateRequested: false,
				workerSupport: new THREE.LoaderSupport.WorkerSupport( this.logger ),
				loader: null
			};

		}
	};

	/**
	 * Store run instructions in internal instructionQueue.
	 * @memberOf THREE.LoaderSupport.WorkerDirector
	 *
	 * @param {THREE.LoaderSupport.PrepData} prepData
	 */
	WorkerDirector.prototype.enqueueForRun = function ( prepData ) {
		if ( this.instructionQueue.length < this.maxQueueSize ) {
			this.instructionQueue.push( prepData );
		}
	};

	/**
	 * Returns if any workers are running.
	 *
	 * @memberOf THREE.LoaderSupport.WorkerDirector
	 * @returns {boolean}
	 */
	WorkerDirector.prototype.isRunning = function () {
		var wsKeys = Object.keys( this.workerDescription.workerSupports );
		return ( ( this.instructionQueue.length > 0 && this.instructionQueuePointer < this.instructionQueue.length ) || wsKeys.length > 0 );
	};

	/**
	 * Process the instructionQueue until it is depleted.
	 * @memberOf THREE.LoaderSupport.WorkerDirector
	 */
	WorkerDirector.prototype.processQueue = function () {
		var prepData, supportDesc;
		for ( var instanceNo in this.workerDescription.workerSupports ) {

			supportDesc = this.workerDescription.workerSupports[ instanceNo ];
			if ( ! supportDesc.inUse ) {

				if ( this.instructionQueuePointer < this.instructionQueue.length ) {

					prepData = this.instructionQueue[ this.instructionQueuePointer ];
					this._kickWorkerRun( prepData, supportDesc );
					this.instructionQueuePointer++;

				} else {

					this._deregister( supportDesc );

				}

			}

		}

		if ( ! this.isRunning() && this.callbackOnFinishedProcessing !== null ) {

			this.callbackOnFinishedProcessing();
			this.callbackOnFinishedProcessing = null;

		}
	};

	WorkerDirector.prototype._kickWorkerRun = function( prepData, supportDesc ) {
		supportDesc.inUse = true;
		supportDesc.workerSupport.setTerminateRequested( supportDesc.terminateRequested );

		this.logger.logInfo( '\nAssigning next item from queue to worker (queue length: ' + this.instructionQueue.length + ')\n\n' );

		var scope = this;
		var prepDataCallbacks = prepData.getCallbacks();
		var globalCallbacks = this.workerDescription.globalCallbacks;
		var wrapperOnLoad = function ( event ) {
			if ( Validator.isValid( globalCallbacks.onLoad ) ) globalCallbacks.onLoad( event );
			if ( Validator.isValid( prepDataCallbacks.onLoad ) ) prepDataCallbacks.onLoad( event );
			scope.objectsCompleted++;
			supportDesc.inUse = false;

			scope.processQueue();
		};

		var wrapperOnProgress = function ( event ) {
			if ( Validator.isValid( globalCallbacks.onProgress ) ) globalCallbacks.onProgress( event );
			if ( Validator.isValid( prepDataCallbacks.onProgress ) ) prepDataCallbacks.onProgress( event );
		};

		var wrapperOnMeshAlter = function ( event ) {
			if ( Validator.isValid( globalCallbacks.onMeshAlter ) ) globalCallbacks.onMeshAlter( event );
			if ( Validator.isValid( prepDataCallbacks.onMeshAlter ) ) prepDataCallbacks.onMeshAlter( event );
		};

		supportDesc.loader = this._buildLoader( supportDesc.instanceNo );

		var updatedCallbacks = new THREE.LoaderSupport.Callbacks();
		updatedCallbacks.setCallbackOnLoad( wrapperOnLoad );
		updatedCallbacks.setCallbackOnProgress( wrapperOnProgress );
		updatedCallbacks.setCallbackOnMeshAlter( wrapperOnMeshAlter );
		prepData.callbacks = updatedCallbacks;

		supportDesc.loader.run( prepData, supportDesc.workerSupport );
	};

	WorkerDirector.prototype._buildLoader = function ( instanceNo ) {
		var classDef = this.workerDescription.classDef;
		var loader = Object.create( classDef.prototype );
		this.workerDescription.classDef.call( loader, THREE.DefaultLoadingManager, this.logger );

		// verify that all required functions are implemented
		if ( ! loader.hasOwnProperty( 'instanceNo' ) ) throw classDef.name + ' has no property "instanceNo".';
		loader.instanceNo = instanceNo;

		if ( ! loader.hasOwnProperty( 'workerSupport' ) ) {

			throw classDef.name + ' has no property "workerSupport".';

		}
		if ( typeof loader.run !== 'function'  ) throw classDef.name + ' has no function "run".';
		if ( ! loader.hasOwnProperty( 'callbacks' ) || ! Validator.isValid( loader.callbacks ) ) {

			this.logger.logWarn( classDef.name + ' has an invalid property "callbacks". Will change to "THREE.LoaderSupport.Callbacks"' );
			loader.callbacks = new THREE.LoaderSupport.Callbacks();

		}
		return loader;
	};

	WorkerDirector.prototype._deregister = function ( supportDesc ) {
		if ( Validator.isValid( supportDesc ) ) {

			supportDesc.workerSupport.setTerminateRequested( true );
			this.logger.logInfo( 'Requested termination of worker #' + supportDesc.instanceNo + '.' );

			var loaderCallbacks = supportDesc.loader.callbacks;
			if ( Validator.isValid( loaderCallbacks.onProgress ) ) loaderCallbacks.onProgress( { detail: { text: '' } } );
			delete this.workerDescription.workerSupports[ supportDesc.instanceNo ];

		}
	};

	/**
	 * Terminate all workers.
	 * @memberOf THREE.LoaderSupport.WorkerDirector
	 *
	 * @param {callback} callbackOnFinishedProcessing Function called once all workers finished processing.
	 */
	WorkerDirector.prototype.tearDown = function ( callbackOnFinishedProcessing ) {
		this.logger.logInfo( 'WorkerDirector received the deregister call. Terminating all workers!' );

		this.instructionQueuePointer = this.instructionQueue.length;
		this.callbackOnFinishedProcessing = Validator.verifyInput( callbackOnFinishedProcessing, null );

		for ( var name in this.workerDescription.workerSupports ) {

			this.workerDescription.workerSupports[ name ].terminateRequested = true;

		}
	};

	return WorkerDirector;

})();
