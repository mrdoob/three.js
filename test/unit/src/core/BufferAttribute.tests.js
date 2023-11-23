/* global QUnit */

import { BufferAttribute } from '../../../../src/core/BufferAttribute.js';

import {
	Int8BufferAttribute,
	Uint8BufferAttribute,
	Uint8ClampedBufferAttribute,
	Int16BufferAttribute,
	Uint16BufferAttribute,
	Int32BufferAttribute,
	Uint32BufferAttribute,
	Float16BufferAttribute,
	Float32BufferAttribute,
	Float64BufferAttribute
} from '../../../../src/core/BufferAttribute.js';

import { DynamicDrawUsage } from '../../../../src/constants.js';
import { toHalfFloat, fromHalfFloat } from '../../../../src/extras/DataUtils.js';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'BufferAttribute', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			assert.throws(
				function () {

					new BufferAttribute( [ 1, 2, 3, 4 ], 2, false );

				},
				/array should be a Typed Array/,
				'Calling constructor with a simple array throws Error'
			);

		} );

		// PROPERTIES
		QUnit.todo( 'name', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'array', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'itemSize', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'count', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'normalized', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'usage', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'updateRanges', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'version', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'onUploadCallback', ( assert ) => {

			// onUploadCallback() {}
			// defined as member function but set property. refactor req
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'needsUpdate', ( assert ) => {

			// set needsUpdate( value )
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isBufferAttribute', ( assert ) => {

			const object = new BufferAttribute();
			assert.ok(
				object.isBufferAttribute,
				'BufferAttribute.isBufferAttribute should be true'
			);

		} );

		QUnit.test( 'setUsage', ( assert ) => {

			const attr = new BufferAttribute();
			attr.setUsage( DynamicDrawUsage );

			assert.strictEqual( attr.usage, DynamicDrawUsage, 'Usage was set' );

		} );

		QUnit.test( 'copy', ( assert ) => {

			const attr = new BufferAttribute( new Float32Array( [ 1, 2, 3, 4, 5, 6 ] ), 3 );
			attr.setUsage( DynamicDrawUsage );
			attr.needsUpdate = true;

			const attrCopy = new BufferAttribute().copy( attr );

			assert.ok( attr.count === attrCopy.count, 'count is equal' );
			assert.ok( attr.itemSize === attrCopy.itemSize, 'itemSize is equal' );
			assert.ok( attr.usage === attrCopy.usage, 'usage is equal' );
			assert.ok( attr.array.length === attrCopy.array.length, 'array length is equal' );
			assert.ok( attr.version === 1 && attrCopy.version === 0, 'version is not copied which is good' );

		} );

		QUnit.test( 'copyAt', ( assert ) => {

			const attr = new BufferAttribute( new Float32Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ] ), 3 );
			const attr2 = new BufferAttribute( new Float32Array( 9 ), 3 );

			attr2.copyAt( 1, attr, 2 );
			attr2.copyAt( 0, attr, 1 );
			attr2.copyAt( 2, attr, 0 );

			const i = attr.array;
			const i2 = attr2.array; // should be [4, 5, 6, 7, 8, 9, 1, 2, 3]

			assert.ok( i2[ 0 ] === i[ 3 ] && i2[ 1 ] === i[ 4 ] && i2[ 2 ] === i[ 5 ], 'chunck copied to correct place' );
			assert.ok( i2[ 3 ] === i[ 6 ] && i2[ 4 ] === i[ 7 ] && i2[ 5 ] === i[ 8 ], 'chunck copied to correct place' );
			assert.ok( i2[ 6 ] === i[ 0 ] && i2[ 7 ] === i[ 1 ] && i2[ 8 ] === i[ 2 ], 'chunck copied to correct place' );

		} );

		QUnit.test( 'copyArray', ( assert ) => {

			const f32a = new Float32Array( [ 5, 6, 7, 8 ] );
			const a = new BufferAttribute( new Float32Array( [ 1, 2, 3, 4 ] ), 2, false );

			a.copyArray( f32a );

			assert.deepEqual( a.array, f32a, 'Check array has new values' );

		} );

		QUnit.todo( 'applyMatrix3', ( assert ) => {

			// applyMatrix3( m )
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'applyMatrix4', ( assert ) => {

			// applyMatrix4( m )
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'applyNormalMatrix', ( assert ) => {

			// applyNormalMatrix( m )
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'transformDirection', ( assert ) => {

			// transformDirection( m )
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'set', ( assert ) => {

			const f32a = new Float32Array( [ 1, 2, 3, 4 ] );
			const a = new BufferAttribute( f32a, 2, false );
			const expected = new Float32Array( [ 9, 2, 8, 4 ] );

			a.set( [ 9 ] );
			a.set( [ 8 ], 2 );

			assert.deepEqual( a.array, expected, 'Check array has expected values' );

		} );

		QUnit.test( 'set[X, Y, Z, W, XYZ, XYZW]/get[X, Y, Z, W]', ( assert ) => {

			const f32a = new Float32Array( [ 1, 2, 3, 4, 5, 6, 7, 8 ] );
			const a = new BufferAttribute( f32a, 4, false );
			const expected = new Float32Array( [ 1, 2, - 3, - 4, - 5, - 6, 7, 8 ] );

			a.setX( 1, a.getX( 1 ) * - 1 );
			a.setY( 1, a.getY( 1 ) * - 1 );
			a.setZ( 0, a.getZ( 0 ) * - 1 );
			a.setW( 0, a.getW( 0 ) * - 1 );

			assert.deepEqual( a.array, expected, 'Check all set* calls set the correct values' );

		} );

		QUnit.test( 'setXY', ( assert ) => {

			const f32a = new Float32Array( [ 1, 2, 3, 4 ] );
			const a = new BufferAttribute( f32a, 2, false );
			const expected = new Float32Array( [ - 1, - 2, 3, 4 ] );

			a.setXY( 0, - 1, - 2 );

			assert.deepEqual( a.array, expected, 'Check for the correct values' );

		} );

		QUnit.test( 'setXYZ', ( assert ) => {

			const f32a = new Float32Array( [ 1, 2, 3, 4, 5, 6 ] );
			const a = new BufferAttribute( f32a, 3, false );
			const expected = new Float32Array( [ 1, 2, 3, - 4, - 5, - 6 ] );

			a.setXYZ( 1, - 4, - 5, - 6 );

			assert.deepEqual( a.array, expected, 'Check for the correct values' );

		} );

		QUnit.test( 'setXYZW', ( assert ) => {

			const f32a = new Float32Array( [ 1, 2, 3, 4 ] );
			const a = new BufferAttribute( f32a, 4, false );
			const expected = new Float32Array( [ - 1, - 2, - 3, - 4 ] );

			a.setXYZW( 0, - 1, - 2, - 3, - 4 );

			assert.deepEqual( a.array, expected, 'Check for the correct values' );

		} );

		QUnit.test( 'onUpload', ( assert ) => {

			const a = new BufferAttribute();
			const func = function () { };

			a.onUpload( func );

			assert.strictEqual( a.onUploadCallback, func, 'Check callback was set properly' );

		} );

		QUnit.test( 'clone', ( assert ) => {

			const attr = new BufferAttribute( new Float32Array( [ 1, 2, 3, 4, 0.12, - 12 ] ), 2 );
			const attrCopy = attr.clone();

			assert.ok( attr.array.length === attrCopy.array.length, 'attribute was cloned' );
			for ( let i = 0; i < attr.array.length; i ++ ) {

				assert.ok( attr.array[ i ] === attrCopy.array[ i ], 'array item is equal' );

			}

		} );

		QUnit.test( 'toJSON', ( assert ) => {

			const attr = new BufferAttribute( new Float32Array( [ 1, 2, 3, 4, 5, 6 ] ), 3 );
			assert.deepEqual( attr.toJSON(), {
				itemSize: 3,
				type: 'Float32Array',
				array: [ 1, 2, 3, 4, 5, 6 ],
				normalized: false
			}, 'Serialized to JSON as expected' );

			const attr2 = new BufferAttribute( new Float32Array( [ 1, 2, 3, 4, 5, 6 ] ), 3, true );
			attr2.name = 'attributeName';
			attr2.setUsage( DynamicDrawUsage );
			attr2.addUpdateRange( 1, 2 );
			assert.deepEqual( attr2.toJSON(), {
				itemSize: 3,
				type: 'Float32Array',
				array: [ 1, 2, 3, 4, 5, 6 ],
				normalized: true,
				name: 'attributeName',
				usage: DynamicDrawUsage,
			}, 'Serialized to JSON as expected with non-default values' );

		} );

		// OTHERS
		QUnit.test( 'count', ( assert ) => {

			assert.ok(
				new BufferAttribute( new Float32Array( [ 1, 2, 3, 4, 5, 6 ] ), 3 ).count === 2,
				'count is equal to the number of chunks'
			);

		} );

	} );

	QUnit.module( 'Int8BufferAttribute', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new Int8BufferAttribute();
			assert.strictEqual(
				object instanceof BufferAttribute, true,
				'Int8BufferAttribute extends from BufferAttribute'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new Int8BufferAttribute();
			assert.ok( object, 'Can instantiate an Int8BufferAttribute.' );

		} );

	} );

	QUnit.module( 'Uint8BufferAttribute', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new Uint8BufferAttribute();
			assert.strictEqual(
				object instanceof BufferAttribute, true,
				'Uint8BufferAttribute extends from BufferAttribute'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new Uint8BufferAttribute();
			assert.ok( object, 'Can instantiate a Uint8BufferAttribute.' );

		} );

	} );

	QUnit.module( 'Uint8ClampedBufferAttribute', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new Uint8ClampedBufferAttribute();
			assert.strictEqual(
				object instanceof BufferAttribute, true,
				'Uint8ClampedBufferAttribute extends from BufferAttribute'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new Uint8ClampedBufferAttribute();
			assert.ok( object, 'Can instantiate a Uint8ClampedBufferAttribute.' );

		} );

	} );

	QUnit.module( 'Int16BufferAttribute', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new Int16BufferAttribute();
			assert.strictEqual(
				object instanceof BufferAttribute, true,
				'Int16BufferAttribute extends from BufferAttribute'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new Int16BufferAttribute();
			assert.ok( object, 'Can instantiate an Int16BufferAttribute.' );

		} );

	} );

	QUnit.module( 'Uint16BufferAttribute', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new Uint16BufferAttribute();
			assert.strictEqual(
				object instanceof BufferAttribute, true,
				'Uint16BufferAttribute extends from BufferAttribute'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new Uint16BufferAttribute();
			assert.ok( object, 'Can instantiate a Uint16BufferAttribute.' );

		} );

	} );

	QUnit.module( 'Int32BufferAttribute', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new Int32BufferAttribute();
			assert.strictEqual(
				object instanceof BufferAttribute, true,
				'Int32BufferAttribute extends from BufferAttribute'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new Int32BufferAttribute();
			assert.ok( object, 'Can instantiate an Int32BufferAttribute.' );

		} );

	} );

	QUnit.module( 'Uint32BufferAttribute', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new Uint32BufferAttribute();
			assert.strictEqual(
				object instanceof BufferAttribute, true,
				'Uint32BufferAttribute extends from BufferAttribute'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new Uint32BufferAttribute();
			assert.ok( object, 'Can instantiate a Uint32BufferAttribute.' );

		} );

	} );

	QUnit.module( 'Float16BufferAttribute', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new Float16BufferAttribute();
			assert.strictEqual(
				object instanceof BufferAttribute, true,
				'Float16BufferAttribute extends from BufferAttribute'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new Float16BufferAttribute();
			assert.ok( object, 'Can instantiate a Float16BufferAttribute.' );

		} );

		const toHalfFloatArray = ( f32Array ) => {

			const f16Array = new Uint16Array( f32Array.length );
			for ( let i = 0, n = f32Array.length; i < n; ++i ) {

				f16Array[ i ] = toHalfFloat( f32Array[ i ] );

			}

			return f16Array;

		};

		const fromHalfFloatArray = ( f16Array ) => {

			const f32Array = new Float32Array( f16Array.length );
			for ( let i = 0, n = f16Array.length; i < n; ++i ) {

				f32Array[ i ] = fromHalfFloat( f16Array[ i ] );

			}

			return f32Array;

		};

		QUnit.test( 'set[X, Y, Z, W, XYZ, XYZW]/get[X, Y, Z, W]', ( assert ) => {

			const f32a = new Float32Array( [ 1, 2, 3, 4, 5, 6, 7, 8 ] );
			const a = new Float16BufferAttribute( toHalfFloatArray( f32a ), 4, false );
			const expected = new Float32Array( [ 1, 2, - 3, - 4, - 5, - 6, 7, 8 ] );

			a.setX( 1, a.getX( 1 ) * - 1 );
			a.setY( 1, a.getY( 1 ) * - 1 );
			a.setZ( 0, a.getZ( 0 ) * - 1 );
			a.setW( 0, a.getW( 0 ) * - 1 );

			assert.deepEqual( fromHalfFloatArray( a.array ), expected, 'Check all set* calls set the correct values' );

		} );

		QUnit.test( 'setXY', ( assert ) => {

			const f32a = new Float32Array( [ 1, 2, 3, 4 ] );
			const a = new Float16BufferAttribute( toHalfFloatArray( f32a ), 2, false );
			const expected = new Float32Array( [ - 1, - 2, 3, 4 ] );

			a.setXY( 0, - 1, - 2 );

			assert.deepEqual( fromHalfFloatArray( a.array ), expected, 'Check for the correct values' );

		} );

		QUnit.test( 'setXYZ', ( assert ) => {

			const f32a = new Float32Array( [ 1, 2, 3, 4, 5, 6 ] );
			const a = new Float16BufferAttribute( toHalfFloatArray( f32a ), 3, false );
			const expected = new Float32Array( [ 1, 2, 3, - 4, - 5, - 6 ] );

			a.setXYZ( 1, - 4, - 5, - 6 );

			assert.deepEqual( fromHalfFloatArray( a.array ), expected, 'Check for the correct values' );

		} );

		QUnit.test( 'setXYZW', ( assert ) => {

			const f32a = new Float32Array( [ 1, 2, 3, 4 ] );
			const a = new Float16BufferAttribute( toHalfFloatArray( f32a ), 4, false );
			const expected = new Float32Array( [ - 1, - 2, - 3, - 4 ] );

			a.setXYZW( 0, - 1, - 2, - 3, - 4 );

			assert.deepEqual( fromHalfFloatArray( a.array ), expected, 'Check for the correct values' );

		} );

	} );

	QUnit.module( 'Float32BufferAttribute', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new Float32BufferAttribute();
			assert.strictEqual(
				object instanceof BufferAttribute, true,
				'Float32BufferAttribute extends from BufferAttribute'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new Float32BufferAttribute();
			assert.ok( object, 'Can instantiate a Float32BufferAttribute.' );

		} );

	} );

	QUnit.module( 'Float64BufferAttribute', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new Float64BufferAttribute();
			assert.strictEqual(
				object instanceof BufferAttribute, true,
				'Float64BufferAttribute extends from BufferAttribute'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new Float64BufferAttribute();
			assert.ok( object, 'Can instantiate a Float64BufferAttribute.' );

		} );

	} );

} );
