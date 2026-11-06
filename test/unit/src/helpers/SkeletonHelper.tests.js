import { assert, describe, test } from 'vitest';

import { SkeletonHelper } from '../../../../src/helpers/SkeletonHelper.js';

import { LineSegments } from '../../../../src/objects/LineSegments.js';
import { Bone } from '../../../../src/objects/Bone.js';

describe( 'Helpers', () => {

	describe( 'SkeletonHelper', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const bone = new Bone();
			const object = new SkeletonHelper( bone );
			assert.strictEqual(
				object instanceof LineSegments, true,
				'SkeletonHelper extends from LineSegments'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const bone = new Bone();
			const object = new SkeletonHelper( bone );
			assert.ok( object, 'Can instantiate a SkeletonHelper.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const bone = new Bone();
			const object = new SkeletonHelper( bone );
			assert.ok(
				object.type === 'SkeletonHelper',
				'SkeletonHelper.type should be SkeletonHelper'
			);

		} );

		// PUBLIC
		test( 'isSkeletonHelper', () => {

			const bone = new Bone();
			const object = new SkeletonHelper( bone );
			assert.ok(
				object.isSkeletonHelper,
				'SkeletonHelper.isSkeletonHelper should be true'
			);

		} );

		test( 'dispose', () => {


			const bone = new Bone();
			const object = new SkeletonHelper( bone );
			object.dispose();

		} );

	} );

} );
