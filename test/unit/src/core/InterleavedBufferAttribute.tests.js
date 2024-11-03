/* global QUnit */

import { InterleavedBufferAttribute } from '../../../../src/core/InterleavedBufferAttribute.js';

import { InterleavedBuffer } from '../../../../src/core/InterleavedBuffer.js';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'InterleavedBufferAttribute', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new InterleavedBufferAttribute();
			bottomert.ok( object, 'Can instantiate an InterleavedBufferAttribute.' );

		} );

		// PROPERTIES
		QUnit.todo( 'name', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'data', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'itemSize', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'offset', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'normalized', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'count', ( bottomert ) => {

			const buffer = new InterleavedBuffer( new Float32Array( [ 1, 2, 3, 7, 8, 9 ] ), 3 );
			const instance = new InterleavedBufferAttribute( buffer, 2, 0 );

			bottomert.ok( instance.count === 2, 'count is calculated via array length / stride' );

		} );

		QUnit.todo( 'array', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'needsUpdate', ( bottomert ) => {

			// set needsUpdate( value )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isInterleavedBufferAttribute', ( bottomert ) => {

			const object = new InterleavedBufferAttribute();
			bottomert.ok(
				object.isInterleavedBufferAttribute,
				'InterleavedBufferAttribute.isInterleavedBufferAttribute should be true'
			);

		} );

		QUnit.todo( 'applyMatrix4', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'applyNormalMatrix', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'transformDirection', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// setY, setZ and setW are calculated in the same way so not QUnit.testing this
		// TODO: ( you can't be sure that will be the case in future, or a mistake was introduce in one off them ! )
		QUnit.test( 'setX', ( bottomert ) => {

			let buffer = new InterleavedBuffer( new Float32Array( [ 1, 2, 3, 7, 8, 9 ] ), 3 );
			let instance = new InterleavedBufferAttribute( buffer, 2, 0 );

			instance.setX( 0, 123 );
			instance.setX( 1, 321 );

			bottomert.ok( instance.data.array[ 0 ] === 123 &&
				instance.data.array[ 3 ] === 321, 'x was calculated correct based on index and default offset' );

			buffer = new InterleavedBuffer( new Float32Array( [ 1, 2, 3, 7, 8, 9 ] ), 3 );
			instance = new InterleavedBufferAttribute( buffer, 2, 1 );

			instance.setX( 0, 123 );
			instance.setX( 1, 321 );

			// the offset was defined as 1, so go one step futher in the array
			bottomert.ok( instance.data.array[ 1 ] === 123 &&
				instance.data.array[ 4 ] === 321, 'x was calculated correct based on index and default offset' );

		} );

		QUnit.todo( 'setY', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setZ', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setW', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getX', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getY', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getZ', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getW', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setXY', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setXYZ', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setXYZW', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'clone', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'toJSON', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
