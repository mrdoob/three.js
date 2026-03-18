import { UniformsGroup } from '../../../../src/core/UniformsGroup.js';

import { EventDispatcher } from '../../../../src/core/EventDispatcher.js';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'UniformsGroup', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new UniformsGroup();
			assert.strictEqual(
				object instanceof EventDispatcher, true,
				'UniformsGroup extends from EventDispatcher'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new UniformsGroup();
			assert.ok( object, 'Can instantiate a UniformsGroup.' );

		} );

		// PUBLIC
		QUnit.test( 'isUniformsGroup', ( assert ) => {

			const object = new UniformsGroup();
			assert.ok(
				object.isUniformsGroup,
				'UniformsGroup.isUniformsGroup should be true'
			);

		} );

		QUnit.test( 'dispose', ( assert ) => {

			assert.expect( 0 );

			const object = new UniformsGroup();
			object.dispose();

		} );

	} );

} );
