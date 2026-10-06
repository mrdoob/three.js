import { MeshNormalMaterial } from '../../../../src/materials/MeshNormalMaterial.js';

import { Texture } from '../../../../src/textures/Texture.js';
import { MaterialLoader } from '../../../../src/loaders/MaterialLoader.js';

import { Material } from '../../../../src/materials/Material.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'MeshNormalMaterial', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new MeshNormalMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'MeshNormalMaterial extends from Material'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new MeshNormalMaterial();
			assert.ok( object, 'Can instantiate a MeshNormalMaterial.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new MeshNormalMaterial();
			assert.ok(
				object.type === 'MeshNormalMaterial',
				'MeshNormalMaterial.type should be MeshNormalMaterial'
			);

		} );

		QUnit.test( 'alpha maps survive cloning and serialization', assert => {

			const defaults = new MeshNormalMaterial();
			assert.strictEqual( defaults.map, null, 'base map is opt-in' );
			assert.strictEqual( defaults.alphaMap, null, 'alpha map is opt-in' );
			assert.strictEqual( defaults.alphaTest, 0, 'alpha discard is opt-in' );

			const map = new Texture();
			const alphaMap = new Texture();
			const source = new MeshNormalMaterial( { map, alphaMap, alphaTest: 0.5, opacity: 0.75 } );
			const loader = new MaterialLoader().setTextures( { [ map.uuid ]: map, [ alphaMap.uuid ]: alphaMap } );
			for ( const material of [ source.clone(), loader.parse( source.toJSON() ) ] ) {

				assert.strictEqual( material.map, map, 'base-map reference retained' );
				assert.strictEqual( material.alphaMap, alphaMap, 'alpha-map reference retained' );
				assert.strictEqual( material.alphaTest, 0.5, 'alpha threshold retained' );
				assert.strictEqual( material.opacity, 0.75, 'opacity retained' );

			}

		} );

		// PUBLIC
		QUnit.test( 'isMeshNormalMaterial', ( assert ) => {

			const object = new MeshNormalMaterial();
			assert.ok(
				object.isMeshNormalMaterial,
				'MeshNormalMaterial.isMeshNormalMaterial should be true'
			);

		} );

	} );

} );
