import { assert, describe, test } from 'vitest';

import { Bone } from '../../../../src/objects/Bone.js';

import { Object3D } from '../../../../src/core/Object3D.js';

describe( 'Objects', () => {

	describe( 'Bone', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const bone = new Bone();
			assert.strictEqual(
				bone instanceof Object3D, true,
				'Bone extends from Object3D'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new Bone();
			assert.ok( object, 'Can instantiate a Bone.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new Bone();
			assert.ok(
				object.type === 'Bone',
				'Bone.type should be Bone'
			);

		} );

		// PUBLIC
		test( 'isBone', () => {

			const object = new Bone();
			assert.ok(
				object.isBone,
				'Bone.isBone should be true'
			);

		} );


	} );

} );
