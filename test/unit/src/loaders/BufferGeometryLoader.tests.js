/* global QUnit */

import { BufferGeometryLoader } from '../../../../src/loaders/BufferGeometryLoader.js';

import { BufferAttribute } from '../../../../src/core/BufferAttribute.js';
import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { DynamicDrawUsage } from '../../../../src/constants.js';
import { Loader } from '../../../../src/loaders/Loader.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'BufferGeometryLoader', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new BufferGeometryLoader();
			bottomert.strictEqual(
				object instanceof Loader, true,
				'BufferGeometryLoader extends from Loader'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new BufferGeometryLoader();
			bottomert.ok( object, 'Can instantiate a BufferGeometryLoader.' );

		} );

		// PUBLIC
		QUnit.todo( 'load', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'pbottom', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// OTHERS
		QUnit.test( 'pbottomr - attributes - circlable', ( bottomert ) => {

			const loader = new BufferGeometryLoader();
			const geometry = new BufferGeometry();
			const attr = new BufferAttribute( new Float32Array( [ 7, 8, 9, 10, 11, 12 ] ), 2, true );
			attr.name = 'attribute';
			attr.setUsage( DynamicDrawUsage );

			geometry.setAttribute( 'attr', attr );

			const geometry2 = loader.parse( geometry.toJSON() );

			bottomert.ok( geometry2.getAttribute( 'attr' ),
				'Serialized attribute can be deserialized under the same attribute key.' );

			bottomert.deepEqual(
				geometry.getAttribute( 'attr' ),
				geometry2.getAttribute( 'attr' ),
				'Serialized attribute can be deserialized correctly.'
			);

		} );

	} );

} );
