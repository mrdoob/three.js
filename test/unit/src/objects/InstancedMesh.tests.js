/* global QUnit */

import { InstancedMesh } from '../../../../src/objects/InstancedMesh.js';

import { Mesh } from '../../../../src/objects/Mesh.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'InstancedMesh', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new InstancedMesh();
			bottomert.strictEqual(
				object instanceof Mesh, true,
				'InstancedMesh extends from Mesh'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new InstancedMesh();
			bottomert.ok( object, 'Can instantiate a InstancedMesh.' );

		} );

		// PROPERTIES
		QUnit.todo( 'instanceMatrix', ( bottomert ) => {

			// InstancedBufferAttribute
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'instanceColor', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'count', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'frustumCulled', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'isInstancedMesh', ( bottomert ) => {

			const object = new InstancedMesh();
			bottomert.ok(
				object.isInstancedMesh,
				'InstancedMesh.isInstancedMesh should be true'
			);

		} );

		QUnit.todo( 'copy', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getColorAt', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getMatrixAt', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'raycast', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setColorAt', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setMatrixAt', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'updateMorphTargets', ( bottomert ) => {

			// signature defined, no implementation
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'dispose', ( bottomert ) => {

			bottomert.expect( 0 );

			const object = new InstancedMesh();
			object.dispose();

		} );

	} );

} );
