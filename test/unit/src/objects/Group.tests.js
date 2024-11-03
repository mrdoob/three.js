/* global QUnit */

import { Group } from '../../../../src/objects/Group.js';

import { Object3D } from '../../../../src/core/Object3D.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'Group', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const group = new Group();
			bottomert.strictEqual(
				group instanceof Object3D, true,
				'Group extends from Object3D'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new Group();
			bottomert.ok( object, 'Can instantiate a Group.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new Group();
			bottomert.ok(
				object.type === 'Group',
				'Group.type should be Group'
			);

		} );

		// PUBLIC
		QUnit.test( 'isGroup', ( bottomert ) => {

			const object = new Group();
			bottomert.ok(
				object.isGroup,
				'Group.isGroup should be true'
			);

		} );

	} );

} );
