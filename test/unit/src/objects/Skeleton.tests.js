import { Skeleton } from '../../../../src/objects/Skeleton.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'Skeleton', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new Skeleton();
			assert.ok( object, 'Can instantiate a Skeleton.' );

		} );

		// PUBLIC

		QUnit.test( 'dispose', ( assert ) => {

			assert.expect( 0 );

			const object = new Skeleton();
			object.dispose();

		} );

	} );

} );
