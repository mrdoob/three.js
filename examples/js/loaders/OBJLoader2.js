/**
  * @author Kai Salmen / https://kaisalmen.de
  * Development repository: https://github.com/kaisalmen/WWOBJLoader
  */

'use strict';

if ( THREE.OBJLoader2 === undefined ) { THREE.OBJLoader2 = {} }

/**
 * Use this class to load OBJ data from files or to parse OBJ data from an arraybuffer
 * @class
 *
 * @param {THREE.DefaultLoadingManager} [manager] The loadingManager for the loader to use. Default is {@link THREE.DefaultLoadingManager}
 */
THREE.OBJLoader2 = (function () {

	var OBJLOADER2_VERSION = '2.0.0-dev';
	var Validator = THREE.LoaderSupport.Validator;
	var Commons = THREE.LoaderSupport.Commons;

	OBJLoader2.prototype = Object.create( THREE.LoaderSupport.Commons.prototype );
	OBJLoader2.prototype.constructor = OBJLoader2;

	function OBJLoader2( manager ) {
		THREE.LoaderSupport.Commons.call( this, manager );
		console.log( "Using THREE.OBJLoader2 version: " + OBJLOADER2_VERSION );

		this.materialPerSmoothingGroup = false;
		this.fileLoader = Validator.verifyInput( this.fileLoader, new THREE.FileLoader( this.manager ) );

		this.workerSupport = null;
		this.terminateWorkerOnLoad = true;
	};

	/**
	 * Tells whether a material shall be created per smoothing group
	 * @memberOf THREE.OBJLoader2
	 *
	 * @param {boolean} materialPerSmoothingGroup=false Default is false
	 */
	OBJLoader2.prototype.setMaterialPerSmoothingGroup = function ( materialPerSmoothingGroup ) {
		this.materialPerSmoothingGroup = materialPerSmoothingGroup === true;
	};

	/**
	 * Sets debug mode for the parser
	 * @memberOf THREE.OBJLoader2
	 *
	 * @param {boolean} enabled
	 */
	OBJLoader2.prototype.setDebug = function ( enabled ) {
		THREE.LoaderSupport.Commons.prototype.setDebug.call( this, enabled );
	};

	/**
	 * Use this convenient method to load an OBJ file at the given URL. Per default the fileLoader uses an arraybuffer
	 * @memberOf THREE.OBJLoader2
	 *
	 * @param {string} url URL of the file to load
	 * @param {callback} onLoad Called after loading was successfully completed
	 * @param {callback} onProgress Called to report progress of loading. The argument will be the XMLHttpRequest instance, which contains {integer total} and {integer loaded} bytes.
	 * @param {callback} onError Called after an error occurred during loading
	 * @param {callback} onMeshAlter Called after a new mesh raw data becomes available
	 * @param {boolean} useAsync Set this to use async loading
	 */
	OBJLoader2.prototype.load = function ( url, onLoad, onProgress, onError, onMeshAlter, useAsync ) {
		var scope = this;
		if ( ! Validator.isValid( onProgress ) ) {
			var refPercentComplete = 0;
			var percentComplete = 0;
			onProgress = function ( event ) {
				if ( ! event.lengthComputable ) return;

				percentComplete = Math.round( event.loaded / event.total * 100 );
				if ( percentComplete > refPercentComplete ) {

					refPercentComplete = percentComplete;
					var output = 'Download of "' + url + '": ' + percentComplete + '%';
					console.log( output );
					scope.onProgress( output );

				}
			};
		}

		if ( ! Validator.isValid( onError ) ) {
			onError = function ( event ) {
				var output = 'Error occurred while downloading "' + url + '"';
				console.error( output + ': ' + event );
				scope.onProgress( output );
			};
		}

		this.fileLoader.setPath( this.path );
		this.fileLoader.setResponseType( 'arraybuffer' );
		this.fileLoader.load( url, function ( content ) {
			if ( useAsync ) {

				scope.parseAsync( content, onLoad );

			} else {

				scope._setCallbacks( null, onMeshAlter, null );
				onLoad( scope.parse( content ), scope.modelName, scope.instanceNo );

			}

		}, onProgress, onError );

	};

    /**
	 * Run the loader according the provided instructions.
	 * @memberOf THREE.OBJLoader2
	 *
	 * @param {THREE.LoaderSupport.PrepData} prepData All parameters and resources required for execution
	 * @param {THREE.LoaderSupport.WorkerSupport} [workerSupportExternal] Use pre-existing WorkerSupport
	 */
	OBJLoader2.prototype.run = function ( prepData, workerSupportExternal ) {
		this._applyPrepData( prepData );
		var available = this._checkFiles( prepData.resources );
		if ( Validator.isValid( workerSupportExternal ) ) {

			this.terminateWorkerOnLoad = false;
			this.workerSupport = workerSupportExternal;

		} else {

			this.terminateWorkerOnLoad = true;

		}
		var scope = this;
		var onMaterialsLoaded = function ( materials ) {
			scope.builder.setMaterials( materials );

			if ( Validator.isValid( available.obj.content ) ) {

				if ( prepData.useAsync ) {

					scope.parseAsync( available.obj.content, scope.callbacks.onLoad );

				} else {

					scope.parse( available.obj.content );

				}
			} else {

				scope.setPath( available.obj.path );
				scope.load( available.obj.name, scope.callbacks.onLoad, null, null, scope.callbacks.onMeshAlter, prepData.useAsync );

			}
		};

		this._loadMtl( available.mtl, onMaterialsLoaded, prepData.crossOrigin );
	};

	OBJLoader2.prototype._applyPrepData = function ( prepData ) {
		THREE.LoaderSupport.Commons.prototype._applyPrepData.call( this, prepData );

		if ( Validator.isValid( prepData ) ) {

			this.setMaterialPerSmoothingGroup( prepData.materialPerSmoothingGroup );

		}
	};

	/**
	 * Parses OBJ content synchronously.
	 * @memberOf THREE.OBJLoader2
	 *
	 * @param content
	 */
	OBJLoader2.prototype.parse = function ( content ) {
		console.time( 'OBJLoader2 parse: ' + this.modelName );

		var parser = new Parser();
		parser.setMaterialPerSmoothingGroup( this.materialPerSmoothingGroup );
		parser.setUseIndices( this.useIndices );
		parser.setDisregardNormals( this.disregardNormals );
		parser.setMaterialNames( this.builder.materialNames );
		parser.setDebug( this.debug );

		var scope = this;
		var onMeshLoaded = function ( payload ) {
			var meshes = scope.builder.buildMeshes( payload );
			var mesh;
			for ( var i in meshes ) {
				mesh = meshes[ i ];
				scope.loaderRootNode.add( mesh );
			}
		};
		parser.setCallbackBuilder( onMeshLoaded );
		var onProgressScoped = function ( message ) {
			scope.onProgress( message );
		};
		parser.setCallbackProgress( onProgressScoped );

		if ( content instanceof ArrayBuffer || content instanceof Uint8Array ) {

			console.log( 'Parsing arrayBuffer...' );
			parser.parse( content );

		} else if ( typeof( content ) === 'string' || content instanceof String ) {

			console.log( 'Parsing text...' );
			parser.parseText( content );

		} else {

			throw 'Provided content was neither of type String nor Uint8Array! Aborting...';

		}
		console.timeEnd( 'OBJLoader2 parse: ' + this.modelName );

		return this.loaderRootNode;
	};

    /**
     * Parses OBJ content asynchronously.
	 * @memberOf THREE.OBJLoader2
	 *
     * @param {arraybuffer} content
     * @param {callback} onLoad
     */
	OBJLoader2.prototype.parseAsync = function ( content, onLoad ) {
		console.time( 'OBJLoader2 parseAsync: ' + this.modelName);

		var scope = this;
		var scopedOnLoad = function ( message ) {
			onLoad( scope.loaderRootNode, scope.modelName, scope.instanceNo, message );
			if ( scope.terminateWorkerOnLoad ) scope.workerSupport.terminateWorker();
			console.timeEnd( 'OBJLoader2 parseAsync: ' + scope.modelName );
		};
		var scopedOnMeshLoaded = function ( payload ) {
			var meshes = scope.builder.buildMeshes( payload );
			var mesh;
			for ( var i in meshes ) {
				mesh = meshes[ i ];
				scope.loaderRootNode.add( mesh );
			}
		};

		this.workerSupport = Validator.verifyInput( this.workerSupport, new THREE.LoaderSupport.WorkerSupport() );
		var buildCode = function ( funcBuildObject, funcBuildSingelton ) {
			var workerCode = '';
			workerCode += '/**\n';
			workerCode += '  * This code was constructed by OBJLoader2 buildWorkerCode.\n';
			workerCode += '  */\n\n';
			workerCode += funcBuildSingelton( 'Commons', 'Commons', Commons );
			workerCode += funcBuildObject( 'Consts', Consts );
			workerCode += funcBuildObject( 'Validator', Validator );
			workerCode += funcBuildSingelton( 'Parser', 'Parser', Parser );
			workerCode += funcBuildSingelton( 'RawObject', 'RawObject', RawObject );
			workerCode += funcBuildSingelton( 'RawObjectDescription', 'RawObjectDescription', RawObjectDescription );

			return workerCode;
		};
		this.workerSupport.validate( buildCode, false );
        this.workerSupport.setCallbacks( scopedOnMeshLoaded, scopedOnLoad );
        this.workerSupport.run(
            {
                cmd: 'run',
                params: {
                    debug: this.debug,
                    materialPerSmoothingGroup: this.materialPerSmoothingGroup,
					useIndices: this.useIndices,
					disregardNormals: this.disregardNormals
                },
                materials: {
                    materialNames: this.builder.materialNames
                },
                buffers: {
                    input: content
                }
            },
            [ content.buffer ]
        );
        };

	/**
	 * Constants used by THREE.OBJLoader2
	 */
	var Consts = {
		CODE_LF: 10,
		CODE_CR: 13,
		CODE_SPACE: 32,
		CODE_SLASH: 47,
		STRING_LF: '\n',
		STRING_CR: '\r',
		STRING_SPACE: ' ',
		STRING_SLASH: '/',
		LINE_F: 'f',
		LINE_G: 'g',
		LINE_L: 'l',
		LINE_O: 'o',
		LINE_S: 's',
		LINE_V: 'v',
		LINE_VT: 'vt',
		LINE_VN: 'vn',
		LINE_MTLLIB: 'mtllib',
		LINE_USEMTL: 'usemtl'
	};

	/**
	 * Parse OBJ data either from ArrayBuffer or string
	 * @class
	 */
	var Parser = (function () {

		function Parser() {
			this.callbackProgress = null;
			this.callbackBuilder = null;

			this.materialNames = [];
			this.debug = false;
			this.rawObject = null;
			this.materialPerSmoothingGroup = false;
			this.useIndices = false;
			this.disregardNormals = false;

			this.inputObjectCount = 1;
			this.outputObjectCount = 1;
			this.counts = {
				vertices: 0,
				faces: 0,
				doubleIndicesCount: 0
			};
		};

		Parser.prototype.setDebug = function ( debug ) {
			if ( debug === true || debug === false ) this.debug = debug;
		};

		Parser.prototype.configure = function () {
			this.rawObject = new RawObject( this.materialPerSmoothingGroup, this.useIndices, this.disregardNormals );

			var matNames = ( this.materialNames.length > 0 ) ? '\n\tmaterialNames:\n\t\t- ' + this.materialNames.join( '\n\t\t- ' ) : '\n\tmaterialNames: None';
			var printConfig = 'OBJLoader2.Parser configuration:'
				+ '\n\tdebug: ' + this.debug
				+ matNames
				+ '\n\tmaterialPerSmoothingGroup: ' + this.materialPerSmoothingGroup
				+ '\n\tuseIndices: ' + this.useIndices
				+ '\n\tdisregardNormals: ' +this.disregardNormals;
			console.log( printConfig );
		};

		Parser.prototype.setMaterialPerSmoothingGroup = function ( materialPerSmoothingGroup ) {
			this.materialPerSmoothingGroup = materialPerSmoothingGroup;
		};

		Parser.prototype.setUseIndices = function ( useIndices ) {
			this.useIndices = useIndices;
		};

		Parser.prototype.setDisregardNormals = function ( disregardNormals ) {
			this.disregardNormals = disregardNormals;
		};

		Parser.prototype.setMaterialNames = function ( materialNames ) {
			this.materialNames = Validator.verifyInput( materialNames, this.materialNames );
			this.materialNames = Validator.verifyInput( this.materialNames, [] );
		};

		Parser.prototype.setCallbackBuilder = function ( callbackBuilder ) {
			this.callbackBuilder = callbackBuilder;
			if ( ! Validator.isValid( this.callbackBuilder ) ) throw 'Unable to run as no "builder" callback is set.';
		};

		Parser.prototype.setCallbackProgress = function ( callbackProgress ) {
			this.callbackProgress = callbackProgress;
		};

		/**
		 * Parse the provided arraybuffer
		 * @memberOf Parser
		 *
		 * @param {Uint8Array} arrayBuffer OBJ data as Uint8Array
		 */
		Parser.prototype.parse = function ( arrayBuffer ) {
			console.time( 'OBJLoader2.Parser.parse' );
			this.configure();

			var arrayBufferView = new Uint8Array( arrayBuffer );
			var length = arrayBufferView.byteLength;
			var buffer = new Array( 128 );
			var bufferPointer = 0;
			var slashesCount = 0;
			var reachedFaces = false;
			var code;
			var word = '';
			for ( var i = 0; i < length; i++ ) {

				code = arrayBufferView[ i ];
				switch ( code ) {
					case Consts.CODE_SPACE:
						if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
						word = '';
						break;

					case Consts.CODE_SLASH:
						slashesCount++;
						if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
						word = '';
						break;

					case Consts.CODE_LF:
						if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
						word = '';
						reachedFaces = this.processLine( buffer, bufferPointer, slashesCount, reachedFaces );
						bufferPointer = 0;
						slashesCount = 0;
						break;

					case Consts.CODE_CR:
						break;

					default:
						word += String.fromCharCode( code );
						break;
				}
			}
			this.finalize();
			console.timeEnd( 'OBJLoader2.Parser.parse' );
		};

		/**
		 * Parse the provided text
		 * @memberOf Parser
		 *
		 * @param {string} text OBJ data as string
		 */
		Parser.prototype.parseText = function ( text ) {
			console.time( 'OBJLoader2.Parser.parseText' );
			this.configure();

			var length = text.length;
			var buffer = new Array( 128 );
			var bufferPointer = 0;
			var slashesCount = 0;
			var reachedFaces = false;
			var char;
			var word = '';
			for ( var i = 0; i < length; i++ ) {

				char = text[ i ];
				switch ( char ) {
					case Consts.STRING_SPACE:
						if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
						word = '';
						break;

					case Consts.STRING_SLASH:
						slashesCount++;
						if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
						word = '';
						break;

					case Consts.STRING_LF:
						if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
						word = '';
						reachedFaces = this.processLine( buffer, bufferPointer, slashesCount, reachedFaces );
						bufferPointer = 0;
						slashesCount = 0;
						break;

					case Consts.STRING_CR:
						break;

					default:
						word += char;
				}
			}
			this.finalize();
			console.timeEnd( 'OBJLoader2.Parser.parseText' );
		};

		Parser.prototype.processLine = function ( buffer, bufferPointer, slashesCount, reachedFaces ) {
			if ( bufferPointer < 1 ) return reachedFaces;

			var bufferLength = bufferPointer - 1;
			var concatBuffer;
			switch ( buffer[ 0 ] ) {
				case Consts.LINE_V:

					// object complete instance required if reached faces already (= reached next block of v)
					if ( reachedFaces ) {

						if ( this.rawObject.colors.length > 0 && this.rawObject.colors.length !== this.rawObject.vertices.length ) {

							throw 'Vertex Colors were detected, but vertex count and color count do not match!';

						}
						this.processCompletedObject( null, this.rawObject.groupName );
						reachedFaces = false;

					}
					if ( bufferLength === 3 ) {

						this.rawObject.pushVertex( buffer )

					} else {

						this.rawObject.pushVertexAndVertextColors( buffer );

					}
					break;

				case Consts.LINE_VT:
					this.rawObject.pushUv( buffer );
					break;

				case Consts.LINE_VN:
					this.rawObject.pushNormal( buffer );
					break;

				case Consts.LINE_F:
					reachedFaces = true;
					this.rawObject.processFaces( buffer, bufferPointer, slashesCount );
					break;

				case Consts.LINE_L:
					if ( bufferLength === slashesCount * 2 ) {

						this.rawObject.buildLineVvt( buffer );

					} else {

						this.rawObject.buildLineV( buffer );

					}
					break;

				case Consts.LINE_S:
					this.rawObject.pushSmoothingGroup( buffer[ 1 ] );
					this.flushStringBuffer( buffer, bufferPointer );
					break;

				case Consts.LINE_G:
					concatBuffer = bufferLength > 1 ? buffer.slice( 1, bufferPointer ).join( ' ' ) : buffer[ 1 ];
					this.processCompletedGroup( concatBuffer );
					this.flushStringBuffer( buffer, bufferPointer );
					break;

				case Consts.LINE_O:
					concatBuffer = bufferLength > 1 ? buffer.slice( 1, bufferPointer ).join( ' ' ) : buffer[ 1 ];
					if ( this.rawObject.vertices.length > 0 ) {

						this.processCompletedObject( concatBuffer, null );
						reachedFaces = false;

					} else {

						this.rawObject.pushObject( concatBuffer );

					}
					this.flushStringBuffer( buffer, bufferPointer );
					break;

				case Consts.LINE_MTLLIB:
					concatBuffer = bufferLength > 1 ? buffer.slice( 1, bufferPointer ).join( ' ' ) : buffer[ 1 ];
					this.rawObject.pushMtllib( concatBuffer );
					this.flushStringBuffer( buffer, bufferPointer );
					break;

				case Consts.LINE_USEMTL:
					concatBuffer = bufferLength > 1 ? buffer.slice( 1, bufferPointer ).join( ' ' ) : buffer[ 1 ];
					this.rawObject.pushUsemtl( concatBuffer );
					this.flushStringBuffer( buffer, bufferPointer );
					break;

				default:
					break;
			}
			return reachedFaces;
		};

		Parser.prototype.flushStringBuffer = function ( buffer, bufferLength ) {
			for ( var i = 0; i < bufferLength; i++ ) {
				buffer[ i ] = '';
			}
		};

		Parser.prototype.processCompletedObject = function ( objectName, groupName ) {
			var result = this.rawObject.finalize( this.debug );
			if ( Validator.isValid( result ) ) {

				this.inputObjectCount++;
				if ( this.debug ) this.rawObject.createReport( this.inputObjectCount, true );
				var message = this.buildMesh( result, this.inputObjectCount );
				this.onProgress( message );

			}
			this.rawObject = this.rawObject.newInstanceFromObject( objectName, groupName );
		};

		Parser.prototype.processCompletedGroup = function ( groupName ) {
			var result = this.rawObject.finalize();
			if ( Validator.isValid( result ) ) {

				this.inputObjectCount++;
				if ( this.debug ) this.rawObject.createReport( this.inputObjectCount, true );
				var message = this.buildMesh( result, this.inputObjectCount );
				this.onProgress( message );
				this.rawObject = this.rawObject.newInstanceFromGroup( groupName );

			} else {

				// if a group was set that did not lead to object creation in finalize, then the group name has to be updated
				this.rawObject.pushGroup( groupName );

			}
		};

		Parser.prototype.finalize = function () {
			console.log( 'Global output object count: ' + this.outputObjectCount );
			var result = Validator.isValid( this.rawObject ) ? this.rawObject.finalize() : null;
			if ( Validator.isValid( result ) ) {

				this.inputObjectCount++;
				if ( this.debug ) this.rawObject.createReport( this.inputObjectCount, true );
				var message = this.buildMesh( result, this.inputObjectCount );

				console.log(
					'Overall counts: '  +
					'\n\tVertices: ' + this.counts.vertices,
					'\n\tFaces: ' + this.counts.faces,
					'\n\tMultiple definitions: ' + this.counts.doubleIndicesCount
				);
				this.onProgress( message );

			}
		};

		Parser.prototype.onProgress = function ( text ) {
			if ( Validator.isValid( text ) && Validator.isValid( this.callbackProgress) ) this.callbackProgress( text );
		};

		/**
		 * RawObjectDescriptions are transformed to too intermediate format that is forwarded to the Builder.
		 * It is ensured that rawObjectDescriptions only contain objects with vertices (no need to check).
		 *
		 * @param result
		 */
		Parser.prototype.buildMesh = function ( result ) {
			var rawObjectDescriptions = result.rawObjectDescriptions;

			var vertexFA = new Float32Array( result.absoluteVertexCount );
			this.counts.vertices += result.absoluteVertexCount / 3;
			this.counts.faces += result.faceCount;
			this.counts.doubleIndicesCount += result.doubleIndicesCount;
			var indexUA = ( result.absoluteIndexCount > 0 ) ? new Uint32Array( result.absoluteIndexCount ) : null;
			var colorFA = ( result.absoluteColorCount > 0 ) ? new Float32Array( result.absoluteColorCount ) : null;
			var normalFA = ( result.absoluteNormalCount > 0 ) ? new Float32Array( result.absoluteNormalCount ) : null;
			var uvFA = ( result.absoluteUvCount > 0 ) ? new Float32Array( result.absoluteUvCount ) : null;

			var rawObjectDescription;
			var materialDescription;
			var materialDescriptions = [];

			var createMultiMaterial = ( rawObjectDescriptions.length > 1 );
			var materialIndex = 0;
			var materialIndexMapping = [];
			var selectedMaterialIndex;
			var materialGroup;
			var materialGroups = [];

			var vertexFAOffset = 0;
			var indexUAOffset = 0;
			var colorFAOffset = 0;
			var normalFAOffset = 0;
			var uvFAOffset = 0;
			var materialGroupOffset = 0;
			var materialGroupLength = 0;

			for ( var oodIndex in rawObjectDescriptions ) {
				if ( ! rawObjectDescriptions.hasOwnProperty( oodIndex ) ) continue;
				rawObjectDescription = rawObjectDescriptions[ oodIndex ];

				materialDescription = {
					name: rawObjectDescription.materialName,
					flat: false,
					default: false
				};
				if ( this.materialNames[ materialDescription.name ] === null ) {

					materialDescription.default = true;
					console.warn( 'object_group "' + rawObjectDescription.objectName + '_' + rawObjectDescription.groupName + '" was defined without material! Assigning "defaultMaterial".' );

				}
				// Attach '_flat' to materialName in case flat shading is needed due to smoothingGroup 0
				if ( rawObjectDescription.smoothingGroup === 0 ) materialDescription.flat = true;

				if ( createMultiMaterial ) {

					// re-use material if already used before. Reduces materials array size and eliminates duplicates

					selectedMaterialIndex = materialIndexMapping[ materialDescription.name ];
					if ( ! selectedMaterialIndex ) {

						selectedMaterialIndex = materialIndex;
						materialIndexMapping[ materialDescription.name ] = materialIndex;
						materialDescriptions.push( materialDescription );
						materialIndex++;

					}
					materialGroupLength = this.useIndices ? rawObjectDescription.indices.length : rawObjectDescription.vertices.length / 3;
					materialGroup = {
						start: materialGroupOffset,
						count: materialGroupLength,
						index: selectedMaterialIndex
					};
					materialGroups.push( materialGroup );
					materialGroupOffset += materialGroupLength;

				} else {

					materialDescriptions.push( materialDescription );

				}

				vertexFA.set( rawObjectDescription.vertices, vertexFAOffset );
				vertexFAOffset += rawObjectDescription.vertices.length;

				if ( indexUA ) {

					indexUA.set( rawObjectDescription.indices, indexUAOffset );
					indexUAOffset += rawObjectDescription.indices.length;

				}

				if ( colorFA ) {

					colorFA.set( rawObjectDescription.colors, colorFAOffset );
					colorFAOffset += rawObjectDescription.colors.length;

				}

				if ( normalFA ) {

					normalFA.set( rawObjectDescription.normals, normalFAOffset );
					normalFAOffset += rawObjectDescription.normals.length;

				}
				if ( uvFA ) {

					uvFA.set( rawObjectDescription.uvs, uvFAOffset );
					uvFAOffset += rawObjectDescription.uvs.length;

				}
				if ( this.debug ) this.printReport( rawObjectDescription, selectedMaterialIndex );

			}

			this.outputObjectCount++;
			this.callbackBuilder(
				{
					cmd: 'meshData',
					params: {
						meshName: rawObjectDescription.groupName !== '' ? rawObjectDescription.groupName : rawObjectDescription.objectName
					},
					materials: {
						multiMaterial: createMultiMaterial,
						materialDescriptions: materialDescriptions,
						materialGroups: materialGroups
					},
					buffers: {
						vertices: vertexFA,
						indices: indexUA,
						colors: colorFA,
						normals: normalFA,
						uvs: uvFA
					}
				},
				[ vertexFA.buffer ],
				Validator.isValid( indexUA ) ? [ indexUA.buffer ] : null,
				Validator.isValid( colorFA ) ? [ colorFA.buffer ] : null,
				Validator.isValid( normalFA ) ? [ normalFA.buffer ] : null,
				Validator.isValid( uvFA ) ? [ uvFA.buffer ] : null
			);
		};

		Parser.prototype.printReport = function ( rawObjectDescription, selectedMaterialIndex ) {
			var materialIndexLine = Validator.isValid( selectedMaterialIndex ) ? '\n\tmaterialIndex: ' + selectedMaterialIndex : '';
			console.log(
				'\tOutput Object no.: ' + this.outputObjectCount +
				'\n\tobjectName: ' + rawObjectDescription.objectName +
				'\n\tgroupName: ' + rawObjectDescription.groupName +
				'\n\tmaterialName: ' + rawObjectDescription.materialName +
				materialIndexLine +
				'\n\tsmoothingGroup: ' + rawObjectDescription.smoothingGroup +
				'\n\t#vertices: ' + rawObjectDescription.vertices.length / 3 +
				'\n\t#indices: ' + rawObjectDescription.indices.length +
				'\n\t#colors: ' + rawObjectDescription.colors.length / 3 +
				'\n\t#uvs: ' + rawObjectDescription.uvs.length / 2 +
				'\n\t#normals: ' + rawObjectDescription.normals.length / 3
			);
		};

		return Parser;
	})();

	/**
	 * {@link RawObject} is only used by {@link Parser}.
	 * The user of OBJLoader2 does not need to care about this class.
	 * It is defined publicly for inclusion in web worker based OBJ loader ({@link THREE.OBJLoader2.WWOBJLoader2})
	 */
	var RawObject = (function () {

		function RawObject( materialPerSmoothingGroup, useIndices, disregardNormals, objectName, groupName, activeMtlName ) {
			this.globalVertexOffset = 1;
			this.globalUvOffset = 1;
			this.globalNormalOffset = 1;

			this.vertices = [];
			this.colors = [];
			this.normals = [];
			this.uvs = [];

			// faces are stored according combined index of group, material and smoothingGroup (0 or not)
			this.activeMtlName = Validator.verifyInput( activeMtlName, '' );
			this.objectName = Validator.verifyInput( objectName, '' );
			this.groupName = Validator.verifyInput( groupName, '' );
			this.mtllibName = '';
			this.smoothingGroup = {
				splitMaterials: materialPerSmoothingGroup === true,
				normalized: -1,
				real: -1
			};
			this.useIndices = useIndices === true;
			this.disregardNormals = disregardNormals === true;

			this.mtlCount = 0;
			this.smoothingGroupCount = 0;

			this.rawObjectDescriptions = [];
			// this default index is required as it is possible to define faces without 'g' or 'usemtl'
			this.pushSmoothingGroup( 1 );

			this.doubleIndicesCount = 0;
			this.faceCount = 0;
		}

		RawObject.prototype.newInstanceFromObject = function ( objectName, groupName ) {
			var newRawObject = new RawObject( this.smoothingGroup.splitMaterials, this.useIndices, this.disregardNormals, objectName, groupName, this.activeMtlName );

			// move indices forward
			newRawObject.globalVertexOffset = this.globalVertexOffset + this.vertices.length / 3;
			newRawObject.globalUvOffset = this.globalUvOffset + this.uvs.length / 2;
			newRawObject.globalNormalOffset = this.globalNormalOffset + this.normals.length / 3;

			return newRawObject;
		};

		RawObject.prototype.newInstanceFromGroup = function ( groupName ) {
			var newRawObject = new RawObject( this.smoothingGroup.splitMaterials, this.useIndices, this.disregardNormals, this.objectName, groupName, this.activeMtlName );

			// keep current buffers and indices forward
			newRawObject.vertices = this.vertices;
			newRawObject.colors = this.colors;
			newRawObject.uvs = this.uvs;
			newRawObject.normals = this.normals;
			newRawObject.globalVertexOffset = this.globalVertexOffset;
			newRawObject.globalUvOffset = this.globalUvOffset;
			newRawObject.globalNormalOffset = this.globalNormalOffset;

			return newRawObject;
		};

		RawObject.prototype.pushVertex = function ( buffer ) {
			this.vertices.push( parseFloat( buffer[ 1 ] ) );
			this.vertices.push( parseFloat( buffer[ 2 ] ) );
			this.vertices.push( parseFloat( buffer[ 3 ] ) );
		};

		RawObject.prototype.pushVertexAndVertextColors = function ( buffer ) {
			this.vertices.push( parseFloat( buffer[ 1 ] ) );
			this.vertices.push( parseFloat( buffer[ 2 ] ) );
			this.vertices.push( parseFloat( buffer[ 3 ] ) );
			this.colors.push( parseFloat( buffer[ 4 ] ) );
			this.colors.push( parseFloat( buffer[ 5 ] ) );
			this.colors.push( parseFloat( buffer[ 6 ] ) );
		};

		RawObject.prototype.pushUv = function ( buffer ) {
			this.uvs.push( parseFloat( buffer[ 1 ] ) );
			this.uvs.push( parseFloat( buffer[ 2 ] ) );
		};

		RawObject.prototype.pushNormal = function ( buffer ) {
			this.normals.push( parseFloat( buffer[ 1 ] ) );
			this.normals.push( parseFloat( buffer[ 2 ] ) );
			this.normals.push( parseFloat( buffer[ 3 ] ) );
		};

		RawObject.prototype.pushObject = function ( objectName ) {
			this.objectName = objectName;
		};

		RawObject.prototype.pushMtllib = function ( mtllibName ) {
			this.mtllibName = mtllibName;
		};

		RawObject.prototype.pushGroup = function ( groupName ) {
			this.groupName = groupName;
		};

		RawObject.prototype.pushUsemtl = function ( mtlName ) {
			if ( this.activeMtlName === mtlName || ! Validator.isValid( mtlName ) ) return;
			this.activeMtlName = mtlName;
			this.mtlCount++;

			this.verifyIndex();
		};

		RawObject.prototype.pushSmoothingGroup = function ( smoothingGroup ) {
			var smoothingGroupInt = parseInt( smoothingGroup );
			if ( isNaN( smoothingGroupInt ) ) {
				smoothingGroupInt = smoothingGroup === "off" ? 0 : 1;
			}

			var smoothCheck = this.smoothingGroup.normalized;
			this.smoothingGroup.normalized = this.smoothingGroup.splitMaterials ? smoothingGroupInt : ( smoothingGroupInt === 0 ) ? 0 : 1;
			this.smoothingGroup.real = smoothingGroupInt;

			if ( smoothCheck !== smoothingGroupInt ) {

				this.smoothingGroupCount++;
				this.verifyIndex();

			}
		};

		RawObject.prototype.verifyIndex = function () {
			var index = this.activeMtlName + '|' + this.smoothingGroup.normalized;
			this.rawObjectDescriptionInUse = this.rawObjectDescriptions[ index ];
			if ( ! Validator.isValid( this.rawObjectDescriptionInUse ) ) {

				this.rawObjectDescriptionInUse = new RawObjectDescription( this.objectName, this.groupName, this.activeMtlName, this.smoothingGroup.normalized );
				this.rawObjectDescriptions[ index ] = this.rawObjectDescriptionInUse;

			}
		};

		RawObject.prototype.processFaces = function ( buffer, bufferPointer, slashesCount ) {
			var bufferLength = bufferPointer - 1;
			var i, length;

			// "f vertex ..."
			if ( slashesCount === 0 ) {

				for ( i = 2, length = bufferLength - 1; i < length; i ++ ) {

					this.buildFace( buffer[ 1     ] );
					this.buildFace( buffer[ i     ] );
					this.buildFace( buffer[ i + 1 ] );

				}

			// "f vertex/uv ..."
			} else if  ( bufferLength === slashesCount * 2 ) {

				for ( i = 3, length = bufferLength - 2; i < length; i += 2 ) {

					this.buildFace( buffer[ 1     ], buffer[ 2     ] );
					this.buildFace( buffer[ i     ], buffer[ i + 1 ] );
					this.buildFace( buffer[ i + 2 ], buffer[ i + 3 ] );

				}

			// "f vertex/uv/normal ..."
			} else if  ( bufferLength * 2 === slashesCount * 3 ) {

				for ( i = 4, length = bufferLength - 3; i < length; i += 3 ) {

					this.buildFace( buffer[ 1     ], buffer[ 2     ], buffer[ 3     ] );
					this.buildFace( buffer[ i     ], buffer[ i + 1 ], buffer[ i + 2 ] );
					this.buildFace( buffer[ i + 3 ], buffer[ i + 4 ], buffer[ i + 5 ] );

				}

			// "f vertex//normal ..."
			} else {

				for ( i = 3, length = bufferLength - 2; i < length; i += 2 ) {

					this.buildFace( buffer[ 1     ], undefined, buffer[ 2     ] );
					this.buildFace( buffer[ i     ], undefined, buffer[ i + 1 ] );
					this.buildFace( buffer[ i + 2 ], undefined, buffer[ i + 3 ] );

				}

			}
		};

		RawObject.prototype.buildFace = function ( faceIndexV, faceIndexU, faceIndexN ) {
			var rodiu = this.rawObjectDescriptionInUse;
			if ( this.disregardNormals ) faceIndexN = undefined;
			var scope = this;
			var updateRawObjectDescriptionInUse = function () {

				var indexPointerV = ( parseInt( faceIndexV ) - scope.globalVertexOffset ) * 3;
				var indexPointerC = scope.colors.length > 0 ? indexPointerV : undefined;

				var vertices = rodiu.vertices;
				vertices.push( scope.vertices[ indexPointerV++ ] );
				vertices.push( scope.vertices[ indexPointerV++ ] );
				vertices.push( scope.vertices[ indexPointerV ] );

				if ( indexPointerC ) {

					var colors = rodiu.colors;
					colors.push( scope.colors[ indexPointerC++ ] );
					colors.push( scope.colors[ indexPointerC++ ] );
					colors.push( scope.colors[ indexPointerC ] );

				}

				if ( faceIndexU ) {

					var indexPointerU = ( parseInt( faceIndexU ) - scope.globalUvOffset ) * 2;
					var uvs = rodiu.uvs;
					uvs.push( scope.uvs[ indexPointerU++ ] );
					uvs.push( scope.uvs[ indexPointerU ] );

				}
				if ( faceIndexN ) {

					var indexPointerN = ( parseInt( faceIndexN ) - scope.globalNormalOffset ) * 3;
					var normals = rodiu.normals;
					normals.push( scope.normals[ indexPointerN++ ] );
					normals.push( scope.normals[ indexPointerN++ ] );
					normals.push( scope.normals[ indexPointerN ] );

				}
			};

			if ( this.useIndices ) {

				var mappingName = faceIndexV + ( faceIndexU ? '_' + faceIndexU : '_n' ) + ( faceIndexN ? '_' + faceIndexN : '_n' );
				var indicesPointer = rodiu.indexMappings[ mappingName ];
				if ( Validator.isValid( indicesPointer ) ) {

					this.doubleIndicesCount++;

				} else {

					indicesPointer = rodiu.vertices.length / 3;
					updateRawObjectDescriptionInUse();
					rodiu.indexMappings[ mappingName ] = indicesPointer;
					rodiu.indexMappingsCount++;

				}
				rodiu.indices.push( indicesPointer );

			} else {

				updateRawObjectDescriptionInUse();

			}
			this.faceCount++;
		};

		/*
		 * Support for lines with or without texture. First element in indexArray is the line identification
		 * 0: "f vertex/uv		vertex/uv 		..."
		 * 1: "f vertex			vertex 			..."
		 */
		RawObject.prototype.buildLineVvt = function ( lineArray ) {
			for ( var i = 1, length = lineArray.length; i < length; i ++ ) {

				this.vertices.push( parseInt( lineArray[ i ] ) );
				this.uvs.push( parseInt( lineArray[ i ] ) );

			}
		};

		RawObject.prototype.buildLineV = function ( lineArray ) {
			for ( var i = 1, length = lineArray.length; i < length; i++ ) {

				this.vertices.push( parseInt( lineArray[ i ] ) );

			}
		};

		/**
		 * Clear any empty rawObjectDescription and calculate absolute vertex, normal and uv counts
		 */
		RawObject.prototype.finalize = function () {
			var rawObjectDescriptionsTemp = [];
			var rawObjectDescription;
			var absoluteVertexCount = 0;
			var absoluteIndexMappingsCount = 0;
			var absoluteIndexCount = 0;
			var absoluteColorCount = 0;
			var absoluteNormalCount = 0;
			var absoluteUvCount = 0;
			var indices;
			for ( var name in this.rawObjectDescriptions ) {

				rawObjectDescription = this.rawObjectDescriptions[ name ];
				if ( rawObjectDescription.vertices.length > 0 ) {

					indices = rawObjectDescription.indices;
					if ( indices.length > 0 && absoluteIndexMappingsCount > 0 ) {

						for ( var i in indices ) indices[ i ] = indices[ i ] + absoluteIndexMappingsCount;

					}
					rawObjectDescriptionsTemp.push( rawObjectDescription );
					absoluteVertexCount += rawObjectDescription.vertices.length;
					absoluteIndexMappingsCount += rawObjectDescription.indexMappingsCount;
					absoluteIndexCount += rawObjectDescription.indices.length;
					absoluteColorCount += rawObjectDescription.colors.length;
					absoluteUvCount += rawObjectDescription.uvs.length;
					absoluteNormalCount += rawObjectDescription.normals.length;

				}
			}

			// do not continue if no result
			var result = null;
			if ( rawObjectDescriptionsTemp.length > 0 ) {

				result = {
					rawObjectDescriptions: rawObjectDescriptionsTemp,
					absoluteVertexCount: absoluteVertexCount,
					absoluteIndexCount: absoluteIndexCount,
					absoluteColorCount: absoluteColorCount,
					absoluteNormalCount: absoluteNormalCount,
					absoluteUvCount: absoluteUvCount,
					faceCount: this.faceCount,
					doubleIndicesCount: this.doubleIndicesCount
				};

			}
			return result;
		};

		RawObject.prototype.createReport = function ( inputObjectCount, printDirectly ) {
			var report = {
				name: this.objectName ? this.objectName : 'groups',
				mtllibName: this.mtllibName,
				vertexCount: this.vertices.length / 3,
				normalCount: this.normals.length / 3,
				uvCount: this.uvs.length / 2,
				smoothingGroupCount: this.smoothingGroupCount,
				mtlCount: this.mtlCount,
				rawObjectDescriptions: this.rawObjectDescriptions.length
			};

			if ( printDirectly ) {
				console.log( 'Input Object number: ' + inputObjectCount + ' Object name: ' + report.name +
					'\n Mtllib name: ' + report.mtllibName +
					'\n Vertex count: ' + report.vertexCount +
					'\n Normal count: ' + report.normalCount +
					'\n UV count: ' + report.uvCount +
					'\n SmoothingGroup count: ' + report.smoothingGroupCount +
					'\n Material count: ' + report.mtlCount +
					'\n Real RawObjectDescription count: ' + report.rawObjectDescriptions
				);
			}

			return report;
		};

		return RawObject;
	})();

	/**
	 * Descriptive information and data (vertices, normals, uvs) to passed on to mesh building function.
	 * @class
	 *
	 * @param {string} objectName Name of the mesh
	 * @param {string} groupName Name of the group
	 * @param {string} materialName Name of the material
	 * @param {number} smoothingGroup Normalized smoothingGroup (0: flat shading, 1: smooth shading)
	 */
	var RawObjectDescription = (function () {

		function RawObjectDescription( objectName, groupName, materialName, smoothingGroup ) {
			this.objectName = objectName;
			this.groupName = groupName;
			this.materialName = materialName;
			this.smoothingGroup = smoothingGroup;
			this.vertices = [];
			this.indexMappingsCount = 0;
			this.indexMappings = [];
			this.indices = [];
			this.colors = [];
			this.uvs = [];
			this.normals = [];
		}

		return RawObjectDescription;
	})();

	OBJLoader2.prototype._checkFiles = function ( resources ) {
		var resource;
		var result = {
			mtl: null,
			obj: null
		};
		for ( var index in resources ) {

			resource = resources[ index ];
			if ( ! Validator.isValid( resource.name ) ) continue;
			if ( Validator.isValid( resource.content ) ) {

				if ( resource.extension === 'OBJ' ) {

					// fast-fail on bad type
					if ( ! ( resource.content instanceof Uint8Array ) ) throw 'Provided content is not of type arraybuffer! Aborting...';
					result.obj = resource;

				} else if ( resource.extension === 'MTL' && Validator.isValid( resource.name ) ) {

					if ( ! ( typeof( resource.content ) === 'string' || resource.content instanceof String ) ) throw 'Provided  content is not of type String! Aborting...';
					result.mtl = resource;

				} else if ( resource.extension === "ZIP" ) {
					// ignore

				} else {

					throw 'Unidentified resource "' + resource.name + '": ' + resource.url;

				}

			} else {

				// fast-fail on bad type
				if ( ! ( typeof( resource.name ) === 'string' || resource.name instanceof String ) ) throw 'Provided file is not properly defined! Aborting...';
				if ( resource.extension === 'OBJ' ) {

					result.obj = resource;

				} else if ( resource.extension === 'MTL' ) {

					result.mtl = resource;

				} else if ( resource.extension === "ZIP" ) {
					// ignore

				} else {

					throw 'Unidentified resource "' + resource.name + '": ' + resource.url;

				}
			}
		}

		return result;
	};

	/**
	 * Utility method for loading an mtl file according resource description.
	 * @memberOf THREE.OBJLoader2
	 *
	 * @param {string} url URL to the file
	 * @param {string} name The name of the object
	 * @param {Object} content The file content as arraybuffer or text
	 * @param {function} callbackOnLoad
	 * @param {string} [crossOrigin] CORS value
	 */
	OBJLoader2.prototype.loadMtl = function ( url, name, content, callbackOnLoad, crossOrigin ) {
		var resource = new THREE.LoaderSupport.ResourceDescriptor( url, 'MTL' );
		resource.setContent( content );
		this._loadMtl( resource, callbackOnLoad, crossOrigin );
	};

	/**
	 * Utility method for loading an mtl file according resource description.
	 * @memberOf THREE.OBJLoader2
	 *
	 * @param {THREE.LoaderSupport.ResourceDescriptor} resource
	 * @param {function} callbackOnLoad
	 * @param {string} [crossOrigin] CORS value
	 */
	OBJLoader2.prototype._loadMtl = function ( resource, callbackOnLoad, crossOrigin ) {
		if ( Validator.isValid( resource ) ) console.time( 'Loading MTL: ' + resource.name );

		var materials = [];
		var processMaterials = function ( materialCreator ) {
			var materialCreatorMaterials = [];
			if ( Validator.isValid( materialCreator ) ) {

				materialCreator.preload();
				materialCreatorMaterials = materialCreator.materials;
				for ( var materialName in materialCreatorMaterials ) {

					if ( materialCreatorMaterials.hasOwnProperty( materialName ) ) {

						materials[ materialName ] = materialCreatorMaterials[ materialName ];

					}
				}
			}

			if ( Validator.isValid( resource ) ) console.timeEnd( 'Loading MTL: ' + resource.name );
			callbackOnLoad( materials );
		};

		var mtlLoader = new THREE.MTLLoader();
		crossOrigin = Validator.verifyInput( crossOrigin, 'anonymous' );
		mtlLoader.setCrossOrigin( crossOrigin );

		// fast-fail
		if ( ! Validator.isValid( resource ) || ( ! Validator.isValid( resource.content ) && ! Validator.isValid( resource.url ) ) ) {

			processMaterials();

		} else {

			mtlLoader.setPath( resource.path );
			if ( Validator.isValid( resource.content ) ) {

				processMaterials( Validator.isValid( resource.content ) ? mtlLoader.parse( resource.content ) : null );

			} else if ( Validator.isValid( resource.url ) ) {

				var onError = function ( event ) {
					var output = 'Error occurred while downloading "' + resource.url + '"';
					console.error( output + ': ' + event );
					throw output;
				};

				mtlLoader.load( resource.name, processMaterials, undefined, onError );

			}
		}
	};

	return OBJLoader2;
})();
