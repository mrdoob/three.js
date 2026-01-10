import {
	BufferAttribute,
	BufferGeometry,
	ClampToEdgeWrapping,
	Group,
	NoColorSpace,
	Mesh,
	MeshPhysicalMaterial,
	MirroredRepeatWrapping,
	RepeatWrapping,
	SRGBColorSpace,
	TextureLoader,
	Object3D
} from 'three';

// Type enum values from crateDataTypes.h
const TypeEnum = {
	Invalid: 0,
	Bool: 1,
	UChar: 2,
	Int: 3,
	UInt: 4,
	Int64: 5,
	UInt64: 6,
	Half: 7,
	Float: 8,
	Double: 9,
	String: 10,
	Token: 11,
	AssetPath: 12,
	Matrix2d: 13,
	Matrix3d: 14,
	Matrix4d: 15,
	Quatd: 16,
	Quatf: 17,
	Quath: 18,
	Vec2d: 19,
	Vec2f: 20,
	Vec2h: 21,
	Vec2i: 22,
	Vec3d: 23,
	Vec3f: 24,
	Vec3h: 25,
	Vec3i: 26,
	Vec4d: 27,
	Vec4f: 28,
	Vec4h: 29,
	Vec4i: 30,
	Dictionary: 31,
	TokenListOp: 32,
	StringListOp: 33,
	PathListOp: 34,
	ReferenceListOp: 35,
	IntListOp: 36,
	Int64ListOp: 37,
	UIntListOp: 38,
	UInt64ListOp: 39,
	PathVector: 40,
	TokenVector: 41,
	Specifier: 42,
	Permission: 43,
	Variability: 44,
	VariantSelectionMap: 45,
	TimeSamples: 46,
	Payload: 47,
	DoubleVector: 48,
	LayerOffsetVector: 49,
	StringVector: 50,
	ValueBlock: 51,
	Value: 52,
	UnregisteredValue: 53,
	UnregisteredValueListOp: 54,
	PayloadListOp: 55,
	TimeCode: 56,
	PathExpression: 57,
	Relocates: 58,
	Spline: 59,
	AnimationBlock: 60
};

// Spec types
const SpecType = {
	Unknown: 0,
	Attribute: 1,
	Connection: 2,
	Expression: 3,
	Mapper: 4,
	MapperArg: 5,
	Prim: 6,
	PseudoRoot: 7,
	Relationship: 8,
	RelationshipTarget: 9,
	Variant: 10,
	VariantSet: 11
};

// Specifier values
const Specifier = {
	Def: 0,
	Over: 1,
	Class: 2
};

// ============================================================================
// LZ4 Decompression (minimal implementation for USD)
// Based on LZ4 block format specification
// ============================================================================

function lz4DecompressBlock( input, inputOffset, inputEnd, output, outputOffset, outputEnd ) {

	while ( inputOffset < inputEnd ) {

		// Read token
		const token = input[ inputOffset ++ ];
		if ( inputOffset > inputEnd ) break;

		// Literal length
		let literalLength = token >> 4;
		if ( literalLength === 15 ) {

			let b;
			do {

				if ( inputOffset >= inputEnd ) break;
				b = input[ inputOffset ++ ];
				literalLength += b;

			} while ( b === 255 && inputOffset < inputEnd );

		}

		// Copy literals
		if ( literalLength > 0 ) {

			if ( inputOffset + literalLength > inputEnd ) {

				literalLength = inputEnd - inputOffset;

			}

			for ( let i = 0; i < literalLength; i ++ ) {

				if ( outputOffset >= outputEnd ) break;
				output[ outputOffset ++ ] = input[ inputOffset ++ ];

			}

		}

		// Check if we're at the end (last sequence has no match)
		if ( inputOffset >= inputEnd ) break;

		// Read match offset (little-endian 16-bit)
		if ( inputOffset + 2 > inputEnd ) break;
		const matchOffset = input[ inputOffset ++ ] | ( input[ inputOffset ++ ] << 8 );

		if ( matchOffset === 0 ) {

			// Invalid offset
			break;

		}

		// Match length
		let matchLength = ( token & 0x0F ) + 4;
		if ( matchLength === 19 ) {

			let b;
			do {

				if ( inputOffset >= inputEnd ) break;
				b = input[ inputOffset ++ ];
				matchLength += b;

			} while ( b === 255 && inputOffset < inputEnd );

		}

		// Copy match (byte-by-byte to handle overlapping)
		const matchPos = outputOffset - matchOffset;
		if ( matchPos < 0 ) {

			// Invalid match position
			break;

		}

		for ( let i = 0; i < matchLength; i ++ ) {

			if ( outputOffset >= outputEnd ) break;
			output[ outputOffset ++ ] = output[ matchPos + i ];

		}

	}

	return outputOffset;

}

// USD uses TfFastCompression which wraps LZ4 with chunk headers
function decompressLZ4( input, uncompressedSize ) {

	// USD's TfFastCompression format:
	// Single chunk (byte 0 == 0): [0] + LZ4 data
	// Multi chunk (byte 0 > 0): [numChunks] + [compressedSizes...] + [chunkData...]

	const output = new Uint8Array( uncompressedSize );
	const numChunks = input[ 0 ];

	if ( numChunks === 0 ) {

		// Single chunk - all remaining bytes are LZ4 compressed
		lz4DecompressBlock( input, 1, input.length, output, 0, uncompressedSize );
		return output;

	} else {

		// Multiple chunks - each chunk decompresses to max 65536 bytes
		const CHUNK_SIZE = 65536;

		// First, read all chunk sizes
		let headerOffset = 1;
		const compressedSizes = [];

		for ( let i = 0; i < numChunks; i ++ ) {

			const size = input[ headerOffset ] |
						( input[ headerOffset + 1 ] << 8 ) |
						( input[ headerOffset + 2 ] << 16 ) |
						( input[ headerOffset + 3 ] << 24 );
			compressedSizes.push( size );
			headerOffset += 4;

		}

		// Decompress each chunk
		let inputOffset = headerOffset;
		let outputOffset = 0;

		for ( let i = 0; i < numChunks; i ++ ) {

			const chunkCompressedSize = compressedSizes[ i ];
			const chunkOutputSize = Math.min( CHUNK_SIZE, uncompressedSize - outputOffset );

			lz4DecompressBlock(
				input, inputOffset, inputOffset + chunkCompressedSize,
				output, outputOffset, outputOffset + chunkOutputSize
			);

			inputOffset += chunkCompressedSize;
			outputOffset += chunkOutputSize;

		}

		return output;

	}

}

// ============================================================================
// Integer Decompression (USD-specific delta + variable-width encoding)
// ============================================================================

function decompressIntegers32( compressedData, numInts ) {

	// First decompress with LZ4
	const encodedSize = numInts * 4 + ( ( numInts * 2 + 7 ) >> 3 ) + 4;
	const encoded = decompressLZ4( new Uint8Array( compressedData ), encodedSize );

	// Then decode
	return decodeIntegers32( encoded, numInts );

}

function decodeIntegers32( data, numInts ) {

	const view = new DataView( data.buffer, data.byteOffset, data.byteLength );
	let offset = 0;

	// Read common value (signed 32-bit)
	const commonValue = view.getInt32( offset, true );
	offset += 4;

	const numCodesBytes = ( numInts * 2 + 7 ) >> 3;
	const codesStart = offset;
	const vintsStart = offset + numCodesBytes;

	const result = new Int32Array( numInts );
	let prevVal = 0;
	let codesOffset = codesStart;
	let vintsOffset = vintsStart;

	for ( let i = 0; i < numInts; ) {

		const codeByte = data[ codesOffset ++ ];

		for ( let j = 0; j < 4 && i < numInts; j ++, i ++ ) {

			const code = ( codeByte >> ( j * 2 ) ) & 3;
			let delta;

			switch ( code ) {

				case 0: // Common value
					delta = commonValue;
					break;
				case 1: // 8-bit signed
					delta = view.getInt8( vintsOffset );
					vintsOffset += 1;
					break;
				case 2: // 16-bit signed
					delta = view.getInt16( vintsOffset, true );
					vintsOffset += 2;
					break;
				case 3: // 32-bit signed
					delta = view.getInt32( vintsOffset, true );
					vintsOffset += 4;
					break;

			}

			prevVal += delta;
			result[ i ] = prevVal;

		}

	}

	return result;

}

// ============================================================================
// Binary Reader Helper
// ============================================================================

class BinaryReader {

	constructor( buffer ) {

		this.buffer = buffer;
		this.view = new DataView( buffer );
		this.offset = 0;

	}

	seek( offset ) {

		this.offset = offset;

	}

	tell() {

		return this.offset;

	}

	readUint8() {

		const value = this.view.getUint8( this.offset );
		this.offset += 1;
		return value;

	}

	readInt8() {

		const value = this.view.getInt8( this.offset );
		this.offset += 1;
		return value;

	}

	readUint16() {

		const value = this.view.getUint16( this.offset, true );
		this.offset += 2;
		return value;

	}

	readInt16() {

		const value = this.view.getInt16( this.offset, true );
		this.offset += 2;
		return value;

	}

	readUint32() {

		const value = this.view.getUint32( this.offset, true );
		this.offset += 4;
		return value;

	}

	readInt32() {

		const value = this.view.getInt32( this.offset, true );
		this.offset += 4;
		return value;

	}

	readUint64() {

		const lo = this.view.getUint32( this.offset, true );
		const hi = this.view.getUint32( this.offset + 4, true );
		this.offset += 8;
		// For values that fit in Number, this is safe
		return hi * 0x100000000 + lo;

	}

	readInt64() {

		const lo = this.view.getUint32( this.offset, true );
		const hi = this.view.getInt32( this.offset + 4, true );
		this.offset += 8;
		return hi * 0x100000000 + lo;

	}

	readFloat32() {

		const value = this.view.getFloat32( this.offset, true );
		this.offset += 4;
		return value;

	}

	readFloat64() {

		const value = this.view.getFloat64( this.offset, true );
		this.offset += 8;
		return value;

	}

	readBytes( length ) {

		const bytes = new Uint8Array( this.buffer, this.offset, length );
		this.offset += length;
		return bytes;

	}

	readString( length ) {

		const bytes = this.readBytes( length );
		let str = '';
		for ( let i = 0; i < length && bytes[ i ] !== 0; i ++ ) {

			str += String.fromCharCode( bytes[ i ] );

		}

		return str;

	}

}

// ============================================================================
// ValueRep - 64-bit packed value representation
// ============================================================================

class ValueRep {

	constructor( lo, hi ) {

		this.lo = lo; // Lower 32 bits
		this.hi = hi; // Upper 32 bits

	}

	get isArray() {

		return ( this.hi & 0x80000000 ) !== 0;

	}

	get isInlined() {

		return ( this.hi & 0x40000000 ) !== 0;

	}

	get isCompressed() {

		return ( this.hi & 0x20000000 ) !== 0;

	}

	get typeEnum() {

		return ( this.hi >> 16 ) & 0xFF;

	}

	get payload() {

		// 48-bit payload: lo (32 bits) + hi lower 16 bits
		return this.lo + ( ( this.hi & 0xFFFF ) * 0x100000000 );

	}

	getInlinedValue() {

		// For inlined scalars, the value is in the lower 32 bits
		return this.lo;

	}

}

// ============================================================================
// USDC Parser
// ============================================================================

class USDCParser {

	parse( buffer, assets = {} ) {

		this.buffer = buffer instanceof ArrayBuffer ? buffer : buffer.buffer;
		this.reader = new BinaryReader( this.buffer );
		this.assets = assets;
		this.version = { major: 0, minor: 0, patch: 0 };
		this.textureLoader = new TextureLoader();
		this.textureCache = {};

		// Parse structure
		this._readBootstrap();
		this._readTOC();
		this._readTokens();
		this._readStrings();
		this._readFields();
		this._readFieldSets();
		this._readPaths();
		this._readSpecs();

		// Build scene
		return this._buildScene();

	}

	_readBootstrap() {

		const reader = this.reader;
		reader.seek( 0 );

		// Read magic "PXR-USDC"
		const magic = reader.readString( 8 );
		if ( magic !== 'PXR-USDC' ) {

			throw new Error( 'Not a valid USDC file' );

		}

		// Read version
		this.version.major = reader.readUint8();
		this.version.minor = reader.readUint8();
		this.version.patch = reader.readUint8();
		reader.readBytes( 5 ); // Skip remaining version bytes

		// Read TOC offset
		this.tocOffset = reader.readUint64();

		// Skip reserved bytes (rest of 128-byte header)
		// Already at offset 24, skip to end of bootstrap (88 bytes total for bootstrap struct)

	}

	_readTOC() {

		const reader = this.reader;
		reader.seek( this.tocOffset );

		// Read number of sections
		const numSections = reader.readUint64();
		this.sections = {};

		for ( let i = 0; i < numSections; i ++ ) {

			const name = reader.readString( 16 );
			const start = reader.readUint64();
			const size = reader.readUint64();

			this.sections[ name ] = { start, size };

		}

	}

	_readTokens() {

		const section = this.sections[ 'TOKENS' ];
		if ( ! section ) return;

		const reader = this.reader;
		reader.seek( section.start );

		const numTokens = reader.readUint64();
		this.tokens = [];

		if ( this.version.major === 0 && this.version.minor < 4 ) {

			// Uncompressed tokens (version < 0.4.0)
			const tokensNumBytes = reader.readUint64();
			const tokensData = reader.readBytes( tokensNumBytes );

			let strStart = 0;
			for ( let i = 0; i < numTokens; i ++ ) {

				let strEnd = strStart;
				while ( tokensData[ strEnd ] !== 0 ) strEnd ++;
				const str = String.fromCharCode.apply( null, tokensData.slice( strStart, strEnd ) );
				this.tokens.push( str );
				strStart = strEnd + 1;

			}

		} else {

			// Compressed tokens (version >= 0.4.0)
			const uncompressedSize = reader.readUint64();
			const compressedSize = reader.readUint64();
			const compressedData = reader.readBytes( compressedSize );

			const tokensData = decompressLZ4( compressedData, uncompressedSize );

			let strStart = 0;
			for ( let i = 0; i < numTokens; i ++ ) {

				let strEnd = strStart;
				while ( tokensData[ strEnd ] !== 0 ) strEnd ++;

				let str = '';
				for ( let j = strStart; j < strEnd; j ++ ) {

					str += String.fromCharCode( tokensData[ j ] );

				}

				this.tokens.push( str );
				strStart = strEnd + 1;

			}

		}

	}

	_readStrings() {

		const section = this.sections[ 'STRINGS' ];
		if ( ! section ) {

			this.strings = [];
			return;

		}

		const reader = this.reader;
		reader.seek( section.start );

		// Strings section contains token indices
		const numStrings = section.size / 4;
		this.strings = [];

		for ( let i = 0; i < numStrings; i ++ ) {

			this.strings.push( reader.readUint32() );

		}

	}

	_readFields() {

		const section = this.sections[ 'FIELDS' ];
		if ( ! section ) return;

		const reader = this.reader;
		reader.seek( section.start );

		this.fields = [];

		if ( this.version.major === 0 && this.version.minor < 4 ) {

			// Uncompressed fields
			const numFields = section.size / 12; // 4 bytes token index + 8 bytes value rep

			for ( let i = 0; i < numFields; i ++ ) {

				const tokenIndex = reader.readUint32();
				const repLo = reader.readUint32();
				const repHi = reader.readUint32();

				this.fields.push( {
					tokenIndex,
					valueRep: new ValueRep( repLo, repHi )
				} );

			}

		} else {

			// Compressed fields (version >= 0.4.0)
			const numFields = reader.readUint64();

			// Read compressed token indices
			const tokenIndicesCompressedSize = reader.readUint64();
			const tokenIndicesCompressed = reader.readBytes( tokenIndicesCompressedSize );
			const tokenIndices = decompressIntegers32(
				tokenIndicesCompressed.buffer.slice(
					tokenIndicesCompressed.byteOffset,
					tokenIndicesCompressed.byteOffset + tokenIndicesCompressedSize
				),
				numFields
			);

			// Read compressed value reps (LZ4 only, no integer encoding)
			const repsCompressedSize = reader.readUint64();
			const repsCompressed = reader.readBytes( repsCompressedSize );
			const repsData = decompressLZ4( repsCompressed, numFields * 8 );
			const repsView = new DataView( repsData.buffer, repsData.byteOffset, repsData.byteLength );

			for ( let i = 0; i < numFields; i ++ ) {

				const repLo = repsView.getUint32( i * 8, true );
				const repHi = repsView.getUint32( i * 8 + 4, true );

				this.fields.push( {
					tokenIndex: tokenIndices[ i ],
					valueRep: new ValueRep( repLo, repHi )
				} );

			}

		}

	}

	_readFieldSets() {

		const section = this.sections[ 'FIELDSETS' ];
		if ( ! section ) return;

		const reader = this.reader;
		reader.seek( section.start );

		this.fieldSets = [];

		if ( this.version.major === 0 && this.version.minor < 4 ) {

			// Uncompressed field sets
			const numFieldSets = section.size / 4;

			for ( let i = 0; i < numFieldSets; i ++ ) {

				this.fieldSets.push( reader.readUint32() );

			}

		} else {

			// Compressed field sets
			const numFieldSets = reader.readUint64();
			const compressedSize = reader.readUint64();
			const compressed = reader.readBytes( compressedSize );

			const indices = decompressIntegers32(
				compressed.buffer.slice(
					compressed.byteOffset,
					compressed.byteOffset + compressedSize
				),
				numFieldSets
			);

			for ( let i = 0; i < numFieldSets; i ++ ) {

				this.fieldSets.push( indices[ i ] );

			}

		}

	}

	_readPaths() {

		const section = this.sections[ 'PATHS' ];
		if ( ! section ) return;

		const reader = this.reader;
		reader.seek( section.start );

		const numPaths = reader.readUint64();
		this.paths = new Array( numPaths ).fill( '' );

		if ( this.version.major === 0 && this.version.minor < 4 ) {

			// Uncompressed paths - recursive tree structure
			this._readPathsRecursive( '' );

		} else {

			// Compressed paths (version >= 0.4.0)
			// Note: numPaths is stored twice - once for array sizing, once in compressed paths section
			reader.readUint64(); // Read duplicate numPaths value (matches numPaths above)

			const compressedSize1 = reader.readUint64();
			const pathIndicesCompressed = reader.readBytes( compressedSize1 );
			const pathIndices = decompressIntegers32(
				pathIndicesCompressed.buffer.slice(
					pathIndicesCompressed.byteOffset,
					pathIndicesCompressed.byteOffset + compressedSize1
				),
				numPaths
			);

			const compressedSize2 = reader.readUint64();
			const elementTokenIndicesCompressed = reader.readBytes( compressedSize2 );
			const elementTokenIndices = decompressIntegers32(
				elementTokenIndicesCompressed.buffer.slice(
					elementTokenIndicesCompressed.byteOffset,
					elementTokenIndicesCompressed.byteOffset + compressedSize2
				),
				numPaths
			);

			const compressedSize3 = reader.readUint64();
			const jumpsCompressed = reader.readBytes( compressedSize3 );
			const jumps = decompressIntegers32(
				jumpsCompressed.buffer.slice(
					jumpsCompressed.byteOffset,
					jumpsCompressed.byteOffset + compressedSize3
				),
				numPaths
			);

			// Build paths from compressed data
			this._buildPathsFromCompressed( pathIndices, elementTokenIndices, jumps );

		}

	}

	_readPathsRecursive( parentPath, depth = 0 ) {

		const reader = this.reader;

		// Prevent infinite recursion
		if ( depth > 10000 ) return;

		// Read path item header
		const index = reader.readUint32();
		const elementTokenIndex = reader.readUint32();
		const bits = reader.readUint8();

		const hasChild = ( bits & 1 ) !== 0;
		const hasSibling = ( bits & 2 ) !== 0;
		const isPrimProperty = ( bits & 4 ) !== 0;

		// Build path
		let path;
		if ( parentPath === '' ) {

			path = '/';

		} else {

			const elemToken = this.tokens[ elementTokenIndex ] || '';
			if ( isPrimProperty ) {

				path = parentPath + '.' + elemToken;

			} else {

				path = parentPath === '/' ? '/' + elemToken : parentPath + '/' + elemToken;

			}

		}

		this.paths[ index ] = path;

		// Process children and siblings
		if ( hasChild && hasSibling ) {

			// Read sibling offset
			const siblingOffset = reader.readUint64();

			// Read child
			this._readPathsRecursive( path, depth + 1 );

			// Read sibling
			reader.seek( siblingOffset );
			this._readPathsRecursive( parentPath, depth + 1 );

		} else if ( hasChild ) {

			this._readPathsRecursive( path, depth + 1 );

		} else if ( hasSibling ) {

			this._readPathsRecursive( parentPath, depth + 1 );

		}

	}

	_buildPathsFromCompressed( pathIndices, elementTokenIndices, jumps ) {

		// Jump encoding from USD:
		// 0 = only sibling (no child), next entry is sibling
		// -1 = only child (no sibling), next entry is child
		// -2 = leaf (no child, no sibling)
		// >0 = has both child and sibling, value is offset to sibling

		const buildPaths = ( startIndex, parentPath ) => {

			let curIndex = startIndex;

			while ( curIndex < pathIndices.length ) {

				const thisIndex = curIndex ++;
				const pathIndex = pathIndices[ thisIndex ];
				const elementTokenIndex = elementTokenIndices[ thisIndex ];
				const jump = jumps[ thisIndex ];

				// Build path
				let path;
				if ( parentPath === '' ) {

					path = '/';
					parentPath = path;

				} else {

					const elemToken = this.tokens[ Math.abs( elementTokenIndex ) ] || '';
					const isPrimProperty = elementTokenIndex < 0;

					if ( isPrimProperty ) {

						path = parentPath + '.' + elemToken;

					} else {

						path = parentPath === '/' ? '/' + elemToken : parentPath + '/' + elemToken;

					}

				}

				this.paths[ pathIndex ] = path;

				// Determine children and siblings
				const hasChild = jump > 0 || jump === - 1;
				const hasSibling = jump >= 0;

				if ( hasChild ) {

					if ( hasSibling ) {

						// Has both child and sibling
						// Recursively process sibling subtree
						const siblingIndex = thisIndex + jump;
						buildPaths( siblingIndex, parentPath );

					}

					// Child is next entry, continue with new parent path
					parentPath = path;

				} else if ( hasSibling ) {

					// Only sibling, next entry is sibling with same parent
					// Just continue loop with curIndex and same parentPath

				} else {

					// Leaf node, exit loop
					break;

				}

			}

		};

		buildPaths( 0, '' );

	}

	_readSpecs() {

		const section = this.sections[ 'SPECS' ];
		if ( ! section ) return;

		const reader = this.reader;
		reader.seek( section.start );

		this.specs = [];

		if ( this.version.major === 0 && this.version.minor < 4 ) {

			// Uncompressed specs
			// Each spec: pathIndex (4), fieldSetIndex (4), specType (4) = 12 bytes
			// For version 0.0.1 there may be different padding
			const specSize = ( this.version.minor === 0 && this.version.patch === 1 ) ? 16 : 12;
			const numSpecs = Math.floor( section.size / specSize );

			for ( let i = 0; i < numSpecs; i ++ ) {

				const pathIndex = reader.readUint32();
				const fieldSetIndex = reader.readUint32();
				const specType = reader.readUint32();

				if ( specSize === 16 ) reader.readUint32(); // padding

				this.specs.push( { pathIndex, fieldSetIndex, specType } );

			}

		} else {

			// Compressed specs
			const numSpecs = reader.readUint64();

			const compressedSize1 = reader.readUint64();
			const pathIndicesCompressed = reader.readBytes( compressedSize1 );
			const pathIndices = decompressIntegers32(
				pathIndicesCompressed.buffer.slice(
					pathIndicesCompressed.byteOffset,
					pathIndicesCompressed.byteOffset + compressedSize1
				),
				numSpecs
			);

			const compressedSize2 = reader.readUint64();
			const fieldSetIndicesCompressed = reader.readBytes( compressedSize2 );
			const fieldSetIndices = decompressIntegers32(
				fieldSetIndicesCompressed.buffer.slice(
					fieldSetIndicesCompressed.byteOffset,
					fieldSetIndicesCompressed.byteOffset + compressedSize2
				),
				numSpecs
			);

			const compressedSize3 = reader.readUint64();
			const specTypesCompressed = reader.readBytes( compressedSize3 );
			const specTypes = decompressIntegers32(
				specTypesCompressed.buffer.slice(
					specTypesCompressed.byteOffset,
					specTypesCompressed.byteOffset + compressedSize3
				),
				numSpecs
			);

			for ( let i = 0; i < numSpecs; i ++ ) {

				this.specs.push( {
					pathIndex: pathIndices[ i ],
					fieldSetIndex: fieldSetIndices[ i ],
					specType: specTypes[ i ]
				} );

			}

		}

	}

	// ========================================================================
	// Value Reading
	// ========================================================================

	_readValue( valueRep ) {

		const type = valueRep.typeEnum;
		const isArray = valueRep.isArray;
		const isInlined = valueRep.isInlined;

		if ( isInlined ) {

			return this._readInlinedValue( valueRep );

		}

		// Seek to payload offset and read value
		const offset = valueRep.payload;
		const savedOffset = this.reader.tell();
		this.reader.seek( offset );

		let value;

		if ( isArray ) {

			value = this._readArrayValue( valueRep );

		} else {

			value = this._readScalarValue( type );

		}

		this.reader.seek( savedOffset );
		return value;

	}

	_readInlinedValue( valueRep ) {

		const type = valueRep.typeEnum;
		const payload = valueRep.getInlinedValue();

		switch ( type ) {

			case TypeEnum.Bool:
				return payload !== 0;
			case TypeEnum.UChar:
				return payload & 0xFF;
			case TypeEnum.Int:
			case TypeEnum.UInt:
				return payload;
			case TypeEnum.Float: {

				const buf = new ArrayBuffer( 4 );
				new DataView( buf ).setUint32( 0, payload, true );
				return new DataView( buf ).getFloat32( 0, true );

			}

			case TypeEnum.Token:
				return this.tokens[ payload ] || '';
			case TypeEnum.String:
				return this.tokens[ this.strings[ payload ] ] || '';
			case TypeEnum.AssetPath:
				return this.tokens[ payload ] || '';
			case TypeEnum.Specifier:
				return payload; // 0=def, 1=over, 2=class
			case TypeEnum.Permission:
			case TypeEnum.Variability:
				return payload;
			default:
				return payload;

		}

	}

	_readScalarValue( type ) {

		const reader = this.reader;

		switch ( type ) {

			case TypeEnum.Bool:
				return reader.readUint8() !== 0;
			case TypeEnum.UChar:
				return reader.readUint8();
			case TypeEnum.Int:
				return reader.readInt32();
			case TypeEnum.UInt:
				return reader.readUint32();
			case TypeEnum.Int64:
				return reader.readInt64();
			case TypeEnum.UInt64:
				return reader.readUint64();
			case TypeEnum.Half:
				return this._readHalf();
			case TypeEnum.Float:
				return reader.readFloat32();
			case TypeEnum.Double:
				return reader.readFloat64();
			case TypeEnum.String:
			case TypeEnum.Token: {

				const index = reader.readUint32();
				return this.tokens[ index ] || '';

			}

			case TypeEnum.AssetPath: {

				const index = reader.readUint32();
				return this.tokens[ index ] || '';

			}

			case TypeEnum.Vec2f:
				return [ reader.readFloat32(), reader.readFloat32() ];
			case TypeEnum.Vec2d:
				return [ reader.readFloat64(), reader.readFloat64() ];
			case TypeEnum.Vec2i:
				return [ reader.readInt32(), reader.readInt32() ];
			case TypeEnum.Vec3f:
				return [ reader.readFloat32(), reader.readFloat32(), reader.readFloat32() ];
			case TypeEnum.Vec3d:
				return [ reader.readFloat64(), reader.readFloat64(), reader.readFloat64() ];
			case TypeEnum.Vec3i:
				return [ reader.readInt32(), reader.readInt32(), reader.readInt32() ];
			case TypeEnum.Vec4f:
				return [ reader.readFloat32(), reader.readFloat32(), reader.readFloat32(), reader.readFloat32() ];
			case TypeEnum.Vec4d:
				return [ reader.readFloat64(), reader.readFloat64(), reader.readFloat64(), reader.readFloat64() ];
			case TypeEnum.Quatf:
				return [ reader.readFloat32(), reader.readFloat32(), reader.readFloat32(), reader.readFloat32() ];
			case TypeEnum.Quatd:
				return [ reader.readFloat64(), reader.readFloat64(), reader.readFloat64(), reader.readFloat64() ];
			case TypeEnum.Matrix4d: {

				const m = [];
				for ( let i = 0; i < 16; i ++ ) m.push( reader.readFloat64() );
				return m;

			}

			case TypeEnum.TokenVector: {

				const count = reader.readUint64();
				const tokens = [];
				for ( let i = 0; i < count; i ++ ) {

					const index = reader.readUint32();
					tokens.push( this.tokens[ index ] || '' );

				}

				return tokens;

			}

			case TypeEnum.PathVector: {

				const count = reader.readUint64();
				const paths = [];
				for ( let i = 0; i < count; i ++ ) {

					const index = reader.readUint32();
					paths.push( this.paths[ index ] || '' );

				}

				return paths;

			}

			case TypeEnum.Dictionary:
			case TypeEnum.TokenListOp:
			case TypeEnum.StringListOp:
			case TypeEnum.IntListOp:
			case TypeEnum.Int64ListOp:
			case TypeEnum.UIntListOp:
			case TypeEnum.UInt64ListOp:
				// These complex types are not needed for geometry loading
				// Skip them silently
				return null;

			case TypeEnum.PathListOp: {

				// PathListOp format:
				// Byte 0: flags (bit 0 = hasExplicitItems, bit 1 = hasAddedItems, etc.)
				// For explicit items: count (uint64) + path indices (uint32 each)
				const flags = reader.readUint8();
				const hasExplicitItems = ( flags & 1 ) !== 0;

				if ( hasExplicitItems ) {

					const itemCount = reader.readUint64();
					const paths = [];
					for ( let i = 0; i < itemCount; i ++ ) {

						const pathIdx = reader.readUint32();
						paths.push( this.paths[ pathIdx ] );

					}

					return paths;

				}

				return null;

			}

			default:
				console.warn( 'USDCParser: Unsupported scalar type', type );
				return null;

		}

	}

	_readArrayValue( valueRep ) {

		const reader = this.reader;
		const type = valueRep.typeEnum;
		const isCompressed = valueRep.isCompressed;

		// Read array size
		let size;
		if ( this.version.major === 0 && this.version.minor < 7 ) {

			size = reader.readUint32();

		} else {

			size = reader.readUint64();

		}

		if ( size === 0 ) return [];

		// Handle compressed arrays
		if ( isCompressed ) {

			return this._readCompressedArray( type, size );

		}

		// Read uncompressed array
		switch ( type ) {

			case TypeEnum.Int: {

				const arr = new Int32Array( size );
				for ( let i = 0; i < size; i ++ ) arr[ i ] = reader.readInt32();
				return arr;

			}

			case TypeEnum.UInt: {

				const arr = new Uint32Array( size );
				for ( let i = 0; i < size; i ++ ) arr[ i ] = reader.readUint32();
				return arr;

			}

			case TypeEnum.Float: {

				const arr = new Float32Array( size );
				for ( let i = 0; i < size; i ++ ) arr[ i ] = reader.readFloat32();
				return arr;

			}

			case TypeEnum.Double: {

				const arr = new Float64Array( size );
				for ( let i = 0; i < size; i ++ ) arr[ i ] = reader.readFloat64();
				return arr;

			}

			case TypeEnum.Vec2f: {

				const arr = new Float32Array( size * 2 );
				for ( let i = 0; i < size * 2; i ++ ) arr[ i ] = reader.readFloat32();
				return arr;

			}

			case TypeEnum.Vec3f: {

				const arr = new Float32Array( size * 3 );
				for ( let i = 0; i < size * 3; i ++ ) arr[ i ] = reader.readFloat32();
				return arr;

			}

			case TypeEnum.Vec4f: {

				const arr = new Float32Array( size * 4 );
				for ( let i = 0; i < size * 4; i ++ ) arr[ i ] = reader.readFloat32();
				return arr;

			}

			case TypeEnum.Token: {

				const arr = [];
				for ( let i = 0; i < size; i ++ ) {

					const index = reader.readUint32();
					arr.push( this.tokens[ index ] || '' );

				}

				return arr;

			}

			case TypeEnum.Half: {

				const arr = new Float32Array( size );
				for ( let i = 0; i < size; i ++ ) arr[ i ] = this._readHalf();
				return arr;

			}

			default:
				console.warn( 'USDCParser: Unsupported array type', type );
				return [];

		}

	}

	_readCompressedArray( type, size ) {

		const reader = this.reader;

		switch ( type ) {

			case TypeEnum.Int:
			case TypeEnum.UInt: {

				const compressedSize = reader.readUint64();
				const compressed = reader.readBytes( compressedSize );
				return decompressIntegers32(
					compressed.buffer.slice(
						compressed.byteOffset,
						compressed.byteOffset + compressedSize
					),
					size
				);

			}

			case TypeEnum.Float: {

				// Float compression: 'i' = compressed as ints, 't' = lookup table
				const code = reader.readInt8();

				if ( code === 105 ) { // 'i'

					const compressedSize = reader.readUint64();
					const compressed = reader.readBytes( compressedSize );
					const ints = decompressIntegers32(
						compressed.buffer.slice(
							compressed.byteOffset,
							compressed.byteOffset + compressedSize
						),
						size
					);
					const floats = new Float32Array( size );
					for ( let i = 0; i < size; i ++ ) floats[ i ] = ints[ i ];
					return floats;

				} else if ( code === 116 ) { // 't'

					const lutSize = reader.readUint32();
					const lut = new Float32Array( lutSize );
					for ( let i = 0; i < lutSize; i ++ ) lut[ i ] = reader.readFloat32();

					const compressedSize = reader.readUint64();
					const compressed = reader.readBytes( compressedSize );
					const indices = decompressIntegers32(
						compressed.buffer.slice(
							compressed.byteOffset,
							compressed.byteOffset + compressedSize
						),
						size
					);

					const floats = new Float32Array( size );
					for ( let i = 0; i < size; i ++ ) floats[ i ] = lut[ indices[ i ] ];
					return floats;

				}

				console.warn( 'USDCParser: Unknown float compression code', code );
				return new Float32Array( size );

			}

			default:
				console.warn( 'USDCParser: Unsupported compressed array type', type );
				return [];

		}

	}

	_readHalf() {

		const h = this.reader.readUint16();
		// Convert half to float
		const sign = ( h & 0x8000 ) >> 15;
		const exp = ( h & 0x7C00 ) >> 10;
		const frac = h & 0x03FF;

		if ( exp === 0 ) {

			return sign ? - 0 : 0;

		} else if ( exp === 31 ) {

			return frac ? NaN : ( sign ? - Infinity : Infinity );

		}

		return ( sign ? - 1 : 1 ) * Math.pow( 2, exp - 15 ) * ( 1 + frac / 1024 );

	}

	// ========================================================================
	// Scene Building
	// ========================================================================

	_buildScene() {

		// Build a map of path -> spec data
		this.specsByPath = {};

		for ( const spec of this.specs ) {

			const path = this.paths[ spec.pathIndex ];
			if ( ! path ) continue;

			// Get fields for this spec
			const fields = this._getFieldsForSpec( spec );
			this.specsByPath[ path ] = {
				specType: spec.specType,
				fields
			};

		}

		// Build Three.js scene
		const group = new Group();
		this._buildHierarchy( group, '/' );

		return group;

	}

	_getFieldsForSpec( spec ) {

		const fields = {};
		let fieldSetIndex = spec.fieldSetIndex;

		// Field sets are terminated by 0xFFFFFFFF
		while ( fieldSetIndex < this.fieldSets.length ) {

			const fieldIndex = this.fieldSets[ fieldSetIndex ];

			// Terminator
			if ( fieldIndex === 0xFFFFFFFF || fieldIndex === - 1 ) break;

			const field = this.fields[ fieldIndex ];
			if ( field ) {

				const name = this.tokens[ field.tokenIndex ];
				const value = this._readValue( field.valueRep );
				fields[ name ] = value;

			}

			fieldSetIndex ++;

		}

		return fields;

	}

	_buildHierarchy( parent, parentPath ) {

		const prefix = parentPath === '/' ? '/' : parentPath + '/';

		// Find all direct children of this path
		for ( const path in this.specsByPath ) {

			const spec = this.specsByPath[ path ];

			// Check if this is a direct child
			if ( ! this._isDirectChild( parentPath, path, prefix ) ) continue;

			// Only process Prim specs
			if ( spec.specType !== SpecType.Prim ) continue;

			const specifier = spec.fields.specifier;
			if ( specifier !== Specifier.Def ) continue;

			const typeName = spec.fields.typeName || '';
			const name = this._getPathName( path );

			if ( typeName === 'Xform' || typeName === 'Scope' || typeName === '' ) {

				// Transform node or group
				const obj = this._buildXform( path, spec );
				obj.name = name;
				parent.add( obj );

				// Recursively build children
				this._buildHierarchy( obj, path );

			} else if ( typeName === 'Mesh' ) {

				// Mesh
				const mesh = this._buildMesh( path, spec );
				mesh.name = name;
				parent.add( mesh );

			} else if ( typeName === 'Material' || typeName === 'Shader' ) {

				// Skip materials/shaders, they're referenced by meshes

			} else {

				// Unknown type, create empty object and recurse
				const obj = new Object3D();
				obj.name = name;
				parent.add( obj );
				this._buildHierarchy( obj, path );

			}

		}

	}

	_isDirectChild( parentPath, childPath, prefix ) {

		if ( parentPath === '/' ) {

			// Root children: /Name (no additional slashes)
			return childPath.startsWith( '/' ) &&
				childPath.indexOf( '/', 1 ) === - 1 &&
				childPath.length > 1;

		}

		// Must start with parent path
		if ( ! childPath.startsWith( prefix ) ) return false;

		// Must not have additional slashes (direct child only)
		const remainder = childPath.slice( prefix.length );
		return remainder.indexOf( '/' ) === - 1 && remainder.length > 0;

	}

	_getPathName( path ) {

		const lastSlash = path.lastIndexOf( '/' );
		return lastSlash >= 0 ? path.slice( lastSlash + 1 ) : path;

	}

	_buildXform( path, spec ) {

		const obj = new Object3D();

		// Get attribute values from child attribute specs (for transforms)
		const attrs = this._getAttributeValues( path );

		// Apply transform
		this._applyTransform( obj, spec.fields, attrs );

		return obj;

	}

	_buildMesh( path, spec ) {

		// Get attribute values from child attribute specs
		const attrs = this._getAttributeValues( path );

		// Collect GeomSubsets for multi-material support
		const geomSubsets = this._getGeomSubsets( path );

		let geometry, material;

		if ( geomSubsets.length > 0 ) {

			// Multi-material mesh: reorder triangles by material group
			geometry = this._buildGeometryWithSubsets( attrs, geomSubsets );
			material = geomSubsets.map( subset => this._buildMaterialForPath( subset.materialPath ) );

		} else {

			// Single material mesh
			geometry = this._buildGeometry( path, attrs );
			material = this._buildMaterial( path, spec.fields );

		}

		const mesh = new Mesh( geometry, material );

		// Apply transform from mesh spec fields and attributes
		this._applyTransform( mesh, spec.fields, attrs );

		return mesh;

	}

	_getGeomSubsets( meshPath ) {

		const subsets = [];
		const prefix = meshPath + '/';

		for ( const p in this.specsByPath ) {

			if ( ! p.startsWith( prefix ) ) continue;

			const spec = this.specsByPath[ p ];
			if ( spec.fields.typeName !== 'GeomSubset' ) continue;

			const attrs = this._getAttributeValues( p );
			const indices = attrs[ 'indices' ];
			if ( ! indices || indices.length === 0 ) continue;

			// Get material binding
			const bindingPath = p + '.material:binding';
			const bindingSpec = this.specsByPath[ bindingPath ];
			let materialPath = null;
			if ( bindingSpec && bindingSpec.fields.targetPaths && bindingSpec.fields.targetPaths.length > 0 ) {

				materialPath = bindingSpec.fields.targetPaths[ 0 ];

			}

			subsets.push( {
				name: this._getPathName( p ),
				indices: indices, // face indices
				materialPath: materialPath
			} );

		}

		return subsets;

	}

	_buildGeometryWithSubsets( fields, geomSubsets ) {

		const geometry = new BufferGeometry();

		// Get points
		const points = fields[ 'points' ];
		if ( ! points || points.length === 0 ) return geometry;

		// Get face data
		const faceVertexIndices = fields[ 'faceVertexIndices' ];
		const faceVertexCounts = fields[ 'faceVertexCounts' ];

		if ( ! faceVertexCounts || faceVertexCounts.length === 0 ) return geometry;

		// Get UVs
		const uvs = fields[ 'primvars:st' ] || fields[ 'primvars:UVMap' ];
		const uvIndices = fields[ 'primvars:st:indices' ];

		// Build face-to-triangle mapping
		// For each face, compute how many triangles it produces and at what offset
		const faceTriangleOffset = [];
		let triangleCount = 0;

		for ( let i = 0; i < faceVertexCounts.length; i ++ ) {

			faceTriangleOffset.push( triangleCount );
			const count = faceVertexCounts[ i ];
			if ( count >= 3 ) triangleCount += count - 2;

		}

		// Build triangle-to-subset mapping
		const triangleToSubset = new Int32Array( triangleCount ).fill( - 1 );

		for ( let si = 0; si < geomSubsets.length; si ++ ) {

			const subset = geomSubsets[ si ];

			for ( let i = 0; i < subset.indices.length; i ++ ) {

				const faceIdx = subset.indices[ i ];
				if ( faceIdx >= faceVertexCounts.length ) continue;

				const triStart = faceTriangleOffset[ faceIdx ];
				const triCount = faceVertexCounts[ faceIdx ] - 2;

				for ( let t = 0; t < triCount; t ++ ) {

					triangleToSubset[ triStart + t ] = si;

				}

			}

		}

		// Sort triangles by subset
		const sortedTriangles = [];

		for ( let tri = 0; tri < triangleCount; tri ++ ) {

			sortedTriangles.push( { original: tri, subset: triangleToSubset[ tri ] } );

		}

		// Sort: unassigned (-1) first, then by subset index
		sortedTriangles.sort( ( a, b ) => a.subset - b.subset );

		// Compute groups
		const groups = [];
		let currentSubset = sortedTriangles.length > 0 ? sortedTriangles[ 0 ].subset : - 1;
		let groupStart = 0;

		for ( let i = 0; i < sortedTriangles.length; i ++ ) {

			if ( sortedTriangles[ i ].subset !== currentSubset ) {

				if ( currentSubset >= 0 ) {

					groups.push( {
						start: groupStart * 3,
						count: ( i - groupStart ) * 3,
						materialIndex: currentSubset
					} );

				}

				currentSubset = sortedTriangles[ i ].subset;
				groupStart = i;

			}

		}

		// Add final group
		if ( currentSubset >= 0 && sortedTriangles.length > groupStart ) {

			groups.push( {
				start: groupStart * 3,
				count: ( sortedTriangles.length - groupStart ) * 3,
				materialIndex: currentSubset
			} );

		}

		// Apply groups to geometry
		for ( const group of groups ) {

			geometry.addGroup( group.start, group.count, group.materialIndex );

		}

		// Triangulate original data
		const origIndices = this._triangulateIndices( faceVertexIndices, faceVertexCounts );
		const origUvIndices = uvIndices ? this._triangulateIndices( uvIndices, faceVertexCounts ) : null;

		// Build reordered vertex data
		const vertexCount = triangleCount * 3;
		const positions = new Float32Array( vertexCount * 3 );
		const uvData = uvs ? new Float32Array( vertexCount * 2 ) : null;

		for ( let i = 0; i < sortedTriangles.length; i ++ ) {

			const origTri = sortedTriangles[ i ].original;

			for ( let v = 0; v < 3; v ++ ) {

				const origIdx = origTri * 3 + v;
				const newIdx = i * 3 + v;

				// Position
				const pointIdx = origIndices[ origIdx ];
				positions[ newIdx * 3 ] = points[ pointIdx * 3 ];
				positions[ newIdx * 3 + 1 ] = points[ pointIdx * 3 + 1 ];
				positions[ newIdx * 3 + 2 ] = points[ pointIdx * 3 + 2 ];

				// UVs
				if ( uvData && uvs ) {

					if ( origUvIndices ) {

						const uvIdx = origUvIndices[ origIdx ];
						uvData[ newIdx * 2 ] = uvs[ uvIdx * 2 ];
						uvData[ newIdx * 2 + 1 ] = uvs[ uvIdx * 2 + 1 ];

					} else if ( uvs.length / 2 === points.length / 3 ) {

						// Per-vertex UVs
						uvData[ newIdx * 2 ] = uvs[ pointIdx * 2 ];
						uvData[ newIdx * 2 + 1 ] = uvs[ pointIdx * 2 + 1 ];

					}

				}

			}

		}

		geometry.setAttribute( 'position', new BufferAttribute( positions, 3 ) );

		if ( uvData ) {

			geometry.setAttribute( 'uv', new BufferAttribute( uvData, 2 ) );

		}

		// Compute normals (simpler than reordering existing normals)
		geometry.computeVertexNormals();

		return geometry;

	}

	_buildMaterialForPath( materialPath ) {

		const material = new MeshPhysicalMaterial();

		if ( materialPath ) {

			this._applyMaterial( material, materialPath );

		}

		return material;

	}

	_getAttributeValues( primPath ) {

		// In USDC, attributes are stored as child specs with paths like /Mesh.points
		// The attribute value is in the 'default' field of the attribute spec
		const attrs = {};
		const prefix = primPath + '.';

		for ( const path in this.specsByPath ) {

			// Check if this is an attribute of the prim (path contains a dot after primPath)
			if ( ! path.startsWith( prefix ) ) continue;

			const spec = this.specsByPath[ path ];

			// Only process Attribute specs
			if ( spec.specType !== SpecType.Attribute ) continue;

			// Get attribute name (part after the dot)
			const attrName = path.slice( prefix.length );

			// Get the value from 'default' field
			if ( spec.fields.default !== undefined ) {

				attrs[ attrName ] = spec.fields.default;

			}

		}

		return attrs;

	}

	_applyTransform( obj, fields, attrs = {} ) {

		// Merge fields and attrs (attrs take precedence for transforms)
		const data = { ...fields, ...attrs };

		// Check for transform matrix
		const xformOpOrder = data[ 'xformOpOrder' ];

		if ( xformOpOrder && xformOpOrder.includes( 'xformOp:transform' ) ) {

			const matrix = data[ 'xformOp:transform' ];
			if ( matrix && matrix.length === 16 ) {

				obj.matrix.fromArray( matrix );
				obj.matrix.decompose( obj.position, obj.quaternion, obj.scale );

			}

		}

		// Handle individual transform ops
		if ( data[ 'xformOp:translate' ] ) {

			const t = data[ 'xformOp:translate' ];
			obj.position.set( t[ 0 ], t[ 1 ], t[ 2 ] );

		}

		if ( data[ 'xformOp:scale' ] ) {

			const s = data[ 'xformOp:scale' ];
			obj.scale.set( s[ 0 ], s[ 1 ], s[ 2 ] );

		}

		if ( data[ 'xformOp:rotateXYZ' ] ) {

			const r = data[ 'xformOp:rotateXYZ' ];
			obj.rotation.set(
				r[ 0 ] * Math.PI / 180,
				r[ 1 ] * Math.PI / 180,
				r[ 2 ] * Math.PI / 180
			);

		}

	}

	_buildGeometry( path, fields ) {

		const geometry = new BufferGeometry();

		// Get points
		const points = fields[ 'points' ];
		if ( ! points || points.length === 0 ) return geometry;

		// Get face vertex indices
		const faceVertexIndices = fields[ 'faceVertexIndices' ];
		const faceVertexCounts = fields[ 'faceVertexCounts' ];

		// Convert to triangle indices if needed
		let indices = faceVertexIndices;
		if ( faceVertexCounts && faceVertexCounts.length > 0 ) {

			indices = this._triangulateIndices( faceVertexIndices, faceVertexCounts );

		}

		// Build position attribute
		let positions = points;
		if ( indices && indices.length > 0 ) {

			positions = this._expandAttribute( points, indices, 3 );

		}

		geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( positions ), 3 ) );

		// Get normals
		const normals = fields[ 'normals' ] || fields[ 'primvars:normals' ];
		if ( normals && normals.length > 0 ) {

			let normalData = normals;
			if ( normals.length === points.length ) {

				// Per-vertex normals, expand by indices
				if ( indices && indices.length > 0 ) {

					normalData = this._expandAttribute( normals, indices, 3 );

				}

			} else if ( indices ) {

				// Per-face-vertex normals
				const normalIndices = this._triangulateIndices(
					Array.from( { length: normals.length / 3 }, ( _, i ) => i ),
					faceVertexCounts
				);
				normalData = this._expandAttribute( normals, normalIndices, 3 );

			}

			geometry.setAttribute( 'normal', new BufferAttribute( new Float32Array( normalData ), 3 ) );

		} else {

			geometry.computeVertexNormals();

		}

		// Get UVs
		const uvs = fields[ 'primvars:st' ] || fields[ 'primvars:UVMap' ];
		const uvIndices = fields[ 'primvars:st:indices' ];

		if ( uvs && uvs.length > 0 ) {

			let uvData = uvs;

			if ( uvIndices && uvIndices.length > 0 ) {

				// Custom UV indices
				const triangulatedUvIndices = this._triangulateIndices( uvIndices, faceVertexCounts );
				uvData = this._expandAttribute( uvs, triangulatedUvIndices, 2 );

			} else if ( indices && uvs.length / 2 === points.length / 3 ) {

				// Per-vertex UVs
				uvData = this._expandAttribute( uvs, indices, 2 );

			}

			geometry.setAttribute( 'uv', new BufferAttribute( new Float32Array( uvData ), 2 ) );

		}

		return geometry;

	}

	_triangulateIndices( indices, counts ) {

		const triangulated = [];
		let offset = 0;

		for ( let i = 0; i < counts.length; i ++ ) {

			const count = counts[ i ];

			if ( count === 3 ) {

				triangulated.push(
					indices[ offset ],
					indices[ offset + 1 ],
					indices[ offset + 2 ]
				);

			} else if ( count === 4 ) {

				// Quad to two triangles
				triangulated.push(
					indices[ offset ],
					indices[ offset + 1 ],
					indices[ offset + 2 ],
					indices[ offset ],
					indices[ offset + 2 ],
					indices[ offset + 3 ]
				);

			} else if ( count > 4 ) {

				// Fan triangulation for n-gons
				for ( let j = 1; j < count - 1; j ++ ) {

					triangulated.push(
						indices[ offset ],
						indices[ offset + j ],
						indices[ offset + j + 1 ]
					);

				}

			}

			offset += count;

		}

		return triangulated;

	}

	_expandAttribute( data, indices, itemSize ) {

		const expanded = new Float32Array( indices.length * itemSize );

		for ( let i = 0; i < indices.length; i ++ ) {

			const srcIndex = indices[ i ] * itemSize;
			const dstIndex = i * itemSize;

			for ( let j = 0; j < itemSize; j ++ ) {

				expanded[ dstIndex + j ] = data[ srcIndex + j ];

			}

		}

		return expanded;

	}

	_buildMaterial( meshPath, fields ) {

		const material = new MeshPhysicalMaterial();

		// Try to find material binding
		let materialPath = null;

		// Check for material binding in fields
		let materialBinding = fields[ 'material:binding' ];

		// Check for relationship spec on mesh directly
		if ( ! materialBinding ) {

			const bindingPath = meshPath + '.material:binding';
			const bindingSpec = this.specsByPath[ bindingPath ];
			if ( bindingSpec && bindingSpec.specType === SpecType.Relationship ) {

				materialBinding = bindingSpec.fields.targetPaths || bindingSpec.fields.default;

			}

		}

		if ( materialBinding ) {

			materialPath = Array.isArray( materialBinding ) ? materialBinding[ 0 ] : materialBinding;

		}

		// If no direct binding, check for GeomSubset children with material bindings
		if ( ! materialPath ) {

			const materialPaths = [];
			const prefix = meshPath + '/';

			for ( const path in this.specsByPath ) {

				// Look for material:binding specs under mesh path
				if ( ! path.startsWith( prefix ) ) continue;
				if ( ! path.endsWith( '.material:binding' ) ) continue;

				const bindingSpec = this.specsByPath[ path ];
				if ( ! bindingSpec ) continue;

				const targetPaths = bindingSpec.fields.targetPaths;
				if ( targetPaths && targetPaths.length > 0 ) {

					materialPaths.push( targetPaths[ 0 ] );

				}

			}

			// Pick a material that has textures if possible
			if ( materialPaths.length > 0 ) {

				materialPath = this._pickBestMaterial( materialPaths );

			}

		}

		// Fallback: try to find material in Looks hierarchy
		if ( ! materialPath ) {

			// Get root of mesh hierarchy (e.g., /chair_swan from /chair_swan/RedChairFeet)
			const meshParts = meshPath.split( '/' );
			const rootPath = '/' + meshParts[ 1 ];

			// Look for materials in /Root/Looks/ or /Root/Materials/
			for ( const path in this.specsByPath ) {

				const spec = this.specsByPath[ path ];
				if ( spec.specType !== SpecType.Prim ) continue;
				if ( spec.fields.typeName !== 'Material' ) continue;

				// Check if this material is in the same hierarchy
				if ( path.startsWith( rootPath + '/Looks/' ) ||
					path.startsWith( rootPath + '/Materials/' ) ) {

					materialPath = path;
					break;

				}

			}

		}

		if ( materialPath ) {

			this._applyMaterial( material, materialPath );

		}

		return material;

	}

	_pickBestMaterial( materialPaths ) {

		// Prefer materials that have texture files
		for ( const materialPath of materialPaths ) {

			const prefix = materialPath + '/';

			// Check if this material has any texture shaders
			for ( const path in this.specsByPath ) {

				if ( ! path.startsWith( prefix ) ) continue;

				const spec = this.specsByPath[ path ];
				if ( spec.fields.typeName !== 'Shader' ) continue;

				// Check for UsdUVTexture shader
				const attrs = this._getAttributeValues( path );
				if ( attrs[ 'info:id' ] === 'UsdUVTexture' && attrs[ 'inputs:file' ] ) {

					return materialPath;

				}

			}

		}

		// Fallback to first material
		return materialPaths[ 0 ];

	}

	_applyMaterial( material, materialPath ) {

		const materialSpec = this.specsByPath[ materialPath ];
		if ( ! materialSpec ) return;

		const prefix = materialPath + '/';

		// Look for shader children (UsdPreviewSurface)
		for ( const path in this.specsByPath ) {

			if ( ! path.startsWith( prefix ) ) continue;

			const spec = this.specsByPath[ path ];
			const typeName = spec.fields.typeName;

			if ( typeName !== 'Shader' ) continue;

			// Get shader attributes (info:id, inputs:*, etc.)
			const shaderAttrs = this._getAttributeValues( path );

			// Check for UsdPreviewSurface shader
			const infoId = shaderAttrs[ 'info:id' ] || spec.fields[ 'info:id' ];

			if ( infoId === 'UsdPreviewSurface' ) {

				this._applyPreviewSurface( material, path, materialPath );

			}

		}

	}

	_applyPreviewSurface( material, shaderPath, materialPath ) {

		const fields = this._getAttributeValues( shaderPath );

		// Helper to get attribute spec with connection info
		const getAttrSpec = ( attrName ) => {

			const attrPath = shaderPath + '.' + attrName;
			return this.specsByPath[ attrPath ];

		};

		// Helper to apply texture from connection
		const applyTextureFromConnection = ( attrName, textureProperty, colorSpace, valueCallback ) => {

			const spec = getAttrSpec( attrName );

			if ( spec && spec.fields.connectionPaths && spec.fields.connectionPaths.length > 0 ) {

				// Follow connection to texture shader
				const connPath = spec.fields.connectionPaths[ 0 ];
				const texture = this._getTextureFromConnection( connPath );

				if ( texture ) {

					texture.colorSpace = colorSpace;
					material[ textureProperty ] = texture;
					return true;

				}

			}

			// No texture connection, use default value if present
			if ( fields[ attrName ] !== undefined && valueCallback ) {

				valueCallback( fields[ attrName ] );

			}

			return false;

		};

		// Diffuse color / base color map
		const hasDiffuseMap = applyTextureFromConnection(
			'inputs:diffuseColor',
			'map',
			SRGBColorSpace,
			( color ) => {

				if ( Array.isArray( color ) && color.length >= 3 ) {

					material.color.setRGB( color[ 0 ], color[ 1 ], color[ 2 ] );

				}

			}
		);

		// Emissive
		applyTextureFromConnection(
			'inputs:emissiveColor',
			'emissiveMap',
			SRGBColorSpace,
			( color ) => {

				if ( Array.isArray( color ) && color.length >= 3 ) {

					material.emissive.setRGB( color[ 0 ], color[ 1 ], color[ 2 ] );

				}

			}
		);

		if ( material.emissiveMap ) {

			material.emissive.set( 0xffffff );

		}

		// Normal map
		applyTextureFromConnection( 'inputs:normal', 'normalMap', NoColorSpace, null );

		// Roughness
		const hasRoughnessMap = applyTextureFromConnection(
			'inputs:roughness',
			'roughnessMap',
			NoColorSpace,
			( value ) => {

				material.roughness = value;

			}
		);

		if ( hasRoughnessMap ) {

			material.roughness = 1.0;

		}

		// Metallic
		const hasMetalnessMap = applyTextureFromConnection(
			'inputs:metallic',
			'metalnessMap',
			NoColorSpace,
			( value ) => {

				material.metalness = value;

			}
		);

		if ( hasMetalnessMap ) {

			material.metalness = 1.0;

		}

		// Occlusion
		applyTextureFromConnection( 'inputs:occlusion', 'aoMap', NoColorSpace, null );

		// IOR
		if ( fields[ 'inputs:ior' ] !== undefined ) {

			material.ior = fields[ 'inputs:ior' ];

		}

		// Clearcoat
		if ( fields[ 'inputs:clearcoat' ] !== undefined ) {

			material.clearcoat = fields[ 'inputs:clearcoat' ];

		}

		// Clearcoat roughness
		if ( fields[ 'inputs:clearcoatRoughness' ] !== undefined ) {

			material.clearcoatRoughness = fields[ 'inputs:clearcoatRoughness' ];

		}

		// Fallback: if no diffuse map found via connections, try heuristic matching
		if ( ! hasDiffuseMap ) {

			this._applyTexturesFallback( material, materialPath );

		}

	}

	_getTextureFromConnection( connectionPath ) {

		// connectionPath is like "/Material/TextureShader.outputs:rgb"
		// Extract the shader path
		const dotIdx = connectionPath.lastIndexOf( '.' );
		if ( dotIdx === - 1 ) return null;

		const textureShaderPath = connectionPath.slice( 0, dotIdx );
		const textureShaderSpec = this.specsByPath[ textureShaderPath ];

		if ( ! textureShaderSpec || textureShaderSpec.fields.typeName !== 'Shader' ) return null;

		const textureAttrs = this._getAttributeValues( textureShaderPath );
		const infoId = textureAttrs[ 'info:id' ];

		if ( infoId !== 'UsdUVTexture' ) return null;

		const file = textureAttrs[ 'inputs:file' ];
		if ( ! file ) return null;

		const texture = this._loadTexture( file );
		if ( ! texture ) return null;

		// Apply wrap modes
		const wrapS = textureAttrs[ 'inputs:wrapS' ];
		const wrapT = textureAttrs[ 'inputs:wrapT' ];

		if ( wrapS ) texture.wrapS = this._getWrapMode( wrapS );
		if ( wrapT ) texture.wrapT = this._getWrapMode( wrapT );

		return texture;

	}

	_applyTexturesFallback( material, materialPath ) {

		const prefix = materialPath + '/';

		// Fallback heuristic: find texture samplers by name/file patterns
		for ( const path in this.specsByPath ) {

			if ( ! path.startsWith( prefix ) ) continue;

			const spec = this.specsByPath[ path ];
			const typeName = spec.fields.typeName;

			if ( typeName !== 'Shader' ) continue;

			const textureAttrs = this._getAttributeValues( path );
			const infoId = textureAttrs[ 'info:id' ] || spec.fields[ 'info:id' ];

			if ( infoId !== 'UsdUVTexture' ) continue;

			const file = textureAttrs[ 'inputs:file' ];
			if ( ! file ) continue;

			const shaderName = this._getPathName( path );
			const fileName = typeof file === 'string' ? file.toLowerCase() : '';

			const texture = this._loadTexture( file );
			if ( ! texture ) continue;

			const wrapS = textureAttrs[ 'inputs:wrapS' ];
			const wrapT = textureAttrs[ 'inputs:wrapT' ];

			if ( wrapS ) texture.wrapS = this._getWrapMode( wrapS );
			if ( wrapT ) texture.wrapT = this._getWrapMode( wrapT );

			const nameLower = shaderName.toLowerCase();

			if ( ! material.map && ( nameLower.includes( 'diffuse' ) ||
				nameLower.includes( 'basecolor' ) || nameLower.includes( 'albedo' ) ||
				fileName.includes( '_bc' ) || fileName.includes( '_diffuse' ) ||
				fileName.includes( '_albedo' ) ) ) {

				material.map = texture;
				material.map.colorSpace = SRGBColorSpace;

			} else if ( ! material.normalMap && ( nameLower.includes( 'normal' ) ||
				fileName.includes( '_n.' ) || fileName.includes( '_normal' ) ) ) {

				material.normalMap = texture;
				material.normalMap.colorSpace = NoColorSpace;

			} else if ( ! material.roughnessMap && ( nameLower.includes( 'roughness' ) ||
				fileName.includes( '_r.' ) || fileName.includes( '_roughness' ) ) ) {

				material.roughnessMap = texture;
				material.roughnessMap.colorSpace = NoColorSpace;
				material.roughness = 1.0;

			} else if ( ! material.metalnessMap && ( nameLower.includes( 'metallic' ) ||
				nameLower.includes( 'metalness' ) || fileName.includes( '_m.' ) ||
				fileName.includes( '_metallic' ) ) ) {

				material.metalnessMap = texture;
				material.metalnessMap.colorSpace = NoColorSpace;
				material.metalness = 1.0;

			} else if ( ! material.aoMap && ( nameLower.includes( 'occlusion' ) ||
				nameLower.includes( 'ao' ) || fileName.includes( '_ao' ) ||
				fileName.includes( '_occlusion' ) ) ) {

				material.aoMap = texture;
				material.aoMap.colorSpace = NoColorSpace;

			} else if ( ! material.emissiveMap && ( nameLower.includes( 'emissive' ) ||
				fileName.includes( '_emissive' ) ) ) {

				material.emissiveMap = texture;
				material.emissiveMap.colorSpace = SRGBColorSpace;
				material.emissive.set( 0xffffff );

			}

		}

	}

	_loadTexture( filePath ) {

		// Clean up path
		let cleanPath = filePath;
		if ( cleanPath.startsWith( '@' ) ) cleanPath = cleanPath.slice( 1 );
		if ( cleanPath.endsWith( '@' ) ) cleanPath = cleanPath.slice( 0, - 1 );
		if ( cleanPath.startsWith( './' ) ) cleanPath = cleanPath.slice( 2 );

		// Check cache first
		if ( this.textureCache[ cleanPath ] ) {

			return this.textureCache[ cleanPath ];

		}

		// Load from assets
		const assetUrl = this.assets[ cleanPath ];
		if ( assetUrl ) {

			const texture = this.textureLoader.load( assetUrl );
			this.textureCache[ cleanPath ] = texture;
			return texture;

		}

		return null;

	}

	_getWrapMode( mode ) {

		switch ( mode ) {

			case 'clamp': return ClampToEdgeWrapping;
			case 'mirror': return MirroredRepeatWrapping;
			case 'repeat': return RepeatWrapping;
			default: return RepeatWrapping;

		}

	}

}

export { USDCParser };
