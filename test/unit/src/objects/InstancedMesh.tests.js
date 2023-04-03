/* global QUnit */

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

		// PROPERTIES
		QUnit.todo( 'instanceMatrix', ( assert ) => {

			// InstancedBufferAttribute
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'instanceColor', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'count', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'frustumCulled', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'isInstancedMesh', ( assert ) => {

			const object = new InstancedMesh();
			assert.ok(
				object.isInstancedMesh,
				'InstancedMesh.isInstancedMesh should be true'
			);

		} );

		QUnit.todo( 'copy', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getColorAt', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getMatrixAt', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'raycast', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setColorAt', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setMatrixAt', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'updateMorphTargets', ( assert ) => {

			// signature defined, no implementation
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'dispose', ( assert ) => {

			assert.expect( 0 );

			const object = new InstancedMesh();
			object.dispose();

		} );

	} );

} );
