/* global QUnit */

import { Object3D } from '../../../../src/core/Object3D.js';
import { Mesh } from '../../../../src/objects/Mesh.js';
import { SkinnedMesh } from '../../../../src/objects/SkinnedMesh.js';
import { AttachedBindMode, DetachedBindMode } from '../../../../src/constants.js';
import { Matrix4 } from '../../../../src/math/Matrix4.js';
import { Box3 } from '../../../../src/math/Box3.js';
import { Sphere } from '../../../../src/math/Sphere.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import { Skeleton } from '../../../../src/objects/Skeleton.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'SkinnedMesh', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const skinnedMesh = new SkinnedMesh();

			assert.strictEqual( skinnedMesh instanceof Object3D, true, 'SkinnedMesh extends from Object3D' );
			assert.strictEqual( skinnedMesh instanceof Mesh, true, 'SkinnedMesh extends from Mesh' );

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new SkinnedMesh();
			assert.ok( object, 'Can instantiate a SkinnedMesh.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new SkinnedMesh();
			assert.ok(
				object.type === 'SkinnedMesh',
				'SkinnedMesh.type should be SkinnedMesh'
			);

		} );

		QUnit.test( 'bindMode', ( assert ) => {

			const object = new SkinnedMesh();
			assert.strictEqual(
				object.bindMode,
				AttachedBindMode,
				'SkinnedMesh.bindMode should be AttachedBindMode'
			);

		} );

		QUnit.test( 'bindMatrix', ( assert ) => {

			const object = new SkinnedMesh();
			const identity = new Matrix4();

			assert.ok( object.bindMatrix instanceof Matrix4, 'bindMatrix is a Matrix4.' );
			assert.deepEqual( object.bindMatrix, identity, 'bindMatrix is identity by default.' );

		} );

		QUnit.test( 'bindMatrixInverse', ( assert ) => {

			const object = new SkinnedMesh();
			const identity = new Matrix4();

			assert.ok( object.bindMatrixInverse instanceof Matrix4, 'bindMatrixInverse is a Matrix4.' );
			assert.deepEqual( object.bindMatrixInverse, identity, 'bindMatrixInverse is identity by default.' );

		} );

		// PUBLIC
		QUnit.test( 'isSkinnedMesh', ( assert ) => {

			const object = new SkinnedMesh();
			assert.ok(
				object.isSkinnedMesh,
				'SkinnedMesh.isSkinnedMesh should be true'
			);

		} );

		QUnit.test( 'copy', ( assert ) => {

			const source = new SkinnedMesh();
			const skeleton = new Skeleton();

			source.bindMode = DetachedBindMode;
			source.bindMatrix.makeTranslation( 1, 2, 3 );
			source.bindMatrixInverse.copy( source.bindMatrix ).invert();

			source.skeleton = skeleton;
			source.boundingBox = new Box3( new Vector3( - 1, - 2, - 3 ), new Vector3( 1, 2, 3 ) );
			source.boundingSphere = new Sphere( new Vector3( 1, 2, 3 ), 5 );

			const target = new SkinnedMesh();
			target.copy( source );

			assert.strictEqual( target.bindMode, source.bindMode, 'copy() should copy bindMode.' );
			assert.deepEqual( target.bindMatrix, source.bindMatrix, 'copy() should copy bindMatrix.' );
			assert.deepEqual( target.bindMatrixInverse, source.bindMatrixInverse, 'copy() should copy bindMatrixInverse.' );
			assert.strictEqual( target.skeleton, skeleton, 'copy() should copy skeleton reference.' );
			assert.deepEqual( target.boundingBox, source.boundingBox, 'copy() should clone boundingBox.' );
			assert.deepEqual( target.boundingSphere, source.boundingSphere, 'copy() should clone boundingSphere.' );

		} );

		QUnit.todo( 'bind', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'pose', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'normalizeSkinWeights', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'updateMatrixWorld', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'applyBoneTransform', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
