import WebGPUUniformBufferPool from '../../../../../src/renderers/webgpu/utils/WebGPUUniformBufferPool.js';
import UniformsGroup from '../../../../../src/renderers/common/UniformsGroup.js';
import UniformBuffer from '../../../../../src/renderers/common/UniformBuffer.js';
import { ColorUniform, NumberUniform, Matrix4Uniform } from '../../../../../src/renderers/common/Uniform.js';
import { Color } from '../../../../../src/math/Color.js';
import { Matrix4 } from '../../../../../src/math/Matrix4.js';

function createMockPool( alignment = 256, maxUniformBufferBindingSize = 16384 ) {

	const created = [];
	const uploads = [];
	const destroyed = [];

	const device = {
		limits: {
			minUniformBufferOffsetAlignment: alignment,
			maxUniformBufferBindingSize
		},
		createBuffer( descriptor ) {

			const id = created.length;
			const gpuBuffer = {
				id,
				byteLength: descriptor.size,
				memory: new Uint8Array( descriptor.size ),
				destroy() {

					destroyed.push( id );

				}
			};
			created.push( gpuBuffer );
			return gpuBuffer;

		},
		queue: {
			writeBuffer( bufferGPU, dstOffset, data, srcOffset, byteLength ) {

				bufferGPU.memory.set( data.subarray( srcOffset, srcOffset + byteLength ), dstOffset );
				uploads.push( { id: bufferGPU.id, byteOffset: dstOffset, byteLength } );

			}
		}
	};

	const pool = new WebGPUUniformBufferPool( device );

	return { pool, created, uploads, destroyed };

}

function makeGroup( floatCount ) {

	const group = new UniformsGroup( 'object' );
	const count = Math.ceil( floatCount / 16 );

	for ( let i = 0; i < count; i ++ ) {

		group.addUniform( new Matrix4Uniform( 'm' + i, new Matrix4() ) );

	}

	return group;

}

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGPU', () => {

		QUnit.module( 'WebGPUUniformBufferPool', () => {

			QUnit.test( 'canPool', ( assert ) => {

				const { pool } = createMockPool( 256, 1024 );

				const objectUniforms = new UniformsGroup( 'object' );
				objectUniforms.groupNode = { shared: false };
				objectUniforms.addUniform( new Matrix4Uniform( 'modelMatrix', new Matrix4() ) );

				assert.strictEqual( pool.canPool( objectUniforms ), true, 'non-shared UniformsGroup within size limit is pooled' );

				const sharedUniforms = new UniformsGroup( 'render' );
				sharedUniforms.groupNode = { shared: true };
				sharedUniforms.addUniform( new Matrix4Uniform( 'projectionMatrix', new Matrix4() ) );

				assert.strictEqual( pool.canPool( sharedUniforms ), false, 'shared UniformsGroup is not pooled' );

				const emptyUniforms = new UniformsGroup( 'empty' );
				assert.strictEqual( pool.canPool( emptyUniforms ), false, 'empty UniformsGroup is not pooled' );

				const rawUniformBuffer = new UniformBuffer( 'raw', new Float32Array( 16 ) );
				assert.strictEqual( pool.canPool( rawUniformBuffer ), false, 'non-UniformsGroup UniformBuffer is not pooled' );

				const oversizedUniforms = makeGroup( 20 * 16 );
				assert.strictEqual( pool.canPool( oversizedUniforms ), false, 'UniformsGroup exceeding maxPooledByteLength is not pooled' );

			} );

			QUnit.test( 'allocate, alignment, and free-list reuse', ( assert ) => {

				const { pool, created, destroyed } = createMockPool( 256 );

				const a0 = pool.allocate( makeGroup( 16 ) ); // 64B -> 256B
				const a1 = pool.allocate( makeGroup( 32 ) ); // 128B -> 256B
				const a2 = pool.allocate( makeGroup( 80 ) ); // 320B -> 512B

				assert.strictEqual( created.length, 1, 'allocations share initial 64 KiB slab' );
				assert.strictEqual( created[ 0 ].byteLength, 65536, 'initial slab is 64 KiB' );
				assert.strictEqual( a0.byteOffset, 0, 'first slot starts at 0' );
				assert.strictEqual( a1.byteOffset, 256, 'second slot is aligned to 256 bytes' );
				assert.strictEqual( a2.byteOffset, 512, 'third slot starts at 512 bytes' );
				assert.strictEqual( a2.alignedSize, 512, '320-byte allocation rounds up to 512 bytes' );

				pool.free( a1 );
				const a3 = pool.allocate( makeGroup( 32 ) );

				assert.strictEqual( a3.byteOffset, 256, 'freed 256-byte slot is reused' );

				pool.free( a0 );
				pool.free( a2 );
				pool.free( a3 );

				assert.strictEqual( a0.slab.activeCount, 0, 'slab activeCount reaches 0' );
				assert.strictEqual( a0.slab.cursor, 0, 'empty slab resets cursor' );

				const a4 = pool.allocate( makeGroup( 80 ) );
				assert.strictEqual( a4.byteOffset, 0, 'reset slab allocates 512-byte block at offset 0' );

				pool.dispose();
				assert.deepEqual( destroyed, [ 0 ], 'dispose destroys slab GPU buffer' );

			} );

			QUnit.test( 'markDirty and coalesced flush', ( assert ) => {

				const { pool, created, uploads } = createMockPool( 256 );
				const slots = [];

				for ( let i = 0; i < 256; i ++ ) {

					slots.push( pool.allocate( makeGroup( 16 ) ) );

				}

				for ( let i = 0; i < 256; i ++ ) {

					slots[ i ].view.fill( i + 1 );
					pool.markDirty( slots[ i ] );

				}

				pool.flush();
				assert.strictEqual( uploads.length, 1, '256 updates in slab coalesce into 1 upload' );

				const gpuFloats = new Float32Array( created[ 0 ].memory.buffer );
				assert.strictEqual( gpuFloats[ 0 ], 1, 'first slot data uploaded accurately' );
				assert.strictEqual( gpuFloats[ ( 255 * 256 ) >>> 2 ], 256, 'last slot data uploaded accurately' );

				uploads.length = 0;
				pool.flush();
				assert.strictEqual( uploads.length, 0, 'clean flush issues zero uploads' );

				slots[ 10 ].view[ 0 ] = 42;
				pool.markDirty( slots[ 10 ] );
				pool.flush();

				assert.strictEqual( uploads.length, 1, 'single dirty slot issues 1 upload' );
				assert.strictEqual( uploads[ 0 ].byteOffset, 10 * 256, 'upload starts at exact slot offset' );
				assert.strictEqual( uploads[ 0 ].byteLength, 64, 'upload transfers only slot byteLength' );

				const group = new UniformsGroup( 'test' );
				group.addUniform( new NumberUniform( 'u', 1 ) );
				assert.strictEqual( group.byteLength, 16, 'single float uniform aligns to 16-byte chunk' );

				pool.dispose();

			} );

			QUnit.test( 'zero-copy subarray view and reused slot zero-value update', ( assert ) => {

				const { pool, created, uploads } = createMockPool( 256 );

				const group1 = new UniformsGroup( 'object' );
				group1.addUniform( new ColorUniform( 'color', new Color( 0.75, 0.5, 0.25 ) ) );

				const alloc1 = pool.allocate( group1 );

				assert.strictEqual( group1.buffer, alloc1.view, 'group1 writes directly into slab view' );
				assert.strictEqual( group1.update(), true, 'group1 detects initial non-zero value' );
				assert.strictEqual( group1.updateRanges.length, 0, 'pooled group skips updateRanges tracking' );

				pool.markDirty( alloc1 );
				pool.flush();

				const gpuFloats = new Float32Array( created[ 0 ].memory.buffer );
				assert.strictEqual( gpuFloats[ 0 ], 0.75, 'initial 0.75 value uploaded to GPU slab' );

				group1.release();
				pool.free( alloc1 );
				uploads.length = 0;

				const group2 = new UniformsGroup( 'object' );
				group2.addUniform( new ColorUniform( 'color', new Color( 0, 0, 0 ) ) );

				const alloc2 = pool.allocate( group2 );
				assert.strictEqual( alloc2.byteOffset, alloc1.byteOffset, 'slot reused at offset 0' );
				assert.strictEqual( group2.update(), true, 'group2 detects (0,0,0) differs from previous tenant' );

				pool.markDirty( alloc2 );
				pool.flush();

				assert.strictEqual( uploads.length, 1, 'zero-value overwrite uploaded to GPU' );
				assert.strictEqual( gpuFloats[ 0 ], 0.0, 'GPU slab updated from 0.75 back to 0.0' );

				pool.dispose();

			} );

		} );

	} );

} );
