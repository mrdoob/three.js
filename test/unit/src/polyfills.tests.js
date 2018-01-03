/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import '../../../src/polyfills';
import { Vector3 } from '../../../src/math/Vector3';

export default QUnit.module( 'Polyfills', () => {

	// PUBLIC STUFF
	QUnit.test( "Number.EPSILON", ( assert ) => {

		assert.equal( Number.EPSILON, Math.pow( 2, - 52 ), "Number.EPSILON should be equal to 2 to the power of -52." );

	} );

	//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger#Examples

	QUnit.test( "Number.isInteger", ( assert ) => {

		assert.ok( Number.isInteger( 0 ), "0 is an integer." );
		assert.ok( Number.isInteger( 1 ), "1 is an integer." );
		assert.ok( Number.isInteger( - 100000 ), "-100000 is an integer." );
		assert.ok( Number.isInteger( 99999999999999999999999 ), "99999999999999999999999 is an integer." );

		assert.notOk( Number.isInteger( 0.1 ), "0.1 is not an integer." );
		assert.notOk( Number.isInteger( Math.PI ), "PI is not an integer." );
		assert.notOk( Number.isInteger( NaN ), "NaN is not an integer." );
		assert.notOk( Number.isInteger( Infinity ), "Infinity is not an integer." );
		assert.notOk( Number.isInteger( - Infinity ), "-Infinity is not an integer." );
		assert.notOk( Number.isInteger( '10' ), "A string, for example '10', is not an integer." );
		assert.notOk( Number.isInteger( true ), "true is not an integer." );
		assert.notOk( Number.isInteger( false ), "false is not an integer." );
		assert.notOk( Number.isInteger( [ 1 ] ), "Array of a number, for example [1], is not an integer." );

	} );

	//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign
	//http://people.mozilla.org/~jorendorff/es6-draft.html#sec-math.sign
	/*
	 20.2.2.29 Math.sign(x)

	 Returns the sign of the x, indicating whether x is positive, negative or zero.

	 If x is NaN, the result is NaN.
	 If x is -0, the result is -0.
	 If x is +0, the result is +0.
	 If x is negative and not -0, the result is -1.
	 If x is positive and not +0, the result is +1.
	 */
	QUnit.test( "Math.sign", ( assert ) => {

		assert.ok( isNaN( Math.sign( NaN ) ), "If x is NaN<NaN>, the result is NaN." );
		assert.ok( isNaN( Math.sign( new Vector3() ) ), "If x is NaN<object>, the result is NaN." );
		assert.ok( isNaN( Math.sign() ), "If x is NaN<undefined>, the result is NaN." );
		assert.ok( isNaN( Math.sign( '--3' ) ), "If x is NaN<'--3'>, the result is NaN." );
		assert.ok( isNegativeZero( Math.sign( - 0 ) ), "If x is -0, the result is -0." );
		assert.ok( Math.sign( + 0 ) === + 0, "If x is +0, the result is +0." );
		assert.ok( Math.sign( - Infinity ) === - 1, "If x is negative<-Infinity> and not -0, the result is -1." );
		assert.ok( Math.sign( '-3' ) === - 1, "If x is negative<'-3'> and not -0, the result is -1." );
		assert.ok( Math.sign( '-1e-10' ) === - 1, "If x is negative<'-1e-10'> and not -0, the result is -1." );
		assert.ok( Math.sign( + Infinity ) === + 1, "If x is positive<+Infinity> and not +0, the result is +1." );
		assert.ok( Math.sign( '+3' ) === + 1, "If x is positive<'+3'> and not +0, the result is +1." );

		// Comparing with -0 is tricky because 0 === -0. But
		// luckily 1 / -0 === -Infinity so we can use that.

		function isNegativeZero( value ) {

			return value === 0 && 1 / value < 0;

		}

	} );

	QUnit.test( "'name' in Function.prototype", ( assert ) => {

		function test() {}
		assert.equal( Function.prototype.name, '', "Name on the prototype of Function should be declared." );
		assert.equal( test.name, 'test', "Name of function 'test' should be 'test'." );

	} );

	// https://github.com/tc39/test262/tree/master/test/built-ins/Object/assign
	QUnit.test( "Object.assign", ( assert ) => {

		var target = { a: 1 };
		var result = Object.assign( target, { a: 2 }, { a: "c" } );
		assert.equal( result.a, "c", "The value should be 'c'." );

		target = "a";
		result = Object.assign( target );
		assert.equal( typeof result, "object" );
		assert.equal( result.valueOf(), "a", "The value should be 'a'." );

		target = 12;
		result = Object.assign( target, "aaa", "bb2b", "1c" );
		assert.equal( Object.keys( result ).length, 4, "The length should be 4 in the final object." );
		assert.equal( result[ 0 ], "1", "The value should be {\"0\":\"1\"}." );
		assert.equal( result[ 1 ], "c", "The value should be {\"1\":\"c\"}." );
		assert.equal( result[ 2 ], "2", "The value should be {\"2\":\"2\"}." );
		assert.equal( result[ 3 ], "b", "The value should be {\"3\":\"b\"}." );

		target = { a: 1 };
		result = Object.assign( target, "1a2c3", { a: "c" }, undefined, { b: 6 }, null, 125, { a: 5 } );
		assert.equal( Object.keys( result ).length, 7, "The length should be 7 in the final object." );
		assert.equal( result.a, 5, "The value should be {a:5}." );
		assert.equal( result[ 0 ], "1", "The value should be {\"0\":\"1\"}." );
		assert.equal( result[ 1 ], "a", "The value should be {\"1\":\"a\"}." );
		assert.equal( result[ 2 ], "2", "The value should be {\"2\":\"2\"}." );
		assert.equal( result[ 3 ], "c", "The value should be {\"3\":\"c\"}." );
		assert.equal( result[ 4 ], "3", "The value should be {\"4\":\"3\"}." );
		assert.equal( result.b, 6, "The value should be {b:6}." );

		target = new Object();
		result = Object.assign( target, undefined, null );
		assert.equal( result, target, "null and undefined should be ignored, result should be original object." );



		target = new Object();
		result = Object.assign( target, 123, true, Symbol( 'foo' ) );
		assert.equal( result, target, "Numbers, booleans, and symbols cannot have wrappers with own enumerable properties." );



		target = new Object();
		result = Object.assign( target, 123, true, Symbol( 'foo' ) );
		assert.equal( result, target, "Numbers, booleans, and symbols cannot have wrappers with own enumerable properties." );

		var target = new Object();
		var result = Object.assign( target, "123" );

		assert.equal( result[ 0 ], "1", "The value should be {\"0\":\"1\"}." );
		assert.equal( result[ 1 ], "2", "The value should be {\"1\":\"2\"}." );
		assert.equal( result[ 2 ], "3", "The value should be {\"2\":\"3\"}." );

		var result = Object.assign( true, { a: 1 } );
		assert.equal( typeof result, "object", "Return value should be an object." );
		assert.equal( result.valueOf(), true, "Return value should be true." );

		assert.throws( function () {

			Object.assign( null, { a: 1 } );

		}, TypeError );


		var result = Object.assign( 1, { a: 1 } );
		assert.equal( typeof result, "object", "Return value should be an object." );
		assert.equal( result.valueOf(), 1, "Return value should be 1." );


		var target = { foo: 1 };
		var result = Object.assign( target, { a: 2 } );
		assert.equal( result.foo, 1, "The value should be {foo: 1}." );
		assert.equal( result.a, 2, "The value should be {a: 2}." );


		var target = { foo: 1 };
		var result = Object.assign( target, { a: 2 } );
		assert.equal( result.foo, 1, "The value should be {foo: 1}." );
		assert.equal( result.a, 2, "The value should be {a: 2}." );



		assert.throws( function () {

			Object.assign( undefined, { a: 1 } );

		}, TypeError );

		assert.equal( Object.assign.length, 2, "The length property of the assign method should be 2." );

		assert.throws( function () {

			new Object.assign( {} );

		}, TypeError );

		assert.equal( Object.assign.name, 'assign', 'The value of `Object.assign.name` is `"assign"`' );


		var target = {};
		var source = Object.defineProperty( {}, 'attr', {
			value: 1,
			enumerable: false
		} );
		var result = Object.assign( target, source );
		assert.equal( Object.hasOwnProperty.call( target, 'attr' ), false );
		assert.equal( result, target );

		var callCount = 0;
		var target = {};
		var result;
		var source = new Proxy( {}, {
			ownKeys: function () {

				callCount += 1;
				return [ 'missing' ];

			}
		} );

		result = Object.assign( target, source );
		assert.equal( callCount, 1, 'Proxy trap was invoked exactly once' );
		assert.equal( Object.hasOwnProperty.call( target, 'missing' ), false, 'An own property was not created for a property without a property descriptor' );
		assert.equal( result, target );


	} );

} );
