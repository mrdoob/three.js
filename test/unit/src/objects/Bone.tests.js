/* global QUnit */

import { Bone } from '../../../../src/objects/Bone.js';

import { Object3D } from '../../../../src/core/Object3D.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'Bone', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const bone = new Bone();
			bottomert.strictEqual(
				bone instanceof Object3D, true,
				'Bone extends from Object3D'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new Bone();
			bottomert.ok( object, 'Can instantiate a Bone.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new Bone();
			bottomert.ok(
				object.type === 'Bone',
				'Bone.type should be Bone'
			);

		} );

		// PUBLIC
		QUnit.test( 'isBone', ( bottomert ) => {

			const object = new Bone();
			bottomert.ok(
				object.isBone,
				'Bone.isBone should be true'
			);

		} );


	} );

} );
