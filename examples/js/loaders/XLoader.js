/**
 * @author adrs2002 / https://github.com/adrs2002
 */


( function ( global, factory ) {

	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
		typeof define === 'function' && define.amd ? define( factory ) :
			( global.THREE = global.THREE || {}, global.THREE.XLoader = factory() );

}( this, ( function () {

	'use strict';

	var classCallCheck = function ( instance, Constructor ) {

		if ( ! ( instance instanceof Constructor ) ) {

			throw new TypeError( "Cannot call a class as a function" );

		}

	};

	var createClass = function () {

		function defineProperties( target, props ) {

			for ( var i = 0; i < props.length; i ++ ) {

				var descriptor = props[ i ];
				descriptor.enumerable = descriptor.enumerable || false;
				descriptor.configurable = true;
				if ( "value" in descriptor ) descriptor.writable = true;
				Object.defineProperty( target, descriptor.key, descriptor );

			}

		}

		return function ( Constructor, protoProps, staticProps ) {

			if ( protoProps ) defineProperties( Constructor.prototype, protoProps );
			if ( staticProps ) defineProperties( Constructor, staticProps );
			return Constructor;

		};

	}();

	var XboneInf = function XboneInf() {

		classCallCheck( this, XboneInf );

		this.boneName = "";
		this.BoneIndex = 0;
		this.Indeces = [];
		this.Weights = [];
		this.initMatrix = null;
		this.OffsetMatrix = null;

	};

	var XAnimationInfo = function XAnimationInfo() {

		classCallCheck( this, XAnimationInfo );

		this.animeName = "";
		this.boneName = "";
		this.targetBone = null;
		this.keyType = 4;
		this.frameStartLv = 0;
		this.keyFrames = [];
		this.InverseMx = null;

	};

	var XAnimationObj = function () {

		function XAnimationObj( _flags ) {

			classCallCheck( this, XAnimationObj );

			this.fps = 30;
			this.name = 'xanimation';
			this.length = 0;
			this.hierarchy = [];
			this.putFlags = _flags;
			if ( this.putFlags.putPos === undefined ) {

				this.putFlags.putPos = true;

			}
			if ( this.putFlags.putRot === undefined ) {

				this.putFlags.putRot = true;

			}
			if ( this.putFlags.putScl === undefined ) {

				this.putFlags.putScl = true;

			}

		}

		createClass( XAnimationObj, [ {
			key: "make",
			value: function make( XAnimationInfoArray ) {

				for ( var i = 0; i < XAnimationInfoArray.length; i ++ ) {

					this.hierarchy.push( this.makeBonekeys( XAnimationInfoArray[ i ] ) );

				}
				this.length = this.hierarchy[ 0 ].keys[ this.hierarchy[ 0 ].keys.length - 1 ].time;

			}
		}, {
			key: "clone",
			value: function clone() {

				return Object.assign( {}, this );

			}
		}, {
			key: "makeBonekeys",
			value: function makeBonekeys( XAnimationInfo ) {

				var refObj = {};
				refObj.name = XAnimationInfo.boneName;
				refObj.parent = "";
				refObj.keys = this.keyFrameRefactor( XAnimationInfo );
				refObj.copy = function () {

					return Object.assign( {}, this );

				};
				return refObj;

			}
		}, {
			key: "keyFrameRefactor",
			value: function keyFrameRefactor( XAnimationInfo ) {

				var keys = [];
				for ( var i = 0; i < XAnimationInfo.keyFrames.length; i ++ ) {

					var keyframe = {};
					keyframe.time = XAnimationInfo.keyFrames[ i ].time * this.fps;
					if ( XAnimationInfo.keyFrames[ i ].pos && this.putFlags.putPos ) {

						keyframe.pos = XAnimationInfo.keyFrames[ i ].pos;

					}
					if ( XAnimationInfo.keyFrames[ i ].rot && this.putFlags.putRot ) {

						keyframe.rot = XAnimationInfo.keyFrames[ i ].rot;

					}
					if ( XAnimationInfo.keyFrames[ i ].scl && this.putFlags.putScl ) {

						keyframe.scl = XAnimationInfo.keyFrames[ i ].scl;

					}
					if ( XAnimationInfo.keyFrames[ i ].matrix ) {

						keyframe.matrix = XAnimationInfo.keyFrames[ i ].matrix;
						if ( this.putFlags.putPos ) {

							keyframe.pos = new THREE.Vector3().setFromMatrixPosition( keyframe.matrix );

						}
						if ( this.putFlags.putRot ) {

							keyframe.rot = new THREE.Quaternion().setFromRotationMatrix( keyframe.matrix );

						}
						if ( this.putFlags.putScl ) {

							keyframe.scl = new THREE.Vector3().setFromMatrixScale( keyframe.matrix );

						}

					}
					keys.push( keyframe );

				}
				return keys;

			}
		} ] );
		return XAnimationObj;

	}();

	var XKeyFrameInfo = function XKeyFrameInfo() {

		classCallCheck( this, XKeyFrameInfo );

		this.index = 0;
		this.Frame = 0;
		this.time = 0.0;
		this.matrix = null;

	};

	var XLoader = function () {

		function XLoader( manager ) {

			classCallCheck( this, XLoader );

			this.debug = false;
			this.manager = manager !== undefined ? manager : new THREE.DefaultLoadingManager();
			this.texloader = new THREE.TextureLoader( this.manager );
			this.url = "";
			this.baseDir = "";
			this._putMatLength = 0;
			this._nowMat = null;
			this._tmpUvArray = [];
			this._facesNormal = [];
			this._nowFrameName = "";
			this.frameHierarchie = [];
			this.Hierarchies = {};
			this.HieStack = [];
			this._currentObject = {};
			this._currentFrame = {};
			this._data = null;
			this.onLoad = null;
			this.IsUvYReverse = true;
			this.Meshes = [];
			this.animations = [];
			this.animTicksPerSecond = 30;
			this._currentGeo = null;
			this._currentAnime = null;
			this._currentAnimeFrames = null;

		}

		createClass( XLoader, [ {
			key: '_setArgOption',
			value: function _setArgOption( _arg ) {

				var _start = arguments.length > 1 && arguments[ 1 ] !== undefined ? arguments[ 1 ] : 0;

				if ( ! _arg ) {

					return;

				}
				for ( var i = _start; i < _arg.length; i ++ ) {

					switch ( i ) {

						case 0:
							this.url = _arg[ i ];
							break;
						case 1:
							this.options = _arg[ i ];
							break;

					}

				}
				if ( this.options === undefined ) {

					this.options = {};

				}

			}
		}, {
			key: 'load',
			value: function load( _arg, onLoad, onProgress, onError ) {

				var _this = this;

				this._setArgOption( _arg );
				var loader = new THREE.FileLoader( this.manager );
				loader.setResponseType( 'arraybuffer' );
				loader.load( this.url, function ( response ) {

					_this._parse( response, onLoad );

				}, onProgress, onError );

			}
		}, {
			key: 'fromResponsedData',
			value: function fromResponsedData( _data, _arg, onLoad ) {

				this._setArgOption( _arg );
				this._parse( _data, onLoad );

			}
		}, {
			key: '_readLine',
			value: function _readLine( line ) {

				var readed = 0;
				while ( true ) {

					var find = - 1;
					find = line.indexOf( '//', readed );
					if ( find === - 1 ) {

						find = line.indexOf( '#', readed );

					}
					if ( find > - 1 && find < 2 ) {

						var foundNewLine = - 1;
						foundNewLine = line.indexOf( "\r\n", readed );
						if ( foundNewLine > 0 ) {

							readed = foundNewLine + 2;

						} else {

							foundNewLine = line.indexOf( "\r", readed );
							if ( foundNewLine > 0 ) {

								readed = foundNewLine + 1;

							} else {

								readed = line.indexOf( "\n", readed ) + 1;

							}

						}

					} else {

						break;

					}

				}
				return line.substr( readed );

			}
		}, {
			key: '_readLine',
			value: function _readLine( line ) {

				var readed = 0;
				while ( true ) {

					var find = - 1;
					find = line.indexOf( '//', readed );
					if ( find === - 1 ) {

						find = line.indexOf( '#', readed );

					}
					if ( find > - 1 && find < 2 ) {

						var foundNewLine = - 1;
						foundNewLine = line.indexOf( "\r\n", readed );
						if ( foundNewLine > 0 ) {

							readed = foundNewLine + 2;

						} else {

							foundNewLine = line.indexOf( "\r", readed );
							if ( foundNewLine > 0 ) {

								readed = foundNewLine + 1;

							} else {

								readed = line.indexOf( "\n", readed ) + 1;

							}

						}

					} else {

						break;

					}

				}
				return line.substr( readed );

			}
		}, {
			key: '_isBinary',
			value: function _isBinary( binData ) {

				var reader = new DataView( binData );
				var face_size = 32 / 8 * 3 + 32 / 8 * 3 * 3 + 16 / 8;
				var n_faces = reader.getUint32( 80, true );
				var expect = 80 + 32 / 8 + n_faces * face_size;
				if ( expect === reader.byteLength ) {

					return true;

				}
				var fileLength = reader.byteLength;
				for ( var index = 0; index < fileLength; index ++ ) {

					if ( reader.getUint8( index, false ) > 127 ) {

						return true;

					}

				}
				return false;

			}
		}, {
			key: 'ensureBinary',
			value: function ensureBinary( buf ) {

				if ( typeof buf === "string" ) {

					var array_buffer = new Uint8Array( buf.length );
					for ( var i = 0; i < buf.length; i ++ ) {

						array_buffer[ i ] = buf.charCodeAt( i ) & 0xff;

					}
					return array_buffer.buffer || array_buffer;

				} else {

					return buf;

				}

			}
		}, {
			key: 'ensureString',
			value: function ensureString( buf ) {

				if ( typeof buf !== "string" ) {

					return THREE.LoaderUtils.decodeText( new Uint8Array( buf ) );

				} else {

					return buf;

				}

			}
		}, {
			key: '_parse',
			value: function _parse( data, onLoad ) {

				var binData = this.ensureBinary( data );
				this._data = this.ensureString( data );
				this.onLoad = onLoad;
				return this._isBinary( binData ) ? this._parseBinary( binData ) : this._parseASCII();

			}
		}, {
			key: '_parseBinary',
			value: function _parseBinary( data ) {

				return this._parseASCII( THREE.LoaderUtils.decodeText( new Uint8Array( data ) ) );

			}
		}, {
			key: '_parseASCII',
			value: function _parseASCII() {

				if ( this.url.lastIndexOf( "/" ) > 0 ) {

					this.baseDir = this.url.substr( 0, this.url.lastIndexOf( "/" ) + 1 );

				}
				var endRead = 16;
				this.Hierarchies.children = [];
				this._hierarchieParse( this.Hierarchies, endRead );
				this._changeRoot();
				this._currentObject = this.Hierarchies.children.shift();
				this.mainloop();

			}
		}, {
			key: '_hierarchieParse',
			value: function _hierarchieParse( _parent, _end ) {

				var endRead = _end;
				while ( true ) {

					var find1 = this._data.indexOf( '{', endRead ) + 1;
					var findEnd = this._data.indexOf( '}', endRead );
					var findNext = this._data.indexOf( '{', find1 ) + 1;
					if ( find1 > 0 && findEnd > find1 ) {

						var _currentObject = {};
						_currentObject.children = [];
						var nameData = this._readLine( this._data.substr( endRead, find1 - endRead - 1 ) ).trim();
						var word = nameData.split( / /g );
						if ( word.length > 0 ) {

							_currentObject.type = word[ 0 ];
							if ( word.length >= 2 ) {

								_currentObject.name = word[ 1 ];

							} else {

								_currentObject.name = word[ 0 ] + this.Hierarchies.children.length;

							}

						} else {

							_currentObject.name = nameData;
							_currentObject.type = "";

						}
						if ( _currentObject.type === "Animation" ) {

							_currentObject.data = this._data.substr( findNext, findEnd - findNext ).trim();
							var refs = this._hierarchieParse( _currentObject, findEnd + 1 );
							endRead = refs.end;
							_currentObject.children = refs.parent.children;

						} else {

							var DataEnder = this._data.lastIndexOf( ';', findNext > 0 ? Math.min( findNext, findEnd ) : findEnd );
							_currentObject.data = this._data.substr( find1, DataEnder - find1 ).trim();
							if ( findNext <= 0 || findEnd < findNext ) {

								endRead = findEnd + 1;

							} else {

								var nextStart = Math.max( DataEnder + 1, find1 );
								var _refs = this._hierarchieParse( _currentObject, nextStart );
								endRead = _refs.end;
								_currentObject.children = _refs.parent.children;

							}

						}
						_currentObject.parent = _parent;
						if ( _currentObject.type != "template" ) {

							_parent.children.push( _currentObject );

						}

					} else {

						endRead = find1 === - 1 ? this._data.length : findEnd + 1;
						break;

					}

				}
				return {
					parent: _parent,
					end: endRead
				};

			}
		}, {
			key: 'mainloop',
			value: function mainloop() {

				var _this2 = this;

				this.mainProc();
				if ( this._currentObject.parent || this._currentObject.children.length > 0 || ! this._currentObject.worked ) {

					setTimeout( function () {

						_this2.mainloop();

					}, 1 );

				} else {

					setTimeout( function () {

						_this2.onLoad( {
							models: _this2.Meshes,
							animations: _this2.animations
						} );

					}, 1 );

				}

			}
		}, {
			key: 'mainProc',
			value: function mainProc() {

				var breakFlag = false;
				while ( true ) {

					if ( ! this._currentObject.worked ) {

						switch ( this._currentObject.type ) {

							case "template":
								break;
							case "AnimTicksPerSecond":
								this.animTicksPerSecond = parseInt( this._currentObject.data );
								break;
							case "Frame":
								this._setFrame();
								break;
							case "FrameTransformMatrix":
								this._setFrameTransformMatrix();
								break;
							case "Mesh":
								this._changeRoot();
								this._currentGeo = {};
								this._currentGeo.name = this._currentObject.name.trim();
								this._currentGeo.parentName = this._getParentName( this._currentObject ).trim();
								this._currentGeo.VertexSetedBoneCount = [];
								this._currentGeo.Geometry = new THREE.Geometry();
								this._currentGeo.Materials = [];
								this._currentGeo.normalVectors = [];
								this._currentGeo.BoneInfs = [];
								this._currentGeo.baseFrame = this._currentFrame;
								this._makeBoneFrom_CurrentFrame();
								this._readVertexDatas();
								breakFlag = true;
								break;
							case "MeshNormals":
								this._readVertexDatas();
								break;
							case "MeshTextureCoords":
								this._setMeshTextureCoords();
								break;
							case "VertexDuplicationIndices":
								break;
							case "MeshMaterialList":
								this._setMeshMaterialList();
								break;
							case "Material":
								this._setMaterial();
								break;
							case "SkinWeights":
								this._setSkinWeights();
								break;
							case "AnimationSet":
								this._changeRoot();
								this._currentAnime = {};
								this._currentAnime.name = this._currentObject.name.trim();
								this._currentAnime.AnimeFrames = [];
								break;
							case "Animation":
								if ( this._currentAnimeFrames ) {

									this._currentAnime.AnimeFrames.push( this._currentAnimeFrames );

								}
								this._currentAnimeFrames = new XAnimationInfo();
								this._currentAnimeFrames.boneName = this._currentObject.data.trim();
								break;
							case "AnimationKey":
								this._readAnimationKey();
								breakFlag = true;
								break;

						}
						this._currentObject.worked = true;

					}
					if ( this._currentObject.children.length > 0 ) {

						this._currentObject = this._currentObject.children.shift();
						if ( this.debug ) {

							console.log( 'processing ' + this._currentObject.name );

						}
						if ( breakFlag ) break;

					} else {

						if ( this._currentObject.worked ) {

							if ( this._currentObject.parent && ! this._currentObject.parent.parent ) {

								this._changeRoot();

							}

						}
						if ( this._currentObject.parent ) {

							this._currentObject = this._currentObject.parent;

						} else {

							breakFlag = true;

						}
						if ( breakFlag ) break;

					}

				}
				return;

			}
		}, {
			key: '_changeRoot',
			value: function _changeRoot() {

				if ( this._currentGeo != null && this._currentGeo.name ) {

					this._makeOutputGeometry();

				}
				this._currentGeo = {};
				if ( this._currentAnime != null && this._currentAnime.name ) {

					if ( this._currentAnimeFrames ) {

						this._currentAnime.AnimeFrames.push( this._currentAnimeFrames );
						this._currentAnimeFrames = null;

					}
					this._makeOutputAnimation();

				}
				this._currentAnime = {};

			}
		}, {
			key: '_getParentName',
			value: function _getParentName( _obj ) {

				if ( _obj.parent ) {

					if ( _obj.parent.name ) {

						return _obj.parent.name;

					} else {

						return this._getParentName( _obj.parent );

					}

				} else {

					return "";

				}

			}
		}, {
			key: '_setFrame',
			value: function _setFrame() {

				this._nowFrameName = this._currentObject.name.trim();
				this._currentFrame = {};
				this._currentFrame.name = this._nowFrameName;
				this._currentFrame.children = [];
				if ( this._currentObject.parent && this._currentObject.parent.name ) {

					this._currentFrame.parentName = this._currentObject.parent.name;

				}
				this.frameHierarchie.push( this._nowFrameName );
				this.HieStack[ this._nowFrameName ] = this._currentFrame;

			}
		}, {
			key: '_setFrameTransformMatrix',
			value: function _setFrameTransformMatrix() {

				this._currentFrame.FrameTransformMatrix = new THREE.Matrix4();
				var data = this._currentObject.data.split( "," );
				this._ParseMatrixData( this._currentFrame.FrameTransformMatrix, data );
				this._makeBoneFrom_CurrentFrame();

			}
		}, {
			key: '_makeBoneFrom_CurrentFrame',
			value: function _makeBoneFrom_CurrentFrame() {

				if ( ! this._currentFrame.FrameTransformMatrix ) {

					return;

				}
				var b = new THREE.Bone();
				b.name = this._currentFrame.name;
				b.applyMatrix( this._currentFrame.FrameTransformMatrix );
				b.matrixWorld = b.matrix;
				b.FrameTransformMatrix = this._currentFrame.FrameTransformMatrix;
				this._currentFrame.putBone = b;
				if ( this._currentFrame.parentName ) {

					for ( var frame in this.HieStack ) {

						if ( this.HieStack[ frame ].name === this._currentFrame.parentName ) {

							this.HieStack[ frame ].putBone.add( this._currentFrame.putBone );

						}

					}

				}

			}
		}, {
			key: '_readVertexDatas',
			value: function _readVertexDatas() {

				var endRead = 0;
				var mode = 0;
				var mode_local = 0;
				var maxLength = 0;
				var nowReadedLine = 0;
				while ( true ) {

					var changeMode = false;
					if ( mode_local === 0 ) {

						var refO = this._readInt1( endRead );
						endRead = refO.endRead;
						mode_local = 1;
						nowReadedLine = 0;
						maxLength = this._currentObject.data.indexOf( ';;', endRead ) + 1;
						if ( maxLength <= 0 ) {

							maxLength = this._currentObject.data.length;

						}

					} else {

						var find = 0;
						switch ( mode ) {

							case 0:
								find = this._currentObject.data.indexOf( ',', endRead ) + 1;
								break;
							case 1:
								find = this._currentObject.data.indexOf( ';,', endRead ) + 1;
								break;

						}
						if ( find === 0 || find > maxLength ) {

							find = maxLength;
							mode_local = 0;
							changeMode = true;

						}
						switch ( this._currentObject.type ) {

							case "Mesh":
								switch ( mode ) {

									case 0:
										this._readVertex1( this._currentObject.data.substr( endRead, find - endRead ) );
										break;
									case 1:
										this._readFace1( this._currentObject.data.substr( endRead, find - endRead ) );
										break;

								}
								break;
							case "MeshNormals":
								switch ( mode ) {

									case 0:
										this._readNormalVector1( this._currentObject.data.substr( endRead, find - endRead ) );
										break;
									case 1:
										this._readNormalFace1( this._currentObject.data.substr( endRead, find - endRead ), nowReadedLine );
										break;

								}
								break;

						}
						endRead = find + 1;
						nowReadedLine ++;
						if ( changeMode ) {

							mode ++;

						}

					}
					if ( endRead >= this._currentObject.data.length ) {

						break;

					}

				}

			}
		}, {
			key: '_readInt1',
			value: function _readInt1( start ) {

				var find = this._currentObject.data.indexOf( ';', start );
				return {
					refI: parseInt( this._currentObject.data.substr( start, find - start ) ),
					endRead: find + 1
				};

			}
		}, {
			key: '_readVertex1',
			value: function _readVertex1( line ) {

				var data = this._readLine( line.trim() ).substr( 0, line.length - 2 ).split( ";" );
				this._currentGeo.Geometry.vertices.push( new THREE.Vector3( parseFloat( data[ 0 ] ), parseFloat( data[ 1 ] ), parseFloat( data[ 2 ] ) ) );
				this._currentGeo.Geometry.skinIndices.push( new THREE.Vector4( 0, 0, 0, 0 ) );
				this._currentGeo.Geometry.skinWeights.push( new THREE.Vector4( 1, 0, 0, 0 ) );
				this._currentGeo.VertexSetedBoneCount.push( 0 );

			}
		}, {
			key: '_readFace1',
			value: function _readFace1( line ) {

				var data = this._readLine( line.trim() ).substr( 2, line.length - 4 ).split( "," );
				this._currentGeo.Geometry.faces.push( new THREE.Face3( parseInt( data[ 0 ], 10 ), parseInt( data[ 1 ], 10 ), parseInt( data[ 2 ], 10 ), new THREE.Vector3( 1, 1, 1 ).normalize() ) );

			}
		}, {
			key: '_readNormalVector1',
			value: function _readNormalVector1( line ) {

				var data = this._readLine( line.trim() ).substr( 0, line.length - 2 ).split( ";" );
				this._currentGeo.normalVectors.push( new THREE.Vector3( parseFloat( data[ 0 ] ), parseFloat( data[ 1 ] ), parseFloat( data[ 2 ] ) ) );

			}
		}, {
			key: '_readNormalFace1',
			value: function _readNormalFace1( line, nowReaded ) {

				var data = this._readLine( line.trim() ).substr( 2, line.length - 4 ).split( "," );
				var nowID = parseInt( data[ 0 ], 10 );
				var v1 = this._currentGeo.normalVectors[ nowID ];
				nowID = parseInt( data[ 1 ], 10 );
				var v2 = this._currentGeo.normalVectors[ nowID ];
				nowID = parseInt( data[ 2 ], 10 );
				var v3 = this._currentGeo.normalVectors[ nowID ];
				this._currentGeo.Geometry.faces[ nowReaded ].vertexNormals = [ v1, v2, v3 ];

			}
		}, {
			key: '_setMeshNormals',
			value: function _setMeshNormals() {

				var endRead = 0;
				var mode = 0;
				var mode_local = 0;
				while ( true ) {

					switch ( mode ) {

						case 0:
							if ( mode_local === 0 ) {

								var refO = this._readInt1( 0 );
								endRead = refO.endRead;
								mode_local = 1;

							} else {

								var find = this._currentObject.data.indexOf( ',', endRead ) + 1;
								if ( find === - 1 ) {

									find = this._currentObject.data.indexOf( ';;', endRead ) + 1;
									mode = 2;
									mode_local = 0;

								}
								var line = this._currentObject.data.substr( endRead, find - endRead );
								var data = this._readLine( line.trim() ).split( ";" );
								this._currentGeo.normalVectors.push( [ parseFloat( data[ 0 ] ), parseFloat( data[ 1 ] ), parseFloat( data[ 2 ] ) ] );
								endRead = find + 1;

							}
							break;

					}
					if ( endRead >= this._currentObject.data.length ) {

						break;

					}

				}

			}
		}, {
			key: '_setMeshTextureCoords',
			value: function _setMeshTextureCoords() {

				this._tmpUvArray = [];
				this._currentGeo.Geometry.faceVertexUvs = [];
				this._currentGeo.Geometry.faceVertexUvs.push( [] );
				var endRead = 0;
				var mode = 0;
				var mode_local = 0;
				while ( true ) {

					switch ( mode ) {

						case 0:
							if ( mode_local === 0 ) {

								var refO = this._readInt1( 0 );
								endRead = refO.endRead;
								mode_local = 1;

							} else {

								var find = this._currentObject.data.indexOf( ',', endRead ) + 1;
								if ( find === 0 ) {

									find = this._currentObject.data.length;
									mode = 2;
									mode_local = 0;

								}
								var line = this._currentObject.data.substr( endRead, find - endRead );
								var data = this._readLine( line.trim() ).split( ";" );
								if ( this.IsUvYReverse ) {

									this._tmpUvArray.push( new THREE.Vector2( parseFloat( data[ 0 ] ), 1 - parseFloat( data[ 1 ] ) ) );

								} else {

									this._tmpUvArray.push( new THREE.Vector2( parseFloat( data[ 0 ] ), parseFloat( data[ 1 ] ) ) );

								}
								endRead = find + 1;

							}
							break;

					}
					if ( endRead >= this._currentObject.data.length ) {

						break;

					}

				}
				this._currentGeo.Geometry.faceVertexUvs[ 0 ] = [];
				for ( var m = 0; m < this._currentGeo.Geometry.faces.length; m ++ ) {

					this._currentGeo.Geometry.faceVertexUvs[ 0 ][ m ] = [];
					this._currentGeo.Geometry.faceVertexUvs[ 0 ][ m ].push( this._tmpUvArray[ this._currentGeo.Geometry.faces[ m ].a ] );
					this._currentGeo.Geometry.faceVertexUvs[ 0 ][ m ].push( this._tmpUvArray[ this._currentGeo.Geometry.faces[ m ].b ] );
					this._currentGeo.Geometry.faceVertexUvs[ 0 ][ m ].push( this._tmpUvArray[ this._currentGeo.Geometry.faces[ m ].c ] );

				}
				this._currentGeo.Geometry.uvsNeedUpdate = true;

			}
		}, {
			key: '_setMeshMaterialList',
			value: function _setMeshMaterialList() {

				var endRead = 0;
				var mode = 0;
				var mode_local = 0;
				while ( true ) {

					if ( mode_local < 2 ) {

						var refO = this._readInt1( endRead );
						endRead = refO.endRead;
						mode_local ++;

					} else {

						var find = this._currentObject.data.indexOf( ';', endRead );
						if ( find === - 1 ) {

							find = this._currentObject.data.length;
							mode = 3;
							mode_local = 0;

						}
						var line = this._currentObject.data.substr( endRead, find - endRead );
						var data = this._readLine( line.trim() ).split( "," );
						for ( var i = 0; i < data.length; i ++ ) {

							this._currentGeo.Geometry.faces[ i ].materialIndex = parseInt( data[ i ] );

						}
						endRead = this._currentObject.data.length;

					}
					if ( endRead >= this._currentObject.data.length || mode >= 3 ) {

						break;

					}

				}

			}
		}, {
			key: '_setMaterial',
			value: function _setMaterial() {

				var _nowMat = new THREE.MeshPhongMaterial( {
					color: Math.random() * 0xffffff
				} );
				_nowMat.side = THREE.FrontSide;
				_nowMat.name = this._currentObject.name;
				var endRead = 0;
				var find = this._currentObject.data.indexOf( ';;', endRead );
				var line = this._currentObject.data.substr( endRead, find - endRead );
				var data = this._readLine( line.trim() ).split( ";" );
				_nowMat.color.r = parseFloat( data[ 0 ] );
				_nowMat.color.g = parseFloat( data[ 1 ] );
				_nowMat.color.b = parseFloat( data[ 2 ] );
				endRead = find + 2;
				find = this._currentObject.data.indexOf( ';', endRead );
				line = this._currentObject.data.substr( endRead, find - endRead );
				_nowMat.shininess = parseFloat( this._readLine( line ) );
				endRead = find + 1;
				find = this._currentObject.data.indexOf( ';;', endRead );
				line = this._currentObject.data.substr( endRead, find - endRead );
				var data2 = this._readLine( line.trim() ).split( ";" );
				_nowMat.specular.r = parseFloat( data2[ 0 ] );
				_nowMat.specular.g = parseFloat( data2[ 1 ] );
				_nowMat.specular.b = parseFloat( data2[ 2 ] );
				endRead = find + 2;
				find = this._currentObject.data.indexOf( ';;', endRead );
				if ( find === - 1 ) {

					find = this._currentObject.data.length;

				}
				line = this._currentObject.data.substr( endRead, find - endRead );
				var data3 = this._readLine( line.trim() ).split( ";" );
				_nowMat.emissive.r = parseFloat( data3[ 0 ] );
				_nowMat.emissive.g = parseFloat( data3[ 1 ] );
				_nowMat.emissive.b = parseFloat( data3[ 2 ] );
				var localObject = null;
				while ( true ) {

					if ( this._currentObject.children.length > 0 ) {

						localObject = this._currentObject.children.shift();
						if ( this.debug ) {

							console.log( 'processing ' + localObject.name );

						}
						var fileName = localObject.data.substr( 1, localObject.data.length - 2 );
						switch ( localObject.type ) {

							case "TextureFilename":
								_nowMat.map = this.texloader.load( this.baseDir + fileName );
								break;
							case "BumpMapFilename":
								_nowMat.bumpMap = this.texloader.load( this.baseDir + fileName );
								_nowMat.bumpScale = 0.05;
								break;
							case "NormalMapFilename":
								_nowMat.normalMap = this.texloader.load( this.baseDir + fileName );
								_nowMat.normalScale = new THREE.Vector2( 2, 2 );
								break;
							case "EmissiveMapFilename":
								_nowMat.emissiveMap = this.texloader.load( this.baseDir + fileName );
								break;
							case "LightMapFilename":
								_nowMat.lightMap = this.texloader.load( this.baseDir + fileName );
								break;

						}

					} else {

						break;

					}

				}
				this._currentGeo.Materials.push( _nowMat );

			}
		}, {
			key: '_setSkinWeights',
			value: function _setSkinWeights() {

				var boneInf = new XboneInf();
				var endRead = 0;
				var find = this._currentObject.data.indexOf( ';', endRead );
				var line = this._currentObject.data.substr( endRead, find - endRead );
				endRead = find + 1;
				boneInf.boneName = line.substr( 1, line.length - 2 );
				boneInf.BoneIndex = this._currentGeo.BoneInfs.length;
				find = this._currentObject.data.indexOf( ';', endRead );
				endRead = find + 1;
				find = this._currentObject.data.indexOf( ';', endRead );
				line = this._currentObject.data.substr( endRead, find - endRead );
				var data = this._readLine( line.trim() ).split( "," );
				for ( var i = 0; i < data.length; i ++ ) {

					boneInf.Indeces.push( parseInt( data[ i ] ) );

				}
				endRead = find + 1;
				find = this._currentObject.data.indexOf( ';', endRead );
				line = this._currentObject.data.substr( endRead, find - endRead );
				var data2 = this._readLine( line.trim() ).split( "," );
				for ( var _i = 0; _i < data2.length; _i ++ ) {

					boneInf.Weights.push( parseFloat( data2[ _i ] ) );

				}
				endRead = find + 1;
				find = this._currentObject.data.indexOf( ';', endRead );
				if ( find <= 0 ) {

					find = this._currentObject.data.length;

				}
				line = this._currentObject.data.substr( endRead, find - endRead );
				var data3 = this._readLine( line.trim() ).split( "," );
				boneInf.OffsetMatrix = new THREE.Matrix4();
				this._ParseMatrixData( boneInf.OffsetMatrix, data3 );
				this._currentGeo.BoneInfs.push( boneInf );

			}
		}, {
			key: '_makePutBoneList',
			value: function _makePutBoneList( _RootName, _bones ) {

				var putting = false;
				for ( var frame in this.HieStack ) {

					if ( this.HieStack[ frame ].name === _RootName || putting ) {

						putting = true;
						var b = new THREE.Bone();
						b.name = this.HieStack[ frame ].name;
						b.applyMatrix( this.HieStack[ frame ].FrameTransformMatrix );
						b.matrixWorld = b.matrix;
						b.FrameTransformMatrix = this.HieStack[ frame ].FrameTransformMatrix;
						b.pos = new THREE.Vector3().setFromMatrixPosition( b.FrameTransformMatrix ).toArray();
						b.rotq = new THREE.Quaternion().setFromRotationMatrix( b.FrameTransformMatrix ).toArray();
						b.scl = new THREE.Vector3().setFromMatrixScale( b.FrameTransformMatrix ).toArray();
						if ( this.HieStack[ frame ].parentName && this.HieStack[ frame ].parentName.length > 0 ) {

							for ( var i = 0; i < _bones.length; i ++ ) {

								if ( this.HieStack[ frame ].parentName === _bones[ i ].name ) {

									_bones[ i ].add( b );
									b.parent = i;
									break;

								}

							}

						}
						_bones.push( b );

					}

				}

			}
		}, {
			key: '_makeOutputGeometry',
			value: function _makeOutputGeometry() {

				this._currentGeo.Geometry.computeBoundingBox();
				this._currentGeo.Geometry.computeBoundingSphere();
				this._currentGeo.Geometry.verticesNeedUpdate = true;
				this._currentGeo.Geometry.normalsNeedUpdate = true;
				this._currentGeo.Geometry.colorsNeedUpdate = true;
				this._currentGeo.Geometry.uvsNeedUpdate = true;
				this._currentGeo.Geometry.groupsNeedUpdate = true;
				var mesh = null;
				if ( this._currentGeo.BoneInfs.length > 0 ) {

					var putBones = [];
					this._makePutBoneList( this._currentGeo.baseFrame.parentName, putBones );
					for ( var bi = 0; bi < this._currentGeo.BoneInfs.length; bi ++ ) {

						var boneIndex = 0;
						for ( var bb = 0; bb < putBones.length; bb ++ ) {

							if ( putBones[ bb ].name === this._currentGeo.BoneInfs[ bi ].boneName ) {

								boneIndex = bb;
								putBones[ bb ].OffsetMatrix = new THREE.Matrix4();
								putBones[ bb ].OffsetMatrix.copy( this._currentGeo.BoneInfs[ bi ].OffsetMatrix );
								break;

							}

						}
						for ( var vi = 0; vi < this._currentGeo.BoneInfs[ bi ].Indeces.length; vi ++ ) {

							var nowVertexID = this._currentGeo.BoneInfs[ bi ].Indeces[ vi ];
							var nowVal = this._currentGeo.BoneInfs[ bi ].Weights[ vi ];
							switch ( this._currentGeo.VertexSetedBoneCount[ nowVertexID ] ) {

								case 0:
									this._currentGeo.Geometry.skinIndices[ nowVertexID ].x = boneIndex;
									this._currentGeo.Geometry.skinWeights[ nowVertexID ].x = nowVal;
									break;
								case 1:
									this._currentGeo.Geometry.skinIndices[ nowVertexID ].y = boneIndex;
									this._currentGeo.Geometry.skinWeights[ nowVertexID ].y = nowVal;
									break;
								case 2:
									this._currentGeo.Geometry.skinIndices[ nowVertexID ].z = boneIndex;
									this._currentGeo.Geometry.skinWeights[ nowVertexID ].z = nowVal;
									break;
								case 3:
									this._currentGeo.Geometry.skinIndices[ nowVertexID ].w = boneIndex;
									this._currentGeo.Geometry.skinWeights[ nowVertexID ].w = nowVal;
									break;

							}
							this._currentGeo.VertexSetedBoneCount[ nowVertexID ] ++;
							if ( this._currentGeo.VertexSetedBoneCount[ nowVertexID ] > 4 ) {

								console.log( 'warn! over 4 bone weight! :' + nowVertexID );

							}

						}

					}
					for ( var sk = 0; sk < this._currentGeo.Materials.length; sk ++ ) {

						this._currentGeo.Materials[ sk ].skinning = true;

					}
					var offsetList = [];
					for ( var _bi = 0; _bi < putBones.length; _bi ++ ) {

						if ( putBones[ _bi ].OffsetMatrix ) {

							offsetList.push( putBones[ _bi ].OffsetMatrix );

						} else {

							offsetList.push( new THREE.Matrix4() );

						}

					}
					var bufferGeometry = new THREE.BufferGeometry().fromGeometry( this._currentGeo.Geometry );
					bufferGeometry.bones = putBones;
					mesh = new THREE.SkinnedMesh( bufferGeometry, this._currentGeo.Materials.length === 1 ? this._currentGeo.Materials[ 0 ] : this._currentGeo.Materials );
					mesh.skeleton.boneInverses = offsetList;

				} else {

					var _bufferGeometry = new THREE.BufferGeometry().fromGeometry( this._currentGeo.Geometry );
					mesh = new THREE.Mesh( _bufferGeometry, this._currentGeo.Materials.length === 1 ? this._currentGeo.Materials[ 0 ] : this._currentGeo.Materials );

				}
				mesh.name = this._currentGeo.name;
				var worldBaseMx = new THREE.Matrix4();
				var currentMxFrame = this._currentGeo.baseFrame.putBone;
				if ( currentMxFrame && currentMxFrame.parent ) {

					while ( true ) {

						currentMxFrame = currentMxFrame.parent;
						if ( currentMxFrame ) {

							worldBaseMx.multiply( currentMxFrame.FrameTransformMatrix );

						} else {

							break;

						}

					}
					mesh.applyMatrix( worldBaseMx );

				}
				this.Meshes.push( mesh );

			}
		}, {
			key: '_readAnimationKey',
			value: function _readAnimationKey() {

				var endRead = 0;
				var find = this._currentObject.data.indexOf( ';', endRead );
				var line = this._currentObject.data.substr( endRead, find - endRead );
				endRead = find + 1;
				var nowKeyType = parseInt( this._readLine( line ) );
				find = this._currentObject.data.indexOf( ';', endRead );
				endRead = find + 1;
				line = this._currentObject.data.substr( endRead );
				var data = this._readLine( line.trim() ).split( ";;," );
				for ( var i = 0; i < data.length; i ++ ) {

					var data2 = data[ i ].split( ";" );
					var keyInfo = new XKeyFrameInfo();
					keyInfo.type = nowKeyType;
					keyInfo.Frame = parseInt( data2[ 0 ] );
					keyInfo.index = this._currentAnimeFrames.keyFrames.length;
					keyInfo.time = keyInfo.Frame;
					if ( nowKeyType != 4 ) {

						var frameFound = false;
						for ( var mm = 0; mm < this._currentAnimeFrames.keyFrames.length; mm ++ ) {

							if ( this._currentAnimeFrames.keyFrames[ mm ].Frame === keyInfo.Frame ) {

								keyInfo = this._currentAnimeFrames.keyFrames[ mm ];
								frameFound = true;
								break;

							}

						}
						var frameValue = data2[ 2 ].split( "," );
						switch ( nowKeyType ) {

							case 0:
								keyInfo.rot = new THREE.Quaternion( parseFloat( frameValue[ 1 ] ), parseFloat( frameValue[ 2 ] ), parseFloat( frameValue[ 3 ] ), parseFloat( frameValue[ 0 ] ) * - 1 );
								break;
							case 1:
								keyInfo.scl = new THREE.Vector3( parseFloat( frameValue[ 0 ] ), parseFloat( frameValue[ 1 ] ), parseFloat( frameValue[ 2 ] ) );
								break;
							case 2:
								keyInfo.pos = new THREE.Vector3( parseFloat( frameValue[ 0 ] ), parseFloat( frameValue[ 1 ] ), parseFloat( frameValue[ 2 ] ) );
								break;

						}
						if ( ! frameFound ) {

							this._currentAnimeFrames.keyFrames.push( keyInfo );

						}

					} else {

						keyInfo.matrix = new THREE.Matrix4();
						this._ParseMatrixData( keyInfo.matrix, data2[ 2 ].split( "," ) );
						this._currentAnimeFrames.keyFrames.push( keyInfo );

					}

				}

			}
		}, {
			key: '_makeOutputAnimation',
			value: function _makeOutputAnimation() {

				var animationObj = new XAnimationObj( this.options );
				animationObj.fps = this.animTicksPerSecond;
				animationObj.name = this._currentAnime.name;
				animationObj.make( this._currentAnime.AnimeFrames );
				this.animations.push( animationObj );

			}
		}, {
			key: 'assignAnimation',
			value: function assignAnimation( _model, _animation, _isBind ) {

				var model = _model;
				var animation = _animation;
				if ( ! model ) {

					model = this.Meshes[ 0 ];

				}
				if ( ! animation ) {

					animation = this.animations[ 0 ];

				}
				if ( ! model || ! animation ) {

					return null;

				}
				var put = {};
				put.fps = animation.fps;
				put.name = animation.name;
				put.length = animation.length;
				put.hierarchy = [];
				for ( var b = 0; b < model.skeleton.bones.length; b ++ ) {

					var findAnimation = false;
					for ( var i = 0; i < animation.hierarchy.length; i ++ ) {

						if ( model.skeleton.bones[ b ].name === animation.hierarchy[ i ].name ) {

							findAnimation = true;
							var c_key = animation.hierarchy[ i ].copy();
							c_key.parent = - 1;
							if ( model.skeleton.bones[ b ].parent && model.skeleton.bones[ b ].parent.type === "Bone" ) {

								for ( var bb = 0; bb < put.hierarchy.length; bb ++ ) {

									if ( put.hierarchy[ bb ].name === model.skeleton.bones[ b ].parent.name ) {

										c_key.parent = bb;
										c_key.parentName = model.skeleton.bones[ b ].parent.name;

									}

								}

							}
							put.hierarchy.push( c_key );
							break;

						}

					}
					if ( ! findAnimation ) {

						var _c_key = animation.hierarchy[ 0 ].copy();
						_c_key.name = model.skeleton.bones[ b ].name;
						_c_key.parent = - 1;
						for ( var k = 0; k < _c_key.keys.length; k ++ ) {

							if ( _c_key.keys[ k ].pos ) {

								_c_key.keys[ k ].pos.set( 0, 0, 0 );

							}
							if ( _c_key.keys[ k ].scl ) {

								_c_key.keys[ k ].scl.set( 1, 1, 1 );

							}
							if ( _c_key.keys[ k ].rot ) {

								_c_key.keys[ k ].rot.set( 0, 0, 0, 1 );

							}

						}
						put.hierarchy.push( _c_key );

					}

				}
				if ( ! model.geometry.animations ) {

					model.geometry.animations = [];

				}

				model.geometry.animations.push( THREE.AnimationClip.parseAnimation( put, model.skeleton.bones ) );
				if ( ! model.animationMixer ) {

					model.animationMixer = new THREE.AnimationMixer( model );

				}

				return put;

			}
		}, {
			key: '_ParseMatrixData',
			value: function _ParseMatrixData( targetMatrix, data ) {

				targetMatrix.set( parseFloat( data[ 0 ] ), parseFloat( data[ 4 ] ), parseFloat( data[ 8 ] ), parseFloat( data[ 12 ] ), parseFloat( data[ 1 ] ), parseFloat( data[ 5 ] ), parseFloat( data[ 9 ] ), parseFloat( data[ 13 ] ), parseFloat( data[ 2 ] ), parseFloat( data[ 6 ] ), parseFloat( data[ 10 ] ), parseFloat( data[ 14 ] ), parseFloat( data[ 3 ] ), parseFloat( data[ 7 ] ), parseFloat( data[ 11 ] ), parseFloat( data[ 15 ] ) );

			}
		} ] );
		return XLoader;

	}();

	return XLoader;

} ) ) );
