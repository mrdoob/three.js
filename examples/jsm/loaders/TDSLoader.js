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
} from 'three';

/**
 * Autodesk 3DS three.js file loader, based on lib3ds.
 *
 * Loads geometry with uv and materials basic properties with texture support.
 *
 * @class TDSLoader
 */

class TDSLoader extends Loader {

	constructor( manager ) {

		super( manager );

		this.debug = false;

		this.group = null;

		this.materials = [];
		this.meshes = [];

	}

	/**
	 * Load 3ds file from url.
	 *
	 * @method load
	 * @param {string} url URL for the file.
	 * @param {Function} onLoad onLoad callback, receives group Object3D as argument.
	 * @param {Function} onProgress onProgress callback.
	 * @param {Function} onError onError callback.
	 */
	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const path = ( this.path === '' ) ? LoaderUtils.extractUrlBase( url ) : this.path;

		const loader = new FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( this.withCredentials );

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

	}

	/**
	 * Parse arraybuffer data and load 3ds file.
	 *
	 * @method parse
	 * @param {ArrayBuffer} arraybuffer Arraybuffer data to be loaded.
	 * @param {string} path Path for external resources.
	 * @return {Group} Group loaded from 3ds file.
	 */
	parse( arraybuffer, path ) {

		this.group = new Group();
		this.materials = [];
		this.meshes = [];

		this.readFile( arraybuffer, path );

		for ( let i = 0; i < this.meshes.length; i ++ ) {

			this.group.add( this.meshes[ i ] );

		}

		return this.group;

	}

	/**
	 * Decode file content to read 3ds data.
	 *
	 * @method readFile
	 * @param {ArrayBuffer} arraybuffer Arraybuffer data to be loaded.
	 * @param {string} path Path for external resources.
	 */
	readFile( arraybuffer, path ) {

		const data = new DataView( arraybuffer );
		const chunk = new Chunk( data, 0, this.debugMessage );

		if ( chunk.id === MLIBMAGIC || chunk.id === CMAGIC || chunk.id === M3DMAGIC ) {

			let next = chunk.readChunk();

			while ( next ) {

				if ( next.id === M3D_VERSION ) {

					const version = next.readDWord();
					this.debugMessage( '3DS file version: ' + version );

				} else if ( next.id === MDATA ) {

					this.readMeshData( next, path );

				} else {

					this.debugMessage( 'Unknown main chunk: ' + next.hexId );

				}

				next = chunk.readChunk();

			}

		}

		this.debugMessage( 'Parsed ' + this.meshes.length + ' meshes' );

	}

	/**
	 * Read mesh data chunk.
	 *
	 * @method readMeshData
	 * @param {Chunk} chunk to read mesh from
	 * @param {string} path Path for external resources.
	 */
	readMeshData( chunk, path ) {

		let next = chunk.readChunk();

		while ( next ) {

			if ( next.id === MESH_VERSION ) {

				const version = + next.readDWord();
				this.debugMessage( 'Mesh Version: ' + version );

			} else if ( next.id === MASTER_SCALE ) {

				const scale = next.readFloat();
				this.debugMessage( 'Master scale: ' + scale );
				this.group.scale.set( scale, scale, scale );

			} else if ( next.id === NAMED_OBJECT ) {

				this.debugMessage( 'Named Object' );
				this.readNamedObject( next );

			} else if ( next.id === MAT_ENTRY ) {

				this.debugMessage( 'Material' );
				this.readMaterialEntry( next, path );

			} else {

				this.debugMessage( 'Unknown MDATA chunk: ' + next.hexId );

			}

			next = chunk.readChunk();

		}

	}

	/**
	 * Read named object chunk.
	 *
	 * @method readNamedObject
	 * @param {Chunk} chunk Chunk in use.
	 */
	readNamedObject( chunk ) {

		const name = chunk.readString();

		let next = chunk.readChunk();
		while ( next ) {

			if ( next.id === N_TRI_OBJECT ) {

				const mesh = this.readMesh( next );
				mesh.name = name;
				this.meshes.push( mesh );

			} else {

				this.debugMessage( 'Unknown named object chunk: ' + next.hexId );

			}

			next = chunk.readChunk( );

		}

	}

	/**
	 * Read material data chunk and add it to the material list.
	 *
	 * @method readMaterialEntry
	 * @param {Chunk} chunk Chunk in use.
	 * @param {string} path Path for external resources.
	 */
	readMaterialEntry( chunk, path ) {

		let next = chunk.readChunk();
		const material = new MeshPhongMaterial();

		while ( next ) {

			if ( next.id === MAT_NAME ) {

				material.name = next.readString();
				this.debugMessage( '   Name: ' + material.name );

			} else if ( next.id === MAT_WIRE ) {

				this.debugMessage( '   Wireframe' );
				material.wireframe = true;

			} else if ( next.id === MAT_WIRE_SIZE ) {

				const value = next.readByte();
				material.wireframeLinewidth = value;
				this.debugMessage( '   Wireframe Thickness: ' + value );

			} else if ( next.id === MAT_TWO_SIDE ) {

				material.side = DoubleSide;
				this.debugMessage( '   DoubleSided' );

			} else if ( next.id === MAT_ADDITIVE ) {

				this.debugMessage( '   Additive Blending' );
				material.blending = AdditiveBlending;

			} else if ( next.id === MAT_DIFFUSE ) {

				this.debugMessage( '   Diffuse Color' );
				material.color = this.readColor( next );

			} else if ( next.id === MAT_SPECULAR ) {

				this.debugMessage( '   Specular Color' );
				material.specular = this.readColor( next );

			} else if ( next.id === MAT_AMBIENT ) {

				this.debugMessage( '   Ambient color' );
				material.color = this.readColor( next );

			} else if ( next.id === MAT_SHININESS ) {

				const shininess = this.readPercentage( next );
				material.shininess = shininess * 100;
				this.debugMessage( '   Shininess : ' + shininess );

			} else if ( next.id === MAT_TRANSPARENCY ) {

				const transparency = this.readPercentage( next );
				material.opacity = 1 - transparency;
				this.debugMessage( '  Transparency : ' + transparency );
				material.transparent = material.opacity < 1 ? true : false;

			} else if ( next.id === MAT_TEXMAP ) {

				this.debugMessage( '   ColorMap' );
				material.map = this.readMap( next, path );

			} else if ( next.id === MAT_BUMPMAP ) {

				this.debugMessage( '   BumpMap' );
				material.bumpMap = this.readMap( next, path );

			} else if ( next.id === MAT_OPACMAP ) {

				this.debugMessage( '   OpacityMap' );
				material.alphaMap = this.readMap( next, path );

			} else if ( next.id === MAT_SPECMAP ) {

				this.debugMessage( '   SpecularMap' );
				material.specularMap = this.readMap( next, path );

			} else {

				this.debugMessage( '   Unknown material chunk: ' + next.hexId );

			}

			next = chunk.readChunk();

		}

		this.materials[ material.name ] = material;

	}

	/**
	 * Read mesh data chunk.
	 *
	 * @method readMesh
	 * @param {Chunk} chunk Chunk in use.
	 * @return {Mesh} The parsed mesh.
	 */
	readMesh( chunk ) {

		let next = chunk.readChunk( );

		const geometry = new BufferGeometry();

		const material = new MeshPhongMaterial();
		const mesh = new Mesh( geometry, material );
		mesh.name = 'mesh';

		while ( next ) {

			if ( next.id === POINT_ARRAY ) {

				const points = next.readWord( );

				this.debugMessage( '   Vertex: ' + points );

				//BufferGeometry

				const vertices = [];

				for ( let i = 0; i < points; i ++ )		{

					vertices.push( next.readFloat( ) );
					vertices.push( next.readFloat( ) );
					vertices.push( next.readFloat( ) );

				}

				geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );

			} else if ( next.id === FACE_ARRAY ) {

				this.readFaceArray( next, mesh );

			} else if ( next.id === TEX_VERTS ) {

				const texels = next.readWord( );

				this.debugMessage( '   UV: ' + texels );

				//BufferGeometry

				const uvs = [];

				for ( let i = 0; i < texels; i ++ ) {

					uvs.push( next.readFloat( ) );
					uvs.push( next.readFloat( ) );

				}

				geometry.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );


			} else if ( next.id === MESH_MATRIX ) {

				this.debugMessage( '   Transformation Matrix (TODO)' );

				const values = [];
				for ( let i = 0; i < 12; i ++ ) {

					values[ i ] = next.readFloat( );

				}

				const matrix = new Matrix4();

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

				const inverse = new Matrix4();
				inverse.copy( matrix ).invert();
				geometry.applyMatrix4( inverse );

				matrix.decompose( mesh.position, mesh.quaternion, mesh.scale );

			} else {

				this.debugMessage( '   Unknown mesh chunk: ' + next.hexId );

			}

			next = chunk.readChunk( );

		}

		geometry.computeVertexNormals();

		return mesh;

	}

	/**
	 * Read face array data chunk.
	 *
	 * @method readFaceArray
	 * @param {Chunk} chunk Chunk in use.
	 * @param {Mesh} mesh Mesh to be filled with the data read.
	 */
	readFaceArray( chunk, mesh ) {

		const faces = chunk.readWord( );

		this.debugMessage( '   Faces: ' + faces );

		const index = [];

		for ( let i = 0; i < faces; ++ i ) {

			index.push( chunk.readWord( ), chunk.readWord( ), chunk.readWord( ) );

			chunk.readWord( ); // visibility

		}

		mesh.geometry.setIndex( index );

		//The rest of the FACE_ARRAY chunk is subchunks

		let materialIndex = 0;
		let start = 0;

		while ( ! chunk.endOfChunk ) {

			const subchunk = chunk.readChunk( );

			if ( subchunk.id === MSH_MAT_GROUP ) {

				this.debugMessage( '      Material Group' );

				const group = this.readMaterialGroup( subchunk );
				const count = group.index.length * 3; // assuming successive indices

				mesh.geometry.addGroup( start, count, materialIndex );

				start += count;
				materialIndex ++;

				const material = this.materials[ group.name ];

				if ( Array.isArray( mesh.material ) === false ) mesh.material = [];

				if ( material !== undefined )	{

					mesh.material.push( material );

				}

			} else {

				this.debugMessage( '      Unknown face array chunk: ' + subchunk.hexId );

			}

		}

		if ( mesh.material.length === 1 ) mesh.material = mesh.material[ 0 ]; // for backwards compatibility

	}

	/**
	 * Read texture map data chunk.
	 *
	 * @method readMap
	 * @param {Chunk} chunk Chunk in use.
	 * @param {string} path Path for external resources.
	 * @return {Texture} Texture read from this data chunk.
	 */
	readMap( chunk, path ) {

		let next = chunk.readChunk( );
		let texture = {};

		const loader = new TextureLoader( this.manager );
		loader.setPath( this.resourcePath || path ).setCrossOrigin( this.crossOrigin );

		while ( next ) {

			if ( next.id === MAT_MAPNAME ) {

				const name = next.readString();
				texture = loader.load( name );

				this.debugMessage( '      File: ' + path + name );

			} else if ( next.id === MAT_MAP_UOFFSET ) {

				texture.offset.x = next.readFloat( );
				this.debugMessage( '      OffsetX: ' + texture.offset.x );

			} else if ( next.id === MAT_MAP_VOFFSET ) {

				texture.offset.y = next.readFloat( );
				this.debugMessage( '      OffsetY: ' + texture.offset.y );

			} else if ( next.id === MAT_MAP_USCALE ) {

				texture.repeat.x = next.readFloat( );
				this.debugMessage( '      RepeatX: ' + texture.repeat.x );

			} else if ( next.id === MAT_MAP_VSCALE ) {

				texture.repeat.y = next.readFloat( );
				this.debugMessage( '      RepeatY: ' + texture.repeat.y );

			} else {

				this.debugMessage( '      Unknown map chunk: ' + next.hexId );

			}

			next = chunk.readChunk( );

		}

		return texture;

	}

	/**
	 * Read material group data chunk.
	 *
	 * @method readMaterialGroup
	 * @param {Chunk} chunk Chunk in use.
	 * @return {Object} Object with name and index of the object.
	 */
	readMaterialGroup( chunk ) {

		const name = chunk.readString();
		const numFaces = chunk.readWord();

		this.debugMessage( '         Name: ' + name );
		this.debugMessage( '         Faces: ' + numFaces );

		const index = [];
		for ( let i = 0; i < numFaces; ++ i ) {

			index.push( chunk.readWord( ) );

		}

		return { name: name, index: index };

	}

	/**
	 * Read a color value.
	 *
	 * @method readColor
	 * @param {Chunk} chunk Chunk.
	 * @return {Color} Color value read..
	 */
	readColor( chunk ) {

		const subChunk = chunk.readChunk( );
		const color = new Color();

		if ( subChunk.id === COLOR_24 || subChunk.id === LIN_COLOR_24 ) {

			const r = subChunk.readByte( );
			const g = subChunk.readByte( );
			const b = subChunk.readByte( );

			color.setRGB( r / 255, g / 255, b / 255 );

			this.debugMessage( '      Color: ' + color.r + ', ' + color.g + ', ' + color.b );

		}	else if ( subChunk.id === COLOR_F || subChunk.id === LIN_COLOR_F ) {

			const r = subChunk.readFloat( );
			const g = subChunk.readFloat( );
			const b = subChunk.readFloat( );

			color.setRGB( r, g, b );

			this.debugMessage( '      Color: ' + color.r + ', ' + color.g + ', ' + color.b );

		}	else {

			this.debugMessage( '      Unknown color chunk: ' + subChunk.hexId );

		}

		return color;

	}

	/**
	 * Read percentage value.
	 *
	 * @method readPercentage
	 * @param {Chunk} chunk Chunk to read data from.
	 * @return {number} Data read from the dataview.
	 */
	readPercentage( chunk ) {

		const subChunk = chunk.readChunk( );

		switch ( subChunk.id ) {

			case INT_PERCENTAGE:
				return ( subChunk.readShort( ) / 100 );
				break;

			case FLOAT_PERCENTAGE:
				return subChunk.readFloat( );
				break;

			default:
				this.debugMessage( '      Unknown percentage chunk: ' + subChunk.hexId );
				return 0;

		}

	}

	/**
	 * Print debug message to the console.
	 *
	 * Is controlled by a flag to show or hide debug messages.
	 *
	 * @method debugMessage
	 * @param {Object} message Debug message to print to the console.
	 */
	debugMessage( message ) {

		if ( this.debug ) {

			console.log( message );

		}

	}

}


/** Read data/sub-chunks from chunk */
class Chunk {

	/**
	 * Create a new chunk
	 *
	 * @class Chunk
	 * @param {DataView} data DataView to read from.
	 * @param {number} position in data.
	 * @param {Function} debugMessage logging callback.
	 */
	constructor( data, position, debugMessage ) {

		this.data = data;
		// the offset to the begin of this chunk
		this.offset = position;
		// the current reading position
		this.position = position;
		this.debugMessage = debugMessage;

		if ( this.debugMessage instanceof Function ) {

			this.debugMessage = function () {};

		}

		this.id = this.readWord();
		this.size = this.readDWord();
		this.end = this.offset + this.size;

		if ( this.end > data.byteLength ) {

			this.debugMessage( 'Bad chunk size for chunk at ' + position );

		}

	}

	/**
	 * read a sub cchunk.
	 *
	 * @method readChunk
	 * @return {Chunk | null} next sub chunk
	 */
	readChunk() {

		if ( this.endOfChunk ) {

			return null;

		}

		try {

			const next = new Chunk( this.data, this.position, this.debugMessage );
			this.position += next.size;
			return next;

		}	catch ( e ) {

			this.debugMessage( 'Unable to read chunk at ' + this.position );
			return null;

		}

	}

	/**
	 * return the ID of this chunk as Hex
	 *
	 * @method idToString
	 * @return {string} hex-string of id
	 */
	get hexId() {

		return this.id.toString( 16 );

	}

	get endOfChunk() {

		return this.position >= this.end;

	}

	/**
	 * Read byte value.
	 *
	 * @method readByte
	 * @return {number} Data read from the dataview.
	 */
	readByte() {

		const v = this.data.getUint8( this.position, true );
		this.position += 1;
		return v;

	}

	/**
	 * Read 32 bit float value.
	 *
	 * @method readFloat
	 * @return {number} Data read from the dataview.
	 */
	readFloat() {

		try {

			const v = this.data.getFloat32( this.position, true );
			this.position += 4;
			return v;

		}	catch ( e ) {

			this.debugMessage( e + ' ' + this.position + ' ' + this.data.byteLength );
			return 0;

		}

	}

	/**
	 * Read 32 bit signed integer value.
	 *
	 * @method readInt
	 * @return {number} Data read from the dataview.
	 */
	readInt() {

		const v = this.data.getInt32( this.position, true );
		this.position += 4;
		return v;

	}

	/**
	 * Read 16 bit signed integer value.
	 *
	 * @method readShort
	 * @return {number} Data read from the dataview.
	 */
	readShort() {

		const v = this.data.getInt16( this.position, true );
		this.position += 2;
		return v;

	}

	/**
	 * Read 64 bit unsigned integer value.
	 *
	 * @method readDWord
	 * @return {number} Data read from the dataview.
	 */
	readDWord() {

		const v = this.data.getUint32( this.position, true );
		this.position += 4;
		return v;

	}

	/**
	 * Read 32 bit unsigned integer value.
	 *
	 * @method readWord
	 * @return {number} Data read from the dataview.
	 */
	readWord() {

		const v = this.data.getUint16( this.position, true );
		this.position += 2;
		return v;

	}

	/**
	 * Read NULL terminated ASCII string value from chunk-pos.
	 *
	 * @method readString
	 * @return {string} Data read from the dataview.
	 */
	readString() {

		let s = '';
		let c = this.readByte();
		while ( c ) {

			s += String.fromCharCode( c );
			c = this.readByte();

		}

		return s;

	}

}

// const NULL_CHUNK = 0x0000;
const M3DMAGIC = 0x4D4D;
// const SMAGIC = 0x2D2D;
// const LMAGIC = 0x2D3D;
const MLIBMAGIC = 0x3DAA;
// const MATMAGIC = 0x3DFF;
const CMAGIC = 0xC23D;
const M3D_VERSION = 0x0002;
// const M3D_KFVERSION = 0x0005;
const COLOR_F = 0x0010;
const COLOR_24 = 0x0011;
const LIN_COLOR_24 = 0x0012;
const LIN_COLOR_F = 0x0013;
const INT_PERCENTAGE = 0x0030;
const FLOAT_PERCENTAGE = 0x0031;
const MDATA = 0x3D3D;
const MESH_VERSION = 0x3D3E;
const MASTER_SCALE = 0x0100;
// const LO_SHADOW_BIAS = 0x1400;
// const HI_SHADOW_BIAS = 0x1410;
// const SHADOW_MAP_SIZE = 0x1420;
// const SHADOW_SAMPLES = 0x1430;
// const SHADOW_RANGE = 0x1440;
// const SHADOW_FILTER = 0x1450;
// const RAY_BIAS = 0x1460;
// const O_CONSTS = 0x1500;
// const AMBIENT_LIGHT = 0x2100;
// const BIT_MAP = 0x1100;
// const SOLID_BGND = 0x1200;
// const V_GRADIENT = 0x1300;
// const USE_BIT_MAP = 0x1101;
// const USE_SOLID_BGND = 0x1201;
// const USE_V_GRADIENT = 0x1301;
// const FOG = 0x2200;
// const FOG_BGND = 0x2210;
// const LAYER_FOG = 0x2302;
// const DISTANCE_CUE = 0x2300;
// const DCUE_BGND = 0x2310;
// const USE_FOG = 0x2201;
// const USE_LAYER_FOG = 0x2303;
// const USE_DISTANCE_CUE = 0x2301;
const MAT_ENTRY = 0xAFFF;
const MAT_NAME = 0xA000;
const MAT_AMBIENT = 0xA010;
const MAT_DIFFUSE = 0xA020;
const MAT_SPECULAR = 0xA030;
const MAT_SHININESS = 0xA040;
// const MAT_SHIN2PCT = 0xA041;
const MAT_TRANSPARENCY = 0xA050;
// const MAT_XPFALL = 0xA052;
// const MAT_USE_XPFALL = 0xA240;
// const MAT_REFBLUR = 0xA053;
// const MAT_SHADING = 0xA100;
// const MAT_USE_REFBLUR = 0xA250;
// const MAT_SELF_ILLUM = 0xA084;
const MAT_TWO_SIDE = 0xA081;
// const MAT_DECAL = 0xA082;
const MAT_ADDITIVE = 0xA083;
const MAT_WIRE = 0xA085;
// const MAT_FACEMAP = 0xA088;
// const MAT_TRANSFALLOFF_IN = 0xA08A;
// const MAT_PHONGSOFT = 0xA08C;
// const MAT_WIREABS = 0xA08E;
const MAT_WIRE_SIZE = 0xA087;
const MAT_TEXMAP = 0xA200;
// const MAT_SXP_TEXT_DATA = 0xA320;
// const MAT_TEXMASK = 0xA33E;
// const MAT_SXP_TEXTMASK_DATA = 0xA32A;
// const MAT_TEX2MAP = 0xA33A;
// const MAT_SXP_TEXT2_DATA = 0xA321;
// const MAT_TEX2MASK = 0xA340;
// const MAT_SXP_TEXT2MASK_DATA = 0xA32C;
const MAT_OPACMAP = 0xA210;
// const MAT_SXP_OPAC_DATA = 0xA322;
// const MAT_OPACMASK = 0xA342;
// const MAT_SXP_OPACMASK_DATA = 0xA32E;
const MAT_BUMPMAP = 0xA230;
// const MAT_SXP_BUMP_DATA = 0xA324;
// const MAT_BUMPMASK = 0xA344;
// const MAT_SXP_BUMPMASK_DATA = 0xA330;
const MAT_SPECMAP = 0xA204;
// const MAT_SXP_SPEC_DATA = 0xA325;
// const MAT_SPECMASK = 0xA348;
// const MAT_SXP_SPECMASK_DATA = 0xA332;
// const MAT_SHINMAP = 0xA33C;
// const MAT_SXP_SHIN_DATA = 0xA326;
// const MAT_SHINMASK = 0xA346;
// const MAT_SXP_SHINMASK_DATA = 0xA334;
// const MAT_SELFIMAP = 0xA33D;
// const MAT_SXP_SELFI_DATA = 0xA328;
// const MAT_SELFIMASK = 0xA34A;
// const MAT_SXP_SELFIMASK_DATA = 0xA336;
// const MAT_REFLMAP = 0xA220;
// const MAT_REFLMASK = 0xA34C;
// const MAT_SXP_REFLMASK_DATA = 0xA338;
// const MAT_ACUBIC = 0xA310;
const MAT_MAPNAME = 0xA300;
// const MAT_MAP_TILING = 0xA351;
// const MAT_MAP_TEXBLUR = 0xA353;
const MAT_MAP_USCALE = 0xA354;
const MAT_MAP_VSCALE = 0xA356;
const MAT_MAP_UOFFSET = 0xA358;
const MAT_MAP_VOFFSET = 0xA35A;
// const MAT_MAP_ANG = 0xA35C;
// const MAT_MAP_COL1 = 0xA360;
// const MAT_MAP_COL2 = 0xA362;
// const MAT_MAP_RCOL = 0xA364;
// const MAT_MAP_GCOL = 0xA366;
// const MAT_MAP_BCOL = 0xA368;
const NAMED_OBJECT = 0x4000;
// const N_DIRECT_LIGHT = 0x4600;
// const DL_OFF = 0x4620;
// const DL_OUTER_RANGE = 0x465A;
// const DL_INNER_RANGE = 0x4659;
// const DL_MULTIPLIER = 0x465B;
// const DL_EXCLUDE = 0x4654;
// const DL_ATTENUATE = 0x4625;
// const DL_SPOTLIGHT = 0x4610;
// const DL_SPOT_ROLL = 0x4656;
// const DL_SHADOWED = 0x4630;
// const DL_LOCAL_SHADOW2 = 0x4641;
// const DL_SEE_CONE = 0x4650;
// const DL_SPOT_RECTANGULAR = 0x4651;
// const DL_SPOT_ASPECT = 0x4657;
// const DL_SPOT_PROJECTOR = 0x4653;
// const DL_SPOT_OVERSHOOT = 0x4652;
// const DL_RAY_BIAS = 0x4658;
// const DL_RAYSHAD = 0x4627;
// const N_CAMERA = 0x4700;
// const CAM_SEE_CONE = 0x4710;
// const CAM_RANGES = 0x4720;
// const OBJ_HIDDEN = 0x4010;
// const OBJ_VIS_LOFTER = 0x4011;
// const OBJ_DOESNT_CAST = 0x4012;
// const OBJ_DONT_RECVSHADOW = 0x4017;
// const OBJ_MATTE = 0x4013;
// const OBJ_FAST = 0x4014;
// const OBJ_PROCEDURAL = 0x4015;
// const OBJ_FROZEN = 0x4016;
const N_TRI_OBJECT = 0x4100;
const POINT_ARRAY = 0x4110;
// const POINT_FLAG_ARRAY = 0x4111;
const FACE_ARRAY = 0x4120;
const MSH_MAT_GROUP = 0x4130;
// const SMOOTH_GROUP = 0x4150;
// const MSH_BOXMAP = 0x4190;
const TEX_VERTS = 0x4140;
const MESH_MATRIX = 0x4160;
// const MESH_COLOR = 0x4165;
// const MESH_TEXTURE_INFO = 0x4170;
// const KFDATA = 0xB000;
// const KFHDR = 0xB00A;
// const KFSEG = 0xB008;
// const KFCURTIME = 0xB009;
// const AMBIENT_NODE_TAG = 0xB001;
// const OBJECT_NODE_TAG = 0xB002;
// const CAMERA_NODE_TAG = 0xB003;
// const TARGET_NODE_TAG = 0xB004;
// const LIGHT_NODE_TAG = 0xB005;
// const L_TARGET_NODE_TAG = 0xB006;
// const SPOTLIGHT_NODE_TAG = 0xB007;
// const NODE_ID = 0xB030;
// const NODE_HDR = 0xB010;
// const PIVOT = 0xB013;
// const INSTANCE_NAME = 0xB011;
// const MORPH_SMOOTH = 0xB015;
// const BOUNDBOX = 0xB014;
// const POS_TRACK_TAG = 0xB020;
// const COL_TRACK_TAG = 0xB025;
// const ROT_TRACK_TAG = 0xB021;
// const SCL_TRACK_TAG = 0xB022;
// const MORPH_TRACK_TAG = 0xB026;
// const FOV_TRACK_TAG = 0xB023;
// const ROLL_TRACK_TAG = 0xB024;
// const HOT_TRACK_TAG = 0xB027;
// const FALL_TRACK_TAG = 0xB028;
// const HIDE_TRACK_TAG = 0xB029;
// const POLY_2D = 0x5000;
// const SHAPE_OK = 0x5010;
// const SHAPE_NOT_OK = 0x5011;
// const SHAPE_HOOK = 0x5020;
// const PATH_3D = 0x6000;
// const PATH_MATRIX = 0x6005;
// const SHAPE_2D = 0x6010;
// const M_SCALE = 0x6020;
// const M_TWIST = 0x6030;
// const M_TEETER = 0x6040;
// const M_FIT = 0x6050;
// const M_BEVEL = 0x6060;
// const XZ_CURVE = 0x6070;
// const YZ_CURVE = 0x6080;
// const INTERPCT = 0x6090;
// const DEFORM_LIMIT = 0x60A0;
// const USE_CONTOUR = 0x6100;
// const USE_TWEEN = 0x6110;
// const USE_SCALE = 0x6120;
// const USE_TWIST = 0x6130;
// const USE_TEETER = 0x6140;
// const USE_FIT = 0x6150;
// const USE_BEVEL = 0x6160;
// const DEFAULT_VIEW = 0x3000;
// const VIEW_TOP = 0x3010;
// const VIEW_BOTTOM = 0x3020;
// const VIEW_LEFT = 0x3030;
// const VIEW_RIGHT = 0x3040;
// const VIEW_FRONT = 0x3050;
// const VIEW_BACK = 0x3060;
// const VIEW_USER = 0x3070;
// const VIEW_CAMERA = 0x3080;
// const VIEW_WINDOW = 0x3090;
// const VIEWPORT_LAYOUT_OLD = 0x7000;
// const VIEWPORT_DATA_OLD = 0x7010;
// const VIEWPORT_LAYOUT = 0x7001;
// const VIEWPORT_DATA = 0x7011;
// const VIEWPORT_DATA_3 = 0x7012;
// const VIEWPORT_SIZE = 0x7020;
// const NETWORK_VIEW = 0x7030;

export { TDSLoader };
