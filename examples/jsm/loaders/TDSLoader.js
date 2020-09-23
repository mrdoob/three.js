import {
	AdditiveBlending,
	BufferGeometry,
	Color,
	DoubleSide,
	FileLoader,
	Float32BufferAttribute,
	Group,
	Loader,
	LoaderUtils,
	Matrix4,
	Mesh,
	MeshPhongMaterial,
	TextureLoader
} from "../../../build/three.module.js";
/**
 * Autodesk 3DS three.js file loader, based on lib3ds.
 *
 * Loads geometry with uv and materials basic properties with texture support.
 *
 * @class TDSLoader
 * @constructor
 */

var TDSLoader = function ( manager ) {

	Loader.call( this, manager );

	this.debug = false;

	this.group = null;
	this.position = 0;

	this.materials = [];
	this.meshes = [];

};

TDSLoader.prototype = Object.assign( Object.create( Loader.prototype ), {

	constructor: TDSLoader,

	/**
	 * Load 3ds file from url.
	 *
	 * @method load
	 * @param {[type]} url URL for the file.
	 * @param {Function} onLoad onLoad callback, receives group Object3D as argument.
	 * @param {Function} onProgress onProgress callback.
	 * @param {Function} onError onError callback.
	 */
	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var path = ( scope.path === '' ) ? LoaderUtils.extractUrlBase( url ) : scope.path;

		var loader = new FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( this.requestHeader );

		loader.load( url, function ( data ) {

			try {

				onLoad( scope.parse( data, path ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	},

	/**
	 * Parse arraybuffer data and load 3ds file.
	 *
	 * @method parse
	 * @param {ArrayBuffer} arraybuffer Arraybuffer data to be loaded.
	 * @param {String} path Path for external resources.
	 * @return {Group} Group loaded from 3ds file.
	 */
	parse: function ( arraybuffer, path ) {

		this.group = new Group();
		this.position = 0;
		this.materials = [];
		this.meshes = [];

		this.readFile( arraybuffer, path );

		for ( var i = 0; i < this.meshes.length; i ++ ) {

			this.group.add( this.meshes[ i ] );

		}

		return this.group;

	},

	/**
	 * Decode file content to read 3ds data.
	 *
	 * @method readFile
	 * @param {ArrayBuffer} arraybuffer Arraybuffer data to be loaded.
	 * @param {String} path Path for external resources.
	 */
	readFile: function ( arraybuffer, path ) {

		var data = new DataView( arraybuffer );
		var chunk = this.readChunk( data );

		if ( chunk.id === MLIBMAGIC || chunk.id === CMAGIC || chunk.id === M3DMAGIC ) {

			var next = this.nextChunk( data, chunk );

			while ( next !== 0 ) {

				if ( next === M3D_VERSION ) {

					var version = this.readDWord( data );
					this.debugMessage( '3DS file version: ' + version );

				} else if ( next === MDATA ) {

					this.resetPosition( data );
					this.readMeshData( data, path );

				} else {

					this.debugMessage( 'Unknown main chunk: ' + next.toString( 16 ) );

				}

				next = this.nextChunk( data, chunk );

			}

		}

		this.debugMessage( 'Parsed ' + this.meshes.length + ' meshes' );

	},

	/**
	 * Read mesh data chunk.
	 *
	 * @method readMeshData
	 * @param {Dataview} data Dataview in use.
	 * @param {String} path Path for external resources.
	 */
	readMeshData: function ( data, path ) {

		var chunk = this.readChunk( data );
		var next = this.nextChunk( data, chunk );

		while ( next !== 0 ) {

			if ( next === MESH_VERSION ) {

				var version = + this.readDWord( data );
				this.debugMessage( 'Mesh Version: ' + version );

			} else if ( next === MASTER_SCALE ) {

				var scale = this.readFloat( data );
				this.debugMessage( 'Master scale: ' + scale );
				this.group.scale.set( scale, scale, scale );

			} else if ( next === NAMED_OBJECT ) {

				this.debugMessage( 'Named Object' );
				this.resetPosition( data );
				this.readNamedObject( data );

			} else if ( next === MAT_ENTRY ) {

				this.debugMessage( 'Material' );
				this.resetPosition( data );
				this.readMaterialEntry( data, path );

			} else {

				this.debugMessage( 'Unknown MDATA chunk: ' + next.toString( 16 ) );

			}

			next = this.nextChunk( data, chunk );

		}

	},

	/**
	 * Read named object chunk.
	 *
	 * @method readNamedObject
	 * @param {Dataview} data Dataview in use.
	 */
	readNamedObject: function ( data ) {

		var chunk = this.readChunk( data );
		var name = this.readString( data, 64 );
		chunk.cur = this.position;

		var next = this.nextChunk( data, chunk );
		while ( next !== 0 ) {

			if ( next === N_TRI_OBJECT ) {

				this.resetPosition( data );
				var mesh = this.readMesh( data );
				mesh.name = name;
				this.meshes.push( mesh );

			} else {

				this.debugMessage( 'Unknown named object chunk: ' + next.toString( 16 ) );

			}

			next = this.nextChunk( data, chunk );

		}

		this.endChunk( chunk );

	},

	/**
	 * Read material data chunk and add it to the material list.
	 *
	 * @method readMaterialEntry
	 * @param {Dataview} data Dataview in use.
	 * @param {String} path Path for external resources.
	 */
	readMaterialEntry: function ( data, path ) {

		var chunk = this.readChunk( data );
		var next = this.nextChunk( data, chunk );
		var material = new MeshPhongMaterial();

		while ( next !== 0 ) {

			if ( next === MAT_NAME ) {

				material.name = this.readString( data, 64 );
				this.debugMessage( '   Name: ' + material.name );

			} else if ( next === MAT_WIRE ) {

				this.debugMessage( '   Wireframe' );
				material.wireframe = true;

			} else if ( next === MAT_WIRE_SIZE ) {

				var value = this.readByte( data );
				material.wireframeLinewidth = value;
				this.debugMessage( '   Wireframe Thickness: ' + value );

			} else if ( next === MAT_TWO_SIDE ) {

				material.side = DoubleSide;
				this.debugMessage( '   DoubleSided' );

			} else if ( next === MAT_ADDITIVE ) {

				this.debugMessage( '   Additive Blending' );
				material.blending = AdditiveBlending;

			} else if ( next === MAT_DIFFUSE ) {

				this.debugMessage( '   Diffuse Color' );
				material.color = this.readColor( data );

			} else if ( next === MAT_SPECULAR ) {

				this.debugMessage( '   Specular Color' );
				material.specular = this.readColor( data );

			} else if ( next === MAT_AMBIENT ) {

				this.debugMessage( '   Ambient color' );
				material.color = this.readColor( data );

			} else if ( next === MAT_SHININESS ) {

				var shininess = this.readWord( data );
				material.shininess = shininess;
				this.debugMessage( '   Shininess : ' + shininess );

			} else if ( next === MAT_TRANSPARENCY ) {

				var opacity = this.readWord( data );
				material.opacity = opacity * 0.01;
				this.debugMessage( '  Opacity : ' + opacity );
				material.transparent = opacity < 100 ? true : false;

			} else if ( next === MAT_TEXMAP ) {

				this.debugMessage( '   ColorMap' );
				this.resetPosition( data );
				material.map = this.readMap( data, path );

			} else if ( next === MAT_BUMPMAP ) {

				this.debugMessage( '   BumpMap' );
				this.resetPosition( data );
				material.bumpMap = this.readMap( data, path );

			} else if ( next === MAT_OPACMAP ) {

				this.debugMessage( '   OpacityMap' );
				this.resetPosition( data );
				material.alphaMap = this.readMap( data, path );

			} else if ( next === MAT_SPECMAP ) {

				this.debugMessage( '   SpecularMap' );
				this.resetPosition( data );
				material.specularMap = this.readMap( data, path );

			} else {

				this.debugMessage( '   Unknown material chunk: ' + next.toString( 16 ) );

			}

			next = this.nextChunk( data, chunk );

		}

		this.endChunk( chunk );

		this.materials[ material.name ] = material;

	},

	/**
	 * Read mesh data chunk.
	 *
	 * @method readMesh
	 * @param {Dataview} data Dataview in use.
	 * @return {Mesh} The parsed mesh.
	 */
	readMesh: function ( data ) {

		var chunk = this.readChunk( data );
		var next = this.nextChunk( data, chunk );

		var geometry = new BufferGeometry();
		var uvs = [];

		var material = new MeshPhongMaterial();
		var mesh = new Mesh( geometry, material );
		mesh.name = 'mesh';

		while ( next !== 0 ) {

			if ( next === POINT_ARRAY ) {

				var points = this.readWord( data );

				this.debugMessage( '   Vertex: ' + points );

				//BufferGeometry

				var vertices = [];

				for ( var i = 0; i < points; i ++ )		{

					vertices.push( this.readFloat( data ) );
					vertices.push( this.readFloat( data ) );
					vertices.push( this.readFloat( data ) );

				}

				geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );

			} else if ( next === FACE_ARRAY ) {

				this.resetPosition( data );
				this.readFaceArray( data, mesh );

			} else if ( next === TEX_VERTS ) {

				var texels = this.readWord( data );

				this.debugMessage( '   UV: ' + texels );

				//BufferGeometry

				var uvs = [];

				for ( var i = 0; i < texels; i ++ )		{

					uvs.push( this.readFloat( data ) );
					uvs.push( this.readFloat( data ) );

				}

				geometry.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );


			} else if ( next === MESH_MATRIX ) {

				this.debugMessage( '   Tranformation Matrix (TODO)' );

				var values = [];
				for ( var i = 0; i < 12; i ++ ) {

					values[ i ] = this.readFloat( data );

				}

				var matrix = new Matrix4();

				//X Line
				matrix.elements[ 0 ] = values[ 0 ];
				matrix.elements[ 1 ] = values[ 6 ];
				matrix.elements[ 2 ] = values[ 3 ];
				matrix.elements[ 3 ] = values[ 9 ];

				//Y Line
				matrix.elements[ 4 ] = values[ 2 ];
				matrix.elements[ 5 ] = values[ 8 ];
				matrix.elements[ 6 ] = values[ 5 ];
				matrix.elements[ 7 ] = values[ 11 ];

				//Z Line
				matrix.elements[ 8 ] = values[ 1 ];
				matrix.elements[ 9 ] = values[ 7 ];
				matrix.elements[ 10 ] = values[ 4 ];
				matrix.elements[ 11 ] = values[ 10 ];

				//W Line
				matrix.elements[ 12 ] = 0;
				matrix.elements[ 13 ] = 0;
				matrix.elements[ 14 ] = 0;
				matrix.elements[ 15 ] = 1;

				matrix.transpose();

				var inverse = new Matrix4();
				inverse.getInverse( matrix );
				geometry.applyMatrix4( inverse );

				matrix.decompose( mesh.position, mesh.quaternion, mesh.scale );

			} else {

				this.debugMessage( '   Unknown mesh chunk: ' + next.toString( 16 ) );

			}

			next = this.nextChunk( data, chunk );

		}

		this.endChunk( chunk );

		geometry.computeVertexNormals();

		return mesh;

	},

	/**
	 * Read face array data chunk.
	 *
	 * @method readFaceArray
	 * @param {Dataview} data Dataview in use.
	 * @param {Mesh} mesh Mesh to be filled with the data read.
	 */
	readFaceArray: function ( data, mesh ) {

		var chunk = this.readChunk( data );
		var faces = this.readWord( data );

		this.debugMessage( '   Faces: ' + faces );

		var index = [];

		for ( var i = 0; i < faces; ++ i ) {

			index.push( this.readWord( data ), this.readWord( data ), this.readWord( data ) );

			this.readWord( data ); // visibility

		}

		mesh.geometry.setIndex( index );

		//The rest of the FACE_ARRAY chunk is subchunks

		while ( this.position < chunk.end ) {

			var chunk = this.readChunk( data );

			if ( chunk.id === MSH_MAT_GROUP ) {

				this.debugMessage( '      Material Group' );

				this.resetPosition( data );

				var group = this.readMaterialGroup( data );

				var material = this.materials[ group.name ];

				if ( material !== undefined )	{

					mesh.material = material;

					if ( material.name === '' )		{

						material.name = mesh.name;

					}

				}

			} else {

				this.debugMessage( '      Unknown face array chunk: ' + chunk.toString( 16 ) );

			}

			this.endChunk( chunk );

		}

		this.endChunk( chunk );

	},

	/**
	 * Read texture map data chunk.
	 *
	 * @method readMap
	 * @param {Dataview} data Dataview in use.
	 * @param {String} path Path for external resources.
	 * @return {Texture} Texture read from this data chunk.
	 */
	readMap: function ( data, path ) {

		var chunk = this.readChunk( data );
		var next = this.nextChunk( data, chunk );
		var texture = {};

		var loader = new TextureLoader( this.manager );
		loader.setPath( this.resourcePath || path ).setCrossOrigin( this.crossOrigin );

		while ( next !== 0 ) {

			if ( next === MAT_MAPNAME ) {

				var name = this.readString( data, 128 );
				texture = loader.load( name );

				this.debugMessage( '      File: ' + path + name );

			} else if ( next === MAT_MAP_UOFFSET ) {

				texture.offset.x = this.readFloat( data );
				this.debugMessage( '      OffsetX: ' + texture.offset.x );

			} else if ( next === MAT_MAP_VOFFSET ) {

				texture.offset.y = this.readFloat( data );
				this.debugMessage( '      OffsetY: ' + texture.offset.y );

			} else if ( next === MAT_MAP_USCALE ) {

				texture.repeat.x = this.readFloat( data );
				this.debugMessage( '      RepeatX: ' + texture.repeat.x );

			} else if ( next === MAT_MAP_VSCALE ) {

				texture.repeat.y = this.readFloat( data );
				this.debugMessage( '      RepeatY: ' + texture.repeat.y );

			} else {

				this.debugMessage( '      Unknown map chunk: ' + next.toString( 16 ) );

			}

			next = this.nextChunk( data, chunk );

		}

		this.endChunk( chunk );

		return texture;

	},

	/**
	 * Read material group data chunk.
	 *
	 * @method readMaterialGroup
	 * @param {Dataview} data Dataview in use.
	 * @return {Object} Object with name and index of the object.
	 */
	readMaterialGroup: function ( data ) {

		this.readChunk( data );
		var name = this.readString( data, 64 );
		var numFaces = this.readWord( data );

		this.debugMessage( '         Name: ' + name );
		this.debugMessage( '         Faces: ' + numFaces );

		var index = [];
		for ( var i = 0; i < numFaces; ++ i ) {

			index.push( this.readWord( data ) );

		}

		return { name: name, index: index };

	},

	/**
	 * Read a color value.
	 *
	 * @method readColor
	 * @param {DataView} data Dataview.
	 * @return {Color} Color value read..
	 */
	readColor: function ( data ) {

		var chunk = this.readChunk( data );
		var color = new Color();

		if ( chunk.id === COLOR_24 || chunk.id === LIN_COLOR_24 ) {

			var r = this.readByte( data );
			var g = this.readByte( data );
			var b = this.readByte( data );

			color.setRGB( r / 255, g / 255, b / 255 );

			this.debugMessage( '      Color: ' + color.r + ', ' + color.g + ', ' + color.b );

		}	else if ( chunk.id === COLOR_F || chunk.id === LIN_COLOR_F ) {

			var r = this.readFloat( data );
			var g = this.readFloat( data );
			var b = this.readFloat( data );

			color.setRGB( r, g, b );

			this.debugMessage( '      Color: ' + color.r + ', ' + color.g + ', ' + color.b );

		}	else {

			this.debugMessage( '      Unknown color chunk: ' + chunk.toString( 16 ) );

		}

		this.endChunk( chunk );
		return color;

	},

	/**
	 * Read next chunk of data.
	 *
	 * @method readChunk
	 * @param {DataView} data Dataview.
	 * @return {Object} Chunk of data read.
	 */
	readChunk: function ( data ) {

		var chunk = {};

		chunk.cur = this.position;
		chunk.id = this.readWord( data );
		chunk.size = this.readDWord( data );
		chunk.end = chunk.cur + chunk.size;
		chunk.cur += 6;

		return chunk;

	},

	/**
	 * Set position to the end of the current chunk of data.
	 *
	 * @method endChunk
	 * @param {Object} chunk Data chunk.
	 */
	endChunk: function ( chunk ) {

		this.position = chunk.end;

	},

	/**
	 * Move to the next data chunk.
	 *
	 * @method nextChunk
	 * @param {DataView} data Dataview.
	 * @param {Object} chunk Data chunk.
	 */
	nextChunk: function ( data, chunk ) {

		if ( chunk.cur >= chunk.end ) {

			return 0;

		}

		this.position = chunk.cur;

		try {

			var next = this.readChunk( data );
			chunk.cur += next.size;
			return next.id;

		}	catch ( e ) {

			this.debugMessage( 'Unable to read chunk at ' + this.position );
			return 0;

		}

	},

	/**
	 * Reset dataview position.
	 *
	 * @method resetPosition
	 */
	resetPosition: function () {

		this.position -= 6;

	},

	/**
	 * Read byte value.
	 *
	 * @method readByte
	 * @param {DataView} data Dataview to read data from.
	 * @return {Number} Data read from the dataview.
	 */
	readByte: function ( data ) {

		var v = data.getUint8( this.position, true );
		this.position += 1;
		return v;

	},

	/**
	 * Read 32 bit float value.
	 *
	 * @method readFloat
	 * @param {DataView} data Dataview to read data from.
	 * @return {Number} Data read from the dataview.
	 */
	readFloat: function ( data ) {

		try {

			var v = data.getFloat32( this.position, true );
			this.position += 4;
			return v;

		}	catch ( e ) {

			this.debugMessage( e + ' ' + this.position + ' ' + data.byteLength );

		}

	},

	/**
	 * Read 32 bit signed integer value.
	 *
	 * @method readInt
	 * @param {DataView} data Dataview to read data from.
	 * @return {Number} Data read from the dataview.
	 */
	readInt: function ( data ) {

		var v = data.getInt32( this.position, true );
		this.position += 4;
		return v;

	},

	/**
	 * Read 16 bit signed integer value.
	 *
	 * @method readShort
	 * @param {DataView} data Dataview to read data from.
	 * @return {Number} Data read from the dataview.
	 */
	readShort: function ( data ) {

		var v = data.getInt16( this.position, true );
		this.position += 2;
		return v;

	},

	/**
	 * Read 64 bit unsigned integer value.
	 *
	 * @method readDWord
	 * @param {DataView} data Dataview to read data from.
	 * @return {Number} Data read from the dataview.
	 */
	readDWord: function ( data ) {

		var v = data.getUint32( this.position, true );
		this.position += 4;
		return v;

	},

	/**
	 * Read 32 bit unsigned integer value.
	 *
	 * @method readWord
	 * @param {DataView} data Dataview to read data from.
	 * @return {Number} Data read from the dataview.
	 */
	readWord: function ( data ) {

		var v = data.getUint16( this.position, true );
		this.position += 2;
		return v;

	},

	/**
	 * Read string value.
	 *
	 * @method readString
	 * @param {DataView} data Dataview to read data from.
	 * @param {Number} maxLength Max size of the string to be read.
	 * @return {String} Data read from the dataview.
	 */
	readString: function ( data, maxLength ) {

		var s = '';

		for ( var i = 0; i < maxLength; i ++ ) {

			var c = this.readByte( data );
			if ( ! c ) {

				break;

			}

			s += String.fromCharCode( c );

		}

		return s;

	},

	/**
	 * Print debug message to the console.
	 *
	 * Is controlled by a flag to show or hide debug messages.
	 *
	 * @method debugMessage
	 * @param {Object} message Debug message to print to the console.
	 */
	debugMessage: function ( message ) {

		if ( this.debug ) {

			console.log( message );

		}

	}

} );

// var NULL_CHUNK = 0x0000;
var M3DMAGIC = 0x4D4D;
// var SMAGIC = 0x2D2D;
// var LMAGIC = 0x2D3D;
var MLIBMAGIC = 0x3DAA;
// var MATMAGIC = 0x3DFF;
var CMAGIC = 0xC23D;
var M3D_VERSION = 0x0002;
// var M3D_KFVERSION = 0x0005;
var COLOR_F = 0x0010;
var COLOR_24 = 0x0011;
var LIN_COLOR_24 = 0x0012;
var LIN_COLOR_F = 0x0013;
// var INT_PERCENTAGE = 0x0030;
// var FLOAT_PERCENTAGE = 0x0031;
var MDATA = 0x3D3D;
var MESH_VERSION = 0x3D3E;
var MASTER_SCALE = 0x0100;
// var LO_SHADOW_BIAS = 0x1400;
// var HI_SHADOW_BIAS = 0x1410;
// var SHADOW_MAP_SIZE = 0x1420;
// var SHADOW_SAMPLES = 0x1430;
// var SHADOW_RANGE = 0x1440;
// var SHADOW_FILTER = 0x1450;
// var RAY_BIAS = 0x1460;
// var O_CONSTS = 0x1500;
// var AMBIENT_LIGHT = 0x2100;
// var BIT_MAP = 0x1100;
// var SOLID_BGND = 0x1200;
// var V_GRADIENT = 0x1300;
// var USE_BIT_MAP = 0x1101;
// var USE_SOLID_BGND = 0x1201;
// var USE_V_GRADIENT = 0x1301;
// var FOG = 0x2200;
// var FOG_BGND = 0x2210;
// var LAYER_FOG = 0x2302;
// var DISTANCE_CUE = 0x2300;
// var DCUE_BGND = 0x2310;
// var USE_FOG = 0x2201;
// var USE_LAYER_FOG = 0x2303;
// var USE_DISTANCE_CUE = 0x2301;
var MAT_ENTRY = 0xAFFF;
var MAT_NAME = 0xA000;
var MAT_AMBIENT = 0xA010;
var MAT_DIFFUSE = 0xA020;
var MAT_SPECULAR = 0xA030;
var MAT_SHININESS = 0xA040;
// var MAT_SHIN2PCT = 0xA041;
var MAT_TRANSPARENCY = 0xA050;
// var MAT_XPFALL = 0xA052;
// var MAT_USE_XPFALL = 0xA240;
// var MAT_REFBLUR = 0xA053;
// var MAT_SHADING = 0xA100;
// var MAT_USE_REFBLUR = 0xA250;
// var MAT_SELF_ILLUM = 0xA084;
var MAT_TWO_SIDE = 0xA081;
// var MAT_DECAL = 0xA082;
var MAT_ADDITIVE = 0xA083;
var MAT_WIRE = 0xA085;
// var MAT_FACEMAP = 0xA088;
// var MAT_TRANSFALLOFF_IN = 0xA08A;
// var MAT_PHONGSOFT = 0xA08C;
// var MAT_WIREABS = 0xA08E;
var MAT_WIRE_SIZE = 0xA087;
var MAT_TEXMAP = 0xA200;
// var MAT_SXP_TEXT_DATA = 0xA320;
// var MAT_TEXMASK = 0xA33E;
// var MAT_SXP_TEXTMASK_DATA = 0xA32A;
// var MAT_TEX2MAP = 0xA33A;
// var MAT_SXP_TEXT2_DATA = 0xA321;
// var MAT_TEX2MASK = 0xA340;
// var MAT_SXP_TEXT2MASK_DATA = 0xA32C;
var MAT_OPACMAP = 0xA210;
// var MAT_SXP_OPAC_DATA = 0xA322;
// var MAT_OPACMASK = 0xA342;
// var MAT_SXP_OPACMASK_DATA = 0xA32E;
var MAT_BUMPMAP = 0xA230;
// var MAT_SXP_BUMP_DATA = 0xA324;
// var MAT_BUMPMASK = 0xA344;
// var MAT_SXP_BUMPMASK_DATA = 0xA330;
var MAT_SPECMAP = 0xA204;
// var MAT_SXP_SPEC_DATA = 0xA325;
// var MAT_SPECMASK = 0xA348;
// var MAT_SXP_SPECMASK_DATA = 0xA332;
// var MAT_SHINMAP = 0xA33C;
// var MAT_SXP_SHIN_DATA = 0xA326;
// var MAT_SHINMASK = 0xA346;
// var MAT_SXP_SHINMASK_DATA = 0xA334;
// var MAT_SELFIMAP = 0xA33D;
// var MAT_SXP_SELFI_DATA = 0xA328;
// var MAT_SELFIMASK = 0xA34A;
// var MAT_SXP_SELFIMASK_DATA = 0xA336;
// var MAT_REFLMAP = 0xA220;
// var MAT_REFLMASK = 0xA34C;
// var MAT_SXP_REFLMASK_DATA = 0xA338;
// var MAT_ACUBIC = 0xA310;
var MAT_MAPNAME = 0xA300;
// var MAT_MAP_TILING = 0xA351;
// var MAT_MAP_TEXBLUR = 0xA353;
var MAT_MAP_USCALE = 0xA354;
var MAT_MAP_VSCALE = 0xA356;
var MAT_MAP_UOFFSET = 0xA358;
var MAT_MAP_VOFFSET = 0xA35A;
// var MAT_MAP_ANG = 0xA35C;
// var MAT_MAP_COL1 = 0xA360;
// var MAT_MAP_COL2 = 0xA362;
// var MAT_MAP_RCOL = 0xA364;
// var MAT_MAP_GCOL = 0xA366;
// var MAT_MAP_BCOL = 0xA368;
var NAMED_OBJECT = 0x4000;
// var N_DIRECT_LIGHT = 0x4600;
// var DL_OFF = 0x4620;
// var DL_OUTER_RANGE = 0x465A;
// var DL_INNER_RANGE = 0x4659;
// var DL_MULTIPLIER = 0x465B;
// var DL_EXCLUDE = 0x4654;
// var DL_ATTENUATE = 0x4625;
// var DL_SPOTLIGHT = 0x4610;
// var DL_SPOT_ROLL = 0x4656;
// var DL_SHADOWED = 0x4630;
// var DL_LOCAL_SHADOW2 = 0x4641;
// var DL_SEE_CONE = 0x4650;
// var DL_SPOT_RECTANGULAR = 0x4651;
// var DL_SPOT_ASPECT = 0x4657;
// var DL_SPOT_PROJECTOR = 0x4653;
// var DL_SPOT_OVERSHOOT = 0x4652;
// var DL_RAY_BIAS = 0x4658;
// var DL_RAYSHAD = 0x4627;
// var N_CAMERA = 0x4700;
// var CAM_SEE_CONE = 0x4710;
// var CAM_RANGES = 0x4720;
// var OBJ_HIDDEN = 0x4010;
// var OBJ_VIS_LOFTER = 0x4011;
// var OBJ_DOESNT_CAST = 0x4012;
// var OBJ_DONT_RECVSHADOW = 0x4017;
// var OBJ_MATTE = 0x4013;
// var OBJ_FAST = 0x4014;
// var OBJ_PROCEDURAL = 0x4015;
// var OBJ_FROZEN = 0x4016;
var N_TRI_OBJECT = 0x4100;
var POINT_ARRAY = 0x4110;
// var POINT_FLAG_ARRAY = 0x4111;
var FACE_ARRAY = 0x4120;
var MSH_MAT_GROUP = 0x4130;
// var SMOOTH_GROUP = 0x4150;
// var MSH_BOXMAP = 0x4190;
var TEX_VERTS = 0x4140;
var MESH_MATRIX = 0x4160;
// var MESH_COLOR = 0x4165;
// var MESH_TEXTURE_INFO = 0x4170;
// var KFDATA = 0xB000;
// var KFHDR = 0xB00A;
// var KFSEG = 0xB008;
// var KFCURTIME = 0xB009;
// var AMBIENT_NODE_TAG = 0xB001;
// var OBJECT_NODE_TAG = 0xB002;
// var CAMERA_NODE_TAG = 0xB003;
// var TARGET_NODE_TAG = 0xB004;
// var LIGHT_NODE_TAG = 0xB005;
// var L_TARGET_NODE_TAG = 0xB006;
// var SPOTLIGHT_NODE_TAG = 0xB007;
// var NODE_ID = 0xB030;
// var NODE_HDR = 0xB010;
// var PIVOT = 0xB013;
// var INSTANCE_NAME = 0xB011;
// var MORPH_SMOOTH = 0xB015;
// var BOUNDBOX = 0xB014;
// var POS_TRACK_TAG = 0xB020;
// var COL_TRACK_TAG = 0xB025;
// var ROT_TRACK_TAG = 0xB021;
// var SCL_TRACK_TAG = 0xB022;
// var MORPH_TRACK_TAG = 0xB026;
// var FOV_TRACK_TAG = 0xB023;
// var ROLL_TRACK_TAG = 0xB024;
// var HOT_TRACK_TAG = 0xB027;
// var FALL_TRACK_TAG = 0xB028;
// var HIDE_TRACK_TAG = 0xB029;
// var POLY_2D = 0x5000;
// var SHAPE_OK = 0x5010;
// var SHAPE_NOT_OK = 0x5011;
// var SHAPE_HOOK = 0x5020;
// var PATH_3D = 0x6000;
// var PATH_MATRIX = 0x6005;
// var SHAPE_2D = 0x6010;
// var M_SCALE = 0x6020;
// var M_TWIST = 0x6030;
// var M_TEETER = 0x6040;
// var M_FIT = 0x6050;
// var M_BEVEL = 0x6060;
// var XZ_CURVE = 0x6070;
// var YZ_CURVE = 0x6080;
// var INTERPCT = 0x6090;
// var DEFORM_LIMIT = 0x60A0;
// var USE_CONTOUR = 0x6100;
// var USE_TWEEN = 0x6110;
// var USE_SCALE = 0x6120;
// var USE_TWIST = 0x6130;
// var USE_TEETER = 0x6140;
// var USE_FIT = 0x6150;
// var USE_BEVEL = 0x6160;
// var DEFAULT_VIEW = 0x3000;
// var VIEW_TOP = 0x3010;
// var VIEW_BOTTOM = 0x3020;
// var VIEW_LEFT = 0x3030;
// var VIEW_RIGHT = 0x3040;
// var VIEW_FRONT = 0x3050;
// var VIEW_BACK = 0x3060;
// var VIEW_USER = 0x3070;
// var VIEW_CAMERA = 0x3080;
// var VIEW_WINDOW = 0x3090;
// var VIEWPORT_LAYOUT_OLD = 0x7000;
// var VIEWPORT_DATA_OLD = 0x7010;
// var VIEWPORT_LAYOUT = 0x7001;
// var VIEWPORT_DATA = 0x7011;
// var VIEWPORT_DATA_3 = 0x7012;
// var VIEWPORT_SIZE = 0x7020;
// var NETWORK_VIEW = 0x7030;

export { TDSLoader };
