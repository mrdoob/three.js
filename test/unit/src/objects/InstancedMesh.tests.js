import { assert, describe, test } from 'vitest';

import { InstancedMesh } from '../../../../src/objects/InstancedMesh.js';
import { Mesh } from '../../../../src/objects/Mesh.js';

describe( 'Objects', () => {

	describe( 'InstancedMesh', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new InstancedMesh();
			assert.strictEqual(
				object instanceof Mesh, true,
				'InstancedMesh extends from Mesh'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new InstancedMesh();
			assert.ok( object, 'Can instantiate a InstancedMesh.' );

		} );

		// PUBLIC STUFF
		test( 'isInstancedMesh', () => {

			const object = new InstancedMesh();
			assert.ok(
				object.isInstancedMesh,
				'InstancedMesh.isInstancedMesh should be true'
			);

		} );

		test( 'dispose', () => {


			const object = new InstancedMesh();
			object.dispose();

		} );

	} );

} );
