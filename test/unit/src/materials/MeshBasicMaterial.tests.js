import { MeshBasicMaterial } from '../../../../src/materials/MeshBasicMaterial.js';

import { Material } from '../../../../src/materials/Material.js';
import { MaterialLoader } from '../../../../src/loaders/MaterialLoader.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'MeshBasicMaterial', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new MeshBasicMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'MeshBasicMaterial extends from Material'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new MeshBasicMaterial();
			assert.ok( object, 'Can instantiate a MeshBasicMaterial.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new MeshBasicMaterial();
			assert.ok(
				object.type === 'MeshBasicMaterial',
				'MeshBasicMaterial.type should be MeshBasicMaterial'
			);

		} );

		// PUBLIC
		QUnit.test( 'isMeshBasicMaterial', ( assert ) => {

			const object = new MeshBasicMaterial();
			assert.ok(
				object.isMeshBasicMaterial,
				'MeshBasicMaterial.isMeshBasicMaterial should be true'
			);

		} );

		// SERIALIZATION
		QUnit.test( 'clipIntersection and clipShadows survive toJSON and clone', ( assert ) => {

			const material = new MeshBasicMaterial();
			material.clipIntersection = true;
			material.clipShadows = true;

			const reloaded = new MaterialLoader().parse( material.toJSON() );
			assert.equal( reloaded.clipIntersection, true, 'toJSON/fromJSON keeps clipIntersection' );
			assert.equal( reloaded.clipShadows, true, 'toJSON/fromJSON keeps clipShadows' );

			const cloned = material.clone();
			assert.equal( cloned.clipIntersection, true, 'clone keeps clipIntersection' );
			assert.equal( cloned.clipShadows, true, 'clone keeps clipShadows' );

		} );

	} );

} );
