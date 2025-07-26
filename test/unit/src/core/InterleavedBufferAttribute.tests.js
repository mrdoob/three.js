/* global QUnit */

import { InterleavedBufferAttribute } from '../../../../src/core/InterleavedBufferAttribute.js';

import { InterleavedBuffer } from '../../../../src/core/InterleavedBuffer.js';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'InterleavedBufferAttribute', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new InterleavedBufferAttribute();
			assert.ok( object, 'Can instantiate an InterleavedBufferAttribute.' );

		} );

		// PROPERTIES
		QUnit.todo( 'name', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'data', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'itemSize', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'offset', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'normalized', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'count', ( assert ) => {

			const buffer = new InterleavedBuffer( new Float32Array( [ 1, 2, 3, 7, 8, 9 ] ), 3 );
			const instance = new InterleavedBufferAttribute( buffer, 2, 0 );

			assert.ok( instance.count === 2, 'count is calculated via array length / stride' );

		} );

		QUnit.todo( 'array', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'needsUpdate', ( assert ) => {

			// set needsUpdate( value )
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isInterleavedBufferAttribute', ( assert ) => {

			const object = new InterleavedBufferAttribute();
			assert.ok(
				object.isInterleavedBufferAttribute,
				'InterleavedBufferAttribute.isInterleavedBufferAttribute should be true'
			);

		} );

		QUnit.todo( 'applyMatrix4', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'applyNormalMatrix', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'transformDirection', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// setY, setZ and setW are calculated in the same way so not QUnit.testing this
		// TODO: ( you can't be sure that will be the case in future, or a mistake was introduce in one off them ! )
		QUnit.test( 'setX', ( assert ) => {

			let buffer = new InterleavedBuffer( new Float32Array( [ 1, 2, 3, 7, 8, 9 ] ), 3 );
			let instance = new InterleavedBufferAttribute( buffer, 2, 0 );

			instance.setX( 0, 123 );
			instance.setX( 1, 321 );

			assert.ok( instance.data.array[ 0 ] === 123 &&
				instance.data.array[ 3 ] === 321, 'x was calculated correct based on index and default offset' );

			buffer = new InterleavedBuffer( new Float32Array( [ 1, 2, 3, 7, 8, 9 ] ), 3 );
			instance = new InterleavedBufferAttribute( buffer, 2, 1 );

			instance.setX( 0, 123 );
			instance.setX( 1, 321 );

			// the offset was defined as 1, so go one step further in the array
			assert.ok( instance.data.array[ 1 ] === 123 &&
				instance.data.array[ 4 ] === 321, 'x was calculated correct based on index and default offset' );

		} );

		QUnit.todo( 'setY', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setZ', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setW', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getX', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getY', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getZ', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getW', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setXY', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setXYZ', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setXYZW', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'clone', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'toJSON', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
