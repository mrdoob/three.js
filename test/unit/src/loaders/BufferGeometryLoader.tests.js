import { BufferGeometryLoader } from '../../../../src/loaders/BufferGeometryLoader.js';

import { BufferAttribute } from '../../../../src/core/BufferAttribute.js';
import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
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

	} );

} );
