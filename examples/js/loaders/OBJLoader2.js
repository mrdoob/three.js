/**
  * @author Kai Salmen / https://kaisalmen.de
  * Development repository: https://github.com/kaisalmen/WWOBJLoader
  */

'use strict';

if ( THREE.OBJLoader2 === undefined ) { THREE.OBJLoader2 = {} }

if ( THREE.LoaderSupport === undefined ) console.error( '"THREE.LoaderSupport" is not available. "THREE.OBJLoader2" requires it. Please include "LoaderSupport.js" in your HTML.' );

/**
 * Use this class to load OBJ data from files or to parse OBJ data from an arraybuffer
 * @class
 *
 * @param {THREE.DefaultLoadingManager} [manager] The loadingManager for the loader to use. Default is {@link THREE.DefaultLoadingManager}
 * @param {THREE.LoaderSupport.ConsoleLogger} logger logger to be used
 */
THREE.OBJLoader2 = (function () {

	var OBJLOADER2_VERSION = '2.3.1';
	var Validator = THREE.LoaderSupport.Validator;

	OBJLoader2.prototype = Object.create( THREE.LoaderSupport.LoaderBase.prototype );
	OBJLoader2.prototype.constructor = OBJLoader2;

	function OBJLoader2( manager, logger ) {
		THREE.LoaderSupport.LoaderBase.call( this, manager, logger );
		this.logger.logInfo( 'Using THREE.OBJLoader2 version: ' + OBJLOADER2_VERSION );

		this.materialPerSmoothingGroup = false;

		this.workerSupport = null;
		this.terminateWorkerOnLoad = true;
	}

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
	 * Run the loader according the provided instructions.
	 * @memberOf THREE.OBJLoader2
	 *
	 * @param {THREE.LoaderSupport.PrepData} prepData All parameters and resources required for execution
	 * @param {THREE.LoaderSupport.WorkerSupport} [workerSupportExternal] Use pre-existing WorkerSupport
	 */
	OBJLoader2.prototype.run = function ( prepData, workerSupportExternal ) {
		this._applyPrepData( prepData );
		var available = this.checkResourceDescriptorFiles( prepData.resources,
			[
				{ ext: "obj", type: "Uint8Array", ignore: false },
				{ ext: "mtl", type: "String", ignore: false },
				{ ext: "zip", type: "String", ignore: true }
			]
		);
		if ( Validator.isValid( workerSupportExternal ) ) {

			this.terminateWorkerOnLoad = false;
			this.workerSupport = workerSupportExternal;
			this.logger = workerSupportExternal.logger;

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
		THREE.LoaderSupport.LoaderBase.prototype._applyPrepData.call( this, prepData );

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

		var parser = new Parser();
		parser.setLogConfig( this.logger.enabled, this.logger.debug );
		parser.setMaterialPerSmoothingGroup( this.materialPerSmoothingGroup );
		parser.setUseIndices( this.useIndices );
		parser.setDisregardNormals( this.disregardNormals );
		// sync code works directly on the material references
		parser.setMaterials( this.builder.getMaterials() );

		var scope = this;
		var onMeshLoaded = function ( payload ) {
			var meshes = scope.builder.processPayload( payload );
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
			scope.logger.logTimeEnd( 'OBJLoader2 parseAsync: ' + scope.modelName );
		};
		var scopedOnMeshLoaded = function ( payload ) {
			var meshes = scope.builder.processPayload( payload );
			var mesh;
			for ( var i in meshes ) {
				mesh = meshes[ i ];
				scope.loaderRootNode.add( mesh );
			}
		};

		this.workerSupport = Validator.verifyInput( this.workerSupport, new THREE.LoaderSupport.WorkerSupport( this.logger ) );
		var buildCode = function ( funcBuildObject, funcBuildSingleton ) {
			var workerCode = '';
			workerCode += '/**\n';
			workerCode += '  * This code was constructed by OBJLoader2 buildCode.\n';
			workerCode += '  */\n\n';
			workerCode += 'THREE = { LoaderSupport: {} };\n\n';
			workerCode += funcBuildObject( 'THREE.LoaderSupport.Validator', Validator );
			workerCode += funcBuildSingleton( 'THREE.LoaderSupport.ConsoleLogger', THREE.LoaderSupport.ConsoleLogger );
			workerCode += funcBuildSingleton( 'THREE.LoaderSupport.LoaderBase', THREE.LoaderSupport.LoaderBase );
			workerCode += funcBuildSingleton( 'Parser', Parser );

			return workerCode;
		};
		this.workerSupport.validate( buildCode, 'Parser' );
		this.workerSupport.setCallbacks( scopedOnMeshLoaded, scopedOnLoad );
		if ( scope.terminateWorkerOnLoad ) this.workerSupport.setTerminateRequested( true );

		var materialNames = {};
		var materials = this.builder.getMaterials();
		for ( var materialName in materials ) {

			materialNames[ materialName ] = materialName;

		}
		this.workerSupport.run(
			{
				params: {
					useAsync: true,
					materialPerSmoothingGroup: this.materialPerSmoothingGroup,
					useIndices: this.useIndices,
					disregardNormals: this.disregardNormals
				},
				logger: {
					debug: this.logger.debug,
					enabled: this.logger.enabled
				},
				materials: {
					// in async case only material names are supplied to parser
					materials: materialNames
				},
				data: {
					input: content,
					options: null
				}
			}
		);
	};


	/**
	 * Parse OBJ data either from ArrayBuffer or string
	 * @class
	 */
	var Parser = (function () {

		function Parser() {
			this.callbackProgress = null;
			this.callbackBuilder = null;

			this.materials = {};
			this.useAsync = false;
			this.materialPerSmoothingGroup = false;
			this.useIndices = false;
			this.disregardNormals = false;

			this.vertices = [];
			this.colors = [];
			this.normals = [];
			this.uvs = [];

			this.rawMesh = {
				objectName: '',
				groupName: '',
				activeMtlName: '',
				mtllibName: '',

				// reset with new mesh
				faceType: -1,
				subGroups: [],
				subGroupInUse: null,
				smoothingGroup: {
					splitMaterials: false,
					normalized: -1,
					real: -1
				},
				counts: {
					doubleIndicesCount: 0,
					faceCount: 0,
					mtlCount: 0,
					smoothingGroupCount: 0
				}
			};

			this.inputObjectCount = 1;
			this.outputObjectCount = 1;
			this.globalCounts = {
				vertices: 0,
				faces: 0,
				doubleIndicesCount: 0,
				currentByte: 0,
				totalBytes: 0
			};
			this.logger = new THREE.LoaderSupport.ConsoleLogger();
		}

		Parser.prototype.resetRawMesh = function () {
			// faces are stored according combined index of group, material and smoothingGroup (0 or not)
			this.rawMesh.subGroups = [];
			this.rawMesh.subGroupInUse = null;
			this.rawMesh.smoothingGroup.normalized = -1;
			this.rawMesh.smoothingGroup.real = -1;

			// this default index is required as it is possible to define faces without 'g' or 'usemtl'
			this.pushSmoothingGroup( 1 );

			this.rawMesh.counts.doubleIndicesCount = 0;
			this.rawMesh.counts.faceCount = 0;
			this.rawMesh.counts.mtlCount = 0;
			this.rawMesh.counts.smoothingGroupCount = 0;
		};

		Parser.prototype.setUseAsync = function ( useAsync ) {
			this.useAsync = useAsync;
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

		Parser.prototype.setMaterials = function ( materials ) {
			this.materials = THREE.LoaderSupport.Validator.verifyInput( materials, this.materials );
			this.materials = THREE.LoaderSupport.Validator.verifyInput( this.materials, {} );
		};

		Parser.prototype.setCallbackBuilder = function ( callbackBuilder ) {
			if ( ! THREE.LoaderSupport.Validator.isValid( callbackBuilder ) ) throw 'Unable to run as no "builder" callback is set.';
			this.callbackBuilder = callbackBuilder;
		};

		Parser.prototype.setCallbackProgress = function ( callbackProgress ) {
			this.callbackProgress = callbackProgress;
		};

		Parser.prototype.setLogConfig = function ( enabled, debug ) {
			this.logger.setEnabled( enabled );
			this.logger.setDebug( debug );
		};

		Parser.prototype.configure = function () {
			this.pushSmoothingGroup( 1 );

			if ( this.logger.isEnabled() ) {

				var matKeys = Object.keys( this.materials );
				var matNames = ( matKeys.length > 0 ) ? '\n\tmaterialNames:\n\t\t- ' + matKeys.join( '\n\t\t- ' ) : '\n\tmaterialNames: None';
				var printedConfig = 'OBJLoader2.Parser configuration:'
					+ matNames
					+ '\n\tuseAsync: ' + this.useAsync
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
			this.globalCounts.totalBytes = length;
			var buffer = new Array( 128 );
			var bufferPointer = 0;
			var slashSpacePattern = new Array( 16 );
			var slashSpacePatternPointer = 0;
			var code;
			var word = '';
			var i = 0;
			for ( ; i < length; i++ ) {

				code = arrayBufferView[ i ];
				switch ( code ) {
					// space
					case 32:
						if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
						slashSpacePattern[ slashSpacePatternPointer++ ] = 0;
						word = '';
						break;
					// slash
					case 47:
						if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
						slashSpacePattern[ slashSpacePatternPointer++ ] = 1;
						word = '';
						break;

					// LF
					case 10:
						if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
						word = '';
						this.globalCounts.currentByte = i;
						this.processLine( buffer, bufferPointer, slashSpacePattern, slashSpacePatternPointer );
						bufferPointer = 0;
						slashSpacePatternPointer = 0;
						break;

					// CR
					case 13:
						break;

					default:
						word += String.fromCharCode( code );
						break;
				}
			}
			this.finalizeParsing();
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
			this.globalCounts.totalBytes = length;
			var buffer = new Array( 128 );
			var bufferPointer = 0;
			var slashSpacePattern = new Array( 16 );
			var slashSpacePatternPointer = 0;
			var char;
			var word = '';
			var i = 0;
			for ( ; i < length; i++ ) {

				char = text[ i ];
				switch ( char ) {
					case ' ':
						if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
						slashSpacePattern[ slashSpacePatternPointer++ ] = 0;
						word = '';
						break;

					case '/':
						if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
						slashSpacePattern[ slashSpacePatternPointer++ ] = 1;
						word = '';
						break;

					case '\n':
						if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
						word = '';
						this.globalCounts.currentByte = i;
						this.processLine( buffer, bufferPointer, slashSpacePattern, slashSpacePatternPointer );
						bufferPointer = 0;
						slashSpacePatternPointer = 0;
						break;

					case '\r':
						break;

					default:
						word += char;
				}
			}
			this.finalizeParsing();
			this.logger.logTimeEnd( 'OBJLoader2.Parser.parseText' );
		};

		Parser.prototype.processLine = function ( buffer, bufferPointer, slashSpacePattern, slashSpacePatternPointer ) {
			if ( bufferPointer < 1 ) return;

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
				case 'v':
					this.vertices.push( parseFloat( buffer[ 1 ] ) );
					this.vertices.push( parseFloat( buffer[ 2 ] ) );
					this.vertices.push( parseFloat( buffer[ 3 ] ) );
					if ( bufferPointer > 4 ) {

						this.colors.push( parseFloat( buffer[ 4 ] ) );
						this.colors.push( parseFloat( buffer[ 5 ] ) );
						this.colors.push( parseFloat( buffer[ 6 ] ) );

					}
					break;

				case 'vt':
					this.uvs.push( parseFloat( buffer[ 1 ] ) );
					this.uvs.push( parseFloat( buffer[ 2 ] ) );
					break;

				case 'vn':
					this.normals.push( parseFloat( buffer[ 1 ] ) );
					this.normals.push( parseFloat( buffer[ 2 ] ) );
					this.normals.push( parseFloat( buffer[ 3 ] ) );
					break;

				case 'f':
					var slashesCount = countSlashes( slashSpacePattern, slashSpacePatternPointer );
					var bufferLength = bufferPointer - 1;

					// "f vertex ..."
					if ( slashesCount === 0 ) {

						this.checkFaceType( 0 );

						// "f vertex/uv ..."
					} else if  ( bufferLength === slashesCount * 2 ) {

						this.checkFaceType( 1 );

						// "f vertex/uv/normal ..."
					} else if  ( bufferLength * 2 === slashesCount * 3 ) {

						this.checkFaceType( 2 );

						// "f vertex//normal ..."
					} else {

						this.checkFaceType( 3 );

					}
					this.processFaces( buffer, bufferLength );
					break;

				case 'l':
					this.checkFaceType( 4 );
					this.processLinesOrPoints( buffer, bufferPointer, countSlashes( slashSpacePattern, slashSpacePatternPointer ) );
					break;

				case 'p':
					this.checkFaceType( 5 );
					this.processLinesOrPoints( buffer, bufferPointer, 0 );
					break;

				case 's':
					this.pushSmoothingGroup( buffer[ 1 ] );
					flushStringBuffer( buffer, bufferPointer );
					break;

				case 'g':
					// 'g' leads to creation of mesh if valid data (faces declaration was done before), otherwise only groupName gets set
					this.processCompletedMesh();
					this.rawMesh.groupName = THREE.LoaderSupport.Validator.verifyInput( concatStringBuffer( buffer, bufferPointer, slashSpacePattern ), '' );
					flushStringBuffer( buffer, bufferPointer );
					break;

				case 'o':
					// 'o' is pure meta-information and does not result in creation of new meshes
					this.rawMesh.objectName = THREE.LoaderSupport.Validator.verifyInput( concatStringBuffer( buffer, bufferPointer, slashSpacePattern ), '' );
					flushStringBuffer( buffer, bufferPointer );
					break;

				case 'mtllib':
					this.rawMesh.mtllibName = THREE.LoaderSupport.Validator.verifyInput( concatStringBuffer( buffer, bufferPointer, slashSpacePattern ), '' );
					flushStringBuffer( buffer, bufferPointer );
					break;

				case 'usemtl':
					var mtlName = concatStringBuffer( buffer, bufferPointer, slashSpacePattern );
					if ( this.rawMesh.activeMtlName !== mtlName && THREE.LoaderSupport.Validator.isValid( mtlName ) ) {

						this.rawMesh.activeMtlName = mtlName;
						this.rawMesh.counts.mtlCount++;
						this.checkSubGroup();

					}
					flushStringBuffer( buffer, bufferPointer );
					break;

				default:
					break;
			}
		};

		Parser.prototype.pushSmoothingGroup = function ( smoothingGroup ) {
			var smoothingGroupInt = parseInt( smoothingGroup );
			if ( isNaN( smoothingGroupInt ) ) {
				smoothingGroupInt = smoothingGroup === "off" ? 0 : 1;
			}

			var smoothCheck = this.rawMesh.smoothingGroup.normalized;
			this.rawMesh.smoothingGroup.normalized = this.rawMesh.smoothingGroup.splitMaterials ? smoothingGroupInt : ( smoothingGroupInt === 0 ) ? 0 : 1;
			this.rawMesh.smoothingGroup.real = smoothingGroupInt;

			if ( smoothCheck !== smoothingGroupInt ) {

				this.rawMesh.counts.smoothingGroupCount++;
				this.checkSubGroup();

			}
		};

		/**
		 * Expanded faceTypes include all four face types, both line types and the point type
		 * faceType = 0: "f vertex ..."
		 * faceType = 1: "f vertex/uv ..."
		 * faceType = 2: "f vertex/uv/normal ..."
		 * faceType = 3: "f vertex//normal ..."
		 * faceType = 4: "l vertex/uv ..." or "l vertex ..."
		 * faceType = 5: "p vertex ..."
		 */
		Parser.prototype.checkFaceType = function ( faceType ) {
			if ( this.rawMesh.faceType !== faceType ) {

				this.processCompletedMesh();
				this.rawMesh.faceType = faceType;
				this.checkSubGroup();

			}
		};

		Parser.prototype.checkSubGroup = function () {
			var index = this.rawMesh.activeMtlName + '|' + this.rawMesh.smoothingGroup.normalized;
			this.rawMesh.subGroupInUse = this.rawMesh.subGroups[ index ];

			if ( ! THREE.LoaderSupport.Validator.isValid( this.rawMesh.subGroupInUse ) ) {

				this.rawMesh.subGroupInUse = {
					index: index,
					objectName: this.rawMesh.objectName,
					groupName: this.rawMesh.groupName,
					materialName: this.rawMesh.activeMtlName,
					smoothingGroup: this.rawMesh.smoothingGroup.normalized,
					vertices: [],
					indexMappingsCount: 0,
					indexMappings: [],
					indices: [],
					colors: [],
					uvs: [],
					normals: []
				};
				this.rawMesh.subGroups[ index ] = this.rawMesh.subGroupInUse;

			}
		};

		Parser.prototype.processFaces = function ( buffer, bufferLength ) {
			var i, length;

			// "f vertex ..."
			if ( this.rawMesh.faceType === 0 ) {

				for ( i = 2, length = bufferLength; i < length; i ++ ) {

					this.buildFace( buffer[ 1 ] );
					this.buildFace( buffer[ i ] );
					this.buildFace( buffer[ i + 1 ] );

				}

				// "f vertex/uv ..."
			} else if  ( this.rawMesh.faceType === 1 ) {

				for ( i = 3, length = bufferLength - 2; i < length; i += 2 ) {

					this.buildFace( buffer[ 1 ], buffer[ 2 ] );
					this.buildFace( buffer[ i ], buffer[ i + 1 ] );
					this.buildFace( buffer[ i + 2 ], buffer[ i + 3 ] );

				}

				// "f vertex/uv/normal ..."
			} else if  ( this.rawMesh.faceType === 2 ) {

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

		Parser.prototype.buildFace = function ( faceIndexV, faceIndexU, faceIndexN ) {
			if ( this.disregardNormals ) faceIndexN = undefined;
			var scope = this;
			var updateSubGroupInUse = function () {

				var faceIndexVi = parseInt( faceIndexV );
				var indexPointerV = 3 * ( faceIndexVi > 0 ? faceIndexVi - 1 : faceIndexVi + scope.vertices.length / 3 );

				var vertices = scope.rawMesh.subGroupInUse.vertices;
				vertices.push( scope.vertices[ indexPointerV++ ] );
				vertices.push( scope.vertices[ indexPointerV++ ] );
				vertices.push( scope.vertices[ indexPointerV ] );

				var indexPointerC = scope.colors.length > 0 ? indexPointerV : null;
				if ( indexPointerC !== null ) {

					var colors = scope.rawMesh.subGroupInUse.colors;
					colors.push( scope.colors[ indexPointerC++ ] );
					colors.push( scope.colors[ indexPointerC++ ] );
					colors.push( scope.colors[ indexPointerC ] );

				}

				if ( faceIndexU ) {

					var faceIndexUi = parseInt( faceIndexU );
					var indexPointerU = 2 * ( faceIndexUi > 0 ? faceIndexUi - 1 : faceIndexUi + scope.uvs.length / 2 );
					var uvs = scope.rawMesh.subGroupInUse.uvs;
					uvs.push( scope.uvs[ indexPointerU++ ] );
					uvs.push( scope.uvs[ indexPointerU ] );

				}
				if ( faceIndexN ) {

					var faceIndexNi = parseInt( faceIndexN );
					var indexPointerN = 3 * ( faceIndexNi > 0 ? faceIndexNi - 1 : faceIndexNi + scope.normals.length / 3 );
					var normals = scope.rawMesh.subGroupInUse.normals;
					normals.push( scope.normals[ indexPointerN++ ] );
					normals.push( scope.normals[ indexPointerN++ ] );
					normals.push( scope.normals[ indexPointerN ] );

				}
			};

			if ( this.useIndices ) {

				var mappingName = faceIndexV + ( faceIndexU ? '_' + faceIndexU : '_n' ) + ( faceIndexN ? '_' + faceIndexN : '_n' );
				var indicesPointer = this.rawMesh.subGroupInUse.indexMappings[ mappingName ];
				if ( THREE.LoaderSupport.Validator.isValid( indicesPointer ) ) {

					this.rawMesh.counts.doubleIndicesCount++;

				} else {

					indicesPointer = this.rawMesh.subGroupInUse.vertices.length / 3;
					updateSubGroupInUse();
					this.rawMesh.subGroupInUse.indexMappings[ mappingName ] = indicesPointer;
					this.rawMesh.subGroupInUse.indexMappingsCount++;

				}
				this.rawMesh.subGroupInUse.indices.push( indicesPointer );

			} else {

				updateSubGroupInUse();

			}
			this.rawMesh.counts.faceCount++;
		};

		/*
		 * Support for lines with or without texture or Points (just Vertex).
		 * First element in indexArray is the line/point identification
		 *
		 * : "l vertex/uv		vertex/uv 		..."
		 * 1: "l vertex			vertex 			..."
		 */
		Parser.prototype.processLinesOrPoints = function ( buffer, bufferPointer, slashCount ) {
			var i = 1;
			var length;
			var bufferLength = bufferPointer - 1;

			if ( bufferLength === slashCount * 2 ) {

				for ( length = bufferPointer; i < length; i += 2 ) this.buildFace( buffer[ i ], buffer[ i + 1 ] );

			} else {

				for ( length = bufferPointer; i < length; i ++ ) this.buildFace( buffer[ i ] );

			}
		};

		Parser.prototype.createRawMeshReport = function ( inputObjectCount ) {
			return 'Input Object number: ' + inputObjectCount +
				'\n\tObject name: ' + this.rawMesh.objectName +
				'\n\tGroup name: ' + this.rawMesh.groupName +
				'\n\tMtllib name: ' + this.rawMesh.mtllibName +
				'\n\tVertex count: ' + this.vertices.length / 3 +
				'\n\tNormal count: ' + this.normals.length / 3 +
				'\n\tUV count: ' + this.uvs.length / 2 +
				'\n\tSmoothingGroup count: ' + this.rawMesh.counts.smoothingGroupCount +
				'\n\tMaterial count: ' + this.rawMesh.counts.mtlCount +
				'\n\tReal MeshOutputGroup count: ' + this.rawMesh.subGroups.length;
		};

		/**
		 * Clear any empty subGroup and calculate absolute vertex, normal and uv counts
		 */
		Parser.prototype.finalizeRawMesh = function () {
			var meshOutputGroupTemp = [];
			var meshOutputGroup;
			var absoluteVertexCount = 0;
			var absoluteIndexMappingsCount = 0;
			var absoluteIndexCount = 0;
			var absoluteColorCount = 0;
			var absoluteNormalCount = 0;
			var absoluteUvCount = 0;
			var indices;
			for ( var name in this.rawMesh.subGroups ) {

				meshOutputGroup = this.rawMesh.subGroups[ name ];
				if ( meshOutputGroup.vertices.length > 0 ) {

					indices = meshOutputGroup.indices;
					if ( indices.length > 0 && absoluteIndexMappingsCount > 0 ) {

						for ( var i in indices ) indices[ i ] = indices[ i ] + absoluteIndexMappingsCount;

					}
					meshOutputGroupTemp.push( meshOutputGroup );
					absoluteVertexCount += meshOutputGroup.vertices.length;
					absoluteIndexMappingsCount += meshOutputGroup.indexMappingsCount;
					absoluteIndexCount += meshOutputGroup.indices.length;
					absoluteColorCount += meshOutputGroup.colors.length;
					absoluteUvCount += meshOutputGroup.uvs.length;
					absoluteNormalCount += meshOutputGroup.normals.length;

				}
			}

			// do not continue if no result
			var result = null;
			if ( meshOutputGroupTemp.length > 0 ) {

				result = {
					name: this.rawMesh.groupName !== '' ? this.rawMesh.groupName : this.rawMesh.objectName,
					subGroups: meshOutputGroupTemp,
					absoluteVertexCount: absoluteVertexCount,
					absoluteIndexCount: absoluteIndexCount,
					absoluteColorCount: absoluteColorCount,
					absoluteNormalCount: absoluteNormalCount,
					absoluteUvCount: absoluteUvCount,
					faceCount: this.rawMesh.counts.faceCount,
					doubleIndicesCount: this.rawMesh.counts.doubleIndicesCount
				};

			}
			return result;
		};

		Parser.prototype.processCompletedMesh = function () {
			var result = this.finalizeRawMesh();
			if ( THREE.LoaderSupport.Validator.isValid( result ) ) {

				if ( this.colors.length > 0 && this.colors.length !== this.vertices.length ) {

					throw 'Vertex Colors were detected, but vertex count and color count do not match!';

				}
				if ( this.logger.isDebug() ) this.logger.logDebug( this.createRawMeshReport( this.inputObjectCount ) );
				this.inputObjectCount++;

				this.buildMesh( result );
				var progressBytesPercent = this.globalCounts.currentByte / this.globalCounts.totalBytes;
				this.callbackProgress( 'Completed [o: ' + this.rawMesh.objectName + ' g:' + this.rawMesh.groupName + '] Total progress: ' + ( progressBytesPercent * 100 ).toFixed( 2 ) + '%', progressBytesPercent );
				this.resetRawMesh();
				return true;

			} else {

				return false;
			}
		};

		/**
		 * SubGroups are transformed to too intermediate format that is forwarded to the Builder.
		 * It is ensured that SubGroups only contain objects with vertices (no need to check).
		 *
		 * @param result
		 */
		Parser.prototype.buildMesh = function ( result ) {
			var meshOutputGroups = result.subGroups;

			var vertexFA = new Float32Array( result.absoluteVertexCount );
			this.globalCounts.vertices += result.absoluteVertexCount / 3;
			this.globalCounts.faces += result.faceCount;
			this.globalCounts.doubleIndicesCount += result.doubleIndicesCount;
			var indexUA = ( result.absoluteIndexCount > 0 ) ? new Uint32Array( result.absoluteIndexCount ) : null;
			var colorFA = ( result.absoluteColorCount > 0 ) ? new Float32Array( result.absoluteColorCount ) : null;
			var normalFA = ( result.absoluteNormalCount > 0 ) ? new Float32Array( result.absoluteNormalCount ) : null;
			var uvFA = ( result.absoluteUvCount > 0 ) ? new Float32Array( result.absoluteUvCount ) : null;
			var haveVertexColors = THREE.LoaderSupport.Validator.isValid( colorFA );

			var meshOutputGroup;
			var materialNames = [];

			var createMultiMaterial = ( meshOutputGroups.length > 1 );
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

			var materialOrg, material, materialName, materialNameOrg;
			// only one specific face type
			for ( var oodIndex in meshOutputGroups ) {

				if ( ! meshOutputGroups.hasOwnProperty( oodIndex ) ) continue;
				meshOutputGroup = meshOutputGroups[ oodIndex ];

				materialNameOrg = meshOutputGroup.materialName;
				if ( this.rawMesh.faceType < 4 ) {

					materialName = materialNameOrg + ( haveVertexColors ? '_vertexColor' : '' ) + ( meshOutputGroup.smoothingGroup === 0 ? '_flat' : '' );


				} else {

					materialName = this.rawMesh.faceType === 4 ? 'defaultLineMaterial' : 'defaultPointMaterial';

				}
				materialOrg = this.materials[ materialNameOrg ];
				material = this.materials[ materialName ];

				// both original and derived names do not lead to an existing material => need to use a default material
				if ( ! THREE.LoaderSupport.Validator.isValid( materialOrg ) && ! THREE.LoaderSupport.Validator.isValid( material ) ) {

					var defaultMaterialName = haveVertexColors ? 'defaultVertexColorMaterial' : 'defaultMaterial';
					materialOrg = this.materials[ defaultMaterialName ];
					this.logger.logWarn( 'object_group "' + meshOutputGroup.objectName + '_' +
						meshOutputGroup.groupName + '" was defined with unresolvable material "' +
						materialNameOrg + '"! Assigning "' + defaultMaterialName + '".' );
					materialNameOrg = defaultMaterialName;

					// if names are identical then there is no need for later manipulation
					if ( materialNameOrg === materialName ) {

						material = materialOrg;
						materialName = defaultMaterialName;

					}

				}
				if ( ! THREE.LoaderSupport.Validator.isValid( material ) ) {

					var materialCloneInstructions = {
						materialNameOrg: materialNameOrg,
						materialName: materialName,
						materialProperties: {
							vertexColors: haveVertexColors ? 2 : 0,
							flatShading: meshOutputGroup.smoothingGroup === 0
						}
					};
					var payload = {
						cmd: 'materialData',
						materials: {
							materialCloneInstructions: materialCloneInstructions
						}
					};
					this.callbackBuilder( payload );

					// fake entry for async; sync Parser always works on material references (Builder update directly visible here)
					if ( this.useAsync ) this.materials[ materialName ] = materialCloneInstructions;

				}

				if ( createMultiMaterial ) {

					// re-use material if already used before. Reduces materials array size and eliminates duplicates
					selectedMaterialIndex = materialIndexMapping[ materialName ];
					if ( ! selectedMaterialIndex ) {

						selectedMaterialIndex = materialIndex;
						materialIndexMapping[ materialName ] = materialIndex;
						materialNames.push( materialName );
						materialIndex++;

					}
					materialGroupLength = this.useIndices ? meshOutputGroup.indices.length : meshOutputGroup.vertices.length / 3;
					materialGroup = {
						start: materialGroupOffset,
						count: materialGroupLength,
						index: selectedMaterialIndex
					};
					materialGroups.push( materialGroup );
					materialGroupOffset += materialGroupLength;

				} else {

					materialNames.push( materialName );

				}

				vertexFA.set( meshOutputGroup.vertices, vertexFAOffset );
				vertexFAOffset += meshOutputGroup.vertices.length;

				if ( indexUA ) {

					indexUA.set( meshOutputGroup.indices, indexUAOffset );
					indexUAOffset += meshOutputGroup.indices.length;

				}

				if ( colorFA ) {

					colorFA.set( meshOutputGroup.colors, colorFAOffset );
					colorFAOffset += meshOutputGroup.colors.length;

				}

				if ( normalFA ) {

					normalFA.set( meshOutputGroup.normals, normalFAOffset );
					normalFAOffset += meshOutputGroup.normals.length;

				}
				if ( uvFA ) {

					uvFA.set( meshOutputGroup.uvs, uvFAOffset );
					uvFAOffset += meshOutputGroup.uvs.length;

				}

				if ( this.logger.isDebug() ) {
					var materialIndexLine = THREE.LoaderSupport.Validator.isValid( selectedMaterialIndex ) ? '\n\t\tmaterialIndex: ' + selectedMaterialIndex : '';
					var createdReport = '\tOutput Object no.: ' + this.outputObjectCount +
						'\n\t\tgroupName: ' + meshOutputGroup.groupName +
						'\n\t\tIndex: ' + meshOutputGroup.index +
						'\n\t\tfaceType: ' + this.rawMesh.faceType +
						'\n\t\tmaterialName: ' + meshOutputGroup.materialName +
						'\n\t\tsmoothingGroup: ' + meshOutputGroup.smoothingGroup +
						materialIndexLine +
						'\n\t\tobjectName: ' + meshOutputGroup.objectName +
						'\n\t\t#vertices: ' + meshOutputGroup.vertices.length / 3 +
						'\n\t\t#indices: ' + meshOutputGroup.indices.length +
						'\n\t\t#colors: ' + meshOutputGroup.colors.length / 3 +
						'\n\t\t#uvs: ' + meshOutputGroup.uvs.length / 2 +
						'\n\t\t#normals: ' + meshOutputGroup.normals.length / 3;
					this.logger.logDebug( createdReport );
				}

			}

			this.outputObjectCount++;
			this.callbackBuilder(
				{
					cmd: 'meshData',
					progress: {
						numericalValue: this.globalCounts.currentByte / this.globalCounts.totalBytes
					},
					params: {
						meshName: result.name
					},
					materials: {
						multiMaterial: createMultiMaterial,
						materialNames: materialNames,
						materialGroups: materialGroups
					},
					buffers: {
						vertices: vertexFA,
						indices: indexUA,
						colors: colorFA,
						normals: normalFA,
						uvs: uvFA
					},
					// 0: mesh, 1: line, 2: point
					geometryType: this.rawMesh.faceType < 4 ? 0 : ( this.rawMesh.faceType === 4 ) ? 1 : 2
				},
				[ vertexFA.buffer ],
				THREE.LoaderSupport.Validator.isValid( indexUA ) ? [ indexUA.buffer ] : null,
				THREE.LoaderSupport.Validator.isValid( colorFA ) ? [ colorFA.buffer ] : null,
				THREE.LoaderSupport.Validator.isValid( normalFA ) ? [ normalFA.buffer ] : null,
				THREE.LoaderSupport.Validator.isValid( uvFA ) ? [ uvFA.buffer ] : null
			);
		};

		Parser.prototype.finalizeParsing = function () {
			this.logger.logInfo( 'Global output object count: ' + this.outputObjectCount );
			if ( this.processCompletedMesh() && this.logger.isEnabled() ) {

				var parserFinalReport = 'Overall counts: ' +
					'\n\tVertices: ' + this.globalCounts.vertices +
					'\n\tFaces: ' + this.globalCounts.faces +
					'\n\tMultiple definitions: ' + this.globalCounts.doubleIndicesCount;
				this.logger.logInfo( parserFinalReport );

			}
		};

		return Parser;
	})();

	/**
	 * Utility method for loading an mtl file according resource description. Provide url or content.
	 * @memberOf THREE.OBJLoader2
	 *
	 * @param {string} url URL to the file
	 * @param {Object} content The file content as arraybuffer or text
	 * @param {function} callbackOnLoad Callback to be called after successful load
	 * @param {string} [crossOrigin] CORS value
 	 * @param {Object} [materialOptions] Set material loading options for MTLLoader
	 */
	OBJLoader2.prototype.loadMtl = function ( url, content, callbackOnLoad, crossOrigin, materialOptions ) {
		var resource = new THREE.LoaderSupport.ResourceDescriptor( url, 'MTL' );
		resource.setContent( content );
		this._loadMtl( resource, callbackOnLoad, crossOrigin, materialOptions );
	};


	OBJLoader2.prototype._loadMtl = function ( resource, callbackOnLoad, crossOrigin, materialOptions ) {
		if ( THREE.MTLLoader === undefined ) console.error( '"THREE.MTLLoader" is not available. "THREE.OBJLoader2" requires it for loading MTL files.' );
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
			callbackOnLoad( materials, materialCreator );
		};

		var mtlLoader = new THREE.MTLLoader( this.manager );
		crossOrigin = Validator.verifyInput( crossOrigin, 'anonymous' );
		mtlLoader.setCrossOrigin( crossOrigin );
		if ( Validator.isValid( materialOptions ) ) mtlLoader.setMaterialOptions( materialOptions );

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
					scope.logger.logError( output, event instanceof ProgressEvent ? [ 'Status: ' + event.currentTarget.statusText ] : null );
					throw output;
				};

				mtlLoader.load( resource.name, processMaterials, undefined, onError );

			}
		}
	};

	return OBJLoader2;
})();
