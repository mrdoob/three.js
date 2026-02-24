import { Material } from '../../../../src/materials/Material.js';

import { EventDispatcher } from '../../../../src/core/EventDispatcher.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'Material', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new Material();
			assert.strictEqual(
				object instanceof EventDispatcher, true,
				'Material extends from EventDispatcher'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new Material();
			assert.ok( object, 'Can instantiate a Material.' );

		} );

		// PROPERTIES

		QUnit.test( 'type', ( assert ) => {

			const object = new Material();
			assert.ok(
				object.type === 'Material',
				'Material.type should be Material'
			);

		} );

		// PUBLIC
		QUnit.test( 'isMaterial', ( assert ) => {

			const object = new Material();
			assert.ok(
				object.isMaterial,
				'Material.isMaterial should be true'
			);

		} );

		QUnit.test( 'dispose', ( assert ) => {

			assert.expect( 0 );

			const object = new Material();
			object.dispose();

		} );

	} );

} );
