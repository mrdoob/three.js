import { WebGLAttributes } from '../../../../../src/renderers/webgl/WebGLAttributes.js';
import {
	BufferAttribute,
	Float32BufferAttribute,
	Float16BufferAttribute,
	Uint16BufferAttribute,
	Int16BufferAttribute,
	Uint32BufferAttribute,
	Int32BufferAttribute,
	Int8BufferAttribute,
	Uint8BufferAttribute,
	Uint8ClampedBufferAttribute
} from '../../../../../src/core/BufferAttribute.js';
import { InterleavedBuffer } from '../../../../../src/core/InterleavedBuffer.js';
import { InterleavedBufferAttribute } from '../../../../../src/core/InterleavedBufferAttribute.js';
import { GLBufferAttribute } from '../../../../../src/core/GLBufferAttribute.js';
import { DynamicDrawUsage } from '../../../../../src/constants.js';

// Records buffer traffic. Buffer handles are unique objects so identity can be
// asserted, and the type constants are sentinels rather than real enums.
function mockContext() {

	const calls = [];
	let nextBuffer = 0;

	return {
		calls,
		FLOAT: 'FLOAT',
		HALF_FLOAT: 'HALF_FLOAT',
		UNSIGNED_SHORT: 'UNSIGNED_SHORT',
		SHORT: 'SHORT',
		UNSIGNED_INT: 'UNSIGNED_INT',
		INT: 'INT',
		BYTE: 'BYTE',
		UNSIGNED_BYTE: 'UNSIGNED_BYTE',
		ARRAY_BUFFER: 'ARRAY_BUFFER',
		ELEMENT_ARRAY_BUFFER: 'ELEMENT_ARRAY_BUFFER',
		createBuffer() {

			const buffer = { id: nextBuffer ++ };
			calls.push( [ 'createBuffer', buffer ] );
			return buffer;

		},
		bindBuffer( ...args ) {

			calls.push( [ 'bindBuffer', ...args ] );

		},
		bufferData( ...args ) {

			calls.push( [ 'bufferData', ...args ] );

		},
		bufferSubData( ...args ) {

			calls.push( [ 'bufferSubData', ...args ] );

		},
		deleteBuffer( ...args ) {

			calls.push( [ 'deleteBuffer', ...args ] );

		},
		callsOf( name ) {

			return calls.filter( c => c[ 0 ] === name );

		}
	};

}

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module( 'WebGLAttributes', () => {

			// INSTANCING
			QUnit.test( 'Instancing - exposes the expected API', ( assert ) => {

				const attributes = new WebGLAttributes( mockContext() );

				for ( const method of [ 'get', 'remove', 'update' ] ) {

					assert.strictEqual( typeof attributes[ method ], 'function', `${ method }() is exposed` );

				}

			} );

			// get
			QUnit.test( 'get - returns undefined for an attribute that was never uploaded', ( assert ) => {

				const attributes = new WebGLAttributes( mockContext() );

				assert.strictEqual( attributes.get( new Float32BufferAttribute( [ 1, 2, 3 ], 1 ) ), undefined, 'nothing is cached yet' );

			} );

			// update - creation
			QUnit.test( 'update - creates and fills a buffer on first upload', ( assert ) => {

				const gl = mockContext();
				const attributes = new WebGLAttributes( gl );
				const attribute = new Float32BufferAttribute( [ 1, 2, 3 ], 1 );

				attributes.update( attribute, gl.ARRAY_BUFFER );

				assert.deepEqual(
					gl.calls.map( c => c[ 0 ] ),
					[ 'createBuffer', 'bindBuffer', 'bufferData' ],
					'the buffer is created, bound and filled'
				);
				assert.strictEqual( gl.calls[ 2 ][ 1 ], gl.ARRAY_BUFFER, 'the requested buffer type is used' );
				assert.strictEqual( gl.calls[ 2 ][ 2 ], attribute.array, 'the attribute array is uploaded' );
				assert.strictEqual( gl.calls[ 2 ][ 3 ], attribute.usage, 'the attribute usage hint is passed along' );

			} );

			QUnit.test( 'update - records the buffer description', ( assert ) => {

				const gl = mockContext();
				const attributes = new WebGLAttributes( gl );
				const attribute = new Float32BufferAttribute( [ 1, 2, 3 ], 1 );

				attributes.update( attribute, gl.ARRAY_BUFFER );

				const data = attributes.get( attribute );

				assert.strictEqual( data.buffer, gl.calls[ 0 ][ 1 ], 'the created buffer handle is stored' );
				assert.strictEqual( data.type, gl.FLOAT, 'the element type is derived from the array' );
				assert.strictEqual( data.bytesPerElement, 4, 'the element size is recorded' );
				assert.strictEqual( data.version, attribute.version, 'the uploaded version is recorded' );
				assert.strictEqual( data.size, attribute.array.byteLength, 'the byte length is recorded' );

			} );

			QUnit.test( 'update - honours a dynamic usage hint', ( assert ) => {

				const gl = mockContext();
				const attributes = new WebGLAttributes( gl );

				const attribute = new Float32BufferAttribute( [ 1, 2, 3 ], 1 );
				attribute.setUsage( DynamicDrawUsage );

				attributes.update( attribute, gl.ARRAY_BUFFER );

				assert.strictEqual( gl.callsOf( 'bufferData' )[ 0 ][ 3 ], DynamicDrawUsage, 'the dynamic hint reaches bufferData' );

			} );

			QUnit.test( 'update - invokes the upload callback', ( assert ) => {

				const gl = mockContext();
				const attributes = new WebGLAttributes( gl );

				let called = 0;
				const attribute = new Float32BufferAttribute( [ 1, 2, 3 ], 1 );
				attribute.onUpload( () => called ++ );

				attributes.update( attribute, gl.ARRAY_BUFFER );

				assert.strictEqual( called, 1, 'the callback fires once the data is uploaded' );

			} );

			// update - type mapping
			QUnit.test( 'update - derives the element type from the array type', ( assert ) => {

				const gl = mockContext();
				const attributes = new WebGLAttributes( gl );

				const cases = [
					[ new Float32BufferAttribute( [ 1 ], 1 ), gl.FLOAT ],
					[ new Uint16BufferAttribute( [ 1 ], 1 ), gl.UNSIGNED_SHORT ],
					[ new Int16BufferAttribute( [ 1 ], 1 ), gl.SHORT ],
					[ new Uint32BufferAttribute( [ 1 ], 1 ), gl.UNSIGNED_INT ],
					[ new Int32BufferAttribute( [ 1 ], 1 ), gl.INT ],
					[ new Int8BufferAttribute( [ 1 ], 1 ), gl.BYTE ],
					[ new Uint8BufferAttribute( [ 1 ], 1 ), gl.UNSIGNED_BYTE ],
					[ new Uint8ClampedBufferAttribute( [ 1 ], 1 ), gl.UNSIGNED_BYTE ]
				];

				for ( const [ attribute, type ] of cases ) {

					attributes.update( attribute, gl.ARRAY_BUFFER );
					assert.strictEqual( attributes.get( attribute ).type, type, `${ attribute.array.constructor.name } maps to ${ type }` );

				}

			} );

			QUnit.test( 'update - distinguishes half float from unsigned short', ( assert ) => {

				// Both are backed by a Uint16Array, so the flag on the attribute
				// is the only thing that tells them apart.
				const gl = mockContext();
				const attributes = new WebGLAttributes( gl );

				const half = new Float16BufferAttribute( [ 1, 2 ], 1 );
				const ushort = new Uint16BufferAttribute( [ 1, 2 ], 1 );

				attributes.update( half, gl.ARRAY_BUFFER );
				attributes.update( ushort, gl.ARRAY_BUFFER );

				assert.strictEqual( attributes.get( half ).type, gl.HALF_FLOAT, 'a float16 attribute uploads as half float' );
				assert.strictEqual( attributes.get( ushort ).type, gl.UNSIGNED_SHORT, 'a plain uint16 attribute uploads as unsigned short' );

			} );

			QUnit.test( 'update - throws on an unsupported array type', ( assert ) => {

				const gl = mockContext();
				const attributes = new WebGLAttributes( gl );

				const attribute = new BufferAttribute( new Float64Array( [ 1, 2 ] ), 1 );

				assert.throws(
					() => attributes.update( attribute, gl.ARRAY_BUFFER ),
					/Unsupported buffer data format/,
					'a Float64Array cannot be uploaded'
				);

			} );

			// update - caching
			QUnit.test( 'update - does nothing when the version is unchanged', ( assert ) => {

				const gl = mockContext();
				const attributes = new WebGLAttributes( gl );
				const attribute = new Float32BufferAttribute( [ 1, 2, 3 ], 1 );

				attributes.update( attribute, gl.ARRAY_BUFFER );
				const callCount = gl.calls.length;

				attributes.update( attribute, gl.ARRAY_BUFFER );

				assert.strictEqual( gl.calls.length, callCount, 'no further GL calls are issued' );

			} );

			QUnit.test( 'update - re-uploads the whole array when the version advances', ( assert ) => {

				const gl = mockContext();
				const attributes = new WebGLAttributes( gl );
				const attribute = new Float32BufferAttribute( [ 1, 2, 3 ], 1 );

				attributes.update( attribute, gl.ARRAY_BUFFER );
				attribute.needsUpdate = true;
				attributes.update( attribute, gl.ARRAY_BUFFER );

				const subData = gl.callsOf( 'bufferSubData' );

				assert.strictEqual( subData.length, 1, 'the data is patched rather than reallocated' );
				assert.deepEqual( subData[ 0 ].slice( 1 ), [ gl.ARRAY_BUFFER, 0, attribute.array ], 'the full array is written from offset 0' );
				assert.strictEqual( gl.callsOf( 'createBuffer' ).length, 1, 'the buffer is not recreated' );
				assert.strictEqual( attributes.get( attribute ).version, attribute.version, 'the recorded version catches up' );

			} );

			QUnit.test( 'update - refuses to resize an existing buffer', ( assert ) => {

				// The GPU buffer was allocated at a fixed size, so growing the
				// attribute array is an error rather than a silent reallocation.
				const gl = mockContext();
				const attributes = new WebGLAttributes( gl );
				const attribute = new Float32BufferAttribute( [ 1, 2, 3 ], 1 );

				attributes.update( attribute, gl.ARRAY_BUFFER );

				attribute.array = new Float32Array( [ 1, 2, 3, 4 ] );
				attribute.needsUpdate = true;

				assert.throws(
					() => attributes.update( attribute, gl.ARRAY_BUFFER ),
					/Resizing buffer attributes is not supported/,
					'a resized array is rejected'
				);

			} );

			// update - update ranges
			QUnit.test( 'update - writes only the requested ranges', ( assert ) => {

				const gl = mockContext();
				const attributes = new WebGLAttributes( gl );
				const attribute = new Float32BufferAttribute( [ 0, 1, 2, 3, 4, 5, 6, 7 ], 1 );

				attributes.update( attribute, gl.ARRAY_BUFFER );

				attribute.addUpdateRange( 0, 1 );
				attribute.addUpdateRange( 5, 2 );
				attribute.needsUpdate = true;
				attributes.update( attribute, gl.ARRAY_BUFFER );

				const subData = gl.callsOf( 'bufferSubData' ).map( c => c.slice( 1 ) );

				assert.deepEqual(
					subData,
					[
						[ gl.ARRAY_BUFFER, 0 * 4, attribute.array, 0, 1 ],
						[ gl.ARRAY_BUFFER, 5 * 4, attribute.array, 5, 2 ]
					],
					'each disjoint range becomes its own byte-offset write'
				);

			} );

			QUnit.test( 'update - merges overlapping ranges into one write', ( assert ) => {

				const gl = mockContext();
				const attributes = new WebGLAttributes( gl );
				const attribute = new Float32BufferAttribute( [ 0, 1, 2, 3, 4, 5, 6, 7 ], 1 );

				attributes.update( attribute, gl.ARRAY_BUFFER );

				attribute.addUpdateRange( 0, 4 );
				attribute.addUpdateRange( 2, 4 );
				attribute.needsUpdate = true;
				attributes.update( attribute, gl.ARRAY_BUFFER );

				const subData = gl.callsOf( 'bufferSubData' );

				assert.strictEqual( subData.length, 1, 'the overlap collapses to a single write' );
				assert.deepEqual( subData[ 0 ].slice( 4 ), [ 0, 6 ], 'the merged range spans both inputs' );

			} );

			QUnit.test( 'update - merges adjacent ranges into one write', ( assert ) => {

				// Ranges that touch are worth merging -- it saves a call, and in
				// this exactly-adjacent case writes nothing that was not
				// requested. Note the merge rule is deliberately wider than this:
				// see the one-element-gap test below.
				const gl = mockContext();
				const attributes = new WebGLAttributes( gl );
				const attribute = new Float32BufferAttribute( [ 0, 1, 2, 3, 4, 5, 6, 7 ], 1 );

				attributes.update( attribute, gl.ARRAY_BUFFER );

				attribute.addUpdateRange( 0, 2 );
				attribute.addUpdateRange( 2, 2 );
				attribute.needsUpdate = true;
				attributes.update( attribute, gl.ARRAY_BUFFER );

				const subData = gl.callsOf( 'bufferSubData' );

				assert.strictEqual( subData.length, 1, 'the adjacent ranges collapse to a single write' );
				assert.deepEqual( subData[ 0 ].slice( 4 ), [ 0, 4 ], 'the merged range covers both' );

			} );

			QUnit.test( 'update - bridges a one-element gap between ranges', ( assert ) => {

				// The merge condition is `range.start <= previousRange.start +
				// previousRange.count + 1`. That trailing `+ 1` is deliberate
				// (see the comment in WebGLAttributes.js): it bridges a gap of a
				// single element, trading one extra element in the upload for one
				// fewer draw call. This is the only case that `+ 1` affects, so
				// without this test it could be deleted from the source without
				// failing anything.
				const gl = mockContext();
				const attributes = new WebGLAttributes( gl );
				const attribute = new Float32BufferAttribute( [ 0, 1, 2, 3, 4, 5, 6, 7 ], 1 );

				attributes.update( attribute, gl.ARRAY_BUFFER );

				// Index 2 is requested by neither range.
				attribute.addUpdateRange( 0, 2 );
				attribute.addUpdateRange( 3, 2 );
				attribute.needsUpdate = true;
				attributes.update( attribute, gl.ARRAY_BUFFER );

				const subData = gl.callsOf( 'bufferSubData' );

				assert.strictEqual( subData.length, 1, 'the one-element gap is bridged into a single write' );
				assert.deepEqual( subData[ 0 ].slice( 4 ), [ 0, 5 ], 'the merged range spans the gap, covering the unrequested element' );

			} );

			QUnit.test( 'update - keeps ranges separated by more than one element apart', ( assert ) => {

				// A gap of two falls outside the `+ 1` window, so this is the
				// boundary on the other side of the test above.
				const gl = mockContext();
				const attributes = new WebGLAttributes( gl );
				const attribute = new Float32BufferAttribute( [ 0, 1, 2, 3, 4, 5, 6, 7 ], 1 );

				attributes.update( attribute, gl.ARRAY_BUFFER );

				attribute.addUpdateRange( 0, 2 );
				attribute.addUpdateRange( 4, 2 );
				attribute.needsUpdate = true;
				attributes.update( attribute, gl.ARRAY_BUFFER );

				const subData = gl.callsOf( 'bufferSubData' );

				assert.strictEqual( subData.length, 2, 'a two-element gap is not bridged' );
				assert.deepEqual( subData[ 0 ].slice( 4 ), [ 0, 2 ], 'the first range is written on its own' );
				assert.deepEqual( subData[ 1 ].slice( 4 ), [ 4, 2 ], 'the second range is written on its own' );

			} );

			QUnit.test( 'update - sorts ranges before merging them', ( assert ) => {

				const gl = mockContext();
				const attributes = new WebGLAttributes( gl );
				const attribute = new Float32BufferAttribute( [ 0, 1, 2, 3, 4, 5, 6, 7 ], 1 );

				attributes.update( attribute, gl.ARRAY_BUFFER );

				// Added out of order -- the merge only works on sorted input.
				attribute.addUpdateRange( 4, 2 );
				attribute.addUpdateRange( 0, 2 );
				attribute.addUpdateRange( 2, 2 );
				attribute.needsUpdate = true;
				attributes.update( attribute, gl.ARRAY_BUFFER );

				const subData = gl.callsOf( 'bufferSubData' );

				assert.strictEqual( subData.length, 1, 'all three ranges collapse into one' );
				assert.deepEqual( subData[ 0 ].slice( 4 ), [ 0, 6 ], 'the merged range covers the whole span' );

			} );

			QUnit.test( 'update - keeps a fully contained range from shrinking the merge', ( assert ) => {

				const gl = mockContext();
				const attributes = new WebGLAttributes( gl );
				const attribute = new Float32BufferAttribute( [ 0, 1, 2, 3, 4, 5, 6, 7 ], 1 );

				attributes.update( attribute, gl.ARRAY_BUFFER );

				attribute.addUpdateRange( 0, 6 );
				attribute.addUpdateRange( 2, 1 );
				attribute.needsUpdate = true;
				attributes.update( attribute, gl.ARRAY_BUFFER );

				assert.deepEqual(
					gl.callsOf( 'bufferSubData' )[ 0 ].slice( 4 ),
					[ 0, 6 ],
					'the enclosing range is not shortened by the one inside it'
				);

			} );

			QUnit.test( 'update - clears the ranges after applying them', ( assert ) => {

				// Otherwise the next upload would replay stale ranges.
				const gl = mockContext();
				const attributes = new WebGLAttributes( gl );
				const attribute = new Float32BufferAttribute( [ 0, 1, 2, 3 ], 1 );

				attributes.update( attribute, gl.ARRAY_BUFFER );

				attribute.addUpdateRange( 0, 2 );
				attribute.needsUpdate = true;
				attributes.update( attribute, gl.ARRAY_BUFFER );

				assert.strictEqual( attribute.updateRanges.length, 0, 'the update ranges are emptied' );

			} );

			// interleaved attributes
			QUnit.test( 'update - uploads the shared buffer behind an interleaved attribute', ( assert ) => {

				// Interleaved attributes are views onto one InterleavedBuffer, so
				// the buffer -- not the view -- is what gets uploaded and cached.
				const gl = mockContext();
				const attributes = new WebGLAttributes( gl );

				const buffer = new InterleavedBuffer( new Float32Array( [ 1, 2, 3, 4, 5, 6 ] ), 3 );
				const a = new InterleavedBufferAttribute( buffer, 2, 0 );
				const b = new InterleavedBufferAttribute( buffer, 1, 2 );

				attributes.update( a, gl.ARRAY_BUFFER );
				attributes.update( b, gl.ARRAY_BUFFER );

				assert.strictEqual( gl.callsOf( 'createBuffer' ).length, 1, 'the shared buffer is only created once' );
				assert.strictEqual( attributes.get( a ), attributes.get( b ), 'both views resolve to the same buffer record' );
				assert.strictEqual( attributes.get( a ), attributes.get( buffer ), 'the record is keyed on the interleaved buffer' );

			} );

			// GLBufferAttribute
			QUnit.test( 'update - adopts an externally managed buffer as-is', ( assert ) => {

				// GLBufferAttribute wraps a buffer the application created, so
				// there is nothing to allocate or upload.
				const gl = mockContext();
				const attributes = new WebGLAttributes( gl );

				const externalBuffer = { external: true };
				const attribute = new GLBufferAttribute( externalBuffer, gl.FLOAT, 3, 4, 2 );

				attributes.update( attribute, gl.ARRAY_BUFFER );

				assert.deepEqual( gl.calls, [], 'no GL calls are issued' );

				const data = attributes.get( attribute );

				assert.strictEqual( data.buffer, externalBuffer, 'the supplied buffer is stored' );
				assert.strictEqual( data.type, gl.FLOAT, 'the supplied type is stored' );
				assert.strictEqual( data.bytesPerElement, 4, 'the element size comes from elementSize' );

			} );

			QUnit.test( 'update - refreshes an external buffer when its version advances', ( assert ) => {

				const gl = mockContext();
				const attributes = new WebGLAttributes( gl );

				const attribute = new GLBufferAttribute( { id: 'first' }, gl.FLOAT, 3, 4, 2 );
				attributes.update( attribute, gl.ARRAY_BUFFER );

				attribute.buffer = { id: 'second' };
				attribute.version ++;
				attributes.update( attribute, gl.ARRAY_BUFFER );

				assert.strictEqual( attributes.get( attribute ).buffer.id, 'second', 'the new buffer replaces the cached one' );

			} );

			// remove
			QUnit.test( 'remove - deletes the buffer and forgets the attribute', ( assert ) => {

				const gl = mockContext();
				const attributes = new WebGLAttributes( gl );
				const attribute = new Float32BufferAttribute( [ 1, 2, 3 ], 1 );

				attributes.update( attribute, gl.ARRAY_BUFFER );
				const handle = attributes.get( attribute ).buffer;

				attributes.remove( attribute );

				assert.deepEqual( gl.callsOf( 'deleteBuffer' ), [[ 'deleteBuffer', handle ]], 'the GPU buffer is deleted' );
				assert.strictEqual( attributes.get( attribute ), undefined, 'the attribute is no longer cached' );

			} );

			QUnit.test( 'remove - is a no-op for an attribute that was never uploaded', ( assert ) => {

				const gl = mockContext();
				const attributes = new WebGLAttributes( gl );

				attributes.remove( new Float32BufferAttribute( [ 1 ], 1 ) );

				assert.deepEqual( gl.callsOf( 'deleteBuffer' ), [], 'nothing is deleted' );

			} );

			QUnit.test( 'remove - resolves an interleaved attribute to its buffer', ( assert ) => {

				const gl = mockContext();
				const attributes = new WebGLAttributes( gl );

				const buffer = new InterleavedBuffer( new Float32Array( [ 1, 2, 3, 4 ] ), 2 );
				const view = new InterleavedBufferAttribute( buffer, 2, 0 );

				attributes.update( view, gl.ARRAY_BUFFER );
				attributes.remove( view );

				assert.strictEqual( attributes.get( buffer ), undefined, 'removing a view drops the shared buffer' );

			} );

			QUnit.test( 'remove - allows the attribute to be uploaded again', ( assert ) => {

				const gl = mockContext();
				const attributes = new WebGLAttributes( gl );
				const attribute = new Float32BufferAttribute( [ 1, 2, 3 ], 1 );

				attributes.update( attribute, gl.ARRAY_BUFFER );
				attributes.remove( attribute );
				attributes.update( attribute, gl.ARRAY_BUFFER );

				assert.strictEqual( gl.callsOf( 'createBuffer' ).length, 2, 'a fresh buffer is allocated' );

			} );

		} );

	} );

} );
