import { SpriteMaterial } from '../../../../src/materials/SpriteMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'SpriteMaterial', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new SpriteMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'SpriteMaterial extends from Material'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new SpriteMaterial();
			assert.ok( object, 'Can instantiate a SpriteMaterial.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new SpriteMaterial();
			assert.ok(
				object.type === 'SpriteMaterial',
				'SpriteMaterial.type should be SpriteMaterial'
			);

		} );

		// PUBLIC
		QUnit.test( 'isSpriteMaterial', ( assert ) => {

			const object = new SpriteMaterial();
			assert.ok(
				object.isSpriteMaterial,
				'SpriteMaterial.isSpriteMaterial should be true'
			);

		} );

	} );

} );
