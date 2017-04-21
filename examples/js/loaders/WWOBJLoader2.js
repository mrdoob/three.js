/**
  * @author Kai Salmen / https://kaisalmen.de
  * Development repository: https://github.com/kaisalmen/WWOBJLoader
  */

'use strict';

if ( THREE.OBJLoader2 === undefined ) { THREE.OBJLoader2 = {} }
THREE.OBJLoader2.version = '1.1.0';

/**
 * OBJ data will be loaded by dynamically created web worker.
 * First feed instructions with: prepareRun
 * Then: Execute with: run
 * @class
 */
THREE.OBJLoader2.WWOBJLoader2 = (function () {

	function WWOBJLoader2() {
		this._init();
	}

	WWOBJLoader2.prototype._init = function () {
		// check worker support first
		if ( window.Worker === undefined ) throw "This browser does not support web workers!";
		if ( window.Blob === undefined  ) throw "This browser does not support Blob!";
		if ( ! typeof window.URL.createObjectURL === 'function'  ) throw "This browser does not support Object creation from URL!";

		this.instanceNo = 0;
		this.worker = null;
		this.workerCode = null;
		this.debug = false;

		this.sceneGraphBaseNode = null;
		this.streamMeshes = true;
		this.meshStore = null;
		this.modelName = 'none';
		this.validated = false;
		this.running = false;
		this.requestTerminate = false;

		this.callbacks = {
			progress: null,
			completedLoading: null,
			errorWhileLoading: null,
			materialsLoaded: null,
			meshLoaded: null,
			director: {
				completedLoading: null,
				errorWhileLoading: null
			}
		};

		this.manager = THREE.DefaultLoadingManager;
		this.fileLoader = new THREE.FileLoader( this.manager );
		this.mtlLoader = null;
		this.crossOrigin = null;

		this.dataAvailable = false;
		this.objAsArrayBuffer = null;
		this.fileObj = null;
		this.pathObj = null;

		this.fileMtl = null;
		this.mtlAsString = null;
		this.texturePath = null;

		this.materials = [];
		this.counter = 0;
	};

	/**
	 * Set enable or disable debug logging
	 * @memberOf THREE.OBJLoader2.WWOBJLoader2
	 *
	 * @param {boolean} enabled
	 */
	WWOBJLoader2.prototype.setDebug = function ( enabled ) {
		this.debug = enabled;
	};

	/**
	 * Sets the CORS string to be used.
	 * @memberOf THREE.OBJLoader2.WWOBJLoader2
	 *
	 * @param {string} crossOrigin CORS value
	 */
	WWOBJLoader2.prototype.setCrossOrigin = function ( crossOrigin ) {
		this.crossOrigin = crossOrigin;
	};

	/**
	 * Register callback function that is invoked by internal function "_announceProgress" to print feedback
	 * @memberOf THREE.OBJLoader2.WWOBJLoader2
	 *
	 * @param {callback} callbackProgress Callback function for described functionality
	 */
	WWOBJLoader2.prototype.registerCallbackProgress = function ( callbackProgress ) {
		if ( callbackProgress != null ) this.callbacks.progress = callbackProgress;
	};

	/**
	 * Register callback function that is called once loading of the complete model is completed
	 * @memberOf THREE.OBJLoader2.WWOBJLoader2
	 *
	 * @param {callback} callbackCompletedLoading Callback function for described functionality
	 */
	WWOBJLoader2.prototype.registerCallbackCompletedLoading = function ( callbackCompletedLoading ) {
		if ( callbackCompletedLoading != null ) this.callbacks.completedLoading = callbackCompletedLoading;
	};

	/**
	 * Register callback function that is called once materials have been loaded. It allows to alter and return materials
	 * @memberOf THREE.OBJLoader2.WWOBJLoader2
	 *
	 * @param {callback} callbackMaterialsLoaded Callback function for described functionality
	 */
	WWOBJLoader2.prototype.registerCallbackMaterialsLoaded = function ( callbackMaterialsLoaded ) {
		if ( callbackMaterialsLoaded != null ) this.callbacks.materialsLoaded = callbackMaterialsLoaded;
	};

	/**
	 * Register callback function that is called every time a mesh was loaded
	 * @memberOf THREE.OBJLoader2.WWOBJLoader2
	 *
	 * @param {callback} callbackMeshLoaded Callback function for described functionality
	 */
	WWOBJLoader2.prototype.registerCallbackMeshLoaded = function ( callbackMeshLoaded ) {
		if ( callbackMeshLoaded != null ) this.callbacks.meshLoaded = callbackMeshLoaded;
	};

	/**
	 * Report if an error prevented loading
	 * @memberOf THREE.OBJLoader2.WWOBJLoader2
	 *
	 * @param {callback} callbackErrorWhileLoading Callback function for described functionality
	 */
	WWOBJLoader2.prototype.registerCallbackErrorWhileLoading = function ( callbackErrorWhileLoading ) {
		if ( callbackErrorWhileLoading != null ) this.callbacks.errorWhileLoading = callbackErrorWhileLoading;
	};

	/**
	 * Call requestTerminate to terminate the web worker and free local resource after execution
	 * @memberOf THREE.OBJLoader2.WWOBJLoader2
	 *
	 * @param {boolean} requestTerminate
	 */
	WWOBJLoader2.prototype.setRequestTerminate = function ( requestTerminate ) {
		this.requestTerminate = ( requestTerminate != null && requestTerminate ) ? true : false;
	};

	WWOBJLoader2.prototype._validate = function () {
		if ( this.validated ) return;
		if ( this.worker == null ) {

			this._buildWebWorkerCode();
			var blob = new Blob( [ this.workerCode ], { type: 'text/plain' } );
			this.worker = new Worker( window.URL.createObjectURL( blob ) );

			var scope = this;
			var scopeFunction = function ( e ) {
				scope._receiveWorkerMessage( e );
			};
			this.worker.addEventListener( 'message', scopeFunction, false );

		}

		this.sceneGraphBaseNode = null;
		this.streamMeshes = true;
		this.meshStore = [];
		this.modelName = 'none';
		this.validated = true;
		this.running = true;
		this.requestTerminate = false;

		this.fileLoader = ( this.fileLoader == null ) ? new THREE.FileLoader( this.manager ) : this.fileLoader;
		this.mtlLoader = ( this.mtlLoader == null ) ?  new THREE.MTLLoader() : this.mtlLoader;
		if ( this.crossOrigin != null ) this.mtlLoader.setCrossOrigin( this.crossOrigin );

		this.dataAvailable = false;
		this.fileObj = null;
		this.pathObj = null;
		this.fileMtl = null;
		this.texturePath = null;

		this.objAsArrayBuffer = null;
		this.mtlAsString = null;

		this.materials = [];
		var defaultMaterial = new THREE.MeshStandardMaterial( { color: 0xDCF1FF } );
		defaultMaterial.name = 'defaultMaterial';
		this.materials[ defaultMaterial.name ] = defaultMaterial;

		this.counter = 0;
	};

	/**
	 * Set all parameters for required for execution of "run".
	 * @memberOf THREE.OBJLoader2.WWOBJLoader2
	 *
	 * @param {Object} params Either {@link THREE.OBJLoader2.WWOBJLoader2.PrepDataArrayBuffer} or {@link THREE.OBJLoader2.WWOBJLoader2.PrepDataFile}
	 */
	WWOBJLoader2.prototype.prepareRun = function ( params ) {
		this._validate();
		this.dataAvailable = params.dataAvailable;
		this.modelName = params.modelName;
		console.time( 'WWOBJLoader2' );
		if ( this.dataAvailable ) {

			// fast-fail on bad type
			if ( ! ( params.objAsArrayBuffer instanceof Uint8Array ) ) {
				throw 'Provided input is not of type arraybuffer! Aborting...';
			}

			this.worker.postMessage( {
				cmd: 'init',
				debug: this.debug
			} );

			this.objAsArrayBuffer = params.objAsArrayBuffer;
			this.mtlAsString = params.mtlAsString;

		} else {

			// fast-fail on bad type
			if ( ! ( typeof( params.fileObj ) === 'string' || params.fileObj instanceof String ) ) {
				throw 'Provided file is not properly defined! Aborting...';
			}

			this.worker.postMessage( {
				cmd: 'init',
				debug: this.debug
			} );

			this.fileObj = params.fileObj;
			this.pathObj = params.pathObj;
			this.fileMtl = params.fileMtl;

		}
		this.setRequestTerminate( params.requestTerminate );
		this.pathTexture = params.pathTexture;
		this.sceneGraphBaseNode = params.sceneGraphBaseNode;
		this.streamMeshes = params.streamMeshes;
		if ( ! this.streamMeshes ) this.meshStore = [];
	};

	/**
	 * Run the loader according the preparation instruction provided in "prepareRun".
	 * @memberOf THREE.OBJLoader2.WWOBJLoader2
	 */
	WWOBJLoader2.prototype.run = function () {
		var scope = this;
		var processLoadedMaterials = function ( materialCreator ) {
			var materialCreatorMaterials = [];
			var materialNames = [];
			if ( materialCreator != null ) {

				materialCreator.preload();
				materialCreatorMaterials = materialCreator.materials;
				for ( var materialName in materialCreatorMaterials ) {

					if ( materialCreatorMaterials.hasOwnProperty( materialName ) ) {

						materialNames.push( materialName );
						scope.materials[ materialName ] = materialCreatorMaterials[ materialName ];

					}

				}

			}
			scope.worker.postMessage( {
				cmd: 'setMaterials',
				materialNames: materialNames
			} );

			if ( scope.callbacks.materialsLoaded != null ) {

				var materialsCallback = scope.callbacks.materialsLoaded( scope.materials );
				if ( materialsCallback != null ) scope.materials = materialsCallback;

			}

			if ( scope.dataAvailable && scope.objAsArrayBuffer ) {

				scope.worker.postMessage({
					cmd: 'run',
					objAsArrayBuffer: scope.objAsArrayBuffer
				}, [ scope.objAsArrayBuffer.buffer ] );

			} else {

				var refPercentComplete = 0;
				var percentComplete = 0;
				var output;
				var onLoad = function ( objAsArrayBuffer ) {

					scope._announceProgress( 'Running web worker!' );
					scope.objAsArrayBuffer = new Uint8Array( objAsArrayBuffer );
					scope.worker.postMessage( {
						cmd: 'run',
						objAsArrayBuffer: scope.objAsArrayBuffer
					}, [ scope.objAsArrayBuffer.buffer ] );

				};

				var onProgress = function ( event ) {
					if ( ! event.lengthComputable ) return;

					percentComplete = Math.round( event.loaded / event.total * 100 );
					if ( percentComplete > refPercentComplete ) {

						refPercentComplete = percentComplete;
						output = 'Download of "' + scope.fileObj + '": ' + percentComplete + '%';
						console.log( output );
						scope._announceProgress( output );

					}
				};

				var onError = function ( event ) {
					output = 'Error occurred while downloading "' + scope.fileObj + '"';
					console.error( output + ': ' + event );
					scope._announceProgress( output );
					scope._finalize( 'error' );

				};

				scope.fileLoader.setPath( scope.pathObj );
				scope.fileLoader.setResponseType( 'arraybuffer' );
				scope.fileLoader.load( scope.fileObj, onLoad, onProgress, onError );
			}
			console.timeEnd( 'Loading MTL textures' );
		};


		this.mtlLoader.setPath( this.pathTexture );
		if ( this.dataAvailable ) {

			processLoadedMaterials( ( this.mtlAsString != null ) ? this.mtlLoader.parse( this.mtlAsString ) : null );

		} else {

			if ( this.fileMtl == null ) {

				processLoadedMaterials();

			} else {

				this.mtlLoader.load( this.fileMtl, processLoadedMaterials );

			}

		}
	};

	WWOBJLoader2.prototype._receiveWorkerMessage = function ( event ) {
		var payload = event.data;

		switch ( payload.cmd ) {
			case 'objData':

				this.counter ++;
				var bufferGeometry = new THREE.BufferGeometry();

				bufferGeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( payload.vertices ), 3 ) );
				if ( payload.normals !== null ) {

					bufferGeometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( payload.normals ), 3 ) );

				} else {

					bufferGeometry.computeVertexNormals();

				}
				if ( payload.uvs !== null ) {

					bufferGeometry.addAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( payload.uvs ), 2 ) );

				}

				var materialDescriptions = payload.materialDescriptions;
				var materialDescription;
				var material;
				var materialName;
				var createMultiMaterial = payload.multiMaterial;
				var multiMaterials = [];

				for ( var key in materialDescriptions ) {

					materialDescription = materialDescriptions[ key ];
					material = this.materials[ materialDescription.name ];

					if ( materialDescription.default ) {

						material = this.materials[ 'defaultMaterial' ];

					} else if ( materialDescription.clone ) {

						materialName = material.name + '_flat';
						var materialClone = this.materials[ materialName ];
						if ( ! materialClone ) {

							materialClone = material.clone();
							materialClone.name = materialName;
							materialClone.shading = THREE.FlatShading;
							this.materials[ materialName ] = name;

						}

					} else if ( ! material ) {

						material = this.materials[ 'defaultMaterial' ];

					}
					if ( createMultiMaterial ) multiMaterials.push( material );

				}
				if ( createMultiMaterial ) {

					material = multiMaterials;
					var materialGroups = payload.materialGroups;
					var materialGroup;
					for ( var key in materialGroups ) {

						materialGroup = materialGroups[ key ];
						bufferGeometry.addGroup( materialGroup.start, materialGroup.count, materialGroup.index );

					}

				}
				if ( this.callbacks.meshLoaded !== null ) {

					var materialOverride = this.callbacks.meshLoaded( payload.meshName, material );
					if ( materialOverride != null ) material = materialOverride;

				}
				var mesh = new THREE.Mesh( bufferGeometry, material );
				mesh.name = payload.meshName;
				if ( this.streamMeshes ) {

					this.sceneGraphBaseNode.add( mesh );

				} else {

					this.meshStore.push( mesh );

				}
				var output = '(' + this.counter + '): ' + payload.meshName;
				this._announceProgress( 'Adding mesh', output );
				break;

			case 'complete':

				if ( ! this.streamMeshes ) {

					for ( var key in this.meshStore ) {

						this.sceneGraphBaseNode.add( this.meshStore[ key ] );

					}

				}

				console.timeEnd( 'WWOBJLoader2' );
				if ( payload.msg != null ) {

					this._announceProgress( payload.msg );

				} else {

					this._announceProgress( '' );

				}

				this._finalize( 'complete' );
				break;

			case 'report_progress':
				this._announceProgress( '', payload.output );
				break;

			default:
				console.error( 'Received unknown command: ' + payload.cmd );
				break;

		}
	};

	WWOBJLoader2.prototype._terminate = function () {
		if ( this.worker != null ) {

			if ( this.running ) throw 'Unable to gracefully terminate worker as it is currently running!';

			this.worker.terminate();
			this.worker = null;
			this.workerCode = null;
			this._finalize( 'terminate' );

		}
		this.fileLoader = null;
		this.mtlLoader = null;
	};

	WWOBJLoader2.prototype._finalize = function ( reason, requestTerminate ) {
		this.running = false;
		if ( reason === 'complete' ) {

			if ( this.callbacks.completedLoading != null ) this.callbacks.completedLoading( this.modelName, this.instanceNo, this.requestTerminate );
			if ( this.callbacks.director.completedLoading != null ) this.callbacks.director.completedLoading( this.modelName, this.instanceNo, this.requestTerminate );

		} else if ( reason === 'error' ) {

			if ( this.callbacks.errorWhileLoading != null ) this.callbacks.errorWhileLoading( this.modelName, this.instanceNo, this.requestTerminate );
			if ( this.callbacks.director.errorWhileLoading != null ) this.callbacks.director.errorWhileLoading( this.modelName, this.instanceNo, this.requestTerminate );

		}
		this.validated = false;

		this.setRequestTerminate( requestTerminate );

		if ( this.requestTerminate ) {
			this._terminate();
		}
	};

	WWOBJLoader2.prototype._announceProgress = function ( baseText, text ) {
		var output = "";
		if ( baseText !== null && baseText !== undefined ) {

			output = baseText;

		}
		if ( text !== null && text !== undefined ) {

			output = output + " " + text;

		}
		if ( this.callbacks.progress !== null ) {

			this.callbacks.progress( output );

		}
		if ( this.debug ) {

			console.log( output );

		}
	};

	WWOBJLoader2.prototype._buildWebWorkerCode = function ( existingWorkerCode ) {
		if ( existingWorkerCode != null ) this.workerCode = existingWorkerCode;
		if ( this.workerCode == null ) {

			console.time( 'buildWebWorkerCode' );
			var wwDef = (function () {

				function WWOBJLoader() {
					this.wwMeshCreator = new WWMeshCreator();
					this.parser = new Parser( this.wwMeshCreator );
					this.validated = false;
					this.cmdState = 'created';

					this.debug = false;
				}

				/**
				 * Allows to set debug mode for the parser and the meshCreatorDebug
				 *
				 * @param parserDebug
				 * @param meshCreatorDebug
				 */
				WWOBJLoader.prototype.setDebug = function ( parserDebug, meshCreatorDebug ) {
					this.parser.setDebug( parserDebug );
					this.wwMeshCreator.setDebug( meshCreatorDebug );
				};

				/**
				 * Validate status, then parse arrayBuffer, finalize and return objGroup
				 *
				 * @param arrayBuffer
				 */
				WWOBJLoader.prototype.parse = function ( arrayBuffer ) {
					console.log( 'Parsing arrayBuffer...' );
					console.time( 'parseArrayBuffer' );

					this.validate();
					this.parser.parseArrayBuffer( arrayBuffer );
					var objGroup = this._finalize();

					console.timeEnd( 'parseArrayBuffer' );

					return objGroup;
				};

				WWOBJLoader.prototype.validate = function () {
					if ( this.validated ) return;

					this.parser.validate();
					this.wwMeshCreator.validate();

					this.validated = true;
				};

				WWOBJLoader.prototype._finalize = function () {
					console.log( 'Global output object count: ' + this.wwMeshCreator.globalObjectCount );
					this.parser.finalize();
					this.wwMeshCreator.finalize();
					this.validated = false;
				};

				WWOBJLoader.prototype.init = function ( payload ) {
					this.cmdState = 'init';
					this.setDebug( payload.debug, payload.debug );
				};

				WWOBJLoader.prototype.setMaterials = function ( payload ) {
					this.cmdState = 'setMaterials';
					this.wwMeshCreator.setMaterials( payload.materialNames );
				};

				WWOBJLoader.prototype.run = function ( payload ) {
					this.cmdState = 'run';

					this.parse( payload.objAsArrayBuffer );
					console.log( 'OBJ loading complete!' );

					this.cmdState = 'complete';
					self.postMessage( {
						cmd: this.cmdState,
						msg: null
					} );
				};

				return WWOBJLoader;
			})();

			var wwMeshCreatorDef = (function () {

				function WWMeshCreator() {
					this.materials = null;
					this.debug = false;
					this.globalObjectCount = 1;
					this.validated = false;
				}

				WWMeshCreator.prototype.setMaterials = function ( materials ) {
					this.materials = ( materials == null ) ? ( this.materials == null ? { materials: [] } : this.materials ) : materials;
				};

				WWMeshCreator.prototype.setDebug = function ( debug ) {
					this.debug = ( debug == null ) ? this.debug : debug;
				};

				WWMeshCreator.prototype.validate = function () {
					if ( this.validated ) return;

					this.setMaterials( null );
					this.setDebug( null );
					this.globalObjectCount = 1;
				};

				WWMeshCreator.prototype.finalize = function () {
					this.materials = null;
					this.validated = false;
				};

				/**
				 * RawObjectDescriptions are transformed to THREE.Mesh.
				 * It is ensured that rawObjectDescriptions only contain objects with vertices (no need to check).
				 *
				 * @param rawObjectDescriptions
				 * @param inputObjectCount
				 * @param absoluteVertexCount
				 * @param absoluteNormalCount
				 * @param absoluteUvCount
				 */
				WWMeshCreator.prototype.buildMesh = function ( rawObjectDescriptions, inputObjectCount, absoluteVertexCount, absoluteNormalCount, absoluteUvCount ) {
					if ( this.debug ) console.log( 'OBJLoader.buildMesh:\nInput object no.: ' + inputObjectCount );

					var vertexFa = new Float32Array( absoluteVertexCount );
					var normalFA = ( absoluteNormalCount > 0 ) ? new Float32Array( absoluteNormalCount ) : null;
					var uvFA = ( absoluteUvCount > 0 ) ? new Float32Array( absoluteUvCount ) : null;

					var rawObjectDescription;
					var materialDescription;
					var materialDescriptions = [];

					var createMultiMaterial = ( rawObjectDescriptions.length > 1 );
					var materialIndex = 0;
					var materialIndexMapping = [];
					var selectedMaterialIndex;
					var materialGroup;
					var materialGroups = [];

					var vertexBAOffset = 0;
					var vertexGroupOffset = 0;
					var vertexLength;
					var normalOffset = 0;
					var uvOffset = 0;

					for ( var oodIndex in rawObjectDescriptions ) {
						rawObjectDescription = rawObjectDescriptions[ oodIndex ];

						materialDescription = { name: rawObjectDescription.materialName, flat: false, default: false };
						if ( this.materials[ materialDescription.name ] === null ) {

							materialDescription.default = true;
							console.warn( 'object_group "' + rawObjectDescription.objectName + '_' + rawObjectDescription.groupName + '" was defined without material! Assigning "defaultMaterial".' );

						}
						// Attach '_flat' to materialName in case flat shading is needed due to smoothingGroup 0
						if ( rawObjectDescription.smoothingGroup === 0 ) materialDescription.flat = true;

						vertexLength = rawObjectDescription.vertices.length;
						if ( createMultiMaterial ) {

							// re-use material if already used before. Reduces materials array size and eliminates duplicates

							selectedMaterialIndex = materialIndexMapping[ materialDescription.name ];
							if ( ! selectedMaterialIndex ) {

								selectedMaterialIndex = materialIndex;
								materialIndexMapping[ materialDescription.name ] = materialIndex;
								materialDescriptions.push( materialDescription );
								materialIndex++;

							}
							materialGroup = {
								start: vertexGroupOffset,
								count: vertexLength / 3,
								index: selectedMaterialIndex
							};
							materialGroups.push( materialGroup );
							vertexGroupOffset += vertexLength / 3;

						} else {

							materialDescriptions.push( materialDescription );

						}

						vertexFa.set( rawObjectDescription.vertices, vertexBAOffset );
						vertexBAOffset += vertexLength;

						if ( normalFA ) {

							normalFA.set( rawObjectDescription.normals, normalOffset );
							normalOffset += rawObjectDescription.normals.length;

						}
						if ( uvFA ) {

							uvFA.set( rawObjectDescription.uvs, uvOffset );
							uvOffset += rawObjectDescription.uvs.length;

						}
						if ( this.debug ) this.printReport( rawObjectDescription, selectedMaterialIndex );

					}

					self.postMessage( {
						cmd: 'objData',
						meshName: rawObjectDescription.objectName,
						multiMaterial: createMultiMaterial,
						materialDescriptions: materialDescriptions,
						materialGroups: materialGroups,
						vertices: vertexFa,
						normals: normalFA,
						uvs: uvFA
					}, [ vertexFa.buffer ], normalFA !== null ? [ normalFA.buffer ] : null, uvFA !== null ? [ uvFA.buffer ] : null );

					this.globalObjectCount++;
				};

				return WWMeshCreator;
			})();

			var wwObjLoaderRunnerDef = (function () {

				function WWOBJLoaderRunner() {
					self.addEventListener( 'message', this.runner, false );
				}

				WWOBJLoaderRunner.prototype.runner = function ( event ) {
					var payload = event.data;

					console.log( 'Command state before: ' + WWOBJLoaderRef.cmdState );

					switch ( payload.cmd ) {
						case 'init':

							WWOBJLoaderRef.init( payload );
							break;

						case 'setMaterials':

							WWOBJLoaderRef.setMaterials( payload );
							break;

						case 'run':

							WWOBJLoaderRef.run( payload );
							break;

						default:

							console.error( 'OBJLoader: Received unknown command: ' + payload.cmd );
							break;

					}

					console.log( 'Command state after: ' + WWOBJLoaderRef.cmdState );
				};

				return WWOBJLoaderRunner;
			})();

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

			this.workerCode = '';
			this.workerCode += '/**\n';
			this.workerCode += '  * This code was constructed by WWOBJLoader2._buildWebWorkerCode\n';
			this.workerCode += '  */\n\n';

			// parser re-construction
			var objLoaderHelper = new THREE.OBJLoader2();
			this.workerCode += objLoaderHelper._buildWebWorkerCode( buildObject, buildSingelton );

			// web worker construction
			this.workerCode += buildSingelton( 'WWOBJLoader', 'WWOBJLoader', wwDef );
			this.workerCode += buildSingelton( 'WWMeshCreator', 'WWMeshCreator', wwMeshCreatorDef );
			this.workerCode += 'WWOBJLoaderRef = new WWOBJLoader();\n\n';
			this.workerCode += buildSingelton( 'WWOBJLoaderRunner', 'WWOBJLoaderRunner', wwObjLoaderRunnerDef );
			this.workerCode += 'new WWOBJLoaderRunner();\n\n';

			console.timeEnd( 'buildWebWorkerCode' );
		}

		return this.workerCode;
	};

	return WWOBJLoader2;

})();

/**
 * Instruction to configure {@link THREE.OBJLoader2.WWOBJLoader2}.prepareRun to load OBJ from given ArrayBuffer and MTL from given String
 *
 * @param {string} modelName Overall name of the model
 * @param {Uint8Array} objAsArrayBuffer OBJ file content as ArrayBuffer
 * @param {string} pathTexture Path to texture files
 * @param {string} mtlAsString MTL file content as string
 * @param {THREE.Object3D} sceneGraphBaseNode {@link THREE.Object3D} where meshes will be attached
 * @param {boolean} streamMeshes=true Singles meshes are directly integrated into scene when loaded or later
 * @param {boolean} [requestTerminate=false] Request termination of web worker and free local resources after execution
 *
 * @returns {{modelName: string, dataAvailable: boolean, objAsArrayBuffer: null, pathTexture: null, mtlAsString: null, sceneGraphBaseNode: null, streamMeshes: boolean, requestTerminate: boolean}}
 * @constructor
 */
THREE.OBJLoader2.WWOBJLoader2.PrepDataArrayBuffer = function ( modelName, objAsArrayBuffer, pathTexture, mtlAsString, sceneGraphBaseNode, streamMeshes, requestTerminate ) {

	var data = {
		modelName: ( modelName == null ) ? 'none' : modelName,
		dataAvailable: true,
		objAsArrayBuffer: ( objAsArrayBuffer == null ) ? null : objAsArrayBuffer,
		pathTexture: ( pathTexture == null ) ? null : pathTexture,
		mtlAsString: ( mtlAsString == null ) ? null : mtlAsString,
		sceneGraphBaseNode: ( sceneGraphBaseNode == null ) ? null : sceneGraphBaseNode,
		streamMeshes: ( streamMeshes == null ) ? true : streamMeshes,
		requestTerminate: ( requestTerminate == null ) ? false : requestTerminate
	};

	return data;
};

/**
 * Instruction to configure {@link THREE.OBJLoader2.WWOBJLoader2}.prepareRun to load OBJ and MTL from files
 *
 * @param {string} modelName Overall name of the model
 * @param {string} pathObj Path to OBJ file
 * @param {string} fileObj OBJ file name
 * @param {string} pathTexture Path to texture files
 * @param {string} fileMtl MTL file name
 * @param {THREE.Object3D} sceneGraphBaseNode {@link THREE.Object3D} where meshes will be attached
 * @param {boolean} streamMeshes=true Singles meshes are directly integrated into scene when loaded or later
 * @param {boolean} [requestTerminate=false] Request termination of web worker and free local resources after execution
 *
 * @returns {{modelName: string, dataAvailable: boolean, pathObj: null, fileObj: null, pathTexture: null, fileMtl: null, sceneGraphBaseNode: null, streamMeshes: boolean,  requestTerminate: boolean}}
 * @constructor
 */
THREE.OBJLoader2.WWOBJLoader2.PrepDataFile = function ( modelName, pathObj, fileObj, pathTexture, fileMtl, sceneGraphBaseNode, streamMeshes, requestTerminate ) {

	var data = {
		modelName: ( modelName == null ) ? 'none' : modelName,
		dataAvailable: false,
		pathObj: ( pathObj == null ) ? null : pathObj,
		fileObj: ( fileObj == null ) ? null : fileObj,
		pathTexture: ( pathTexture == null ) ? null : pathTexture,
		fileMtl: ( fileMtl == null ) ? null : fileMtl,
		sceneGraphBaseNode: ( sceneGraphBaseNode == null ) ? null : sceneGraphBaseNode,
		streamMeshes: ( streamMeshes == null ) ? true : streamMeshes,
		requestTerminate: ( requestTerminate == null ) ? false : requestTerminate
	};

	return data;
};
/**
 * Orchestrate loading of multiple OBJ files/data from an instruction queue with a configurable amount of workers (1-16).
 * Use:
 *   prepareWorkers
 *   enqueueForRun
 *   processQueue
 *   deregister
 *
 * @class
 */
THREE.OBJLoader2.WWOBJLoader2Director = (function () {

	var MAX_WEB_WORKER = 16;
	var MAX_QUEUE_SIZE = 1024;

	function WWOBJLoader2Director() {
		this.maxQueueSize = MAX_QUEUE_SIZE ;
		this.maxWebWorkers = MAX_WEB_WORKER;
		this.crossOrigin = null;

		this.workerDescription = {
			prototypeDef: THREE.OBJLoader2.WWOBJLoader2.prototype,
			callbacks: {},
			webWorkers: [],
			codeBuffer: null
		};
		this.objectsCompleted = 0;
		this.instructionQueue = [];
	}

	/**
	 * Returns the maximum length of the instruction queue.
	 * @memberOf THREE.OBJLoader2.WWOBJLoader2Director
	 *
	 * @returns {number}
	 */
	WWOBJLoader2Director.prototype.getMaxQueueSize = function () {
		return this.maxQueueSize;
	};

	/**
	 * Returns the maximum number of workers.
	 * @memberOf THREE.OBJLoader2.WWOBJLoader2Director
	 *
	 * @returns {number}
	 */
	WWOBJLoader2Director.prototype.getMaxWebWorkers = function () {
		return this.maxWebWorkers;
	};

	/**
	 * Sets the CORS string to be used.
	 * @memberOf THREE.OBJLoader2.WWOBJLoader2Director
	 *
	 * @param {string} crossOrigin CORS value
	 */
	WWOBJLoader2Director.prototype.setCrossOrigin = function ( crossOrigin ) {
		this.crossOrigin = crossOrigin;
	};

	/**
	 * Create or destroy workers according limits. Set the name and register callbacks for dynamically created web workers.
	 * @memberOf THREE.OBJLoader2.WWOBJLoader2Director
	 *
	 * @param {callback[]} callbacks Register callbacks for all web workers:
	 * 		{ progress: null, completedLoading: null, errorWhileLoading: null, materialsLoaded: null, meshLoaded: null }
	 * @param {number} maxQueueSize Set the maximum size of the instruction queue (1-1024)
	 * @param {number} maxWebWorkers Set the maximum amount of workers (1-16)
	 */
	WWOBJLoader2Director.prototype.prepareWorkers = function ( callbacks, maxQueueSize, maxWebWorkers ) {
		if ( callbacks != null ) {

			for ( var key in callbacks ) {

				if ( callbacks.hasOwnProperty( key ) ) this.workerDescription.callbacks[ key ] = callbacks[ key ];

			}

		}

		this.maxQueueSize = Math.min( maxQueueSize, MAX_QUEUE_SIZE );
		this.maxWebWorkers = Math.min( maxWebWorkers, MAX_WEB_WORKER );
		this.objectsCompleted = 0;
		this.instructionQueue = [];

		var start = this.workerDescription.webWorkers.length;
		if ( start < this.maxWebWorkers ) {

			for ( i = start; i < this.maxWebWorkers; i ++ ) {

				webWorker = this._buildWebWorker();
				this.workerDescription.webWorkers[ i ] = webWorker;

			}

		} else {

			for ( var webWorker, i = start - 1; i >= this.maxWebWorkers; i-- ) {

				webWorker = this.workerDescription.webWorkers[ i ];
				webWorker.setRequestTerminate( true );

				this.workerDescription.webWorkers.pop();

			}

		}
	};

	/**
	 * Store run instructions in internal instructionQueue
	 * @memberOf THREE.OBJLoader2.WWOBJLoader2Director
	 *
	 * @param {Object} params Either {@link THREE.OBJLoader2.WWOBJLoader2.PrepDataArrayBuffer} or {@link THREE.OBJLoader2.WWOBJLoader2.PrepDataFile}
	 */
	WWOBJLoader2Director.prototype.enqueueForRun = function ( runParams ) {
		if ( this.instructionQueue.length < this.maxQueueSize ) {
			this.instructionQueue.push( runParams );
		}
	};

	/**
	 * Process the instructionQueue until it is depleted
	 * @memberOf THREE.OBJLoader2.WWOBJLoader2Director
	 */
	WWOBJLoader2Director.prototype.processQueue = function () {
		if ( this.instructionQueue.length === 0 ) return;

		var webWorker;
		var runParams;
		var length = Math.min( this.maxWebWorkers, this.instructionQueue.length );
		for ( var i = 0; i < length; i++ ) {

			webWorker = this.workerDescription.webWorkers[ i ];
			runParams = this.instructionQueue[ 0 ];
			webWorker.prepareRun( runParams );
			webWorker.run();
			this.instructionQueue.shift();

		}
	};

	WWOBJLoader2Director.prototype._buildWebWorker = function () {
		var webWorker = Object.create( this.workerDescription.prototypeDef );
		webWorker._init();
		if ( this.crossOrigin != null )	webWorker.setCrossOrigin( this.crossOrigin );

		// Ensure code string is built once and then it is just passed on to every new instance
		if ( this.workerDescription.codeBuffer == null ) {

			this.workerDescription.codeBuffer = webWorker._buildWebWorkerCode();

		} else {

			webWorker._buildWebWorkerCode( this.workerDescription.codeBuffer );

		}
		for ( var key in this.workerDescription.callbacks ) {

			if ( webWorker.callbacks.hasOwnProperty( key ) && this.workerDescription.callbacks.hasOwnProperty( key ) ) {

				webWorker.callbacks[ key ] = this.workerDescription.callbacks[ key ];

			}

		}
		var scope = this;
		var managerCompletedLoading = function ( modelName, instanceNo, requestTerminate ) {
			scope.objectsCompleted++;
			if ( ! requestTerminate ) {

				var rekick = scope.workerDescription.webWorkers[ instanceNo ];
				var runParams = scope.instructionQueue[ 0 ];
				if ( runParams != null ) {

					rekick.prepareRun( runParams );
					rekick.run();
					scope.instructionQueue.shift();

				}

			}
		};

		webWorker.callbacks.director[ 'completedLoading' ] = managerCompletedLoading;
		webWorker.instanceNo = this.workerDescription.webWorkers.length;
		this.workerDescription.webWorkers.push( webWorker );
		return webWorker;
	};

	/**
	 * Terminate all workers
	 * @memberOf THREE.OBJLoader2.WWOBJLoader2Director
	 */
	WWOBJLoader2Director.prototype.deregister = function () {
		console.log( 'WWOBJLoader2Director received the unregister call. Terminating all workers!' );
		for ( var i = 0, webWorker, length = this.workerDescription.webWorkers.length; i < length; i++ ) {

			webWorker = this.workerDescription.webWorkers[ i ];
			webWorker.setRequestTerminate( true );

		}
		this.workerDescription.callbacks = {};
		this.workerDescription.webWorkers = [];
		this.workerDescription.codeBuffer = null;
	};

	return WWOBJLoader2Director;

})();
