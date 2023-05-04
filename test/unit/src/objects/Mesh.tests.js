/* global QUnit */

import { Object3D } from '../../../../src/core/Object3D.js';
import { Mesh } from '../../../../src/objects/Mesh.js';
import { Raycaster } from '../../../../src/core/Raycaster.js';
import { PlaneGeometry } from '../../../../src/geometries/PlaneGeometry.js';
import { BoxGeometry } from '../../../../src/geometries/BoxGeometry.js';
import { MeshBasicMaterial } from '../../../../src/materials/MeshBasicMaterial.js';
import { Vector2 } from '../../../../src/math/Vector2.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import { DoubleSide } from '../../../../src/constants.js';

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
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new Mesh();
			assert.ok( object, 'Can instantiate a Mesh.' );

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

		QUnit.test( 'raycast/range', ( assert ) => {

			const geometry = new BoxGeometry( 1, 1, 1 );
			const material = new MeshBasicMaterial( { side: DoubleSide } );
			const mesh = new Mesh( geometry, material );
			const raycaster = new Raycaster();
			const intersections = [];

			raycaster.ray.origin.set( 0, 0, 0 );
			raycaster.ray.direction.set( 1, 0, 0 );
			raycaster.near = 100;
			raycaster.far = 200;

			mesh.matrixWorld.identity();
			mesh.position.setX( 150 );
			mesh.updateMatrixWorld( true );
			intersections.length = 0;
			mesh.raycast( raycaster, intersections );
			assert.ok( intersections.length > 0, 'bounding sphere between near and far' );

			mesh.matrixWorld.identity();
			mesh.position.setX( raycaster.near );
			mesh.updateMatrixWorld( true );
			intersections.length = 0;
			mesh.raycast( raycaster, intersections );
			assert.ok( intersections.length > 0, 'bounding sphere across near' );

			mesh.matrixWorld.identity();
			mesh.position.setX( raycaster.far );
			mesh.updateMatrixWorld( true );
			intersections.length = 0;
			mesh.raycast( raycaster, intersections );
			assert.ok( intersections.length > 0, 'bounding sphere across far' );

			mesh.matrixWorld.identity();
			mesh.position.setX( 150 );
			mesh.scale.setY( 9999 );
			mesh.updateMatrixWorld( true );
			intersections.length = 0;
			mesh.raycast( raycaster, intersections );
			assert.ok( intersections.length > 0, 'bounding sphere across near and far' );

			mesh.matrixWorld.identity();
			mesh.position.setX( - 9999 );
			mesh.updateMatrixWorld( true );
			intersections.length = 0;
			mesh.raycast( raycaster, intersections );
			assert.ok( intersections.length === 0, 'bounding sphere behind near' );

			mesh.matrixWorld.identity();
			mesh.position.setX( 9999 );
			mesh.updateMatrixWorld( true );
			intersections.length = 0;
			mesh.raycast( raycaster, intersections );
			assert.ok( intersections.length === 0, 'bounding sphere beyond far' );

		} );

	} );

} );
