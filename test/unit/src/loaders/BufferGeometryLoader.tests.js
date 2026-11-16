import { BufferGeometryLoader } from '../../../../src/loaders/BufferGeometryLoader.js';

import { BufferAttribute } from '../../../../src/core/BufferAttribute.js';
import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { InstancedBufferAttribute } from '../../../../src/core/InstancedBufferAttribute.js';
import { InstancedBufferGeometry } from '../../../../src/core/InstancedBufferGeometry.js';
import { InstancedInterleavedBuffer } from '../../../../src/core/InstancedInterleavedBuffer.js';
import { InterleavedBuffer } from '../../../../src/core/InterleavedBuffer.js';
import { InterleavedBufferAttribute } from '../../../../src/core/InterleavedBufferAttribute.js';
import { DynamicDrawUsage } from '../../../../src/constants.js';
import { Loader } from '../../../../src/loaders/Loader.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'BufferGeometryLoader', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new BufferGeometryLoader();
			assert.strictEqual(
				object instanceof Loader, true,
				'BufferGeometryLoader extends from Loader'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new BufferGeometryLoader();
			assert.ok( object, 'Can instantiate a BufferGeometryLoader.' );

		} );

		// OTHERS
		QUnit.test( 'parser - attributes - circlable', ( assert ) => {

			const loader = new BufferGeometryLoader();
			const geometry = new BufferGeometry();
			const attr = new BufferAttribute( new Float32Array( [ 7, 8, 9, 10, 11, 12 ] ), 2, true );
			attr.name = 'attribute';
			attr.setUsage( DynamicDrawUsage );

			geometry.setAttribute( 'attr', attr );

			const geometry2 = loader.parse( geometry.toJSON() );

			assert.ok( geometry2.getAttribute( 'attr' ),
				'Serialized attribute can be deserialized under the same attribute key.' );

			assert.deepEqual(
				geometry.getAttribute( 'attr' ),
				geometry2.getAttribute( 'attr' ),
				'Serialized attribute can be deserialized correctly.'
			);

		} );

		QUnit.test( 'parser - interleaved attributes - views into a shared array buffer', ( assert ) => {

			// e.g. GLTFLoader creates interleaved buffers as views at different offsets into one array buffer

			const buffer = new Float32Array( [ 1, 2, 3, 0, 4, 5, 6, 0, 7, 8, 9, 0, 10, 11, 12, 0 ] ).buffer;
			const position = new InterleavedBufferAttribute( new InterleavedBuffer( new Float32Array( buffer, 0, 8 ), 4 ), 3, 0 );
			const normal = new InterleavedBufferAttribute( new InterleavedBuffer( new Float32Array( buffer, 32, 8 ), 4 ), 3, 0 );

			const geometry = new BufferGeometry();
			geometry.setAttribute( 'position', position );
			geometry.setAttribute( 'normal', normal );

			const geometry2 = new BufferGeometryLoader().parse( geometry.toJSON() );

			assert.deepEqual( Array.from( geometry2.getAttribute( 'position' ).data.array ), [ 1, 2, 3, 0, 4, 5, 6, 0 ], 'first view was deserialized' );
			assert.deepEqual( Array.from( geometry2.getAttribute( 'normal' ).data.array ), [ 7, 8, 9, 0, 10, 11, 12, 0 ], 'second view was deserialized' );
			assert.strictEqual( geometry2.getAttribute( 'normal' ).count, 2, 'count is preserved' );

		} );

		QUnit.test( 'parser - instanced geometry', ( assert ) => {

			const loader = new BufferGeometryLoader();

			const geometry = new InstancedBufferGeometry();
			geometry.instanceCount = 2;
			geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( [ 0, 0, 0, 1, 0, 0, 0, 1, 0 ] ), 3 ) );
			geometry.setAttribute( 'offset', new InstancedBufferAttribute( new Float32Array( [ 0, 0, 0, 1, 1, 1 ] ), 3, false, 2 ) );

			const geometry2 = loader.parse( JSON.parse( JSON.stringify( geometry ) ) );

			assert.strictEqual( geometry2.isInstancedBufferGeometry, true, 'geometry is deserialized as instanced geometry' );
			assert.strictEqual( geometry2.instanceCount, 2, 'instanceCount is preserved' );
			assert.strictEqual( geometry2.getAttribute( 'position' ).isInstancedBufferAttribute, undefined, 'position is no instanced attribute' );
			assert.strictEqual( geometry2.getAttribute( 'offset' ).isInstancedBufferAttribute, true, 'offset is an instanced attribute' );
			assert.strictEqual( geometry2.getAttribute( 'offset' ).meshPerAttribute, 2, 'meshPerAttribute is preserved' );

			// the default instance count can't be represented in JSON

			const geometry3 = loader.parse( JSON.parse( JSON.stringify( new InstancedBufferGeometry() ) ) );

			assert.strictEqual( geometry3.instanceCount, Infinity, 'default instanceCount is preserved' );

		} );

		QUnit.test( 'parser - instanced interleaved attributes', ( assert ) => {

			const buffer = new InstancedInterleavedBuffer( new Float32Array( [ 0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3 ] ), 6, 2 );

			const geometry = new InstancedBufferGeometry();
			geometry.setAttribute( 'instanceStart', new InterleavedBufferAttribute( buffer, 3, 0 ) );
			geometry.setAttribute( 'instanceEnd', new InterleavedBufferAttribute( buffer, 3, 3 ) );

			const geometry2 = new BufferGeometryLoader().parse( JSON.parse( JSON.stringify( geometry ) ) );

			const instanceStart = geometry2.getAttribute( 'instanceStart' );
			const instanceEnd = geometry2.getAttribute( 'instanceEnd' );

			assert.strictEqual( instanceStart.data.isInstancedInterleavedBuffer, true, 'buffer is deserialized as instanced interleaved buffer' );
			assert.strictEqual( instanceStart.data.meshPerAttribute, 2, 'meshPerAttribute is preserved' );
			assert.strictEqual( instanceEnd.data, instanceStart.data, 'attributes share the interleaved buffer' );
			assert.deepEqual( Array.from( instanceEnd.data.array ), [ 0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3 ], 'buffer data are preserved' );

		} );

	} );

} );
