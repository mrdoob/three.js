const textDecoder = new TextDecoder();

// Pre-computed half-float exponent lookup table for fast conversion
// Math.pow(2, exp - 15) for exp = 0..31
const HALF_EXPONENT_TABLE = new Float32Array( 32 );
for ( let i = 0; i < 32; i ++ ) {

	HALF_EXPONENT_TABLE[ i ] = Math.pow( 2, i - 15 );

}

// Pre-computed constant for denormalized half-floats: 2^-14
const HALF_DENORM_SCALE = Math.pow( 2, - 14 );

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

// Field set terminator marker
const FIELD_SET_TERMINATOR = 0xFFFFFFFF;

// Float compression type codes
const FLOAT_COMPRESSION_INT = 0x69; // 'i' - compressed as integers
const FLOAT_COMPRESSION_LUT = 0x74; // 't' - lookup table

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

	// TfFastCompression format (used by OpenUSD):
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

			const size = ( input[ headerOffset ] |
						( input[ headerOffset + 1 ] << 8 ) |
						( input[ headerOffset + 2 ] << 16 ) |
						( input[ headerOffset + 3 ] << 24 ) ) >>> 0;
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
			let delta = 0;

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
		let end = 0;
		while ( end < length && bytes[ end ] !== 0 ) end ++;
		return textDecoder.decode( bytes.subarray( 0, end ) );

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
		// Note: JavaScript numbers are IEEE 754 doubles with 53 bits of integer precision,
		// so 48-bit values are represented exactly without loss of precision.
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

	/**
	 * Parse USDC file and return raw spec data without building Three.js scene.
	 * Used by USDComposer for unified scene composition.
	 */
	parseData( buffer ) {

		this.buffer = buffer instanceof ArrayBuffer ? buffer : buffer.buffer;
		this.reader = new BinaryReader( this.buffer );
		this.version = { major: 0, minor: 0, patch: 0 };

		this._conversionBuffer = new ArrayBuffer( 4 );
		this._conversionView = new DataView( this._conversionBuffer );

		this._readBootstrap();
		this._readTOC();
		this._readTokens();
		this._readStrings();
		this._readFields();
		this._readFieldSets();
		this._readPaths();
		this._readSpecs();

		// Build specsByPath without building scene
		this.specsByPath = {};

		for ( const spec of this.specs ) {

			const path = this.paths[ spec.pathIndex ];
			if ( ! path ) continue;

			const fields = this._getFieldsForSpec( spec );
			this.specsByPath[ path ] = { specType: spec.specType, fields };

		}

		return { specsByPath: this.specsByPath };

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
				while ( strEnd < tokensData.length && tokensData[ strEnd ] !== 0 ) strEnd ++;

				this.tokens.push( textDecoder.decode( tokensData.subarray( strStart, strEnd ) ) );
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
				while ( strEnd < tokensData.length && tokensData[ strEnd ] !== 0 ) strEnd ++;

				this.tokens.push( textDecoder.decode( tokensData.subarray( strStart, strEnd ) ) );
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

		// Strings section has an 8-byte count prefix, but string indices stored
		// elsewhere in the file are relative to the section start (not the data).
		// So we read the entire section as uint32 values to maintain correct indexing.
		const numStrings = Math.floor( section.size / 4 );
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
			const numFields = Math.floor( section.size / 12 ); // 4 bytes token index + 8 bytes value rep

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
			const numFieldSets = Math.floor( section.size / 4 );

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
		if ( depth > 1000 ) return;

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

		// Handle TimeSamples specially - they have their own format
		if ( type === TypeEnum.TimeSamples ) {

			return this._readTimeSamples( valueRep );

		}

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
		const view = this._conversionView;

		switch ( type ) {

			case TypeEnum.Bool:
				return payload !== 0;
			case TypeEnum.UChar:
				return payload & 0xFF;
			case TypeEnum.Int:
			case TypeEnum.UInt:
				return payload;
			case TypeEnum.Float: {

				view.setUint32( 0, payload, true );
				return view.getFloat32( 0, true );

			}

			case TypeEnum.Double: {

				// When a double is inlined, it's stored as float32 bits in the payload
				view.setUint32( 0, payload, true );
				return view.getFloat32( 0, true );

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

			// Vec2h: Two half-floats fit in 4 bytes, stored directly
			case TypeEnum.Vec2h: {

				view.setUint32( 0, payload, true );
				return [ this._halfToFloat( view.getUint16( 0, true ) ), this._halfToFloat( view.getUint16( 2, true ) ) ];

			}

			// Inlined vectors that don't fit in 4 bytes are encoded as signed 8-bit integers
			// Vec2f = 8 bytes (2x float32), Vec3f = 12 bytes, Vec4f = 16 bytes, etc.
			case TypeEnum.Vec2f:
			case TypeEnum.Vec2i: {

				view.setUint32( 0, payload, true );
				return [ view.getInt8( 0 ), view.getInt8( 1 ) ];

			}

			case TypeEnum.Vec3f:
			case TypeEnum.Vec3i: {

				view.setUint32( 0, payload, true );
				return [ view.getInt8( 0 ), view.getInt8( 1 ), view.getInt8( 2 ) ];

			}

			case TypeEnum.Vec4f:
			case TypeEnum.Vec4i: {

				view.setUint32( 0, payload, true );
				return [ view.getInt8( 0 ), view.getInt8( 1 ), view.getInt8( 2 ), view.getInt8( 3 ) ];

			}

			case TypeEnum.Matrix2d: {

				// Inlined Matrix2d stores diagonal values as 2 signed int8 values
				view.setUint32( 0, payload, true );
				const d0 = view.getInt8( 0 ), d1 = view.getInt8( 1 );
				return [ d0, 0, 0, d1 ];

			}

			case TypeEnum.Matrix3d: {

				// Inlined Matrix3d stores diagonal values as 3 signed int8 values
				view.setUint32( 0, payload, true );
				const d0 = view.getInt8( 0 ), d1 = view.getInt8( 1 ), d2 = view.getInt8( 2 );
				return [ d0, 0, 0, 0, d1, 0, 0, 0, d2 ];

			}

			case TypeEnum.Matrix4d: {

				// Inlined Matrix4d stores diagonal values as 4 signed int8 values
				view.setUint32( 0, payload, true );
				const d0 = view.getInt8( 0 ), d1 = view.getInt8( 1 ), d2 = view.getInt8( 2 ), d3 = view.getInt8( 3 );
				return [ d0, 0, 0, 0, 0, d1, 0, 0, 0, 0, d2, 0, 0, 0, 0, d3 ];

			}

			default:
				return payload;

		}

	}

	_readTimeSamples( valueRep ) {

		const reader = this.reader;
		const offset = valueRep.payload;
		const savedOffset = reader.tell();
		reader.seek( offset );

		// TimeSamples format uses RELATIVE offsets (from OpenUSD _RecursiveRead):
		// _RecursiveRead: read int64 relativeOffset at current position, then seek to start + relativeOffset
		// After reading timesRep, continue reading from current position (after timesRep)
		// Layout at TimeSamples location:
		// - int64 timesOffset (relative from start of this int64)
		// At (start + timesOffset): timesRep ValueRep, then int64 valuesOffset, then numValues + ValueReps

		// Read times relative offset and resolve
		const timesStart = reader.tell();
		const timesRelOffset = reader.readInt64();
		reader.seek( timesStart + timesRelOffset );

		const timesRepLo = reader.readUint32();
		const timesRepHi = reader.readUint32();
		const timesRep = new ValueRep( timesRepLo, timesRepHi );

		// Resolve times array
		const times = this._readValue( timesRep );

		// Continue reading from current position (after timesRep)
		// The second _RecursiveRead reads from CURRENT position, not from the beginning
		const afterTimesRep = timesStart + timesRelOffset + 8;
		reader.seek( afterTimesRep );

		// Read values relative offset
		const valuesStart = reader.tell();
		const valuesRelOffset = reader.readInt64();
		reader.seek( valuesStart + valuesRelOffset );

		// Read number of values
		const numValues = reader.readUint64();

		// Read all ValueReps
		const valueReps = [];
		for ( let i = 0; i < numValues; i ++ ) {

			const repLo = reader.readUint32();
			const repHi = reader.readUint32();
			valueReps.push( new ValueRep( repLo, repHi ) );

		}

		// Resolve each value
		const values = [];
		for ( let i = 0; i < numValues; i ++ ) {

			values.push( this._readValue( valueReps[ i ] ) );

		}

		reader.seek( savedOffset );

		// Convert times to array if needed
		const timesArray = times instanceof Float64Array ? Array.from( times ) : ( Array.isArray( times ) ? times : [ times ] );

		return { times: timesArray, values };

	}

	_readScalarValue( type ) {

		const reader = this.reader;

		switch ( type ) {

			case TypeEnum.Invalid:
				return null;
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

			case TypeEnum.DoubleVector: {

				// DoubleVector is a count-prefixed array of doubles
				const count = reader.readUint64();
				const arr = new Float64Array( count );
				for ( let i = 0; i < count; i ++ ) arr[ i ] = reader.readFloat64();
				return arr;

			}

			case TypeEnum.Dictionary: {

				// Dictionary format:
				// u64 elementCount
				// For each element: u32 keyIndex + i64 valueOffset (relative)
				const elementCount = reader.readUint64();
				const dict = {};

				for ( let i = 0; i < elementCount; i ++ ) {

					const keyIdx = reader.readUint32();
					const key = this.tokens[ keyIdx ];

					// Value offset is relative to current position
					const currentPos = reader.position;
					const valueOffset = reader.readInt64();
					const valuePos = currentPos + valueOffset;

					// Save position, read value, restore position
					const savedPos = reader.position;
					reader.position = valuePos;

					// Read the value representation at the offset
					const valueRepData = reader.readUint64();
					const valueRep = new ValueRep( valueRepData );

					// Read the value based on the representation
					let value = null;
					if ( valueRep.isInlined ) {

						value = this._readInlinedValue( valueRep );

					} else if ( valueRep.isArray ) {

						reader.position = valueRep.payload;
						value = this._readArrayValue( valueRep );

					} else {

						reader.position = valueRep.payload;
						value = this._readScalarValue( valueRep.typeEnum );

					}

					reader.position = savedPos;

					if ( key !== undefined && value !== null ) {

						dict[ key ] = value;

					}

				}

				return dict;

			}

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

				// PathListOp format (from AOUSD Core Spec 16.3.10.25):
				// Header byte bitmask:
				// - bit 0 (0x01): Make Explicit (clears list)
				// - bit 1 (0x02): Add Explicit Items
				// - bit 2 (0x04): Add Items
				// - bit 3 (0x08): Delete Items
				// - bit 4 (0x10): Reorder Items
				// - bit 5 (0x20): Prepend Items
				// - bit 6 (0x40): Append Items
				// Arrays follow in order: Explicit, Add, Prepend, Append, Delete, Reorder
				// Each array: uint64 count + count * uint32 path indices
				const flags = reader.readUint8();
				const hasExplicitItems = ( flags & 0x02 ) !== 0;
				const hasAddItems = ( flags & 0x04 ) !== 0;
				const hasDeleteItems = ( flags & 0x08 ) !== 0;
				const hasReorderItems = ( flags & 0x10 ) !== 0;
				const hasPrependItems = ( flags & 0x20 ) !== 0;
				const hasAppendItems = ( flags & 0x40 ) !== 0;

				const readPathList = () => {

					const itemCount = reader.readUint64();
					const paths = [];
					for ( let i = 0; i < itemCount; i ++ ) {

						const pathIdx = reader.readUint32();
						paths.push( this.paths[ pathIdx ] );

					}

					return paths;

				};

				// Read arrays in spec order: Explicit, Add, Prepend, Append, Delete, Reorder
				let explicitPaths = null;
				let addPaths = null;
				let prependPaths = null;
				let appendPaths = null;

				if ( hasExplicitItems ) explicitPaths = readPathList();
				if ( hasAddItems ) addPaths = readPathList();
				if ( hasPrependItems ) prependPaths = readPathList();
				if ( hasAppendItems ) appendPaths = readPathList();
				if ( hasDeleteItems ) readPathList(); // Skip delete items
				if ( hasReorderItems ) readPathList(); // Skip reorder items

				// Return the first non-empty list (connections are typically prepended)
				if ( prependPaths && prependPaths.length > 0 ) return prependPaths;
				if ( explicitPaths && explicitPaths.length > 0 ) return explicitPaths;
				if ( appendPaths && appendPaths.length > 0 ) return appendPaths;
				if ( addPaths && addPaths.length > 0 ) return addPaths;

				return null;

			}

			case TypeEnum.VariantSelectionMap: {

				const elementCount = reader.readUint64();
				const map = {};

				for ( let i = 0; i < elementCount; i ++ ) {

					const keyIdx = reader.readUint32();
					const valueIdx = reader.readUint32();
					const key = this.tokens[ this.strings[ keyIdx ] ];
					const value = this.tokens[ this.strings[ valueIdx ] ];
					if ( key && value ) map[ key ] = value;

				}

				return map;

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

			case TypeEnum.Vec3h: {

				// Half-precision vec3 array (used for scales in skeletal animation)
				const arr = new Float32Array( size * 3 );
				for ( let i = 0; i < size * 3; i ++ ) arr[ i ] = this._readHalf();
				return arr;

			}

			case TypeEnum.Quatf: {

				const arr = new Float32Array( size * 4 );
				for ( let i = 0; i < size * 4; i ++ ) arr[ i ] = reader.readFloat32();
				return arr;

			}

			case TypeEnum.Quath: {

				// Half-precision quaternion array
				const arr = new Float32Array( size * 4 );
				for ( let i = 0; i < size * 4; i ++ ) arr[ i ] = this._readHalf();
				return arr;

			}

			case TypeEnum.Matrix4d: {

				// 4x4 matrix array (16 doubles per matrix, row-major)
				const arr = new Float64Array( size * 16 );
				for ( let i = 0; i < size * 16; i ++ ) arr[ i ] = reader.readFloat64();
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

				if ( code === FLOAT_COMPRESSION_INT ) {

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

				} else if ( code === FLOAT_COMPRESSION_LUT ) {

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

		return this._halfToFloat( this.reader.readUint16() );

	}

	_halfToFloat( h ) {

		const sign = ( h & 0x8000 ) >> 15;
		const exp = ( h & 0x7C00 ) >> 10;
		const frac = h & 0x03FF;

		if ( exp === 0 ) {

			// Zero or denormalized number
			if ( frac === 0 ) {

				return sign ? - 0 : 0;

			}

			// Denormalized: value = ±2^-14 × (frac/1024)
			return ( sign ? - 1 : 1 ) * HALF_DENORM_SCALE * ( frac / 1024 );

		} else if ( exp === 31 ) {

			return frac ? NaN : ( sign ? - Infinity : Infinity );

		}

		return ( sign ? - 1 : 1 ) * HALF_EXPONENT_TABLE[ exp ] * ( 1 + frac / 1024 );

	}

	_getFieldsForSpec( spec ) {

		const fields = {};
		let fieldSetIndex = spec.fieldSetIndex;

		// Field sets are terminated by FIELD_SET_TERMINATOR
		// Limit iterations to prevent infinite loops from malformed data
		const maxIterations = 10000;
		let iterations = 0;

		while ( fieldSetIndex < this.fieldSets.length && iterations < maxIterations ) {

			const fieldIndex = this.fieldSets[ fieldSetIndex ];

			// Terminator
			if ( fieldIndex === FIELD_SET_TERMINATOR || fieldIndex === - 1 ) break;

			const field = this.fields[ fieldIndex ];
			if ( field ) {

				const name = this.tokens[ field.tokenIndex ];
				const value = this._readValue( field.valueRep );
				fields[ name ] = value;

			}

			fieldSetIndex ++;
			iterations ++;

		}

		return fields;

	}

}

export { USDCParser };
