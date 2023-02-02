/* global QUnit */

import { SkeletonHelper } from '../../../../src/helpers/SkeletonHelper.js';

import { LineSegments } from '../../../../src/objects/LineSegments.js';
import { Bone } from '../../../../src/objects/Bone.js';

export default QUnit.module( 'Helpers', () => {

	QUnit.module( 'SkeletonHelper', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const bone = new Bone();
			const object = new SkeletonHelper( bone );
			assert.strictEqual(
				object instanceof LineSegments, true,
				'SkeletonHelper extends from LineSegments'
			);

		} );

		// INSTANCING
		QUnit.todo( 'Instancing', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const bone = new Bone();
			const object = new SkeletonHelper( bone );
			assert.ok(
				object.type === 'SkeletonHelper',
				'SkeletonHelper.type should be SkeletonHelper'
			);

		} );

		QUnit.todo( 'root', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'bones', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'matrix', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'matrixAutoUpdate', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isSkeletonHelper', ( assert ) => {

			const bone = new Bone();
			const object = new SkeletonHelper( bone );
			assert.ok(
				object.isSkeletonHelper,
				'SkeletonHelper.isSkeletonHelper should be true'
			);

		} );

		QUnit.todo( 'updateMatrixWorld', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'dispose', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
