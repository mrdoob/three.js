import { assert, describe, test } from 'vitest';

import { Group } from '../../../../src/objects/Group.js';

import { Object3D } from '../../../../src/core/Object3D.js';

describe( 'Objects', () => {

	describe( 'Group', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const group = new Group();
			assert.strictEqual(
				group instanceof Object3D, true,
				'Group extends from Object3D'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new Group();
			assert.ok( object, 'Can instantiate a Group.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new Group();
			assert.ok(
				object.type === 'Group',
				'Group.type should be Group'
			);

		} );

		// PUBLIC
		test( 'isGroup', () => {

			const object = new Group();
			assert.ok(
				object.isGroup,
				'Group.isGroup should be true'
			);

		} );

	} );

} );
