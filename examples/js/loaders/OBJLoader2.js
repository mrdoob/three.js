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

	var OBJLOADER2_VERSION = '2.0.1';
	var Commons = THREE.LoaderSupport.Commons;
	var Validator = THREE.LoaderSupport.Validator;
	var ConsoleLogger = THREE.LoaderSupport.ConsoleLogger;

	OBJLoader2.prototype = Object.create( THREE.LoaderSupport.Commons.prototype );
	OBJLoader2.prototype.constructor = OBJLoader2;

	function OBJLoader2( logger, manager ) {
		THREE.LoaderSupport.Commons.call( this, logger, manager );
		this.logger.logInfo( 'Using THREE.OBJLoader2 version: ' + OBJLOADER2_VERSION );

		this.materialPerSmoothingGroup = false;
		this.fileLoader = Validator.verifyInput( this.fileLoader, new THREE.FileLoader( this.manager ) );

		this.workerSupport = null;
		this.terminateWorkerOnLoad = true;
	};

	/**
	 * Tells whether a material shall be created per smoothing group.
	 * @memberOf THREE.OBJLoader2
	 *
	 * @param {boolean} materialPerSmoothingGroup=false
	 */
	OBJLoader2.prototype.setMaterialPerSmoothingGroup = function ( materialPerSmoothingGroup ) {
		this.materialPerSmoothingGroup = materialPerSmoothingGroup === true;
	};

	/**
	 * Use this convenient method to load an OBJ file at the given URL. Per default the fileLoader uses an arraybuffer.
	 * @memberOf THREE.OBJLoader2
	 *
	 * @param {string} url URL of the file to load
	 * @param {callback} onLoad Called after loading was successfully completed
	 * @param {callback} onProgress Called to report progress of loading. The argument will be the XMLHttpRequest instance, which contains {integer total} and {integer loaded} bytes.
	 * @param {callback} onError Called after an error occurred during loading
	 * @param {callback} onMeshAlter Called after a new mesh raw data becomes available to allow alteration
	 * @param {boolean} useAsync If true uses async loading with worker, if false loads data synchronously
	 */
	OBJLoader2.prototype.load = function ( url, onLoad, onProgress, onError, onMeshAlter, useAsync ) {
		var scope = this;
		if ( ! Validator.isValid( onProgress ) ) {
			var numericalValueRef = 0;
			var numericalValue = 0;
			onProgress = function ( event ) {
				if ( ! event.lengthComputable ) return;

				numericalValue = event.loaded / event.total;
				if ( numericalValue > numericalValueRef ) {

					numericalValueRef = numericalValue;
					var output = 'Download of "' + url + '": ' + ( numericalValue * 100 ).toFixed( 2 ) + '%';
					scope.onProgress( 'progressLoad', output, numericalValue );

				}
			};
		}

		if ( ! Validator.isValid( onError ) ) {
			onError = function ( event ) {
				var output = 'Error occurred while downloading "' + url + '"';
				scope.logger.logError( output + ': ' + event );
				scope.onProgress( 'error', output, -1 );
			};
		}

		this.fileLoader.setPath( this.path );
		this.fileLoader.setResponseType( 'arraybuffer' );
		this.fileLoader.load( url, function ( content ) {
			if ( useAsync ) {

				scope.parseAsync( content, onLoad );

			} else {

				scope._setCallbacks( null, onMeshAlter, null );
				onLoad(
					{
						detail: {
							loaderRootNode: scope.parse( content ),
							modelName: scope.modelName,
							instanceNo: scope.instanceNo
						}
					}
				);

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
			this.logger = workerSupportExternal.logger;

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
	 * Parses OBJ data synchronously from arraybuffer or string.
	 * @memberOf THREE.OBJLoader2
	 *
	 * @param {arraybuffer|string} content OBJ data as Uint8Array or String
	 */
	OBJLoader2.prototype.parse = function ( content ) {
		this.logger.logTimeStart( 'OBJLoader2 parse: ' + this.modelName );

		var parser = new Parser( this.logger );
		parser.setMaterialPerSmoothingGroup( this.materialPerSmoothingGroup );
		parser.setUseIndices( this.useIndices );
		parser.setDisregardNormals( this.disregardNormals );
		parser.setMaterialNames( this.builder.materialNames );

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
		var onProgressScoped = function ( text, numericalValue ) {
			scope.onProgress( 'progressParse', text, numericalValue );
		};
		parser.setCallbackProgress( onProgressScoped );

		if ( content instanceof ArrayBuffer || content instanceof Uint8Array ) {

			this.logger.logInfo( 'Parsing arrayBuffer...' );
			parser.parse( content );

		} else if ( typeof( content ) === 'string' || content instanceof String ) {

			this.logger.logInfo( 'Parsing text...' );
			parser.parseText( content );

		} else {

			throw 'Provided content was neither of type String nor Uint8Array! Aborting...';

		}
		this.logger.logTimeEnd( 'OBJLoader2 parse: ' + this.modelName );

		return this.loaderRootNode;
	};

	/**
	 * Parses OBJ content asynchronously from arraybuffer.
	 * @memberOf THREE.OBJLoader2
	 *
	 * @param {arraybuffer} content OBJ data as Uint8Array
	 * @param {callback} onLoad Called after worker successfully completed loading
	 */
	OBJLoader2.prototype.parseAsync = function ( content, onLoad ) {
		this.logger.logTimeStart( 'OBJLoader2 parseAsync: ' + this.modelName );

		var scope = this;
		var scopedOnLoad = function () {
			onLoad(
				{
					detail: {
						loaderRootNode: scope.loaderRootNode,
						modelName: scope.modelName,
						instanceNo: scope.instanceNo
					}
				}
			);
			if ( scope.terminateWorkerOnLoad ) scope.workerSupport.terminateWorker();
			scope.logger.logTimeEnd( 'OBJLoader2 parseAsync: ' + scope.modelName );
		};
		var scopedOnMeshLoaded = function ( payload ) {
			var meshes = scope.builder.buildMeshes( payload );
			var mesh;
			for ( var i in meshes ) {
				mesh = meshes[ i ];
				scope.loaderRootNode.add( mesh );
			}
		};

		this.workerSupport = Validator.verifyInput( this.workerSupport, new THREE.LoaderSupport.WorkerSupport( this.logger ) );
		var buildCode = function ( funcBuildObject, funcBuildSingelton ) {
			var workerCode = '';
			workerCode += '/**\n';
			workerCode += '  * This code was constructed by OBJLoader2 buildWorkerCode.\n';
			workerCode += '  */\n\n';
			workerCode += funcBuildSingelton( 'Commons', 'Commons', Commons );
			workerCode += funcBuildObject( 'Consts', Consts );
			workerCode += funcBuildObject( 'Validator', Validator );
			workerCode += funcBuildSingelton( 'ConsoleLogger', 'ConsoleLogger', ConsoleLogger );
			workerCode += funcBuildSingelton( 'Parser', 'Parser', Parser );
			workerCode += funcBuildSingelton( 'RawMesh', 'RawMesh', RawMesh );
			workerCode += funcBuildSingelton( 'RawMeshSubGroup', 'RawMeshSubGroup', RawMeshSubGroup );

			return workerCode;
		};
		this.workerSupport.validate( buildCode, false );
		this.workerSupport.setCallbacks( scopedOnMeshLoaded, scopedOnLoad );
		this.workerSupport.run(
			{
				cmd: 'run',
				params: {
					materialPerSmoothingGroup: this.materialPerSmoothingGroup,
					useIndices: this.useIndices,
					disregardNormals: this.disregardNormals
				},
				logger: {
					debug: this.logger.debug,
					enabled: this.logger.enabled
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

		function Parser( logger ) {
			this.callbackProgress = null;
			this.callbackBuilder = null;

			this.materialNames = [];
			this.rawMesh = null;
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
			this.logger = logger;
			this.totalBytes = 0;
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

		Parser.prototype.configure = function () {
			this.rawMesh = new RawMesh( this.materialPerSmoothingGroup, this.useIndices, this.disregardNormals );

			if ( this.logger.isEnabled() ) {

				var matNames = ( this.materialNames.length > 0 ) ? '\n\tmaterialNames:\n\t\t- ' + this.materialNames.join( '\n\t\t- ' ) : '\n\tmaterialNames: None';
				var printedConfig = 'OBJLoader2.Parser configuration:'
						+ matNames
						+ '\n\tmaterialPerSmoothingGroup: ' + this.materialPerSmoothingGroup
						+ '\n\tuseIndices: ' + this.useIndices
						+ '\n\tdisregardNormals: ' + this.disregardNormals
						+ '\n\tcallbackBuilderName: ' + this.callbackBuilder.name
						+ '\n\tcallbackProgressName: ' + this.callbackProgress.name;
				this.logger.logInfo( printedConfig );
			}
		};

		/**
		 * Parse the provided arraybuffer
		 * @memberOf Parser
		 *
		 * @param {Uint8Array} arrayBuffer OBJ data as Uint8Array
		 */
		Parser.prototype.parse = function ( arrayBuffer ) {
			this.logger.logTimeStart( 'OBJLoader2.Parser.parse' );
			this.configure();

			var arrayBufferView = new Uint8Array( arrayBuffer );
			var length = arrayBufferView.byteLength;
			this.totalBytes = length;
			var buffer = new Array( 128 );
			var bufferPointer = 0;
			var slashSpacePattern = new Array( 16 );
			var slashSpacePatternPointer = 0;
			var reachedFaces = false;
			var code;
			var word = '';
			var i = 0;
			for ( ; i < length; i++ ) {

				code = arrayBufferView[ i ];
				switch ( code ) {
					case Consts.CODE_SPACE:
						if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
						slashSpacePattern[ slashSpacePatternPointer++ ] = 0;
						word = '';
						break;

					case Consts.CODE_SLASH:
						if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
						slashSpacePattern[ slashSpacePatternPointer++ ] = 1;
						word = '';
						break;

					case Consts.CODE_LF:
						if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
						word = '';
						reachedFaces = this.processLine( buffer, bufferPointer, slashSpacePattern, slashSpacePatternPointer, reachedFaces, i );
						bufferPointer = 0;
						slashSpacePatternPointer = 0;
						break;

					case Consts.CODE_CR:
						break;

					default:
						word += String.fromCharCode( code );
						break;
				}
			}
			this.finalize( i );
			this.logger.logTimeEnd( 'OBJLoader2.Parser.parse' );
		};

		/**
		 * Parse the provided text
		 * @memberOf Parser
		 *
		 * @param {string} text OBJ data as string
		 */
		Parser.prototype.parseText = function ( text ) {
			this.logger.logTimeStart( 'OBJLoader2.Parser.parseText' );
			this.configure();

			var length = text.length;
			this.totalBytes = length;
			var buffer = new Array( 128 );
			var bufferPointer = 0;
			var slashSpacePattern = new Array( 16 );
			var slashSpacePatternPointer = 0;
			var reachedFaces = false;
			var char;
			var word = '';
			var i = 0;
			for ( ; i < length; i++ ) {

				char = text[ i ];
				switch ( char ) {
					case Consts.STRING_SPACE:
						if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
						slashSpacePattern[ slashSpacePatternPointer++ ] = 0;
						word = '';
						break;

					case Consts.STRING_SLASH:
						if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
						slashSpacePattern[ slashSpacePatternPointer++ ] = 1;
						word = '';
						break;

					case Consts.STRING_LF:
						if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
						word = '';
						reachedFaces = this.processLine( buffer, bufferPointer, slashSpacePattern, slashSpacePatternPointer, reachedFaces, i );
						bufferPointer = 0;
						slashSpacePatternPointer = 0;
						break;

					case Consts.STRING_CR:
						break;

					default:
						word += char;
				}
			}
			this.finalize( i );
			this.logger.logTimeEnd( 'OBJLoader2.Parser.parseText' );
		};

		Parser.prototype.processLine = function ( buffer, bufferPointer, slashSpacePattern, slashSpacePatternPointer, reachedFaces, currentByte ) {
			if ( bufferPointer < 1 ) return reachedFaces;

			var countSlashes = function ( slashSpacePattern, slashSpacePatternPointer ) {
				var slashesCount = 0;
				for ( var i = 0; i < slashSpacePatternPointer; i++ ) {
					slashesCount += slashSpacePattern[ i ];
				}
				return slashesCount;
			};

			var concatStringBuffer = function ( buffer, bufferPointer, slashSpacePattern ) {
				var concatBuffer = '';
				if ( bufferPointer === 2 ) {

					concatBuffer = buffer[ 1 ];

				} else {

					var bufferLength = bufferPointer - 1;
					for ( var i = 1; i < bufferLength; i++ ) {

						concatBuffer += buffer[ i ] + ( slashSpacePattern[ i ] === 0 ? ' ' : '/' );

					}
					concatBuffer += buffer[ bufferLength ];

				}
				return concatBuffer;
			};

			var flushStringBuffer = function ( buffer, bufferPointer ) {
				for ( var i = 0; i < bufferPointer; i++ ) {
					buffer[ i ] = '';
				}
			};

			switch ( buffer[ 0 ] ) {
				case Consts.LINE_V:
					// object complete instance required if reached faces already (= reached next block of v)
					if ( reachedFaces ) {

						if ( this.rawMesh.colors.length > 0 && this.rawMesh.colors.length !== this.rawMesh.vertices.length ) {

							throw 'Vertex Colors were detected, but vertex count and color count do not match!';

						}
						this.processCompletedObject( null, this.rawMesh.groupName, currentByte );
						reachedFaces = false;

					}
					if ( bufferPointer === 4 ) {

						this.rawMesh.pushVertex( buffer )

					} else {

						this.rawMesh.pushVertexAndVertextColors( buffer );

					}
					break;

				case Consts.LINE_VT:
					this.rawMesh.pushUv( buffer );
					break;

				case Consts.LINE_VN:
					this.rawMesh.pushNormal( buffer );
					break;

				case Consts.LINE_F:
					reachedFaces = true;
					this.rawMesh.processFaces( buffer, bufferPointer, countSlashes( slashSpacePattern, slashSpacePatternPointer ) );
					break;

				case Consts.LINE_L:
					this.rawMesh.processLines( buffer, bufferPointer, countSlashes( slashSpacePattern, slashSpacePatternPointer ) );
					break;

				case Consts.LINE_S:
					this.rawMesh.pushSmoothingGroup( buffer[ 1 ] );
					flushStringBuffer( buffer, bufferPointer );
					break;

				case Consts.LINE_G:
					this.processCompletedGroup( concatStringBuffer( buffer, bufferPointer, slashSpacePattern ), currentByte );
					flushStringBuffer( buffer, bufferPointer );
					break;

				case Consts.LINE_O:
					if ( this.rawMesh.vertices.length > 0 ) {

						this.processCompletedObject( concatStringBuffer( buffer, bufferPointer, slashSpacePattern ), null, currentByte );
						reachedFaces = false;

					} else {

						this.rawMesh.pushObject( concatStringBuffer( buffer, bufferPointer, slashSpacePattern ) );

					}
					flushStringBuffer( buffer, bufferPointer );
					break;

				case Consts.LINE_MTLLIB:
					this.rawMesh.pushMtllib( concatStringBuffer( buffer, bufferPointer, slashSpacePattern ) );
					flushStringBuffer( buffer, bufferPointer );
					break;

				case Consts.LINE_USEMTL:
					this.rawMesh.pushUsemtl( concatStringBuffer( buffer, bufferPointer, slashSpacePattern ) );
					flushStringBuffer( buffer, bufferPointer );
					break;

				default:
					break;
			}
			return reachedFaces;
		};

		Parser.prototype.createRawMeshReport = function ( rawMesh , inputObjectCount ) {
			var report = rawMesh.createReport( inputObjectCount );
			return 'Input Object number: ' + inputObjectCount +
				'\n\tObject name: ' + report.objectName +
				'\n\tGroup name: ' + report.groupName +
				'\n\tMtllib name: ' + report.mtllibName +
				'\n\tVertex count: ' + report.vertexCount +
				'\n\tNormal count: ' + report.normalCount +
				'\n\tUV count: ' + report.uvCount +
				'\n\tSmoothingGroup count: ' + report.smoothingGroupCount +
				'\n\tMaterial count: ' + report.mtlCount +
				'\n\tReal RawMeshSubGroup count: ' + report.subGroups;
		};

		Parser.prototype.processCompletedObject = function ( objectName, groupName, currentByte ) {
			var result = this.rawMesh.finalize();
			if ( Validator.isValid( result ) ) {

				this.inputObjectCount++;
				if ( this.logger.isDebug() ) this.logger.logDebug( this.createRawMeshReport( this.rawMesh, this.inputObjectCount ) );
				this.buildMesh( result, currentByte );
				var progressBytesPercent = currentByte / this.totalBytes;
				this.callbackProgress( 'Completed object: ' + objectName + ' Total progress: ' + ( progressBytesPercent * 100 ).toFixed( 2 ) + '%', progressBytesPercent );

			}
			this.rawMesh = this.rawMesh.newInstanceFromObject( objectName, groupName );
		};

		Parser.prototype.processCompletedGroup = function ( groupName, currentByte ) {
			var result = this.rawMesh.finalize();
			if ( Validator.isValid( result ) ) {

				this.inputObjectCount++;
				if ( this.logger.isDebug() ) this.logger.logDebug( this.createRawMeshReport( this.rawMesh, this.inputObjectCount ) );
				this.buildMesh( result, currentByte );
				var progressBytesPercent = currentByte / this.totalBytes;
				this.callbackProgress( 'Completed group: ' + groupName + ' Total progress: ' + ( progressBytesPercent * 100 ).toFixed( 2 ) + '%', progressBytesPercent );
				this.rawMesh = this.rawMesh.newInstanceFromGroup( groupName );

			} else {

				// if a group was set that did not lead to object creation in finalize, then the group name has to be updated
				this.rawMesh.pushGroup( groupName );

			}
		};

		Parser.prototype.finalize = function ( currentByte ) {
			this.logger.logInfo( 'Global output object count: ' + this.outputObjectCount );
			var result = Validator.isValid( this.rawMesh ) ? this.rawMesh.finalize() : null;
			if ( Validator.isValid( result ) ) {

				this.inputObjectCount++;
				if ( this.logger.isDebug() ) this.logger.logDebug( this.createRawMeshReport( this.rawMesh, this.inputObjectCount ) );
				this.buildMesh( result, currentByte );

				if ( this.logger.isEnabled() ) {

					var parserFinalReport = 'Overall counts: ' +
						'\n\tVertices: ' + this.counts.vertices +
						'\n\tFaces: ' + this.counts.faces +
						'\n\tMultiple definitions: ' + this.counts.doubleIndicesCount;
					this.logger.logInfo( parserFinalReport );

				}
				var progressBytesPercent = currentByte / this.totalBytes;
				this.callbackProgress( 'Completed Parsing: 100.00%', progressBytesPercent );

			}
		};

		/**
		 * RawObjectDescriptions are transformed to too intermediate format that is forwarded to the Builder.
		 * It is ensured that rawObjectDescriptions only contain objects with vertices (no need to check).
		 *
		 * @param result
		 */
		Parser.prototype.buildMesh = function ( result, currentByte ) {
			var rawObjectDescriptions = result.subGroups;

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
					this.logger.logWarn( 'object_group "' + rawObjectDescription.objectName + '_' +
						rawObjectDescription.groupName +
						'" was defined without material! Assigning "defaultMaterial".' );

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

				if ( this.logger.isDebug() ) {
					var materialIndexLine = Validator.isValid( selectedMaterialIndex ) ? '\n\t\tmaterialIndex: ' + selectedMaterialIndex : '';
					var createdReport = 'Output Object no.: ' + this.outputObjectCount +
						'\n\t\tobjectName: ' + rawObjectDescription.objectName +
						'\n\t\tgroupName: ' + rawObjectDescription.groupName +
						'\n\t\tmaterialName: ' + rawObjectDescription.materialName +
						materialIndexLine +
						'\n\t\tsmoothingGroup: ' + rawObjectDescription.smoothingGroup +
						'\n\t\t#vertices: ' + rawObjectDescription.vertices.length / 3 +
						'\n\t\t#indices: ' + rawObjectDescription.indices.length +
						'\n\t\t#colors: ' + rawObjectDescription.colors.length / 3 +
						'\n\t\t#uvs: ' + rawObjectDescription.uvs.length / 2 +
						'\n\t\t#normals: ' + rawObjectDescription.normals.length / 3;
					this.logger.logDebug( createdReport );
				}


			}

			this.outputObjectCount++;
			this.callbackBuilder(
				{
					cmd: 'meshData',
					progress: {
						numericalValue: currentByte / this.totalBytes
					},
					params: {
						meshName: result.name
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

		return Parser;
	})();

	/**
	 * {@link RawMesh} is only used by {@link Parser}.
	 * The user of OBJLoader2 does not need to care about this class.
	 * It is defined publicly for inclusion in web worker based OBJ loader ({@link THREE.OBJLoader2.WWOBJLoader2})
	 */
	var RawMesh = (function () {

		function RawMesh( materialPerSmoothingGroup, useIndices, disregardNormals, objectName, groupName, activeMtlName ) {
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

			this.subGroups = [];
			this.subGroupInUse = null;
			// this default index is required as it is possible to define faces without 'g' or 'usemtl'
			this.pushSmoothingGroup( 1 );

			this.doubleIndicesCount = 0;
			this.faceCount = 0;
		}

		RawMesh.prototype.newInstanceFromObject = function ( objectName, groupName ) {
			var newRawObject = new RawMesh( this.smoothingGroup.splitMaterials, this.useIndices, this.disregardNormals, objectName, groupName, this.activeMtlName );

			// move indices forward
			newRawObject.globalVertexOffset = this.globalVertexOffset + this.vertices.length / 3;
			newRawObject.globalUvOffset = this.globalUvOffset + this.uvs.length / 2;
			newRawObject.globalNormalOffset = this.globalNormalOffset + this.normals.length / 3;

			return newRawObject;
		};

		RawMesh.prototype.newInstanceFromGroup = function ( groupName ) {
			var newRawObject = new RawMesh( this.smoothingGroup.splitMaterials, this.useIndices, this.disregardNormals, this.objectName, groupName, this.activeMtlName );

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

		RawMesh.prototype.pushVertex = function ( buffer ) {
			this.vertices.push( parseFloat( buffer[ 1 ] ) );
			this.vertices.push( parseFloat( buffer[ 2 ] ) );
			this.vertices.push( parseFloat( buffer[ 3 ] ) );
		};

		RawMesh.prototype.pushVertexAndVertextColors = function ( buffer ) {
			this.vertices.push( parseFloat( buffer[ 1 ] ) );
			this.vertices.push( parseFloat( buffer[ 2 ] ) );
			this.vertices.push( parseFloat( buffer[ 3 ] ) );
			this.colors.push( parseFloat( buffer[ 4 ] ) );
			this.colors.push( parseFloat( buffer[ 5 ] ) );
			this.colors.push( parseFloat( buffer[ 6 ] ) );
		};

		RawMesh.prototype.pushUv = function ( buffer ) {
			this.uvs.push( parseFloat( buffer[ 1 ] ) );
			this.uvs.push( parseFloat( buffer[ 2 ] ) );
		};

		RawMesh.prototype.pushNormal = function ( buffer ) {
			this.normals.push( parseFloat( buffer[ 1 ] ) );
			this.normals.push( parseFloat( buffer[ 2 ] ) );
			this.normals.push( parseFloat( buffer[ 3 ] ) );
		};

		RawMesh.prototype.pushObject = function ( objectName ) {
			this.objectName = Validator.verifyInput( objectName, '' );
		};

		RawMesh.prototype.pushMtllib = function ( mtllibName ) {
			this.mtllibName = Validator.verifyInput( mtllibName, '' );
		};

		RawMesh.prototype.pushGroup = function ( groupName ) {
			this.groupName = Validator.verifyInput( groupName, '' );
		};

		RawMesh.prototype.pushUsemtl = function ( mtlName ) {
			if ( this.activeMtlName === mtlName || ! Validator.isValid( mtlName ) ) return;
			this.activeMtlName = mtlName;
			this.mtlCount++;

			this.verifyIndex();
		};

		RawMesh.prototype.pushSmoothingGroup = function ( smoothingGroup ) {
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

		RawMesh.prototype.verifyIndex = function () {
			var index = this.activeMtlName + '|' + this.smoothingGroup.normalized;
			this.subGroupInUse = this.subGroups[ index ];
			if ( ! Validator.isValid( this.subGroupInUse ) ) {

				this.subGroupInUse = new RawMeshSubGroup( this.objectName, this.groupName, this.activeMtlName, this.smoothingGroup.normalized );
				this.subGroups[ index ] = this.subGroupInUse;

			}
		};

		RawMesh.prototype.processFaces = function ( buffer, bufferPointer, slashesCount ) {
			var bufferLength = bufferPointer - 1;
			var i, length;

			// "f vertex ..."
			if ( slashesCount === 0 ) {

				for ( i = 2, length = bufferLength - 1; i < length; i ++ ) {

					this.buildFace( buffer[ 1 ] );
					this.buildFace( buffer[ i ] );
					this.buildFace( buffer[ i + 1 ] );

				}

				// "f vertex/uv ..."
			} else if  ( bufferLength === slashesCount * 2 ) {

				for ( i = 3, length = bufferLength - 2; i < length; i += 2 ) {

					this.buildFace( buffer[ 1 ], buffer[ 2 ] );
					this.buildFace( buffer[ i ], buffer[ i + 1 ] );
					this.buildFace( buffer[ i + 2 ], buffer[ i + 3 ] );

				}

				// "f vertex/uv/normal ..."
			} else if  ( bufferLength * 2 === slashesCount * 3 ) {

				for ( i = 4, length = bufferLength - 3; i < length; i += 3 ) {

					this.buildFace( buffer[ 1 ], buffer[ 2 ], buffer[ 3 ] );
					this.buildFace( buffer[ i ], buffer[ i + 1 ], buffer[ i + 2 ] );
					this.buildFace( buffer[ i + 3 ], buffer[ i + 4 ], buffer[ i + 5 ] );

				}

				// "f vertex//normal ..."
			} else {

				for ( i = 3, length = bufferLength - 2; i < length; i += 2 ) {

					this.buildFace( buffer[ 1 ], undefined, buffer[ 2 ] );
					this.buildFace( buffer[ i ], undefined, buffer[ i + 1 ] );
					this.buildFace( buffer[ i + 2 ], undefined, buffer[ i + 3 ] );

				}

			}
		};

		RawMesh.prototype.buildFace = function ( faceIndexV, faceIndexU, faceIndexN ) {
			var sgiu = this.subGroupInUse;
			if ( this.disregardNormals ) faceIndexN = undefined;
			var scope = this;
			var updateRawObjectDescriptionInUse = function () {

				var indexPointerV = ( parseInt( faceIndexV ) - scope.globalVertexOffset ) * 3;
				var indexPointerC = scope.colors.length > 0 ? indexPointerV : null;

				var vertices = sgiu.vertices;
				vertices.push( scope.vertices[ indexPointerV++ ] );
				vertices.push( scope.vertices[ indexPointerV++ ] );
				vertices.push( scope.vertices[ indexPointerV ] );

				if ( indexPointerC !== null ) {

					var colors = sgiu.colors;
					colors.push( scope.colors[ indexPointerC++ ] );
					colors.push( scope.colors[ indexPointerC++ ] );
					colors.push( scope.colors[ indexPointerC ] );

				}

				if ( faceIndexU ) {

					var indexPointerU = ( parseInt( faceIndexU ) - scope.globalUvOffset ) * 2;
					var uvs = sgiu.uvs;
					uvs.push( scope.uvs[ indexPointerU++ ] );
					uvs.push( scope.uvs[ indexPointerU ] );

				}
				if ( faceIndexN ) {

					var indexPointerN = ( parseInt( faceIndexN ) - scope.globalNormalOffset ) * 3;
					var normals = sgiu.normals;
					normals.push( scope.normals[ indexPointerN++ ] );
					normals.push( scope.normals[ indexPointerN++ ] );
					normals.push( scope.normals[ indexPointerN ] );

				}
			};

			if ( this.useIndices ) {

				var mappingName = faceIndexV + ( faceIndexU ? '_' + faceIndexU : '_n' ) + ( faceIndexN ? '_' + faceIndexN : '_n' );
				var indicesPointer = sgiu.indexMappings[ mappingName ];
				if ( Validator.isValid( indicesPointer ) ) {

					this.doubleIndicesCount++;

				} else {

					indicesPointer = sgiu.vertices.length / 3;
					updateRawObjectDescriptionInUse();
					sgiu.indexMappings[ mappingName ] = indicesPointer;
					sgiu.indexMappingsCount++;

				}
				sgiu.indices.push( indicesPointer );

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
		RawMesh.prototype.processLines = function ( buffer, bufferPointer, slashCount ) {
			var i = 1;
			var length;
			var bufferLength = bufferPointer - 1;

			if ( bufferLength === slashCount * 2 ) {

				for ( length = bufferLength - 2; i < length; i += 2 ) {

					this.vertices.push( parseInt( buffer[ i ] ) );
					this.uvs.push( parseInt( buffer[ i + 1 ] ) );

				}

			} else {

				for ( length = bufferLength - 1; i < length; i ++ ) {

					this.vertices.push( parseInt( buffer[ i ] ) );

				}

			}
		};

		/**
		 * Clear any empty rawObjectDescription and calculate absolute vertex, normal and uv counts
		 */
		RawMesh.prototype.finalize = function () {
			var rawObjectDescriptionsTemp = [];
			var rawObjectDescription;
			var absoluteVertexCount = 0;
			var absoluteIndexMappingsCount = 0;
			var absoluteIndexCount = 0;
			var absoluteColorCount = 0;
			var absoluteNormalCount = 0;
			var absoluteUvCount = 0;
			var indices;
			for ( var name in this.subGroups ) {

				rawObjectDescription = this.subGroups[ name ];
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
					name: this.groupName !== '' ? this.groupName : this.objectName,
					subGroups: rawObjectDescriptionsTemp,
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

		RawMesh.prototype.createReport = function () {
			var report = {
				objectName: this.objectName,
				groupName: this.groupName,
				mtllibName: this.mtllibName,
				vertexCount: this.vertices.length / 3,
				normalCount: this.normals.length / 3,
				uvCount: this.uvs.length / 2,
				smoothingGroupCount: this.smoothingGroupCount,
				mtlCount: this.mtlCount,
				subGroups: this.subGroups.length
			};

			return report;
		};

		return RawMesh;
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
	var RawMeshSubGroup = (function () {

		function RawMeshSubGroup( objectName, groupName, materialName, smoothingGroup ) {
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

		return RawMeshSubGroup;
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
		if ( Validator.isValid( resource ) ) this.logger.logTimeStart( 'Loading MTL: ' + resource.name );

		var materials = [];
		var scope = this;
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

			if ( Validator.isValid( resource ) ) scope.logger.logTimeEnd( 'Loading MTL: ' + resource.name );
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
					this.logger.logError( output + ': ' + event );
					throw output;
				};

				mtlLoader.load( resource.name, processMaterials, undefined, onError );

			}
		}
	};

	return OBJLoader2;
})();
