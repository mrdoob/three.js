import {
	Box3,
	Data3DTexture,
	DataUtils,
	FileLoader,
	FloatType,
	LinearFilter,
	Loader,
	Matrix4,
	RedFormat
} from 'three';
import { unzlibSync } from '../libs/fflate.module.js';

const MAGIC = 0x56444220;

const FILE_VERSION_NODE_MASK_COMPRESSION = 222;

const COMPRESS_ZIP = 0x1;
const COMPRESS_ACTIVE_MASK = 0x2;
const COMPRESS_BLOSC = 0x4;

const NO_MASK_OR_INACTIVE_VALS = 0;
const NO_MASK_AND_ONE_INACTIVE_VAL = 2;
const MASK_AND_NO_INACTIVE_VALS = 3;
const MASK_AND_ONE_INACTIVE_VAL = 4;
const MASK_AND_TWO_INACTIVE_VALS = 5;
const NO_MASK_AND_ALL_VALS = 6;

const HALF_FLOAT_SUFFIX = '_HalfFloat';
const VALUE_SIZES = { half: 2, float: 4, double: 8 };

const MAX_DENSE_VOXELS = 1 << 28;

/**
 * A loader for the [OpenVDB](https://www.openvdb.org/) format.
 *
 * Scalar grids (`float`, `double` and `half`) are converted into dense
 * {@link Data3DTexture} objects covering the active voxels of each grid.
 * Uncompressed and zip compressed files are supported.
 *
 * ```js
 * const loader = new VDBLoader();
 * const grids = await loader.loadAsync( 'models/vdb/cloud.vdb' );
 *
 * const texture = grids[ 0 ].texture;
 * ```
 *
 * @augments Loader
 * @three_import import { VDBLoader } from 'three/addons/loaders/VDBLoader.js';
 */
class VDBLoader extends Loader {

	/**
	 * Starts loading from the given URL and passes the loaded grids
	 * to the `onLoad()` callback.
	 *
	 * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	 * @param {function(Array<VDBLoader~Grid>)} onLoad - Executed when the loading process has been finished.
	 * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 */
	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( scope.requestHeader );
		loader.setWithCredentials( scope.withCredentials );
		loader.load( url, function ( buffer ) {

			try {

				onLoad( scope.parse( buffer ) );

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
	 * Parses the given OpenVDB data and returns the scalar grids it contains.
	 *
	 * @param {ArrayBuffer} buffer - The raw OpenVDB data as an array buffer.
	 * @return {Array<VDBLoader~Grid>} The parsed grids.
	 */
	parse( buffer ) {

		const reader = new Reader( buffer );

		if ( reader.int64() !== MAGIC ) {

			throw new Error( 'THREE.VDBLoader: Not a VDB file.' );

		}

		const fileVersion = reader.uint32();

		if ( fileVersion < FILE_VERSION_NODE_MASK_COMPRESSION ) {

			throw new Error( 'THREE.VDBLoader: Unsupported file version ' + fileVersion + '.' );

		}

		reader.skip( 8 ); // library version

		if ( reader.uint8() === 0 ) {

			throw new Error( 'THREE.VDBLoader: Files without grid offsets are not supported.' );

		}

		reader.skip( 36 ); // uuid

		readMetadata( reader );

		const descriptors = [];
		const gridCount = reader.int32();

		for ( let i = 0; i < gridCount; i ++ ) {

			const descriptor = {
				name: reader.string().split( '\x1e' )[ 0 ],
				type: reader.string(),
				instanceParent: reader.string(),
				gridPos: reader.int64(),
				blockPos: reader.int64(),
				endPos: reader.int64()
			};

			descriptors.push( descriptor );

			reader.offset = descriptor.endPos;

		}

		const grids = [];

		for ( const descriptor of descriptors ) {

			let type = descriptor.type;
			let saveFloatAsHalf = false;

			if ( type.endsWith( HALF_FLOAT_SUFFIX ) ) {

				type = type.slice( 0, - HALF_FLOAT_SUFFIX.length );
				saveFloatAsHalf = true;

			}

			const match = /^Tree_(float|double|half)_5_4_3$/.exec( type );

			if ( match === null || descriptor.instanceParent !== '' ) {

				console.warn( 'THREE.VDBLoader: Skipping unsupported grid "' + descriptor.name + '" of type ' + descriptor.type + '.' );
				continue;

			}

			reader.offset = descriptor.gridPos;

			grids.push( readGrid( reader, descriptor.name, match[ 1 ], saveFloatAsHalf ) );

		}

		return grids;

	}

}

class Reader {

	constructor( buffer ) {

		this.buffer = buffer;
		this.view = new DataView( buffer );
		this.offset = 0;

	}

	skip( n ) {

		this.offset += n;

	}

	uint8() {

		return this.view.getUint8( this.offset ++ );

	}

	int32() {

		const value = this.view.getInt32( this.offset, true );
		this.offset += 4;
		return value;

	}

	uint32() {

		const value = this.view.getUint32( this.offset, true );
		this.offset += 4;
		return value;

	}

	int64() {

		const value = Number( this.view.getBigInt64( this.offset, true ) );
		this.offset += 8;
		return value;

	}

	float64() {

		const value = this.view.getFloat64( this.offset, true );
		this.offset += 8;
		return value;

	}

	bytes( n ) {

		const value = new Uint8Array( this.buffer, this.offset, n );
		this.offset += n;
		return value;

	}

	string() {

		const length = this.uint32();
		return new TextDecoder().decode( this.bytes( length ) );

	}

	mask( size ) {

		return this.bytes( size >> 3 ).slice();

	}

}

function readMetadata( reader ) {

	const metadata = {};
	const count = reader.uint32();

	for ( let i = 0; i < count; i ++ ) {

		const name = reader.string();
		const type = reader.string();
		const size = reader.uint32();
		const view = new DataView( reader.buffer, reader.offset, size );

		switch ( type ) {

			case 'string': metadata[ name ] = new TextDecoder().decode( reader.bytes( size ) ); break;
			case 'bool': metadata[ name ] = view.getUint8( 0 ) !== 0; break;
			case 'int32': metadata[ name ] = view.getInt32( 0, true ); break;
			case 'int64': metadata[ name ] = Number( view.getBigInt64( 0, true ) ); break;
			case 'float': metadata[ name ] = view.getFloat32( 0, true ); break;
			case 'double': metadata[ name ] = view.getFloat64( 0, true ); break;
			case 'vec3i': metadata[ name ] = [ view.getInt32( 0, true ), view.getInt32( 4, true ), view.getInt32( 8, true ) ]; break;
			case 'vec3s': metadata[ name ] = [ view.getFloat32( 0, true ), view.getFloat32( 4, true ), view.getFloat32( 8, true ) ]; break;
			case 'vec3d': metadata[ name ] = [ view.getFloat64( 0, true ), view.getFloat64( 8, true ), view.getFloat64( 16, true ) ]; break;

		}

		reader.offset = view.byteOffset + size;

	}

	return metadata;

}

function readTransform( reader ) {

	const type = reader.string();
	const vec3 = () => [ reader.float64(), reader.float64(), reader.float64() ];
	const matrix = new Matrix4();

	switch ( type ) {

		case 'TranslationMap': {

			const t = vec3();
			matrix.makeTranslation( t[ 0 ], t[ 1 ], t[ 2 ] );
			break;

		}

		case 'ScaleMap':
		case 'UniformScaleMap': {

			const s = vec3();
			reader.skip( 4 * 24 );
			matrix.makeScale( s[ 0 ], s[ 1 ], s[ 2 ] );
			break;

		}

		case 'ScaleTranslateMap':
		case 'UniformScaleTranslateMap': {

			const t = vec3();
			const s = vec3();
			reader.skip( 4 * 24 );
			matrix.makeScale( s[ 0 ], s[ 1 ], s[ 2 ] ).setPosition( t[ 0 ], t[ 1 ], t[ 2 ] );
			break;

		}

		case 'AffineMap':
		case 'UnitaryMap': {

			const elements = [];
			for ( let i = 0; i < 16; i ++ ) elements.push( reader.float64() );
			matrix.fromArray( elements );
			break;

		}

		default:
			throw new Error( 'THREE.VDBLoader: Unsupported transform ' + type + '.' );

	}

	return matrix;

}

function readGrid( reader, name, valueType, saveFloatAsHalf ) {

	const grid = {
		name,
		compression: reader.uint32(),
		metadata: readMetadata( reader ),
		transform: readTransform( reader ),
		valueType,
		saveFloatAsHalf
	};

	if ( grid.compression & COMPRESS_BLOSC ) {

		throw new Error( 'THREE.VDBLoader: Blosc compression is not supported.' );

	}

	reader.skip( 4 ); // buffer count

	grid.background = readValue( reader, valueType );

	const tileCount = reader.uint32();
	const childCount = reader.uint32();

	const tiles = [];
	const children = [];

	for ( let i = 0; i < tileCount; i ++ ) {

		const origin = [ reader.int32(), reader.int32(), reader.int32() ];
		const value = readValue( reader, valueType );
		const active = reader.uint8() !== 0;
		tiles.push( { origin, value, active } );

	}

	for ( let i = 0; i < childCount; i ++ ) {

		const origin = [ reader.int32(), reader.int32(), reader.int32() ];
		children.push( readInternalTopology( reader, grid, origin, 5, 7 ) );

	}

	for ( const child of children ) readInternalBuffers( reader, grid, child );

	const bounds = [ Infinity, Infinity, Infinity, - Infinity, - Infinity, - Infinity ];

	for ( const tile of tiles ) {

		if ( tile.active ) expandByCube( bounds, tile.origin, 1 << 12 );

	}

	for ( const child of children ) expandByNode( bounds, child );

	const bbox = new Box3();

	const result = {
		name,
		type: valueType,
		metadata: grid.metadata,
		transform: grid.transform,
		background: grid.background,
		bbox,
		texture: null
	};

	if ( bounds[ 0 ] > bounds[ 3 ] ) return result;

	bbox.min.fromArray( bounds, 0 );
	bbox.max.fromArray( bounds, 3 );

	const width = bounds[ 3 ] - bounds[ 0 ] + 1;
	const height = bounds[ 4 ] - bounds[ 1 ] + 1;
	const depth = bounds[ 5 ] - bounds[ 2 ] + 1;

	if ( width * height * depth > MAX_DENSE_VOXELS ) {

		throw new Error( 'THREE.VDBLoader: Grid "' + name + '" is too large for a dense texture (' + width + 'x' + height + 'x' + depth + ').' );

	}

	const data = new Float32Array( width * height * depth ).fill( grid.background );
	const dense = { data, bounds, width, height };

	for ( const tile of tiles ) fillCube( dense, tile.origin, 1 << 12, tile.value );
	for ( const child of children ) fillNode( dense, child );

	const texture = new Data3DTexture( data, width, height, depth );
	texture.format = RedFormat;
	texture.type = FloatType;
	texture.minFilter = LinearFilter;
	texture.magFilter = LinearFilter;
	texture.unpackAlignment = 1;
	texture.needsUpdate = true;

	result.texture = texture;

	return result;

}

function readValue( reader, valueType ) {

	const view = reader.view;
	const offset = reader.offset;

	reader.offset += VALUE_SIZES[ valueType ];

	switch ( valueType ) {

		case 'half': return DataUtils.fromHalfFloat( view.getUint16( offset, true ) );
		case 'float': return view.getFloat32( offset, true );
		case 'double': return view.getFloat64( offset, true );

	}

}

function readInternalTopology( reader, grid, origin, log2Dim, childTotal ) {

	const size = 1 << ( 3 * log2Dim );

	const node = {
		origin,
		log2Dim,
		childTotal,
		childMask: reader.mask( size ),
		valueMask: null,
		values: null,
		children: new Map()
	};

	node.valueMask = reader.mask( size );
	node.values = readCompressedValues( reader, grid, size, node.valueMask );

	for ( let i = 0; i < size; i ++ ) {

		if ( isOn( node.childMask, i ) === false ) continue;

		const childOrigin = offsetToCoord( i, log2Dim, childTotal, origin );

		node.children.set( i, log2Dim === 5
			? readInternalTopology( reader, grid, childOrigin, 4, 3 )
			: { origin: childOrigin, valueMask: reader.mask( 512 ), values: null } );

	}

	return node;

}

function readInternalBuffers( reader, grid, node ) {

	for ( const child of node.children.values() ) {

		if ( child.children !== undefined ) {

			readInternalBuffers( reader, grid, child );

		} else {

			child.valueMask = reader.mask( 512 );
			child.values = readCompressedValues( reader, grid, 512, child.valueMask );

		}

	}

}

function readCompressedValues( reader, grid, count, valueMask ) {

	const metadata = reader.uint8();

	let inactiveVal1 = grid.background;
	let inactiveVal0 = metadata === NO_MASK_OR_INACTIVE_VALS ? grid.background : - grid.background;

	if ( metadata === NO_MASK_AND_ONE_INACTIVE_VAL || metadata === MASK_AND_ONE_INACTIVE_VAL || metadata === MASK_AND_TWO_INACTIVE_VALS ) {

		inactiveVal0 = readValue( reader, grid.valueType );

		if ( metadata === MASK_AND_TWO_INACTIVE_VALS ) inactiveVal1 = readValue( reader, grid.valueType );

	}

	let selectionMask = null;

	if ( metadata === MASK_AND_NO_INACTIVE_VALS || metadata === MASK_AND_ONE_INACTIVE_VAL || metadata === MASK_AND_TWO_INACTIVE_VALS ) {

		selectionMask = reader.mask( count );

	}

	const maskCompressed = ( grid.compression & COMPRESS_ACTIVE_MASK ) !== 0 && metadata !== NO_MASK_AND_ALL_VALS;
	const storedCount = maskCompressed ? countOn( valueMask ) : count;
	const stored = readData( reader, grid, storedCount );

	if ( storedCount === count ) return stored;

	const values = new Float32Array( count );

	for ( let i = 0, j = 0; i < count; i ++ ) {

		if ( isOn( valueMask, i ) ) {

			values[ i ] = stored[ j ++ ];

		} else {

			values[ i ] = selectionMask !== null && isOn( selectionMask, i ) ? inactiveVal1 : inactiveVal0;

		}

	}

	return values;

}

function readData( reader, grid, count ) {

	const valueType = grid.saveFloatAsHalf ? 'half' : grid.valueType;
	const byteLength = count * VALUE_SIZES[ valueType ];

	let bytes;

	if ( grid.compression & COMPRESS_ZIP ) {

		const zippedLength = reader.int64();

		bytes = zippedLength <= 0
			? reader.bytes( - zippedLength )
			: unzlibSync( reader.bytes( zippedLength ) );

	} else {

		bytes = reader.bytes( byteLength );

	}

	if ( bytes.byteLength !== byteLength ) {

		throw new Error( 'THREE.VDBLoader: Unexpected data size.' );

	}

	const view = new DataView( bytes.buffer, bytes.byteOffset, bytes.byteLength );
	const values = new Float32Array( count );

	for ( let i = 0; i < count; i ++ ) {

		switch ( valueType ) {

			case 'half': values[ i ] = DataUtils.fromHalfFloat( view.getUint16( i * 2, true ) ); break;
			case 'float': values[ i ] = view.getFloat32( i * 4, true ); break;
			case 'double': values[ i ] = view.getFloat64( i * 8, true ); break;

		}

	}

	return values;

}

function isOn( mask, i ) {

	return ( mask[ i >> 3 ] & ( 1 << ( i & 7 ) ) ) !== 0;

}

function countOn( mask ) {

	let count = 0;

	for ( let i = 0; i < mask.length; i ++ ) {

		let byte = mask[ i ];

		while ( byte !== 0 ) {

			byte &= byte - 1;
			count ++;

		}

	}

	return count;

}

function offsetToCoord( i, log2Dim, childTotal, origin ) {

	const mask = ( 1 << log2Dim ) - 1;

	return [
		origin[ 0 ] + ( ( i >> ( 2 * log2Dim ) ) << childTotal ),
		origin[ 1 ] + ( ( ( i >> log2Dim ) & mask ) << childTotal ),
		origin[ 2 ] + ( ( i & mask ) << childTotal )
	];

}

function expandByCube( bounds, origin, size ) {

	for ( let i = 0; i < 3; i ++ ) {

		bounds[ i ] = Math.min( bounds[ i ], origin[ i ] );
		bounds[ i + 3 ] = Math.max( bounds[ i + 3 ], origin[ i ] + size - 1 );

	}

}

function expandByNode( bounds, node ) {

	if ( node.children === undefined ) {

		for ( let i = 0; i < 512; i ++ ) {

			if ( isOn( node.valueMask, i ) === false ) continue;

			const x = node.origin[ 0 ] + ( i >> 6 );
			const y = node.origin[ 1 ] + ( ( i >> 3 ) & 7 );
			const z = node.origin[ 2 ] + ( i & 7 );

			if ( x < bounds[ 0 ] ) bounds[ 0 ] = x;
			if ( y < bounds[ 1 ] ) bounds[ 1 ] = y;
			if ( z < bounds[ 2 ] ) bounds[ 2 ] = z;
			if ( x > bounds[ 3 ] ) bounds[ 3 ] = x;
			if ( y > bounds[ 4 ] ) bounds[ 4 ] = y;
			if ( z > bounds[ 5 ] ) bounds[ 5 ] = z;

		}

		return;

	}

	const size = 1 << ( 3 * node.log2Dim );

	for ( let i = 0; i < size; i ++ ) {

		const child = node.children.get( i );

		if ( child !== undefined ) {

			expandByNode( bounds, child );

		} else if ( isOn( node.valueMask, i ) ) {

			expandByCube( bounds, offsetToCoord( i, node.log2Dim, node.childTotal, node.origin ), 1 << node.childTotal );

		}

	}

}

function fillCube( dense, origin, size, value ) {

	const { data, bounds, width, height } = dense;

	const x0 = Math.max( origin[ 0 ], bounds[ 0 ] ), x1 = Math.min( origin[ 0 ] + size - 1, bounds[ 3 ] );
	const y0 = Math.max( origin[ 1 ], bounds[ 1 ] ), y1 = Math.min( origin[ 1 ] + size - 1, bounds[ 4 ] );
	const z0 = Math.max( origin[ 2 ], bounds[ 2 ] ), z1 = Math.min( origin[ 2 ] + size - 1, bounds[ 5 ] );

	if ( x0 > x1 || y0 > y1 || z0 > z1 ) return;

	for ( let z = z0; z <= z1; z ++ ) {

		for ( let y = y0; y <= y1; y ++ ) {

			const row = ( ( z - bounds[ 2 ] ) * height + ( y - bounds[ 1 ] ) ) * width - bounds[ 0 ];
			data.fill( value, row + x0, row + x1 + 1 );

		}

	}

}

function fillNode( dense, node ) {

	if ( node.children === undefined ) {

		const { data, bounds, width, height } = dense;

		for ( let i = 0; i < 512; i ++ ) {

			const x = node.origin[ 0 ] + ( i >> 6 ) - bounds[ 0 ];
			const y = node.origin[ 1 ] + ( ( i >> 3 ) & 7 ) - bounds[ 1 ];
			const z = node.origin[ 2 ] + ( i & 7 ) - bounds[ 2 ];

			if ( x < 0 || y < 0 || z < 0 || x >= width || y >= height || z > bounds[ 5 ] - bounds[ 2 ] ) continue;

			data[ ( z * height + y ) * width + x ] = node.values[ i ];

		}

		return;

	}

	const size = 1 << ( 3 * node.log2Dim );

	for ( let i = 0; i < size; i ++ ) {

		const child = node.children.get( i );

		if ( child !== undefined ) {

			fillNode( dense, child );

		} else {

			fillCube( dense, offsetToCoord( i, node.log2Dim, node.childTotal, node.origin ), 1 << node.childTotal, node.values[ i ] );

		}

	}

}

/**
 * A grid parsed by {@link VDBLoader}.
 *
 * @typedef {Object} VDBLoader~Grid
 * @property {string} name - The name of the grid.
 * @property {('float'|'double'|'half')} type - The value type of the grid.
 * @property {Object} metadata - The grid metadata, e.g. `class`.
 * @property {Matrix4} transform - Transforms index space coordinates into world space.
 * @property {number} background - The background value of the grid.
 * @property {Box3} bbox - The bounding box of the active voxels in index space (inclusive).
 * @property {?Data3DTexture} texture - The voxel values inside `bbox`, or `null` if the grid is empty.
 **/

export { VDBLoader };
