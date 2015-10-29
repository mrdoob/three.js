/**
 * @author takahiro / https://github.com/takahirox
 *
 * Dependencies
 *  charset-encoder-js https://github.com/takahirox/charset-encoder-js
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
 * Model data requirements
 *  convert .tga files to .png files if exist. (Should I use THREE.TGALoader?)
 *  resize the texture image files to power_of_2*power_of_2
 *
 *
 * TODO
 *  separate model/vmd loaders.
 *  multi vmd files support.
 *  edge(outline) support.
 *  culling support.
 *  toon(cel) shadering support.
 *  add-sphere-mapping support.
 *  physics support.
 *  camera motion in vmd support.
 *  light motion in vmd support.
 *  music support.
 *  make own shader for the performance and functionarity.
 *  SDEF support.
 *  uv/material/bone morphing support.
 *  tga file loading support.
 *  supply skinning support.
 *  shadow support.
 */

THREE.MMDLoader = function ( showStatus, manager ) {

	THREE.Loader.call( this, showStatus );
	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.MMDLoader.prototype = Object.create( THREE.Loader.prototype );
THREE.MMDLoader.prototype.constructor = THREE.MMDLoader;

THREE.MMDLoader.prototype.extractExtension = function ( url ) {

	var index = url.lastIndexOf( '.' );

	if ( index < 0 ) {

		return null;

	}

	return url.slice( index + 1 );

};

THREE.MMDLoader.prototype.load = function ( modelUrl, vmdUrl, callback, onProgress, onError ) {

	var texturePath = this.extractUrlBase( modelUrl );
	var modelExtension = this.extractExtension( modelUrl );
	this.loadModelFile( modelUrl, vmdUrl, texturePath, modelExtension, callback, onProgress, onError );

};

THREE.MMDLoader.prototype.loadFileAsBuffer = function ( url, onLoad, onProgress, onError ) {

	var loader = new THREE.XHRLoader( this.manager );
	loader.setCrossOrigin( this.crossOrigin );
	loader.setResponseType( 'arraybuffer' );
	loader.load( url, function ( buffer ) {

		onLoad( buffer );

	}, onProgress, onError );

};

THREE.MMDLoader.prototype.loadModelFile = function ( modelUrl, vmdUrl, texturePath, modelExtension, callback, onProgress, onError ) {

	var scope = this;

	this.loadFileAsBuffer( modelUrl, function ( buffer ) {

		scope.loadVmdFile( buffer, vmdUrl, texturePath, modelExtension, callback, onProgress, onError );

	}, onProgress, onError );

};

THREE.MMDLoader.prototype.loadVmdFile = function ( modelBuffer, vmdUrl, texturePath, modelExtension, callback, onProgress, onError ) {

	var scope = this;

	if ( ! vmdUrl ) {

		scope.parse( modelBuffer, null, texturePath, modelExtension, callback );
		return;

	}

	this.loadFileAsBuffer( vmdUrl, function ( buffer ) {

		scope.parse( modelBuffer, buffer, texturePath, modelExtension, callback );

	}, onProgress, onError );

};

THREE.MMDLoader.prototype.parse = function ( modelBuffer, vmdBuffer, texturePath, modelExtension, callback ) {

	var model = this.parseModel( modelBuffer, modelExtension );
	var vmd = vmdBuffer !== null ? this.parseVmd( vmdBuffer ) : null;
	var mesh = this.createMesh( model, vmd, texturePath );
	callback( mesh );

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

	pmd.metadata = {};
	pmd.metadata.format = 'pmd';

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
			p.shiness = dv.getFloat32();
			p.specular = dv.getFloat32Array( 3 );
			p.emissive = dv.getFloat32Array( 3 );
			p.toonIndex = dv.getUint8();
			p.edgeFlag = dv.getUint8();
			p.faceCount = dv.getUint32() / 3;
			p.fileName = dv.getChars( 20 );
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
			p.name = dv.toCharcodeStrings( p.originalName );
			p.parentIndex = dv.getUint16();
			p.tailIndex = dv.getUint16();
			p.type = dv.getUint8();
			p.ikIndex = dv.getUint16();
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

	parseHeader();
	parseVertices();
	parseFaces();
	parseMaterials();
	parseBones();
	parseIks();
	parseMorphs();

	return pmd;

};

THREE.MMDLoader.prototype.parsePmx = function ( buffer ) {

	var scope = this;
	var pmx = {};
	var dv = new THREE.MMDLoader.DataView( buffer );

	pmx.metadata = {};
	pmx.metadata.format = 'pmx';

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
		metadata.rigidbodyIndexSize = dv.getUint8();
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

			var indexSize = metadata.vertexIndexSize;

			if ( p.type === 0 ) {  // BDEF1

				p.skinIndices = dv.getNumberArray( indexSize, 1 );
				p.skinWeights = [ 1.0 ];

			} else if ( p.type === 1 ) {  // BDEF2

				p.skinIndices = dv.getNumberArray( indexSize, 2 );
				p.skinWeights = dv.getFloat32Array( 1 );
				p.skinWeights.push( 1.0 - p.skinWeights[ 0 ] );

			} else if ( p.type === 2 ) {  // BDEF4

				p.skinIndices = dv.getNumberArray( indexSize, 4 );
				p.skinWeights = dv.getFloat32Array( 4 );

			} else if ( p.type === 3 ) {  // SDEF

				p.skinIndices = dv.getNumberArray( indexSize, 2 );
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
			p.indices = dv.getNumberArray( metadata.vertexIndexSize, 3 );
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
			p.shiness = dv.getFloat32();
			p.emissive = dv.getFloat32Array( 3 );
			p.flag = dv.getUint8();
			p.edgeColor = dv.getFloat32Array( 4 );
			p.edgeSize = dv.getFloat32();
			p.textureIndex = dv.getNumber( pmx.metadata.textureIndexSize );
			p.envTextureIndex = dv.getNumber( pmx.metadata.textureIndexSize );
			p.envFlag = dv.getUint8();
			p.toonFlag = dv.getUint8();

			if ( p.toonFlag === 0 ) {

				p.toonTextureIndex = dv.getNumber( pmx.metadata.textureIndexSize );

			} else if ( p.toonFlag === 1 ) {

				p.toonTextureIndex = dv.getUint8();

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
			p.name = dv.toCharcodeStrings( p.originalName );
			p.englishName = dv.getTextBuffer();
			p.position = dv.getFloat32Array( 3 );
			p.parentIndex = dv.getNumber( pmx.metadata.boneIndexSize );
			p.transformationClass = dv.getUint32();
			p.flag = dv.getUint16();

			if ( p.flag & 0x1 ) {

				p.connectIndex = dv.getNumber( pmx.metadata.boneIndexSize );

			} else {

				p.offsetPosition = dv.getFloat32Array( 3 );

			}

			if ( p.flag & 0x100 || p.flag & 0x200 ) {

				p.supplyParentIndex = dv.getNumber( pmx.metadata.boneIndexSize );
				p.supplyRatio = dv.getFloat32();

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

				ik.effector = dv.getNumber( pmx.metadata.boneIndexSize );
				ik.target = null;
				ik.iteration = dv.getUint32();
				ik.maxAngle = dv.getFloat32();
				ik.linkCount = dv.getUint32();
				ik.links = [];

				for ( var i = 0; i < ik.linkCount; i++ ) {

					var link = {};
					link.index = dv.getNumber( pmx.metadata.boneIndexSize );
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
					m.index = dv.getNumber( pmx.metadata.morphIndexSize );
					m.ratio = dv.getFloat32();
					p.elements.push( m );

				} else if ( p.type === 1 ) {  // vertex morph

					var m = {};
					m.index = dv.getNumber( pmx.metadata.vertexIndexSize );
					m.position = dv.getFloat32Array( 3 );
					p.elements.push( m );

				} else if ( p.type === 2 ) {  // bone morph

					var m = {};
					m.index = dv.getNumber( pmx.metadata.boneIndexSize );
					m.position = dv.getFloat32Array( 3 );
					m.rotation = dv.getFloat32Array( 4 );
					p.elements.push( m );

				} else if ( p.type === 3 ) {  // uv morph

					var m = {};
					m.index = dv.getNumber( pmx.metadata.vertexIndexSize );
					m.uv = dv.getFloat32Array( 4 );
					p.elements.push( m );

				} else if ( p.type === 8 ) {  // material morph

					var m = {};
					m.index = dv.getNumber( pmx.metadata.materialIndexSize );
					m.type = dv.getUint8();
					m.diffuse = dv.getFloat32Array( 4 );
					m.specular = dv.getFloat32Array( 3 );
					m.shiness = dv.getFloat32();
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

	parseHeader();
	parseVertices();
	parseFaces();
	parseTextures();
	parseMaterials();
	parseBones();
	parseMorphs();

	// console.log( pmx ); // for console debug

	return pmx;

};

THREE.MMDLoader.prototype.parseVmd = function ( buffer ) {

	var scope = this;
	var vmd = {};
	var dv = new THREE.MMDLoader.DataView( buffer );

	vmd.metadata = {};

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
			p.boneName = dv.toCharcodeStrings( p.originalBoneName );
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

	parseHeader();
	parseMotions();
	parseMorphs();

	return vmd;

};

// maybe better to create json and then use JSONLoader...
THREE.MMDLoader.prototype.createMesh = function ( model, vmd, texturePath, onProgress, onError ) {

	var scope = this;
	var geometry = new THREE.Geometry();
        var material = new THREE.MeshFaceMaterial();

	var leftToRight = function() {

		var convertVector = function ( v ) {

			v[ 2 ] = -v[ 2 ];

		};

		var convertQuaternion = function ( q ) {

			q[ 0 ] = -q[ 0 ];
			q[ 1 ] = -q[ 1 ];

		};

		var convertIndexOrder = function ( p ) {

			var tmp = p[ 2 ];
			p[ 2 ] = p[ 0 ];
			p[ 0 ] = tmp;

		};

		for ( var i = 0; i < model.metadata.vertexCount; i++ ) {

			convertVector( model.vertices[ i ].position );
			convertVector( model.vertices[ i ].normal );

		}

		for ( var i = 0; i < model.metadata.faceCount; i++ ) {

			convertIndexOrder( model.faces[ i ].indices );

		}

		for ( var i = 0; i < model.metadata.boneCount; i++ ) {

			convertVector( model.bones[ i ].position );

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

				convertVector( m.elements[ j ].position );

			}

		}

		if ( vmd === null ) {

			return;

		}

		for ( var i = 0; i < vmd.metadata.motionCount; i++ ) {

			convertVector( vmd.motions[ i ].position );
			convertQuaternion( vmd.motions[ i ].rotation );

		}

	};

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

			if ( model.metadata.format === 'pmd' ) {

				bone.parent = ( b.parentIndex === 0xFFFF ) ? -1 : b.parentIndex;

			}

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

		var offset = 0;
		var materialParams = [];

		for ( var i = 1; i < model.metadata.materialCount; i++ ) {

			geometry.faceVertexUvs.push( [] );

		}

		for ( var i = 0; i < model.metadata.materialCount; i++ ) {

			var m = model.materials[ i ];
			var params = {};

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

			params.shading = 'phong';
			params.colorDiffuse = [ m.diffuse[ 0 ], m.diffuse[ 1 ], m.diffuse[ 2 ] ];
			params.opacity = m.diffuse[ 3 ];
			params.colorSpecular = [ m.specular[ 0 ], m.specular[ 1 ], m.specular[ 2 ] ];
			params.specularCoef = m.shiness;

			// temporal workaround
			// TODO: implement correctly
			params.doubleSided = true;

			if ( model.metadata.format === 'pmd' ) {

				if ( m.fileName ) {

					var fileName = m.fileName;
					var fileNames = [];

					// temporal workaround, disable sphere mapping so far
					// TODO: sphere mapping support
					var index = fileName.lastIndexOf( '*' );

					if ( index >= 0 ) {

						fileNames.push( fileName.slice( 0, index ) );
						fileNames.push( fileName.slice( index + 1 ) );

					} else {

						fileNames.push( fileName );

					}

					for ( var j = 0; j < fileNames.length; j++ ) {

						var n = fileNames[ j ];

						// TODO: support spa
						if ( /* n.indexOf( '.spa' ) >= 0 || */ n.indexOf( '.sph' ) >= 0 ) {

							params.mapEnv = n;

						} else {

							// temporal workaround, use .png instead of .tga
							// TODO: tga file support
							params.mapDiffuse = n.replace( '.tga', '.png' );

						}

					}

				}

			} else {

				if ( m.textureIndex !== -1 ) {

					var n = model.textures[ m.textureIndex ];
					// temporal workaround, use .png instead of .tga
					// TODO: tga file support
					params.mapDiffuse = n.replace( '.tga', '.png' );

				}

				// TODO: support m.envFlag === 0, 2, 3
				if ( m.envTextureIndex !== -1 && m.envFlag === 1 ) {

					var n = model.textures[ m.envTextureIndex ];
					params.mapEnv = n;

				}

			}

			if ( params.mapDiffuse === undefined ) {

				params.colorEmissive = [ m.emissive[ 0 ], m.emissive[ 1 ], m.emissive[ 2 ] ];

			}

			materialParams.push( params );

		}

		var materials = scope.initMaterials( materialParams, texturePath );

		for ( var i = 0; i < materials.length; i++ ) {

			var m = materials[ i ];
			var p = materialParams[ i ];

			if ( m.map ) {

				m.map.flipY = false;

			}

			// this should be in THREE.Loader.createMaterial.
			// remove this if it supports.
			// TODO: make patch of THREE.Loader.createMaterial?
			if ( p.mapEnv !== undefined ) {

				var fullPath = texturePath + p.mapEnv;
				var loader = THREE.Loader.Handlers.get( fullPath );

				if ( loader === null ) {

					loader = new THREE.TextureLoader( this.manager );

				}

				var texture = loader.load( fullPath );
				// currently only support multiply-sphere-mapping
				// TODO: support add-sphere-mapping
				texture.mapping = THREE.SphericalReflectionMapping;
				m.envMap = texture;

			}

			m.skinning = true;
			m.morphTargets = true;
			material.materials.push( m );

		}

	};

	var initMotionAnimations = function () {

		var orderedMotions = [];
		var boneTable = {};

		for ( var i = 0; i < model.metadata.boneCount; i++ ) {

			var b = model.bones[ i ];
			boneTable[ b.name ] = i;
			orderedMotions[ i ] = [];

		}

		for ( var i = 0; i < vmd.motions.length; i++ ) {

			var m = vmd.motions[ i ];
			var num = boneTable[ m.boneName ];

			if ( num === undefined )
				continue;

			orderedMotions[ num ].push( m );

		}

		for ( var i = 0; i < orderedMotions.length; i++ ) {

			orderedMotions[ i ].sort( function ( a, b ) {

				return a.frameNum - b.frameNum;

			} ) ;

		}

		var animation = {
			name: 'Action',
			fps: 30,
			length: 0.0,
			hierarchy: []
		};

		for ( var i = 0; i < geometry.bones.length; i++ ) {

			animation.hierarchy.push(
				{
					parent: geometry.bones[ i ].parent,
					keys: []
				}
			);

		}

		var maxTime = 0.0;

		for ( var i = 0; i < orderedMotions.length; i++ ) {

			var array = orderedMotions[ i ];

			for ( var j = 0; j < array.length; j++ ) {

				var t = array[ j ].frameNum / 30;
				var p = array[ j ].position;
				var r = array[ j ].rotation;

				animation.hierarchy[ i ].keys.push(
					{
						time: t,
						pos: [ geometry.bones[ i ].pos[ 0 ] + p[ 0 ],
						       geometry.bones[ i ].pos[ 1 ] + p[ 1 ],
						       geometry.bones[ i ].pos[ 2 ] + p[ 2 ] ],
						rot: [ r[ 0 ], r[ 1 ], r[ 2 ], r[ 3 ] ],
						scl: [ 1, 1, 1 ]
					}
				);

				if ( t > maxTime )
					maxTime = t;

			}

		}

		// add 2 secs as afterglow
		maxTime += 2.0;
		animation.length = maxTime;

		for ( var i = 0; i < orderedMotions.length; i++ ) {

			var keys = animation.hierarchy[ i ].keys;

			if ( keys.length === 0 ) {

				keys.push( { time: 0.0,
				             pos: [ geometry.bones[ i ].pos[ 0 ],
				                    geometry.bones[ i ].pos[ 1 ],
				                    geometry.bones[ i ].pos[ 2 ] ],
				             rot: [ 0, 0, 0, 1 ],
				             scl: [ 1, 1, 1 ]
				           } );

			}

			var k = keys[ 0 ];

			if ( k.time !== 0.0 ) {

				keys.unshift( { time: 0.0,
				                 pos: [ k.pos[ 0 ], k.pos[ 1 ], k.pos[ 2 ] ],
				                 rot: [ k.rot[ 0 ], k.rot[ 1 ], k.rot[ 2 ], k.rot[ 3 ] ],
				                 scl: [ 1, 1, 1 ]
				              } );

			}

			k = keys[ keys.length - 1 ];

			if ( k.time < maxTime ) {

				keys.push( { time: maxTime,
				             pos: [ k.pos[ 0 ], k.pos[ 1 ], k.pos[ 2 ] ],
				             rot: [ k.rot[ 0 ], k.rot[ 1 ], k.rot[ 2 ], k.rot[ 3 ] ],
				             scl: [ 1, 1, 1 ]
			        	   } );

			}

		}

//		geometry.animation = animation;
		geometry.animations = [];
		geometry.animations.push( THREE.AnimationClip.parseAnimation( animation, geometry.bones ) );


	};

	var initMorphAnimations = function () {

		var orderedMorphs = [];
		var morphTable = {}

		for ( var i = 0; i < model.metadata.morphCount; i++ ) {

			var m = model.morphs[ i ];
			morphTable[ m.name ] = i;
			orderedMorphs[ i ] = [];

		}

		for ( var i = 0; i < vmd.morphs.length; i++ ) {

			var m = vmd.morphs[ i ];
			var num = morphTable[ m.morphName ];

			if ( num === undefined )
				continue;

			orderedMorphs[ num ].push( m );

		}

		for ( var i = 0; i < orderedMorphs.length; i++ ) {

			orderedMorphs[ i ].sort( function ( a, b ) {

				return a.frameNum - b.frameNum;

			} ) ;

		}

		var morphAnimation = {
			fps: 30,
			length: 0.0,
			hierarchy: []
		};

		for ( var i = 0; i < model.metadata.morphCount; i++ ) {

			morphAnimation.hierarchy.push( { keys: [] } );

		}

		var maxTime = 0.0;

		for ( var i = 0; i < orderedMorphs.length; i++ ) {

			var array = orderedMorphs[ i ];

			for ( var j = 0; j < array.length; j++ ) {

				var t = array[ j ].frameNum / 30;
				var w = array[ j ].weight;

				morphAnimation.hierarchy[ i ].keys.push( { time: t, value: w } );

				if ( t > maxTime ) {

					maxTime = t;

				}

			}

		}

		// add 2 secs as afterglow
		maxTime += 2.0;

		// use animation's length if exists. animation is master.
		maxTime = ( geometry.animation !== undefined &&
		            geometry.animation.length > 0.0 )
		            	? geometry.animation.length : maxTime;
		morphAnimation.length = maxTime;

		for ( var i = 0; i < orderedMorphs.length; i++ ) {

			var keys = morphAnimation.hierarchy[ i ].keys;

			if ( keys.length === 0 ) {

				keys.push( { time: 0.0, value: 0.0 } );

			}

			var k = keys[ 0 ];

			if ( k.time !== 0.0 ) {

				keys.unshift( { time: 0.0, value: k.value } );

			}

			k = keys[ keys.length - 1 ];

			if ( k.time < maxTime ) {

				keys.push( { time: maxTime, value: k.value } );

			}

		}

//		geometry.morphAnimation = morphAnimation;

		var tracks = [];

		for ( var i = 1; i < orderedMorphs.length; i++ ) {

			var h = morphAnimation.hierarchy[ i ];
			tracks.push( new THREE.NumberKeyframeTrack( '.morphTargetInfluences[' + i + ']', h.keys ) );

		}

		geometry.morphAnimations = [];
		geometry.morphAnimations.push( new THREE.AnimationClip( 'morphAnimation', -1, tracks ) );

	};

	leftToRight();
	initVartices();
	initFaces();
	initBones();
	initIKs();
	initMorphs();
	initMaterials();

	if ( vmd !== null ) {

		initMotionAnimations();
		initMorphAnimations();

	}

	geometry.computeFaceNormals();
	geometry.verticesNeedUpdate = true;
	geometry.normalsNeedUpdate = true;
	geometry.uvsNeedUpdate = true;
	geometry.mmdFormat = model.metadata.format;

	var mesh = new THREE.SkinnedMesh( geometry, material );

	// console.log( mesh ); // for console debug

	return mesh;

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

	getNumber: function ( type ) {

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

	getNumberArray: function ( type, size ) {

		var a = [];

		for ( var i = 0; i < size; i++ ) {

			a.push( this.getNumber( type ) );

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

