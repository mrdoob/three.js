import { MeshDepthMaterial } from '../../../../src/materials/MeshDepthMaterial.js';

import { Material } from '../../../../src/materials/Material.js';
import { MaterialLoader } from '../../../../src/loaders/MaterialLoader.js';
import { RGBADepthPacking } from '../../../../src/constants.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'MeshDepthMaterial', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new MeshDepthMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'MeshDepthMaterial extends from Material'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new MeshDepthMaterial();
			assert.ok( object, 'Can instantiate a MeshDepthMaterial.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new MeshDepthMaterial();
			assert.ok(
				object.type === 'MeshDepthMaterial',
				'MeshDepthMaterial.type should be MeshDepthMaterial'
			);

		} );

		// PUBLIC
		QUnit.test( 'isMeshDepthMaterial', ( assert ) => {

			const object = new MeshDepthMaterial();
			assert.ok(
				object.isMeshDepthMaterial,
				'MeshDepthMaterial.isMeshDepthMaterial should be true'
			);

		} );

		// SERIALIZATION
		QUnit.test( 'depthPacking survives toJSON and clone', ( assert ) => {

			const material = new MeshDepthMaterial();
			material.depthPacking = RGBADepthPacking;

			const reloaded = new MaterialLoader().parse( material.toJSON() );
			assert.equal( reloaded.depthPacking, RGBADepthPacking, 'toJSON/fromJSON keeps depthPacking' );
			assert.equal( material.clone().depthPacking, RGBADepthPacking, 'clone keeps depthPacking' );

		} );

	} );

} );
