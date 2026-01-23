import { Scene } from '../../../../src/scenes/Scene.js';

import { Object3D } from '../../../../src/core/Object3D.js';

export default QUnit.module( 'Scenes', () => {

	QUnit.module( 'Scene', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new Scene();
			assert.strictEqual(
				object instanceof Object3D, true,
				'Scene extends from Object3D'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new Scene();
			assert.ok( object, 'Can instantiate a Scene.' );

		} );

		// PUBLIC
		QUnit.test( 'isScene', ( assert ) => {

			const object = new Scene();
			assert.ok(
				object.isScene,
				'Scene.isScene should be true'
			);

		} );

	} );

} );
