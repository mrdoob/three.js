import { assert, describe, test } from 'vitest';

import { Scene } from '../../../../src/scenes/Scene.js';

import { Object3D } from '../../../../src/core/Object3D.js';

describe( 'Scenes', () => {

	describe( 'Scene', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new Scene();
			assert.strictEqual(
				object instanceof Object3D, true,
				'Scene extends from Object3D'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new Scene();
			assert.ok( object, 'Can instantiate a Scene.' );

		} );

		// PUBLIC
		test( 'isScene', () => {

			const object = new Scene();
			assert.ok(
				object.isScene,
				'Scene.isScene should be true'
			);

		} );

	} );

} );
