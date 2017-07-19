/**
  * @author Kai Salmen / https://kaisalmen.de
  * Development repository: https://github.com/kaisalmen/WWOBJLoader
  */

'use strict';

if ( THREE.OBJLoader2 === undefined ) { THREE.OBJLoader2 = {} }

/**
 * Use this class to load OBJ data from files or to parse OBJ data from arraybuffer or text
 * @class
 *
 * @param {THREE.DefaultLoadingManager} [manager] The loadingManager for the loader to use. Default is {@link THREE.DefaultLoadingManager}
 */
THREE.OBJLoader2 = (function () {

	var OBJLOADER2_VERSION = '1.3.1';

	function OBJLoader2( manager ) {
		console.log( "Using THREE.OBJLoader2 version: " + OBJLOADER2_VERSION );
		this.manager = Validator.verifyInput( manager, THREE.DefaultLoadingManager );

		this.path = '';
		this.fileLoader = new THREE.FileLoader( this.manager );

		this.meshCreator = new MeshCreator();
		this.parser = new Parser( this.meshCreator );

		this.validated = false;
	}

	/**
	 * Base path to use.
	 * @memberOf THREE.OBJLoader2
	 *
	 * @param {string} path The basepath
	 */
	OBJLoader2.prototype.setPath = function ( path ) {
		this.path = Validator.verifyInput( path, this.path );
	};

	/**
	 * Set the node where the loaded objects will be attached.
	 * @memberOf THREE.OBJLoader2
	 *
	 * @param {THREE.Object3D} sceneGraphBaseNode Scenegraph object where meshes will be attached
	 */
	OBJLoader2.prototype.setSceneGraphBaseNode = function ( sceneGraphBaseNode ) {
		this.meshCreator.setSceneGraphBaseNode( sceneGraphBaseNode );
	};

	/**
	 * Set materials loaded by MTLLoader or any other supplier of an Array of {@link THREE.Material}.
	 * @memberOf THREE.OBJLoader2
	 *
	 * @param {THREE.Material[]} materials  Array of {@link THREE.Material} from MTLLoader
	 */
	OBJLoader2.prototype.setMaterials = function ( materials ) {
		this.meshCreator.setMaterials( materials );
	};

	/**
	 * Allows to set debug mode for the parser and the meshCreator.
	 * @memberOf THREE.OBJLoader2
	 *
	 * @param {boolean} parserDebug Internal Parser will produce debug output
	 * @param {boolean} meshCreatorDebug Internal MeshCreator will produce debug output
	 */
	OBJLoader2.prototype.setDebug = function ( parserDebug, meshCreatorDebug ) {
		this.parser.setDebug( parserDebug );
		this.meshCreator.setDebug( meshCreatorDebug );
	};

	/**
	 * Use this convenient method to load an OBJ file at the given URL. Per default the fileLoader uses an arraybuffer
	 * @memberOf THREE.OBJLoader2
	 *
	 * @param {string} url URL of the file to load
	 * @param {callback} onLoad Called after loading was successfully completed
	 * @param {callback} onProgress Called to report progress of loading. The argument will be the XMLHttpRequest instance, which contains {integer total} and {integer loaded} bytes.
	 * @param {callback} onError Called after an error occurred during loading
	 * @param {boolean} [useArrayBuffer=true] Set this to false to force string based parsing
	 */
	OBJLoader2.prototype.load = function ( url, onLoad, onProgress, onError, useArrayBuffer ) {
		this._validate();
		this.fileLoader.setPath( this.path );
		this.fileLoader.setResponseType( useArrayBuffer !== false ? 'arraybuffer' : 'text' );

		var scope = this;
		scope.fileLoader.load( url, function ( content ) {

			// only use parseText if useArrayBuffer is explicitly set to false
			onLoad( useArrayBuffer !== false ? scope.parse( content ) : scope.parseText( content ) );

		}, onProgress, onError );
	};

	/**
	 * Default parse function: Parses OBJ file content stored in arrayBuffer and returns the sceneGraphBaseNode
	 * @memberOf THREE.OBJLoader2
	 *
	 * @param {Uint8Array} arrayBuffer OBJ data as Uint8Array
	 */
	OBJLoader2.prototype.parse = function ( arrayBuffer ) {
		// fast-fail on bad type
		if ( ! ( arrayBuffer instanceof ArrayBuffer || arrayBuffer instanceof Uint8Array ) ) {

			throw 'Provided input is not of type arraybuffer! Aborting...';

		}
		console.log( 'Parsing arrayBuffer...' );
		console.time( 'parseArrayBuffer' );

		this._validate();
		this.parser.parseArrayBuffer( arrayBuffer );
		var sceneGraphAttach = this._finalize();

		console.timeEnd( 'parseArrayBuffer' );

		return sceneGraphAttach;
	};

	/**
	 * Legacy parse function: Parses OBJ file content stored in string and returns the sceneGraphBaseNode
	 * @memberOf THREE.OBJLoader2
	 *
	 * @param {string} text OBJ data as string
	 */
	OBJLoader2.prototype.parseText = function ( text ) {
		// fast-fail on bad type
		if ( ! ( typeof( text ) === 'string' || text instanceof String ) ) {

			throw 'Provided input is not of type String! Aborting...';

		}
		console.log( 'Parsing text...' );
		console.time( 'parseText' );

		this._validate();
		this.parser.parseText( text );
		var sceneGraphBaseNode = this._finalize();

		console.timeEnd( 'parseText' );

		return sceneGraphBaseNode;
	};

	OBJLoader2.prototype._validate = function () {
		if ( this.validated ) return;

		this.fileLoader = Validator.verifyInput( this.fileLoader, new THREE.FileLoader( this.manager ) );
		this.parser.validate();
		this.meshCreator.validate();

		this.validated = true;
	};

	OBJLoader2.prototype._finalize = function () {
		console.log( 'Global output object count: ' + this.meshCreator.globalObjectCount );

		this.parser.finalize();
		this.fileLoader = null;
		var sceneGraphBaseNode = this.meshCreator.sceneGraphBaseNode;
		this.meshCreator.finalize();
		this.validated = false;

		return sceneGraphBaseNode;
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
		LINE_USEMTL: 'usemtl',
		/*
		 * Build Face/Quad: first element in indexArray is the line identification, therefore offset of one needs to be taken into account
		 * N-Gons are not supported
		 * Quad Faces: FaceA: 0, 1, 2  FaceB: 2, 3, 0
		 *
		 * 0: "f vertex/uv/normal	vertex/uv/normal	vertex/uv/normal	(vertex/uv/normal)"
		 * 1: "f vertex/uv		  	vertex/uv		   	vertex/uv		   	(vertex/uv		 )"
		 * 2: "f vertex//normal	 	vertex//normal	  	vertex//normal	  	(vertex//normal  )"
		 * 3: "f vertex			 	vertex			  	vertex			  	(vertex		  	 )"
		 *
		 * @param indexArray
		 * @param faceType
		 */
		QUAD_INDICES_1: [ 1, 2, 3, 3, 4, 1 ],
		QUAD_INDICES_2: [ 1, 3, 5, 5, 7, 1 ],
		QUAD_INDICES_3: [ 1, 4, 7, 7, 10, 1 ]
	};

	var Validator = {
		/**
		 * If given input is null or undefined, false is returned otherwise true.
		 *
		 * @param input Anything
		 * @returns {boolean}
		 */
		isValid: function( input ) {
			return ( input !== null && input !== undefined );
		},
		/**
		 * If given input is null or undefined, the defaultValue is returned otherwise the given input.
		 *
		 * @param input Anything
		 * @param defaultValue Anything
		 * @returns {*}
		 */
		verifyInput: function( input, defaultValue ) {
			return ( input === null || input === undefined ) ? defaultValue : input;
		}
	};

	OBJLoader2.prototype._getValidator = function () {
		return Validator;
	};

	/**
	 * Parse OBJ data either from ArrayBuffer or string
	 * @class
	 */
	var Parser = (function () {

		function Parser( meshCreator ) {
			this.meshCreator = meshCreator;
			this.rawObject = null;
			this.inputObjectCount = 1;
			this.debug = false;
		}

		Parser.prototype.setDebug = function ( debug ) {
			if ( debug === true || debug === false ) this.debug = debug;
		};

		Parser.prototype.validate = function () {
			this.rawObject = new RawObject();
			this.inputObjectCount = 1;
		};

		/**
		 * Parse the provided arraybuffer
		 * @memberOf Parser
		 *
		 * @param {Uint8Array} arrayBuffer OBJ data as Uint8Array
		 */
		Parser.prototype.parseArrayBuffer = function ( arrayBuffer ) {
			var arrayBufferView = new Uint8Array( arrayBuffer );
			var length = arrayBufferView.byteLength;
			var buffer = new Array( 32 );
			var bufferPointer = 0;
			var slashes = new Array( 32 );
			var slashesPointer = 0;
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
						slashes[ slashesPointer++ ] = i;
						if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
						word = '';
						break;

					case Consts.CODE_LF:
						if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
						word = '';
						reachedFaces = this.processLine( buffer, bufferPointer, slashes, slashesPointer, reachedFaces );
						slashesPointer = 0;
						bufferPointer = 0;
						break;

					case Consts.CODE_CR:
						break;

					default:
						word += String.fromCharCode( code );
						break;
				}
			}
		};

		/**
		 * Parse the provided text
		 * @memberOf Parser
		 *
		 * @param {string} text OBJ data as string
		 */
		Parser.prototype.parseText = function ( text ) {
			var length = text.length;
			var buffer = new Array( 32 );
			var bufferPointer = 0;
			var slashes = new Array( 32 );
			var slashesPointer = 0;
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
						slashes[ slashesPointer++ ] = i;
						if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
						word = '';
						break;

					case Consts.STRING_LF:
						if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
						word = '';
						reachedFaces = this.processLine( buffer, bufferPointer, slashes, slashesPointer, reachedFaces );
						slashesPointer = 0;
						bufferPointer = 0;
						break;

					case Consts.STRING_CR:
						break;

					default:
						word += char;
				}
			}
		};

		Parser.prototype.processLine = function ( buffer, bufferPointer, slashes, slashesPointer, reachedFaces ) {
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
					/*
					 * 0: "f vertex/uv/normal ..."
					 * 1: "f vertex/uv ..."
					 * 2: "f vertex//normal ..."
					 * 3: "f vertex ..."
					 */
					var haveQuad = bufferLength % 4 === 0;
					if ( slashesPointer > 1 && ( slashes[ 1 ] - slashes[ 0 ] ) === 1 ) {

						if ( haveQuad ) {
							this.rawObject.buildQuadVVn( buffer );
						} else {
							this.rawObject.buildFaceVVn( buffer );
						}

					} else if ( bufferLength === slashesPointer * 2 ) {

						if ( haveQuad ) {
							this.rawObject.buildQuadVVt( buffer );
						} else {
							this.rawObject.buildFaceVVt( buffer );
						}

					} else if ( bufferLength * 2 === slashesPointer * 3 ) {

						if ( haveQuad ) {
							this.rawObject.buildQuadVVtVn( buffer );
						} else {
							this.rawObject.buildFaceVVtVn( buffer );
						}

					} else {

						if ( haveQuad ) {
							this.rawObject.buildQuadV( buffer );
						} else {
							this.rawObject.buildFaceV( buffer );
						}

					}
					break;

				case Consts.LINE_L:
					if ( bufferLength === slashesPointer * 2 ) {

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
			this.rawObject.finalize( this.meshCreator, this.inputObjectCount, this.debug );
			this.inputObjectCount++;
			this.rawObject = this.rawObject.newInstanceFromObject( objectName, groupName );
		};

		Parser.prototype.processCompletedGroup = function ( groupName ) {
			var notEmpty = this.rawObject.finalize( this.meshCreator, this.inputObjectCount, this.debug );
			if ( notEmpty ) {

				this.inputObjectCount ++;
				this.rawObject = this.rawObject.newInstanceFromGroup( groupName );

			} else {

				// if a group was set that did not lead to object creation in finalize, then the group name has to be updated
				this.rawObject.pushGroup( groupName );

			}
		};

		Parser.prototype.finalize = function () {
			this.rawObject.finalize( this.meshCreator, this.inputObjectCount, this.debug );
			this.inputObjectCount++;
		};

		return Parser;
	})();

	/**
	 * {@link RawObject} is only used by {@link Parser}.
	 * The user of OBJLoader2 does not need to care about this class.
	 * It is defined publicly for inclusion in web worker based OBJ loader ({@link THREE.OBJLoader2.WWOBJLoader2})
	 */
	var RawObject = (function () {

		function RawObject( objectName, groupName, mtllibName ) {
			this.globalVertexOffset = 1;
			this.globalUvOffset = 1;
			this.globalNormalOffset = 1;

			this.vertices = [];
			this.colors = [];
			this.normals = [];
			this.uvs = [];

			// faces are stored according combined index of group, material and smoothingGroup (0 or not)
			this.mtllibName = Validator.verifyInput( mtllibName, '' );
			this.objectName = Validator.verifyInput( objectName, '' );
			this.groupName = Validator.verifyInput( groupName, '' );
			this.activeMtlName = '';
			this.activeSmoothingGroup = 1;

			this.mtlCount = 0;
			this.smoothingGroupCount = 0;

			this.rawObjectDescriptions = [];
			// this default index is required as it is possible to define faces without 'g' or 'usemtl'
			var index = this.buildIndex( this.activeMtlName, this.activeSmoothingGroup );
			this.rawObjectDescriptionInUse = new RawObjectDescription( this.objectName, this.groupName, this.activeMtlName, this.activeSmoothingGroup );
			this.rawObjectDescriptions[ index ] = this.rawObjectDescriptionInUse;
		}

		RawObject.prototype.buildIndex = function ( materialName, smoothingGroup) {
			return materialName + '|' + smoothingGroup;
		};

		RawObject.prototype.newInstanceFromObject = function ( objectName, groupName ) {
			var newRawObject = new RawObject( objectName, groupName, this.mtllibName );

			// move indices forward
			newRawObject.globalVertexOffset = this.globalVertexOffset + this.vertices.length / 3;
			newRawObject.globalUvOffset = this.globalUvOffset + this.uvs.length / 2;
			newRawObject.globalNormalOffset = this.globalNormalOffset + this.normals.length / 3;

			return newRawObject;
		};

		RawObject.prototype.newInstanceFromGroup = function ( groupName ) {
			var newRawObject = new RawObject( this.objectName, groupName, this.mtllibName );

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
			this.verifyIndex();
		};

		RawObject.prototype.pushUsemtl = function ( mtlName ) {
			if ( this.activeMtlName === mtlName || ! Validator.isValid( mtlName ) ) return;
			this.activeMtlName = mtlName;
			this.mtlCount++;

			this.verifyIndex();
		};

		RawObject.prototype.pushSmoothingGroup = function ( activeSmoothingGroup ) {
			var normalized = parseInt( activeSmoothingGroup );
			if ( isNaN( normalized ) ) {
				normalized = activeSmoothingGroup === "off" ? 0 : 1;
			}
			if ( this.activeSmoothingGroup === normalized ) return;
			this.activeSmoothingGroup = normalized;
			this.smoothingGroupCount++;

			this.verifyIndex();
		};

		RawObject.prototype.verifyIndex = function () {
			var index = this.buildIndex( this.activeMtlName, ( this.activeSmoothingGroup === 0 ) ? 0 : 1 );
			this.rawObjectDescriptionInUse = this.rawObjectDescriptions[ index ];
			if ( ! Validator.isValid( this.rawObjectDescriptionInUse ) ) {

				this.rawObjectDescriptionInUse = new RawObjectDescription( this.objectName, this.groupName, this.activeMtlName, this.activeSmoothingGroup );
				this.rawObjectDescriptions[ index ] = this.rawObjectDescriptionInUse;

			}
		};

		RawObject.prototype.buildQuadVVtVn = function ( indexArray ) {
			for ( var i = 0; i < 6; i ++ ) {
				this.attachFaceV_( indexArray[ Consts.QUAD_INDICES_3[ i ] ] );
				this.attachFaceVt( indexArray[ Consts.QUAD_INDICES_3[ i ] + 1 ] );
				this.attachFaceVn( indexArray[ Consts.QUAD_INDICES_3[ i ] + 2 ] );
			}
		};

		RawObject.prototype.buildQuadVVt = function ( indexArray ) {
			for ( var i = 0; i < 6; i ++ ) {
				this.attachFaceV_( indexArray[ Consts.QUAD_INDICES_2[ i ] ] );
				this.attachFaceVt( indexArray[ Consts.QUAD_INDICES_2[ i ] + 1 ] );
			}
		};

		RawObject.prototype.buildQuadVVn = function ( indexArray ) {
			for ( var i = 0; i < 6; i ++ ) {
				this.attachFaceV_( indexArray[ Consts.QUAD_INDICES_2[ i ] ] );
				this.attachFaceVn( indexArray[ Consts.QUAD_INDICES_2[ i ] + 1 ] );
			}
		};

		RawObject.prototype.buildQuadV = function ( indexArray ) {
			for ( var i = 0; i < 6; i ++ ) {
				this.attachFaceV_( indexArray[ Consts.QUAD_INDICES_1[ i ] ] );
			}
		};

		RawObject.prototype.buildFaceVVtVn = function ( indexArray ) {
			for ( var i = 1; i < 10; i += 3 ) {
				this.attachFaceV_( indexArray[ i ] );
				this.attachFaceVt( indexArray[ i + 1 ] );
				this.attachFaceVn( indexArray[ i + 2 ] );
			}
		};

		RawObject.prototype.buildFaceVVt = function ( indexArray ) {
			for ( var i = 1; i < 7; i += 2 ) {
				this.attachFaceV_( indexArray[ i ] );
				this.attachFaceVt( indexArray[ i + 1 ] );
			}
		};

		RawObject.prototype.buildFaceVVn = function ( indexArray ) {
			for ( var i = 1; i < 7; i += 2 ) {
				this.attachFaceV_( indexArray[ i ] );
				this.attachFaceVn( indexArray[ i + 1 ] );
			}
		};

		RawObject.prototype.buildFaceV = function ( indexArray ) {
			for ( var i = 1; i < 4; i ++ ) {
				this.attachFaceV_( indexArray[ i ] );
			}
		};

		RawObject.prototype.attachFaceV_ = function ( faceIndex ) {
			var faceIndexInt = parseInt( faceIndex );
			var index = ( faceIndexInt - this.globalVertexOffset ) * 3;

			var rodiu = this.rawObjectDescriptionInUse;
			rodiu.vertices.push( this.vertices[ index++ ] );
			rodiu.vertices.push( this.vertices[ index++ ] );
			rodiu.vertices.push( this.vertices[ index ] );

			if ( this.colors.length > 0 ) {

				index -= 2;
				rodiu.colors.push( this.colors[ index++ ] );
				rodiu.colors.push( this.colors[ index++ ] );
				rodiu.colors.push( this.colors[ index ] );

			}
		};

		RawObject.prototype.attachFaceVt = function ( faceIndex ) {
			var faceIndexInt = parseInt( faceIndex );
			var index = ( faceIndexInt - this.globalUvOffset ) * 2;

			var rodiu = this.rawObjectDescriptionInUse;
			rodiu.uvs.push( this.uvs[ index++ ] );
			rodiu.uvs.push( this.uvs[ index ] );
		};

		RawObject.prototype.attachFaceVn = function ( faceIndex ) {
			var faceIndexInt = parseInt( faceIndex );
			var index = ( faceIndexInt - this.globalNormalOffset ) * 3;

			var rodiu = this.rawObjectDescriptionInUse;
			rodiu.normals.push( this.normals[ index++ ] );
			rodiu.normals.push( this.normals[ index++ ] );
			rodiu.normals.push( this.normals[ index ] );
		};

		/*
		 * Support for lines with or without texture. irst element in indexArray is the line identification
		 * 0: "f vertex/uv		vertex/uv 		..."
		 * 1: "f vertex			vertex 			..."
		 */
		RawObject.prototype.buildLineVvt = function ( lineArray ) {
			var length = lineArray.length;
			for ( var i = 1; i < length; i ++ ) {
				this.vertices.push( parseInt( lineArray[ i ] ) );
				this.uvs.push( parseInt( lineArray[ i ] ) );
			}
		};

		RawObject.prototype.buildLineV = function ( lineArray ) {
			var length = lineArray.length;
			for ( var i = 1; i < length; i++ ) {
				this.vertices.push( parseInt( lineArray[ i ] ) );
			}
		};

		/**
		 * Clear any empty rawObjectDescription and calculate absolute vertex, normal and uv counts
		 */
		RawObject.prototype.finalize = function ( meshCreator, inputObjectCount, debug ) {
			var temp = this.rawObjectDescriptions;
			this.rawObjectDescriptions = [];
			var rawObjectDescription;
			var index = 0;
			var absoluteVertexCount = 0;
			var absoluteColorCount = 0;
			var absoluteNormalCount = 0;
			var absoluteUvCount = 0;

			for ( var name in temp ) {

				rawObjectDescription = temp[ name ];
				if ( rawObjectDescription.vertices.length > 0 ) {

					this.rawObjectDescriptions[ index++ ] = rawObjectDescription;
					absoluteVertexCount += rawObjectDescription.vertices.length;
					absoluteColorCount += rawObjectDescription.colors.length;
					absoluteUvCount += rawObjectDescription.uvs.length;
					absoluteNormalCount += rawObjectDescription.normals.length;

				}
			}

			// don not continue if no result
			var notEmpty = false;
			if ( index > 0 ) {

				if ( debug ) this.createReport( inputObjectCount, true );
				meshCreator.buildMesh(
					this.rawObjectDescriptions,
					inputObjectCount,
					absoluteVertexCount,
					absoluteColorCount,
					absoluteNormalCount,
					absoluteUvCount
				);
				notEmpty = true;

			}
			return notEmpty;
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
				console.log( 'Input Object number: ' + inputObjectCount + ' Object name: ' + report.name );
				console.log( 'Mtllib name: ' + report.mtllibName );
				console.log( 'Vertex count: ' + report.vertexCount );
				console.log( 'Normal count: ' + report.normalCount );
				console.log( 'UV count: ' + report.uvCount );
				console.log( 'SmoothingGroup count: ' + report.smoothingGroupCount );
				console.log( 'Material count: ' + report.mtlCount );
				console.log( 'Real RawObjectDescription count: ' + report.rawObjectDescriptions );
				console.log( '' );
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
			this.colors = [];
			this.uvs = [];
			this.normals = [];
		}

		return RawObjectDescription;
	})();

	/**
	 * MeshCreator is used to transform RawObjectDescriptions to THREE.Mesh
	 *
	 * @class
	 */
	var MeshCreator = (function () {

		function MeshCreator() {
			this.sceneGraphBaseNode = null;
			this.materials = null;
			this.debug = false;
			this.globalObjectCount = 1;

			this.validated = false;
		}

		MeshCreator.prototype.setSceneGraphBaseNode = function ( sceneGraphBaseNode ) {
			this.sceneGraphBaseNode = Validator.verifyInput( sceneGraphBaseNode, this.sceneGraphBaseNode );
			this.sceneGraphBaseNode = Validator.verifyInput( this.sceneGraphBaseNode, new THREE.Group() );
		};

		MeshCreator.prototype.setMaterials = function ( materials ) {
			this.materials = Validator.verifyInput( materials, this.materials );
			this.materials = Validator.verifyInput( this.materials, { materials: [] } );

			var defaultMaterial = this.materials[ 'defaultMaterial' ];
			if ( ! defaultMaterial ) {

				defaultMaterial = new THREE.MeshStandardMaterial( { color: 0xDCF1FF } );
				defaultMaterial.name = 'defaultMaterial';
				this.materials[ 'defaultMaterial' ] = defaultMaterial;

			}
			var vertexColorMaterial = this.materials[ 'vertexColorMaterial' ];
			if ( ! vertexColorMaterial ) {

				vertexColorMaterial = new THREE.MeshBasicMaterial( { color: 0xDCF1FF } );
				vertexColorMaterial.name = 'vertexColorMaterial';
				vertexColorMaterial.vertexColors = THREE.VertexColors;
				this.materials[ 'vertexColorMaterial' ] = vertexColorMaterial;

			}
		};

		MeshCreator.prototype.setDebug = function ( debug ) {
			if ( debug === true || debug === false ) this.debug = debug;
		};

		MeshCreator.prototype.validate = function () {
			if ( this.validated ) return;

			this.setSceneGraphBaseNode( null );
			this.setMaterials( null );
			this.setDebug( null );
			this.globalObjectCount = 1;
		};

		MeshCreator.prototype.finalize = function () {
			this.sceneGraphBaseNode = null;
			this.materials = null;
			this.validated = false;
		};

		/**
		 * This is an internal function, but due to its importance to Parser it is documented.
		 * RawObjectDescriptions are transformed to THREE.Mesh.
		 * It is ensured that rawObjectDescriptions only contain objects with vertices (no need to check).
		 * This method shall be overridden by the web worker implementation
		 *
		 * @param {RawObjectDescription[]} rawObjectDescriptions Array of descriptive information and data (vertices, normals, uvs) about the parsed object(s)
		 * @param {number} inputObjectCount Number of objects already retrieved from OBJ
		 * @param {number} absoluteVertexCount Sum of all vertices of all rawObjectDescriptions
		 * @param {number} absoluteColorCount Sum of all vertex colors of all rawObjectDescriptions
		 * @param {number} absoluteNormalCount Sum of all normals of all rawObjectDescriptions
		 * @param {number} absoluteUvCount Sum of all uvs of all rawObjectDescriptions
		 */
		MeshCreator.prototype.buildMesh = function ( rawObjectDescriptions, inputObjectCount, absoluteVertexCount,
													 absoluteColorCount, absoluteNormalCount, absoluteUvCount ) {

			if ( this.debug ) console.log( 'MeshCreator.buildRawMeshData:\nInput object no.: ' + inputObjectCount );

			var bufferGeometry = new THREE.BufferGeometry();
			var vertexBA = new THREE.BufferAttribute( new Float32Array( absoluteVertexCount ), 3 );
			bufferGeometry.addAttribute( 'position', vertexBA );

			var colorBA;
			if ( absoluteColorCount > 0 ) {

				colorBA = new THREE.BufferAttribute( new Float32Array( absoluteColorCount ), 3 );
				bufferGeometry.addAttribute( 'color', colorBA );

			}

			var normalBA;
			if ( absoluteNormalCount > 0 ) {

				normalBA = new THREE.BufferAttribute( new Float32Array( absoluteNormalCount ), 3 );
				bufferGeometry.addAttribute( 'normal', normalBA );

			}
			var uvBA;
			if ( absoluteUvCount > 0 ) {

				uvBA = new THREE.BufferAttribute( new Float32Array( absoluteUvCount ), 2 );
				bufferGeometry.addAttribute( 'uv', uvBA );

			}

			var rawObjectDescription;
			var material;
			var materialName;
			var createMultiMaterial = rawObjectDescriptions.length > 1;
			var materials = [];
			var materialIndex = 0;
			var materialIndexMapping = [];
			var selectedMaterialIndex;

			var vertexBAOffset = 0;
			var vertexGroupOffset = 0;
			var vertexLength;
			var colorBAOffset = 0;
			var normalBAOffset = 0;
			var uvBAOffset = 0;

			if ( this.debug ) {
				console.log( createMultiMaterial ? 'Creating Multi-Material' : 'Creating Material' + ' for object no.: ' + this.globalObjectCount );
			}

			for ( var oodIndex in rawObjectDescriptions ) {
				rawObjectDescription = rawObjectDescriptions[ oodIndex ];

				materialName = rawObjectDescription.materialName;
				material = colorBA ? this.materials[ 'vertexColorMaterial' ] : this.materials[ materialName ];
				if ( ! material ) {

					material = this.materials[ 'defaultMaterial' ];
					if ( ! material ) console.warn( 'object_group "' + rawObjectDescription.objectName + '_' + rawObjectDescription.groupName +
													'" was defined without material! Assigning "defaultMaterial".' );

				}
				// clone material in case flat shading is needed due to smoothingGroup 0
				if ( rawObjectDescription.smoothingGroup === 0 ) {

					materialName = material.name + '_flat';
					var materialClone = this.materials[ materialName ];
					if ( ! materialClone ) {

						materialClone = material.clone();
						materialClone.name = materialName;
						materialClone.flatShading = true;
						this.materials[ materialName ] = name;

					}

				}

				vertexLength = rawObjectDescription.vertices.length;
				if ( createMultiMaterial ) {

					// re-use material if already used before. Reduces materials array size and eliminates duplicates
					selectedMaterialIndex = materialIndexMapping[ materialName ];
					if ( ! selectedMaterialIndex ) {

						selectedMaterialIndex = materialIndex;
						materialIndexMapping[ materialName ] = materialIndex;
						materials.push( material );
						materialIndex++;

					}

					bufferGeometry.addGroup( vertexGroupOffset, vertexLength / 3, selectedMaterialIndex );
					vertexGroupOffset += vertexLength / 3;
				}

				vertexBA.set( rawObjectDescription.vertices, vertexBAOffset );
				vertexBAOffset += vertexLength;

				if ( colorBA ) {

					colorBA.set( rawObjectDescription.colors, colorBAOffset );
					colorBAOffset += rawObjectDescription.colors.length;

				}

				if ( normalBA ) {

					normalBA.set( rawObjectDescription.normals, normalBAOffset );
					normalBAOffset += rawObjectDescription.normals.length;

				}
				if ( uvBA ) {

					uvBA.set( rawObjectDescription.uvs, uvBAOffset );
					uvBAOffset += rawObjectDescription.uvs.length;

				}
				if ( this.debug ) this.printReport( rawObjectDescription, selectedMaterialIndex );

			}
			if ( ! normalBA ) bufferGeometry.computeVertexNormals();

			if ( createMultiMaterial ) material = materials;
			var mesh = new THREE.Mesh( bufferGeometry, material );
			mesh.name = rawObjectDescription.groupName !== '' ? rawObjectDescription.groupName : rawObjectDescription.objectName;
			this.sceneGraphBaseNode.add( mesh );

			this.globalObjectCount++;
		};

		MeshCreator.prototype.printReport = function ( rawObjectDescription, selectedMaterialIndex ) {
			var materialIndexLine = Validator.isValid( selectedMaterialIndex ) ? '\n materialIndex: ' + selectedMaterialIndex : '';
			console.log(
				' Output Object no.: ' + this.globalObjectCount +
				'\n objectName: ' + rawObjectDescription.objectName +
				'\n groupName: ' + rawObjectDescription.groupName +
				'\n materialName: ' + rawObjectDescription.materialName +
				materialIndexLine +
				'\n smoothingGroup: ' + rawObjectDescription.smoothingGroup +
				'\n #vertices: ' + rawObjectDescription.vertices.length / 3 +
				'\n #colors: ' + rawObjectDescription.colors.length / 3 +
				'\n #uvs: ' + rawObjectDescription.uvs.length / 2 +
				'\n #normals: ' + rawObjectDescription.normals.length / 3
			);
		};

		return MeshCreator;
	})();

	OBJLoader2.prototype._buildWebWorkerCode = function ( funcBuildObject, funcBuildSingelton ) {
		var workerCode = '';
		workerCode += funcBuildObject( 'Consts', Consts );
		workerCode += funcBuildObject( 'Validator', Validator );
		workerCode += funcBuildSingelton( 'Parser', 'Parser', Parser );
		workerCode += funcBuildSingelton( 'RawObject', 'RawObject', RawObject );
		workerCode += funcBuildSingelton( 'RawObjectDescription', 'RawObjectDescription', RawObjectDescription );
		return workerCode;
	};

	return OBJLoader2;
})();
