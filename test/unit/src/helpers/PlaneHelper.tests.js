import { PlaneHelper } from '../../../../src/helpers/PlaneHelper.js';

import { Line } from '../../../../src/objects/Line.js';

export default QUnit.module( 'Helpers', () => {

	QUnit.module( 'PlaneHelper', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new PlaneHelper();
			assert.strictEqual(
				object instanceof Line, true,
				'PlaneHelper extends from Line'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new PlaneHelper();
			assert.ok( object, 'Can instantiate a PlaneHelper.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new PlaneHelper();
			assert.ok(
				object.type === 'PlaneHelper',
				'PlaneHelper.type should be PlaneHelper'
			);

		} );

		// PUBLIC

		QUnit.test( 'dispose', ( assert ) => {

			assert.expect( 0 );

			const object = new PlaneHelper();
			object.dispose();

		} );

	} );

} );
