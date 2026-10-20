import {
	BufferGeometry,
	Color,
	DoubleSide,
	FileLoader,
	Float32BufferAttribute,
	Group,
	LineBasicMaterial,
	LineSegments,
	Loader,
	LoaderUtils,
	Matrix4,
	Mesh,
	MeshPhongMaterial,
	Points,
	PointsMaterial,
	SRGBColorSpace
} from 'three';
import { unzlibSync } from '../libs/fflate.module.js';

/**
 * A loader for the JT format (ISO 14306), a lightweight 3D data format for
 * CAD visualization developed by Siemens.
 *
 * The loader reads the Logical Scene Graph (assembly structure, transforms,
 * materials and properties) and the tessellated Shape LOD data of JT files.
 * Only the most detailed level of detail of each shape is loaded.
 *
 * Limitations:
 * - Only JT version 10.x files are supported.
 * - Precise geometry (XT B-Rep, JT B-Rep, ULP, LWPA), PMI, wireframe segments,
 * textures and procedural primitive sets are not supported.
 * - The coordinate system is preserved (JT files are usually Z-up and in
 * millimeters).
 *
 * ```js
 * const loader = new JTLoader();
 * const group = await loader.loadAsync( './models/jt/model.jt' );
 * scene.add( group );
 * ```
 *
 * Shattered assemblies, where leaf partition nodes reference other JT files,
 * are resolved relative to the URL of the loaded file when using `load()`.
 *
 * @augments Loader
 * @three_import import { JTLoader } from 'three/addons/loaders/JTLoader.js';
 */
class JTLoader extends Loader {

	/**
	 * Constructs a new JT loader.
	 *
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor( manager ) {

		super( manager );

		/**
		 * Whether external JT files referenced by partition nodes should be loaded.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.loadExternalPartitions = true;

	}

	/**
	 * Starts loading from the given URL and passes the loaded JT asset
	 * to the `onLoad()` callback.
	 *
	 * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	 * @param {function(Group)} onLoad - Executed when the loading process has been finished.
	 * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 */
	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const path = ( this.path === '' ) ? LoaderUtils.extractUrlBase( url ) : this.path;

		const loader = new FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( this.withCredentials );

		loader.load( url, function ( buffer ) {

			let group;

			try {

				group = scope.parse( buffer );

			} catch ( e ) {

				handleError( e );
				return;

			}

			scope._loadPartitions( group, path, new Set( [ url ] ) ).then( function () {

				onLoad( group );

			} ).catch( handleError );

		}, onProgress, onError );

		function handleError( e ) {

			if ( onError ) {

				onError( e );

			} else {

				console.error( e );

			}

			scope.manager.itemError( url );

		}

	}

	/**
	 * Parses the given JT data and returns the resulting group.
	 *
	 * External files referenced by partition nodes are not loaded by this method.
	 * Unresolved partitions are represented by empty groups with
	 * `userData.jtPartitionFile` set to the referenced file name.
	 *
	 * @param {ArrayBuffer} buffer - The raw JT data as an array buffer.
	 * @return {Group} The parsed asset as a group.
	 */
	parse( buffer ) {

		const file = new JTFile( buffer );
		return new JTSceneBuilder( file ).build();

	}

	async _loadPartitions( group, path, visited ) {

		if ( this.loadExternalPartitions === false ) return;

		const pending = [];

		group.traverse( function ( object ) {

			if ( object.userData.jtPartitionFile !== undefined && object.children.length === 0 ) pending.push( object );

		} );

		const loader = new FileLoader( this.manager );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( this.withCredentials );

		for ( const object of pending ) {

			const fileName = object.userData.jtPartitionFile.replace( /\\/g, '/' );
			const url = LoaderUtils.resolveURL( fileName, path );

			if ( visited.has( url ) ) continue;

			let buffer;

			try {

				buffer = await loader.loadAsync( url );

			} catch ( e ) {

				console.warn( 'THREE.JTLoader: Could not load partition file "' + url + '".', e );
				continue;

			}

			const child = this.parse( buffer );
			await this._loadPartitions( child, LoaderUtils.extractUrlBase( url ), new Set( [ ...visited, url ] ) );

			object.add( child );

		}

	}

}

// Object type identifiers (see JT File Format Reference, Annex A)

const GUID_END_OF_ELEMENTS = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

const TYPE = {

	// LSG nodes
	BASE_NODE: '10dd1035-2ac8-11d1-9b6b-0080c7bb5997',
	GROUP_NODE: '10dd101b-2ac8-11d1-9b6b-0080c7bb5997',
	INSTANCE_NODE: '10dd102a-2ac8-11d1-9b6b-0080c7bb5997',
	LOD_NODE: '10dd102c-2ac8-11d1-9b6b-0080c7bb5997',
	META_DATA_NODE: 'ce357245-38fb-11d1-a506-006097bdc6e1',
	NULL_SHAPE_NODE: 'd239e7b6-dd77-4289-a07d-b0ee79f79494',
	PART_NODE: 'ce357244-38fb-11d1-a506-006097bdc6e1',
	PARTITION_NODE: '10dd103e-2ac8-11d1-9b6b-0080c7bb5997',
	RANGE_LOD_NODE: '10dd104c-2ac8-11d1-9b6b-0080c7bb5997',
	SWITCH_NODE: '10dd10f3-2ac8-11d1-9b6b-0080c7bb5997',
	BASE_SHAPE_NODE: '10dd1059-2ac8-11d1-9b6b-0080c7bb5997',
	POINT_SET_SHAPE_NODE: '98134716-0010-0818-1998-000009835d5a',
	POLYGON_SET_SHAPE_NODE: '10dd1048-2ac8-11d1-9b6b-0080c7bb5997',
	POLYLINE_SET_SHAPE_NODE: '10dd1046-2ac8-11d1-9b6b-0080c7bb5997',
	PRIMITIVE_SET_SHAPE_NODE: 'e40373c1-1ad9-11d3-9daf-00a0c9c7ddc2',
	TRI_STRIP_SET_SHAPE_NODE: '10dd1077-2ac8-11d1-9b6b-0080c7bb5997',
	VERTEX_SHAPE_NODE: '10dd107f-2ac8-11d1-9b6b-0080c7bb5997',

	// LSG attributes
	MATERIAL_ATTRIBUTE: '10dd1030-2ac8-11d1-9b6b-0080c7bb5997',
	GEOMETRIC_TRANSFORM_ATTRIBUTE: '10dd1083-2ac8-11d1-9b6b-0080c7bb5997',

	// LSG property atoms
	BASE_PROPERTY_ATOM: '10dd104b-2ac8-11d1-9b6b-0080c7bb5997',
	DATE_PROPERTY_ATOM: 'ce357246-38fb-11d1-a506-006097bdc6e1',
	INTEGER_PROPERTY_ATOM: '10dd102b-2ac8-11d1-9b6b-0080c7bb5997',
	FLOAT_PROPERTY_ATOM: '10dd1019-2ac8-11d1-9b6b-0080c7bb5997',
	LATE_LOADED_PROPERTY_ATOM: 'e0b05be5-fbbd-11d1-a3a7-00aa00d10954',
	OBJECT_REFERENCE_PROPERTY_ATOM: '10dd1004-2ac8-11d1-9b6b-0080c7bb5997',
	STRING_PROPERTY_ATOM: '10dd106e-2ac8-11d1-9b6b-0080c7bb5997',
	VECTOR4F_PROPERTY_ATOM: '2e7db4be-c71a-4b18-9d07-c7227e9fef76',

	// Shape LOD elements
	NULL_SHAPE_LOD: '3e637aed-2a89-41f8-a9fd-553737039682',
	POINT_SET_SHAPE_LOD: '98134716-0011-0818-1998-000009835d5a',
	POLYLINE_SET_SHAPE_LOD: '10dd10a1-2ac8-11d1-9b6b-0080c7bb5997',
	PRIMITIVE_SET_SHAPE: 'e40373c2-1ad9-11d3-9daf-00a0c9c7ddc2',
	TRI_STRIP_SET_SHAPE_LOD: '10dd10ab-2ac8-11d1-9b6b-0080c7bb5997',
	POLYGON_SET_SHAPE_LOD: '10dd109f-2ac8-11d1-9b6b-0080c7bb5997',
	VERTEX_SHAPE_LOD: '10dd10b0-2ac8-11d1-9b6b-0080c7bb5997'

};

const GROUP_NODE_TYPES = new Set( [
	TYPE.GROUP_NODE, TYPE.PARTITION_NODE, TYPE.PART_NODE, TYPE.META_DATA_NODE,
	TYPE.LOD_NODE, TYPE.RANGE_LOD_NODE, TYPE.SWITCH_NODE
] );

const SHAPE_NODE_TYPES = new Set( [
	TYPE.BASE_SHAPE_NODE, TYPE.VERTEX_SHAPE_NODE, TYPE.TRI_STRIP_SET_SHAPE_NODE,
	TYPE.POLYGON_SET_SHAPE_NODE, TYPE.POLYLINE_SET_SHAPE_NODE, TYPE.POINT_SET_SHAPE_NODE,
	TYPE.NULL_SHAPE_NODE, TYPE.PRIMITIVE_SET_SHAPE_NODE
] );

// Segment types which may have LZMA/ZLIB compression applied to all their data.

const COMPRESSIBLE_SEGMENT_TYPES = new Set( [ 1, 2, 3, 4, 17, 18, 20, 24, 30, 32 ] );

const SEGMENT_TYPE_LSG = 1;

// Predictor types

const PREDICTOR_NULL = 0;
const PREDICTOR_LAG1 = 1;
const PREDICTOR_XOR1 = 2;

//

class JTFile {

	constructor( buffer ) {

		this.buffer = buffer;

		const header = new Uint8Array( buffer, 0, Math.min( 80, buffer.byteLength ) );
		const versionString = new TextDecoder().decode( header ).replace( /[\s\u0000]+$/, '' );
		const match = /^Version\s+(\d+)\.(\d+)/.exec( versionString );

		if ( match === null ) {

			throw new Error( 'THREE.JTLoader: Not a valid JT file.' );

		}

		this.versionString = versionString;
		this.majorVersion = parseInt( match[ 1 ] );
		this.minorVersion = parseInt( match[ 2 ] );

		if ( this.majorVersion !== 10 ) {

			throw new Error( 'THREE.JTLoader: Unsupported JT version ' + this.majorVersion + '.' + this.minorVersion + '. Only JT 10.x files are supported.' );

		}

		const littleEndian = new DataView( buffer ).getUint8( 80 ) === 0;
		const reader = new JTReader( buffer, 81, littleEndian );

		this.littleEndian = littleEndian;

		reader.skip( 4 ); // empty field
		const tocOffset = reader.u64();
		this.lsgSegmentId = reader.guid();

		// TOC

		reader.seek( tocOffset );

		const entryCount = reader.i32();

		this.segments = new Map();

		for ( let i = 0; i < entryCount; i ++ ) {

			const id = reader.guid();
			const offset = reader.u64();
			const length = reader.u32();
			const attributes = reader.u32();

			this.segments.set( id, { id: id, offset: offset, length: length, type: attributes >>> 24 } );

		}

	}

	getSegment( id ) {

		return this.segments.get( id );

	}

	// Returns a reader positioned at the first element of the given segment.
	// Compressed segment data is decompressed if necessary.

	getSegmentReader( segment ) {

		const reader = new JTReader( this.buffer, segment.offset, this.littleEndian );

		reader.guid(); // segment id
		const type = reader.i32();
		reader.i32(); // segment length

		if ( COMPRESSIBLE_SEGMENT_TYPES.has( type ) ) {

			const compressionFlag = reader.u32();
			const compressedLength = reader.i32();
			const algorithm = reader.u8();

			if ( ( compressionFlag === 2 || compressionFlag === 3 ) && algorithm !== 1 ) {

				const data = new Uint8Array( this.buffer, reader.offset, compressedLength - 1 );
				let decompressed;

				if ( algorithm === 3 ) {

					decompressed = decodeXZ( data );

				} else if ( algorithm === 2 ) {

					decompressed = unzlibSync( data );

				} else {

					throw new Error( 'THREE.JTLoader: Unsupported compression algorithm ' + algorithm + '.' );

				}

				return new JTReader( decompressed.buffer, decompressed.byteOffset, this.littleEndian );

			}

		}

		return reader;

	}

}

//

class JTReader {

	constructor( buffer, offset = 0, littleEndian = true ) {

		this.view = new DataView( buffer );
		this.bytes = new Uint8Array( buffer );
		this.offset = offset;
		this.littleEndian = littleEndian;

	}

	seek( offset ) {

		this.offset = offset;

	}

	skip( length ) {

		this.offset += length;

	}

	u8() {

		return this.view.getUint8( this.offset ++ );

	}

	i8() {

		return this.view.getInt8( this.offset ++ );

	}

	u16() {

		const value = this.view.getUint16( this.offset, this.littleEndian );
		this.offset += 2;
		return value;

	}

	i16() {

		const value = this.view.getInt16( this.offset, this.littleEndian );
		this.offset += 2;
		return value;

	}

	u32() {

		const value = this.view.getUint32( this.offset, this.littleEndian );
		this.offset += 4;
		return value;

	}

	i32() {

		const value = this.view.getInt32( this.offset, this.littleEndian );
		this.offset += 4;
		return value;

	}

	u64() {

		const a = this.u32();
		const b = this.u32();
		return this.littleEndian ? b * 4294967296 + a : a * 4294967296 + b;

	}

	// Returns the 64 bit value as two 32 bit words.

	u64Words() {

		const a = this.u32();
		const b = this.u32();
		return this.littleEndian ? { lo: a, hi: b } : { lo: b, hi: a };

	}

	f32() {

		const value = this.view.getFloat32( this.offset, this.littleEndian );
		this.offset += 4;
		return value;

	}

	f64() {

		const value = this.view.getFloat64( this.offset, this.littleEndian );
		this.offset += 8;
		return value;

	}

	f32Array( count ) {

		const array = [];
		for ( let i = 0; i < count; i ++ ) array.push( this.f32() );
		return array;

	}

	guid() {

		const a = this.u32();
		const b = this.u16();
		const c = this.u16();
		let d = '';

		for ( let i = 0; i < 8; i ++ ) {

			d += this.u8().toString( 16 ).padStart( 2, '0' );
			if ( i === 1 ) d += '-';

		}

		return a.toString( 16 ).padStart( 8, '0' ) + '-' + b.toString( 16 ).padStart( 4, '0' ) + '-' + c.toString( 16 ).padStart( 4, '0' ) + '-' + d;

	}

	string() {

		const count = this.i32();
		let result = '';

		for ( let i = 0; i < count; i ++ ) result += String.fromCharCode( this.u8() );

		return result;

	}

	mbString() {

		const count = this.i32();
		let result = '';

		for ( let i = 0; i < count; i ++ ) result += String.fromCharCode( this.u16() );

		return result;

	}

	bbox() {

		return { min: this.f32Array( 3 ), max: this.f32Array( 3 ) };

	}

}

// Elements

function readElementHeader( reader ) {

	const length = reader.i32();
	const start = reader.offset;
	const type = reader.guid();

	if ( type === GUID_END_OF_ELEMENTS ) {

		reader.seek( start + length );
		return null;

	}

	const baseType = reader.u8();
	const id = reader.i32();

	return { type: type, baseType: baseType, id: id, end: start + length };

}

class JTSceneBuilder {

	constructor( file ) {

		this.file = file;

		this.nodes = new Map();
		this.attributes = new Map();
		this.properties = new Map();
		this.propertyTable = new Map();

		this.geometryCache = new Map();
		this.materialCache = new Map();

	}

	build() {

		const segment = this.file.getSegment( this.file.lsgSegmentId );

		if ( segment === undefined ) {

			throw new Error( 'THREE.JTLoader: LSG segment not found.' );

		}

		this.parseLSG( this.file.getSegmentReader( segment ) );

		const group = new Group();
		group.name = 'JT';
		group.userData.jtVersion = this.file.versionString;

		// The first graph element of the LSG is the root partition node.

		const root = this.buildNode( this.rootId, null, 0 );
		if ( root !== null ) group.add( root );

		return group;

	}

	// LSG Segment

	parseLSG( reader ) {

		this.rootId = undefined;

		// Graph elements

		while ( true ) {

			const header = readElementHeader( reader );
			if ( header === null ) break;

			if ( this.rootId === undefined ) this.rootId = header.id;

			try {

				this.parseGraphElement( reader, header );

			} catch ( e ) {

				console.warn( 'THREE.JTLoader: Failed to parse LSG element ' + header.type + '.', e );

			}

			reader.seek( header.end );

		}

		// Property atom elements

		while ( true ) {

			const header = readElementHeader( reader );
			if ( header === null ) break;

			try {

				this.parsePropertyAtom( reader, header );

			} catch ( e ) {

				console.warn( 'THREE.JTLoader: Failed to parse property atom ' + header.type + '.', e );

			}

			reader.seek( header.end );

		}

		// Property table

		reader.i16(); // version
		const tableCount = reader.i32();

		for ( let i = 0; i < tableCount; i ++ ) {

			const elementId = reader.i32();
			const table = [];

			while ( true ) {

				const keyId = reader.i32();
				if ( keyId === 0 ) break;
				const valueId = reader.i32();
				table.push( [ keyId, valueId ] );

			}

			this.propertyTable.set( elementId, table );

		}

	}

	parseGraphElement( reader, header ) {

		const type = header.type;

		if ( type === TYPE.MATERIAL_ATTRIBUTE ) {

			this.attributes.set( header.id, this.parseMaterialAttribute( reader ) );
			return;

		}

		if ( type === TYPE.GEOMETRIC_TRANSFORM_ATTRIBUTE ) {

			this.attributes.set( header.id, this.parseTransformAttribute( reader ) );
			return;

		}

		if ( header.baseType === 3 ) return; // other attributes are not supported

		if ( GROUP_NODE_TYPES.has( type ) === false && SHAPE_NODE_TYPES.has( type ) === false &&
			type !== TYPE.INSTANCE_NODE && type !== TYPE.BASE_NODE ) return;

		const node = { type: type, id: header.id, attributes: [], children: [] };

		// Base Node Data

		reader.u8(); // version
		node.flags = reader.u32();
		const attributeCount = reader.i32();
		for ( let i = 0; i < attributeCount; i ++ ) node.attributes.push( reader.i32() );

		if ( type === TYPE.INSTANCE_NODE ) {

			reader.u8(); // version
			node.children.push( reader.i32() );

		} else if ( GROUP_NODE_TYPES.has( type ) ) {

			// Group Node Data

			reader.u8(); // version
			const childCount = reader.i32();
			for ( let i = 0; i < childCount; i ++ ) node.children.push( reader.i32() );

			if ( type === TYPE.PARTITION_NODE ) {

				reader.u8(); // version
				reader.i32(); // partition flags
				node.fileName = reader.mbString();

			} else if ( type === TYPE.SWITCH_NODE ) {

				reader.u8(); // version
				node.selectedChild = reader.i32();

			}

		}

		this.nodes.set( header.id, node );

	}

	parseBaseAttributeData( reader ) {

		reader.i8(); // version
		const stateFlags = reader.u8();
		reader.u32(); // field inhibit flags
		reader.u32(); // field final flags

		return stateFlags;

	}

	parseMaterialAttribute( reader ) {

		const stateFlags = this.parseBaseAttributeData( reader );

		reader.i8(); // version
		const dataFlags = reader.u16();

		const ambient = reader.f32Array( 4 );
		const diffuse = reader.f32Array( 4 );
		const specular = reader.f32Array( 4 );
		const emission = reader.f32Array( 4 );
		const shininess = reader.f32();

		return {
			isMaterial: true,
			ignore: ( stateFlags & 0x04 ) !== 0, // accumulation ignore flag
			ambient: ambient,
			diffuse: diffuse,
			specular: specular,
			emission: emission,
			shininess: shininess,
			overrideVertexColors: ( dataFlags & 0x0020 ) !== 0
		};

	}

	parseTransformAttribute( reader ) {

		const stateFlags = this.parseBaseAttributeData( reader );

		reader.i8(); // version
		let mask = reader.u16();

		const elements = [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ];

		for ( let i = 0; i < 16; i ++ ) {

			if ( mask & 0x8000 ) elements[ i ] = reader.f64();
			mask = ( mask << 1 ) & 0xFFFF;

		}

		// JT matrices are row-major and multiply row vectors (p' = pM). Interpreting
		// the elements in column-major order yields the equivalent three.js matrix.

		return {
			isTransform: true,
			ignore: ( stateFlags & 0x04 ) !== 0, // accumulation ignore flag
			matrix: new Matrix4().fromArray( elements )
		};

	}

	parsePropertyAtom( reader, header ) {

		// Base Property Atom Data

		reader.u8(); // version
		reader.u32(); // state flags

		const type = header.type;
		let value;

		if ( type === TYPE.STRING_PROPERTY_ATOM ) {

			reader.u8(); // version
			value = reader.mbString();

		} else if ( type === TYPE.INTEGER_PROPERTY_ATOM ) {

			reader.u8(); // version
			value = reader.i32();

		} else if ( type === TYPE.FLOAT_PROPERTY_ATOM ) {

			reader.u8(); // version
			value = reader.f32();

		} else if ( type === TYPE.DATE_PROPERTY_ATOM ) {

			reader.u8(); // version
			const year = reader.i16();
			const month = reader.i16();
			const day = reader.i16();
			const hour = reader.i16();
			const minute = reader.i16();
			const second = reader.i16();
			value = new Date( Date.UTC( year, month, day, hour, minute, second ) );

		} else if ( type === TYPE.VECTOR4F_PROPERTY_ATOM ) {

			reader.u8(); // version
			value = reader.f32Array( 4 );

		} else if ( type === TYPE.LATE_LOADED_PROPERTY_ATOM ) {

			reader.u8(); // version
			value = {
				isLateLoaded: true,
				segmentId: reader.guid(),
				segmentType: reader.i32()
			};

		} else if ( type === TYPE.OBJECT_REFERENCE_PROPERTY_ATOM ) {

			reader.u8(); // version
			value = { isObjectReference: true, id: reader.i32() };

		} else {

			return;

		}

		this.properties.set( header.id, value );

	}

	getProperties( id ) {

		const table = this.propertyTable.get( id );
		const result = [];

		if ( table === undefined ) return result;

		for ( const [ keyId, valueId ] of table ) {

			const key = this.properties.get( keyId );
			const value = this.properties.get( valueId );

			if ( key !== undefined && value !== undefined ) result.push( [ String( key ), value ] );

		}

		return result;

	}

	// Scene graph

	buildNode( id, material, depth ) {

		const node = this.nodes.get( id );

		if ( node === undefined || depth > 256 ) return null;
		if ( node.flags & 0x00000001 ) return null; // ignore flag

		let matrix = null;

		for ( const attributeId of node.attributes ) {

			const attribute = this.attributes.get( attributeId );

			if ( attribute === undefined || attribute.ignore ) continue;

			if ( attribute.isMaterial ) {

				material = attribute;

			} else if ( attribute.isTransform ) {

				matrix = ( matrix === null ) ? attribute.matrix.clone() : matrix.premultiply( attribute.matrix );

			}

		}

		let object;

		if ( SHAPE_NODE_TYPES.has( node.type ) ) {

			object = this.buildShape( node, material );

		} else {

			object = new Group();

			let children = node.children;

			if ( node.type === TYPE.LOD_NODE || node.type === TYPE.RANGE_LOD_NODE ) {

				// only use the first (most detailed) alternative representation

				children = children.slice( 0, 1 );

			} else if ( node.type === TYPE.SWITCH_NODE ) {

				children = ( node.selectedChild >= 0 && node.selectedChild < children.length ) ? [ children[ node.selectedChild ] ] : [];

			}

			for ( const childId of children ) {

				const child = this.buildNode( childId, material, depth + 1 );
				if ( child !== null ) object.add( child );

			}

			if ( node.type === TYPE.PARTITION_NODE && node.children.length === 0 && node.fileName ) {

				object.userData.jtPartitionFile = node.fileName;

			}

		}

		if ( object === null ) return null;

		if ( matrix !== null ) object.applyMatrix4( matrix );

		this.assignProperties( object, node.id );

		return object;

	}

	assignProperties( object, id ) {

		const properties = this.getProperties( id );

		for ( const [ key, value ] of properties ) {

			if ( typeof value === 'object' && ( value.isLateLoaded || value.isObjectReference ) ) continue;

			if ( object.userData.jtProperties === undefined ) object.userData.jtProperties = {};
			object.userData.jtProperties[ key ] = value;

			if ( object.name === '' && ( key === 'JT_PROP_NAME' || key === 'Name' ) ) {

				// remove revision and sequence suffixes like "name.part;1;129:"

				object.name = String( value ).replace( /(;[^;]*){2}:?$/, '' );

			}

		}

	}

	buildShape( node, material ) {

		// Find the most detailed Shape LOD segment referenced through late loaded properties.

		let lod = null;

		for ( const [ , value ] of this.getProperties( node.id ) ) {

			if ( typeof value !== 'object' || value.isLateLoaded !== true ) continue;
			if ( value.segmentType < 6 || value.segmentType > 16 ) continue;

			if ( lod === null || value.segmentType < lod.segmentType ) lod = value;

		}

		if ( lod === null ) return null;

		let geometry = this.geometryCache.get( lod.segmentId );

		if ( geometry === undefined ) {

			const segment = this.file.getSegment( lod.segmentId );
			geometry = null;

			if ( segment !== undefined ) {

				try {

					geometry = parseShapeLODSegment( this.file.getSegmentReader( segment ) );

				} catch ( e ) {

					console.warn( 'THREE.JTLoader: Failed to parse shape LOD segment ' + lod.segmentId + '.', e );

				}

			}

			this.geometryCache.set( lod.segmentId, geometry );

		}

		if ( geometry === null ) return null;

		const primitive = geometry.userData.jtPrimitive;
		const hasVertexColors = geometry.hasAttribute( 'color' ) && ( material === null || material.overrideVertexColors === false );

		let object;

		if ( primitive === 'lines' ) {

			object = new LineSegments( geometry, this.getMaterial( material, 'lines', hasVertexColors ) );

		} else if ( primitive === 'points' ) {

			object = new Points( geometry, this.getMaterial( material, 'points', hasVertexColors ) );

		} else {

			object = new Mesh( geometry, this.getMaterial( material, 'mesh', hasVertexColors ) );

		}

		return object;

	}

	getMaterial( attribute, kind, vertexColors ) {

		const key = ( attribute !== null ? attribute : 'default' );

		let cache = this.materialCache.get( key );

		if ( cache === undefined ) {

			cache = {};
			this.materialCache.set( key, cache );

		}

		const cacheKey = kind + ( vertexColors ? '_vc' : '' );

		if ( cache[ cacheKey ] !== undefined ) return cache[ cacheKey ];

		const diffuse = attribute !== null ? attribute.diffuse : [ 0.8, 0.8, 0.8, 1 ];
		const color = new Color().setRGB( diffuse[ 0 ], diffuse[ 1 ], diffuse[ 2 ], SRGBColorSpace );
		const opacity = diffuse[ 3 ];
		const transparent = opacity < 1;

		let material;

		if ( kind === 'lines' ) {

			material = new LineBasicMaterial( { color: color, opacity: opacity, transparent: transparent } );

		} else if ( kind === 'points' ) {

			material = new PointsMaterial( { color: color, opacity: opacity, transparent: transparent, size: 2, sizeAttenuation: false } );

		} else {

			material = new MeshPhongMaterial( {
				color: color,
				opacity: opacity,
				transparent: transparent,
				side: DoubleSide
			} );

			if ( attribute !== null ) {

				material.specular.setRGB( attribute.specular[ 0 ], attribute.specular[ 1 ], attribute.specular[ 2 ], SRGBColorSpace );
				material.emissive.setRGB( attribute.emission[ 0 ], attribute.emission[ 1 ], attribute.emission[ 2 ], SRGBColorSpace );
				material.shininess = attribute.shininess;

			}

		}

		if ( vertexColors ) {

			// per vertex colors replace the diffuse color

			material.vertexColors = true;
			material.color.setRGB( 1, 1, 1 );

		}

		cache[ cacheKey ] = material;

		return material;

	}

}

// Shape LOD Segment

function parseShapeLODSegment( reader ) {

	const header = readElementHeader( reader );

	if ( header === null ) return null;

	switch ( header.type ) {

		case TYPE.TRI_STRIP_SET_SHAPE_LOD:
		case TYPE.POLYGON_SET_SHAPE_LOD:
			return parseTopologicallyCompressedLOD( reader );

		case TYPE.POLYLINE_SET_SHAPE_LOD:
			return parseTopoMeshCompressedLOD( reader, 'lines' );

		case TYPE.POINT_SET_SHAPE_LOD:
			return parseTopoMeshCompressedLOD( reader, 'points' );

		default:
			return null;

	}

}

function readVertexShapeLODHeader( reader ) {

	reader.i8(); // base shape LOD version
	reader.i8(); // version
	reader.u64Words(); // vertex bindings

	// TopoMesh data is stored with its own logical element header

	readElementHeader( reader );

	// TopoMesh LOD Data

	reader.u8(); // version
	reader.u32(); // vertex records object id

	reader.u8(); // version

}

function parseTopologicallyCompressedLOD( reader ) {

	readVertexShapeLODHeader( reader );

	// Topologically Compressed Rep Data

	const degreeSymbols = [];
	for ( let i = 0; i < 8; i ++ ) degreeSymbols.push( readInt32CDP( reader, PREDICTOR_NULL ) );

	const valenceSymbols = readInt32CDP( reader, PREDICTOR_NULL );
	const groupSymbols = readInt32CDP( reader, PREDICTOR_NULL );
	const flagSymbols = readInt32CDP( reader, PREDICTOR_LAG1 );

	const attributeMasks = [];
	for ( let i = 0; i < 8; i ++ ) attributeMasks.push( readInt32CDP( reader, PREDICTOR_NULL ) );

	const attributeMasksMSB = readInt32CDP( reader, PREDICTOR_NULL );

	const highDegreeMaskCount = reader.i32();
	const highDegreeMasks = new Uint32Array( Math.max( highDegreeMaskCount, 0 ) );
	for ( let i = 0; i < highDegreeMaskCount; i ++ ) highDegreeMasks[ i ] = reader.u32();

	const splitFaceSymbols = readInt32CDP( reader, PREDICTOR_LAG1 );
	const splitPositionSymbols = readInt32CDP( reader, PREDICTOR_NULL );

	reader.u32(); // composite hash

	const mesh = new MeshDecoder( {
		degreeSymbols, valenceSymbols, groupSymbols, flagSymbols,
		attributeMasks, attributeMasksMSB, highDegreeMasks,
		splitFaceSymbols, splitPositionSymbols
	} ).decode();

	// Topologically Compressed Vertex Records

	const bindings = reader.u64Words();
	reader.skip( 4 ); // quantization parameters

	const records = { positions: null, normals: null, colors: null, uvs: null };

	const topologicalVertexCount = reader.i32();

	if ( topologicalVertexCount > 0 ) {

		reader.i32(); // number of vertex attributes
		readVertexRecords( reader, bindings, records );

	}

	return buildMeshGeometry( mesh, records );

}

function parseTopoMeshCompressedLOD( reader, primitive ) {

	readVertexShapeLODHeader( reader );

	// TopoMesh Compressed Rep Data

	reader.u32(); // number of face group list indices
	reader.u32(); // number of primitive list indices
	reader.u32(); // number of vertex list indices

	readInt32CDP( reader, PREDICTOR_LAG1 ); // face group list indices
	const primitiveListIndices = readInt32CDP( reader, PREDICTOR_LAG1 );
	const vertexListIndices = readInt32CDP( reader, PREDICTOR_LAG1 );

	reader.i32(); // FGPV list indices hash

	const bindings = reader.u64Words();
	reader.skip( 4 ); // quantization parameters

	const vertexRecordCount = reader.i32();

	if ( vertexRecordCount <= 0 ) return null;

	const uniqueLengths = readInt32CDP( reader, PREDICTOR_NULL );
	reader.i32(); // unique vertex list map hash

	const records = { positions: null, normals: null, colors: null, uvs: null };
	readVertexRecords( reader, bindings, records );

	// expand unique coordinates to vertex records

	let positions = records.positions;

	if ( positions !== null && uniqueLengths.length > 0 ) {

		const expanded = new Float32Array( vertexRecordCount * 3 );
		let index = 0;

		for ( let i = 0; i < uniqueLengths.length; i ++ ) {

			for ( let j = 0; j < uniqueLengths[ i ] && index < vertexRecordCount; j ++, index ++ ) {

				expanded[ index * 3 ] = positions[ i * 3 ];
				expanded[ index * 3 + 1 ] = positions[ i * 3 + 1 ];
				expanded[ index * 3 + 2 ] = positions[ i * 3 + 2 ];

			}

		}

		positions = expanded;

	}

	if ( positions === null ) return null;

	// build the vertex sequence

	const indices = [];

	if ( primitive === 'lines' ) {

		for ( let p = 0; p < primitiveListIndices.length - 1; p ++ ) {

			for ( let i = primitiveListIndices[ p ]; i < primitiveListIndices[ p + 1 ] - 1; i ++ ) {

				indices.push( vertexListIndices[ i ], vertexListIndices[ i + 1 ] );

			}

		}

	} else {

		for ( let i = 0; i < vertexListIndices.length; i ++ ) indices.push( vertexListIndices[ i ] );

	}

	const geometry = new BufferGeometry();
	geometry.setAttribute( 'position', new Float32BufferAttribute( gather( positions, indices, 3 ), 3 ) );

	if ( records.colors !== null ) {

		geometry.setAttribute( 'color', new Float32BufferAttribute( gather( records.colors, indices, records.colorSize ), records.colorSize ) );

	}

	geometry.userData.jtPrimitive = primitive;

	return geometry;

}

function gather( source, indices, itemSize ) {

	const array = new Float32Array( indices.length * itemSize );

	for ( let i = 0; i < indices.length; i ++ ) {

		for ( let j = 0; j < itemSize; j ++ ) array[ i * itemSize + j ] = source[ indices[ i ] * itemSize + j ];

	}

	return array;

}

// Vertex records

function readVertexRecords( reader, bindings, records ) {

	const lo = bindings.lo;
	const hi = bindings.hi;

	if ( lo & 0x00000007 ) records.positions = readCompressedVertexCoordinates( reader );

	if ( lo & 0x00000008 ) records.normals = readCompressedVertexNormals( reader );

	if ( lo & 0x00000030 ) {

		const colors = readCompressedVertexColors( reader );
		records.colors = colors.array;
		records.colorSize = colors.itemSize;

	}

	// Texture coordinates for channels 0 to 7 (bits 9-40)

	for ( let channel = 0; channel < 8; channel ++ ) {

		const shift = 8 + channel * 4;
		const bits = shift < 32 ? ( lo >>> shift ) & 0xF : ( hi >>> ( shift - 32 ) ) & 0xF;

		if ( bits !== 0 ) {

			const uvs = readCompressedVertexTextureCoordinates( reader );

			if ( channel === 0 ) {

				records.uvs = uvs.array;
				records.uvSize = uvs.itemSize;

			}

		}

	}

	// Vertex flags and auxiliary fields are not needed.

}

function readUniformQuantizer( reader ) {

	return { min: reader.f32(), max: reader.f32(), bits: reader.u8() };

}

function dequantize( codes, quantizer ) {

	const result = new Float32Array( codes.length );
	const maxCode = quantizer.bits < 32 ? Math.pow( 2, quantizer.bits ) - 1 : 0xFFFFFFFF;
	const scale = ( quantizer.max - quantizer.min ) / maxCode;

	for ( let i = 0; i < codes.length; i ++ ) result[ i ] = quantizer.min + ( codes[ i ] >>> 0 ) * scale;

	return result;

}

function toFloat32( values ) {

	return new Float32Array( values.buffer, values.byteOffset, values.length );

}

function interleave( components, count ) {

	const itemSize = components.length;
	const result = new Float32Array( count * itemSize );

	for ( let c = 0; c < itemSize; c ++ ) {

		const component = components[ c ];
		for ( let i = 0; i < count; i ++ ) result[ i * itemSize + c ] = component[ i ];

	}

	return result;

}

function readCompressedVertexCoordinates( reader ) {

	const count = reader.i32();
	const componentCount = reader.u8();

	const quantizers = [ readUniformQuantizer( reader ), readUniformQuantizer( reader ), readUniformQuantizer( reader ) ];
	const components = [];

	for ( let i = 0; i < componentCount; i ++ ) {

		const values = readInt32CDP( reader, PREDICTOR_LAG1 );
		components.push( quantizers[ 0 ].bits === 0 ? toFloat32( values ) : dequantize( values, quantizers[ i ] ) );

	}

	reader.i32(); // hash

	return interleave( components, count );

}

function readCompressedVertexNormals( reader ) {

	const count = reader.i32();
	const componentCount = reader.u8();
	const quantizationBits = reader.u8();

	let result;

	if ( quantizationBits === 0 ) {

		const components = [];
		for ( let i = 0; i < componentCount; i ++ ) components.push( toFloat32( readInt32CDP( reader, PREDICTOR_NULL ) ) );
		result = interleave( components, count );

	} else {

		const codes = readInt32CDP( reader, PREDICTOR_NULL );
		result = new Float32Array( count * 3 );

		for ( let i = 0; i < count; i ++ ) decodeDeeringNormal( codes[ i ], quantizationBits, result, i * 3 );

	}

	reader.u32(); // hash

	return result;

}

function readCompressedVertexTextureCoordinates( reader ) {

	const count = reader.u32();
	const componentCount = reader.u8();
	const quantizationBits = reader.u8();

	const components = [];

	if ( quantizationBits === 0 ) {

		for ( let i = 0; i < componentCount; i ++ ) components.push( toFloat32( readInt32CDP( reader, PREDICTOR_NULL ) ) );

	} else {

		const quantizers = [];
		for ( let i = 0; i < componentCount; i ++ ) quantizers.push( readUniformQuantizer( reader ) );
		for ( let i = 0; i < componentCount; i ++ ) components.push( dequantize( readInt32CDP( reader, PREDICTOR_LAG1 ), quantizers[ i ] ) );

	}

	reader.i32(); // hash

	return { array: interleave( components, count ), itemSize: componentCount };

}

function readCompressedVertexColors( reader ) {

	const count = reader.u32();
	const componentCount = reader.u8();
	const quantizationBits = reader.u8();

	let array;

	if ( quantizationBits === 0 ) {

		const components = [];
		for ( let i = 0; i < componentCount; i ++ ) components.push( toFloat32( readInt32CDP( reader, PREDICTOR_NULL ) ) );
		array = interleave( components, count );

	} else {

		const hsv = reader.u8() === 1;
		const quantizers = [];

		if ( hsv ) {

			const ranges = [ 6, 1, 1, 1 ];
			for ( let i = 0; i < 4; i ++ ) quantizers.push( { min: 0, max: ranges[ i ], bits: reader.u8() } );

		} else {

			for ( let i = 0; i < 4; i ++ ) quantizers.push( readUniformQuantizer( reader ) );

		}

		const codes = readInt32CDP( reader, PREDICTOR_NULL );
		array = new Float32Array( count * componentCount );

		const value = [ 0, 0, 0, 1 ];

		for ( let i = 0; i < count; i ++ ) {

			// alpha lies in the least significant bits, red in the most significant bits

			let code = codes[ i ] >>> 0;

			for ( let c = 3; c >= 0; c -- ) {

				const quantizer = quantizers[ c ];
				const bits = quantizer.bits;

				if ( bits === 0 ) continue;

				const field = bits < 32 ? code % Math.pow( 2, bits ) : code;
				code = bits < 32 ? Math.floor( code / Math.pow( 2, bits ) ) : 0;

				const maxCode = Math.pow( 2, bits ) - 1;
				value[ c ] = quantizer.min + field * ( quantizer.max - quantizer.min ) / maxCode;

			}

			if ( hsv ) hsvToRGB( value );

			for ( let c = 0; c < componentCount; c ++ ) array[ i * componentCount + c ] = value[ c ];

		}

	}

	reader.i32(); // hash

	// JT colors are defined in sRGB, convert to linear

	const color = new Color();
	const itemSize = Math.min( componentCount, 4 );

	for ( let i = 0; i < count; i ++ ) {

		const o = i * componentCount;
		color.setRGB( array[ o ], array[ o + 1 ], array[ o + 2 ], SRGBColorSpace );
		array[ o ] = color.r;
		array[ o + 1 ] = color.g;
		array[ o + 2 ] = color.b;

	}

	return { array: array, itemSize: itemSize };

}

function hsvToRGB( value ) {

	// hue in [0, 6]

	const h = value[ 0 ], s = value[ 1 ], v = value[ 2 ];
	const i = Math.min( Math.floor( h ), 5 );
	const f = h - i;
	const p = v * ( 1 - s ), q = v * ( 1 - s * f ), t = v * ( 1 - s * ( 1 - f ) );

	const rgb = [ [ v, t, p ], [ q, v, p ], [ p, v, t ], [ p, q, v ], [ t, p, v ], [ v, p, q ] ][ i ];

	value[ 0 ] = rgb[ 0 ];
	value[ 1 ] = rgb[ 1 ];
	value[ 2 ] = rgb[ 2 ];

}

// Deering normal codec

const PSI_MAX = 0.615479709;

function decodeDeeringNormal( code, numBits, target, offset ) {

	code = code >>> 0;

	const mask = Math.pow( 2, numBits ) - 1;
	const range = Math.pow( 2, numBits );

	const sextant = Math.floor( code / Math.pow( 2, 2 * numBits + 3 ) ) & 0x7;
	const octant = Math.floor( code / Math.pow( 2, 2 * numBits ) ) & 0x7;
	let theta = Math.floor( code / range ) & mask;
	const psi = code & mask;

	theta += sextant & 1;

	const fTheta = Math.asin( Math.tan( PSI_MAX * ( range - theta ) / range ) );
	const fPsi = PSI_MAX * ( psi / range );

	const xx = Math.cos( fTheta ) * Math.cos( fPsi );
	const yy = Math.sin( fPsi );
	const zz = Math.sin( fTheta ) * Math.cos( fPsi );

	let x = xx, y = yy, z = zz;

	switch ( sextant ) {

		case 1: z = xx; x = zz; break; // mirror about x = z plane
		case 2: z = xx; x = yy; y = zz; break; // rotate CW
		case 3: y = xx; x = yy; break; // mirror about x = y plane
		case 4: y = xx; z = yy; x = zz; break; // rotate CCW
		case 5: z = yy; y = zz; break; // mirror about y = z plane

	}

	if ( ( octant & 0x4 ) === 0 ) x = - x;
	if ( ( octant & 0x2 ) === 0 ) y = - y;
	if ( ( octant & 0x1 ) === 0 ) z = - z;

	target[ offset ] = x;
	target[ offset + 1 ] = y;
	target[ offset + 2 ] = z;

}

// Mesh assembly

function buildMeshGeometry( mesh, records ) {

	const positions = records.positions;

	if ( positions === null ) return null;

	const normals = records.normals;
	const colors = records.colors;
	const uvs = records.uvs;
	const colorSize = records.colorSize;
	const uvSize = records.uvSize;

	const positionArray = [];
	const normalArray = normals !== null ? [] : null;
	const colorArray = colors !== null ? [] : null;
	const uvArray = uvs !== null ? [] : null;
	const indices = [];
	const vertexMap = new Map();
	const keyStride = mesh.attrCounter + 1;

	function getVertex( positionIndex, attributeIndex ) {

		const key = positionIndex * keyStride + attributeIndex + 1;
		let index = vertexMap.get( key );

		if ( index !== undefined ) return index;

		index = positionArray.length / 3;
		vertexMap.set( key, index );

		positionArray.push( positions[ positionIndex * 3 ], positions[ positionIndex * 3 + 1 ], positions[ positionIndex * 3 + 2 ] );

		const a = Math.max( attributeIndex, 0 );

		if ( normalArray !== null ) normalArray.push( normals[ a * 3 ], normals[ a * 3 + 1 ], normals[ a * 3 + 2 ] );

		if ( colorArray !== null ) {

			for ( let i = 0; i < 3; i ++ ) colorArray.push( colors[ a * colorSize + i ] );
			if ( colorSize === 4 ) colorArray.push( colors[ a * colorSize + 3 ] );

		}

		if ( uvArray !== null ) uvArray.push( uvs[ a * uvSize ], uvSize > 1 ? uvs[ a * uvSize + 1 ] : 0 );

		return index;

	}

	const corners = [];

	for ( let face = 0; face < mesh.numFaces; face ++ ) {

		if ( mesh.isCoverFace( face ) ) continue;

		mesh.getFaceCorners( face, corners );

		if ( corners.length < 6 ) continue;

		const first = getVertex( corners[ 0 ], corners[ 1 ] );

		for ( let i = 2; i + 3 < corners.length; i += 2 ) {

			indices.push( first, getVertex( corners[ i ], corners[ i + 1 ] ), getVertex( corners[ i + 2 ], corners[ i + 3 ] ) );

		}

	}

	const geometry = new BufferGeometry();
	geometry.setIndex( indices );
	geometry.setAttribute( 'position', new Float32BufferAttribute( positionArray, 3 ) );

	if ( normalArray !== null ) geometry.setAttribute( 'normal', new Float32BufferAttribute( normalArray, 3 ) );
	if ( colorArray !== null ) geometry.setAttribute( 'color', new Float32BufferAttribute( colorArray, colorSize === 4 ? 4 : 3 ) );
	if ( uvArray !== null ) geometry.setAttribute( 'uv', new Float32BufferAttribute( uvArray, 2 ) );

	if ( normalArray === null ) geometry.computeVertexNormals();

	geometry.userData.jtPrimitive = 'mesh';

	return geometry;

}

// Polygon mesh topology decoder (see JT File Format Reference, Annex D).
//
// The topology is encoded as the dual of the polygon mesh: dual vertices are
// the polygons of the primal mesh, dual faces are the primal vertices.

class MeshDecoder {

	constructor( symbols ) {

		this.symbols = symbols;

		// dual vertices (= primal faces)

		this.vtxValence = [];
		this.vtxFlags = [];
		this.vtxGroup = [];
		this.vtxStart = [];
		this.vtxFaces = [];

		// dual faces (= primal vertices)

		this.faceDegree = [];
		this.faceEmpty = [];
		this.faceAttrCount = [];
		this.faceMask = []; // array of 32 bit words per face
		this.faceStart = [];
		this.faceVtxs = [];
		this.faceAttrStart = [];

		this.activeFaces = [];
		this.removedFaces = [];
		this.attrCounter = 0;

		this.degreeReadPos = new Int32Array( 8 );
		this.maskReadPos = new Int32Array( 8 );
		this.valenceReadPos = 0;
		this.groupReadPos = 0;
		this.flagReadPos = 0;
		this.highDegreeReadPos = 0;
		this.splitFaceReadPos = 0;
		this.splitPosReadPos = 0;

	}

	// Public interface

	get numFaces() {

		return this.vtxValence.length; // primal faces

	}

	isCoverFace( primalFace ) {

		return ( this.vtxFlags[ primalFace ] & 1 ) !== 0;

	}

	// Returns pairs of (vertex coordinate index, vertex attribute index) for the
	// corners of the given primal face.

	getFaceCorners( primalFace, target ) {

		target.length = 0;

		const valence = this.vtxValence[ primalFace ];
		const start = this.vtxStart[ primalFace ];

		for ( let i = 0; i < valence; i ++ ) {

			const dualFace = this.vtxFaces[ start + i ];

			if ( dualFace < 0 ) {

				target.length = 0;
				return;

			}

			const slot = this.findVtxSlot( dualFace, primalFace );
			target.push( dualFace, this.getAttribute( dualFace, slot ) );

		}

	}

	getAttribute( face, slot ) {

		const attrCount = this.faceAttrCount[ face ];

		if ( attrCount === 0 || slot < 0 ) return - 1;

		// The degree ring attribute mask has a bit set for each slot which
		// starts a new attribute. Slots without a bit share the attribute of the
		// preceding (clockwise) slot.

		const mask = this.faceMask[ face ];
		let count = 0;

		for ( let i = 0; i <= slot; i ++ ) {

			if ( ( mask[ i >>> 5 ] >>> ( i & 31 ) ) & 1 ) count ++;

		}

		const index = count === 0 ? attrCount - 1 : count - 1;

		return this.faceAttrStart[ face ] + index;

	}

	// Decoding

	decode() {

		while ( true ) {

			const vtx = this.ioVtx();
			if ( vtx === - 1 ) break;

			const valence = this.vtxValence[ vtx ];

			for ( let i = 0; i < valence; i ++ ) {

				if ( this.activateF( vtx, i ) === - 2 ) throw new Error( 'THREE.JTLoader: Mesh topology decoding failed.' );

			}

			let face;

			while ( ( face = this.nextActiveFace() ) !== - 1 ) {

				this.completeF( face );
				this.removedFaces[ face ] = true;

			}

		}

		return this;

	}

	completeF( face ) {

		let slot;

		while ( ( slot = this.findVtxSlot( face, - 1 ) ) !== - 1 ) {

			const vtx = this.activateV( face, slot );
			if ( vtx < 0 ) throw new Error( 'THREE.JTLoader: Mesh topology decoding failed.' );
			this.completeV( vtx, slot );

		}

	}

	activateF( vtx, vSlot ) {

		let face = this.ioFace( vtx );

		if ( face >= 0 ) {

			this.setVtxFace( vtx, vSlot, face );
			this.setFaceVtx( face, 0, vtx );
			this.activeFaces.push( face );

		} else if ( face === - 1 ) {

			face = this.ioSplitFace();
			const fSlot = this.ioSplitPos();

			if ( face < 0 || fSlot < 0 ) return - 2;

			this.setVtxFace( vtx, vSlot, face );
			this.addVtxToFace( vtx, vSlot, face, fSlot );

		}

		return face;

	}

	activateV( face, vSlot ) {

		const vtx = this.ioVtx();

		if ( vtx < 0 ) return vtx;

		this.setVtxFace( vtx, 0, face );
		this.addVtxToFace( vtx, 0, face, vSlot );

		return vtx;

	}

	completeV( vtx, vSlot ) {

		const valence = this.vtxValence[ vtx ];

		// Walk CCW from face slot 0, linking already reachable faces

		let vp = this.face( vtx, 0 );
		let jp = vSlot;
		let i = 1;
		let vn;

		while ( i < valence && ( vn = this.face( vtx, i ) ) !== - 1 ) {

			jp = decMod( jp, this.faceDegree[ vp ] );
			const vtx2 = this.vtx( vp, jp );
			if ( vtx2 === - 1 ) break;

			let jn = this.findVtxSlot( vn, vtx2 );
			if ( jn < 0 ) throw new Error( 'THREE.JTLoader: Mesh topology decoding failed.' );
			jn = decMod( jn, this.faceDegree[ vn ] );

			this.addVtxToFace( vtx, i, vn, jn );

			vp = vn;
			jp = jn;
			i ++;

			if ( i >= valence ) return;

		}

		// Walk CW from face slot 0

		let last = i;

		vp = this.face( vtx, 0 );
		jp = vSlot;
		i = valence - 1;

		while ( i >= last && ( vn = this.face( vtx, i ) ) !== - 1 ) {

			jp = incMod( jp, this.faceDegree[ vp ] );
			const vtx2 = this.vtx( vp, jp );
			if ( vtx2 === - 1 ) break;

			let jn = this.findVtxSlot( vn, vtx2 );
			if ( jn < 0 ) throw new Error( 'THREE.JTLoader: Mesh topology decoding failed.' );
			jn = incMod( jn, this.faceDegree[ vn ] );

			this.addVtxToFace( vtx, i, vn, jn );

			vp = vn;
			jp = jn;
			i --;

			if ( i < last ) return;

		}

		// Activate the remaining faces

		for ( ; last <= i; last ++ ) {

			if ( this.activateF( vtx, last ) === - 2 ) throw new Error( 'THREE.JTLoader: Mesh topology decoding failed.' );

		}

	}

	addVtxToFace( vtx, fSlot, face, vSlot ) {

		const degree = this.faceDegree[ face ];
		const vSlotCCW = incMod( vSlot, degree );
		const vSlotCW = decMod( vSlot, degree );

		this.setFaceVtx( face, vSlot, vtx );

		const valence = this.vtxValence[ vtx ];

		// connect across the shared edge between vtx and the vertex CW from vtx at face

		const fp = this.vtx( face, vSlotCW );

		if ( fp !== - 1 ) {

			let ip = this.findFaceSlot( fp, face );
			const slot = incMod( fSlot, valence );

			if ( this.face( vtx, slot ) === - 1 ) {

				ip = decMod( ip, this.vtxValence[ fp ] );
				this.setVtxFace( vtx, slot, this.face( fp, ip ) );

			}

		}

		// connect across the shared edge between vtx and the vertex CCW from vtx at face

		const fn = this.vtx( face, vSlotCCW );

		if ( fn !== - 1 ) {

			let iN = this.findFaceSlot( fn, face );
			const slot = decMod( fSlot, valence );

			if ( this.face( vtx, slot ) === - 1 ) {

				iN = incMod( iN, this.vtxValence[ fn ] );
				this.setVtxFace( vtx, slot, this.face( fn, iN ) );

			}

		}

	}

	nextActiveFace() {

		const activeFaces = this.activeFaces;
		const removed = this.removedFaces;

		while ( activeFaces.length > 0 && removed[ activeFaces[ activeFaces.length - 1 ] ] === true ) activeFaces.pop();

		let lowestEmpty = Infinity;
		let result = - 1;

		for ( let i = activeFaces.length - 1; i >= Math.max( 0, activeFaces.length - 16 ); i -- ) {

			const face = activeFaces[ i ];

			if ( removed[ face ] === true ) {

				activeFaces.splice( i, 1 );
				continue;

			}

			const empty = this.faceEmpty[ face ];

			if ( empty < lowestEmpty ) {

				lowestEmpty = empty;
				result = face;

			}

		}

		return result;

	}

	// Mesh accessors

	face( vtx, slot ) {

		return this.vtxFaces[ this.vtxStart[ vtx ] + slot ];

	}

	vtx( face, slot ) {

		return this.faceVtxs[ this.faceStart[ face ] + slot ];

	}

	setVtxFace( vtx, slot, face ) {

		this.vtxFaces[ this.vtxStart[ vtx ] + slot ] = face;

	}

	setFaceVtx( face, slot, vtx ) {

		const index = this.faceStart[ face ] + slot;

		if ( this.faceVtxs[ index ] !== vtx ) this.faceEmpty[ face ] --;

		this.faceVtxs[ index ] = vtx;

	}

	findVtxSlot( face, vtx ) {

		const start = this.faceStart[ face ];
		const degree = this.faceDegree[ face ];

		for ( let i = 0; i < degree; i ++ ) {

			if ( this.faceVtxs[ start + i ] === vtx ) return i;

		}

		return - 1;

	}

	findFaceSlot( vtx, face ) {

		const start = this.vtxStart[ vtx ];
		const valence = this.vtxValence[ vtx ];

		for ( let i = 0; i < valence; i ++ ) {

			if ( this.vtxFaces[ start + i ] === face ) return i;

		}

		return - 1;

	}

	isValidFace( face ) {

		return face >= 0 && face < this.faceDegree.length && this.faceDegree[ face ] !== 0;

	}

	faceContext( vtx ) {

		const valence = this.vtxValence[ vtx ];
		let knownFaces = 0;
		let knownDegree = 0;

		for ( let i = 0; i < valence; i ++ ) {

			const face = this.face( vtx, i );
			if ( this.isValidFace( face ) === false ) continue;

			knownFaces ++;
			knownDegree += this.faceDegree[ face ];

		}

		if ( valence === 3 ) {

			return ( knownDegree < knownFaces * 6 ) ? 0 : ( knownDegree === knownFaces * 6 ) ? 1 : 2;

		} else if ( valence === 4 ) {

			return ( knownDegree < knownFaces * 4 ) ? 3 : ( knownDegree === knownFaces * 4 ) ? 4 : 5;

		} else if ( valence === 5 ) {

			return 6;

		}

		return 7;

	}

	// Symbol I/O

	ioVtx() {

		const symbols = this.symbols;

		if ( this.valenceReadPos >= symbols.valenceSymbols.length ) return - 1;

		const valence = symbols.valenceSymbols[ this.valenceReadPos ++ ];
		const vtx = this.vtxValence.length;

		this.vtxValence.push( valence );
		this.vtxGroup.push( this.groupReadPos < symbols.groupSymbols.length ? symbols.groupSymbols[ this.groupReadPos ++ ] : - 1 );
		this.vtxFlags.push( this.flagReadPos < symbols.flagSymbols.length ? symbols.flagSymbols[ this.flagReadPos ++ ] : 0 );
		this.vtxStart.push( this.vtxFaces.length );

		for ( let i = 0; i < valence; i ++ ) this.vtxFaces.push( - 1 );

		return vtx;

	}

	ioFace( vtx ) {

		const symbols = this.symbols;
		const context = this.faceContext( vtx );
		const degreeSymbols = symbols.degreeSymbols[ context ];

		if ( this.degreeReadPos[ context ] >= degreeSymbols.length ) return - 2;

		const degree = degreeSymbols[ this.degreeReadPos[ context ] ++ ];

		if ( degree === 0 ) return - 1; // split face

		if ( degree < 0 ) return - 2;

		const face = this.faceDegree.length;
		const words = new Uint32Array( Math.max( 2, Math.ceil( degree / 32 ) ) );

		if ( degree <= 64 ) {

			const maskContext = Math.min( 7, Math.max( 0, degree - 2 ) );
			const pos = this.maskReadPos[ maskContext ] ++;
			const masks = symbols.attributeMasks[ maskContext ];

			words[ 0 ] = pos < masks.length ? masks[ pos ] : 0;
			if ( maskContext === 7 && pos < symbols.attributeMasksMSB.length ) words[ 1 ] = symbols.attributeMasksMSB[ pos ];

		} else {

			const nWords = Math.ceil( degree / 32 );

			for ( let i = 0; i < nWords; i ++ ) {

				const pos = this.highDegreeReadPos ++;
				words[ i ] = pos < symbols.highDegreeMasks.length ? symbols.highDegreeMasks[ pos ] : 0;

			}

		}

		let attrCount = 0;

		for ( let i = 0; i < degree; i ++ ) {

			if ( ( words[ i >>> 5 ] >>> ( i & 31 ) ) & 1 ) attrCount ++;

		}

		this.faceDegree.push( degree );
		this.faceEmpty.push( degree );
		this.faceAttrCount.push( attrCount );
		this.faceMask.push( words );
		this.faceStart.push( this.faceVtxs.length );
		this.faceAttrStart.push( this.attrCounter );

		for ( let i = 0; i < degree; i ++ ) this.faceVtxs.push( - 1 );

		this.attrCounter += attrCount;

		return face;

	}

	ioSplitFace() {

		const symbols = this.symbols.splitFaceSymbols;

		if ( this.splitFaceReadPos >= symbols.length ) return - 2;

		const offset = symbols[ this.splitFaceReadPos ++ ];
		const length = this.activeFaces.length;

		if ( offset <= 0 || offset > length ) return - 2;

		return this.activeFaces[ length - offset ];

	}

	ioSplitPos() {

		const symbols = this.symbols.splitPositionSymbols;

		if ( this.splitPosReadPos >= symbols.length ) return - 2;

		return symbols[ this.splitPosReadPos ++ ];

	}

}

function incMod( value, n ) {

	value ++;
	return value >= n ? value - n : value;

}

function decMod( value, n ) {

	value --;
	return value < 0 ? value + n : value;

}

// Int32 Compressed Data Packet (see JT File Format Reference, 12.1.1)

function readInt32CDP( reader, predictor ) {

	const values = decodeInt32CDP( reader, 0 );

	if ( predictor !== PREDICTOR_NULL ) unpackResiduals( values, predictor );

	return values;

}

function unpackResiduals( values, predictor ) {

	// The first four values are primers.

	for ( let i = 4; i < values.length; i ++ ) {

		if ( predictor === PREDICTOR_XOR1 ) {

			values[ i ] = values[ i ] ^ values[ i - 1 ];

		} else {

			values[ i ] = ( values[ i ] + values[ i - 1 ] ) | 0;

		}

	}

}

function decodeInt32CDP( reader, depth ) {

	if ( depth > 16 ) throw new Error( 'THREE.JTLoader: Int32CDP recursion too deep.' );

	const count = reader.i32();

	if ( count <= 0 ) return new Int32Array( 0 );

	const codec = reader.u8();

	switch ( codec ) {

		case 0: // Null
		case 1: // Bitlength
		case 3: { // Arithmetic

			const bitCount = reader.i32();
			const wordCount = Math.ceil( bitCount / 32 );
			const words = new Uint32Array( wordCount );

			for ( let i = 0; i < wordCount; i ++ ) words[ i ] = reader.u32();

			const bits = new CodeTextReader( words, bitCount );

			if ( codec === 0 ) {

				const values = new Int32Array( count );
				for ( let i = 0; i < count; i ++ ) values[ i ] = bits.readUnsigned( 32 );
				return values;

			}

			if ( codec === 1 ) return decodeBitlength( bits, count );

			const context = readProbabilityContext( reader );
			const oob = context.hasEscape ? decodeInt32CDP( reader, depth + 1 ) : new Int32Array( 0 );

			if ( bitCount === 0 ) return oob;

			return decodeArithmetic( bits, count, context, oob );

		}

		case 4: { // Chopper

			const chopBits = reader.u8();
			const bias = reader.i32();
			const spanBits = reader.u8();

			const msb = decodeInt32CDP( reader, depth + 1 );
			const lsb = decodeInt32CDP( reader, depth + 1 );

			const values = new Int32Array( count );
			const shift = spanBits - chopBits;

			for ( let i = 0; i < count; i ++ ) {

				const high = shift < 32 ? ( msb[ i ] << shift ) : 0;
				values[ i ] = ( ( lsb[ i ] | high ) + bias ) | 0;

			}

			return values;

		}

		case 5: { // Move-to-front

			const windowValues = decodeInt32CDP( reader, depth + 1 );
			const windowOffsets = decodeInt32CDP( reader, depth + 1 );

			const values = new Int32Array( count );
			const window = [];
			let next = 0;

			for ( let i = 0; i < count; i ++ ) {

				const offset = windowOffsets[ i ];
				let value;

				if ( offset < 0 || offset >= window.length ) {

					value = windowValues[ next ++ ];

				} else {

					value = window[ offset ];
					window.splice( offset, 1 );

				}

				window.unshift( value );
				if ( window.length > 16 ) window.pop();

				values[ i ] = value;

			}

			return values;

		}

		default:
			throw new Error( 'THREE.JTLoader: Unsupported Int32CDP codec ' + codec + '.' );

	}

}

class CodeTextReader {

	constructor( words, bitCount ) {

		this.words = words;
		this.bitCount = bitCount;
		this.position = 0;

	}

	readBit() {

		const position = this.position ++;

		if ( position >= this.bitCount ) return 0;

		return ( this.words[ position >>> 5 ] >>> ( 31 - ( position & 31 ) ) ) & 1;

	}

	readUnsigned( n ) {

		let value = 0;

		for ( let i = 0; i < n; i ++ ) value = ( value * 2 ) + this.readBit();

		return value >>> 0;

	}

	readSigned( n ) {

		if ( n === 0 ) return 0;

		const value = this.readUnsigned( n );

		return n >= 32 ? value | 0 : ( value << ( 32 - n ) ) >> ( 32 - n );

	}

	readNibbled() {

		let value = 0;
		let nibbles = 0;
		let more;

		do {

			const nibble = this.readUnsigned( 4 );
			if ( nibbles < 8 ) value |= nibble << ( nibbles * 4 );
			more = this.readBit();
			nibbles ++;

		} while ( more );

		const bits = nibbles * 4;

		return bits < 32 ? ( value << ( 32 - bits ) ) >> ( 32 - bits ) : value | 0;

	}

}

function decodeBitlength( bits, count ) {

	const values = new Int32Array( count );

	if ( bits.readBit() === 0 ) {

		// fixed width

		const min = bits.readNibbled();
		const max = bits.readNibbled();
		const span = ( max - min ) >>> 0;
		const width = span === 0 ? 0 : 32 - Math.clz32( span );

		for ( let i = 0; i < count; i ++ ) values[ i ] = ( bits.readUnsigned( width ) + min ) | 0;

	} else {

		// variable width

		const mean = bits.readNibbled();
		const blockValueBits = 4;
		const blockLengthBits = 4;
		const maxDecrement = - ( 1 << ( blockValueBits - 1 ) );
		const maxIncrement = ( 1 << ( blockValueBits - 1 ) ) - 1;

		let width = 0;
		let index = 0;

		while ( index < count ) {

			let delta;

			do {

				delta = bits.readSigned( blockValueBits );
				width += delta;

			} while ( delta === maxDecrement || delta === maxIncrement );

			if ( width < 0 || width > 32 || bits.position > bits.bitCount ) throw new Error( 'THREE.JTLoader: Corrupt bitlength data.' );

			const runLength = bits.readUnsigned( blockLengthBits );

			for ( let k = 0; k < runLength && index < count; k ++ ) {

				values[ index ++ ] = ( bits.readSigned( width ) + mean ) | 0;

			}

		}

	}

	return values;

}

// Probability contexts are stored as a byte aligned, MSB first bit stream.

function readProbabilityContext( reader ) {

	const bytes = reader.bytes;
	const start = reader.offset;
	let position = 0;

	function readBits( n ) {

		let value = 0;

		for ( let i = 0; i < n; i ++ ) {

			const byte = bytes[ start + ( position >>> 3 ) ];
			value = value * 2 + ( ( byte >>> ( 7 - ( position & 7 ) ) ) & 1 );
			position ++;

		}

		return value;

	}

	const entryCount = readBits( 16 );
	const occurrenceBits = readBits( 6 );
	const valueBits = readBits( 7 );
	const minValue = readBits( 32 ) | 0;

	const entries = [];
	let total = 0;
	let hasEscape = false;

	for ( let i = 0; i < entryCount; i ++ ) {

		const isEscape = readBits( 1 ) === 1;
		const occurrences = readBits( occurrenceBits );
		const value = ( readBits( valueBits ) + minValue ) | 0;

		entries.push( { isEscape: isEscape, count: occurrences, cumCount: total, value: value } );

		total += occurrences;
		if ( isEscape ) hasEscape = true;

	}

	reader.offset = start + Math.ceil( position / 8 );

	return { entries: entries, total: total, hasEscape: hasEscape };

}

function decodeArithmetic( bits, count, context, oob ) {

	const values = new Int32Array( count );
	const entries = context.entries;
	const total = context.total;

	let code = bits.readUnsigned( 16 );
	let low = 0;
	let high = 0xFFFF;
	let oobIndex = 0;

	for ( let i = 0; i < count; i ++ ) {

		const rescaled = Math.floor( ( ( code - low + 1 ) * total - 1 ) / ( high - low + 1 ) );

		// find the symbol whose cumulative count range contains the rescaled code

		let entry = null;

		for ( let j = 0; j < entries.length; j ++ ) {

			const e = entries[ j ];

			if ( rescaled < e.cumCount + e.count ) {

				entry = e;
				break;

			}

		}

		if ( entry === null ) throw new Error( 'THREE.JTLoader: Corrupt arithmetic coded data.' );

		values[ i ] = entry.isEscape ? oob[ oobIndex ++ ] : entry.value;

		// remove the symbol from the stream

		const range = high - low + 1;
		high = low + Math.floor( ( range * ( entry.cumCount + entry.count ) ) / total ) - 1;
		low = low + Math.floor( ( range * entry.cumCount ) / total );

		while ( true ) {

			if ( ( ( high ^ low ) & 0x8000 ) === 0 ) {

				// most significant bits match, shift them out

			} else if ( ( low & 0x4000 ) && ( high & 0x4000 ) === 0 ) {

				// underflow

				code ^= 0x4000;
				low &= 0x3FFF;
				high |= 0x4000;

			} else {

				break;

			}

			low = ( low << 1 ) & 0xFFFF;
			high = ( ( high << 1 ) | 1 ) & 0xFFFF;
			code = ( ( code << 1 ) | bits.readBit() ) & 0xFFFF;

		}

	}

	return values;

}

// XZ / LZMA2 decoder (used for compressed JT segments)

function decodeXZ( bytes ) {

	if ( bytes[ 0 ] !== 0xFD || bytes[ 1 ] !== 0x37 || bytes[ 2 ] !== 0x7A || bytes[ 3 ] !== 0x58 || bytes[ 4 ] !== 0x5A || bytes[ 5 ] !== 0x00 ) {

		throw new Error( 'THREE.JTLoader: Invalid XZ stream.' );

	}

	const checkType = bytes[ 7 ] & 0x0F;
	const checkSize = checkType === 0 ? 0 : 4 << Math.floor( ( checkType - 1 ) / 3 );

	const out = new ByteBuffer( bytes.length * 4 );
	let p = 12;

	while ( p < bytes.length ) {

		const headerSizeByte = bytes[ p ];

		if ( headerSizeByte === 0 ) break; // index

		const headerSize = ( headerSizeByte + 1 ) * 4;
		const flags = bytes[ p + 1 ];
		const filterCount = ( flags & 0x03 ) + 1;
		let q = p + 2;

		const readVLI = function () {

			let value = 0, multiplier = 1, b;

			do {

				b = bytes[ q ++ ];
				value += ( b & 0x7F ) * multiplier;
				multiplier *= 128;

			} while ( b & 0x80 );

			return value;

		};

		if ( flags & 0x40 ) readVLI(); // compressed size
		if ( flags & 0x80 ) readVLI(); // uncompressed size

		for ( let i = 0; i < filterCount; i ++ ) {

			const id = readVLI();
			const propertiesSize = readVLI();

			if ( id !== 0x21 ) throw new Error( 'THREE.JTLoader: Unsupported XZ filter 0x' + id.toString( 16 ) + '.' );

			q += propertiesSize;

		}

		p += headerSize;

		const blockStart = p;
		p = decodeLZMA2( bytes, p, out );

		while ( ( p - blockStart ) % 4 !== 0 ) p ++; // block padding

		p += checkSize;

	}

	return out.result();

}

class ByteBuffer {

	constructor( size ) {

		this.data = new Uint8Array( Math.max( size, 1024 ) );
		this.length = 0;

	}

	ensure( extra ) {

		const required = this.length + extra;

		if ( required > this.data.length ) {

			const data = new Uint8Array( Math.max( required, this.data.length * 2 ) );
			data.set( this.data.subarray( 0, this.length ) );
			this.data = data;

		}

	}

	result() {

		return this.data.slice( 0, this.length );

	}

}

function decodeLZMA2( bytes, p, out ) {

	const lzma = new LZMADecoder( out );
	let hasProperties = false;

	while ( true ) {

		const control = bytes[ p ++ ];

		if ( control === 0x00 ) break;

		if ( control === 0x01 || control === 0x02 ) {

			// uncompressed chunk

			if ( control === 0x01 ) lzma.dictionaryStart = out.length;

			const size = ( ( bytes[ p ] << 8 ) | bytes[ p + 1 ] ) + 1;
			p += 2;

			out.ensure( size );
			out.data.set( bytes.subarray( p, p + size ), out.length );
			out.length += size;
			p += size;

			continue;

		}

		if ( control < 0x80 ) throw new Error( 'THREE.JTLoader: Invalid LZMA2 data.' );

		const unpackedSize = ( ( control & 0x1F ) << 16 ) + ( bytes[ p ] << 8 ) + bytes[ p + 1 ] + 1;
		const packedSize = ( ( bytes[ p + 2 ] << 8 ) | bytes[ p + 3 ] ) + 1;
		p += 4;

		const reset = ( control >> 5 ) & 0x03;

		if ( reset === 3 ) lzma.dictionaryStart = out.length;

		if ( reset >= 2 ) {

			lzma.setProperties( bytes[ p ++ ] );
			hasProperties = true;

		} else if ( hasProperties === false ) {

			throw new Error( 'THREE.JTLoader: Invalid LZMA2 data.' );

		}

		if ( reset >= 1 ) lzma.resetState();

		lzma.decode( bytes, p, unpackedSize );
		p += packedSize;

	}

	return p;

}

function createProbabilities( size ) {

	return new Uint16Array( size ).fill( 1024 );

}

class LZMADecoder {

	constructor( out ) {

		this.out = out;
		this.dictionaryStart = 0;

		this.lc = 0;
		this.lp = 0;
		this.pb = 0;

	}

	setProperties( properties ) {

		this.lc = properties % 9;
		properties = Math.floor( properties / 9 );
		this.lp = properties % 5;
		this.pb = Math.floor( properties / 5 );

	}

	resetState() {

		this.literalProbabilities = createProbabilities( 0x300 << ( this.lc + this.lp ) );
		this.isMatch = createProbabilities( 12 << 4 );
		this.isRep = createProbabilities( 12 );
		this.isRepG0 = createProbabilities( 12 );
		this.isRepG1 = createProbabilities( 12 );
		this.isRepG2 = createProbabilities( 12 );
		this.isRep0Long = createProbabilities( 12 << 4 );
		this.posSlot = createProbabilities( 4 << 6 );
		this.posDecoders = createProbabilities( 115 );
		this.align = createProbabilities( 16 );
		this.lenDecoder = new LZMALengthDecoder();
		this.repLenDecoder = new LZMALengthDecoder();

		this.state = 0;
		this.rep0 = 0;
		this.rep1 = 0;
		this.rep2 = 0;
		this.rep3 = 0;

	}

	decode( bytes, p, unpackedSize ) {

		const out = this.out;
		out.ensure( unpackedSize );

		const rc = new RangeDecoder( bytes, p );
		const data = out.data;
		const end = out.length + unpackedSize;
		const pbMask = ( 1 << this.pb ) - 1;
		const lpMask = ( 1 << this.lp ) - 1;
		const lc = this.lc;
		const literalProbabilities = this.literalProbabilities;

		let pos = out.length;
		let state = this.state;
		let rep0 = this.rep0, rep1 = this.rep1, rep2 = this.rep2, rep3 = this.rep3;

		while ( pos < end ) {

			const dictionaryPos = pos - this.dictionaryStart;
			const posState = dictionaryPos & pbMask;

			if ( rc.decodeBit( this.isMatch, ( state << 4 ) + posState ) === 0 ) {

				// literal

				const prevByte = dictionaryPos > 0 ? data[ pos - 1 ] : 0;
				const base = 0x300 * ( ( ( dictionaryPos & lpMask ) << lc ) + ( prevByte >> ( 8 - lc ) ) );
				let symbol = 1;

				if ( state >= 7 ) {

					let matchByte = data[ pos - rep0 - 1 ];

					do {

						const matchBit = ( matchByte >> 7 ) & 1;
						matchByte <<= 1;
						const bit = rc.decodeBit( literalProbabilities, base + ( ( 1 + matchBit ) << 8 ) + symbol );
						symbol = ( symbol << 1 ) | bit;
						if ( matchBit !== bit ) break;

					} while ( symbol < 0x100 );

				}

				while ( symbol < 0x100 ) symbol = ( symbol << 1 ) | rc.decodeBit( literalProbabilities, base + symbol );

				data[ pos ++ ] = symbol & 0xFF;
				state = state < 4 ? 0 : ( state < 10 ? state - 3 : state - 6 );

				continue;

			}

			let length;

			if ( rc.decodeBit( this.isRep, state ) !== 0 ) {

				if ( rc.decodeBit( this.isRepG0, state ) === 0 ) {

					if ( rc.decodeBit( this.isRep0Long, ( state << 4 ) + posState ) === 0 ) {

						// short rep

						state = state < 7 ? 9 : 11;
						data[ pos ] = data[ pos - rep0 - 1 ];
						pos ++;
						continue;

					}

				} else {

					let distance;

					if ( rc.decodeBit( this.isRepG1, state ) === 0 ) {

						distance = rep1;

					} else {

						if ( rc.decodeBit( this.isRepG2, state ) === 0 ) {

							distance = rep2;

						} else {

							distance = rep3;
							rep3 = rep2;

						}

						rep2 = rep1;

					}

					rep1 = rep0;
					rep0 = distance;

				}

				length = this.repLenDecoder.decode( rc, posState );
				state = state < 7 ? 8 : 11;

			} else {

				rep3 = rep2;
				rep2 = rep1;
				rep1 = rep0;

				length = this.lenDecoder.decode( rc, posState );
				state = state < 7 ? 7 : 10;
				rep0 = this.decodeDistance( rc, length );

				if ( rep0 === 0xFFFFFFFF ) break; // end marker

			}

			length += 2;

			for ( let i = 0; i < length && pos < end; i ++ ) {

				data[ pos ] = data[ pos - rep0 - 1 ];
				pos ++;

			}

		}

		out.length = pos;

		this.state = state;
		this.rep0 = rep0;
		this.rep1 = rep1;
		this.rep2 = rep2;
		this.rep3 = rep3;

	}

	decodeDistance( rc, length ) {

		const lengthState = length > 3 ? 3 : length;
		const posSlot = rc.bitTree( this.posSlot, lengthState << 6, 6 );

		if ( posSlot < 4 ) return posSlot;

		const directBits = ( posSlot >> 1 ) - 1;
		let distance = ( 2 | ( posSlot & 1 ) ) * Math.pow( 2, directBits );

		if ( posSlot < 14 ) {

			distance += rc.bitTreeReverse( this.posDecoders, distance - posSlot, directBits );

		} else {

			distance += rc.directBits( directBits - 4 ) * 16;
			distance += rc.bitTreeReverse( this.align, 0, 4 );

		}

		return distance >>> 0;

	}

}

class LZMALengthDecoder {

	constructor() {

		this.choice = createProbabilities( 2 );
		this.low = createProbabilities( 16 << 3 );
		this.mid = createProbabilities( 16 << 3 );
		this.high = createProbabilities( 256 );

	}

	decode( rc, posState ) {

		if ( rc.decodeBit( this.choice, 0 ) === 0 ) return rc.bitTree( this.low, posState << 3, 3 );
		if ( rc.decodeBit( this.choice, 1 ) === 0 ) return 8 + rc.bitTree( this.mid, posState << 3, 3 );
		return 16 + rc.bitTree( this.high, 0, 8 );

	}

}

class RangeDecoder {

	constructor( bytes, p ) {

		this.bytes = bytes;
		this.p = p + 1; // the first byte is always zero
		this.range = 0xFFFFFFFF;
		this.code = 0;

		for ( let i = 0; i < 4; i ++ ) this.code = ( ( this.code << 8 ) | bytes[ this.p ++ ] ) >>> 0;

	}

	normalize() {

		if ( this.range < 0x1000000 ) {

			this.range = ( this.range << 8 ) >>> 0;
			this.code = ( ( this.code << 8 ) | this.bytes[ this.p ++ ] ) >>> 0;

		}

	}

	decodeBit( probabilities, index ) {

		const probability = probabilities[ index ];
		const bound = ( this.range >>> 11 ) * probability;
		let bit;

		if ( this.code < bound ) {

			this.range = bound;
			probabilities[ index ] = probability + ( ( 2048 - probability ) >> 5 );
			bit = 0;

		} else {

			this.range -= bound;
			this.code -= bound;
			probabilities[ index ] = probability - ( probability >> 5 );
			bit = 1;

		}

		this.normalize();

		return bit;

	}

	directBits( count ) {

		let result = 0;

		for ( let i = 0; i < count; i ++ ) {

			this.range >>>= 1;
			let bit = 0;

			if ( this.code >= this.range ) {

				this.code -= this.range;
				bit = 1;

			}

			result = result * 2 + bit;
			this.normalize();

		}

		return result;

	}

	bitTree( probabilities, offset, count ) {

		let m = 1;

		for ( let i = 0; i < count; i ++ ) m = ( m << 1 ) + this.decodeBit( probabilities, offset + m );

		return m - ( 1 << count );

	}

	bitTreeReverse( probabilities, offset, count ) {

		let m = 1;
		let symbol = 0;

		for ( let i = 0; i < count; i ++ ) {

			const bit = this.decodeBit( probabilities, offset + m );
			m = ( m << 1 ) + bit;
			symbol |= bit << i;

		}

		return symbol;

	}

}

export { JTLoader };
