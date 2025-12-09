import { Object3D } from '../../../../src/core/Object3D.js';
import { Sprite } from '../../../../src/objects/Sprite.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'Sprite', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const sprite = new Sprite();
			assert.strictEqual(
				sprite instanceof Object3D, true,
				'Sprite extends from Object3D'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new Sprite();
			assert.ok( object, 'Can instantiate a Sprite.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new Sprite();
			assert.ok(
				object.type === 'Sprite',
				'Sprite.type should be Sprite'
			);

		} );

		// PUBLIC
		QUnit.test( 'isSprite', ( assert ) => {

			const object = new Sprite();
			assert.ok(
				object.isSprite,
				'Sprite.isSprite should be true'
			);

		} );

	} );

} );
