/* global QUnit */

import { Object3D } from '../../../../src/core/Object3D.js';
import { Mesh } from '../../../../src/objects/Mesh.js';
import { SkinnedMesh } from '../../../../src/objects/SkinnedMesh.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'SkinnedMesh', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			var skinnedMesh = new SkinnedMesh();

			assert.strictEqual( skinnedMesh instanceof Object3D, true, 'SkinnedMesh extends from Object3D' );
			assert.strictEqual( skinnedMesh instanceof Mesh, true, 'SkinnedMesh extends from Mesh' );

		} );

		// INSTANCING
		QUnit.todo( 'Instancing', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC STUFF
		QUnit.todo( 'isSkinnedMesh', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );
		QUnit.todo( 'initBones', ( assert ) => {

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
		QUnit.todo( 'clone', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
