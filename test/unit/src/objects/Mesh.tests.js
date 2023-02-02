/* global QUnit */

import { Object3D } from '../../../../src/core/Object3D.js';
import { Mesh } from '../../../../src/objects/Mesh.js';
import { Raycaster } from '../../../../src/core/Raycaster.js';
import { PlaneGeometry } from '../../../../src/geometries/PlaneGeometry.js';
import { MeshBasicMaterial } from '../../../../src/materials/MeshBasicMaterial.js';
import { Vector2 } from '../../../../src/math/Vector2.js';
import { Vector3 } from '../../../../src/math/Vector3.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'Mesh', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const mesh = new Mesh();
			assert.strictEqual(
				mesh instanceof Object3D, true,
				'Mesh extends from Object3D'
			);

		} );

		// INSTANCING
		QUnit.todo( 'Instancing', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new Mesh();
			assert.ok(
				object.type === 'Mesh',
				'Mesh.type should be Mesh'
			);

		} );

		QUnit.todo( 'geometry', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'material', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isMesh', ( assert ) => {

			const object = new Mesh();
			assert.ok(
				object.isMesh,
				'Mesh.isMesh should be true'
			);

		} );

		QUnit.todo( 'copy', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'updateMorphTargets', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getVertexPosition', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'raycast', ( assert ) => {

			const geometry = new PlaneGeometry();
			const material = new MeshBasicMaterial();

			const mesh = new Mesh( geometry, material );

			const raycaster = new Raycaster();
			raycaster.ray.origin.set( 0.25, 0.25, 1 );
			raycaster.ray.direction.set( 0, 0, - 1 );

			const intersections = [];

			mesh.raycast( raycaster, intersections );

			const intersection = intersections[ 0 ];

			assert.equal( intersection.object, mesh, 'intersction object' );
			assert.equal( intersection.distance, 1, 'intersction distance' );
			assert.equal( intersection.faceIndex, 1, 'intersction face index' );
			assert.deepEqual( intersection.face, { a: 0, b: 2, c: 1 }, 'intersction vertex indices' );
			assert.deepEqual( intersection.point, new Vector3( 0.25, 0.25, 0 ), 'intersction point' );
			assert.deepEqual( intersection.uv, new Vector2( 0.75, 0.75 ), 'intersction uv' );

		} );

	} );

} );
