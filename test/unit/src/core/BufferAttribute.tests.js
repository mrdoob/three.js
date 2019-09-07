/**
 * @author simonThiele / https://github.com/simonThiele
 */
/* global QUnit */

import { BufferAttribute } from '../../../../src/core/BufferAttribute';
import { Color } from '../../../../src/math/Color';
import { Vector2 } from '../../../../src/math/Vector2';
import { Vector3 } from '../../../../src/math/Vector3';
import { Vector4 } from '../../../../src/math/Vector4';
import { DynamicDrawUsage } from '../../../../src/constants';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'BufferAttribute', () => {

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {

			assert.throws(
				function () {

					var a = new BufferAttribute( [ 1, 2, 3, 4 ], 2, false );

				},
				/array should be a Typed Array/,
				"Calling constructor with a simple array throws Error"
			);

		} );

		// PROPERTIES
		QUnit.todo( "needsUpdate", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// PUBLIC STUFF
		QUnit.todo( "isBufferAttribute", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "setArray", ( assert ) => {

			var f32a = new Float32Array( [ 1, 2, 3, 4 ] );
			var a = new BufferAttribute( f32a, 2, false );

			a.setArray( f32a, 2 );

			assert.strictEqual( a.count, 2, "Check item count" );
			assert.strictEqual( a.array, f32a, "Check array" );

			assert.throws(
				function () {

					a.setArray( [ 1, 2, 3, 4 ] );

				},
				/array should be a Typed Array/,
				"Calling setArray with a simple array throws Error"
			);

		} );

		QUnit.test( "setUsage", ( assert ) => {

			var attr = new BufferAttribute();
			attr.setUsage( DynamicDrawUsage );

			assert.strictEqual( attr.usage, DynamicDrawUsage, "Usage was set" );

		} );

		QUnit.test( "copy", ( assert ) => {

			var attr = new BufferAttribute( new Float32Array( [ 1, 2, 3, 4, 5, 6 ] ), 3 );
			attr.setUsage( DynamicDrawUsage );
			attr.needsUpdate = true;

			var attrCopy = new BufferAttribute().copy( attr );

			assert.ok( attr.count === attrCopy.count, 'count is equal' );
			assert.ok( attr.itemSize === attrCopy.itemSize, 'itemSize is equal' );
			assert.ok( attr.usage === attrCopy.usage, 'usage is equal' );
			assert.ok( attr.array.length === attrCopy.array.length, 'array length is equal' );
			assert.ok( attr.version === 1 && attrCopy.version === 0, 'version is not copied which is good' );

		} );

		QUnit.test( "copyAt", ( assert ) => {

			var attr = new BufferAttribute( new Float32Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ] ), 3 );
			var attr2 = new BufferAttribute( new Float32Array( 9 ), 3 );

			attr2.copyAt( 1, attr, 2 );
			attr2.copyAt( 0, attr, 1 );
			attr2.copyAt( 2, attr, 0 );

			var i = attr.array;
			var i2 = attr2.array; // should be [4, 5, 6, 7, 8, 9, 1, 2, 3]

			assert.ok( i2[ 0 ] === i[ 3 ] && i2[ 1 ] === i[ 4 ] && i2[ 2 ] === i[ 5 ], 'chunck copied to correct place' );
			assert.ok( i2[ 3 ] === i[ 6 ] && i2[ 4 ] === i[ 7 ] && i2[ 5 ] === i[ 8 ], 'chunck copied to correct place' );
			assert.ok( i2[ 6 ] === i[ 0 ] && i2[ 7 ] === i[ 1 ] && i2[ 8 ] === i[ 2 ], 'chunck copied to correct place' );

		} );

		QUnit.test( "copyArray", ( assert ) => {

			var f32a = new Float32Array( [ 5, 6, 7, 8 ] );
			var a = new BufferAttribute( new Float32Array( [ 1, 2, 3, 4 ] ), 2, false );

			a.copyArray( f32a );

			assert.deepEqual( a.array, f32a, "Check array has new values" );

		} );

		QUnit.test( "copyColorsArray", ( assert ) => {

			var attr = new BufferAttribute( new Float32Array( 6 ), 3 );

			attr.copyColorsArray( [
				new Color( 0, 0.5, 1 ),
				new Color( 0.25, 1, 0 )
			] );

			var i = attr.array;
			assert.ok( i[ 0 ] === 0 && i[ 1 ] === 0.5 && i[ 2 ] === 1, 'first color was copied correctly' );
			assert.ok( i[ 3 ] === 0.25 && i[ 4 ] === 1 && i[ 5 ] === 0, 'second color was copied correctly' );

		} );

		QUnit.test( "copyVector2sArray", ( assert ) => {

			var attr = new BufferAttribute( new Float32Array( 4 ), 2 );

			attr.copyVector2sArray( [
				new Vector2( 1, 2 ),
				new Vector2( 4, 5 )
			] );

			var i = attr.array;
			assert.ok( i[ 0 ] === 1 && i[ 1 ] === 2, 'first vector was copied correctly' );
			assert.ok( i[ 2 ] === 4 && i[ 3 ] === 5, 'second vector was copied correctly' );

		} );

		QUnit.test( "copyVector3sArray", ( assert ) => {

			var attr = new BufferAttribute( new Float32Array( 6 ), 2 );

			attr.copyVector3sArray( [
				new Vector3( 1, 2, 3 ),
				new Vector3( 10, 20, 30 )
			] );

			var i = attr.array;
			assert.ok( i[ 0 ] === 1 && i[ 1 ] === 2 && i[ 2 ] === 3, 'first vector was copied correctly' );
			assert.ok( i[ 3 ] === 10 && i[ 4 ] === 20 && i[ 5 ] === 30, 'second vector was copied correctly' );

		} );

		QUnit.test( "copyVector4sArray", ( assert ) => {

			var attr = new BufferAttribute( new Float32Array( 8 ), 2 );

			attr.copyVector4sArray( [
				new Vector4( 1, 2, 3, 4 ),
				new Vector4( 10, 20, 30, 40 )
			] );

			var i = attr.array;
			assert.ok( i[ 0 ] === 1 && i[ 1 ] === 2 && i[ 2 ] === 3 && i[ 3 ] === 4, 'first vector was copied correctly' );
			assert.ok( i[ 4 ] === 10 && i[ 5 ] === 20 && i[ 6 ] === 30 && i[ 7 ] === 40, 'second vector was copied correctly' );

		} );

		QUnit.test( "set", ( assert ) => {

			var f32a = new Float32Array( [ 1, 2, 3, 4 ] );
			var a = new BufferAttribute( f32a, 2, false );
			var expected = new Float32Array( [ 9, 2, 8, 4 ] );

			a.set( [ 9 ] );
			a.set( [ 8 ], 2 );

			assert.deepEqual( a.array, expected, "Check array has expected values" );

		} );

		QUnit.test( "set[X, Y, Z, W, XYZ, XYZW]/get[X, Y, Z, W]", ( assert ) => {

			var f32a = new Float32Array( [ 1, 2, 3, 4, 5, 6, 7, 8 ] );
			var a = new BufferAttribute( f32a, 4, false );
			var expected = new Float32Array( [ 1, 2, - 3, - 4, - 5, - 6, 7, 8 ] );

			a.setX( 1, a.getX( 1 ) * - 1 );
			a.setY( 1, a.getY( 1 ) * - 1 );
			a.setZ( 0, a.getZ( 0 ) * - 1 );
			a.setW( 0, a.getW( 0 ) * - 1 );

			assert.deepEqual( a.array, expected, "Check all set* calls set the correct values" );

		} );

		QUnit.test( "setXY", ( assert ) => {

			var f32a = new Float32Array( [ 1, 2, 3, 4 ] );
			var a = new BufferAttribute( f32a, 2, false );
			var expected = new Float32Array( [ - 1, - 2, 3, 4 ] );

			a.setXY( 0, - 1, - 2 );

			assert.deepEqual( a.array, expected, "Check for the correct values" );

		} );

		QUnit.test( "setXYZ", ( assert ) => {

			var f32a = new Float32Array( [ 1, 2, 3, 4, 5, 6 ] );
			var a = new BufferAttribute( f32a, 3, false );
			var expected = new Float32Array( [ 1, 2, 3, - 4, - 5, - 6 ] );

			a.setXYZ( 1, - 4, - 5, - 6 );

			assert.deepEqual( a.array, expected, "Check for the correct values" );

		} );

		QUnit.test( "setXYZW", ( assert ) => {

			var f32a = new Float32Array( [ 1, 2, 3, 4 ] );
			var a = new BufferAttribute( f32a, 4, false );
			var expected = new Float32Array( [ - 1, - 2, - 3, - 4 ] );

			a.setXYZW( 0, - 1, - 2, - 3, - 4 );

			assert.deepEqual( a.array, expected, "Check for the correct values" );

		} );

		QUnit.test( "onUpload", ( assert ) => {

			var a = new BufferAttribute();
			var func = function () { };

			a.onUpload( func );

			assert.strictEqual( a.onUploadCallback, func, "Check callback was set properly" );

		} );

		QUnit.test( "clone", ( assert ) => {

			var attr = new BufferAttribute( new Float32Array( [ 1, 2, 3, 4, 0.12, - 12 ] ), 2 );
			var attrCopy = attr.clone();

			assert.ok( attr.array.length === attrCopy.array.length, 'attribute was cloned' );
			for ( var i = 0; i < attr.array.length; i ++ ) {

				assert.ok( attr.array[ i ] === attrCopy.array[ i ], 'array item is equal' );

			}

		} );

		// OTHERS
		QUnit.test( "count", ( assert ) => {

			assert.ok(
				new BufferAttribute( new Float32Array( [ 1, 2, 3, 4, 5, 6 ] ), 3 ).count === 2,
				'count is equal to the number of chunks'
			);

		} );

	} );

	QUnit.module( 'Int8BufferAttribute', () => {

		// INHERITANCE
		QUnit.todo( "Extending", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// INSTANCING
		QUnit.todo( "Instancing", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

	} );

	QUnit.module( 'Uint8BufferAttribute', () => {

		// INHERITANCE
		QUnit.todo( "Extending", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// INSTANCING
		QUnit.todo( "Instancing", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

	} );

	QUnit.module( 'Uint8ClampedBufferAttribute', () => {

		// INHERITANCE
		QUnit.todo( "Extending", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// INSTANCING
		QUnit.todo( "Instancing", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

	} );

	QUnit.module( 'Int16BufferAttribute', () => {

		// INHERITANCE
		QUnit.todo( "Extending", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// INSTANCING
		QUnit.todo( "Instancing", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

	} );

	QUnit.module( 'Uint16BufferAttribute', () => {

		// INHERITANCE
		QUnit.todo( "Extending", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// INSTANCING
		QUnit.todo( "Instancing", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

	} );

	QUnit.module( 'Int32BufferAttribute', () => {

		// INHERITANCE
		QUnit.todo( "Extending", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// INSTANCING
		QUnit.todo( "Instancing", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

	} );

	QUnit.module( 'Uint32BufferAttribute', () => {

		// INHERITANCE
		QUnit.todo( "Extending", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// INSTANCING
		QUnit.todo( "Instancing", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

	} );

	QUnit.module( 'Float32BufferAttribute', () => {

		// INHERITANCE
		QUnit.todo( "Extending", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// INSTANCING
		QUnit.todo( "Instancing", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

	} );

	QUnit.module( 'Float64BufferAttribute', () => {

		// INHERITANCE
		QUnit.todo( "Extending", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// INSTANCING
		QUnit.todo( "Instancing", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

	} );

} );
