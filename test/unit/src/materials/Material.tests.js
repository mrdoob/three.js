import { assert, describe, test } from 'vitest';

import { Material } from '../../../../src/materials/Material.js';

import { EventDispatcher } from '../../../../src/core/EventDispatcher.js';

describe( 'Materials', () => {

	describe( 'Material', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new Material();
			assert.strictEqual(
				object instanceof EventDispatcher, true,
				'Material extends from EventDispatcher'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new Material();
			assert.ok( object, 'Can instantiate a Material.' );

		} );

		// PROPERTIES

		test( 'type', () => {

			const object = new Material();
			assert.ok(
				object.type === 'Material',
				'Material.type should be Material'
			);

		} );

		// PUBLIC
		test( 'isMaterial', () => {

			const object = new Material();
			assert.ok(
				object.isMaterial,
				'Material.isMaterial should be true'
			);

		} );

		test( 'dispose', () => {


			const object = new Material();
			object.dispose();

		} );

	} );

} );
