import { InstancedMesh } from '../../../../src/objects/InstancedMesh.js';

import { Mesh } from '../../../../src/objects/Mesh.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'InstancedMesh', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new InstancedMesh();
			assert.strictEqual(
				object instanceof Mesh, true,
				'InstancedMesh extends from Mesh'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new InstancedMesh();
			assert.ok( object, 'Can instantiate a InstancedMesh.' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'isInstancedMesh', ( assert ) => {

			const object = new InstancedMesh();
			assert.ok(
				object.isInstancedMesh,
				'InstancedMesh.isInstancedMesh should be true'
			);

		} );

		QUnit.test( 'dispose', ( assert ) => {

			assert.expect( 0 );

			const object = new InstancedMesh();
			object.dispose();

		} );

	} );

} );
