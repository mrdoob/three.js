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

	return Callbacks;
})();


/**
 * Builds one or many THREE.Mesh from one raw set of Arraybuffers, materialGroup descriptions and further parameters.
 * Supports vertex, vertexColor, normal, uv and index buffers.
 * @class
 */
THREE.LoaderSupport.Builder = (function () {

	var Validator = THREE.LoaderSupport.Validator;

	function Builder() {
		this.callbacks = new THREE.LoaderSupport.Callbacks();
		this.materials = [];
		this.materialNames = [];
		this._createDefaultMaterials();
	}

	Builder.prototype._createDefaultMaterials = function () {
		var defaultMaterial = new THREE.MeshStandardMaterial( { color: 0xDCF1FF } );
		defaultMaterial.name = 'defaultMaterial';
		if ( ! Validator.isValid( this.materials[ defaultMaterial ] ) ) {
			this.materials[ defaultMaterial.name ] = defaultMaterial;
		}
		this.materialNames.push( defaultMaterial.name );

		var vertexColorMaterial = new THREE.MeshStandardMaterial( { color: 0xDCF1FF } );
		vertexColorMaterial.name = 'vertexColorMaterial';
		vertexColorMaterial.vertexColors = THREE.VertexColors;
		if ( ! Validator.isValid( this.materials[ vertexColorMaterial.name ] ) ) {
			this.materials[ vertexColorMaterial.name ] = vertexColorMaterial;
		}
		this.materialNames.push( vertexColorMaterial.name );
	};

	/**
	 * Set materials loaded by any supplier of an Array of {@link THREE.Material}.
	 * @memberOf THREE.LoaderSupport.Builder
	 *
	 * @param {THREE.Material[]} materials Array of {@link THREE.Material}
	 */
	Builder.prototype.setMaterials = function ( materials ) {
		if ( Validator.isValid( materials ) && Object.keys( materials ).length > 0 ) {

			var materialName;
			for ( materialName in materials ) {

				if ( materials.hasOwnProperty( materialName ) && ! this.materials.hasOwnProperty( materialName) ) {
					this.materials[ materialName ] = materials[ materialName ];
				}

			}

			// always reset list of names as they are an array
			this.materialNames = [];
			for ( materialName in materials ) this.materialNames.push( materialName );

		}
	};

	Builder.prototype._setCallbacks = function ( callbackOnProgress, callbackOnMeshAlter, callbackOnLoad ) {
		this.callbacks.setCallbackOnProgress( callbackOnProgress );
		this.callbacks.setCallbackOnMeshAlter( callbackOnMeshAlter );
		this.callbacks.setCallbackOnLoad( callbackOnLoad );
	};

	/**
	 * Builds one or multiple meshes from the data described in the payload (buffers, params, material info.
	 * @memberOf THREE.LoaderSupport.Builder
	 *
	 * @param {Object} payload Raw mesh description (buffers, params, materials) used to build one to many meshes.
	 * @returns {THREE.Mesh[]} mesh Array of {@link THREE.Mesh}
	 */
	Builder.prototype.buildMeshes = function ( payload ) {
		var meshName = payload.params.meshName;

		var bufferGeometry = new THREE.BufferGeometry();
		bufferGeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( payload.buffers.vertices ), 3 ) );
		if ( Validator.isValid( payload.buffers.indices ) ) {

			bufferGeometry.setIndex( new THREE.BufferAttribute( new Uint32Array( payload.buffers.indices ), 1 ));

		}
		var haveVertexColors = Validator.isValid( payload.buffers.colors );
		if ( haveVertexColors ) {

			bufferGeometry.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( payload.buffers.colors ), 3 ) );

		}
		if ( Validator.isValid( payload.buffers.normals ) ) {

			bufferGeometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( payload.buffers.normals ), 3 ) );

		} else {

			bufferGeometry.computeVertexNormals();

		}
		if ( Validator.isValid( payload.buffers.uvs ) ) {

			bufferGeometry.addAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( payload.buffers.uvs ), 2 ) );

		}

		var materialDescriptions = payload.materials.materialDescriptions;
		var materialDescription;
		var material;
		var materialName;
		var createMultiMaterial = payload.materials.multiMaterial;
		var multiMaterials = [];

		var key;
		for ( key in materialDescriptions ) {

			materialDescription = materialDescriptions[ key ];
			material = this.materials[ materialDescription.name ];
			material = Validator.verifyInput( material, this.materials[ 'defaultMaterial' ] );
			if ( haveVertexColors ) {

				if ( material.hasOwnProperty( 'vertexColors' ) ) {

					materialName = material.name + '_vertexColor';
					var materialClone = this.materials[ materialName ];
					if ( ! Validator.isValid( materialClone ) ) {

						materialClone = material.clone();
						materialClone.name = materialName;
						materialClone.vertexColors = THREE.VertexColors;
						this.materials[ materialName ] = materialClone;

					}
					material = materialClone;

				} else {

					material = this.materials[ 'vertexColorMaterial' ];
				}

			}

			if ( materialDescription.flat ) {

				materialName = material.name + '_flat';
				var materialClone = this.materials[ materialName ];
				if ( ! Validator.isValid( materialClone ) ) {

					materialClone = material.clone();
					materialClone.name = materialName;
					materialClone.flatShading = true;
					this.materials[ materialName ] = materialClone;

				}
				material = materialClone;

			}
			if ( createMultiMaterial ) multiMaterials.push( material );

		}
		if ( createMultiMaterial ) {

			material = multiMaterials;
			var materialGroups = payload.materials.materialGroups;
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
			progressMessage += ' (' + ( payload.progress.numericalValue * 100 ).toFixed( 2 ) + '%)';

		} else {

			progressMessage = 'Not adding mesh: ' + meshName;
			progressMessage += ' (' + ( payload.progress.numericalValue * 100 ).toFixed( 2 ) + '%)';

		}
		var callbackOnProgress = this.callbacks.onProgress;
		if ( Validator.isValid( callbackOnProgress ) ) {

			var event = new CustomEvent( 'BuilderEvent', {
				detail: {
					type: 'progress',
					modelName: payload.params.meshName,
					text: progressMessage,
					numericalValue: payload.progress.numericalValue
				}
			} );
			callbackOnProgress( event );

		}

		return meshes;
	};

	return Builder;
})();


/**
 * Base class to be used by loaders.
 * @class
 *
 * @param {THREE.LoaderSupport.ConsoleLogger} logger logger to be used
 * @param {THREE.DefaultLoadingManager} [manager] The loadingManager for the loader to use. Default is {@link THREE.DefaultLoadingManager}
 */
THREE.LoaderSupport.Commons = (function () {

	var Validator = THREE.LoaderSupport.Validator;
	var ConsoleLogger = THREE.LoaderSupport.ConsoleLogger;

	function Commons( logger, manager ) {
		this.logger = Validator.verifyInput( logger, new ConsoleLogger() );
		this.manager = Validator.verifyInput( manager, THREE.DefaultLoadingManager );

		this.modelName = '';
		this.instanceNo = 0;
		this.path = '';
		this.useIndices = false;
		this.disregardNormals = false;

		this.loaderRootNode = new THREE.Group();
		this.builder = new THREE.LoaderSupport.Builder();
		this.callbacks = new THREE.LoaderSupport.Callbacks();
	};

	Commons.prototype._applyPrepData = function ( prepData ) {
		if ( Validator.isValid( prepData ) ) {

			this.setModelName( prepData.modelName );
			this.setStreamMeshesTo( prepData.streamMeshesTo );
			this.builder.setMaterials( prepData.materials );
			this.setUseIndices( prepData.useIndices );
			this.setDisregardNormals( prepData.disregardNormals );

			this._setCallbacks( prepData.getCallbacks().onProgress, prepData.getCallbacks().onMeshAlter, prepData.getCallbacks().onLoad );
		}
	};

	Commons.prototype._setCallbacks = function ( callbackOnProgress, callbackOnMeshAlter, callbackOnLoad ) {
		this.callbacks.setCallbackOnProgress( callbackOnProgress );
		this.callbacks.setCallbackOnMeshAlter( callbackOnMeshAlter );
		this.callbacks.setCallbackOnLoad( callbackOnLoad );

		this.builder._setCallbacks( callbackOnProgress, callbackOnMeshAlter, callbackOnLoad );
	};

	/**
	 * Provides access to console logging wrapper.
	 *
	 * @returns {THREE.LoaderSupport.ConsoleLogger}
	 */
	Commons.prototype.getLogger = function () {
		return this.logger;
	};

	/**
	 * Set the name of the model.
	 * @memberOf THREE.LoaderSupport.Commons
	 *
	 * @param {string} modelName
	 */
	Commons.prototype.setModelName = function ( modelName ) {
		this.modelName = Validator.verifyInput( modelName, this.modelName );
	};

	/**
	 * The URL of the base path.
	 * @memberOf THREE.LoaderSupport.Commons
	 *
	 * @param {string} path URL
	 */
	Commons.prototype.setPath = function ( path ) {
		this.path = Validator.verifyInput( path, this.path );
	};

	/**
	 * Set the node where the loaded objects will be attached directly.
	 * @memberOf THREE.LoaderSupport.Commons
	 *
	 * @param {THREE.Object3D} streamMeshesTo Object already attached to scenegraph where new meshes will be attached to
	 */
	Commons.prototype.setStreamMeshesTo = function ( streamMeshesTo ) {
		this.loaderRootNode = Validator.verifyInput( streamMeshesTo, this.loaderRootNode );
	};

	/**
	 * Set materials loaded by MTLLoader or any other supplier of an Array of {@link THREE.Material}.
	 * @memberOf THREE.LoaderSupport.Commons
	 *
	 * @param {THREE.Material[]} materials Array of {@link THREE.Material}
	 */
	Commons.prototype.setMaterials = function ( materials ) {
		this.builder.setMaterials( materials );
	};

	/**
	 * Instructs loaders to create indexed {@link THREE.BufferGeometry}.
	 * @memberOf THREE.LoaderSupport.Commons
	 *
	 * @param {boolean} useIndices=false
	 */
	Commons.prototype.setUseIndices = function ( useIndices ) {
		this.useIndices = useIndices === true;
	};

	/**
	 * Tells whether normals should be completely disregarded and regenerated.
	 * @memberOf THREE.LoaderSupport.Commons
	 *
	 * @param {boolean} disregardNormals=false
	 */
	Commons.prototype.setDisregardNormals = function ( disregardNormals ) {
		this.disregardNormals = disregardNormals === true;
	};

	/**
	 * Announce feedback which is give to the registered callbacks.
	 * @memberOf THREE.LoaderSupport.Commons
	 * @private
	 *
	 * @param {string} type The type of event
	 * @param {string} text Textual description of the event
	 * @param {number} numericalValue Numerical value describing the progress
	 */
	Commons.prototype.onProgress = function ( type, text, numericalValue ) {
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

	return Commons;
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
			this.name = this.name = url;
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
 * Default implementation of the WorkerRunner responsible for creation and configuration of the parser within the worker.
 *
 * @class
 */
THREE.LoaderSupport.WorkerRunnerRefImpl = (function () {

	function WorkerRunnerRefImpl() {
		var scope = this;
		var scopedRunner = function( event ) {
			scope.run( event.data );
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
	WorkerRunnerRefImpl.prototype.run = function ( payload ) {
		var logger = new ConsoleLogger( payload.logger.enabled, payload.logger.debug );

		if ( payload.cmd === 'run' ) {

			logger.logInfo( 'WorkerRunner: Starting Run...' );

			var callbacks = {
				callbackBuilder: function ( payload ) {
					self.postMessage( payload );
				},
				callbackProgress: function ( text ) {
					logger.logDebug( 'WorkerRunner: progress: ' + text );
				}
			};

			// Parser is expected to be named as such
			var parser = new Parser( logger );
			this.applyProperties( parser, payload.params );
			this.applyProperties( parser, payload.materials );
			this.applyProperties( parser, callbacks );
			parser.parse( payload.buffers.input );

			logger.logInfo( 'WorkerRunner: Run complete!' );

			callbacks.callbackBuilder( {
				cmd: 'complete',
				msg: 'WorkerRunner completed run.'
			} );

		} else {

			logger.logError( 'WorkerRunner: Received unknown command: ' + payload.cmd );

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

	var WORKER_SUPPORT_VERSION = '1.0.0';

	var Validator = THREE.LoaderSupport.Validator;

	function WorkerSupport( logger ) {
		this.logger = Validator.verifyInput( logger, new THREE.LoaderSupport.ConsoleLogger() );
		this.logger.logInfo( 'Using THREE.LoaderSupport.WorkerSupport version: ' + WORKER_SUPPORT_VERSION );

		// check worker support first
		if ( window.Worker === undefined ) throw "This browser does not support web workers!";
		if ( window.Blob === undefined  ) throw "This browser does not support Blob!";
		if ( typeof window.URL.createObjectURL !== 'function'  ) throw "This browser does not support Object creation from URL!";

		this.worker = null;
		this.workerCode = null;
		this.running = false;
		this.terminateRequested = false;

		this.callbacks = {
			builder: null,
			onLoad: null
		};
	}

	/**
	 * Validate the status of worker code and the derived worker.
	 * @memberOf THREE.LoaderSupport.WorkerSupport
	 *
	 * @param {Function} functionCodeBuilder Function that is invoked with funcBuildObject and funcBuildSingelton that allows stringification of objects and singletons.
	 * @param {boolean} forceWorkerReload Force re-build of the worker code.
	 * @param {THREE.LoaderSupport.WorkerRunnerRefImpl} runnerImpl The default worker parser wrapper implementation (communication and execution). An extended class could be passed here.
	 */
	WorkerSupport.prototype.validate = function ( functionCodeBuilder, forceWorkerReload, runnerImpl ) {
		this.running = false;
		if ( forceWorkerReload ) {

			this.worker = null;
			this.workerCode = null;
			this.callbacks.builder = null;
			this.callbacks.onLoad = null;

		}

		if ( ! Validator.isValid( this.worker ) ) {

			this.logger.logInfo( 'WorkerSupport: Building worker code...' );
			this.logger.logTimeStart( 'buildWebWorkerCode' );

			var workerRunner;
			if ( Validator.isValid( runnerImpl ) ) {

				this.logger.logInfo( 'WorkerSupport: Using "' + runnerImpl.name + '" as Runncer class for worker.' );
				workerRunner = runnerImpl;

			} else {

				this.logger.logInfo( 'WorkerSupport: Using DEFAULT "THREE.LoaderSupport.WorkerRunnerRefImpl" as Runncer class for worker.' );
				workerRunner = THREE.LoaderSupport.WorkerRunnerRefImpl;

			}
			this.workerCode = functionCodeBuilder( buildObject, buildSingelton );
			this.workerCode += buildSingelton( workerRunner.name, workerRunner.name, workerRunner );
			this.workerCode += 'new ' + workerRunner.name + '();\n\n';

			var blob = new Blob( [ this.workerCode ], { type: 'text/plain' } );
			this.worker = new Worker( window.URL.createObjectURL( blob ) );
			this.logger.logTimeEnd( 'buildWebWorkerCode' );

			var scope = this;
			var receiveWorkerMessage = function ( e ) {
				var payload = e.data;

				switch ( payload.cmd ) {
					case 'meshData':
						scope.callbacks.builder( payload );
						break;

					case 'complete':
						scope.callbacks.onLoad( payload.msg );
						scope.running = false;

						if ( scope.terminateRequested ) {

							scope.logger.logInfo( 'WorkerSupport: Run is complete. Terminating application on request!' );
							scope.terminateWorker();

						}
						break;

					default:
						scope.logger.logError( 'WorkerSupport: Received unknown command: ' + payload.cmd );
						break;

				}
			};
			this.worker.addEventListener( 'message', receiveWorkerMessage, false );

		}
	};

	/**
	 * Terminate the worker and the code.
	 * @memberOf THREE.LoaderSupport.WorkerSupport
	 */
	WorkerSupport.prototype.terminateWorker = function () {
		if ( Validator.isValid( this.worker ) ) {
			this.worker.terminate();
		}
		this.worker = null;
		this.workerCode = null;
	};

	/**
	 * Specify functions that should be build when new raw mesh data becomes available and when the parser is finished.
	 * @memberOf THREE.LoaderSupport.WorkerSupport
	 *
	 * @param {Function} builder The builder function. Default is {@link THREE.LoaderSupport.Builder}.
	 * @param {Function} onLoad The function that is called when parsing is complete.
	 */
	WorkerSupport.prototype.setCallbacks = function ( builder, onLoad ) {
		this.callbacks = {
			builder: builder,
			onLoad: onLoad
		};
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

	/**
	 * Request termination of worker once parser is finished.
	 * @memberOf THREE.LoaderSupport.WorkerSupport
	 *
	 * @param {boolean} terminateRequested True or false.
	 */
	WorkerSupport.prototype.setTerminateRequested = function ( terminateRequested ) {
		this.terminateRequested = terminateRequested === true;
	};

	/**
	 * Runs the parser with the provided configuration.
	 * @memberOf THREE.LoaderSupport.WorkerSupport
	 *
	 * @param {Object} payload Raw mesh description (buffers, params, materials) used to build one to many meshes.
	 */
	WorkerSupport.prototype.run = function ( payload ) {
		if ( ! Validator.isValid( this.callbacks.builder ) ) throw 'Unable to run as no "builder" callback is set.';
		if ( ! Validator.isValid( this.callbacks.onLoad ) ) throw 'Unable to run as no "onLoad" callback is set.';
		if ( Validator.isValid( this.worker ) ) {
			this.running = true;
			this.worker.postMessage( payload );
		}
	};

	return WorkerSupport;
})();

/**
 * Orchestrate loading of multiple OBJ files/data from an instruction queue with a configurable amount of workers (1-16).
 * Workflow:
 *   prepareWorkers
 *   enqueueForRun
 *   processQueue
 *   deregister
 *
 * @class
 *
 * @param {string} classDef Class definition to be used for construction
 * @param {THREE.LoaderSupport.ConsoleLogger} logger logger to be used
 */
THREE.LoaderSupport.WorkerDirector = (function () {

	var LOADER_WORKER_DIRECTOR_VERSION = '2.0.0';

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
			workerSupports: []
		};
		this.objectsCompleted = 0;
		this.instructionQueue = [];
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
		this.objectsCompleted = 0;
		this.instructionQueue = [];

		var start = this.workerDescription.workerSupports.length;
		var i;
		if ( start < this.maxWebWorkers ) {

			for ( i = start; i < this.maxWebWorkers; i++ ) {

				this.workerDescription.workerSupports[ i ] = {
					workerSupport: new THREE.LoaderSupport.WorkerSupport( this.logger ),
					loader: null
				};

			}

		} else {

			for ( i = start - 1; i >= this.maxWebWorkers; i-- ) {

				this.workerDescription.workerSupports[ i ].workerSupport.setRequestTerminate( true );
				this.workerDescription.workerSupports.pop();

			}
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
	 * Process the instructionQueue until it is depleted.
	 * @memberOf THREE.LoaderSupport.WorkerDirector
	 */
	WorkerDirector.prototype.processQueue = function () {
		if ( this.instructionQueue.length === 0 ) return;

		var length = Math.min( this.maxWebWorkers, this.instructionQueue.length );
		for ( var i = 0; i < length; i++ ) {

			this._kickWorkerRun( this.instructionQueue[ 0 ], i );
			this.instructionQueue.shift();

		}
	};

	WorkerDirector.prototype._kickWorkerRun = function( prepData, workerInstanceNo ) {
		var scope = this;
		var directorOnLoad = function ( event ) {
			scope.objectsCompleted++;

			var nextPrepData = scope.instructionQueue[ 0 ];
			if ( Validator.isValid( nextPrepData ) ) {

				scope.instructionQueue.shift();
				scope.logger.logInfo( '\nAssigning next item from queue to worker (queue length: ' + scope.instructionQueue.length + ')\n\n' );
				scope._kickWorkerRun( nextPrepData, event.detail.instanceNo );

			} else if ( scope.instructionQueue.length === 0 ) {

				scope.deregister();

			}
		};

		var prepDataCallbacks = prepData.getCallbacks();
		var globalCallbacks = this.workerDescription.globalCallbacks;
		var wrapperOnLoad = function ( event ) {
			if ( Validator.isValid( globalCallbacks.onLoad ) ) globalCallbacks.onLoad( event );
			if ( Validator.isValid( prepDataCallbacks.onLoad ) ) prepDataCallbacks.onLoad( event );
			directorOnLoad( event );
		};

		var wrapperOnProgress = function ( event ) {
			if ( Validator.isValid( globalCallbacks.onProgress ) ) globalCallbacks.onProgress( event );
			if ( Validator.isValid( prepDataCallbacks.onProgress ) ) prepDataCallbacks.onProgress( event );
		};

		var wrapperOnMeshAlter = function ( event ) {
			if ( Validator.isValid( globalCallbacks.onMeshAlter ) ) globalCallbacks.onMeshAlter( event );
			if ( Validator.isValid( prepDataCallbacks.onMeshAlter ) ) prepDataCallbacks.onMeshAlter( event );
		};

		var supportTuple = this.workerDescription.workerSupports[ workerInstanceNo ];
		supportTuple.loader = this._buildLoader( workerInstanceNo );

		var updatedCallbacks = new THREE.LoaderSupport.Callbacks();
		updatedCallbacks.setCallbackOnLoad( wrapperOnLoad );
		updatedCallbacks.setCallbackOnProgress( wrapperOnProgress );
		updatedCallbacks.setCallbackOnMeshAlter( wrapperOnMeshAlter );
		prepData.callbacks = updatedCallbacks;

		supportTuple.loader.run( prepData, supportTuple.workerSupport );
	};

	WorkerDirector.prototype._buildLoader = function ( instanceNo ) {
		var classDef = this.workerDescription.classDef;
		var loader = Object.create( classDef.prototype );
		this.workerDescription.classDef.call( loader, this.logger );

		// verify that all required functions are implemented
		if ( ! loader.hasOwnProperty( 'instanceNo' ) ) throw classDef.name + ' has no property "instanceNo".';
		loader.instanceNo = instanceNo;

		if ( ! loader.hasOwnProperty( 'workerSupport' ) ) {

			throw classDef.name + ' has no property "workerSupport".';

		} else if ( ! classDef.workerSupport instanceof THREE.LoaderSupport.WorkerSupport ) {

			throw classDef.name + '.workerSupport is not of type "THREE.LoaderSupport.WorkerSupport".';

		}
		if ( typeof loader.run !== 'function'  ) throw classDef.name + ' has no function "run".';

		return loader;
	};

	/**
	 * Terminate all workers.
	 * @memberOf THREE.LoaderSupport.WorkerDirector
	 */
	WorkerDirector.prototype.deregister = function () {
		this.logger.logInfo( 'WorkerDirector received the deregister call. Terminating all workers!' );

		for ( var i = 0, length = this.workerDescription.workerSupports.length; i < length; i++ ) {

			var supportTuple = this.workerDescription.workerSupports[ i ];
			supportTuple.workerSupport.setTerminateRequested( true );
			this.logger.logInfo( 'Requested termination of worker.' );

			var loaderCallbacks = supportTuple.loader.callbacks;
			if ( Validator.isValid( loaderCallbacks.onProgress ) ) loaderCallbacks.onProgress( { detail: { text: '' } } );

		}

		this.workerDescription.workerSupports = [];
		this.instructionQueue = [];
	};

	return WorkerDirector;

})();
