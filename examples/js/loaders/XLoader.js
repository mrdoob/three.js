/**
 * @author Jey-en  https://github.com/adrs2002
 *
 * this loader repo -> https://github.com/adrs2002/threeXLoader
 *
 * This loader is load model (and animation) from .X file format. (for old DirectX).
 *  ! this version are load from TEXT format .X only ! not a Binary.
 *
 * Support
 *  - mesh
 *  - texture
 *  - normal / uv
 *  - material
 *  - skinning
 *
 *  Not Support
 *  - template
 *  - material(ditail)
 *  - morph
 *  - scene
 */

THREE.XLoader = function ( manager, Texloader, _zflg ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
	this.Texloader = ( Texloader !== undefined ) ? Texloader : new THREE.TextureLoader();
	this.zflg = _zflg === undefined ? false : _zflg;
	this.url = "";
	this.baseDir = "";
	this.nowReadMode = THREE.XLoader.XfileLoadMode.none;
	this.nowAnimationKeyType = 4;
	this.tgtLength = 0;
	this.nowReaded = 0;
	this.elementLv = 0;
	this.geoStartLv = Number.MAX_VALUE;
	this.frameStartLv = Number.MAX_VALUE;
	this.matReadLine = 0;
	this.putMatLength = 0;
	this.nowMat = null;
	this.BoneInf = new THREE.XLoader.XboneInf();
	this.tmpUvArray = [];
	this.normalVectors = [];
	this.facesNormal = [];
	this.nowFrameName = "";
	this.nowAnimationSetName = "";
	this.frameHierarchie = [];
	this.endLineCount = 0;
	this.geometry = null;
	this.loadingXdata = null;
	this.lines = null;
	this.keyInfo = null;
	this.animeKeyNames = null;
	this.data = null;
	this.onLoad = null;

};

THREE.XLoader.prototype = {

	constructor: THREE.XLoader,

	load: function ( _arg, onLoad, onProgress, onError ) {

		var scope = this;
		scope.IsUvYReverse = true;
		var loader = new THREE.FileLoader( scope.manager );
		loader.setResponseType( 'arraybuffer' );

		for ( var i = 0; i < _arg.length; i ++ ) {

			switch ( i ) {

				case 0:
					scope.url = _arg[ i ];
					break;
				case 1:
					scope.zflg = _arg[ i ];
					break;

			}

		}

		loader.load( scope.url, function ( response ) {

			scope.parse( response, onLoad );

		}, onProgress, onError );

	},

	isBinary: function ( binData ) {

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

	},

	ensureBinary: function ( buf ) {

		if ( typeof buf === "string" ) {

			var array_buffer = new Uint8Array( buf.length );
			for ( var i = 0; i < buf.length; i ++ ) {

				array_buffer[ i ] = buf.charCodeAt( i ) & 0xff;

			}
			return array_buffer.buffer || array_buffer;

		} else {

			return buf;

		}

	},

	ensureString: function ( buf ) {

		if ( typeof buf !== "string" ) {

			var array_buffer = new Uint8Array( buf );
			var str = '';
			for ( var i = 0; i < buf.byteLength; i ++ ) {

				str += String.fromCharCode( array_buffer[ i ] );

			}
			return str;

		} else {

			return buf;

		}

	},

	parse: function ( data, onLoad ) {

		var scope = this;
		var binData = scope.ensureBinary( data );
		scope.data = scope.ensureString( data );
		scope.onLoad = onLoad;
		return scope.isBinary( binData ) ? scope.parseBinary( binData ) : scope.parseASCII();

	},

	parseBinary: function ( data ) {

		var scope = this;
		return scope.parseASCII( String.fromCharCode.apply( null, data ) );

	},

	parseASCII: function () {

		var scope = this;
		if ( scope.url.lastIndexOf( "/" ) > 0 ) {

			scope.baseDir = scope.url.substr( 0, scope.url.lastIndexOf( "/" ) + 1 );

		}
		scope.loadingXdata = new THREE.XLoader.Xdata();
		scope.loadingXdata.vertexNormalFromFile = false;
		scope.loadingXdata.faceNormalFromFile = false;
		scope.lines = scope.data;
		scope.readedLength = 0;
		scope.mainloop();

	},

	mainloop: function () {

		var scope = this;
		var EndFlg = false;
		for ( var i = 0; i < 10; i ++ ) {

			var forceBreak = scope.SectionRead();
			scope.endLineCount ++;
			if ( scope.readedLength >= scope.data.length ) {

				EndFlg = true;
				scope.readFinalize();
				setTimeout( function () {

					scope.animationFinalize();

				}, 1 );
				break;

			}
			if ( forceBreak ) {

				break;

			}

		}
		if ( ! EndFlg ) {

			setTimeout( function () {

				scope.mainloop();

			}, 1 );

		}

	},

	getNextSection: function ( _offset, _start, _end ) {

		var scope = this;
		return [ scope.data.substr( _offset, _start - _offset ).trim(), scope.data.substr( _start + 1, _end - _start - 1 ) ];

	},

	getNextSection2: function ( _obj, _offset, _start, _end ) {

		return [ _obj.substr( _offset, _start - _offset ).trim(), _obj.substr( _start + 1, _end - _start - 1 ) ];

	},

	readMeshSection: function ( _baseOffset ) {

		var scope = this;
		scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].Geometry = new THREE.Geometry();
		scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].Materials = [];
		var find_2semi = scope.data.indexOf( ";;", _baseOffset );
		var offset = 0;
		var v_data = scope.getVertextDataSection( scope.data.substr( _baseOffset, find_2semi - _baseOffset ), 0 );
		for ( var i = 0; i < v_data[ 0 ].length; i ++ ) {

			scope.readVertex( v_data[ 0 ][ i ] );

		}
		offset = find_2semi + 2;
		find_2semi = scope.data.indexOf( ";;", offset );
		var v_data2 = scope.getVertextDataSection( scope.data.substr( offset + 1, find_2semi - offset + 1 ), 0 );
		for ( var _i = 0; _i < v_data2[ 0 ].length; _i ++ ) {

			scope.readVertexIndex( v_data2[ 0 ][ _i ] );

		}
		scope.readedLength = offset + v_data2[ 1 ] + 1;

	},

	getVertextDataSection: function ( _data, _offset ) {

		var find = _data.indexOf( ";", _offset );
		var find_2semi = _data.indexOf( ";;", _offset );
		if ( find_2semi === - 1 ) {

			find_2semi = _data.length - 1;

		}
		var v_data_base = _data.substr( find + 1, find_2semi - find + 2 );
		return [ v_data_base.split( ";," ), find_2semi + 2 ];

	},

	readMeshMaterialSet: function ( _baseOffset ) {

		var scope = this;
		var find = scope.data.indexOf( ";", _baseOffset );
		find = scope.data.indexOf( ";", find + 2 );
		var find2 = scope.data.indexOf( ";", find + 2 );
		var _data = scope.data.substr( find + 1, find2 - find + 1 );
		var v_data = _data.split( "," );
		for ( var i = 0; i < v_data.length; i ++ ) {

			scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].Geometry.faces[ i ].materialIndex = parseInt( v_data[ i ], 10 );

		}
		scope.readedLength = find2 + 1;

	},

	readMaterial: function ( _dataLine ) {

		var scope = this;
		scope.nowMat = new THREE.MeshPhongMaterial( { color: Math.random() * 0xffffff } );
		if ( scope.zflg ) {

			scope.nowMat.side = THREE.BackSide;

		} else {

			scope.nowMat.side = THREE.FrontSide;

		}
		var find = _dataLine.indexOf( ";;" );
		var _diff = _dataLine.substr( 0, find ).split( ";" );
		scope.nowMat.color.r = parseFloat( _diff[ 0 ] );
		scope.nowMat.color.g = parseFloat( _diff[ 1 ] );
		scope.nowMat.color.b = parseFloat( _diff[ 2 ] );
		var find2 = _dataLine.indexOf( ";", find + 3 );
		scope.nowMat.shininess = parseFloat( _dataLine.substr( find + 2, find2 - find - 2 ) );
		find = _dataLine.indexOf( ";;", find2 + 1 );
		var _specular = _dataLine.substr( find2 + 1, find - find2 ).split( ";" );
		scope.nowMat.specular.r = parseFloat( _specular[ 0 ] );
		scope.nowMat.specular.g = parseFloat( _specular[ 1 ] );
		scope.nowMat.specular.b = parseFloat( _specular[ 2 ] );
		find2 = _dataLine.indexOf( ";;", find + 2 );
		var _emissive = _dataLine.substr( find + 2, find2 - find - 2 ).split( ";" );
		scope.nowMat.emissive.r = parseFloat( _emissive[ 0 ] );
		scope.nowMat.emissive.g = parseFloat( _emissive[ 1 ] );
		scope.nowMat.emissive.b = parseFloat( _emissive[ 2 ] );

	},

	readSkinWeights: function ( _data ) {

		var scope = this;
		scope.BoneInf = new THREE.XLoader.XboneInf();
		var find = _data.indexOf( ";" );
		scope.readBoneName( _data.substr( 0, find - 1 ).replace( '"', '' ) );
		var find_1 = _data.indexOf( ";", find + 1 ) + 1;
		var matrixStart = 0;
		if ( parseInt( _data.substr( find, find_1 - find ), 10 ) === 0 ) {

			matrixStart = find_1 + 1;

		} else {

			var _find = _data.indexOf( ";", find_1 + 1 );
			var i_data = _data.substr( find_1, _find - find_1 ).split( "," );
			for ( var i = 0; i < i_data.length; i ++ ) {

				scope.BoneInf.Indeces.push( parseInt( i_data[ i ], 10 ) );

			}
			var find3 = _data.indexOf( ";", _find + 1 );
			var w_data = _data.substr( _find + 1, find3 - _find ).split( "," );
			for ( var _i2 = 0; _i2 < w_data.length; _i2 ++ ) {

				scope.BoneInf.Weights.push( parseFloat( w_data[ _i2 ] ) );

			}
			matrixStart = find3 + 1;

		}
		var find4 = _data.indexOf( ";;", matrixStart + 1 );
		var m_data = _data.substr( matrixStart, find4 - matrixStart ).split( "," );
		scope.BoneInf.initMatrix = new THREE.Matrix4();
		scope.ParseMatrixData( scope.BoneInf.initMatrix, m_data );
		scope.BoneInf.OffsetMatrix = new THREE.Matrix4();
		scope.BoneInf.OffsetMatrix.getInverse( scope.BoneInf.initMatrix );
		scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].BoneInfs.push( scope.BoneInf );

	},

	getPlaneStr: function ( _str ) {

		var firstDbl = _str.indexOf( '"' ) + 1;
		var dbl2 = _str.indexOf( '"', firstDbl );
		return _str.substr( firstDbl, dbl2 - firstDbl );

	},

	readAnimationKeyFrame: function ( _data ) {

		var scope = this;
		var find1 = _data.indexOf( ';' );
		scope.nowAnimationKeyType = parseInt( _data.substr( 0, find1 ), 10 );
		var find2 = _data.indexOf( ';', find1 + 1 );
		var lines = _data.substr( find2 + 1 ).split( ';;,' );
		for ( var i = 0; i < lines.length; i ++ ) {

			scope.readAnimationKeyFrameValue( lines[ i ] );

		}

	},

	SectionRead: function () {

		var scope = this;
		var find = scope.data.indexOf( "{", scope.readedLength );
		if ( find === - 1 ) {

			scope.readedLength = scope.data.length;
			return;

		}
		var lines = scope.data.substr( scope.readedLength, find - scope.readedLength ).split( /\r\n|\r|\n/ );
		var line = lines[ 0 ];
		for ( var i = lines.length - 1; i >= 0; i -- ) {

			if ( lines[ i ].trim().length > 0 && lines[ i ].indexOf( '//' ) < 0 ) {

				line = lines[ i ];
				break;

			}

		}
		var find2 = scope.data.indexOf( "{", find + 1 );
		var find3 = scope.data.indexOf( "}", find + 1 );
		var find4 = scope.data.indexOf( "}", scope.readedLength );
		if ( find4 < find ) {

			if ( scope.elementLv < 1 || scope.nowFrameName === "" ) {

				scope.elementLv = 0;

			} else {

				scope.endElement();

			}
			scope.readedLength = find4 + 1;
			return false;

		}
		if ( find3 > find2 ) {

			scope.elementLv ++;
			if ( line.indexOf( "Frame " ) > - 1 ) {

				scope.beginFrame( line );

			} else if ( line.indexOf( "Mesh " ) > - 1 ) {

				scope.readMeshSection( find + 1 );
				scope.nowReadMode = THREE.XLoader.XfileLoadMode.Mesh;
				return true;

			} else if ( line.indexOf( "MeshMaterialList " ) > - 1 ) {

				scope.readMeshMaterialSet( find + 1 );
				scope.nowReadMode = THREE.XLoader.XfileLoadMode.Mat_Set;
				return true;

			} else if ( line.indexOf( "Material " ) > - 1 ) {

				var nextSemic = scope.data.indexOf( ";;", find + 1 );
				nextSemic = scope.data.indexOf( ";;", nextSemic + 1 );
				nextSemic = scope.data.indexOf( ";;", nextSemic + 1 );
				scope.readMaterial( scope.data.substr( find + 1, nextSemic - find + 1 ) );
				scope.readedLength = nextSemic + 2;
				scope.nowReadMode = THREE.XLoader.XfileLoadMode.Mat_detail;
				return true;

			} else if ( line.indexOf( "AnimationSet " ) > - 1 ) {

				scope.readandCreateAnimationSet( line );
				scope.nowReadMode = THREE.XLoader.XfileLoadMode.Anim_init;
				scope.readedLength = find + 1;
				return false;

			} else if ( line.indexOf( "Animation " ) > - 1 ) {

				scope.readAndCreateAnimation( line );
				scope.nowReadMode = THREE.XLoader.XfileLoadMode.Anim_Reading;
				var tgtBoneName = scope.data.substr( find2 + 1, find3 - find2 - 1 ).trim();
				scope.loadingXdata.AnimationSetInfo[ scope.nowAnimationSetName ][ scope.nowFrameName ].boneName = tgtBoneName;
				scope.readedLength = find3 + 1;
				return false;

			}
			scope.readedLength = find + 1;
			return false;

		} else {

			var section = scope.getNextSection( scope.readedLength, find, find3 );
			scope.readedLength = find3 + 1;
			if ( line.indexOf( "template " ) > - 1 ) {

				scope.elementLv = 0;
				return false;

			} else if ( line.indexOf( "AnimTicksPerSecond" ) > - 1 ) {

				scope.loadingXdata.AnimTicksPerSecond = parseInt( section[ 1 ].substr( 0, section[ 1 ].indexOf( ";" ) ), 10 );
				scope.elementLv = 0;
				return false;

			} else if ( line.indexOf( "FrameTransformMatrix" ) > - 1 ) {

				var data = section[ 1 ].split( "," );
				data[ 15 ] = data[ 15 ].substr( 0, data[ 15 ].indexOf( ';;' ) );
				scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].FrameTransformMatrix = new THREE.Matrix4();
				scope.ParseMatrixData( scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].FrameTransformMatrix, data );
				scope.nowReadMode = THREE.XLoader.XfileLoadMode.Element;
				return false;

			} else if ( line.indexOf( "MeshTextureCoords" ) > - 1 ) {

				var v_data = scope.getVertextDataSection( section[ 1 ], 0 );
				for ( var _i3 = 0; _i3 < v_data[ 0 ].length; _i3 ++ ) {

					scope.readUv( v_data[ 0 ][ _i3 ] );

				}
				scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].Geometry.faceVertexUvs[ 0 ] = [];
				for ( var m = 0; m < scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].Geometry.faces.length; m ++ ) {

					scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].Geometry.faceVertexUvs[ 0 ][ m ] = [];
					scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].Geometry.faceVertexUvs[ 0 ][ m ].push( scope.tmpUvArray[ scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].Geometry.faces[ m ].a ] );
					scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].Geometry.faceVertexUvs[ 0 ][ m ].push( scope.tmpUvArray[ scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].Geometry.faces[ m ].b ] );
					scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].Geometry.faceVertexUvs[ 0 ][ m ].push( scope.tmpUvArray[ scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].Geometry.faces[ m ].c ] );

				}
				scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].Geometry.uvsNeedUpdate = true;
				return true;

			} else if ( line.indexOf( "Material " ) > - 1 ) {

				scope.readMaterial( section[ 1 ] );
				scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].Materials.push( scope.nowMat );
				return false;

			} else if ( line.indexOf( "TextureFilename" ) > - 1 ) {

				if ( section[ 1 ].length > 0 ) {

					scope.nowMat.map = scope.Texloader.load( scope.baseDir + scope.getPlaneStr( section[ 1 ] ) );

				}
				return false;

			} else if ( line.indexOf( "BumpMapFilename" ) > - 1 ) {

				if ( section[ 1 ].length > 0 ) {

					scope.nowMat.bumpMap = scope.Texloader.load( scope.baseDir + scope.getPlaneStr( section[ 1 ] ) );
					scope.nowMat.bumpScale = 0.05;

				}
				return false;

			} else if ( line.indexOf( "NormalMapFilename" ) > - 1 ) {

				if ( section[ 1 ].length > 0 ) {

					scope.nowMat.normalMap = scope.Texloader.load( scope.baseDir + scope.getPlaneStr( section[ 1 ] ) );
					scope.nowMat.normalScale = new THREE.Vector2( 2, 2 );

				}
				return false;

			} else if ( line.indexOf( "EmissiveMapFilename" ) > - 1 ) {

				if ( section[ 1 ].length > 0 ) {

					scope.nowMat.emissiveMap = scope.Texloader.load( scope.baseDir + scope.getPlaneStr( section[ 1 ] ) );

				}
				return false;

			} else if ( line.indexOf( "LightMapFilename" ) > - 1 ) {

				if ( section[ 1 ].length > 0 ) {

					scope.nowMat.lightMap = scope.Texloader.load( scope.baseDir + scope.getPlaneStr( section[ 1 ] ) );

				}
				return false;

			} else if ( line.indexOf( "XSkinMeshHeader" ) > - 1 ) {

				return false;

			} else if ( line.indexOf( "SkinWeights" ) > - 1 ) {

				scope.readSkinWeights( section[ 1 ] );
				return true;

			} else if ( line.indexOf( "AnimationKey" ) > - 1 ) {

				scope.readAnimationKeyFrame( section[ 1 ] );
				return true;

			}

		}
		return false;

	},

	endElement: function () {

		var scope = this;
		if ( scope.nowReadMode == THREE.XLoader.XfileLoadMode.Mesh ) {

			scope.nowReadMode = THREE.XLoader.XfileLoadMode.Element;

		} else if ( scope.nowReadMode == THREE.XLoader.XfileLoadMode.Mat_Set ) {

			scope.nowReadMode = THREE.XLoader.XfileLoadMode.Mesh;

		} else if ( scope.nowReadMode == THREE.XLoader.XfileLoadMode.Mat_detail ) {

			scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].Materials.push( scope.nowMat );
			scope.nowReadMode = THREE.XLoader.XfileLoadMode.Mat_Set;

		} else if ( scope.nowReadMode == THREE.XLoader.XfileLoadMode.Anim_Reading ) {

			scope.nowReadMode = THREE.XLoader.XfileLoadMode.Anim_init;

		} else if ( scope.nowReadMode < THREE.XLoader.XfileLoadMode.Anim_init && scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].FrameStartLv === scope.elementLv && scope.nowReadMode > THREE.XLoader.XfileLoadMode.none ) {

			if ( scope.frameHierarchie.length > 0 ) {

				scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].children = [];
				var keys = Object.keys( scope.loadingXdata.FrameInfo_Raw );
				for ( var m = 0; m < keys.length; m ++ ) {

					if ( scope.loadingXdata.FrameInfo_Raw[ keys[ m ] ].ParentName === scope.nowFrameName ) {

						scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].children.push( keys[ m ] );

					}

				}
				scope.frameHierarchie.pop();

			}
			scope.MakeOutputGeometry( scope.nowFrameName, scope.zflg );
			scope.frameStartLv = scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].FrameStartLv;
			if ( scope.frameHierarchie.length > 0 ) {

				scope.nowFrameName = scope.frameHierarchie[ scope.frameHierarchie.length - 1 ];
				scope.frameStartLv = scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].FrameStartLv;

			} else {

				scope.nowFrameName = "";

			}

		} else if ( scope.nowReadMode == THREE.XLoader.XfileLoadMode.Anim_init ) {

			scope.nowReadMode = THREE.XLoader.XfileLoadMode.Element;

		}
		scope.elementLv --;

	},

	beginFrame: function ( line ) {

		var scope = this;
		scope.frameStartLv = scope.elementLv;
		scope.nowReadMode = THREE.XLoader.XfileLoadMode.Element;
		var findindex = line.indexOf( "Frame " );
		scope.nowFrameName = line.substr( findindex + 6, line.length - findindex + 1 ).trim();
		scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ] = new THREE.XLoader.XFrameInfo();
		scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].FrameName = scope.nowFrameName;
		if ( scope.frameHierarchie.length > 0 ) {

			scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].ParentName = scope.frameHierarchie[ scope.frameHierarchie.length - 1 ];

		}
		scope.frameHierarchie.push( scope.nowFrameName );
		scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].FrameStartLv = scope.frameStartLv;

	},

	beginReadMesh: function ( line ) {

		var scope = this;
		if ( scope.nowFrameName === "" ) {

			scope.frameStartLv = scope.elementLv;
			scope.nowFrameName = line.substr( 5, line.length - 6 );
			if ( scope.nowFrameName === "" ) {

				scope.nowFrameName = "mesh_" + scope.loadingXdata.FrameInfo_Raw.length;

			}
			scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ] = new THREE.XLoader.XFrameInfo();
			scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].FrameName = scope.nowFrameName;
			scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].FrameStartLv = scope.frameStartLv;

		}
		scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].Geometry = new THREE.Geometry();
		scope.geoStartLv = scope.elementLv;
		scope.nowReadMode = THREE.XLoader.XfileLoadMode.Vartex_init;
		scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].Materials = [];

	},

	readVertexCount: function ( line ) {

		var scope = this;
		scope.nowReadMode = THREE.XLoader.XfileLoadMode.Vartex_Read;
		scope.tgtLength = parseInt( line.substr( 0, line.length - 1 ), 10 );
		scope.nowReaded = 0;

	},

	readVertex: function ( line ) {

		var scope = this;
		var data = line.substr( 0, line.length - 2 ).split( ";" );
		scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].Geometry.vertices.push( new THREE.Vector3( parseFloat( data[ 0 ] ), parseFloat( data[ 1 ] ), parseFloat( data[ 2 ] ) ) );
		scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].Geometry.skinIndices.push( new THREE.Vector4( 0, 0, 0, 0 ) );
		scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].Geometry.skinWeights.push( new THREE.Vector4( 1, 0, 0, 0 ) );
		scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].VertexSetedBoneCount.push( 0 );
		scope.nowReaded ++;
		return false;

	},

	readIndexLength: function ( line ) {

		var scope = this;
		scope.nowReadMode = THREE.XLoader.XfileLoadMode.index_Read;
		scope.tgtLength = parseInt( line.substr( 0, line.length - 1 ), 10 );
		scope.nowReaded = 0;

	},

	readVertexIndex: function ( line ) {

		var scope = this;
		var firstFind = line.indexOf( ';' ) + 1;
		var data = line.substr( firstFind ).split( "," );
		if ( scope.zflg ) {

			scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].Geometry.faces.push( new THREE.Face3( parseInt( data[ 2 ], 10 ), parseInt( data[ 1 ], 10 ), parseInt( data[ 0 ], 10 ), new THREE.Vector3( 1, 1, 1 ).normalize() ) );

		} else {

			scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].Geometry.faces.push( new THREE.Face3( parseInt( data[ 0 ], 10 ), parseInt( data[ 1 ], 10 ), parseInt( data[ 2 ], 10 ), new THREE.Vector3( 1, 1, 1 ).normalize() ) );

		}
		return false;

	},

	beginMeshNormal: function () {

		var scope = this;
		scope.nowReadMode = THREE.XLoader.XfileLoadMode.Normal_V_init;
		scope.normalVectors = [];
		scope.facesNormal = [];

	},

	readMeshNormalCount: function ( line ) {

		var scope = this;
		scope.nowReadMode = THREE.XLoader.XfileLoadMode.Normal_V_Read;
		scope.tgtLength = parseInt( line.substr( 0, line.length - 1 ), 10 );
		scope.nowReaded = 0;

	},

	readMeshNormalVertex: function ( line ) {

		var scope = this;
		var data = line.split( ";" );
		scope.normalVectors.push( [ parseFloat( data[ 0 ] ), parseFloat( data[ 1 ] ), parseFloat( data[ 2 ] ) ] );
		scope.nowReaded ++;
		if ( scope.nowReaded >= scope.tgtLength ) {

			scope.nowReadMode = THREE.XLoader.XfileLoadMode.Normal_I_init;
			return true;

		}
		return false;

	},

	readMeshNormalIndexCount: function ( line ) {

		var scope = this;
		scope.nowReadMode = THREE.XLoader.XfileLoadMode.Normal_I_Read;
		scope.tgtLength = parseInt( line.substr( 0, line.length - 1 ), 10 );
		scope.nowReaded = 0;

	},

	readMeshNormalIndex: function ( line ) {

		var scope = this;
		var data = line.substr( 2, line.length - 4 ).split( "," );
		var nowID = parseInt( data[ 0 ], 10 );
		var v1 = new THREE.Vector3( scope.normalVectors[ nowID ][ 0 ], scope.normalVectors[ nowID ][ 1 ], scope.normalVectors[ nowID ][ 2 ] );
		nowID = parseInt( data[ 1 ], 10 );
		var v2 = new THREE.Vector3( scope.normalVectors[ nowID ][ 0 ], scope.normalVectors[ nowID ][ 1 ], scope.normalVectors[ nowID ][ 2 ] );
		nowID = parseInt( data[ 2 ], 10 );
		var v3 = new THREE.Vector3( scope.normalVectors[ nowID ][ 0 ], scope.normalVectors[ nowID ][ 1 ], scope.normalVectors[ nowID ][ 2 ] );
		if ( scope.zflg ) {

			scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].Geometry.faces[ scope.nowReaded ].vertexNormals = [ v3, v2, v1 ];

		} else {

			scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].Geometry.faces[ scope.nowReaded ].vertexNormals = [ v1, v2, v3 ];

		}
		scope.facesNormal.push( v1.normalize() );
		scope.nowReaded ++;
		if ( scope.nowReaded >= scope.tgtLength ) {

			scope.nowReadMode = THREE.XLoader.XfileLoadMode.Element;
			return true;

		}
		return false;

	},

	readUvInit: function ( line ) {

		var scope = this;
		scope.nowReadMode = THREE.XLoader.XfileLoadMode.Uv_Read;
		scope.tgtLength = parseInt( line.substr( 0, line.length - 1 ), 10 );
		scope.nowReaded = 0;
		scope.tmpUvArray = [];
		scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].Geometry.faceVertexUvs[ 0 ] = [];

	},

	readUv: function ( line ) {

		var scope = this;
		var data = line.split( ";" );
		if ( scope.IsUvYReverse ) {

			scope.tmpUvArray.push( new THREE.Vector2( parseFloat( data[ 0 ] ), 1 - parseFloat( data[ 1 ] ) ) );

		} else {

			scope.tmpUvArray.push( new THREE.Vector2( parseFloat( data[ 0 ] ), parseFloat( data[ 1 ] ) ) );

		}
		scope.nowReaded ++;
		if ( scope.nowReaded >= scope.tgtLength ) {

			return true;

		}
		return false;

	},

	readMatrixSetLength: function ( line ) {

		var scope = this;
		scope.nowReadMode = THREE.XLoader.XfileLoadMode.Mat_Face_Set;
		scope.tgtLength = parseInt( line.substr( 0, line.length - 1 ), 10 );
		scope.nowReaded = 0;

	},

	readMaterialBind: function ( line ) {

		var scope = this;
		var data = line.split( "," );
		scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].Geometry.faces[ scope.nowReaded ].materialIndex = parseInt( data[ 0 ] );
		scope.nowReaded ++;
		if ( scope.nowReaded >= scope.tgtLength ) {

			scope.nowReadMode = THREE.XLoader.XfileLoadMode.Element;
			return true;

		}
		return false;

	},

	readMaterialInit: function ( line ) {

		var scope = this;
		scope.nowReadMode = THREE.XLoader.XfileLoadMode.Mat_Set;
		scope.matReadLine = 0;
		scope.nowMat = new THREE.MeshPhongMaterial( { color: Math.random() * 0xffffff } );
		var matName = line.substr( 9, line.length - 10 );
		if ( matName !== "" ) {

			scope.nowMat.name = matName;

		}
		if ( scope.zflg ) {

			scope.nowMat.side = THREE.BackSide;

		} else {

			scope.nowMat.side = THREE.FrontSide;

		}
		scope.nowMat.side = THREE.FrontSide;

	},

	readandSetMaterial: function ( line ) {

		var scope = this;
		var data = line.split( ";" );
		scope.matReadLine ++;
		switch ( scope.matReadLine ) {

			case 1:
				scope.nowMat.color.r = data[ 0 ];
				scope.nowMat.color.g = data[ 1 ];
				scope.nowMat.color.b = data[ 2 ];
				break;
			case 2:
				scope.nowMat.shininess = data[ 0 ];
				break;
			case 3:
				scope.nowMat.specular.r = data[ 0 ];
				scope.nowMat.specular.g = data[ 1 ];
				scope.nowMat.specular.b = data[ 2 ];
				break;
			case 4:
				scope.nowMat.emissive.r = data[ 0 ];
				scope.nowMat.emissive.g = data[ 1 ];
				scope.nowMat.emissive.b = data[ 2 ];
				break;

		}
		if ( line.indexOf( "TextureFilename" ) > - 1 ) {

			scope.nowReadMode = THREE.XLoader.XfileLoadMode.Mat_Set_Texture;

		} else if ( line.indexOf( "BumpMapFilename" ) > - 1 ) {

			scope.nowReadMode = THREE.XLoader.XfileLoadMode.Mat_Set_BumpTex;
			scope.nowMat.bumpScale = 0.05;

		} else if ( line.indexOf( "NormalMapFilename" ) > - 1 ) {

			scope.nowReadMode = THREE.XLoader.XfileLoadMode.Mat_Set_NormalTex;
			scope.nowMat.normalScale = new THREE.Vector2( 2, 2 );

		} else if ( line.indexOf( "EmissiveMapFilename" ) > - 1 ) {

			scope.nowReadMode = THREE.XLoader.XfileLoadMode.Mat_Set_EmissiveTex;

		} else if ( line.indexOf( "LightMapFilename" ) > - 1 ) {

			scope.nowReadMode = THREE.XLoader.XfileLoadMode.Mat_Set_LightTex;

		}

	},

	readandSetMaterialTexture: function ( line ) {

		var scope = this;
		var data = line.substr( 1, line.length - 3 );
		if ( data != undefined && data.length > 0 ) {

			switch ( scope.nowReadMode ) {

				case THREE.XLoader.XfileLoadMode.Mat_Set_Texture:
					scope.nowMat.map = scope.Texloader.load( scope.baseDir + data );
					break;
				case THREE.XLoader.XfileLoadMode.Mat_Set_BumpTex:
					scope.nowMat.bumpMap = scope.Texloader.load( scope.baseDir + data );
					break;
				case THREE.XLoader.XfileLoadMode.Mat_Set_NormalTex:
					scope.nowMat.normalMap = scope.Texloader.load( scope.baseDir + data );
					break;
				case THREE.XLoader.XfileLoadMode.Mat_Set_EmissiveTex:
					scope.nowMat.emissiveMap = scope.Texloader.load( scope.baseDir + data );
					break;
				case THREE.XLoader.XfileLoadMode.Mat_Set_LightTex:
					scope.nowMat.lightMap = scope.Texloader.load( scope.baseDir + data );
					break;
				case THREE.XLoader.XfileLoadMode.Mat_Set_EnvTex:
					scope.nowMat.envMap = scope.Texloader.load( scope.baseDir + data );
					break;

			}

		}
		scope.nowReadMode = THREE.XLoader.XfileLoadMode.Mat_Set;
		scope.endLineCount ++;
		scope.elementLv --;

	},

	readBoneInit: function () {

		var scope = this;
		scope.nowReadMode = THREE.XLoader.XfileLoadMode.Weit_init;
		scope.BoneInf = new THREE.XLoader.XboneInf();

	},

	readBoneName: function ( line ) {

		var scope = this;
		scope.BoneInf.boneName = line.trim();
		scope.BoneInf.BoneIndex = scope.loadingXdata.FrameInfo_Raw[ scope.nowFrameName ].BoneInfs.length;
		scope.nowReaded = 0;

	},

	readBoneVertexLength: function ( line ) {

		var scope = this;
		scope.nowReadMode = THREE.XLoader.XfileLoadMode.Weit_Read_Index;
		scope.tgtLength = parseInt( line.substr( 0, line.length - 1 ), 10 );
		scope.nowReaded = 0;

	},

	readandSetBoneVertex: function ( line ) {

		var scope = this;
		scope.BoneInf.Indeces.push( parseInt( line.substr( 0, line.length - 1 ), 10 ) );
		scope.nowReaded ++;
		if ( scope.nowReaded >= scope.tgtLength || line.indexOf( ";" ) > - 1 ) {

			scope.nowReadMode = THREE.XLoader.XfileLoadMode.Weit_Read_Value;
			scope.nowReaded = 0;

		}

	},

	readandSetBoneWeightValue: function ( line ) {

		var scope = this;
		var nowVal = parseFloat( line.substr( 0, line.length - 1 ) );
		scope.BoneInf.Weights.push( nowVal );
		scope.nowReaded ++;
		if ( scope.nowReaded >= scope.tgtLength || line.indexOf( ";" ) > - 1 ) {

			scope.nowReadMode = THREE.XLoader.XfileLoadMode.Weit_Read_Matrx;

		}

	},

	readandCreateAnimationSet: function ( line ) {

		var scope = this;
		scope.frameStartLv = scope.elementLv;
		scope.nowReadMode = THREE.XLoader.XfileLoadMode.Anim_init;
		scope.nowAnimationSetName = line.substr( 13, line.length - 14 ).trim();
		scope.loadingXdata.AnimationSetInfo[ scope.nowAnimationSetName ] = [];

	},

	readAndCreateAnimation: function ( line ) {

		var scope = this;
		scope.nowFrameName = line.substr( 10, line.length - 11 ).trim();
		scope.loadingXdata.AnimationSetInfo[ scope.nowAnimationSetName ][ scope.nowFrameName ] = new THREE.XLoader.XAnimationInfo();
		scope.loadingXdata.AnimationSetInfo[ scope.nowAnimationSetName ][ scope.nowFrameName ].animeName = scope.nowFrameName;
		scope.loadingXdata.AnimationSetInfo[ scope.nowAnimationSetName ][ scope.nowFrameName ].FrameStartLv = scope.frameStartLv;

	},

	readAnimationKeyFrameValue: function ( line ) {

		var scope = this;
		scope.keyInfo = null;
		var data = line.split( ";" );
		if ( data == null || data.length < 3 ) {

			return;

		}
		var nowKeyframe = parseInt( data[ 0 ], 10 );
		var frameFound = false;
		var tmpM = new THREE.Matrix4();
		if ( scope.nowAnimationKeyType != 4 ) {

			for ( var mm = 0; mm < scope.loadingXdata.AnimationSetInfo[ scope.nowAnimationSetName ][ scope.nowFrameName ].keyFrames.length; mm ++ ) {

				if ( scope.loadingXdata.AnimationSetInfo[ scope.nowAnimationSetName ][ scope.nowFrameName ].keyFrames[ mm ].Frame === nowKeyframe ) {

					scope.keyInfo = scope.loadingXdata.AnimationSetInfo[ scope.nowAnimationSetName ][ scope.nowFrameName ].keyFrames[ mm ];
					frameFound = true;
					break;

				}

			}

		}
		if ( ! frameFound ) {

			scope.keyInfo = new THREE.XLoader.XKeyFrameInfo();
			scope.keyInfo.matrix = new THREE.Matrix4();
			scope.keyInfo.Frame = nowKeyframe;

		}
		var data2 = data[ 2 ].split( "," );
		switch ( scope.nowAnimationKeyType ) {

			case 0:
				tmpM.makeRotationFromQuaternion( new THREE.Quaternion( parseFloat( data2[ 0 ] ), parseFloat( data2[ 1 ] ), parseFloat( data2[ 2 ] ), parseFloat( data2[ 3 ] ) ) );
				scope.keyInfo.matrix.multiply( tmpM );
				break;
			case 1:
				tmpM.makeScale( parseFloat( data2[ 0 ] ), parseFloat( data2[ 1 ] ), parseFloat( data2[ 2 ] ) );
				scope.keyInfo.matrix.multiply( tmpM );
				break;
			case 2:
				tmpM.makeTranslation( parseFloat( data2[ 0 ] ), parseFloat( data2[ 1 ] ), parseFloat( data2[ 2 ] ) );
				scope.keyInfo.matrix.multiply( tmpM );
				break;
			case 3:
			case 4:
				scope.ParseMatrixData( scope.keyInfo.matrix, data2 );
				break;

		}
		if ( ! frameFound ) {

			scope.keyInfo.index = scope.loadingXdata.AnimationSetInfo[ scope.nowAnimationSetName ][ scope.nowFrameName ].keyFrames.length;
			scope.keyInfo.time = /*1.0 / scope.loadingXdata.AnimTicksPerSecond * */scope.keyInfo.Frame;
			scope.loadingXdata.AnimationSetInfo[ scope.nowAnimationSetName ][ scope.nowFrameName ].keyFrames.push( scope.keyInfo );

		}

	},

	readFinalize: function () {

		var scope = this;
		scope.loadingXdata.FrameInfo = [];
		var keys = Object.keys( scope.loadingXdata.FrameInfo_Raw );
		for ( var i = 0; i < keys.length; i ++ ) {

			if ( scope.loadingXdata.FrameInfo_Raw[ keys[ i ] ].Mesh != null ) {

				scope.loadingXdata.FrameInfo.push( scope.loadingXdata.FrameInfo_Raw[ keys[ i ] ].Mesh );

			}

		}
		if ( scope.loadingXdata.FrameInfo != null & scope.loadingXdata.FrameInfo.length > 0 ) {

			for ( var _i4 = 0; _i4 < scope.loadingXdata.FrameInfo.length; _i4 ++ ) {

				if ( scope.loadingXdata.FrameInfo[ _i4 ].parent == null ) {

					scope.loadingXdata.FrameInfo[ _i4 ].zflag = scope.zflg;
					if ( scope.zflg ) {

						scope.loadingXdata.FrameInfo[ _i4 ].scale.set( - 1, 1, 1 );

					}

				}

			}

		}

	},

	ParseMatrixData: function ( targetMatrix, data ) {

		targetMatrix.set( parseFloat( data[ 0 ] ), parseFloat( data[ 4 ] ), parseFloat( data[ 8 ] ), parseFloat( data[ 12 ] ), parseFloat( data[ 1 ] ), parseFloat( data[ 5 ] ), parseFloat( data[ 9 ] ), parseFloat( data[ 13 ] ), parseFloat( data[ 2 ] ), parseFloat( data[ 6 ] ), parseFloat( data[ 10 ] ), parseFloat( data[ 14 ] ), parseFloat( data[ 3 ] ), parseFloat( data[ 7 ] ), parseFloat( data[ 11 ] ), parseFloat( data[ 15 ] ) );

	},

	MakeOutputGeometry: function ( nowFrameName, _zflg ) {

		var scope = this;
		if ( scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].Geometry != null ) {

			scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].Geometry.computeBoundingBox();
			scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].Geometry.computeBoundingSphere();
			if ( ! scope.loadingXdata.faceNormalFromFile ) {

				scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].Geometry.computeFaceNormals();

			}
			if ( ! scope.loadingXdata.vertexNormalFromFile ) {

				scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].Geometry.computeVertexNormals();

			}
			scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].Geometry.verticesNeedUpdate = true;
			scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].Geometry.normalsNeedUpdate = true;
			scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].Geometry.colorsNeedUpdate = true;
			scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].Geometry.uvsNeedUpdate = true;
			scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].Geometry.groupsNeedUpdate = true;
			var putBones = [];
			var BoneInverse = [];
			if ( scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].BoneInfs != null && scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].BoneInfs.length ) {

				var keys = Object.keys( scope.loadingXdata.FrameInfo_Raw );
				var BoneDics_Name = [];
				for ( var m = 0; m < keys.length; m ++ ) {

					if ( scope.loadingXdata.FrameInfo_Raw[ keys[ m ] ].FrameStartLv <= scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].FrameStartLv && nowFrameName != keys[ m ] ) {

						continue;

					}
					var b = new THREE.Bone();
					b.name = keys[ m ];
					b.applyMatrix( scope.loadingXdata.FrameInfo_Raw[ keys[ m ] ].FrameTransformMatrix );
					BoneDics_Name[ b.name ] = putBones.length;
					putBones.push( b );
					var ivm = new THREE.Matrix4();
					ivm.getInverse( scope.loadingXdata.FrameInfo_Raw[ keys[ m ] ].FrameTransformMatrix );
					BoneInverse.push( ivm );

				}
				for ( var _m = 0; _m < putBones.length; _m ++ ) {

					for ( var dx = 0; dx < scope.loadingXdata.FrameInfo_Raw[ putBones[ _m ].name ].children.length; dx ++ ) {

						var nowBoneIndex = BoneDics_Name[ scope.loadingXdata.FrameInfo_Raw[ putBones[ _m ].name ].children[ dx ] ];
						if ( putBones[ nowBoneIndex ] != null ) {

							putBones[ _m ].add( putBones[ nowBoneIndex ] );

						}

					}

				}

			}
			var mesh = null;
			var bufferGeometry = new THREE.BufferGeometry();
			if ( putBones.length > 0 ) {

				if ( scope.loadingXdata.FrameInfo_Raw[ putBones[ 0 ].name ].children.length === 0 && nowFrameName != putBones[ 0 ].name ) {

					putBones[ 0 ].add( putBones[ 1 ] );
					putBones[ 0 ].zflag = _zflg;

				}
				for ( var _m2 = 0; _m2 < putBones.length; _m2 ++ ) {

					if ( putBones[ _m2 ].parent === null ) {

						putBones[ _m2 ].zflag = _zflg;

					}
					for ( var bi = 0; bi < scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].BoneInfs.length; bi ++ ) {

						if ( putBones[ _m2 ].name === scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].BoneInfs[ bi ].boneName ) {

							for ( var vi = 0; vi < scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].BoneInfs[ bi ].Indeces.length; vi ++ ) {

								var nowVertexID = scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].BoneInfs[ bi ].Indeces[ vi ];
								var nowVal = scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].BoneInfs[ bi ].Weights[ vi ];
								switch ( scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].VertexSetedBoneCount[ nowVertexID ] ) {

									case 0:
										scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].Geometry.skinIndices[ nowVertexID ].x = _m2;
										scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].Geometry.skinWeights[ nowVertexID ].x = nowVal;
										break;
									case 1:
										scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].Geometry.skinIndices[ nowVertexID ].y = _m2;
										scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].Geometry.skinWeights[ nowVertexID ].y = nowVal;
										break;
									case 2:
										scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].Geometry.skinIndices[ nowVertexID ].z = _m2;
										scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].Geometry.skinWeights[ nowVertexID ].z = nowVal;
										break;
									case 3:
										scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].Geometry.skinIndices[ nowVertexID ].w = _m2;
										scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].Geometry.skinWeights[ nowVertexID ].w = nowVal;
										break;

								}
								scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].VertexSetedBoneCount[ nowVertexID ] ++;

							}
							break;

						}

					}

				}
				for ( var sk = 0; sk < scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].Materials.length; sk ++ ) {

					scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].Materials[ sk ].skinning = true;

				}
				mesh = new THREE.SkinnedMesh( bufferGeometry.fromGeometry( scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].Geometry ), scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].Materials );
				var skeleton = new THREE.Skeleton( putBones /*, BoneInverse*/ );
				mesh.add( putBones[ 0 ] );
				mesh.bind( skeleton );

			} else {

				mesh = new THREE.Mesh( bufferGeometry.fromGeometry( scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].Geometry ), scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].Materials );

			}
			mesh.name = nowFrameName;
			scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].Mesh = mesh;
			scope.loadingXdata.FrameInfo_Raw[ nowFrameName ].Geometry = null;

		}

	},

	animationFinalize: function () {

		var scope = this;
		scope.animeKeyNames = Object.keys( scope.loadingXdata.AnimationSetInfo );
		if ( scope.animeKeyNames != null && scope.animeKeyNames.length > 0 ) {

			scope.nowReaded = 0;
			scope.loadingXdata.XAnimationObj = [];
			scope.animationFinalize_step();

		} else {

			scope.finalproc();

		}

	},

	animationFinalize_step: function () {

		var scope = this;
		var i = scope.nowReaded;
		var tgtModel = null;
		for ( var m = 0; m < scope.loadingXdata.FrameInfo.length; m ++ ) {

			var keys2 = Object.keys( scope.loadingXdata.AnimationSetInfo[ scope.animeKeyNames[ i ] ] );
			if ( scope.loadingXdata.AnimationSetInfo[ scope.animeKeyNames[ i ] ][ keys2[ 0 ] ].boneName == scope.loadingXdata.FrameInfo[ m ].name ) {

				tgtModel = scope.loadingXdata.FrameInfo[ m ];
				break;

			}

		}
		if ( tgtModel != null ) {

			scope.loadingXdata.XAnimationObj[ i ] = new THREE.XLoader.XAnimationObj();
			scope.loadingXdata.XAnimationObj[ i ].fps = scope.loadingXdata.AnimTicksPerSecond;
			scope.loadingXdata.XAnimationObj[ i ].name = scope.animeKeyNames[ i ];
			scope.loadingXdata.XAnimationObj[ i ].make( scope.loadingXdata.AnimationSetInfo[ scope.animeKeyNames[ i ] ], tgtModel );

		}
		scope.nowReaded ++;
		if ( scope.nowReaded >= scope.animeKeyNames.length ) {

			scope.loadingXdata.AnimationSetInfo = null;
			scope.finalproc();

		} else {

			scope.animationFinalize_step();

		}

	},

	finalproc: function () {

		var scope = this;
		setTimeout( function () {

			scope.onLoad( scope.loadingXdata );

		}, 1 );

	}
};

THREE.XLoader.XfileLoadMode = {
	none: - 1,
	Element: 1,
	FrameTransformMatrix_Read: 3,
	Mesh: 5,
	Vartex_init: 10,
	Vartex_Read: 11,
	Index_init: 20,
	index_Read: 21,
	Uv_init: 30,
	Uv_Read: 31,
	Normal_V_init: 40,
	Normal_V_Read: 41,
	Normal_I_init: 42,
	Normal_I_Read: 43,
	Mat_Face_init: 101,
	Mat_Face_len_Read: 102,
	Mat_Face_Set: 103,
	Mat_Set: 111,
	Mat_detail: 121,
	Mat_Set_Texture: 121,
	Mat_Set_LightTex: 122,
	Mat_Set_EmissiveTex: 123,
	Mat_Set_BumpTex: 124,
	Mat_Set_NormalTex: 125,
	Mat_Set_EnvTex: 126,
	Weit_init: 201,
	Weit_IndexLength: 202,
	Weit_Read_Index: 203,
	Weit_Read_Value: 204,
	Weit_Read_Matrx: 205,
	Anim_init: 1001,
	Anim_Reading: 1002,
	Anim_KeyValueTypeRead: 1003,
	Anim_KeyValueLength: 1004,
	Anime_ReadKeyFrame: 1005
};

THREE.XLoader.XAnimationObj = function () {

	this.fps = 30;
	this.name = 'xanimation';
	this.length = 0;
	this.hierarchy = [];

};

THREE.XLoader.XAnimationObj.prototype = {

	constructor: THREE.XLoader.XAnimationObj,

	make: function ( XAnimationInfoArray, mesh ) {

		var scope = this;
		var keys = Object.keys( XAnimationInfoArray );
		var hierarchy_tmp = [];
		for ( var i = 0; i < keys.length; i ++ ) {

			var bone = null;
			var parent = - 1;
			var baseIndex = - 1;
			for ( var m = 0; m < mesh.skeleton.bones.length; m ++ ) {

				if ( mesh.skeleton.bones[ m ].name == XAnimationInfoArray[ keys[ i ] ].boneName ) {

					bone = XAnimationInfoArray[ keys[ i ] ];
					parent = mesh.skeleton.bones[ m ].parent.name;
					baseIndex = m;
					break;

				}

			}
			hierarchy_tmp[ baseIndex ] = scope.makeBonekeys( XAnimationInfoArray[ keys[ i ] ], bone, parent );

		}
		var keys2 = Object.keys( hierarchy_tmp );
		for ( var _i = 0; _i < keys2.length; _i ++ ) {

			scope.hierarchy.push( hierarchy_tmp[ _i ] );
			var parentId = - 1;
			for ( var _m = 0; _m < scope.hierarchy.length; _m ++ ) {

				if ( _i != _m && scope.hierarchy[ _i ].parent === scope.hierarchy[ _m ].name ) {

					parentId = _m;
					break;

				}

			}
			scope.hierarchy[ _i ].parent = parentId;

		}

	},

	makeBonekeys: function ( XAnimationInfo, bone, parent ) {

		var refObj = {};
		refObj.name = bone.boneName;
		refObj.parent = parent;
		refObj.keys = [];
		for ( var i = 0; i < XAnimationInfo.keyFrames.length; i ++ ) {

			var keyframe = {};
			keyframe.time = XAnimationInfo.keyFrames[ i ].time * this.fps;
			keyframe.matrix = XAnimationInfo.keyFrames[ i ].matrix;
			keyframe.pos = new THREE.Vector3().setFromMatrixPosition( keyframe.matrix );
			keyframe.rot = new THREE.Quaternion().setFromRotationMatrix( keyframe.matrix );
			keyframe.scl = new THREE.Vector3().setFromMatrixScale( keyframe.matrix );
			refObj.keys.push( keyframe );

		}
		return refObj;

	}

};

THREE.XLoader.Xdata = function () {

	this.FrameInfo = [];
	this.FrameInfo_Raw = [];
	this.AnimationSetInfo = [];
	this.AnimTicksPerSecond = 60;
	this.XAnimationObj = null;

};

THREE.XLoader.XboneInf = function () {

	this.boneName = "";
	this.BoneIndex = 0;
	this.Indeces = [];
	this.Weights = [];
	this.initMatrix = null;
	this.OffsetMatrix = null;

};

THREE.XLoader.XAnimationInfo = function () {

	this.animeName = "";
	this.boneName = "";
	this.targetBone = null;
	this.frameStartLv = 0;
	this.keyFrames = [];
	this.InverseMx = null;

};

THREE.XLoader.XFrameInfo = function () {

	this.Mesh = null;
	this.Geometry = null;
	this.FrameName = "";
	this.ParentName = "";
	this.frameStartLv = 0;
	this.FrameTransformMatrix = null;
	this.children = [];
	this.BoneInfs = [];
	this.VertexSetedBoneCount = [];
	this.Materials = [];

};

THREE.XLoader.XKeyFrameInfo = function () {

	this.index = 0;
	this.Frame = 0;
	this.time = 0.0;
	this.matrix = null;

};
