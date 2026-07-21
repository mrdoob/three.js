import { LineBasicMaterial } from '../../../../src/materials/LineBasicMaterial.js';

import { Material } from '../../../../src/materials/Material.js';
import { MaterialLoader } from '../../../../src/loaders/MaterialLoader.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'LineBasicMaterial', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new LineBasicMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'LineBasicMaterial extends from Material'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new LineBasicMaterial();
			assert.ok( object, 'Can instantiate a LineBasicMaterial.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new LineBasicMaterial();
			assert.ok(
				object.type === 'LineBasicMaterial',
				'LineBasicMaterial.type should be LineBasicMaterial'
			);

		} );

		// PUBLIC
		QUnit.test( 'isLineBasicMaterial', ( assert ) => {

			const object = new LineBasicMaterial();
			assert.ok(
				object.isLineBasicMaterial,
				'LineBasicMaterial.isLineBasicMaterial should be true'
			);

		} );

		// SERIALIZATION
		QUnit.test( 'linecap and linejoin survive toJSON and clone', ( assert ) => {

			const material = new LineBasicMaterial();
			material.linecap = 'butt';
			material.linejoin = 'bevel';

			const reloaded = new MaterialLoader().parse( material.toJSON() );
			assert.equal( reloaded.linecap, 'butt', 'toJSON/fromJSON keeps linecap' );
			assert.equal( reloaded.linejoin, 'bevel', 'toJSON/fromJSON keeps linejoin' );

			const cloned = material.clone();
			assert.equal( cloned.linecap, 'butt', 'clone keeps linecap' );
			assert.equal( cloned.linejoin, 'bevel', 'clone keeps linejoin' );

		} );

	} );

} );
