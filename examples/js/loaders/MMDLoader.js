/**
 * @author takahiro / https://github.com/takahirox
 *
 * Dependencies
 *  - charset-encoder-js https://github.com/takahirox/charset-encoder-js
 *  - THREE.TGALoader
 *
 *
 * This loader loads and parses PMD/PMX and VMD binary files
 * then creates mesh for Three.js.
 *
 * PMD/PMX is a model data format and VMD is a motion data format
 * used in MMD(Miku Miku Dance).
 *
 * MMD is a 3D CG animation tool which is popular in Japan.
 *
 *
 * MMD official site
 *  http://www.geocities.jp/higuchuu4/index_e.htm
 *
 * PMD, VMD format
 *  http://blog.goo.ne.jp/torisu_tetosuki/e/209ad341d3ece2b1b4df24abf619d6e4
 *
 * PMX format
 *  http://gulshan-i-raz.geo.jp/labs/2012/10/17/pmx-format1/
 *
 *
 * TODO
 *  - light motion in vmd support.
 *  - SDEF support.
 *  - uv/material/bone morphing support.
 *  - more precise grant skinning support.
 *  - shadow support.
 */

THREE.MMDLoader = function ( showStatus, manager ) {

	THREE.Loader.call( this, showStatus );
	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
	this.defaultTexturePath = './models/default/';

};

THREE.MMDLoader.prototype = Object.create( THREE.Loader.prototype );
THREE.MMDLoader.prototype.constructor = THREE.MMDLoader;

THREE.MMDLoader.prototype.setDefaultTexturePath = function ( path ) {

	this.defaultTexturePath = path;

};

THREE.MMDLoader.prototype.load = function ( modelUrl, vmdUrls, callback, onProgress, onError ) {

	var scope = this;

	this.loadModel( modelUrl, function ( mesh ) {

		scope.loadVmds( vmdUrls, function ( vmd ) {

			scope.pourVmdIntoModel( mesh, vmd );
			callback( mesh );

		}, onProgress, onError );

	}, onProgress, onError );

};

THREE.MMDLoader.prototype.loadModel = function ( url, callback, onProgress, onError ) {

	var scope = this;

	var texturePath = this.extractUrlBase( url );
	var modelExtension = this.extractExtension( url );

	this.loadFileAsBuffer( url, function ( buffer ) {

		callback( scope.createModel( buffer, modelExtension, texturePath ) );

	}, onProgress, onError );

};

THREE.MMDLoader.prototype.createModel = function ( buffer, modelExtension, texturePath ) {

	return this.createMesh( this.parseModel( buffer, modelExtension ), texturePath );

};

THREE.MMDLoader.prototype.loadVmd = function ( url, callback, onProgress, onError ) {

	var scope = this;

	this.loadFileAsBuffer( url, function ( buffer ) {

		callback( scope.parseVmd( buffer ) );

	}, onProgress, onError );

};

THREE.MMDLoader.prototype.loadVmds = function ( urls, callback, onProgress, onError ) {

	var scope = this;

	var vmds = [];

	function run () {

		var url = urls.shift();

		scope.loadVmd( url, function ( vmd ) {

			vmds.push( vmd );

			if ( urls.length > 0 ) {

				run();

			} else {

				callback( scope.mergeVmds( vmds ) );

			}

		}, onProgress, onError );

	};

	run();

};

THREE.MMDLoader.prototype.loadAudio = function ( url, callback, onProgress, onError ) {

	var listener = new THREE.AudioListener();
	var audio = new THREE.Audio( listener );
	var loader = new THREE.AudioLoader( this.manager );

	loader.load( url, function ( buffer ) {

		audio.setBuffer( buffer );
		callback( audio, listener );

	}, onProgress, onError );

};

THREE.MMDLoader.prototype.loadVpd = function ( url, callback, onProgress, onError, params ) {

	var scope = this;

	var func = ( ( params && params.charcode === 'unicode' ) ? this.loadFileAsText : this.loadFileAsShiftJISText ).bind( this );

	func( url, function ( text ) {

		callback( scope.parseVpd( text ) );

	}, onProgress, onError );

};

THREE.MMDLoader.prototype.mergeVmds = function ( vmds ) {

	var v = {};
	v.metadata = {};
	v.metadata.name = vmds[ 0 ].metadata.name;
	v.metadata.coordinateSystem = vmds[ 0 ].metadata.coordinateSystem;
	v.metadata.motionCount = 0;
	v.metadata.morphCount = 0;
	v.metadata.cameraCount = 0;
	v.motions = [];
	v.morphs = [];
	v.cameras = [];

	for ( var i = 0; i < vmds.length; i++ ) {

		var v2 = vmds[ i ];

		v.metadata.motionCount += v2.metadata.motionCount;
		v.metadata.morphCount += v2.metadata.morphCount;
		v.metadata.cameraCount += v2.metadata.cameraCount;

		for ( var j = 0; j < v2.metadata.motionCount; j++ ) {

			v.motions.push( v2.motions[ j ] );

		}

		for ( var j = 0; j < v2.metadata.morphCount; j++ ) {

			v.morphs.push( v2.morphs[ j ] );

		}

		for ( var j = 0; j < v2.metadata.cameraCount; j++ ) {

			v.cameras.push( v2.cameras[ j ] );

		}

	}

	return v;

};

THREE.MMDLoader.prototype.pourVmdIntoModel = function ( mesh, vmd, name ) {

	this.createAnimation( mesh, vmd, name );

};

THREE.MMDLoader.prototype.pourVmdIntoCamera = function ( camera, vmd, name ) {

	var helper = new THREE.MMDLoader.DataCreationHelper();

	var initAnimation = function () {

		var orderedMotions = helper.createOrderedMotionArray( vmd.cameras );

		var q = new THREE.Quaternion();
		var e = new THREE.Euler();
		var pkeys = [];
		var ckeys = [];
		var ukeys = [];
		var fkeys = [];

		for ( var i = 0; i < orderedMotions.length; i++ ) {

			var m = orderedMotions[ i ];
			var t = m.frameNum / 30;
			var p = m.position;
			var r = m.rotation;
			var d = m.distance;
			var f = m.fov;

			var position = new THREE.Vector3( 0, 0, -d );
			var center = new THREE.Vector3( p[ 0 ], p[ 1 ], p[ 2 ] );
			var up = new THREE.Vector3( 0, 1, 0 );

			e.set( -r[ 0 ], -r[ 1 ], -r[ 2 ] );
			q.setFromEuler( e );

			position.add( center );
			position.applyQuaternion( q );

			up.applyQuaternion( q );

			helper.pushAnimationKey( pkeys, t, position, true );
			helper.pushAnimationKey( ckeys, t, center, true );
			helper.pushAnimationKey( ukeys, t, up, true );
			helper.pushAnimationKey( fkeys, t, f, true );

		}

		helper.insertAnimationKeyAtTimeZero( pkeys, new THREE.Vector3( 0, 0, 0 ) );
		helper.insertAnimationKeyAtTimeZero( ckeys, new THREE.Vector3( 0, 0, 0 ) );
		helper.insertAnimationKeyAtTimeZero( ukeys, new THREE.Vector3( 0, 0, 0 ) );
		helper.insertAnimationKeyAtTimeZero( fkeys, 45 );

		helper.insertStartAnimationKey( pkeys );
		helper.insertStartAnimationKey( ckeys );
		helper.insertStartAnimationKey( ukeys );
		helper.insertStartAnimationKey( fkeys );

		var tracks = [];

		tracks.push( helper.generateTrackFromAnimationKeys( pkeys, 'VectorKeyframeTrackEx', '.position' ) );
		tracks.push( helper.generateTrackFromAnimationKeys( ckeys, 'VectorKeyframeTrackEx', '.center' ) );
		tracks.push( helper.generateTrackFromAnimationKeys( ukeys, 'VectorKeyframeTrackEx', '.up' ) );
		tracks.push( helper.generateTrackFromAnimationKeys( fkeys, 'NumberKeyframeTrackEx', '.fov' ) );

		camera.center = new THREE.Vector3( 0, 0, 0 );

		if ( camera.animations === undefined ) {

			camera.animations = [];

		}

		camera.animations.push( new THREE.AnimationClip( name === undefined ? THREE.Math.generateUUID() : name, -1, tracks ) );

	};

	this.leftToRightVmd( vmd );

	initAnimation();

};

THREE.MMDLoader.prototype.extractExtension = function ( url ) {

	var index = url.lastIndexOf( '.' );

	if ( index < 0 ) {

		return null;

	}

	return url.slice( index + 1 );

};

THREE.MMDLoader.prototype.loadFile = function ( url, onLoad, onProgress, onError, responseType ) {

	var loader = new THREE.XHRLoader( this.manager );

	loader.setResponseType( responseType );

	var request = loader.load( url, function ( result ) {

		onLoad( result );

	}, onProgress, onError );

	return request;

};

THREE.MMDLoader.prototype.loadFileAsBuffer = function ( url, onLoad, onProgress, onError ) {

	this.loadFile( url, onLoad, onProgress, onError, 'arraybuffer' );

};

THREE.MMDLoader.prototype.loadFileAsText = function ( url, onLoad, onProgress, onError ) {

	this.loadFile( url, onLoad, onProgress, onError, 'text' );

};

THREE.MMDLoader.prototype.loadFileAsShiftJISText = function ( url, onLoad, onProgress, onError ) {

	var request = this.loadFile( url, onLoad, onProgress, onError, 'text' );

	/*
	 * TODO: some browsers seem not support overrideMimeType
	 *       so some workarounds for them may be necessary.
	 * Note: to set property of request after calling request.send(null)
	 *       (it's called in THREE.XHRLoader.load()) could be a bad manner.
	 */
	request.overrideMimeType( 'text/plain; charset=shift_jis' );

};

THREE.MMDLoader.prototype.parseModel = function ( buffer, modelExtension ) {

	// Should I judge from model data header?
	switch( modelExtension.toLowerCase() ) {

		case 'pmd':
			return this.parsePmd( buffer );

		case 'pmx':
			return this.parsePmx( buffer );

		default:
			throw 'extension ' + modelExtension + ' is not supported.';

	}

};

THREE.MMDLoader.prototype.parsePmd = function ( buffer ) {

	var scope = this;
	var pmd = {};
	var dv = new THREE.MMDLoader.DataView( buffer );
	var helper = new THREE.MMDLoader.DataCreationHelper();

	pmd.metadata = {};
	pmd.metadata.format = 'pmd';
	pmd.metadata.coordinateSystem = 'left';

	var parseHeader = function () {

		var metadata = pmd.metadata;
		metadata.magic = dv.getChars( 3 );

		if ( metadata.magic !== 'Pmd' ) {

			throw 'PMD file magic is not Pmd, but ' + metadata.magic;

		}

		metadata.version = dv.getFloat32();
		metadata.modelName = dv.getSjisStringsAsUnicode( 20 );
		metadata.comment = dv.getSjisStringsAsUnicode( 256 );

	};

	var parseVertices = function () {

		var parseVertex = function () {

			var p = {};
			p.position = dv.getFloat32Array( 3 );
			p.normal = dv.getFloat32Array( 3 );
			p.uv = dv.getFloat32Array( 2 );
			p.skinIndices = dv.getUint16Array( 2 );
			p.skinWeights = [ dv.getUint8() / 100 ];
			p.skinWeights.push( 1.0 - p.skinWeights[ 0 ] );
			p.edgeFlag = dv.getUint8();
			return p;

		};

		var metadata = pmd.metadata;
		metadata.vertexCount = dv.getUint32();

		pmd.vertices = [];

		for ( var i = 0; i < metadata.vertexCount; i++ ) {

			pmd.vertices.push( parseVertex() );

		}

	};

	var parseFaces = function () {

		var parseFace = function () {

			var p = {};
			p.indices = dv.getUint16Array( 3 );
			return p;

		};

		var metadata = pmd.metadata;
		metadata.faceCount = dv.getUint32() / 3;

		pmd.faces = [];

		for ( var i = 0; i < metadata.faceCount; i++ ) {

			pmd.faces.push( parseFace() );

		}

	};

	var parseMaterials = function () {

		var parseMaterial = function () {

			var p = {};
			p.diffuse = dv.getFloat32Array( 4 );
			p.shininess = dv.getFloat32();
			p.specular = dv.getFloat32Array( 3 );
			p.emissive = dv.getFloat32Array( 3 );
			p.toonIndex = dv.getInt8();
			p.edgeFlag = dv.getUint8();
			p.faceCount = dv.getUint32() / 3;
			p.fileName = dv.getSjisStringsAsUnicode( 20 );
			return p;

		};

		var metadata = pmd.metadata;
		metadata.materialCount = dv.getUint32();

		pmd.materials = [];

		for ( var i = 0; i < metadata.materialCount; i++ ) {

			pmd.materials.push( parseMaterial() );

		}

	};

	var parseBones = function () {

		var parseBone = function () {

			var p = {};
			// Skinning animation doesn't work when bone name is Japanese Unicode in r73.
			// So using charcode strings as workaround and keep original strings in .originalName.
			p.originalName = dv.getSjisStringsAsUnicode( 20 );
			p.name = helper.toCharcodeStrings( p.originalName );
			p.parentIndex = dv.getInt16();
			p.tailIndex = dv.getInt16();
			p.type = dv.getUint8();
			p.ikIndex = dv.getInt16();
			p.position = dv.getFloat32Array( 3 );
			return p;

		};

		var metadata = pmd.metadata;
		metadata.boneCount = dv.getUint16();

		pmd.bones = [];

		for ( var i = 0; i < metadata.boneCount; i++ ) {

			pmd.bones.push( parseBone() );

		}

	};

	var parseIks = function () {

		var parseIk = function () {

			var p = {};
			p.target = dv.getUint16();
			p.effector = dv.getUint16();
			p.linkCount = dv.getUint8();
			p.iteration = dv.getUint16();
			p.maxAngle = dv.getFloat32();

			p.links = [];
			for ( var i = 0; i < p.linkCount; i++ ) {

				var link = {}
				link.index = dv.getUint16();
				p.links.push( link );

			}

			return p;

		};

		var metadata = pmd.metadata;
		metadata.ikCount = dv.getUint16();

		pmd.iks = [];

		for ( var i = 0; i < metadata.ikCount; i++ ) {

			pmd.iks.push( parseIk() );

		}

	};

	var parseMorphs = function () {

		var parseMorph = function () {

			var p = {};
			p.name = dv.getSjisStringsAsUnicode( 20 );
			p.elementCount = dv.getUint32();
			p.type = dv.getUint8();

			p.elements = [];
			for ( var i = 0; i < p.elementCount; i++ ) {

				p.elements.push( {
					index: dv.getUint32(),
					position: dv.getFloat32Array( 3 )
				} ) ;

			}

			return p;

		};

		var metadata = pmd.metadata;
		metadata.morphCount = dv.getUint16();

		pmd.morphs = [];

		for ( var i = 0; i < metadata.morphCount; i++ ) {

			pmd.morphs.push( parseMorph() );

		}


	};

	var parseMorphFrames = function () {

		var parseMorphFrame = function () {

			var p = {};
			p.index = dv.getUint16();
			return p;

		};

		var metadata = pmd.metadata;
		metadata.morphFrameCount = dv.getUint8();

		pmd.morphFrames = [];

		for ( var i = 0; i < metadata.morphFrameCount; i++ ) {

			pmd.morphFrames.push( parseMorphFrame() );

		}

	};

	var parseBoneFrameNames = function () {

		var parseBoneFrameName = function () {

			var p = {};
			p.name = dv.getSjisStringsAsUnicode( 50 );
			return p;

		};

		var metadata = pmd.metadata;
		metadata.boneFrameNameCount = dv.getUint8();

		pmd.boneFrameNames = [];

		for ( var i = 0; i < metadata.boneFrameNameCount; i++ ) {

			pmd.boneFrameNames.push( parseBoneFrameName() );

		}

	};

	var parseBoneFrames = function () {

		var parseBoneFrame = function () {

			var p = {};
			p.boneIndex = dv.getInt16();
			p.frameIndex = dv.getUint8();
			return p;

		};

		var metadata = pmd.metadata;
		metadata.boneFrameCount = dv.getUint32();

		pmd.boneFrames = [];

		for ( var i = 0; i < metadata.boneFrameCount; i++ ) {

			pmd.boneFrames.push( parseBoneFrame() );

		}

	};

	var parseEnglishHeader = function () {

		var metadata = pmd.metadata;
		metadata.englishCompatibility = dv.getUint8();

		if ( metadata.englishCompatibility > 0 ) {

			metadata.englishModelName = dv.getSjisStringsAsUnicode( 20 );
			metadata.englishComment = dv.getSjisStringsAsUnicode( 256 );

		}

	};

	var parseEnglishBoneNames = function () {

		var parseEnglishBoneName = function () {

			var p = {};
			p.name = dv.getSjisStringsAsUnicode( 20 );
			return p;

		};

		var metadata = pmd.metadata;

		if ( metadata.englishCompatibility === 0 ) {

			return;

		}

		pmd.englishBoneNames = [];

		for ( var i = 0; i < metadata.boneCount; i++ ) {

			pmd.englishBoneNames.push( parseEnglishBoneName() );

		}

	};

	var parseEnglishMorphNames = function () {

		var parseEnglishMorphName = function () {

			var p = {};
			p.name = dv.getSjisStringsAsUnicode( 20 );
			return p;

		};

		var metadata = pmd.metadata;

		if ( metadata.englishCompatibility === 0 ) {

			return;

		}

		pmd.englishMorphNames = [];

		for ( var i = 0; i < metadata.morphCount - 1; i++ ) {

			pmd.englishMorphNames.push( parseEnglishMorphName() );

		}

	};

	var parseEnglishBoneFrameNames = function () {

		var parseEnglishBoneFrameName = function () {

			var p = {};
			p.name = dv.getSjisStringsAsUnicode( 50 );
			return p;

		};

		var metadata = pmd.metadata;

		if ( metadata.englishCompatibility === 0 ) {

			return;

		}

		pmd.englishBoneFrameNames = [];

		for ( var i = 0; i < metadata.boneFrameNameCount; i++ ) {

			pmd.englishBoneFrameNames.push( parseEnglishBoneFrameName() );

		}

	};

	var parseToonTextures = function () {

		var parseToonTexture = function () {

			var p = {};
			p.fileName = dv.getSjisStringsAsUnicode( 100 );
			return p;

		};

		pmd.toonTextures = [];

		for ( var i = 0; i < 10; i++ ) {

			pmd.toonTextures.push( parseToonTexture() );

		}

	};

	var parseRigidBodies = function () {

		var parseRigidBody = function () {

			var p = {};
			p.name = dv.getSjisStringsAsUnicode( 20 );
			p.boneIndex = dv.getInt16();
			p.groupIndex = dv.getUint8();
			p.groupTarget = dv.getUint16();
			p.shapeType = dv.getUint8();
			p.width = dv.getFloat32();
			p.height = dv.getFloat32();
			p.depth = dv.getFloat32();
			p.position = dv.getFloat32Array( 3 );
			p.rotation = dv.getFloat32Array( 3 );
			p.weight = dv.getFloat32();
			p.positionDamping = dv.getFloat32();
			p.rotationDamping = dv.getFloat32();
			p.restriction = dv.getFloat32();
			p.friction = dv.getFloat32();
			p.type = dv.getUint8();
			return p;

		};

		var metadata = pmd.metadata;
		metadata.rigidBodyCount = dv.getUint32();

		pmd.rigidBodies = [];

		for ( var i = 0; i < metadata.rigidBodyCount; i++ ) {

			pmd.rigidBodies.push( parseRigidBody() );

		}

	};

	var parseConstraints = function () {

		var parseConstraint = function () {

			var p = {};
			p.name = dv.getSjisStringsAsUnicode( 20 );
			p.rigidBodyIndex1 = dv.getUint32();
			p.rigidBodyIndex2 = dv.getUint32();
			p.position = dv.getFloat32Array( 3 );
			p.rotation = dv.getFloat32Array( 3 );
			p.translationLimitation1 = dv.getFloat32Array( 3 );
			p.translationLimitation2 = dv.getFloat32Array( 3 );
			p.rotationLimitation1 = dv.getFloat32Array( 3 );
			p.rotationLimitation2 = dv.getFloat32Array( 3 );
			p.springPosition = dv.getFloat32Array( 3 );
			p.springRotation = dv.getFloat32Array( 3 );
			return p;

		};

		var metadata = pmd.metadata;
		metadata.constraintCount = dv.getUint32();

		pmd.constraints = [];

		for ( var i = 0; i < metadata.constraintCount; i++ ) {

			pmd.constraints.push( parseConstraint() );

		}

	};

	parseHeader();
	parseVertices();
	parseFaces();
	parseMaterials();
	parseBones();
	parseIks();
	parseMorphs();
	parseMorphFrames();
	parseBoneFrameNames();
	parseBoneFrames();
	parseEnglishHeader();
	parseEnglishBoneNames();
	parseEnglishMorphNames();
	parseEnglishBoneFrameNames();
	parseToonTextures();
	parseRigidBodies();
	parseConstraints();

	// console.log( pmd ); // for console debug

	return pmd;

};

THREE.MMDLoader.prototype.parsePmx = function ( buffer ) {

	var scope = this;
	var pmx = {};
	var dv = new THREE.MMDLoader.DataView( buffer );
	var helper = new THREE.MMDLoader.DataCreationHelper();

	pmx.metadata = {};
	pmx.metadata.format = 'pmx';
	pmx.metadata.coordinateSystem = 'left';

	var parseHeader = function () {

		var metadata = pmx.metadata;
		metadata.magic = dv.getChars( 4 );

		// Note: don't remove the last blank space.
		if ( metadata.magic !== 'PMX ' ) {

			throw 'PMX file magic is not PMX , but ' + metadata.magic;

		}

		metadata.version = dv.getFloat32();

		if ( metadata.version !== 2.0 && metadata.version !== 2.1 ) {

			throw 'PMX version ' + metadata.version + ' is not supported.';

		}

		metadata.headerSize = dv.getUint8();
		metadata.encoding = dv.getUint8();
		metadata.additionalUvNum = dv.getUint8();
		metadata.vertexIndexSize = dv.getUint8();
		metadata.textureIndexSize = dv.getUint8();
		metadata.materialIndexSize = dv.getUint8();
		metadata.boneIndexSize = dv.getUint8();
		metadata.morphIndexSize = dv.getUint8();
		metadata.rigidBodyIndexSize = dv.getUint8();
		metadata.modelName = dv.getTextBuffer();
		metadata.englishModelName = dv.getTextBuffer();
		metadata.comment = dv.getTextBuffer();
		metadata.englishComment = dv.getTextBuffer();

	};

	var parseVertices = function () {

		var parseVertex = function () {

			var p = {};
			p.position = dv.getFloat32Array( 3 );
			p.normal = dv.getFloat32Array( 3 );
			p.uv = dv.getFloat32Array( 2 );

			p.auvs = [];

			for ( var i = 0; i < pmx.metadata.additionalUvNum; i++ ) {

				p.auvs.push( dv.getFloat32Array( 4 ) );

			}

			p.type = dv.getUint8();

			var indexSize = metadata.boneIndexSize;

			if ( p.type === 0 ) {  // BDEF1

				p.skinIndices = dv.getIndexArray( indexSize, 1 );
				p.skinWeights = [ 1.0 ];

			} else if ( p.type === 1 ) {  // BDEF2

				p.skinIndices = dv.getIndexArray( indexSize, 2 );
				p.skinWeights = dv.getFloat32Array( 1 );
				p.skinWeights.push( 1.0 - p.skinWeights[ 0 ] );

			} else if ( p.type === 2 ) {  // BDEF4

				p.skinIndices = dv.getIndexArray( indexSize, 4 );
				p.skinWeights = dv.getFloat32Array( 4 );

			} else if ( p.type === 3 ) {  // SDEF

				p.skinIndices = dv.getIndexArray( indexSize, 2 );
				p.skinWeights = dv.getFloat32Array( 1 );
				p.skinWeights.push( 1.0 - p.skinWeights[ 0 ] );

				p.skinC = dv.getFloat32Array( 3 );
				p.skinR0 = dv.getFloat32Array( 3 );
				p.skinR1 = dv.getFloat32Array( 3 );

				// SDEF is not supported yet and is handled as BDEF2 so far.
				// TODO: SDEF support
				p.type = 1;

			} else {

				throw 'unsupport bone type ' + p.type + ' exception.';

			}

			p.edgeRatio = dv.getFloat32();
			return p;

		};

		var metadata = pmx.metadata;
		metadata.vertexCount = dv.getUint32();

		pmx.vertices = [];

		for ( var i = 0; i < metadata.vertexCount; i++ ) {

			pmx.vertices.push( parseVertex() );

		}

	};

	var parseFaces = function () {

		var parseFace = function () {

			var p = {};
			p.indices = dv.getIndexArray( metadata.vertexIndexSize, 3 );
			return p;

		};

		var metadata = pmx.metadata;
		metadata.faceCount = dv.getUint32() / 3;

		pmx.faces = [];

		for ( var i = 0; i < metadata.faceCount; i++ ) {

			pmx.faces.push( parseFace() );

		}

	};

	var parseTextures = function () {

		var parseTexture = function () {

			return dv.getTextBuffer();

		};

		var metadata = pmx.metadata;
		metadata.textureCount = dv.getUint32();

		pmx.textures = [];

		for ( var i = 0; i < metadata.textureCount; i++ ) {

			pmx.textures.push( parseTexture() );

		}

	};

	var parseMaterials = function () {

		var parseMaterial = function () {

			var p = {};
			p.name = dv.getTextBuffer();
			p.englishName = dv.getTextBuffer();
			p.diffuse = dv.getFloat32Array( 4 );
			p.specular = dv.getFloat32Array( 3 );
			p.shininess = dv.getFloat32();
			p.emissive = dv.getFloat32Array( 3 );
			p.flag = dv.getUint8();
			p.edgeColor = dv.getFloat32Array( 4 );
			p.edgeSize = dv.getFloat32();
			p.textureIndex = dv.getIndex( pmx.metadata.textureIndexSize );
			p.envTextureIndex = dv.getIndex( pmx.metadata.textureIndexSize );
			p.envFlag = dv.getUint8();
			p.toonFlag = dv.getUint8();

			if ( p.toonFlag === 0 ) {

				p.toonIndex = dv.getIndex( pmx.metadata.textureIndexSize );

			} else if ( p.toonFlag === 1 ) {

				p.toonIndex = dv.getInt8();

			} else {

				throw 'unknown toon flag ' + p.toonFlag + ' exception.';

			}

			p.comment = dv.getTextBuffer();
			p.faceCount = dv.getUint32() / 3;
			return p;

		};

		var metadata = pmx.metadata;
		metadata.materialCount = dv.getUint32();

		pmx.materials = [];

		for ( var i = 0; i < metadata.materialCount; i++ ) {

			pmx.materials.push( parseMaterial() );

		}

	};

	var parseBones = function () {

		var parseBone = function () {

			var p = {};
			// Skinning animation doesn't work when bone name is Japanese Unicode in r73.
			// So using charcode strings as workaround and keep original strings in .originalName.
			p.originalName = dv.getTextBuffer();
			p.name = helper.toCharcodeStrings( p.originalName );
			p.englishName = dv.getTextBuffer();
			p.position = dv.getFloat32Array( 3 );
			p.parentIndex = dv.getIndex( pmx.metadata.boneIndexSize );
			p.transformationClass = dv.getUint32();
			p.flag = dv.getUint16();

			if ( p.flag & 0x1 ) {

				p.connectIndex = dv.getIndex( pmx.metadata.boneIndexSize );

			} else {

				p.offsetPosition = dv.getFloat32Array( 3 );

			}

			if ( p.flag & 0x100 || p.flag & 0x200 ) {

				// Note: I don't think Grant is an appropriate name
				//       but I found that some English translated MMD tools use this term
				//       so I've named it Grant so far.
				//       I'd rename to more appropriate name from Grant later.
				var grant = {};

				grant.isLocal = ( p.flag & 0x80 ) !== 0 ? true : false;
				grant.affectRotation = ( p.flag & 0x100 ) !== 0 ? true : false;
				grant.affectPosition = ( p.flag & 0x200 ) !== 0 ? true : false;
				grant.parentIndex = dv.getIndex( pmx.metadata.boneIndexSize );
				grant.ratio = dv.getFloat32();

				p.grant = grant;

			}

			if ( p.flag & 0x400 ) {

				p.fixAxis = dv.getFloat32Array( 3 );

			}

			if ( p.flag & 0x800 ) {

				p.localXVector = dv.getFloat32Array( 3 );
				p.localZVector = dv.getFloat32Array( 3 );

			}

			if ( p.flag & 0x2000 ) {

				p.key = dv.getUint32();

			}

			if ( p.flag & 0x20 ) {

				var ik = {};

				ik.effector = dv.getIndex( pmx.metadata.boneIndexSize );
				ik.target = null;
				ik.iteration = dv.getUint32();
				ik.maxAngle = dv.getFloat32();
				ik.linkCount = dv.getUint32();
				ik.links = [];

				for ( var i = 0; i < ik.linkCount; i++ ) {

					var link = {};
					link.index = dv.getIndex( pmx.metadata.boneIndexSize );
					link.angleLimitation = dv.getUint8();

					if ( link.angleLimitation === 1 ) {

						link.lowerLimitationAngle = dv.getFloat32Array( 3 );
						link.upperLimitationAngle = dv.getFloat32Array( 3 );

					}

					ik.links.push( link );

				}

				p.ik = ik;
			}

			return p;

		};

		var metadata = pmx.metadata;
		metadata.boneCount = dv.getUint32();

		pmx.bones = [];

		for ( var i = 0; i < metadata.boneCount; i++ ) {

			pmx.bones.push( parseBone() );

		}

	};

	var parseMorphs = function () {

		var parseMorph = function () {

			var p = {};
			p.name = dv.getTextBuffer();
			p.englishName = dv.getTextBuffer();
			p.panel = dv.getUint8();
			p.type = dv.getUint8();
			p.elementCount = dv.getUint32();
			p.elements = [];

			for ( var i = 0; i < p.elementCount; i++ ) {

				if ( p.type === 0 ) {  // group morph

					var m = {};
					m.index = dv.getIndex( pmx.metadata.morphIndexSize );
					m.ratio = dv.getFloat32();
					p.elements.push( m );

				} else if ( p.type === 1 ) {  // vertex morph

					var m = {};
					m.index = dv.getIndex( pmx.metadata.vertexIndexSize );
					m.position = dv.getFloat32Array( 3 );
					p.elements.push( m );

				} else if ( p.type === 2 ) {  // bone morph

					var m = {};
					m.index = dv.getIndex( pmx.metadata.boneIndexSize );
					m.position = dv.getFloat32Array( 3 );
					m.rotation = dv.getFloat32Array( 4 );
					p.elements.push( m );

				} else if ( p.type === 3 ) {  // uv morph

					var m = {};
					m.index = dv.getIndex( pmx.metadata.vertexIndexSize );
					m.uv = dv.getFloat32Array( 4 );
					p.elements.push( m );

				} else if ( p.type === 8 ) {  // material morph

					var m = {};
					m.index = dv.getIndex( pmx.metadata.materialIndexSize );
					m.type = dv.getUint8();
					m.diffuse = dv.getFloat32Array( 4 );
					m.specular = dv.getFloat32Array( 3 );
					m.shininess = dv.getFloat32();
					m.emissive = dv.getFloat32Array( 3 );
					m.edgeColor = dv.getFloat32Array( 4 );
					m.edgeSize = dv.getFloat32();
					m.textureColor = dv.getFloat32Array( 4 );
					m.sphereTextureColor = dv.getFloat32Array( 4 );
					m.toonColor = dv.getFloat32Array( 4 );
					p.elements.push( m );

				}

			}

			return p;

		};

		var metadata = pmx.metadata;
		metadata.morphCount = dv.getUint32();

		pmx.morphs = [];

		for ( var i = 0; i < metadata.morphCount; i++ ) {

			pmx.morphs.push( parseMorph() );

		}


	};

	var parseFrames = function () {

		var parseFrame = function () {

			var p = {};
			p.name = dv.getTextBuffer();
			p.englishName = dv.getTextBuffer();
			p.type = dv.getUint8();
			p.elementCount = dv.getUint32();
			p.elements = [];

			for ( var i = 0; i < p.elementCount; i++ ) {

				var e = {};
				e.target = dv.getUint8();
				e.index = ( e.target === 0 ) ? dv.getIndex( pmx.metadata.boneIndexSize ) : dv.getIndex( pmx.metadata.morphIndexSize );
				p.elements.push( e );

			}

			return p;

		};

		var metadata = pmx.metadata;
		metadata.frameCount = dv.getUint32();

		pmx.frames = [];

		for ( var i = 0; i < metadata.frameCount; i++ ) {

			pmx.frames.push( parseFrame() );

		}

	};

	var parseRigidBodies = function () {

		var parseRigidBody = function () {

			var p = {};
			p.name = dv.getTextBuffer();
			p.englishName = dv.getTextBuffer();
			p.boneIndex = dv.getIndex( pmx.metadata.boneIndexSize );
			p.groupIndex = dv.getUint8();
			p.groupTarget = dv.getUint16();
			p.shapeType = dv.getUint8();
			p.width = dv.getFloat32();
			p.height = dv.getFloat32();
			p.depth = dv.getFloat32();
			p.position = dv.getFloat32Array( 3 );
			p.rotation = dv.getFloat32Array( 3 );
			p.weight = dv.getFloat32();
			p.positionDamping = dv.getFloat32();
			p.rotationDamping = dv.getFloat32();
			p.restriction = dv.getFloat32();
			p.friction = dv.getFloat32();
			p.type = dv.getUint8();
			return p;

		};

		var metadata = pmx.metadata;
		metadata.rigidBodyCount = dv.getUint32();

		pmx.rigidBodies = [];

		for ( var i = 0; i < metadata.rigidBodyCount; i++ ) {

			pmx.rigidBodies.push( parseRigidBody() );

		}

	};

	var parseConstraints = function () {

		var parseConstraint = function () {

			var p = {};
			p.name = dv.getTextBuffer();
			p.englishName = dv.getTextBuffer();
			p.type = dv.getUint8();
			p.rigidBodyIndex1 = dv.getIndex( pmx.metadata.rigidBodyIndexSize );
			p.rigidBodyIndex2 = dv.getIndex( pmx.metadata.rigidBodyIndexSize );
			p.position = dv.getFloat32Array( 3 );
			p.rotation = dv.getFloat32Array( 3 );
			p.translationLimitation1 = dv.getFloat32Array( 3 );
			p.translationLimitation2 = dv.getFloat32Array( 3 );
			p.rotationLimitation1 = dv.getFloat32Array( 3 );
			p.rotationLimitation2 = dv.getFloat32Array( 3 );
			p.springPosition = dv.getFloat32Array( 3 );
			p.springRotation = dv.getFloat32Array( 3 );
			return p;

		};

		var metadata = pmx.metadata;
		metadata.constraintCount = dv.getUint32();

		pmx.constraints = [];

		for ( var i = 0; i < metadata.constraintCount; i++ ) {

			pmx.constraints.push( parseConstraint() );

		}

	};

	parseHeader();
	parseVertices();
	parseFaces();
	parseTextures();
	parseMaterials();
	parseBones();
	parseMorphs();
	parseFrames();
	parseRigidBodies();
	parseConstraints();

	// console.log( pmx ); // for console debug

	return pmx;

};

THREE.MMDLoader.prototype.parseVmd = function ( buffer ) {

	var scope = this;
	var vmd = {};
	var dv = new THREE.MMDLoader.DataView( buffer );
	var helper = new THREE.MMDLoader.DataCreationHelper();

	vmd.metadata = {};
	vmd.metadata.coordinateSystem = 'left';

	var parseHeader = function () {

		var metadata = vmd.metadata;
		metadata.magic = dv.getChars( 30 );

		if ( metadata.magic !== 'Vocaloid Motion Data 0002' ) {

			throw 'VMD file magic is not Vocaloid Motion Data 0002, but ' + metadata.magic;

		}

		metadata.name = dv.getSjisStringsAsUnicode( 20 );

	};

	var parseMotions = function () {

		var parseMotion = function () {

			var p = {};
			// Skinning animation doesn't work when bone name is Japanese Unicode in r73.
			// So using charcode strings as workaround and keep original strings in .originalName.
			p.originalBoneName = dv.getSjisStringsAsUnicode( 15 );
			p.boneName = helper.toCharcodeStrings( p.originalBoneName );
			p.frameNum = dv.getUint32();
			p.position = dv.getFloat32Array( 3 );
			p.rotation = dv.getFloat32Array( 4 );
			p.interpolation = dv.getUint8Array( 64 );

			return p;

		};

		var metadata = vmd.metadata;
		metadata.motionCount = dv.getUint32();

		vmd.motions = [];
		for ( var i = 0; i < metadata.motionCount; i++ ) {

			vmd.motions.push( parseMotion() );

		}

	};

	var parseMorphs = function () {

		var parseMorph = function () {

			var p = {};
			p.morphName = dv.getSjisStringsAsUnicode( 15 );
			p.frameNum = dv.getUint32();
			p.weight = dv.getFloat32();
			return p;

		};

		var metadata = vmd.metadata;
		metadata.morphCount = dv.getUint32();

		vmd.morphs = [];
		for ( var i = 0; i < metadata.morphCount; i++ ) {

			vmd.morphs.push( parseMorph() );

		}

	};

	var parseCameras = function () {

		var parseCamera = function () {

			var p = {};
			p.frameNum = dv.getUint32();
			p.distance = dv.getFloat32();
			p.position = dv.getFloat32Array( 3 );
			p.rotation = dv.getFloat32Array( 3 );
			p.interpolation = dv.getUint8Array( 24 );
			p.fov = dv.getUint32();
			p.perspective = dv.getUint8();
			return p;

		};

		var metadata = vmd.metadata;
		metadata.cameraCount = dv.getUint32();

		vmd.cameras = [];
		for ( var i = 0; i < metadata.cameraCount; i++ ) {

			vmd.cameras.push( parseCamera() );

		}

	};

	parseHeader();
	parseMotions();
	parseMorphs();
	parseCameras();

	// console.log( vmd ); // for console debug

	return vmd;

};

THREE.MMDLoader.prototype.parseVpd = function ( text ) {

	var helper = new THREE.MMDLoader.DataCreationHelper();

	var vpd = {};

	vpd.metadata = {};
	vpd.metadata.coordinateSystem = 'left';

	vpd.bones = [];

	var commentPatternG = /\/\/\w*(\r|\n|\r\n)/g;
	var newlinePattern = /\r|\n|\r\n/;

	var lines = text.replace( commentPatternG, '' ).split( newlinePattern );

	function throwError () {

		throw 'the file seems not vpd file.';

	};

	function checkMagic () {

		if ( lines[ 0 ] !== 'Vocaloid Pose Data file' ) {

			throwError();

		}

	};

	function parseHeader () {

		if ( lines.length < 4 ) {

			throwError();

		}

		vpd.metadata.parentFile = lines[ 2 ];
		vpd.metadata.boneCount = parseInt( lines[ 3 ] );

	};

	function parseBones () {

		var boneHeaderPattern = /^\s*(Bone[0-9]+)\s*\{\s*(.*)$/;
		var boneVectorPattern = /^\s*(-?[0-9]+\.[0-9]+)\s*,\s*(-?[0-9]+\.[0-9]+)\s*,\s*(-?[0-9]+\.[0-9]+)\s*;/;
		var boneQuaternionPattern = /^\s*(-?[0-9]+\.[0-9]+)\s*,\s*(-?[0-9]+\.[0-9]+)\s*,\s*(-?[0-9]+\.[0-9]+)\s*,\s*(-?[0-9]+\.[0-9]+)\s*;/;
		var boneFooterPattern = /^\s*}/;

		var bones = vpd.bones;
		var n = null;
		var v = null;
		var q = null;

		var encoder = new CharsetEncoder();

		for ( var i = 4; i < lines.length; i++ ) {

			var line = lines[ i ];

			var result;

			result = line.match( boneHeaderPattern );

			if ( result !== null ) {

				if ( n !== null ) {

					throwError();

				}

				n = result[ 2 ];

			}

			result = line.match( boneVectorPattern );

			if ( result !== null ) {

				if ( v !== null ) {

					throwError();

				}

				v = [

					parseFloat( result[ 1 ] ),
					parseFloat( result[ 2 ] ),
					parseFloat( result[ 3 ] )

				];

			}

			result = line.match( boneQuaternionPattern );

			if ( result !== null ) {

				if ( q !== null ) {

					throwError();

				}

				q = [

					parseFloat( result[ 1 ] ),
					parseFloat( result[ 2 ] ),
					parseFloat( result[ 3 ] ),
					parseFloat( result[ 4 ] )

				];


			}

			result = line.match( boneFooterPattern );

			if ( result !== null ) {

				if ( n === null || v === null || q === null ) {

					throwError();

				}

				bones.push( {

					originalName: n,
					name: helper.toCharcodeStrings( n ),
					translation: v,
					quaternion: q

				} );

				n = null;
				v = null;
				q = null;

			}

		}

		if ( n !== null || v !== null || q !== null ) {

			throwError();

		}

	};

	checkMagic();
	parseHeader();
	parseBones();

	this.leftToRightVpd( vpd );

	// console.log( vpd );  // for console debug

	return vpd;

};

THREE.MMDLoader.prototype.createMesh = function ( model, texturePath, onProgress, onError ) {

	var scope = this;
	var geometry = new THREE.Geometry();
        var material = new THREE.MultiMaterial();
	var helper = new THREE.MMDLoader.DataCreationHelper();

	var initVartices = function () {

		for ( var i = 0; i < model.metadata.vertexCount; i++ ) {

			var v = model.vertices[ i ];

			geometry.vertices.push(
				new THREE.Vector3(
					v.position[ 0 ],
					v.position[ 1 ],
					v.position[ 2 ]
				)
			);

			geometry.skinIndices.push(
				new THREE.Vector4(
					v.skinIndices.length >= 1 ? v.skinIndices[ 0 ] : 0.0,
					v.skinIndices.length >= 2 ? v.skinIndices[ 1 ] : 0.0,
					v.skinIndices.length >= 3 ? v.skinIndices[ 2 ] : 0.0,
					v.skinIndices.length >= 4 ? v.skinIndices[ 3 ] : 0.0
				)
			);

			geometry.skinWeights.push(
				new THREE.Vector4(
					v.skinWeights.length >= 1 ? v.skinWeights[ 0 ] : 0.0,
					v.skinWeights.length >= 2 ? v.skinWeights[ 1 ] : 0.0,
					v.skinWeights.length >= 3 ? v.skinWeights[ 2 ] : 0.0,
					v.skinWeights.length >= 4 ? v.skinWeights[ 3 ] : 0.0
				)
			);

		}

	};

	var initFaces = function () {

		for ( var i = 0; i < model.metadata.faceCount; i++ ) {

			geometry.faces.push(
				new THREE.Face3(
					model.faces[ i ].indices[ 0 ],
					model.faces[ i ].indices[ 1 ],
					model.faces[ i ].indices[ 2 ]
				)
			);

			for ( var j = 0; j < 3; j++ ) {

				geometry.faces[ i ].vertexNormals[ j ] =
					new THREE.Vector3(
						model.vertices[ model.faces[ i ].indices[ j ] ].normal[ 0 ],
						model.vertices[ model.faces[ i ].indices[ j ] ].normal[ 1 ],
						model.vertices[ model.faces[ i ].indices[ j ] ].normal[ 2 ]
					);

			}

		}

	};

	var initBones = function () {

		var bones = [];

		for ( var i = 0; i < model.metadata.boneCount; i++ ) {

			var bone = {};
			var b = model.bones[ i ];

			bone.parent = b.parentIndex;
			bone.name = b.name;
			bone.pos = [ b.position[ 0 ], b.position[ 1 ], b.position[ 2 ] ];
			bone.rotq = [ 0, 0, 0, 1 ];
			bone.scl = [ 1, 1, 1 ];

			if ( bone.parent !== -1 ) {

				bone.pos[ 0 ] -= model.bones[ bone.parent ].position[ 0 ];
				bone.pos[ 1 ] -= model.bones[ bone.parent ].position[ 1 ];
				bone.pos[ 2 ] -= model.bones[ bone.parent ].position[ 2 ];

			}

			bones.push( bone );

		}

		geometry.bones = bones;

	};

	var initIKs = function () {

		var iks = [];

		// TODO: remove duplicated codes between PMD and PMX
		if ( model.metadata.format === 'pmd' ) {

			for ( var i = 0; i < model.metadata.ikCount; i++ ) {

				var ik = model.iks[i];
				var param = {};

				param.target = ik.target;
				param.effector = ik.effector;
				param.iteration = ik.iteration;
				param.maxAngle = ik.maxAngle * 4;
				param.links = [];

				for ( var j = 0; j < ik.links.length; j++ ) {

					var link = {};
					link.index = ik.links[ j ].index;

					// Checking with .originalName, not .name.
					// See parseBone() for the detail.
					if ( model.bones[ link.index ].originalName.indexOf( 'ひざ' ) >= 0 ) {

						link.limitation = new THREE.Vector3( 1.0, 0.0, 0.0 );

					}

					param.links.push( link );

				}

				iks.push( param );

			}

		} else {

			for ( var i = 0; i < model.metadata.boneCount; i++ ) {

				var b = model.bones[ i ];
				var ik = b.ik;

				if ( ik === undefined ) {

					continue;

				}

				var param = {};

				param.target = i;
				param.effector = ik.effector;
				param.iteration = ik.iteration;
				param.maxAngle = ik.maxAngle;
				param.links = [];

				for ( var j = 0; j < ik.links.length; j++ ) {

					var link = {};
					link.index = ik.links[ j ].index;

					if ( ik.links[ j ].angleLimitation === 1 ) {

						link.limitation = new THREE.Vector3( 1.0, 0.0, 0.0 );
						// TODO: use limitation angles
						// link.lowerLimitationAngle;
						// link.upperLimitationAngle;

					}

					param.links.push( link );

				}

				iks.push( param );

			}

		}

		geometry.iks = iks;

	};

	var initGrants = function () {

		if ( model.metadata.format === 'pmd' ) {

			return;

		}

		var grants = [];

		for ( var i = 0; i < model.metadata.boneCount; i++ ) {

			var b = model.bones[ i ];
			var grant = b.grant;

			if ( grant === undefined ) {

				continue;

			}

			var param = {};

			param.index = i;
			param.parentIndex = grant.parentIndex;
			param.ratio = grant.ratio;
			param.isLocal = grant.isLocal;
			param.affectRotation = grant.affectRotation;
			param.affectPosition = grant.affectPosition;

			grants.push( param );

		}

		geometry.grants = grants;

	};

	var initMorphs = function () {

		function updateVertex ( params, index, v, ratio ) {

			params.vertices[ index ].x += v.position[ 0 ] * ratio;
			params.vertices[ index ].y += v.position[ 1 ] * ratio;
			params.vertices[ index ].z += v.position[ 2 ] * ratio;

		};

		function updateVertices ( params, m, ratio ) {

			for ( var i = 0; i < m.elementCount; i++ ) {

				var v = m.elements[ i ];

				var index;

				if ( model.metadata.format === 'pmd' ) {

					index = model.morphs[ 0 ].elements[ v.index ].index;

				} else {

					index = v.index;

				}

				updateVertex( params, index, v, ratio );

			}

		};

		for ( var i = 0; i < model.metadata.morphCount; i++ ) {

			var m = model.morphs[ i ];
			var params = {};

			params.name = m.name;
			params.vertices = [];

			for ( var j = 0; j < model.metadata.vertexCount; j++ ) {

				params.vertices[ j ] = new THREE.Vector3( 0, 0, 0 );
				params.vertices[ j ].x = geometry.vertices[ j ].x;
				params.vertices[ j ].y = geometry.vertices[ j ].y;
				params.vertices[ j ].z = geometry.vertices[ j ].z;

			}

			if ( model.metadata.format === 'pmd' ) {

				if ( i !== 0 ) {

					updateVertices( params, m, 1.0 );

				}

			} else {

				if ( m.type === 0 ) {

					for ( var j = 0; j < m.elementCount; j++ ) {

						var m2 = model.morphs[ m.elements[ j ].index ];
						var ratio = m.elements[ j ].ratio;

						if ( m2.type === 1 ) {

							updateVertices( params, m2, ratio );

						}

					}

				} else if ( m.type === 1 ) {

					updateVertices( params, m, 1.0 );

				}

			}

			// TODO: skip if this's non-vertex morphing of PMX to reduce CPU/Memory use
			geometry.morphTargets.push( params );

		}

	};

	var initMaterials = function () {

		var textures = [];
		var textureLoader = new THREE.TextureLoader( this.manager );
		var tgaLoader = new THREE.TGALoader( this.manager );
		var materialLoader = new THREE.MaterialLoader( this.manager );
		var color = new THREE.Color();
		var offset = 0;
		var materialParams = [];

		function loadTexture ( filePath, params ) {

			if ( params === undefined ) {

				params = {};

			}

			var directoryPath = ( params.defaultTexturePath === true ) ? scope.defaultTexturePath : texturePath;
			var fullPath = directoryPath + filePath;

			var loader = THREE.Loader.Handlers.get( fullPath );

			if ( loader === null ) {

				loader = ( filePath.indexOf( '.tga' ) >= 0 ) ? tgaLoader : textureLoader;

			}

			var texture = loader.load( fullPath, function ( t ) {

				t.flipY = false;
				t.wrapS = THREE.RepeatWrapping;
				t.wrapT = THREE.RepeatWrapping;

				if ( params.sphericalReflectionMapping === true ) {

					t.mapping = THREE.SphericalReflectionMapping;

				}

				for ( var i = 0; i < texture.readyCallbacks.length; i++ ) {

					texture.readyCallbacks[ i ]( texture );

				}

			} );

			texture.readyCallbacks = [];

			var uuid = THREE.Math.generateUUID();

			textures[ uuid ] = texture;

			return uuid;

		};

		for ( var i = 0; i < model.metadata.materialCount; i++ ) {

			geometry.faceVertexUvs.push( [] );

		}

		for ( var i = 0; i < model.metadata.materialCount; i++ ) {

			var m = model.materials[ i ];
			var params = {

				uuid: THREE.Math.generateUUID(),
				type: 'MMDMaterial'

			};

			params.faceOffset = offset;
			params.faceNum = m.faceCount;

			for ( var j = 0; j < m.faceCount; j++ ) {

				geometry.faces[ offset ].materialIndex = i;

				var uvs = [];

				for ( var k = 0; k < 3; k++ ) {

					var v = model.vertices[ model.faces[ offset ].indices[ k ] ];
					uvs.push( new THREE.Vector2( v.uv[ 0 ], v.uv[ 1 ] ) );

				}

				geometry.faceVertexUvs[ 0 ].push( uvs );

				offset++;

			}

			params.name = m.name;
			params.color = color.fromArray( [ m.diffuse[ 0 ], m.diffuse[ 1 ], m.diffuse[ 2 ] ] ).getHex();
			params.opacity = m.diffuse[ 3 ];
			params.specular = color.fromArray( [ m.specular[ 0 ], m.specular[ 1 ], m.specular[ 2 ] ] ).getHex();
			params.shininess = m.shininess;

			if ( params.opacity === 1.0 ) {

				params.side = THREE.FrontSide;
				params.transparent = false;

			} else {

				params.side = THREE.DoubleSide;
				params.transparent = true;

			}

			if ( model.metadata.format === 'pmd' ) {

				if ( m.fileName ) {

					var fileName = m.fileName;
					var fileNames = [];

					var index = fileName.lastIndexOf( '*' );

					if ( index >= 0 ) {

						fileNames.push( fileName.slice( 0, index ) );
						fileNames.push( fileName.slice( index + 1 ) );

					} else {

						fileNames.push( fileName );

					}

					for ( var j = 0; j < fileNames.length; j++ ) {

						var n = fileNames[ j ];

						if ( n.indexOf( '.sph' ) >= 0 || n.indexOf( '.spa' ) >= 0 ) {

							params.envMap = loadTexture( n, { sphericalReflectionMapping: true } );

							if ( n.indexOf( '.sph' ) >= 0 ) {

								params.envMapType = THREE.MultiplyOperation;

							} else {

								params.envMapType = THREE.AddOperation;

							}

						} else {

							params.map = loadTexture( n );

						}

					}

				}

			} else {

				if ( m.textureIndex !== -1 ) {

					var n = model.textures[ m.textureIndex ];
					params.map = loadTexture( n );

				}

				// TODO: support m.envFlag === 3
				if ( m.envTextureIndex !== -1 && ( m.envFlag === 1 || m.envFlag == 2 ) ) {

					var n = model.textures[ m.envTextureIndex ];
					params.envMap = loadTexture( n, { sphericalReflectionMapping: true } );

					if ( m.envFlag === 1 ) {

						params.envMapType = THREE.MultiplyOperation;

					} else {

						params.envMapType = THREE.AddOperation;

					}

				}

			}

			// TODO: check if this logic is right
			if ( params.map === undefined /* && params.envMap === undefined */ ) {

				params.emissive = color.fromArray( [ m.emissive[ 0 ], m.emissive[ 1 ], m.emissive[ 2 ] ] ).getHex();

			}

			var shader = THREE.ShaderLib[ 'mmd' ];
			params.uniforms = THREE.UniformsUtils.clone( shader.uniforms );
			params.vertexShader = shader.vertexShader;
			params.fragmentShader = shader.fragmentShader;

			materialParams.push( params );

		}

		materialLoader.setTextures( textures );

		for ( var i = 0; i < materialParams.length; i++ ) {

			var p = materialParams[ i ];
			var p2 = model.materials[ i ];
			var m = materialLoader.parse( p );

			m.faceOffset = p.faceOffset;
			m.faceNum = p.faceNum;

			m.skinning = geometry.bones.length > 0 ? true : false;
			m.morphTargets = geometry.morphTargets.length > 0 ? true : false;
			m.lights = true;

			m.blending = THREE.CustomBlending;
			m.blendSrc = THREE.SrcAlphaFactor;
			m.blendDst = THREE.OneMinusSrcAlphaFactor;
			m.blendSrcAlpha = THREE.SrcAlphaFactor;
			m.blendDstAlpha = THREE.DstAlphaFactor;

			if ( m.map !== null ) {

				// Check if this part of the texture image the material uses requires transparency
				function checkTextureTransparency ( m ) {

					m.map.readyCallbacks.push( function ( t ) {

						// Is there any efficient ways?
						function createImageData ( image ) {

							var c = document.createElement( 'canvas' );
							c.width = image.width;
							c.height = image.height;

							var ctx = c.getContext( '2d' );
							ctx.drawImage( image, 0, 0 );

							return ctx.getImageData( 0, 0, c.width, c.height );

						};

						function detectTextureTransparency ( image, uvs ) {

							var width = image.width;
							var height = image.height;
							var data = image.data;
							var threshold = 253;

							if ( data.length / ( width * height ) !== 4 ) {

								return false;

							}

							for ( var i = 0; i < uvs.length; i++ ) {

								var centerUV = { x: 0.0, y: 0.0 };

								for ( var j = 0; j < 3; j++ ) {

									var uv = uvs[ i ][ j ];

									if ( getAlphaByUv( image, uv ) < threshold ) {

										return true;

									}

									centerUV.x += uv.x;
									centerUV.y += uv.y;

								}

								centerUV.x /= 3;
								centerUV.y /= 3;


								if ( getAlphaByUv( image, centerUV ) < threshold ) {

									return true;

								}

							}

							return false;

						};

						/*
						 * This method expects
						 *   t.flipY = false
						 *   t.wrapS = THREE.RepeatWrapping
						 *   t.wrapT = THREE.RepeatWrapping
						 * TODO: more precise
						 */
						function getAlphaByUv ( image, uv ) {

							var width = image.width;
							var height = image.height;

							var x = Math.round( uv.x * width ) % width;
							var y = Math.round( uv.y * height ) % height;

							if ( x < 0 ) {

								x += width;

							}

							if ( y < 0 ) {

								y += height;

							}

							var index = y * width + x;

							return image.data[ index * 4 + 3 ];

						};

						var imageData = t.image.data !== undefined ? t.image : createImageData( t.image );
						var uvs = geometry.faceVertexUvs[ 0 ].slice( m.faceOffset, m.faceOffset + m.faceNum );

						m.textureTransparency = detectTextureTransparency( imageData, uvs );

					} );

				}

				checkTextureTransparency( m );

			}

			if ( m.envMap !== null ) {

				// TODO: WebGLRenderer should automatically update?
				function updateMaterialWhenTextureIsReady ( m ) {

					m.envMap.readyCallbacks.push( function ( t ) {

						m.needsUpdate = true;

					} );

				}

				m.combine = p.envMapType;
				updateMaterialWhenTextureIsReady( m );

			}

			m.uniforms.opacity.value = m.opacity;
			m.uniforms.diffuse.value = m.color;

			if ( m.emissive ) {

				m.uniforms.emissive.value = m.emissive;

			}

			m.uniforms.map.value = m.map;
			m.uniforms.envMap.value = m.envMap;
			m.uniforms.specular.value = m.specular;
			m.uniforms.shininess.value = Math.max( m.shininess, 1e-4 ); // to prevent pow( 0.0, 0.0 )

			if ( model.metadata.format === 'pmd' ) {

				function isDefaultToonTexture ( n ) {

					if ( n.length !== 10 ) {

						return false;

					}

					return n.match( /toon(10|0[0-9]).bmp/ ) === null ? false : true;

				};

				m.uniforms.outlineThickness.value = p2.edgeFlag === 1 ? 0.003 : 0.0;
				m.uniforms.outlineColor.value = new THREE.Color( 0.0, 0.0, 0.0 );
				m.uniforms.outlineAlpha.value = 1.0;
				m.uniforms.toonMap.value = textures[ p2.toonIndex ];
				m.uniforms.celShading.value = 1;

				if ( p2.toonIndex === -1 ) {

					m.uniforms.hasToonTexture.value = 0;

				} else {

					var n = model.toonTextures[ p2.toonIndex ].fileName;
					var uuid = loadTexture( n, { defaultTexturePath: isDefaultToonTexture( n ) } );
					m.uniforms.toonMap.value = textures[ uuid ];
					m.uniforms.hasToonTexture.value = 1;
				}

			} else {

				m.uniforms.outlineThickness.value = p2.edgeSize / 300;
				m.uniforms.outlineColor.value = new THREE.Color( p2.edgeColor[ 0 ], p2.edgeColor[ 1 ], p2.edgeColor[ 2 ] );
				m.uniforms.outlineAlpha.value = p2.edgeColor[ 3 ];
				m.uniforms.celShading.value = 1;

				if ( p2.toonIndex === -1 ) {

					m.uniforms.hasToonTexture.value = 0;

				} else {

					if ( p2.toonFlag === 0 ) {

						var n = model.textures[ p2.toonIndex ];
						var uuid = loadTexture( n );
						m.uniforms.toonMap.value = textures[ uuid ];

					} else {

						var num = p2.toonIndex + 1;
						var fileName = 'toon' + ( num < 10 ? '0' + num : num ) + '.bmp';
						var uuid = loadTexture( fileName, { defaultTexturePath: true } );
						m.uniforms.toonMap.value = textures[ uuid ];

					}

					m.uniforms.hasToonTexture.value = 1;

				}

			}

			material.materials.push( m );

		}

		if ( model.metadata.format === 'pmx' ) {

			function checkAlphaMorph ( morph, elements ) {

				if ( morph.type !== 8 ) {

					return;

				}

				for ( var i = 0; i < elements.length; i++ ) {

					var e = elements[ i ];

					if ( e.index === -1 ) {

						continue;

					}

					var m = material.materials[ e.index ];

					if ( m.opacity !== e.diffuse[ 3 ] ) {

						m.morphTransparency = true;

					}

				}

			}

			for ( var i = 0; i < model.morphs.length; i++ ) {

				var morph = model.morphs[ i ];
				var elements = morph.elements;

				if ( morph.type === 0 ) {

					for ( var j = 0; j < elements.length; j++ ) {

						var morph2 = model.morphs[ elements[ j ].index ];
						var elements2 = morph2.elements;

						checkAlphaMorph( morph2, elements2 );

					}

				} else {

					checkAlphaMorph( morph, elements );

				}

			}

		}

	};

	var initPhysics = function () {

		var rigidBodies = [];
		var constraints = [];

		for ( var i = 0; i < model.metadata.rigidBodyCount; i++ ) {

			var b = model.rigidBodies[ i ];
			var keys = Object.keys( b );

			var p = {};

			for ( var j = 0; j < keys.length; j++ ) {

				var key = keys[ j ];
				p[ key ] = b[ key ];

			}

			/*
			 * RigidBody position parameter in PMX seems global position
			 * while the one in PMD seems offset from corresponding bone.
			 * So unify being offset.
			 */
			if ( model.metadata.format === 'pmx' ) {

				if ( p.boneIndex !== -1 ) {

					var bone = model.bones[ p.boneIndex ];
					p.position[ 0 ] -= bone.position[ 0 ];
					p.position[ 1 ] -= bone.position[ 1 ];
					p.position[ 2 ] -= bone.position[ 2 ];

				}

			}

			rigidBodies.push( p );

		}

		for ( var i = 0; i < model.metadata.constraintCount; i++ ) {

			var c = model.constraints[ i ];
			var keys = Object.keys( c );

			var p = {};

			for ( var j = 0; j < keys.length; j++ ) {

				var key = keys[ j ];
				p[ key ] = c[ key ];

			}

			var bodyA = rigidBodies[ p.rigidBodyIndex1 ];
			var bodyB = rigidBodies[ p.rigidBodyIndex2 ];

			/*
			 * Refer http://www20.atpages.jp/katwat/wp/?p=4135
			 * for what this is for
			 */
			if ( bodyA.type !== 0 && bodyB.type === 2 ) {

				if ( bodyA.boneIndex !== -1 && bodyB.boneIndex !== -1 &&
				     model.bones[ bodyB.boneIndex ].parentIndex === bodyA.boneIndex ) {

					bodyB.type = 1;

				}

			}

			constraints.push( p );

		}

		geometry.rigidBodies = rigidBodies;
		geometry.constraints = constraints;

	};

	function saveOriginalBoneNames ( mesh ) {

		var bones = mesh.skeleton.bones;
		var bones2 = mesh.geometry.bones;

		for ( var i = 0; i < bones.length; i++ ) {

			var n = model.bones[ i ].originalName;
			bones[ i ].originalName = n;
			bones2[ i ].originalName = n;

		}

	};

	this.leftToRightModel( model );

	initVartices();
	initFaces();
	initBones();
	initIKs();
	initGrants();
	initMorphs();
	initMaterials();
	initPhysics();

	geometry.computeFaceNormals();
	geometry.verticesNeedUpdate = true;
	geometry.normalsNeedUpdate = true;
	geometry.uvsNeedUpdate = true;
	geometry.mmdFormat = model.metadata.format;

	var mesh = new THREE.SkinnedMesh( geometry, material );

	saveOriginalBoneNames( mesh );

	// console.log( mesh ); // for console debug

	return mesh;

};

THREE.MMDLoader.prototype.createAnimation = function ( mesh, vmd, name ) {

	var scope = this;

	var helper = new THREE.MMDLoader.DataCreationHelper();

	var initMotionAnimations = function () {

		if ( vmd.metadata.motionCount === 0 ) {

			return;

		}

		var bones = mesh.geometry.bones;
		var orderedMotions = helper.createOrderedMotionArrays( bones, vmd.motions, 'boneName' );

		var animation = {
			name: name === undefined ? THREE.Math.generateUUID() : name,
			fps: 30,
			hierarchy: []
		};

		for ( var i = 0; i < orderedMotions.length; i++ ) {

			animation.hierarchy.push(
				{
					parent: bones[ i ].parent,
					keys: []
				}
			);

		}

		for ( var i = 0; i < orderedMotions.length; i++ ) {

			var array = orderedMotions[ i ];
			var keys = animation.hierarchy[ i ].keys;
			var bone = bones[ i ];

			for ( var j = 0; j < array.length; j++ ) {

				var t = array[ j ].frameNum / 30;
				var p = array[ j ].position;
				var r = array[ j ].rotation;

				helper.pushBoneAnimationKey( keys, t, bone, p, r );

			}

		}

		for ( var i = 0; i < orderedMotions.length; i++ ) {

			var bone = bones[ i ];
			var keys = animation.hierarchy[ i ].keys;
			helper.insertBoneAnimationKeyAtTimeZero( keys, bone );
			helper.insertStartBoneAnimationKey( keys );

		}

		var clip = THREE.AnimationClip.parseAnimation( animation, mesh.geometry.bones );

		if ( clip !== null ) {

			if ( mesh.geometry.animations === undefined ) {

				mesh.geometry.animations = [];

			}

			mesh.geometry.animations.push( clip );

		}

	};

	var initMorphAnimations = function () {

		if ( vmd.metadata.morphCount === 0 ) {

			return;

		}

		var orderedMorphs = helper.createOrderedMotionArrays( mesh.geometry.morphTargets, vmd.morphs, 'morphName' );

		var morphAnimation = {
			fps: 30,
			hierarchy: []
		};

		for ( var i = 0; i < orderedMorphs.length; i++ ) {

			morphAnimation.hierarchy.push( { keys: [] } );

		}

		for ( var i = 0; i < orderedMorphs.length; i++ ) {

			var array = orderedMorphs[ i ];
			var keys = morphAnimation.hierarchy[ i ].keys;

			for ( var j = 0; j < array.length; j++ ) {

				var t = array[ j ].frameNum / 30;
				var w = array[ j ].weight;

				helper.pushAnimationKey( keys, t, w );

			}

		}

		// TODO: should we use THREE.AnimationClip.CreateFromMorphTargetSequence() instead?

		var tracks = [];

		for ( var i = 0; i < orderedMorphs.length; i++ ) {

			var keys = morphAnimation.hierarchy[ i ].keys;

			if ( keys.length === 0 ) {

				continue;

			}

			tracks.push( helper.generateTrackFromAnimationKeys( keys, 'NumberKeyframeTrackEx', '.morphTargetInfluences[' + i + ']' ) );

		}

		var clip = new THREE.AnimationClip( name === undefined ? THREE.Math.generateUUID() : name + 'Morph', -1, tracks );

		if ( clip !== null ) {

			if ( mesh.geometry.animations === undefined ) {

				mesh.geometry.animations = [];

			}

			mesh.geometry.animations.push( clip );

		}

	};

	this.leftToRightVmd( vmd );

	initMotionAnimations();
	initMorphAnimations();

};

THREE.MMDLoader.prototype.leftToRightModel = function ( model ) {

	if ( model.metadata.coordinateSystem === 'right' ) {

		return;

	}

	model.metadata.coordinateSystem = 'right';

	var helper = new THREE.MMDLoader.DataCreationHelper();

	for ( var i = 0; i < model.metadata.vertexCount; i++ ) {

		helper.leftToRightVector3( model.vertices[ i ].position );
		helper.leftToRightVector3( model.vertices[ i ].normal );

	}

	for ( var i = 0; i < model.metadata.faceCount; i++ ) {

		helper.leftToRightIndexOrder( model.faces[ i ].indices );

	}

	for ( var i = 0; i < model.metadata.boneCount; i++ ) {

		helper.leftToRightVector3( model.bones[ i ].position );

	}

	// TODO: support other morph for PMX
	for ( var i = 0; i < model.metadata.morphCount; i++ ) {

		var m = model.morphs[ i ];

		if ( model.metadata.format === 'pmx' ) {

			if ( m.type === 1 ) {

				m = m.elements;

			} else {

				continue;

			}

		}

		for ( var j = 0; j < m.elementCount; j++ ) {

			helper.leftToRightVector3( m.elements[ j ].position );

		}

	}

	for ( var i = 0; i < model.metadata.rigidBodyCount; i++ ) {

		helper.leftToRightVector3( model.rigidBodies[ i ].position );
		helper.leftToRightEuler( model.rigidBodies[ i ].rotation );

	}

	for ( var i = 0; i < model.metadata.constraintCount; i++ ) {

		helper.leftToRightVector3( model.constraints[ i ].position );
		helper.leftToRightEuler( model.constraints[ i ].rotation );
		helper.leftToRightVector3Range( model.constraints[ i ].translationLimitation1, model.constraints[ i ].translationLimitation2 );
		helper.leftToRightEulerRange( model.constraints[ i ].rotationLimitation1, model.constraints[ i ].rotationLimitation2 );

	}

};

THREE.MMDLoader.prototype.leftToRightVmd = function ( vmd ) {

	if ( vmd.metadata.coordinateSystem === 'right' ) {

		return;

	}

	vmd.metadata.coordinateSystem = 'right';

	var helper = new THREE.MMDLoader.DataCreationHelper();

	for ( var i = 0; i < vmd.metadata.motionCount; i++ ) {

		helper.leftToRightVector3( vmd.motions[ i ].position );
		helper.leftToRightQuaternion( vmd.motions[ i ].rotation );

	}

	for ( var i = 0; i < vmd.metadata.cameraCount; i++ ) {

		helper.leftToRightEuler( vmd.cameras[ i ].rotation );

	}

};

THREE.MMDLoader.prototype.leftToRightVpd = function ( vpd ) {

	if ( vpd.metadata.coordinateSystem === 'right' ) {

		return;

	}

	vpd.metadata.coordinateSystem = 'right';

	var helper = new THREE.MMDLoader.DataCreationHelper();

	for ( var i = 0; i < vpd.bones.length; i++ ) {

		helper.leftToRightVector3( vpd.bones[ i ].translation );
		helper.leftToRightQuaternion( vpd.bones[ i ].quaternion );

	}

};

THREE.MMDLoader.DataCreationHelper = function () {

};

THREE.MMDLoader.DataCreationHelper.prototype = {

	constructor: THREE.MMDLoader.Helper,

	leftToRightVector3: function ( v ) {

		v[ 2 ] = -v[ 2 ];

	},

	leftToRightQuaternion: function ( q ) {

		q[ 0 ] = -q[ 0 ];
		q[ 1 ] = -q[ 1 ];

	},

	leftToRightEuler: function ( r ) {

		r[ 0 ] = -r[ 0 ];
		r[ 1 ] = -r[ 1 ];

	},

	leftToRightIndexOrder: function ( p ) {

		var tmp = p[ 2 ];
		p[ 2 ] = p[ 0 ];
		p[ 0 ] = tmp;

	},

	leftToRightVector3Range: function ( v1, v2 ) {

		var tmp = -v2[ 2 ];
		v2[ 2 ] = -v1[ 2 ];
		v1[ 2 ] = tmp;

	},

	leftToRightEulerRange: function ( r1, r2 ) {

		var tmp1 = -r2[ 0 ];
		var tmp2 = -r2[ 1 ];
		r2[ 0 ] = -r1[ 0 ];
		r2[ 1 ] = -r1[ 1 ];
		r1[ 0 ] = tmp1;
		r1[ 1 ] = tmp2;

	},

	/*
         * Note: Sometimes to use Japanese Unicode characters runs into problems in Three.js.
	 *       In such a case, use this method to convert it to Unicode hex charcode strings,
         *       like 'あいう' -> '0x30420x30440x3046'
         */
	toCharcodeStrings: function ( s ) {

		var str = '';

		for ( var i = 0; i < s.length; i++ ) {

			str += '0x' + ( '0000' + s[ i ].charCodeAt().toString( 16 ) ).substr( -4 );

		}

		return str;

	},

	createDictionary: function ( array ) {

		var dict = {};

		for ( var i = 0; i < array.length; i++ ) {

			dict[ array[ i ].name ] = i;

		}

		return dict;

	},

	initializeMotionArrays: function ( array ) {

		var result = [];

		for ( var i = 0; i < array.length; i++ ) {

			result[ i ] = [];

		}

		return result;

	},

	sortMotionArray: function ( array ) {

		array.sort( function ( a, b ) {

			return a.frameNum - b.frameNum;

		} ) ;

	},

	sortMotionArrays: function ( arrays ) {

		for ( var i = 0; i < arrays.length; i++ ) {

			this.sortMotionArray( arrays[ i ] );

		}

	},

	createMotionArray: function ( array ) {

		var result = [];

		for ( var i = 0; i < array.length; i++ ) {

			result.push( array[ i ] );

		}

		return result;

	},

	createMotionArrays: function ( array, result, dict, key ) {

		for ( var i = 0; i < array.length; i++ ) {

			var a = array[ i ];
			var num = dict[ a[ key ] ];

			if ( num === undefined ) {

				continue;

			}

			result[ num ].push( a );

		}

	},

	createOrderedMotionArray: function ( array ) {

		var result = this.createMotionArray( array );
		this.sortMotionArray( result );
		return result;

	},

	createOrderedMotionArrays: function ( targetArray, motionArray, key ) {

		var dict = this.createDictionary( targetArray );
		var result = this.initializeMotionArrays( targetArray );
		this.createMotionArrays( motionArray, result, dict, key );
		this.sortMotionArrays( result );

		return result;

	},

	pushAnimationKey: function ( keys, time, value, preventInterpolation ) {

		/*
		 * Note: This is a workaround not to make Animation system calculate lerp
		 *       if the diff from the last frame is 1 frame (in 30fps).
		 */
		if ( keys.length > 0 && preventInterpolation === true ) {

			var k = keys[ keys.length - 1 ];

			if ( time < k.time + ( 1 / 30 ) * 1.5 ) {

				keys.push(
					{
						time: time - 1e-13,
						value: k.value.clone === undefined ? k.value : k.value.clone()
					}
				);

			}

		}

		keys.push(
			{
				time: time,
				value: value
			}
		);

	},

	insertAnimationKeyAtTimeZero: function ( keys, value ) {

		if ( keys.length === 0 ) {

			keys.push(
				{
					time: 0.0,
					value: value
				}
			);

		}

	},

	insertStartAnimationKey: function ( keys ) {

		var k = keys[ 0 ];

		if ( k.time !== 0.0 ) {

			keys.unshift(
				{
					time: 0.0,
					value: k.value.clone === undefined ? k.value : k.value.clone()
				}
			);

		}

	},

	pushBoneAnimationKey: function ( keys, time, bone, pos, rot ) {

		keys.push(
			{
				time: time,
				 pos: [ bone.pos[ 0 ] + pos[ 0 ],
				        bone.pos[ 1 ] + pos[ 1 ],
				        bone.pos[ 2 ] + pos[ 2 ] ],
				 rot: [ rot[ 0 ], rot[ 1 ], rot[ 2 ], rot[ 3 ] ],
				 scl: [ 1, 1, 1 ]
			}
		);

	},

	insertBoneAnimationKeyAtTimeZero: function ( keys, bone ) {

		if ( keys.length === 0 ) {

			keys.push(
				{
					time: 0.0,
					 pos: [ bone.pos[ 0 ], bone.pos[ 1 ], bone.pos[ 2 ] ],
					 rot: [ 0, 0, 0, 1 ],
					 scl: [ 1, 1, 1 ]
				}
			);

		}

	},

	insertStartBoneAnimationKey: function ( keys ) {

		var k = keys[ 0 ];

		if ( k.time !== 0.0 ) {

			keys.unshift(
				{
					time: 0.0,
					pos: [ k.pos[ 0 ], k.pos[ 1 ], k.pos[ 2 ] ],
					rot: [ k.rot[ 0 ], k.rot[ 1 ], k.rot[ 2 ], k.rot[ 3 ] ],
					scl: [ k.scl[ 0 ], k.scl[ 1 ], k.scl[ 2 ] ]
				}
			);

		}

	},

	/*
	 * This method wraps r74 Animation key frame track API for r73 Animation.
	 */
	generateTrackFromAnimationKeys: function ( keys, trackKey, name ) {

		var times = [];
		var values = [];

		for ( var i = 0; i < keys.length; i++ ) {

			var key = keys[ i ];

			times.push( key.time );

			if ( trackKey === 'VectorKeyframeTrackEx' ) {

				values.push( key.value.x );
				values.push( key.value.y );
				values.push( key.value.z );

			} else {

				values.push( key.value );

			}

		}

		return new THREE.MMDLoader[ trackKey ]( name, times, values );

	}

};

/*
 * These two classes are for high precision of times and values.
 * TODO: Let Three.KeyframeTrack support type select on instance creation.
 */
THREE.MMDLoader.VectorKeyframeTrackEx = function ( name, times, values, interpolation ) {

	THREE.VectorKeyframeTrack.call( this, name, times, values, interpolation );

};

THREE.MMDLoader.VectorKeyframeTrackEx.prototype = Object.create( THREE.VectorKeyframeTrack.prototype );
THREE.MMDLoader.VectorKeyframeTrackEx.prototype.constructor = THREE.MMDLoader.VectorKeyframeTrackEx;
THREE.MMDLoader.VectorKeyframeTrackEx.prototype.TimeBufferType = Float64Array;

THREE.MMDLoader.NumberKeyframeTrackEx = function ( name, times, values, interpolation ) {

	THREE.VectorKeyframeTrack.call( this, name, times, values, interpolation );

};

THREE.MMDLoader.NumberKeyframeTrackEx.prototype = Object.create( THREE.NumberKeyframeTrack.prototype );
THREE.MMDLoader.NumberKeyframeTrackEx.prototype.constructor = THREE.MMDLoader.NumberKeyframeTrackEx;
THREE.MMDLoader.NumberKeyframeTrackEx.prototype.TimeBufferType = Float64Array;

THREE.MMDLoader.DataView = function ( buffer, littleEndian ) {

	this.dv = new DataView( buffer );
	this.offset = 0;
	this.littleEndian = ( littleEndian !== undefined ) ? littleEndian : true;
	this.encoder = new CharsetEncoder();

};

THREE.MMDLoader.DataView.prototype = {

	constructor: THREE.MMDLoader.DataView,

	getInt8: function () {

		var value = this.dv.getInt8( this.offset );
		this.offset += 1;
		return value;

	},

	getInt8Array: function ( size ) {

		var a = [];

		for ( var i = 0; i < size; i++ ) {

			a.push( this.getInt8() );

		}

		return a;

	},

	getUint8: function () {

		var value = this.dv.getUint8( this.offset );
		this.offset += 1;
		return value;

	},

	getUint8Array: function ( size ) {

		var a = [];

		for ( var i = 0; i < size; i++ ) {

			a.push( this.getUint8() );

		}

		return a;

	},


	getInt16: function () {

		var value = this.dv.getInt16( this.offset, this.littleEndian );
		this.offset += 2;
		return value;

	},

	getInt16Array: function ( size ) {

		var a = [];

		for ( var i = 0; i < size; i++ ) {

			a.push( this.getInt16() );

		}

		return a;

	},

	getUint16: function () {

		var value = this.dv.getUint16( this.offset, this.littleEndian );
		this.offset += 2;
		return value;

	},

	getUint16Array: function ( size ) {

		var a = [];

		for ( var i = 0; i < size; i++ ) {

			a.push( this.getUint16() );

		}

		return a;

	},

	getInt32: function () {

		var value = this.dv.getInt32( this.offset, this.littleEndian );
		this.offset += 4;
		return value;

	},

	getInt32Array: function ( size ) {

		var a = [];

		for ( var i = 0; i < size; i++ ) {

			a.push( this.getInt32() );

		}

		return a;

	},

	getUint32: function () {

		var value = this.dv.getUint32( this.offset, this.littleEndian );
		this.offset += 4;
		return value;

	},

	getUint32Array: function ( size ) {

		var a = [];

		for ( var i = 0; i < size; i++ ) {

			a.push( this.getUint32() );

		}

		return a;

	},

	getFloat32: function () {

		var value = this.dv.getFloat32( this.offset, this.littleEndian );
		this.offset += 4;
		return value;

	},

	getFloat32Array: function( size ) {

		var a = [];

		for ( var i = 0; i < size; i++ ) {

			a.push( this.getFloat32() );

		}

		return a;

	},

	getFloat64: function () {

		var value = this.dv.getFloat64( this.offset, this.littleEndian );
		this.offset += 8;
		return value;

	},

	getFloat64Array: function( size ) {

		var a = [];

		for ( var i = 0; i < size; i++ ) {

			a.push( this.getFloat64() );

		}

		return a;

	},

	getIndex: function ( type ) {

		switch ( type ) {

			case 1:
				return this.getInt8();

			case 2:
				return this.getInt16();

			case 4:
				return this.getInt32();

			default:
				throw 'unknown number type ' + type + ' exception.';

		}

	},

	getIndexArray: function ( type, size ) {

		var a = [];

		for ( var i = 0; i < size; i++ ) {

			a.push( this.getIndex( type ) );

		}

		return a;

	},

	getChars: function ( size ) {

		var str = '';

		while ( size > 0 ) {

			var value = this.getUint8();
			size--;

			if ( value === 0 ) {

				break;

			}

			str += String.fromCharCode( value );

		}

		while ( size > 0 ) {

			this.getUint8();
			size--;

		}

		return str;

	},

	getSjisStringsAsUnicode: function ( size ) {

		var a = [];

		while ( size > 0 ) {

			var value = this.getUint8();
			size--;

			if ( value === 0 ) {

				break;

			}

			a.push( value );

		}

		while ( size > 0 ) {

			this.getUint8();
			size--;

		}

		return this.encoder.s2u( new Uint8Array( a ) );

	},

	getUnicodeStrings: function ( size ) {

		var str = '';

		while ( size > 0 ) {

			var value = this.getUint16();
			size -= 2;

			if ( value === 0 ) {

				break;

			}

			str += String.fromCharCode( value );

		}

		while ( size > 0 ) {

			this.getUint8();
			size--;

		}

		return str;

	},

	getTextBuffer: function () {

		var size = this.getUint32();
		return this.getUnicodeStrings( size );

	}

};

/*
 * MMD custom shaders based on MeshPhongMaterial.
 * This class extends ShaderMaterial while shaders are based on MeshPhongMaterial.
 * Keep this class updated on MeshPhongMaterial.
 */
THREE.MMDMaterial = function ( parameters ) {

	THREE.ShaderMaterial.call( this, parameters );

//	this.type = 'MMDMaterial';

	this.faceOffset = null;
	this.faceNum = null;
	this.textureTransparency = false;
	this.morphTransparency = false;

	// the followings are copied from MeshPhongMaterial
	this.color = new THREE.Color( 0xffffff ); // diffuse
	this.emissive = new THREE.Color( 0x000000 );
	this.specular = new THREE.Color( 0x111111 );
	this.shininess = 30;

	this.map = null;

	this.lightMap = null;
	this.lightMapIntensity = 1.0;

	this.aoMap = null;
	this.aoMapIntensity = 1.0;

	this.emissiveMap = null;

	this.bumpMap = null;
	this.bumpScale = 1;

	this.normalMap = null;
	this.normalScale = new THREE.Vector2( 1, 1 );

	this.displacementMap = null;
	this.displacementScale = 1;
	this.displacementBias = 0;

	this.specularMap = null;

	this.alphaMap = null;

	this.envMap = null;
	this.combine = THREE.MultiplyOperation;
	this.reflectivity = 1;
	this.refractionRatio = 0.98;

	this.fog = true;

	this.shading = THREE.SmoothShading;

	this.wireframe = false;
	this.wireframeLinewidth = 1;
	this.wireframeLinecap = 'round';
	this.wireframeLinejoin = 'round';

	this.vertexColors = THREE.NoColors;

	this.skinning = false;
	this.morphTargets = false;
	this.morphNormals = false;

	this.setValues( parameters );

};

THREE.MMDMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype );
THREE.MMDMaterial.prototype.constructor = THREE.MMDMaterial;

/*
 * Shaders are copied from MeshPhongMaterial and then MMD spcific codes are inserted.
 * Keep shaders updated on MeshPhongMaterial.
 */
THREE.ShaderLib[ 'mmd' ] = {

	uniforms: THREE.UniformsUtils.merge( [

		THREE.UniformsLib[ "common" ],
		THREE.UniformsLib[ "aomap" ],
		THREE.UniformsLib[ "lightmap" ],
		THREE.UniformsLib[ "emissivemap" ],
		THREE.UniformsLib[ "bumpmap" ],
		THREE.UniformsLib[ "normalmap" ],
		THREE.UniformsLib[ "displacementmap" ],
		THREE.UniformsLib[ "fog" ],
		THREE.UniformsLib[ "lights" ],

		{
			"emissive" : { type: "c", value: new THREE.Color( 0x000000 ) },
			"specular" : { type: "c", value: new THREE.Color( 0x111111 ) },
			"shininess": { type: "f", value: 30 }
		},

		// ---- MMD specific for cel shading(outline drawing and toon mapping)
		{
			"outlineDrawing"  : { type: "i", value: 0 },
			"outlineThickness": { type: "f", value: 0.0 },
			"outlineColor"    : { type: "c", value: new THREE.Color( 0x000000 ) },
			"outlineAlpha"    : { type: "f", value: 1.0 },
			"celShading"      : { type: "i", value: 0 },
			"toonMap"         : { type: "t", value: null },
			"hasToonTexture"  : { type: "i", value: 0 }
		}
		// ---- MMD specific for cel shading(outline drawing and toon mapping)

	] ),

	vertexShader: [

		"#define PHONG",

		"varying vec3 vViewPosition;",

		"#ifndef FLAT_SHADED",

		"	varying vec3 vNormal;",

		"#endif",

		THREE.ShaderChunk[ "common" ],
		THREE.ShaderChunk[ "uv_pars_vertex" ],
		THREE.ShaderChunk[ "uv2_pars_vertex" ],
		THREE.ShaderChunk[ "displacementmap_pars_vertex" ],
		THREE.ShaderChunk[ "envmap_pars_vertex" ],
		THREE.ShaderChunk[ "color_pars_vertex" ],
		THREE.ShaderChunk[ "morphtarget_pars_vertex" ],
		THREE.ShaderChunk[ "skinning_pars_vertex" ],
		THREE.ShaderChunk[ "shadowmap_pars_vertex" ],
		THREE.ShaderChunk[ "logdepthbuf_pars_vertex" ],
		THREE.ShaderChunk[ "clipping_planes_pars_vertex" ],

		// ---- MMD specific for outline drawing
		"	uniform bool outlineDrawing;",
		"	uniform float outlineThickness;",
		// ---- MMD specific for outline drawing

		"void main() {",

			THREE.ShaderChunk[ "uv_vertex" ],
			THREE.ShaderChunk[ "uv2_vertex" ],
			THREE.ShaderChunk[ "color_vertex" ],

			THREE.ShaderChunk[ "beginnormal_vertex" ],
			THREE.ShaderChunk[ "morphnormal_vertex" ],
			THREE.ShaderChunk[ "skinbase_vertex" ],
			THREE.ShaderChunk[ "skinnormal_vertex" ],
			THREE.ShaderChunk[ "defaultnormal_vertex" ],

		"#ifndef FLAT_SHADED", // Normal computed with derivatives when FLAT_SHADED

		"	vNormal = normalize( transformedNormal );",

		"#endif",

			THREE.ShaderChunk[ "begin_vertex" ],
			THREE.ShaderChunk[ "displacementmap_vertex" ],
			THREE.ShaderChunk[ "morphtarget_vertex" ],
			THREE.ShaderChunk[ "skinning_vertex" ],
			THREE.ShaderChunk[ "project_vertex" ],
			THREE.ShaderChunk[ "logdepthbuf_vertex" ],
			THREE.ShaderChunk[ "clipping_planes_vertex" ],

		"	vViewPosition = - mvPosition.xyz;",

			THREE.ShaderChunk[ "worldpos_vertex" ],
			THREE.ShaderChunk[ "envmap_vertex" ],
			THREE.ShaderChunk[ "shadowmap_vertex" ],

		// ---- MMD specific for outline drawing
		"	if ( outlineDrawing ) {",
		"		float thickness = outlineThickness;",
		"		float ratio = 1.0;", // TODO: support outline size ratio for each vertex
		"		vec4 epos = projectionMatrix * modelViewMatrix * skinned;",
		"		vec4 epos2 = projectionMatrix * modelViewMatrix * vec4( skinned.xyz + objectNormal, 1.0 );",
		"		vec4 enorm = normalize( epos2 - epos );",
		"		gl_Position = epos + enorm * thickness * epos.w * ratio;",
		"	}",
		// ---- MMD specific for outline drawing

		"}"

	].join( "\n" ),

	fragmentShader: [

		"#define PHONG",

		"uniform vec3 diffuse;",
		"uniform vec3 emissive;",
		"uniform vec3 specular;",
		"uniform float shininess;",
		"uniform float opacity;",

		THREE.ShaderChunk[ "common" ],
		THREE.ShaderChunk[ "packing" ],
		THREE.ShaderChunk[ "color_pars_fragment" ],
		THREE.ShaderChunk[ "uv_pars_fragment" ],
		THREE.ShaderChunk[ "uv2_pars_fragment" ],
		THREE.ShaderChunk[ "map_pars_fragment" ],
		THREE.ShaderChunk[ "alphamap_pars_fragment" ],
		THREE.ShaderChunk[ "aomap_pars_fragment" ],
		THREE.ShaderChunk[ "lightmap_pars_fragment" ],
		THREE.ShaderChunk[ "emissivemap_pars_fragment" ],
		THREE.ShaderChunk[ "envmap_pars_fragment" ],
		THREE.ShaderChunk[ "fog_pars_fragment" ],
		THREE.ShaderChunk[ "bsdfs" ],
		THREE.ShaderChunk[ "lights_pars" ],
		THREE.ShaderChunk[ "lights_phong_pars_fragment" ],
		THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
		THREE.ShaderChunk[ "bumpmap_pars_fragment" ],
		THREE.ShaderChunk[ "normalmap_pars_fragment" ],
		THREE.ShaderChunk[ "specularmap_pars_fragment" ],
		THREE.ShaderChunk[ "logdepthbuf_pars_fragment" ],
		THREE.ShaderChunk[ "clipping_planes_pars_fragment" ],

		// ---- MMD specific for cel shading
		"	uniform bool outlineDrawing;",
		"	uniform vec3 outlineColor;",
		"	uniform float outlineAlpha;",
		"	uniform bool celShading;",
		"	uniform sampler2D toonMap;",
		"	uniform bool hasToonTexture;",

		"	vec3 toon ( vec3 lightDirection, vec3 norm ) {",
		"		if ( ! hasToonTexture ) {",
		"			return vec3( 1.0 );",
		"		}",
		"		vec2 coord = vec2( 0.0, 0.5 * ( 1.0 - dot( lightDirection, norm ) ) );",
		"		return texture2D( toonMap, coord ).rgb;",
		"	}",

		// redefine for MMD
		"#undef RE_Direct",
		"void RE_Direct_BlinnMMD( const in IncidentLight directLight, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {",
		"	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );",
		"	vec3 irradiance = dotNL * directLight.color;",

		"	#ifndef PHYSICALLY_CORRECT_LIGHTS",

		"		irradiance *= PI; // punctual light",

		"	#endif",

		// ---- MMD specific for toon mapping
		"	if ( celShading ) {",
		"		reflectedLight.directDiffuse += material.diffuseColor * directLight.color * toon( directLight.direction, geometry.normal );",
		"	} else {",
		"		reflectedLight.directDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );",
		"	}",
		// ---- MMD specific for toon mapping

		"	reflectedLight.directSpecular += irradiance * BRDF_Specular_BlinnPhong( directLight, geometry, material.specularColor, material.specularShininess ) * material.specularStrength;",
		"}",
		// ---- MMD specific for toon mapping
		"#define RE_Direct	RE_Direct_BlinnMMD",
		// ---- MMD specific for toon mapping

		"void main() {",

		// ---- MMD specific for outline drawing
		"	if ( outlineDrawing ) {",
		"		gl_FragColor = vec4( outlineColor, outlineAlpha );",
		"		return;",
		"	}",
		// ---- MMD specific for outline drawing

			THREE.ShaderChunk[ "clipping_planes_fragment" ],

		"	vec4 diffuseColor = vec4( diffuse, opacity );",
		"	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );",
		"	vec3 totalEmissiveRadiance = emissive;",

			THREE.ShaderChunk[ "logdepthbuf_fragment" ],
			THREE.ShaderChunk[ "map_fragment" ],
			THREE.ShaderChunk[ "color_fragment" ],
			THREE.ShaderChunk[ "alphamap_fragment" ],
			THREE.ShaderChunk[ "alphatest_fragment" ],
			THREE.ShaderChunk[ "specularmap_fragment" ],
			THREE.ShaderChunk[ "normal_fragment" ],
			THREE.ShaderChunk[ "emissivemap_fragment" ],

			// accumulation
			THREE.ShaderChunk[ "lights_phong_fragment" ],
			THREE.ShaderChunk[ "lights_template" ],

			// modulation
			THREE.ShaderChunk[ "aomap_fragment" ],

			"vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;",

			THREE.ShaderChunk[ "envmap_fragment" ],

		"	gl_FragColor = vec4( outgoingLight, diffuseColor.a );",

			THREE.ShaderChunk[ "premultiplied_alpha_fragment" ],
			THREE.ShaderChunk[ "tonemapping_fragment" ],
			THREE.ShaderChunk[ "encodings_fragment" ],
			THREE.ShaderChunk[ "fog_fragment" ],

		"}"

	].join( "\n" )

};

THREE.MMDAudioManager = function ( audio, listener, p ) {

	var params = ( p === null || p === undefined ) ? {} : p;

	this.audio = audio;
	this.listener = listener;

	this.elapsedTime = 0.0;
	this.currentTime = 0.0;
	this.delayTime = params.delayTime !== undefined ? params.delayTime : 0.0;

	this.audioDuration = this.audio.source.buffer.duration;
	this.duration = this.audioDuration + this.delayTime;

};

THREE.MMDAudioManager.prototype = {

	constructor: THREE.MMDAudioManager,

	control: function ( delta ) {

		this.elapsed += delta;
		this.currentTime += delta;

		if ( this.checkIfStopAudio() ) {

			this.audio.stop();

		}

		if ( this.checkIfStartAudio() ) {

			this.audio.play();

		}

	},

	checkIfStartAudio: function () {

		if ( this.audio.isPlaying ) {

			return false;

		}

		while ( this.currentTime >= this.duration ) {

			this.currentTime -= this.duration;

		}

		if ( this.currentTime < this.delayTime ) {

			return false;

		}

		this.audio.startTime = this.currentTime - this.delayTime;

		return true;

	},

	checkIfStopAudio: function () {

		if ( ! this.audio.isPlaying ) {

			return false;

		}

		if ( this.currentTime >= this.duration ) {

			return true;

		}

		return false;

	}

};

THREE.MMDGrantSolver = function ( mesh ) {

	this.mesh = mesh;

};

THREE.MMDGrantSolver.prototype = {

	constructor: THREE.MMDGrantSolver,

	update: function () {

		var q = new THREE.Quaternion();

		return function () {

			for ( var i = 0; i < this.mesh.geometry.grants.length; i ++ ) {

				var g = this.mesh.geometry.grants[ i ];
				var b = this.mesh.skeleton.bones[ g.index ];
				var pb = this.mesh.skeleton.bones[ g.parentIndex ];

				if ( g.isLocal ) {

					// TODO: implement
					if ( g.affectPosition ) {

					}

					// TODO: implement
					if ( g.affectRotation ) {

					}

				} else {

					// TODO: implement
					if ( g.affectPosition ) {

					}

					if ( g.affectRotation ) {

						q.set( 0, 0, 0, 1 );
						q.slerp( pb.quaternion, g.ratio );
						b.quaternion.multiply( q );
						b.updateMatrixWorld( true );

					}

				}

			}

		};

	}()

};

THREE.MMDHelper = function ( renderer ) {

	this.renderer = renderer;
	this.effect = null;

	this.meshes = [];

	this.doAnimation = true;
	this.doIk = true;
	this.doGrant = true;
	this.doPhysics = true;
	this.doOutlineDrawing = true;
	this.doCameraAnimation = true;

	this.audioManager = null;
	this.camera = null;

	this.init();

};

THREE.MMDHelper.prototype = {

	constructor: THREE.MMDHelper,

	init: function () {

		this.initRender();

	},

	initRender: function () {

		this.renderer.autoClear = false;
		this.renderer.autoClearColor = false;
		this.renderer.autoClearDepth = false;

	},

	add: function ( mesh ) {

		mesh.mixer = null;
		mesh.ikSolver = null;
		mesh.grantSolver = null;
		mesh.physics = null;
		this.meshes.push( mesh );

		// workaround until I make IK and Physics Animation plugin
		this.initBackupBones( mesh );

	},

	/*
	 * Note: There may be a possibility that Outline wouldn't work well with Effect.
	 *       In such a case, try to set doOutlineDrawing = false or
	 *       manually comment out renderer.clear() in *Effect.render().
	 */
	setEffect: function ( effect ) {

		this.effect = effect;

	},

	setAudio: function ( audio, listener, params ) {

		this.audioManager = new THREE.MMDAudioManager( audio, listener, params );

	},

	setCamera: function ( camera ) {

		camera.mixer = null;
		this.camera = camera;

	},

	setPhysicses: function ( params ) {

		for ( var i = 0; i < this.meshes.length; i++ ) {

			this.setPhysics( this.meshes[ i ], params );

		}

	},

	setPhysics: function ( mesh, params ) {

		mesh.physics = new THREE.MMDPhysics( mesh, params );
		mesh.physics.warmup( 10 );

	},

	setAnimations: function () {

		for ( var i = 0; i < this.meshes.length; i++ ) {

			this.setAnimation( this.meshes[ i ] );

		}

	},

	setAnimation: function ( mesh ) {

		if ( mesh.geometry.animations !== undefined ) {

			mesh.mixer = new THREE.AnimationMixer( mesh );

			var foundAnimation = false;
			var foundMorphAnimation = false;

			for ( var i = 0; i < mesh.geometry.animations.length; i++ ) {

				var clip = mesh.geometry.animations[ i ];

				var action = mesh.mixer.clipAction( clip );

				if ( clip.tracks[ 0 ].name.indexOf( '.morphTargetInfluences' ) === 0 ) {

					if ( ! foundMorphAnimation ) {

						action.play();
						foundMorphAnimation = true;

					}

				} else {

					if ( ! foundAnimation ) {

						action.play();
						foundAnimation = true;

					}

				}

			}

			if ( foundAnimation ) {

				mesh.ikSolver = new THREE.CCDIKSolver( mesh );

				if ( mesh.geometry.grants !== undefined ) {

					mesh.grantSolver = new THREE.MMDGrantSolver( mesh );

				}

			}

		}

	},

	setCameraAnimation: function ( camera ) {

		if ( camera.animations !== undefined ) {

			camera.mixer = new THREE.AnimationMixer( camera );
			camera.mixer.clipAction( camera.animations[ 0 ] ).play();

		}

	},

	/*
	 * detect the longest duration among model, camera, and audio animation and then
	 * set it to them to sync.
	 * TODO: touching private properties ( ._actions and ._clip ) so consider better way
	 *       to access them for safe and modularity.
	 */
	unifyAnimationDuration: function ( params ) {

		params = params === undefined ? {} : params;

		var max = 0.0;

		var camera = this.camera;
		var audioManager = this.audioManager;

		// check the longest duration
		for ( var i = 0; i < this.meshes.length; i++ ) {

			var mesh = this.meshes[ i ];
			var mixer = mesh.mixer;

			if ( mixer === null ) {

				continue;

			}

			for ( var j = 0; j < mixer._actions.length; j++ ) {

				var action = mixer._actions[ j ];
				max = Math.max( max, action._clip.duration );

			}

		}

		if ( camera !== null && camera.mixer !== null ) {

			var mixer = camera.mixer;

			for ( var i = 0; i < mixer._actions.length; i++ ) {

				var action = mixer._actions[ i ];
				max = Math.max( max, action._clip.duration );

			}

		}

		if ( audioManager !== null ) {

			max = Math.max( max, audioManager.duration );

		}

		if ( params.afterglow !== undefined ) {

			max += params.afterglow;

		}

		// set the duration
		for ( var i = 0; i < this.meshes.length; i++ ) {

			var mesh = this.meshes[ i ];
			var mixer = mesh.mixer;

			if ( mixer === null ) {

				continue;

			}

			for ( var j = 0; j < mixer._actions.length; j++ ) {

				var action = mixer._actions[ j ];
				action._clip.duration = max;

			}

		}

		if ( camera !== null && camera.mixer !== null ) {

			var mixer = camera.mixer;

			for ( var i = 0; i < mixer._actions.length; i++ ) {

				var action = mixer._actions[ i ];
				action._clip.duration = max;

			}

		}

		if ( audioManager !== null ) {

			audioManager.duration = max;

		}

	},

	controlAudio: function ( delta ) {

		if ( this.audioManager === null ) {

			return;

		}

		this.audioManager.control( delta );

	},

	animate: function ( delta ) {

		this.controlAudio( delta );

		for ( var i = 0; i < this.meshes.length; i++ ) {

			this.animateOneMesh( delta, this.meshes[ i ] );

		}

		this.animateCamera( delta );

	},

	animateOneMesh: function ( delta, mesh ) {

		var mixer = mesh.mixer;
		var ikSolver = mesh.ikSolver;
		var grantSolver = mesh.grantSolver;
		var physics = mesh.physics;

		if ( mixer !== null && this.doAnimation === true ) {

			mixer.update( delta );

			// workaround until I make IK, Grant, and Physics Animation plugin
			this.backupBones( mesh );

		}

		if ( ikSolver !== null && this.doIk === true ) {

			ikSolver.update();

		}

		if ( grantSolver !== null && this.doGrant === true ) {

			grantSolver.update();

		}

		if ( physics !== null && this.doPhysics === true ) {

			physics.update( delta );

		}

	},

	animateCamera: function ( delta ) {

		if ( this.camera === null ) {

			return;

		}

		var mixer = this.camera.mixer;

		if ( mixer !== null && this.camera.center !== undefined && this.doCameraAnimation === true ) {

			mixer.update( delta );

			// TODO: Let PerspectiveCamera automatically update?
			this.camera.updateProjectionMatrix();

			this.camera.lookAt( this.camera.center );

		}

	},

	render: function ( scene, camera ) {

		this.renderer.clearColor();
		this.renderer.clearDepth();
		this.renderer.clear( true, true );

		this.renderMain( scene, camera );

		if ( this.doOutlineDrawing ) {

			this.renderOutline( scene, camera );

		}

		// workaround until I make IK and Physics Animation plugin
		for ( var i = 0; i < this.meshes.length; i++ ) {

			this.restoreBones( this.meshes[ i ] );

		}

	},

	renderMain: function ( scene, camera ) {

		this.setupMainRendering();
		this.callRender( scene, camera );

	},

	renderOutline: function ( scene, camera ) {

		var tmpEnabled = this.renderer.shadowMap.enabled;
		this.renderer.shadowMap.enabled = false;

		this.setupOutlineRendering();
		this.callRender( scene, camera );

		this.renderer.shadowMap.enabled = tmpEnabled;

	},

	callRender: function ( scene, camera ) {

		if ( this.effect === null ) {

			this.renderer.render( scene, camera );

		} else {

			this.effect.render( scene, camera );

		}

	},

	setupMainRendering: function () {

		for ( var i = 0; i < this.meshes.length; i++ ) {

			this.setupMainRenderingOneMesh( this.meshes[ i ] );

		}

	},

	setupMainRenderingOneMesh: function ( mesh ) {

		for ( var i = 0; i < mesh.material.materials.length; i++ ) {

			var m = mesh.material.materials[ i ];
			m.uniforms.outlineDrawing.value = 0;
			m.visible = true;

			if ( m.opacity === 1.0 ) {

				m.side = THREE.FrontSide;
				m.transparent = false;

			} else {

				m.side = THREE.DoubleSide;
				m.transparent = true;

			}

			if ( m.textureTransparency === true || m.morphTransparency === true ) {

				m.transparent = true;

			}

		}

	},

	setupOutlineRendering: function () {

		for ( var i = 0; i < this.meshes.length; i++ ) {

			this.setupOutlineRenderingOneMesh( this.meshes[ i ] );

		}

	},

	setupOutlineRenderingOneMesh: function ( mesh ) {

		for ( var i = 0; i < mesh.material.materials.length; i++ ) {

			var m = mesh.material.materials[ i ];
			m.uniforms.outlineDrawing.value = 1;
			m.side = THREE.BackSide;

			if ( m.uniforms.outlineAlpha.value < 1.0 ) {

				m.transparent = true;

			}

			if ( m.uniforms.outlineThickness.value === 0.0 ) {

				m.visible = false;

			}

		}

	},

	resetPose: function ( mesh ) {

		var bones = mesh.skeleton.bones;
		var bones2 = mesh.geometry.bones;

		var v = new THREE.Vector3();
		var q = new THREE.Quaternion();

		for ( var i = 0; i < bones.length; i++ ) {

			var b = bones2[ i ];
			v.set( b.pos[ 0 ], b.pos[ 1 ], b.pos[ 2 ] );
			q.set( b.rotq[ 0 ], b.rotq[ 1 ], b.rotq[ 2 ], b.rotq[ 3 ] );

			bones[ i ].position.copy( v );
			bones[ i ].quaternion.copy( q );

		}

	},

	poseAsVpd: function ( mesh, vpd, params ) {

		if ( ! ( params && params.preventResetPose === true ) ) {

			this.resetPose( mesh );

		}

		var bones = mesh.skeleton.bones;
		var bones2 = vpd.bones;

		var table = {};

		for ( var i = 0; i < bones.length; i++ ) {

			var b = bones[ i ];
			table[ b.name ] = i;

		}

		var thV = new THREE.Vector3();
		var thQ = new THREE.Quaternion();

		for ( var i = 0; i < bones2.length; i++ ) {

			var b = bones2[ i ];
			var index = table[ b.name ];

			if ( index === undefined ) {

				continue;

			}

			var b2 = bones[ index ];
			var t = b.translation;
			var q = b.quaternion;

			thV.set( t[ 0 ], t[ 1 ], t[ 2 ] );
			thQ.set( q[ 0 ], q[ 1 ], q[ 2 ], q[ 3 ] );

			b2.position.add( thV );
			b2.quaternion.multiply( thQ );

			b2.updateMatrixWorld( true );

		}

		if ( params === undefined || params.preventIk !== true ) {

			var solver = new THREE.CCDIKSolver( mesh );
			solver.update();

		}

		if ( params === undefined || params.preventGrant !== true ) {

			if ( mesh.geometry.grants !== undefined ) {

				var solver = new THREE.MMDGrantSolver( mesh );
				solver.update();

			}

		}

	},

	/*
	 * Note: These following three functions are workaround for r74dev.
	 *       THREE.PropertyMixer.apply() seems to save values into buffer cache
	 *       when mixer.update() is called.
	 *       ikSolver.update() and physics.update() change bone position/quaternion
	 *       without mixer.update() then buffer cache will be inconsistent.
	 *       So trying to avoid buffer cache inconsistency by doing
	 *       backup bones position/quaternion right after mixer.update() call
	 *       and then restore them after rendering.
	 */
	initBackupBones: function ( mesh ) {

		mesh.skeleton.backupBones = [];

		for ( var i = 0; i < mesh.skeleton.bones.length; i++ ) {

			mesh.skeleton.backupBones.push( mesh.skeleton.bones[ i ].clone() );

		}

	},

	backupBones: function ( mesh ) {

		mesh.skeleton.backupBoneIsSaved = true;

		for ( var i = 0; i < mesh.skeleton.bones.length; i++ ) {

			var b = mesh.skeleton.backupBones[ i ];
			var b2 = mesh.skeleton.bones[ i ];
			b.position.copy( b2.position );
			b.quaternion.copy( b2.quaternion );

		}

	},

	restoreBones: function ( mesh ) {

		if ( mesh.skeleton.backupBoneIsSaved !== true ) {

			return;

		}

		mesh.skeleton.backupBoneIsSaved = false;

		for ( var i = 0; i < mesh.skeleton.bones.length; i++ ) {

			var b = mesh.skeleton.bones[ i ];
			var b2 = mesh.skeleton.backupBones[ i ];
			b.position.copy( b2.position );
			b.quaternion.copy( b2.quaternion );

		}

	}

};
