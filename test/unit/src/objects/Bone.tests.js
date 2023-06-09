/* global QUnit */

import { Bone } from '../../../../src/objects/Bone.js';

import { Object3D } from '../../../../src/core/Object3D.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'Bone', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const bone = new Bone();
			assert.strictEqual(
				bone instanceof Object3D, true,
				'Bone extends from Object3D'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new Bone();
			assert.ok( object, 'Can instantiate a Bone.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new Bone();
			assert.ok(
				object.type === 'Bone',
				'Bone.type should be Bone'
			);

		} );

		// PUBLIC
		QUnit.test( 'isBone', ( assert ) => {

			const object = new Bone();
			assert.ok(
				object.isBone,
				'Bone.isBone should be true'
			);

		} );


	} );

} );
