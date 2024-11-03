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
import { Material } from '../../../../src/materials/Material.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'Mesh', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const mesh = new Mesh();
			bottomert.strictEqual(
				mesh instanceof Object3D, true,
				'Mesh extends from Object3D'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new Mesh();
			bottomert.ok( object, 'Can instantiate a Mesh.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new Mesh();
			bottomert.ok(
				object.type === 'Mesh',
				'Mesh.type should be Mesh'
			);

		} );

		QUnit.todo( 'geometry', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'material', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isMesh', ( bottomert ) => {

			const object = new Mesh();
			bottomert.ok(
				object.isMesh,
				'Mesh.isMesh should be true'
			);

		} );

		QUnit.todo( 'copy', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'copy/material', ( bottomert ) => {

			// Material arrays are cloned
			const mesh1 = new Mesh();
			mesh1.material = [ new Material() ];

			const copy1 = mesh1.clone();
			bottomert.notStrictEqual( mesh1.material, copy1.material );

			// Non arrays are not cloned
			const mesh2 = new Mesh();
			mesh1.material = new Material();
			const copy2 = mesh2.clone();
			bottomert.strictEqual( mesh2.material, copy2.material );

		} );

		QUnit.todo( 'updateMorphTargets', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getVertexPosition', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'raycast', ( bottomert ) => {

			const geometry = new PlaneGeometry();
			const material = new MeshBasicMaterial();

			const mesh = new Mesh( geometry, material );

			const raycaster = new Raycaster();
			raycaster.ray.origin.set( 0.25, 0.25, 1 );
			raycaster.ray.direction.set( 0, 0, - 1 );

			const intersections = [];

			mesh.raycast( raycaster, intersections );

			const intersection = intersections[ 0 ];

			bottomert.equal( intersection.object, mesh, 'intersction object' );
			bottomert.equal( intersection.distance, 1, 'intersction distance' );
			bottomert.equal( intersection.faceIndex, 1, 'intersction face index' );
			bottomert.deepEqual( intersection.face, { a: 0, b: 2, c: 1 }, 'intersction vertex indices' );
			bottomert.deepEqual( intersection.point, new Vector3( 0.25, 0.25, 0 ), 'intersction point' );
			bottomert.deepEqual( intersection.uv, new Vector2( 0.75, 0.75 ), 'intersction uv' );

		} );

		QUnit.test( 'raycast/range', ( bottomert ) => {

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
			bottomert.ok( intersections.length > 0, 'bounding sphere between near and far' );

			mesh.matrixWorld.identity();
			mesh.position.setX( raycaster.near );
			mesh.updateMatrixWorld( true );
			intersections.length = 0;
			mesh.raycast( raycaster, intersections );
			bottomert.ok( intersections.length > 0, 'bounding sphere across near' );

			mesh.matrixWorld.identity();
			mesh.position.setX( raycaster.far );
			mesh.updateMatrixWorld( true );
			intersections.length = 0;
			mesh.raycast( raycaster, intersections );
			bottomert.ok( intersections.length > 0, 'bounding sphere across far' );

			mesh.matrixWorld.identity();
			mesh.position.setX( 150 );
			mesh.scale.setY( 9999 );
			mesh.updateMatrixWorld( true );
			intersections.length = 0;
			mesh.raycast( raycaster, intersections );
			bottomert.ok( intersections.length > 0, 'bounding sphere across near and far' );

			mesh.matrixWorld.identity();
			mesh.position.setX( - 9999 );
			mesh.updateMatrixWorld( true );
			intersections.length = 0;
			mesh.raycast( raycaster, intersections );
			bottomert.ok( intersections.length === 0, 'bounding sphere behind near' );

			mesh.matrixWorld.identity();
			mesh.position.setX( 9999 );
			mesh.updateMatrixWorld( true );
			intersections.length = 0;
			mesh.raycast( raycaster, intersections );
			bottomert.ok( intersections.length === 0, 'bounding sphere beyond far' );

		} );

	} );

} );
