import { assert, describe, test } from 'vitest';

import { UniformsGroup } from '../../../../src/core/UniformsGroup.js';

import { EventDispatcher } from '../../../../src/core/EventDispatcher.js';

describe( 'Core', () => {

	describe( 'UniformsGroup', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new UniformsGroup();
			assert.strictEqual(
				object instanceof EventDispatcher, true,
				'UniformsGroup extends from EventDispatcher'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new UniformsGroup();
			assert.ok( object, 'Can instantiate a UniformsGroup.' );

		} );

		// PUBLIC
		test( 'isUniformsGroup', () => {

			const object = new UniformsGroup();
			assert.ok(
				object.isUniformsGroup,
				'UniformsGroup.isUniformsGroup should be true'
			);

		} );

		test( 'dispose', () => {


			const object = new UniformsGroup();
			object.dispose();

		} );

	} );

} );
