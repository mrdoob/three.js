/* global QUnit */

import { Object3D } from '../../../../src/core/Object3D.js';
import { Sprite } from '../../../../src/objects/Sprite.js';
import { SpriteMaterial } from '../../../../src/materials/SpriteMaterial.js';

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

		QUnit.test( 'geometry', ( assert ) => {

			const sprite = new Sprite();

			assert.ok( sprite.geometry, 'Sprite has a geometry instance.' );
			assert.ok( sprite.geometry.isBufferGeometry, 'geometry is a BufferGeometry.' );
			assert.ok( sprite.geometry.getAttribute( 'position' ), 'geometry has a position attribute.' );
			assert.ok( sprite.geometry.getAttribute( 'uv' ), 'geometry has a uv attribute.' );

		} );

		QUnit.test( 'material', ( assert ) => {

			const material = new SpriteMaterial();
			const sprite = new Sprite( material );

			assert.strictEqual( sprite.material, material, 'Sprite.material should reference the material passed to the constructor.' );

		} );

		QUnit.test( 'center', ( assert ) => {

			const sprite = new Sprite();

			assert.strictEqual( sprite.center.x, 0.5, 'Sprite.center.x defaults to 0.5.' );
			assert.strictEqual( sprite.center.y, 0.5, 'Sprite.center.y defaults to 0.5.' );

		} );

		// PUBLIC
		QUnit.test( 'isSprite', ( assert ) => {

			const object = new Sprite();
			assert.ok(
				object.isSprite,
				'Sprite.isSprite should be true'
			);

		} );

		QUnit.todo( 'raycast', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'copy', ( assert ) => {

			const material = new SpriteMaterial();
			const source = new Sprite( material );
			source.center.set( 0.25, 0.75 );

			const target = new Sprite();
			target.copy( source );

			assert.strictEqual( target.material, source.material, 'copy() should copy the material reference.' );
			assert.strictEqual( target.center.x, source.center.x, 'copy() should copy the center x component.' );
			assert.strictEqual( target.center.y, source.center.y, 'copy() should copy the center y component.' );

		} );

	} );

} );
