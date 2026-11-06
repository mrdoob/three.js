import { assert, describe, test } from 'vitest';

import { Object3D } from '../../../../src/core/Object3D.js';
import { Mesh } from '../../../../src/objects/Mesh.js';
import { SkinnedMesh } from '../../../../src/objects/SkinnedMesh.js';
import { AttachedBindMode } from '../../../../src/constants.js';

describe( 'Objects', () => {

	describe( 'SkinnedMesh', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const skinnedMesh = new SkinnedMesh();

			assert.strictEqual( skinnedMesh instanceof Object3D, true, 'SkinnedMesh extends from Object3D' );
			assert.strictEqual( skinnedMesh instanceof Mesh, true, 'SkinnedMesh extends from Mesh' );

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new SkinnedMesh();
			assert.ok( object, 'Can instantiate a SkinnedMesh.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new SkinnedMesh();
			assert.ok(
				object.type === 'SkinnedMesh',
				'SkinnedMesh.type should be SkinnedMesh'
			);

		} );

		test( 'bindMode', () => {

			const object = new SkinnedMesh();
			assert.ok(
				object.bindMode === AttachedBindMode,
				'SkinnedMesh.bindMode should be AttachedBindMode'
			);

		} );

		// PUBLIC
		test( 'isSkinnedMesh', () => {

			const object = new SkinnedMesh();
			assert.ok(
				object.isSkinnedMesh,
				'SkinnedMesh.isSkinnedMesh should be true'
			);

		} );

	} );

} );
