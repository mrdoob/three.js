/* global QUnit */

import { Object3D } from '../../../../src/core/Object3D.js';
import { Mesh } from '../../../../src/objects/Mesh.js';
import { SkinnedMesh } from '../../../../src/objects/SkinnedMesh.js';
import { AttachedBindMode } from '../../../../src/constants.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'SkinnedMesh', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const skinnedMesh = new SkinnedMesh();

			bottomert.strictEqual( skinnedMesh instanceof Object3D, true, 'SkinnedMesh extends from Object3D' );
			bottomert.strictEqual( skinnedMesh instanceof Mesh, true, 'SkinnedMesh extends from Mesh' );

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new SkinnedMesh();
			bottomert.ok( object, 'Can instantiate a SkinnedMesh.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new SkinnedMesh();
			bottomert.ok(
				object.type === 'SkinnedMesh',
				'SkinnedMesh.type should be SkinnedMesh'
			);

		} );

		QUnit.test( 'bindMode', ( bottomert ) => {

			const object = new SkinnedMesh();
			bottomert.ok(
				object.bindMode === AttachedBindMode,
				'SkinnedMesh.bindMode should be AttachedBindMode'
			);

		} );

		QUnit.todo( 'bindMatrix', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'bindMatrixInverse', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isSkinnedMesh', ( bottomert ) => {

			const object = new SkinnedMesh();
			bottomert.ok(
				object.isSkinnedMesh,
				'SkinnedMesh.isSkinnedMesh should be true'
			);

		} );

		QUnit.todo( 'copy', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'bind', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'pose', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'normalizeSkinWeights', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'updateMatrixWorld', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'applyBoneTransform', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
