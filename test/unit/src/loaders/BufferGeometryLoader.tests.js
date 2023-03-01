/* global QUnit */

import { BufferGeometryLoader } from '../../../../src/loaders/BufferGeometryLoader.js';

import { BufferAttribute } from '../../../../src/core/BufferAttribute.js';
import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
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

		// PUBLIC
		QUnit.todo( 'load', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'parse', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// OTHERS
		QUnit.test( 'parser - attributes - circlable', ( assert ) => {

			const loader = new BufferGeometryLoader();
			const geometry = new BufferGeometry();
			const attr = new BufferAttribute( new Float32Array( [ 7, 8, 9, 10, 11, 12 ] ), 2, true );
			attr.name = 'attribute';
			attr.setUsage( DynamicDrawUsage );
			attr.updateRange.offset = 1;
			attr.updateRange.count = 2;

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

	} );

} );
