import { assert, describe, test } from 'vitest';

import {
	BufferAttribute,
	Int8BufferAttribute,
	Uint8BufferAttribute,
	Uint8ClampedBufferAttribute,
	Int16BufferAttribute,
	Uint16BufferAttribute,
	Int32BufferAttribute,
	Uint32BufferAttribute,
	Float16BufferAttribute,
	Float32BufferAttribute
} from '../../../../src/core/BufferAttribute.js';

import { DynamicDrawUsage, StaticDrawUsage, FloatType } from '../../../../src/constants.js';
import { toHalfFloat, fromHalfFloat } from '../../../../src/extras/DataUtils.js';

describe( 'Core', () => {

	describe( 'BufferAttribute', () => {

		// INSTANCING
		test( 'Instancing', () => {

			assert.throws(
				function () {

					new BufferAttribute( [ 1, 2, 3, 4 ], 2, false );

				},
				/array should be a Typed Array/,
				'Calling constructor with a simple array throws Error'
			);

		} );

		// PUBLIC
		test( 'isBufferAttribute', () => {

			const object = new BufferAttribute();
			assert.ok(
				object.isBufferAttribute,
				'BufferAttribute.isBufferAttribute should be true'
			);

		} );

		test( 'setUsage', () => {

			const attr = new BufferAttribute();
			attr.setUsage( DynamicDrawUsage );

			assert.strictEqual( attr.usage, DynamicDrawUsage, 'Usage was set' );

		} );

		test( 'copy', () => {

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

		test( 'copyAt', () => {

			const attr = new BufferAttribute( new Float32Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ] ), 3 );
			const attr2 = new BufferAttribute( new Float32Array( 9 ), 3 );

			attr2.copyAt( 1, attr, 2 );
			attr2.copyAt( 0, attr, 1 );
			attr2.copyAt( 2, attr, 0 );

			const i = attr.array;
			const i2 = attr2.array; // should be [4, 5, 6, 7, 8, 9, 1, 2, 3]

			assert.ok( i2[ 0 ] === i[ 3 ] && i2[ 1 ] === i[ 4 ] && i2[ 2 ] === i[ 5 ], 'chunk copied to correct place' );
			assert.ok( i2[ 3 ] === i[ 6 ] && i2[ 4 ] === i[ 7 ] && i2[ 5 ] === i[ 8 ], 'chunk copied to correct place' );
			assert.ok( i2[ 6 ] === i[ 0 ] && i2[ 7 ] === i[ 1 ] && i2[ 8 ] === i[ 2 ], 'chunk copied to correct place' );

		} );

		test( 'copyArray', () => {

			const f32a = new Float32Array( [ 5, 6, 7, 8 ] );
			const a = new BufferAttribute( new Float32Array( [ 1, 2, 3, 4 ] ), 2, false );

			a.copyArray( f32a );

			assert.deepEqual( a.array, f32a, 'Check array has new values' );

		} );

		test( 'set', () => {

			const f32a = new Float32Array( [ 1, 2, 3, 4 ] );
			const a = new BufferAttribute( f32a, 2, false );
			const expected = new Float32Array( [ 9, 2, 8, 4 ] );

			a.set( [ 9 ] );
			a.set( [ 8 ], 2 );

			assert.deepEqual( a.array, expected, 'Check array has expected values' );

		} );

		test( 'set[X, Y, Z, W, XYZ, XYZW]/get[X, Y, Z, W]', () => {

			const f32a = new Float32Array( [ 1, 2, 3, 4, 5, 6, 7, 8 ] );
			const a = new BufferAttribute( f32a, 4, false );
			const expected = new Float32Array( [ 1, 2, - 3, - 4, - 5, - 6, 7, 8 ] );

			a.setX( 1, a.getX( 1 ) * - 1 );
			a.setY( 1, a.getY( 1 ) * - 1 );
			a.setZ( 0, a.getZ( 0 ) * - 1 );
			a.setW( 0, a.getW( 0 ) * - 1 );

			assert.deepEqual( a.array, expected, 'Check all set* calls set the correct values' );

		} );

		test( 'setXY', () => {

			const f32a = new Float32Array( [ 1, 2, 3, 4 ] );
			const a = new BufferAttribute( f32a, 2, false );
			const expected = new Float32Array( [ - 1, - 2, 3, 4 ] );

			a.setXY( 0, - 1, - 2 );

			assert.deepEqual( a.array, expected, 'Check for the correct values' );

		} );

		test( 'setXYZ', () => {

			const f32a = new Float32Array( [ 1, 2, 3, 4, 5, 6 ] );
			const a = new BufferAttribute( f32a, 3, false );
			const expected = new Float32Array( [ 1, 2, 3, - 4, - 5, - 6 ] );

			a.setXYZ( 1, - 4, - 5, - 6 );

			assert.deepEqual( a.array, expected, 'Check for the correct values' );

		} );

		test( 'setXYZW', () => {

			const f32a = new Float32Array( [ 1, 2, 3, 4 ] );
			const a = new BufferAttribute( f32a, 4, false );
			const expected = new Float32Array( [ - 1, - 2, - 3, - 4 ] );

			a.setXYZW( 0, - 1, - 2, - 3, - 4 );

			assert.deepEqual( a.array, expected, 'Check for the correct values' );

		} );

		test( 'onUpload', () => {

			const a = new BufferAttribute();
			const func = function () { };

			a.onUpload( func );

			assert.strictEqual( a.onUploadCallback, func, 'Check callback was set properly' );

		} );

		test( 'clone', () => {

			const attr = new BufferAttribute( new Float32Array( [ 1, 2, 3, 4, 0.12, - 12 ] ), 2 );
			const attrCopy = attr.clone();

			assert.ok( attr.array.length === attrCopy.array.length, 'attribute was cloned' );
			for ( let i = 0; i < attr.array.length; i ++ ) {

				assert.ok( attr.array[ i ] === attrCopy.array[ i ], 'array item is equal' );

			}

		} );

		test( 'toJSON', () => {

			const attr = new BufferAttribute( new Float32Array( [ 1, 2, 3, 4, 5, 6 ] ), 3 );
			assert.deepEqual( attr.toJSON(), {
				itemSize: 3,
				type: 'Float32Array',
				array: [ 1, 2, 3, 4, 5, 6 ],
				normalized: false,
				name: '',
				usage: StaticDrawUsage,
				gpuType: FloatType
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
				gpuType: FloatType
			}, 'Serialized to JSON as expected with non-default values' );

		} );

		// OTHERS
		test( 'count', () => {

			assert.ok(
				new BufferAttribute( new Float32Array( [ 1, 2, 3, 4, 5, 6 ] ), 3 ).count === 2,
				'count is equal to the number of chunks'
			);

		} );

	} );

	describe( 'Int8BufferAttribute', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new Int8BufferAttribute();
			assert.strictEqual(
				object instanceof BufferAttribute, true,
				'Int8BufferAttribute extends from BufferAttribute'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new Int8BufferAttribute();
			assert.ok( object, 'Can instantiate an Int8BufferAttribute.' );

		} );

	} );

	describe( 'Uint8BufferAttribute', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new Uint8BufferAttribute();
			assert.strictEqual(
				object instanceof BufferAttribute, true,
				'Uint8BufferAttribute extends from BufferAttribute'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new Uint8BufferAttribute();
			assert.ok( object, 'Can instantiate a Uint8BufferAttribute.' );

		} );

	} );

	describe( 'Uint8ClampedBufferAttribute', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new Uint8ClampedBufferAttribute();
			assert.strictEqual(
				object instanceof BufferAttribute, true,
				'Uint8ClampedBufferAttribute extends from BufferAttribute'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new Uint8ClampedBufferAttribute();
			assert.ok( object, 'Can instantiate a Uint8ClampedBufferAttribute.' );

		} );

	} );

	describe( 'Int16BufferAttribute', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new Int16BufferAttribute();
			assert.strictEqual(
				object instanceof BufferAttribute, true,
				'Int16BufferAttribute extends from BufferAttribute'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new Int16BufferAttribute();
			assert.ok( object, 'Can instantiate an Int16BufferAttribute.' );

		} );

	} );

	describe( 'Uint16BufferAttribute', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new Uint16BufferAttribute();
			assert.strictEqual(
				object instanceof BufferAttribute, true,
				'Uint16BufferAttribute extends from BufferAttribute'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new Uint16BufferAttribute();
			assert.ok( object, 'Can instantiate a Uint16BufferAttribute.' );

		} );

	} );

	describe( 'Int32BufferAttribute', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new Int32BufferAttribute();
			assert.strictEqual(
				object instanceof BufferAttribute, true,
				'Int32BufferAttribute extends from BufferAttribute'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new Int32BufferAttribute();
			assert.ok( object, 'Can instantiate an Int32BufferAttribute.' );

		} );

	} );

	describe( 'Uint32BufferAttribute', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new Uint32BufferAttribute();
			assert.strictEqual(
				object instanceof BufferAttribute, true,
				'Uint32BufferAttribute extends from BufferAttribute'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new Uint32BufferAttribute();
			assert.ok( object, 'Can instantiate a Uint32BufferAttribute.' );

		} );

	} );

	describe( 'Float16BufferAttribute', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new Float16BufferAttribute();
			assert.strictEqual(
				object instanceof BufferAttribute, true,
				'Float16BufferAttribute extends from BufferAttribute'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new Float16BufferAttribute();
			assert.ok( object, 'Can instantiate a Float16BufferAttribute.' );

		} );

		const toHalfFloatArray = ( f32Array ) => {

			const f16Array = new Uint16Array( f32Array.length );
			for ( let i = 0, n = f32Array.length; i < n; ++ i ) {

				f16Array[ i ] = toHalfFloat( f32Array[ i ] );

			}

			return f16Array;

		};

		const fromHalfFloatArray = ( f16Array ) => {

			const f32Array = new Float32Array( f16Array.length );
			for ( let i = 0, n = f16Array.length; i < n; ++ i ) {

				f32Array[ i ] = fromHalfFloat( f16Array[ i ] );

			}

			return f32Array;

		};

		test( 'set[X, Y, Z, W, XYZ, XYZW]/get[X, Y, Z, W]', () => {

			const f32a = new Float32Array( [ 1, 2, 3, 4, 5, 6, 7, 8 ] );
			const a = new Float16BufferAttribute( toHalfFloatArray( f32a ), 4, false );
			const expected = new Float32Array( [ 1, 2, - 3, - 4, - 5, - 6, 7, 8 ] );

			a.setX( 1, a.getX( 1 ) * - 1 );
			a.setY( 1, a.getY( 1 ) * - 1 );
			a.setZ( 0, a.getZ( 0 ) * - 1 );
			a.setW( 0, a.getW( 0 ) * - 1 );

			assert.deepEqual( fromHalfFloatArray( a.array ), expected, 'Check all set* calls set the correct values' );

		} );

		test( 'setXY', () => {

			const f32a = new Float32Array( [ 1, 2, 3, 4 ] );
			const a = new Float16BufferAttribute( toHalfFloatArray( f32a ), 2, false );
			const expected = new Float32Array( [ - 1, - 2, 3, 4 ] );

			a.setXY( 0, - 1, - 2 );

			assert.deepEqual( fromHalfFloatArray( a.array ), expected, 'Check for the correct values' );

		} );

		test( 'setXYZ', () => {

			const f32a = new Float32Array( [ 1, 2, 3, 4, 5, 6 ] );
			const a = new Float16BufferAttribute( toHalfFloatArray( f32a ), 3, false );
			const expected = new Float32Array( [ 1, 2, 3, - 4, - 5, - 6 ] );

			a.setXYZ( 1, - 4, - 5, - 6 );

			assert.deepEqual( fromHalfFloatArray( a.array ), expected, 'Check for the correct values' );

		} );

		test( 'setXYZW', () => {

			const f32a = new Float32Array( [ 1, 2, 3, 4 ] );
			const a = new Float16BufferAttribute( toHalfFloatArray( f32a ), 4, false );
			const expected = new Float32Array( [ - 1, - 2, - 3, - 4 ] );

			a.setXYZW( 0, - 1, - 2, - 3, - 4 );

			assert.deepEqual( fromHalfFloatArray( a.array ), expected, 'Check for the correct values' );

		} );

	} );

	describe( 'Float32BufferAttribute', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new Float32BufferAttribute();
			assert.strictEqual(
				object instanceof BufferAttribute, true,
				'Float32BufferAttribute extends from BufferAttribute'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new Float32BufferAttribute();
			assert.ok( object, 'Can instantiate a Float32BufferAttribute.' );

		} );

	} );

} );
