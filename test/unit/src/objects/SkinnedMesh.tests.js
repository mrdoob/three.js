/* global QUnit */

import { Object3D } from '../../../../src/core/Object3D.js';
import { Mesh } from '../../../../src/objects/Mesh.js';
import { SkinnedMesh } from '../../../../src/objects/SkinnedMesh.js';
import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { BufferAttribute } from '../../../../src/core/BufferAttribute.js';
import { AttachedBindMode, BoneIndexWeightsTextureAllow, BoneIndexWeightsTextureAlways, BoneIndexWeightsTextureNever } from '../../../../src/constants.js';

QUnit.assert.arrayApproxEqual = function ( actual, expected, epsilon = 1e-14, message = '' ) {

	let result = true;
	if ( actual.length !== expected.length ) {

		result = false;
		message = 'The arrays had different sizes. ' + message;

	} else {

		for ( let ii = 0; ii < expected.length; ++ ii ) {

			const diff = actual[ ii ] - expected[ ii ];
			if ( Math.abs( actual[ ii ] - expected[ ii ] ) > epsilon ) {

				result = false;
				message = `The arrays differed by more than ${epsilon} at index ${ii}\n`
				        + `  diff: ${diff}\n`
								+ `  actual: ${actual[ ii ]}\n`
								+ `  expected: ${expected[ ii ]}\n`
								+ message;
				break;

			}

		}

	}

	this.pushResult( {
		result: result,
		actual: actual,
		expected: expected,
		message: message
	} );

};

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'SkinnedMesh', () => {

		// CONSTRUCTOR
		QUnit.module( 'constructor', () => {

			QUnit.test( 'normalizes 1 buffer of already-sorted float32 skin weights', ( assert ) => {

				// Given a sorted, non-normalized pair of bone index/weight buffers
				const geometry = new BufferGeometry();

				const skinIndex = new BufferAttribute(
					new Uint16Array( [ 0, 1, 2, 3 ] ), 4 );

				const skinWeight = new BufferAttribute(
					new Float32Array( [ 4, 3, 2, 1 ] ), 4 );

				geometry.setAttribute( 'skinIndex', skinIndex );
				geometry.setAttribute( 'skinWeight', skinWeight );

				// When a SkinnedMesh is created
				new SkinnedMesh( geometry, null );

				// Then the buffers are normalized
				assert.arrayApproxEqual( skinIndex.array, new Uint16Array( [ 0, 1, 2, 3 ] ) );
				assert.arrayApproxEqual( skinWeight.array, new Float32Array( [ 0.4, 0.3, 0.2, 0.1 ] ) );

			} );

			QUnit.test( 'sorts 1 buffer of already-normalized float32 skin weights', ( assert ) => {

				// Given an unsorted, normalized pair of bone index/weight buffers
				const geometry = new BufferGeometry();

				const skinIndex = new BufferAttribute(
					new Uint16Array( [ 0, 1, 2, 3 ] ), 4 );

				const skinWeight = new BufferAttribute(
					new Float32Array( [ 0.1, 0.2, 0.3, 0.4 ] ), 4 );

				geometry.setAttribute( 'skinIndex', skinIndex );
				geometry.setAttribute( 'skinWeight', skinWeight );

				// When a SkinnedMesh is created
				new SkinnedMesh( geometry, null );

				// Then the buffers are sorted
				assert.arrayApproxEqual( skinIndex.array, new Uint16Array( [ 3, 2, 1, 0 ] ) );
				assert.arrayApproxEqual( skinWeight.array, new Float32Array( [ 0.4, 0.3, 0.2, 0.1 ] ) );

			} );

			QUnit.test( 'sorts and normalizes multiple buffers of skin weights', ( assert ) => {

				// Given two pairs of bone index/weight buffers
				const geometry = new BufferGeometry();

				const skinIndex = new BufferAttribute(
					new Uint16Array( [ 0, 1, 2, 3 ] ), 4 );
				const skinIndex1 = new BufferAttribute(
					new Uint16Array( [ 4, 5, 6, 7 ] ), 4 );

				const skinWeight = new BufferAttribute(
					new Float32Array( [ 1, 2, 3, 4 ] ), 4 );
				const skinWeight1 = new BufferAttribute(
					new Float32Array( [ 10, 20, 29, 31 ] ), 4 );

				geometry.setAttribute( 'skinIndex', skinIndex );
				geometry.setAttribute( 'skinIndex1', skinIndex1 );
				geometry.setAttribute( 'skinWeight', skinWeight );
				geometry.setAttribute( 'skinWeight1', skinWeight1 );

				// When a SkinnedMesh is created
				new SkinnedMesh( geometry, null );

				// Then weights are sorted and normalized across both pairs of buffers
				assert.arrayApproxEqual( skinIndex.array, new Uint16Array( [ 7, 6, 5, 4 ] ) );
				assert.arrayApproxEqual( skinWeight.array, new Float32Array( [ 0.31, 0.29, 0.20, 0.10 ] ) );

				assert.arrayApproxEqual( skinIndex1.array, new Uint16Array( [ 3, 2, 1, 0 ] ) );
				assert.arrayApproxEqual( skinWeight1.array, new Float32Array( [ 0.04, 0.03, 0.02, 0.01 ] ) );

			} );

			QUnit.test( 'sorts and normalizes only the biggest 4 weights when skin weight texture is disabled', ( assert ) => {

				// Given two pairs of bone index/weight buffers
				const geometry = new BufferGeometry();

				const skinIndex = new BufferAttribute(
					new Uint16Array( [ 0, 1, 2, 3 ] ), 4 );
				const skinIndex1 = new BufferAttribute(
					new Uint16Array( [ 4, 5, 6, 7 ] ), 4 );

				const skinWeight = new BufferAttribute(
					new Float32Array( [ 10, 2, 3, 4 ] ), 4 );
				const skinWeight1 = new BufferAttribute(
					new Float32Array( [ 1, 20, 30, 40 ] ), 4 );

				geometry.setAttribute( 'skinIndex', skinIndex );
				geometry.setAttribute( 'skinIndex1', skinIndex1 );
				geometry.setAttribute( 'skinWeight', skinWeight );
				geometry.setAttribute( 'skinWeight1', skinWeight1 );

				// When a SkinnedMesh is created but bone textures are not used
				new SkinnedMesh( geometry, null, { useBoneIndexWeightsTexture: BoneIndexWeightsTextureNever } );

				// Then the highest 4 weights are sorted and normalized into the first
				// pair of bone index/weight buffers
				assert.arrayApproxEqual( skinIndex.array, new Uint16Array( [ 7, 6, 5, 0 ] ) );
				assert.arrayApproxEqual( skinWeight.array, new Float32Array( [ 0.40, 0.30, 0.20, 0.10 ] ) );

			} );

			QUnit.test( 'BoneIndexWeightsTextureAllow does not create a skin weight texture for <= 4 weights', ( assert ) => {

				// Given a pair of bone weight/index buffers
				const geometry = new BufferGeometry();

				const skinIndex = new BufferAttribute(
					new Uint16Array( [ 0, 1, 2, 3 ] ), 4 );

				const skinWeight = new BufferAttribute(
					new Float32Array( [ 1, 2, 3, 4 ] ), 4 );

				geometry.setAttribute( 'skinIndex', skinIndex );
				geometry.setAttribute( 'skinWeight', skinWeight );

				// When a SkinnedMesh is created and bone weight textures are "allowed"
				const mesh = new SkinnedMesh( geometry, null, {
					useBoneIndexWeightsTexture: BoneIndexWeightsTextureAllow
				} );

				// Then a bone weight texture is not created
				assert.equal( mesh.boneIndexWeightsTexture, null );
				assert.false( geometry.hasAttribute( 'bonePairTexStartIndex' ) );

			} );

			QUnit.test( 'BoneIndexWeightsTextureAllow creates a skin weight texture for > 4 weights', ( assert ) => {

				// Given a pair of bone weight/index buffers
				const geometry = new BufferGeometry();

				const skinIndex = new BufferAttribute(
					new Uint16Array( [ 0, 1, 2, 3 ] ), 4 );
				const skinIndex1 = new BufferAttribute(
					new Uint16Array( [ 4, 5, 6, 7 ] ), 4 );

				const skinWeight = new BufferAttribute(
					new Float32Array( [ 1, 2, 3, 4 ] ), 4 );
				const skinWeight1 = new BufferAttribute(
					new Float32Array( [ 1, 2, 3, 4 ] ), 4 );

				geometry.setAttribute( 'skinIndex', skinIndex );
				geometry.setAttribute( 'skinIndex1', skinIndex1 );
				geometry.setAttribute( 'skinWeight', skinWeight );
				geometry.setAttribute( 'skinWeight1', skinWeight1 );

				// When a SkinnedMesh is created and bone weight textures are "allowed"
				const mesh = new SkinnedMesh( geometry, null, {
					useBoneIndexWeightsTexture: BoneIndexWeightsTextureAllow
				} );

				// Then a bone weight texture is created
				assert.ok( mesh.boneIndexWeightsTexture );
				assert.true( geometry.hasAttribute( 'bonePairTexStartIndex' ) );

			} );

			QUnit.test( 'BoneIndexWeightsTextureNever does not creates a skin weight texture for > 4 weights', ( assert ) => {

				// Given a pair of bone weight/index buffers
				const geometry = new BufferGeometry();

				const skinIndex = new BufferAttribute(
					new Uint16Array( [ 0, 1, 2, 3 ] ), 4 );
				const skinIndex1 = new BufferAttribute(
					new Uint16Array( [ 4, 5, 6, 7 ] ), 4 );

				const skinWeight = new BufferAttribute(
					new Float32Array( [ 1, 2, 3, 4 ] ), 4 );
				const skinWeight1 = new BufferAttribute(
					new Float32Array( [ 1, 2, 3, 4 ] ), 4 );

				geometry.setAttribute( 'skinIndex', skinIndex );
				geometry.setAttribute( 'skinIndex1', skinIndex1 );
				geometry.setAttribute( 'skinWeight', skinWeight );
				geometry.setAttribute( 'skinWeight1', skinWeight1 );

				// When a SkinnedMesh is created and bone weight textures are disabled
				const mesh = new SkinnedMesh( geometry, null, {
					useBoneIndexWeightsTexture: BoneIndexWeightsTextureNever
				} );

				// Then a bone weight texture is not created
				assert.equal( mesh.boneIndexWeightsTexture, null );
				assert.false( geometry.hasAttribute( 'bonePairTexStartIndex' ) );

			} );

			QUnit.test( 'BoneIndexWeightsTextureAlways creates a skin weight texture for <= 4 weights', ( assert ) => {

				// Given a pair of bone weight/index buffers
				const geometry = new BufferGeometry();

				const skinIndex = new BufferAttribute(
					new Uint16Array( [ 0, 1, 2, 3 ] ), 4 );

				const skinWeight = new BufferAttribute(
					new Float32Array( [ 1, 2, 3, 4 ] ), 4 );

				geometry.setAttribute( 'skinIndex', skinIndex );
				geometry.setAttribute( 'skinWeight', skinWeight );

				// When a SkinnedMesh is created and bone weight textures are forced on
				const mesh = new SkinnedMesh( geometry, null, {
					 useBoneIndexWeightsTexture: BoneIndexWeightsTextureAlways
				} );

				// Then a bone weight texture is created
				assert.ok( mesh.boneIndexWeightsTexture );
				assert.true( geometry.hasAttribute( 'bonePairTexStartIndex' ) );

			} );

			QUnit.test( 'creates a bone index/weight texture for multiple vertices', ( assert ) => {

				// Given multiple bone weight/index buffers for multiple vertices
				// where some of the weights are 0
				const geometry = new BufferGeometry();

				const skinIndex = new BufferAttribute(
					new Uint16Array( [ 0, 1, 2, 3, 0, 1, 2, 3 ] ), 4 );
				const skinIndex1 = new BufferAttribute(
					new Uint16Array( [ 4, 5, 6, 7, 4, 5, 6, 7 ] ), 4 );

				const skinWeight = new BufferAttribute(
					new Float32Array( [ 0, 0, 30, 40, 4, 6, 0, 40 ] ), 4 );
				const skinWeight1 = new BufferAttribute(
					new Float32Array( [ 10, 19, 1, 0, 0, 20, 30, 0 ] ), 4 );

				geometry.setAttribute( 'skinIndex', skinIndex );
				geometry.setAttribute( 'skinIndex1', skinIndex1 );
				geometry.setAttribute( 'skinWeight', skinWeight );
				geometry.setAttribute( 'skinWeight1', skinWeight1 );

				// When a SkinnedMesh is created
				const mesh = new SkinnedMesh( geometry, null );

				// Then the bone weight texture is as expected
				assert.equal( mesh.boneIndexWeightsTexture.source.data.width, 4, 'incorrect width' );
				assert.equal( mesh.boneIndexWeightsTexture.source.data.height, 3, 'incorrect height' );

				assert.arrayApproxEqual( mesh.boneIndexWeightsTexture.source.data.data, new Float32Array( [
					3, 0.4,
					2, 0.3,
					5, 0.19,
					4, 0.1,
					6, 0.01,
					- 1, - 1,
					3, 0.4,
					6, 0.3,
					5, 0.2,
					1, 0.06,
					0, 0.04,
					- 1, - 1
				] ) );

				assert.true( geometry.hasAttribute( 'bonePairTexStartIndex' ) );
				assert.arrayApproxEqual( geometry.getAttribute( 'bonePairTexStartIndex' ).array, [ 0, 6 ] );

			} );

		} );

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

		QUnit.todo( 'updateMatrixWorld', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'applyBoneTransform', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
