/**
 * @author takahiro / https://github.com/takahirox
 *
 * Dependencies
 *  - charset-encoder-js https://github.com/takahirox/charset-encoder-js
 *  - ammo.js https://github.com/kripken/ammo.js
 *  - THREE.TGALoader
 *  - THREE.MMDPhysics
 *  - THREE.CCDIKSolver
 *  - THREE.OutlineEffect
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

THREE.MMDLoader = function ( manager ) {

	THREE.Loader.call( this );
	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.MMDLoader.prototype = Object.create( THREE.Loader.prototype );
THREE.MMDLoader.prototype.constructor = THREE.MMDLoader;

/*
 * base64 encoded defalut toon textures toon00.bmp - toon10.bmp
 * Users don't need to prepare default texture files.
 *
 * This idea is from http://www20.atpages.jp/katwat/three.js_r58/examples/mytest37/mmd.three.js
 */
THREE.MMDLoader.prototype.defaultToonTextures = [
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAL0lEQVRYR+3QQREAAAzCsOFfNJPBJ1XQS9r2hsUAAQIECBAgQIAAAQIECBAgsBZ4MUx/ofm2I/kAAAAASUVORK5CYII=',
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAN0lEQVRYR+3WQREAMBACsZ5/bWiiMvgEBTt5cW37hjsBBAgQIECAwFwgyfYPCCBAgAABAgTWAh8aBHZBl14e8wAAAABJRU5ErkJggg==',
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAOUlEQVRYR+3WMREAMAwDsYY/yoDI7MLwIiP40+RJklfcCCBAgAABAgTqArfb/QMCCBAgQIAAgbbAB3z/e0F3js2cAAAAAElFTkSuQmCC',
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAN0lEQVRYR+3WQREAMBACsZ5/B5ilMvgEBTt5cW37hjsBBAgQIECAwFwgyfYPCCBAgAABAgTWAh81dWyx0gFwKAAAAABJRU5ErkJggg==',
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAOklEQVRYR+3WoREAMAwDsWb/UQtCy9wxTOQJ/oQ8SXKKGwEECBAgQIBAXeDt7f4BAQQIECBAgEBb4AOz8Hzx7WLY4wAAAABJRU5ErkJggg==',
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABPUlEQVRYR+1XwW7CMAy1+f9fZOMysSEOEweEOPRNdm3HbdOyIhAcklPrOs/PLy9RygBALxzcCDQFmgJNgaZAU6Ap0BR4PwX8gsRMVLssMRH5HcpzJEaWL7EVg9F1IHRlyqQohgVr4FGUlUcMJSjcUlDw0zvjeun70cLWmneoyf7NgBTQSniBTQQSuJAZsOnnaczjIMb5hCiuHKxokCrJfVnrctyZL0PkJAJe1HMil4nxeyi3Ypfn1kX51jpPvo/JeCNC4PhVdHdJw2XjBR8brF8PEIhNVn12AgP7uHsTBguBn53MUZCqv7Lp07Pn5k1Ro+uWmUNn7D+M57rtk7aG0Vo73xyF/fbFf0bPJjDXngnGocDTdFhygZjwUQrMNrDcmZlQT50VJ/g/UwNyHpu778+yW+/ksOz/BFo54P4AsUXMfRq7XWsAAAAASUVORK5CYII=',
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACMElEQVRYR+2Xv4pTQRTGf2dubhLdICiii2KnYKHVolhauKWPoGAnNr6BD6CvIVaihYuI2i1ia0BY0MZGRHQXjZj/mSPnnskfNWiWZUlzJ5k7M2cm833nO5Mziej2DWWJRUoCpQKlAntSQCqgw39/iUWAGmh37jrRnVsKlgpiqmkoGVABA7E57fvY+pJDdgKqF6HzFCSADkDq+F6AHABtQ+UMVE5D7zXod7fFNhTEckTbj5XQgHzNN+5tQvc5NG7C6BNkp6D3EmpXHDR+dQAjFLchW3VS9rlw3JBh+B7ys5Cf9z0GW1C/7P32AyBAOAz1q4jGliIH3YPuBnSfQX4OGreTIgEYQb/pBDtPnEQ4CivXYPAWBk13oHrB54yA9QuSn2H4AcKRpEILDt0BUzj+RLR1V5EqjD66NPRBVpLcQwjHoHYJOhsQv6U4mnzmrIXJCFr4LDwm/xBUoboG9XX4cc9VKdYoSA2yk5NQLJaKDUjTBoveG3Z2TElTxwjNK4M3LEZgUdDdruvcXzKBpStgp2NPiWi3ks9ZXxIoFVi+AvHLdc9TqtjL3/aYjpPlrzOcEnK62Szhimdd7xX232zFDTgtxezOu3WNMRLjiKgjtOhHVMd1loynVHvOgjuIIJMaELEqhJAV/RCSLbWTcfPFakFgFlALTRRvx+ok6Hlp/Q+v3fmx90bMyUzaEAhmM3KvHlXTL5DxnbGf/1M8RNNACLL5MNtPxP/mypJAqcDSFfgFhpYqWUzhTEAAAAAASUVORK5CYII=',
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAL0lEQVRYR+3QQREAAAzCsOFfNJPBJ1XQS9r2hsUAAQIECBAgQIAAAQIECBAgsBZ4MUx/ofm2I/kAAAAASUVORK5CYII=',
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAL0lEQVRYR+3QQREAAAzCsOFfNJPBJ1XQS9r2hsUAAQIECBAgQIAAAQIECBAgsBZ4MUx/ofm2I/kAAAAASUVORK5CYII=',
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAL0lEQVRYR+3QQREAAAzCsOFfNJPBJ1XQS9r2hsUAAQIECBAgQIAAAQIECBAgsBZ4MUx/ofm2I/kAAAAASUVORK5CYII=',
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAL0lEQVRYR+3QQREAAAzCsOFfNJPBJ1XQS9r2hsUAAQIECBAgQIAAAQIECBAgsBZ4MUx/ofm2I/kAAAAASUVORK5CYII='
];

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

		var times = [];
		var centers = [];
		var quaternions = [];
		var positions = [];
		var fovs = [];

		var cInterpolations = [];
		var qInterpolations = [];
		var pInterpolations = [];
		var fInterpolations = [];

		var quaternion = new THREE.Quaternion();
		var euler = new THREE.Euler();
		var position = new THREE.Vector3();
		var center = new THREE.Vector3();

		var pushVector3 = function ( array, vec ) {

			array.push( vec.x );
			array.push( vec.y );
			array.push( vec.z );

		};

		var pushQuaternion = function ( array, q ) {

			array.push( q.x );
			array.push( q.y );
			array.push( q.z );
			array.push( q.w );

		};

		var pushInterpolation = function ( array, interpolation, index ) {

			array.push( interpolation[ index * 4 + 0 ] / 127 ); // x1
			array.push( interpolation[ index * 4 + 1 ] / 127 ); // x2
			array.push( interpolation[ index * 4 + 2 ] / 127 ); // y1
			array.push( interpolation[ index * 4 + 3 ] / 127 ); // y2

		};

		var createTrack = function ( node, type, times, values, interpolations ) {

			/*
			 * optimizes here not to let KeyframeTrackPrototype optimize
			 * because KeyframeTrackPrototype optimizes times and values but
			 * doesn't optimize interpolations.
			 */
			if ( times.length > 2 ) {

				times = times.slice();
				values = values.slice();
				interpolations = interpolations.slice();

				var stride = values.length / times.length;
				var interpolateStride = ( stride === 3 ) ? 12 : 4;  // 3: Vector3, others: Quaternion or Number

				var aheadIndex = 2;
				var index = 1;

				for ( aheadIndex = 2, endIndex = times.length; aheadIndex < endIndex; aheadIndex ++ ) {

					for ( var i = 0; i < stride; i ++ ) {

						if ( values[ index * stride + i ] !== values[ ( index - 1 ) * stride + i ] ||
							values[ index * stride + i ] !== values[ aheadIndex * stride + i ] ) {

							index ++;
							break;

						}

					}

					if ( aheadIndex > index ) {

						times[ index ] = times[ aheadIndex ];

						for ( var i = 0; i < stride; i ++ ) {

							values[ index * stride + i ] = values[ aheadIndex * stride + i ];

						}

						for ( var i = 0; i < interpolateStride; i ++ ) {

							interpolations[ index * interpolateStride + i ] = interpolations[ aheadIndex * interpolateStride + i ];

						}

					}

				}

				times.length = index + 1;
				values.length = ( index + 1 ) * stride;
				interpolations.length = ( index + 1 ) * interpolateStride;

			}

			return new THREE.MMDLoader[ type ]( node, times, values, interpolations );

		};

		for ( var i = 0; i < orderedMotions.length; i++ ) {

			var m = orderedMotions[ i ];

			var time = m.frameNum / 30;
			var pos = m.position;
			var rot = m.rotation;
			var distance = m.distance;
			var fov = m.fov;
			var interpolation = m.interpolation;

			position.set( 0, 0, -distance );
			center.set( pos[ 0 ], pos[ 1 ], pos[ 2 ] );

			euler.set( -rot[ 0 ], -rot[ 1 ], -rot[ 2 ] );
			quaternion.setFromEuler( euler );

			position.add( center );
			position.applyQuaternion( quaternion );

			/*
			 * Note: This is a workaround not to make Animation system calculate lerp
			 *       if the diff from the last frame is 1 frame (in 30fps).
			 */
			if ( times.length > 0 && time < times[ times.length - 1 ] + ( 1 / 30 ) * 1.5 ) {

				times[ times.length - 1 ] = time - 1e-13;

			}

			times.push( time );

			pushVector3( centers, center );
			pushQuaternion( quaternions, quaternion );
			pushVector3( positions, position );

			fovs.push( fov );

			for ( var j = 0; j < 3; j ++ ) {

				pushInterpolation( cInterpolations, interpolation, j );

			}

			pushInterpolation( qInterpolations, interpolation, 3 );

			// use same one parameter for x, y, z axis.
			for ( var j = 0; j < 3; j ++ ) {

				pushInterpolation( pInterpolations, interpolation, 4 );

			}

			pushInterpolation( fInterpolations, interpolation, 5 );

		}

		if ( times.length === 0 ) return;

		var tracks = [];

		tracks.push( createTrack( '.center', 'VectorKeyframeTrackEx', times, centers, cInterpolations ) );
		tracks.push( createTrack( '.quaternion', 'QuaternionKeyframeTrackEx', times, quaternions, qInterpolations ) );
		tracks.push( createTrack( '.position', 'VectorKeyframeTrackEx', times, positions, pInterpolations ) );
		tracks.push( createTrack( '.fov', 'NumberKeyframeTrackEx', times, fovs, fInterpolations ) );

		var clip = new THREE.AnimationClip( name === undefined ? THREE.Math.generateUUID() : name, -1, tracks );

		if ( clip !== null ) {

			if ( camera.center === undefined ) camera.center = new THREE.Vector3( 0, 0, 0 );
			if ( camera.animations === undefined ) camera.animations = [];
			camera.animations.push( clip );

		}

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

THREE.MMDLoader.prototype.loadFile = function ( url, onLoad, onProgress, onError, responseType, mimeType ) {

	var loader = new THREE.FileLoader( this.manager );

	if ( mimeType !== undefined ) loader.setMimeType( mimeType );

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

	var request = this.loadFile( url, onLoad, onProgress, onError, 'text', 'text/plain; charset=shift_jis' );

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
			p.name = dv.getSjisStringsAsUnicode( 20 );
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
			p.restitution = dv.getFloat32();
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
			p.indices = dv.getIndexArray( metadata.vertexIndexSize, 3, true );
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
			p.name = dv.getTextBuffer();
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
					m.index = dv.getIndex( pmx.metadata.vertexIndexSize, true );
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
					m.index = dv.getIndex( pmx.metadata.vertexIndexSize, true );
					m.uv = dv.getFloat32Array( 4 );
					p.elements.push( m );

				} else if ( p.type === 4 ) {  // additional uv1

					// TODO: implement

				} else if ( p.type === 5 ) {  // additional uv2

					// TODO: implement

				} else if ( p.type === 6 ) {  // additional uv3

					// TODO: implement

				} else if ( p.type === 7 ) {  // additional uv4

					// TODO: implement

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
			p.restitution = dv.getFloat32();
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
			p.boneName = dv.getSjisStringsAsUnicode( 15 );
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

					name: n,
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
	var geometry = new THREE.BufferGeometry();
	var material = new THREE.MultiMaterial();
	var helper = new THREE.MMDLoader.DataCreationHelper();

	var buffer = {};

	buffer.vertices = [];
	buffer.uvs = [];
	buffer.normals = [];
	buffer.skinIndices = [];
	buffer.skinWeights = [];
	buffer.indices = [];

	var initVartices = function () {

		for ( var i = 0; i < model.metadata.vertexCount; i++ ) {

			var v = model.vertices[ i ];

			for ( var j = 0, jl = v.position.length; j < jl; j ++ ) {

				buffer.vertices.push( v.position[ j ] );

			}

			for ( var j = 0, jl = v.normal.length; j < jl; j ++ ) {

				buffer.normals.push( v.normal[ j ] );

			}

			for ( var j = 0, jl = v.uv.length; j < jl; j ++ ) {

				buffer.uvs.push( v.uv[ j ] );

			}

			for ( var j = 0; j < 4; j ++ ) {

				buffer.skinIndices.push( v.skinIndices.length - 1 >= j ? v.skinIndices[ j ] : 0.0 );

			}

			for ( var j = 0; j < 4; j ++ ) {

				buffer.skinWeights.push( v.skinWeights.length - 1 >= j ? v.skinWeights[ j ] : 0.0 );

			}

		}

	};

	var initFaces = function () {

		for ( var i = 0; i < model.metadata.faceCount; i++ ) {

			var f = model.faces[ i ];

			for ( var j = 0, jl = f.indices.length; j < jl; j ++ ) {

				buffer.indices.push( f.indices[ j ] );

			}

		}

	};

	var initBones = function () {

		var bones = [];

		var rigidBodies = model.rigidBodies;
		var dictionary = {};

		for ( var i = 0, il = rigidBodies.length; i < il; i ++ ) {

			var body = rigidBodies[ i ];
			var value = dictionary[ body.boneIndex ];

			// keeps greater number if already value is set without any special reasons
			value = value === undefined ? body.type : Math.max( body.type, value );

			dictionary[ body.boneIndex ] = value;

		}

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

			bone.rigidBodyType = dictionary[ i ] !== undefined ? dictionary[ i ] : -1;

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

					if ( model.bones[ link.index ].name.indexOf( 'ひざ' ) >= 0 ) {

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
					link.enabled = true;

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
			param.transformationClass = b.transformationClass;

			grants.push( param );

		}

		grants.sort( function ( a, b ) {

			return a.transformationClass - b.transformationClass;

		} );

		geometry.grants = grants;

	};

	var initMorphs = function () {

		function updateVertex( attribute, index, v, ratio ) {

			attribute.array[ index * 3 + 0 ] += v.position[ 0 ] * ratio;
			attribute.array[ index * 3 + 1 ] += v.position[ 1 ] * ratio;
			attribute.array[ index * 3 + 2 ] += v.position[ 2 ] * ratio;

		};

		function updateVertices( attribute, m, ratio ) {

			for ( var i = 0; i < m.elementCount; i++ ) {

				var v = m.elements[ i ];

				var index;

				if ( model.metadata.format === 'pmd' ) {

					index = model.morphs[ 0 ].elements[ v.index ].index;

				} else {

					index = v.index;

				}

				updateVertex( attribute, index, v, ratio );

			}

		};

		var morphTargets = [];
		var attributes = [];

		for ( var i = 0; i < model.metadata.morphCount; i++ ) {

			var m = model.morphs[ i ];
			var params = { name: m.name };

			var attribute = new THREE.Float32Attribute( model.metadata.vertexCount * 3, 3 );

			for ( var j = 0; j < model.metadata.vertexCount * 3; j++ ) {

				attribute.array[ j ] = buffer.vertices[ j ];

			}

			if ( model.metadata.format === 'pmd' ) {

				if ( i !== 0 ) {

					updateVertices( attribute, m, 1.0 );

				}

			} else {

				if ( m.type === 0 ) {    // group

					for ( var j = 0; j < m.elementCount; j++ ) {

						var m2 = model.morphs[ m.elements[ j ].index ];
						var ratio = m.elements[ j ].ratio;

						if ( m2.type === 1 ) {

							updateVertices( attribute, m2, ratio );

						} else {

							// TODO: implement

						}

					}

				} else if ( m.type === 1 ) {    // vertex

					updateVertices( attribute, m, 1.0 );

				} else if ( m.type === 2 ) {    // bone

					// TODO: implement

				} else if ( m.type === 3 ) {    // uv

					// TODO: implement

				} else if ( m.type === 4 ) {    // additional uv1

					// TODO: implement

				} else if ( m.type === 5 ) {    // additional uv2

					// TODO: implement

				} else if ( m.type === 6 ) {    // additional uv3

					// TODO: implement

				} else if ( m.type === 7 ) {    // additional uv4

					// TODO: implement

				} else if ( m.type === 8 ) {    // material

					// TODO: implement

				}

			}

			morphTargets.push( params );
			attributes.push( attribute );

		}

		geometry.morphTargets = morphTargets;
		geometry.morphAttributes.position = attributes;

	};

	var initMaterials = function () {

		var textures = [];
		var textureLoader = new THREE.TextureLoader( this.manager );
		var tgaLoader = new THREE.TGALoader( this.manager );
		var color = new THREE.Color();
		var offset = 0;
		var materialParams = [];

		function loadTexture ( filePath, params ) {

			if ( params === undefined ) {

				params = {};

			}

			var fullPath;

			if ( params.defaultTexturePath === true ) {

				try {

					fullPath = scope.defaultToonTextures[ parseInt( filePath.match( 'toon([0-9]{2})\.bmp$' )[ 1 ] ) ];

				} catch ( e ) {

					console.warn( 'THREE.MMDLoader: ' + filePath + ' seems like not right default texture path. Using toon00.bmp instead.' )
					fullPath = scope.defaultToonTextures[ 0 ];

				}

			} else {

				fullPath = texturePath + filePath;

			}

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

				delete texture.readyCallbacks;

			} );

			texture.readyCallbacks = [];

			var uuid = THREE.Math.generateUUID();

			textures[ uuid ] = texture;

			return uuid;

		};

		function getTexture( name, textures ) {

			if ( textures[ name ] === undefined ) {

				console.warn( 'THREE.MMDLoader: Undefined texture', name );

			}

			return textures[ name ];

		};

		for ( var i = 0; i < model.metadata.materialCount; i++ ) {

			var m = model.materials[ i ];
			var params = {};

			params.faceOffset = offset;
			params.faceNum = m.faceCount;

			offset += m.faceCount;

			params.name = m.name;
			params.color = color.fromArray( [ m.diffuse[ 0 ], m.diffuse[ 1 ], m.diffuse[ 2 ] ] ).clone();
			params.opacity = m.diffuse[ 3 ];
			params.specular = color.fromArray( [ m.specular[ 0 ], m.specular[ 1 ], m.specular[ 2 ] ] ).clone();
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

				params.emissive = color.fromArray( [ m.emissive[ 0 ], m.emissive[ 1 ], m.emissive[ 2 ] ] ).clone();

			}

			materialParams.push( params );

		}

		var shader = THREE.ShaderLib[ 'mmd' ];

		for ( var i = 0; i < materialParams.length; i++ ) {

			var p = materialParams[ i ];
			var p2 = model.materials[ i ];
			var m = new THREE.ShaderMaterial( {
				uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
				vertexShader: shader.vertexShader,
				fragmentShader: shader.fragmentShader
			} );

			geometry.addGroup( p.faceOffset * 3, p.faceNum * 3, i );

			if ( p.name !== undefined ) m.name = p.name;

			m.skinning = geometry.bones.length > 0 ? true : false;
			m.morphTargets = geometry.morphTargets.length > 0 ? true : false;
			m.lights = true;
			m.side = ( model.metadata.format === 'pmx' && ( p2.flag & 0x1 ) === 1 ) ? THREE.DoubleSide : p.side;
			m.transparent = p.transparent;
			m.fog = true;

			m.blending = THREE.CustomBlending;
			m.blendSrc = THREE.SrcAlphaFactor;
			m.blendDst = THREE.OneMinusSrcAlphaFactor;
			m.blendSrcAlpha = THREE.SrcAlphaFactor;
			m.blendDstAlpha = THREE.DstAlphaFactor;

			if ( p.map !== undefined ) {

				m.faceOffset = p.faceOffset;
				m.faceNum = p.faceNum;

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

						function detectTextureTransparency( image, uvs, indices ) {

							var width = image.width;
							var height = image.height;
							var data = image.data;
							var threshold = 253;

							if ( data.length / ( width * height ) !== 4 ) {

								return false;

							}

							for ( var i = 0; i < indices.length; i += 3 ) {

								var centerUV = { x: 0.0, y: 0.0 };

								for ( var j = 0; j < 3; j++ ) {

									var index = indices[ i * 3 + j ];
									var uv = { x: uvs[ index * 2 + 0 ], y: uvs[ index * 2 + 1 ] };

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
						var indices = geometry.index.array.slice( m.faceOffset * 3, m.faceOffset * 3 + m.faceNum * 3 );

						if ( detectTextureTransparency( imageData, geometry.attributes.uv.array, indices ) ) m.transparent = true;

						delete m.faceOffset;
						delete m.faceNum;

					} );

				}

				m.map = getTexture( p.map, textures );
				m.uniforms.map.value = m.map;
				checkTextureTransparency( m );

			}

			if ( p.envMap !== undefined ) {

				m.envMap = getTexture( p.envMap, textures );
				m.uniforms.envMap.value = m.envMap;
				m.combine = p.envMapType;

				// TODO: WebGLRenderer should automatically update?
				m.envMap.readyCallbacks.push( function ( t ) {

					m.needsUpdate = true;

				} );

			}

			m.uniforms.opacity.value = p.opacity;
			m.uniforms.diffuse.value.copy( p.color );

			if ( p.emissive !== undefined ) {

				m.uniforms.emissive.value.copy( p.emissive );

			}

			m.uniforms.specular.value.copy( p.specular );
			m.uniforms.shininess.value = Math.max( p.shininess, 1e-4 ); // to prevent pow( 0.0, 0.0 )

			if ( model.metadata.format === 'pmd' ) {

				function isDefaultToonTexture ( n ) {

					if ( n.length !== 10 ) {

						return false;

					}

					return n.match( /toon(10|0[0-9]).bmp/ ) === null ? false : true;

				};

				m.outlineParameters = {
					thickness: p2.edgeFlag === 1 ? 0.003 : 0.0,
					color: new THREE.Color( 0.0, 0.0, 0.0 ),
					alpha: 1.0
				};

				if ( m.outlineParameters.thickness === 0.0 ) m.outlineParameters.visible = false;

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

				m.outlineParameters = {
					thickness: p2.edgeSize / 300,
					color: new THREE.Color( p2.edgeColor[ 0 ], p2.edgeColor[ 1 ], p2.edgeColor[ 2 ] ),
					alpha: p2.edgeColor[ 3 ]
				};

				if ( ( p2.flag & 0x10 ) === 0 || m.outlineParameters.thickness === 0.0 ) m.outlineParameters.visible = false;

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

					if ( m.uniforms.opacity.value !== e.diffuse[ 3 ] ) {

						m.transparent = true;

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
			 * Refer to http://www20.atpages.jp/katwat/wp/?p=4135
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

	var initGeometry = function () {

		geometry.setIndex( ( buffer.indices.length > 65535 ? THREE.Uint32Attribute : THREE.Uint16Attribute )( buffer.indices, 1 ) );
		geometry.addAttribute( 'position', THREE.Float32Attribute( buffer.vertices, 3 ) );
		geometry.addAttribute( 'normal', THREE.Float32Attribute( buffer.normals, 3 ) );
		geometry.addAttribute( 'uv', THREE.Float32Attribute( buffer.uvs, 2 ) );
		geometry.addAttribute( 'skinIndex', THREE.Float32Attribute( buffer.skinIndices, 4 ) );
		geometry.addAttribute( 'skinWeight', THREE.Float32Attribute( buffer.skinWeights, 4 ) );

		geometry.computeBoundingSphere();
		geometry.mmdFormat = model.metadata.format;

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
	initGeometry();

	var mesh = new THREE.SkinnedMesh( geometry, material );

	// console.log( mesh ); // for console debug

	return mesh;

};

THREE.MMDLoader.prototype.createAnimation = function ( mesh, vmd, name ) {

	var helper = new THREE.MMDLoader.DataCreationHelper();

	var initMotionAnimations = function () {

		if ( vmd.metadata.motionCount === 0 ) {

			return;

		}

		var bones = mesh.geometry.bones;
		var orderedMotions = helper.createOrderedMotionArrays( bones, vmd.motions, 'boneName' );

		var tracks = [];

		var pushInterpolation = function ( array, interpolation, index ) {

			array.push( interpolation[ index + 0 ] / 127 );  // x1
			array.push( interpolation[ index + 8 ] / 127 );  // x2
			array.push( interpolation[ index + 4 ] / 127 );  // y1
			array.push( interpolation[ index + 12 ] / 127 ); // y2

		};

		for ( var i = 0; i < orderedMotions.length; i++ ) {

			var times = [];
			var positions = [];
			var rotations = [];
			var pInterpolations = [];
			var rInterpolations = [];

			var bone = bones[ i ];
			var array = orderedMotions[ i ];

			for ( var j = 0; j < array.length; j++ ) {

				var time = array[ j ].frameNum / 30;
				var pos = array[ j ].position;
				var rot = array[ j ].rotation;
				var interpolation = array[ j ].interpolation;

				times.push( time );

				for ( var k = 0; k < 3; k ++ ) {

					positions.push( bone.pos[ k ] + pos[ k ] );

				}

				for ( var k = 0; k < 4; k ++ ) {

					rotations.push( rot[ k ] );

				}

				for ( var k = 0; k < 3; k ++ ) {

					pushInterpolation( pInterpolations, interpolation, k );

				}

				pushInterpolation( rInterpolations, interpolation, 3 );

			}

			if ( times.length === 0 ) continue;

			var boneName = '.bones[' + bone.name + ']';

			tracks.push( new THREE.MMDLoader.VectorKeyframeTrackEx( boneName + '.position', times, positions, pInterpolations ) );
			tracks.push( new THREE.MMDLoader.QuaternionKeyframeTrackEx( boneName + '.quaternion', times, rotations, rInterpolations ) );

		}

		var clip = new THREE.AnimationClip( name === undefined ? THREE.Math.generateUUID() : name, -1, tracks );

		if ( clip !== null ) {

			if ( mesh.geometry.animations === undefined ) mesh.geometry.animations = [];
			mesh.geometry.animations.push( clip );

		}

	};

	var initMorphAnimations = function () {

		if ( vmd.metadata.morphCount === 0 ) {

			return;

		}

		var orderedMorphs = helper.createOrderedMotionArrays( mesh.geometry.morphTargets, vmd.morphs, 'morphName' );

		var tracks = [];

		for ( var i = 0; i < orderedMorphs.length; i++ ) {

			var times = [];
			var values = [];
			var array = orderedMorphs[ i ];

			for ( var j = 0; j < array.length; j++ ) {

				times.push( array[ j ].frameNum / 30 );
				values.push( array[ j ].weight );

			}

			if ( times.length === 0 ) continue;

			tracks.push( new THREE.NumberKeyframeTrack( '.morphTargetInfluences[' + i + ']', times, values ) );

		}

		var clip = new THREE.AnimationClip( name === undefined ? THREE.Math.generateUUID() : name + 'Morph', -1, tracks );

		if ( clip !== null ) {

			if ( mesh.geometry.animations === undefined ) mesh.geometry.animations = [];
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

		if ( model.metadata.format === 'pmx' && m.type !== 1 ) {

			// TODO: implement
			continue;

		}

		for ( var j = 0; j < m.elements.length; j++ ) {

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

		helper.leftToRightVector3( vmd.cameras[ i ].position );
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

	}

};

/*
 * extends existing KeyframeTrack for bone and camera animation.
 *   - use Float64Array for times
 *   - use Cubic Bezier curves interpolation
 */
THREE.MMDLoader.VectorKeyframeTrackEx = function ( name, times, values, interpolationParameterArray ) {

	this.interpolationParameters = new Float32Array( interpolationParameterArray );

	THREE.VectorKeyframeTrack.call( this, name, times, values );

};

THREE.MMDLoader.VectorKeyframeTrackEx.prototype = Object.create( THREE.VectorKeyframeTrack.prototype );
THREE.MMDLoader.VectorKeyframeTrackEx.prototype.constructor = THREE.MMDLoader.VectorKeyframeTrackEx;
THREE.MMDLoader.VectorKeyframeTrackEx.prototype.TimeBufferType = Float64Array;

THREE.MMDLoader.VectorKeyframeTrackEx.prototype.InterpolantFactoryMethodCubicBezier = function( result ) {

	return new THREE.MMDLoader.CubicBezierInterpolation( this.times, this.values, this.getValueSize(), result, this.interpolationParameters );

};

THREE.MMDLoader.VectorKeyframeTrackEx.prototype.setInterpolation = function( interpolation ) {

	this.createInterpolant = this.InterpolantFactoryMethodCubicBezier;

};

THREE.MMDLoader.QuaternionKeyframeTrackEx = function ( name, times, values, interpolationParameterArray ) {

	this.interpolationParameters = new Float32Array( interpolationParameterArray );

	THREE.QuaternionKeyframeTrack.call( this, name, times, values );

};

THREE.MMDLoader.QuaternionKeyframeTrackEx.prototype = Object.create( THREE.QuaternionKeyframeTrack.prototype );
THREE.MMDLoader.QuaternionKeyframeTrackEx.prototype.constructor = THREE.MMDLoader.QuaternionKeyframeTrackEx;
THREE.MMDLoader.QuaternionKeyframeTrackEx.prototype.TimeBufferType = Float64Array;

THREE.MMDLoader.QuaternionKeyframeTrackEx.prototype.InterpolantFactoryMethodCubicBezier = function( result ) {

	return new THREE.MMDLoader.CubicBezierInterpolation( this.times, this.values, this.getValueSize(), result, this.interpolationParameters );

};

THREE.MMDLoader.QuaternionKeyframeTrackEx.prototype.setInterpolation = function( interpolation ) {

	this.createInterpolant = this.InterpolantFactoryMethodCubicBezier;

};

THREE.MMDLoader.NumberKeyframeTrackEx = function ( name, times, values, interpolationParameterArray ) {

	this.interpolationParameters = new Float32Array( interpolationParameterArray );

	THREE.NumberKeyframeTrack.call( this, name, times, values );

};

THREE.MMDLoader.NumberKeyframeTrackEx.prototype = Object.create( THREE.NumberKeyframeTrack.prototype );
THREE.MMDLoader.NumberKeyframeTrackEx.prototype.constructor = THREE.MMDLoader.NumberKeyframeTrackEx;
THREE.MMDLoader.NumberKeyframeTrackEx.prototype.TimeBufferType = Float64Array;

THREE.MMDLoader.NumberKeyframeTrackEx.prototype.InterpolantFactoryMethodCubicBezier = function( result ) {

	return new THREE.MMDLoader.CubicBezierInterpolation( this.times, this.values, this.getValueSize(), result, this.interpolationParameters );

};

THREE.MMDLoader.NumberKeyframeTrackEx.prototype.setInterpolation = function( interpolation ) {

	this.createInterpolant = this.InterpolantFactoryMethodCubicBezier;

};

THREE.MMDLoader.CubicBezierInterpolation = function ( parameterPositions, sampleValues, sampleSize, resultBuffer, params ) {

	THREE.Interpolant.call( this, parameterPositions, sampleValues, sampleSize, resultBuffer );

	this.params = params;

}

THREE.MMDLoader.CubicBezierInterpolation.prototype = Object.create( THREE.LinearInterpolant.prototype );
THREE.MMDLoader.CubicBezierInterpolation.prototype.constructor = THREE.MMDLoader.CubicBezierInterpolation;

THREE.MMDLoader.CubicBezierInterpolation.prototype.interpolate_ = function( i1, t0, t, t1 ) {

	var result = this.resultBuffer;
	var values = this.sampleValues;
	var stride = this.valueSize;

	var offset1 = i1 * stride;
	var offset0 = offset1 - stride;

	var weight1 = ( t - t0 ) / ( t1 - t0 );

	if ( stride === 4 ) {  // Quaternion

		var x1 = this.params[ i1 * 4 + 0 ];
		var x2 = this.params[ i1 * 4 + 1 ];
		var y1 = this.params[ i1 * 4 + 2 ];
		var y2 = this.params[ i1 * 4 + 3 ];

		var ratio = this._calculate( x1, x2, y1, y2, weight1 );

		THREE.Quaternion.slerpFlat( result, 0, values, offset0, values, offset1, ratio );

	} else if ( stride === 3 ) {  // Vector3

		for ( var i = 0; i !== stride; ++ i ) {

			var x1 = this.params[ i1 * 12 + i * 4 + 0 ];
			var x2 = this.params[ i1 * 12 + i * 4 + 1 ];
			var y1 = this.params[ i1 * 12 + i * 4 + 2 ];
			var y2 = this.params[ i1 * 12 + i * 4 + 3 ];

			var ratio = this._calculate( x1, x2, y1, y2, weight1 );

			result[ i ] = values[ offset0 + i ] * ( 1 - ratio ) + values[ offset1 + i ] * ratio;

		}

	} else {  // Number

		var x1 = this.params[ i1 * 4 + 0 ];
		var x2 = this.params[ i1 * 4 + 1 ];
		var y1 = this.params[ i1 * 4 + 2 ];
		var y2 = this.params[ i1 * 4 + 3 ];

		var ratio = this._calculate( x1, x2, y1, y2, weight1 );

		result[ 0 ] = values[ offset0 ] * ( 1 - ratio ) + values[ offset1 ] * ratio;

	}

	return result;

};

THREE.MMDLoader.CubicBezierInterpolation.prototype._calculate = function( x1, x2, y1, y2, x ) {

	/*
	 * Cubic Bezier curves
	 *   https://en.wikipedia.org/wiki/B%C3%A9zier_curve#Cubic_B.C3.A9zier_curves
	 *
	 * B(t) = ( 1 - t ) ^ 3 * P0
	 *      + 3 * ( 1 - t ) ^ 2 * t * P1
	 *      + 3 * ( 1 - t ) * t^2 * P2
	 *      + t ^ 3 * P3
	 *      ( 0 <= t <= 1 )
	 *
	 * MMD uses Cubic Bezier curves for bone and camera animation interpolation.
	 *   http://d.hatena.ne.jp/edvakf/20111016/1318716097
	 *
	 *    x = ( 1 - t ) ^ 3 * x0
	 *      + 3 * ( 1 - t ) ^ 2 * t * x1
	 *      + 3 * ( 1 - t ) * t^2 * x2
	 *      + t ^ 3 * x3
	 *    y = ( 1 - t ) ^ 3 * y0
	 *      + 3 * ( 1 - t ) ^ 2 * t * y1
	 *      + 3 * ( 1 - t ) * t^2 * y2
	 *      + t ^ 3 * y3
	 *      ( x0 = 0, y0 = 0 )
	 *      ( x3 = 1, y3 = 1 )
	 *      ( 0 <= t, x1, x2, y1, y2 <= 1 )
	 *
	 * Here solves this equation with Bisection method,
	 *   https://en.wikipedia.org/wiki/Bisection_method
	 * gets t, and then calculate y.
	 *
	 * f(t) = 3 * ( 1 - t ) ^ 2 * t * x1
	 *      + 3 * ( 1 - t ) * t^2 * x2
	 *      + t ^ 3 - x = 0
	 *
	 * (Another option: Newton's method
	 *    https://en.wikipedia.org/wiki/Newton%27s_method)
	 */

	var c = 0.5;
	var t = c;
	var s = 1.0 - t;
	var loop = 15;
	var eps = 1e-5;
	var math = Math;

	var sst3, stt3, ttt;

	for ( var i = 0; i < loop; i ++ ) {

		sst3 = 3.0 * s * s * t;
		stt3 = 3.0 * s * t * t;
		ttt = t * t * t;

		var ft = ( sst3 * x1 ) + ( stt3 * x2 ) + ( ttt ) - x;

		if ( math.abs( ft ) < eps ) break;

		c /= 2.0;

		t += ( ft < 0 ) ? c : -c;
		s = 1.0 - t;

	}

	return ( sst3 * y1 ) + ( stt3 * y2 ) + ttt;

};

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

	getIndex: function ( type, isUnsigned ) {

		switch ( type ) {

			case 1:
				return ( isUnsigned === true ) ? this.getUint8() : this.getInt8();

			case 2:
				return ( isUnsigned === true ) ? this.getUint16() : this.getInt16();

			case 4:
				return this.getInt32(); // No Uint32

			default:
				throw 'unknown number type ' + type + ' exception.';

		}

	},

	getIndexArray: function ( type, size, isUnsigned ) {

		var a = [];

		for ( var i = 0; i < size; i++ ) {

			a.push( this.getIndex( type, isUnsigned ) );

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
 * Shaders are copied from MeshPhongMaterial and then MMD spcific codes are inserted.
 * Keep shaders updated on MeshPhongMaterial.
 */
THREE.ShaderLib[ 'mmd' ] = {

	uniforms: THREE.UniformsUtils.merge( [

		THREE.ShaderLib[ 'phong' ].uniforms,

		// MMD specific for toon mapping
		{
			"celShading"      : { type: "i", value: 0 },
			"toonMap"         : { type: "t", value: null },
			"hasToonTexture"  : { type: "i", value: 0 }
		}

	] ),

	vertexShader: THREE.ShaderLib[ 'phong' ].vertexShader,

	// put toon mapping logic right before "void main() {...}"
	fragmentShader: THREE.ShaderLib[ 'phong' ].fragmentShader.replace( /void\s+main\s*\(\s*\)/, [

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

		"void main()",

	].join( "\n" ) )

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

					}

				}

			}

		};

	}()

};

THREE.MMDHelper = function ( renderer ) {

	this.renderer = renderer;

	this.outlineEffect = null;

	this.effect = null;

	this.autoClear = true;

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

		this.outlineEffect = new THREE.OutlineEffect( this.renderer );

		var size = this.renderer.getSize();
		this.setSize( size.width, size.height );

	},

	add: function ( mesh ) {

		if ( ! ( mesh instanceof THREE.SkinnedMesh ) ) {

			throw new Error( 'THREE.MMDHelper.add() accepts only THREE.SkinnedMesh instance.' );

		}

		if ( mesh.mixer === undefined ) mesh.mixer = null;
		if ( mesh.ikSolver === undefined ) mesh.ikSolver = null;
		if ( mesh.grantSolver === undefined ) mesh.grantSolver = null;
		if ( mesh.physics === undefined ) mesh.physics = null;
		if ( mesh.looped === undefined ) mesh.looped = false;

		this.meshes.push( mesh );

		// workaround until I make IK and Physics Animation plugin
		this.initBackupBones( mesh );

	},

	setSize: function ( width, height ) {

		this.outlineEffect.setSize( width, height );

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

		if ( params === undefined ) params = {};

		var warmup = params.warmup !== undefined ? params.warmup : 60;

		var physics = new THREE.MMDPhysics( mesh, params );

		if ( mesh.mixer !== null && mesh.mixer !== undefined && this.doAnimation === true && params.preventAnimationWarmup !== false ) {

			this.animateOneMesh( 0, mesh );
			physics.reset();

		}

		physics.warmup( warmup );

		this.updateIKParametersDependingOnPhysicsEnabled( mesh, true );

		mesh.physics = physics;

	},

	enablePhysics: function ( enabled ) {

		if ( enabled === true ) {

			this.doPhysics = true;

		} else {

			this.doPhysics = false;

		}

		for ( var i = 0, il = this.meshes.length; i < il; i ++ ) {

			this.updateIKParametersDependingOnPhysicsEnabled( this.meshes[ i ], enabled );

		}

	},

	updateIKParametersDependingOnPhysicsEnabled: function ( mesh, physicsEnabled ) {

		var iks = mesh.geometry.iks;
		var bones = mesh.geometry.bones;

		for ( var j = 0, jl = iks.length; j < jl; j ++ ) {

			var ik = iks[ j ];
			var links = ik.links;

			for ( var k = 0, kl = links.length; k < kl; k ++ ) {

				var link = links[ k ];

				if ( physicsEnabled === true ) {

					// disable IK of the bone the corresponding rigidBody type of which is 1 or 2
					// because its rotation will be overriden by physics
					link.enabled = bones[ link.index ].rigidBodyType > 0 ? false : true;

				} else {

					link.enabled = true;

				}

			}

		}

	},

	setAnimations: function () {

		for ( var i = 0; i < this.meshes.length; i++ ) {

			this.setAnimation( this.meshes[ i ] );

		}

	},

	setAnimation: function ( mesh ) {

		if ( mesh.geometry.animations !== undefined ) {

			mesh.mixer = new THREE.AnimationMixer( mesh );

			// TODO: find a workaround not to access (seems like) private properties
			//       the name of them begins with "_".
			mesh.mixer.addEventListener( 'loop', function ( e ) {

				if ( e.action._clip.tracks[ 0 ].name.indexOf( '.bones' ) !== 0 ) return;

				var mesh = e.target._root;
				mesh.looped = true;

			} );

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
	 * detect the longest duration among model, camera, and audio animations and then
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

			// restore/backupBones are workaround
			// until I make IK, Grant, and Physics Animation plugin
			this.restoreBones( mesh );

			mixer.update( delta );

			this.backupBones( mesh );

		}

		if ( ikSolver !== null && this.doIk === true ) {

			ikSolver.update();

		}

		if ( grantSolver !== null && this.doGrant === true ) {

			grantSolver.update();

		}

		if ( mesh.looped === true ) {

			if ( physics !== null ) physics.reset();

			mesh.looped = false;

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

			this.camera.up.set( 0, 1, 0 );
			this.camera.up.applyQuaternion( this.camera.quaternion );
			this.camera.lookAt( this.camera.center );

		}

	},

	render: function ( scene, camera ) {

		if ( this.effect === null ) {

			if ( this.doOutlineDrawing ) {

				this.outlineEffect.autoClear = this.autoClear;
				this.outlineEffect.render( scene, camera );

			} else {

				var currentAutoClear = this.renderer.autoClear;
				this.renderer.autoClear = this.autoClear;
				this.renderer.render( scene, camera );
				this.renderer.autoClear = currentAutoClear;

			}

		} else {

			var currentAutoClear = this.renderer.autoClear;
			this.renderer.autoClear = this.autoClear;

			if ( this.doOutlineDrawing ) {

				this.renderWithEffectAndOutline( scene, camera );

			} else {

				this.effect.render( scene, camera );

			}

			this.renderer.autoClear = currentAutoClear;

		}

	},

	/*
	 * Currently(r82 dev) there's no way to render with two Effects
	 * then attempt to get them to coordinately run by myself.
	 *
	 * What this method does
	 * 1. let OutlineEffect make outline materials (only once)
	 * 2. render normally with effect
	 * 3. set outline materials
	 * 4. render outline with effect
	 * 5. restore original materials
	 */
	renderWithEffectAndOutline: function ( scene, camera ) {

		var hasOutlineMaterial = false;

		function checkIfObjectHasOutlineMaterial ( object ) {

			if ( object.material === undefined ) return;

			if ( object.userData.outlineMaterial !== undefined ) hasOutlineMaterial = true;

		}

		function setOutlineMaterial ( object ) {

			if ( object.material === undefined ) return;

			if ( object.userData.outlineMaterial === undefined ) return;

			object.userData.originalMaterial = object.material;

			object.material = object.userData.outlineMaterial;

		}

		function restoreOriginalMaterial ( object ) {

			if ( object.material === undefined ) return;

			if ( object.userData.originalMaterial === undefined ) return;

			object.material = object.userData.originalMaterial;

		}

		return function renderWithEffectAndOutline( scene, camera ) {

			hasOutlineMaterial = false;

			var forceClear = false;

			scene.traverse( checkIfObjectHasOutlineMaterial );

			if ( ! hasOutlineMaterial ) {

				this.outlineEffect.render( scene, camera );

				forceClear = true;

				scene.traverse( checkIfObjectHasOutlineMaterial );

			}

			if ( hasOutlineMaterial ) {

				this.renderer.autoClear = this.autoClear || forceClear;

				this.effect.render( scene, camera );

				scene.traverse( setOutlineMaterial );

				var currentShadowMapEnabled = this.renderer.shadowMap.enabled;

				this.renderer.autoClear = false;
				this.renderer.shadowMap.enabled = false;

				this.effect.render( scene, camera );

				this.renderer.shadowMap.enabled = currentShadowMapEnabled;

				scene.traverse( restoreOriginalMaterial );

			} else {

				this.outlineEffect.autoClear = this.autoClear || forceClear;
				this.outlineEffect.render( scene, camera );

			}

		}

	}(),

	poseAsVpd: function ( mesh, vpd, params ) {

		if ( ! ( params && params.preventResetPose === true ) ) {

			mesh.pose();

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
