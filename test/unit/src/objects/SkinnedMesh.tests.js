/* global QUnit */

import { Object3D } from '../../../../src/core/Object3D.js';
import { Mesh } from '../../../../src/objects/Mesh.js';
import { SkinnedMesh } from '../../../../src/objects/SkinnedMesh.js';
import { AttachedBindMode } from '../../../../src/constants.js';

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
			assert.ok(
				object.bindMode === AttachedBindMode,
				'SkinnedMesh.bindMode should be AttachedBindMode'
			);

		} );

		QUnit.todo( 'bindMatrix', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'bindMatrixInverse', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isSkinnedMesh', ( assert ) => {

			const object = new SkinnedMesh();
			assert.ok(
				object.isSkinnedMesh,
				'SkinnedMesh.isSkinnedMesh should be true'
			);

		} );

		QUnit.todo( 'copy', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

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
