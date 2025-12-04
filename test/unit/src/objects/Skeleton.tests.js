/* global QUnit */

import { Skeleton } from '../../../../src/objects/Skeleton.js';
import { Bone } from '../../../../src/objects/Bone.js';
import { Matrix4 } from '../../../../src/math/Matrix4.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'Skeleton', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new Skeleton();
			assert.ok( object, 'Can instantiate a Skeleton.' );

		} );

		// PROPERTIES
		QUnit.test( 'uuid', ( assert ) => {

			const skeleton = new Skeleton();

			assert.ok( typeof skeleton.uuid === 'string' && skeleton.uuid.length > 0, 'uuid is a non-empty string.' );

		} );

		QUnit.test( 'bones', ( assert ) => {

			const bones = [ new Bone(), new Bone() ];
			const skeleton = new Skeleton( bones );

			assert.strictEqual( skeleton.bones.length, bones.length, 'bones length matches constructor argument.' );
			assert.strictEqual( skeleton.bones[ 0 ], bones[ 0 ], 'first bone is preserved.' );
			assert.notStrictEqual( skeleton.bones, bones, 'bones array is cloned, not reused.' );

		} );

		QUnit.test( 'boneInverses', ( assert ) => {

			const bones = [ new Bone(), new Bone() ];
			const skeleton = new Skeleton( bones );

			assert.strictEqual( skeleton.boneInverses.length, bones.length, 'boneInverses has one entry per bone.' );
			skeleton.boneInverses.forEach( ( inverse ) => {

				assert.ok( inverse instanceof Matrix4, 'boneInverse entry is a Matrix4.' );

			} );

		} );

		QUnit.test( 'boneMatrices', ( assert ) => {

			const bones = [ new Bone(), new Bone(), new Bone() ];
			const skeleton = new Skeleton( bones );

			assert.ok( skeleton.boneMatrices instanceof Float32Array, 'boneMatrices is a Float32Array.' );
			assert.strictEqual( skeleton.boneMatrices.length, bones.length * 16, 'boneMatrices has 16 floats per bone.' );

		} );

		QUnit.test( 'boneTexture', ( assert ) => {

			const bones = [ new Bone(), new Bone() ];
			const skeleton = new Skeleton( bones );

			assert.strictEqual( skeleton.boneTexture, null, 'boneTexture is null before computeBoneTexture().' );

			skeleton.computeBoneTexture();

			assert.ok( skeleton.boneTexture && skeleton.boneTexture.isDataTexture, 'boneTexture is a DataTexture after computeBoneTexture().' );

		} );

		QUnit.todo( 'frame', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'init / calculateInverses', ( assert ) => {

			const bone = new Bone();
			bone.updateMatrixWorld( true );

			const skeleton = new Skeleton( [ bone ] );

			assert.strictEqual( skeleton.boneInverses.length, 1, 'calculateInverses() created one inverse matrix.' );

		} );

		QUnit.todo( 'pose', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'update', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'clone', ( assert ) => {

			const bones = [ new Bone(), new Bone() ];
			const skeleton = new Skeleton( bones );

			const clone = skeleton.clone();

			assert.notStrictEqual( clone, skeleton, 'clone() creates a new Skeleton instance.' );
			assert.deepEqual( clone.bones, skeleton.bones, 'clone() reuses the same bones.' );
			assert.deepEqual( clone.boneInverses, skeleton.boneInverses, 'clone() reuses boneInverses.' );

		} );

		QUnit.test( 'computeBoneTexture', ( assert ) => {

			const bones = [ new Bone(), new Bone() ];
			const skeleton = new Skeleton( bones );
			const originalLength = skeleton.boneMatrices.length;

			skeleton.computeBoneTexture();

			assert.ok( skeleton.boneMatrices.length >= originalLength, 'computeBoneTexture() expands boneMatrices buffer as needed.' );
			assert.ok( skeleton.boneTexture && skeleton.boneTexture.isDataTexture, 'computeBoneTexture() creates a DataTexture.' );

		} );

		QUnit.test( 'getBoneByName', ( assert ) => {

			const boneA = new Bone();
			boneA.name = 'a';
			const boneB = new Bone();
			boneB.name = 'b';

			const skeleton = new Skeleton( [ boneA, boneB ] );

			assert.strictEqual( skeleton.getBoneByName( 'b' ), boneB, 'getBoneByName() returns the matching bone.' );
			assert.strictEqual( skeleton.getBoneByName( 'missing' ), undefined, 'getBoneByName() returns undefined if no bone matches.' );

		} );

		QUnit.test( 'dispose', ( assert ) => {

			assert.expect( 0 );

			const object = new Skeleton();
			object.dispose();

		} );

		QUnit.test( 'fromJSON / toJSON', ( assert ) => {

			const boneA = new Bone();
			const boneB = new Bone();

			const skeleton = new Skeleton( [ boneA, boneB ] );
			skeleton.calculateInverses();

			const json = skeleton.toJSON();

			const bonesMap = {};
			bonesMap[ boneA.uuid ] = boneA;
			bonesMap[ boneB.uuid ] = boneB;

			const restored = new Skeleton().fromJSON( json, bonesMap );

			assert.strictEqual( restored.uuid, skeleton.uuid, 'fromJSON() restores uuid.' );
			assert.strictEqual( restored.bones.length, skeleton.bones.length, 'fromJSON() restores bones length.' );
			assert.strictEqual( restored.bones[ 0 ], boneA, 'fromJSON() restores bone references.' );
			assert.strictEqual( restored.bones[ 1 ], boneB, 'fromJSON() restores bone references.' );
			assert.strictEqual( restored.boneInverses.length, skeleton.boneInverses.length, 'fromJSON() restores boneInverses length.' );

		} );

	} );

} );
