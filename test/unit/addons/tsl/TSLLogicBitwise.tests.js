import {
	float, int, uint, vec3,
	equal, notEqual, lessThan, greaterThan, lessThanEqual, greaterThanEqual,
	and, or, not, xor, ternary,
	bitAnd, bitOr, bitXor, bitNot, shiftLeft, shiftRight,
	increment, decrement, incrementBefore, decrementBefore
} from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

// Comparison/logical/bitwise-operator coverage. Every expected value below is
// derived independently in plain JS (bitwise/comparison arithmetic anyone can
// hand-check), never by re-running the same TSL expression under test -- see
// TSLMath.tests.js's file header for why that matters.
//
// bool-typed results (comparisons, and/or/not/xor) are cast through
// `float(...)` before being handed to the harness's assert.eq -- the harness
// compares raw buffer floats, and GLSL/WGSL's own bool -> float cast (false
// -> 0.0, true -> 1.0) is the natural, spec-defined way to make a bool value
// comparable there, rather than adding first-class bool support to the
// harness for this one case.
export default QUnit.module( 'TSL', () => {

	QUnit.module( 'logic and comparison operators', () => {

		gpuTest( 'relational operators at and around the boundary', ( { assert } ) => {

			assert.eq( float( equal( float( 3 ), float( 3 ) ) ), float( 1 ), 'equal(3,3) is true' );
			assert.eq( float( equal( float( 3 ), float( 3.0001 ) ) ), float( 0 ), 'equal(3,3.0001) is false -- no fuzzy tolerance' );
			assert.eq( float( notEqual( float( 3 ), float( 4 ) ) ), float( 1 ), 'notEqual(3,4) is true' );
			assert.eq( float( notEqual( float( 3 ), float( 3 ) ) ), float( 0 ), 'notEqual(3,3) is false' );

			assert.eq( float( lessThan( float( 2 ), float( 3 ) ) ), float( 1 ), '2 < 3' );
			assert.eq( float( lessThan( float( 3 ), float( 3 ) ) ), float( 0 ), '3 < 3 is false (strict)' );
			assert.eq( float( greaterThan( float( 3 ), float( 2 ) ) ), float( 1 ), '3 > 2' );
			assert.eq( float( greaterThan( float( 3 ), float( 3 ) ) ), float( 0 ), '3 > 3 is false (strict)' );

			assert.eq( float( lessThanEqual( float( 3 ), float( 3 ) ) ), float( 1 ), '3 <= 3 -- boundary counts as true' );
			assert.eq( float( lessThanEqual( float( 4 ), float( 3 ) ) ), float( 0 ), '4 <= 3 is false' );
			assert.eq( float( greaterThanEqual( float( 3 ), float( 3 ) ) ), float( 1 ), '3 >= 3 -- boundary counts as true' );
			assert.eq( float( greaterThanEqual( float( 2 ), float( 3 ) ) ), float( 0 ), '2 >= 3 is false' );

		} );

		gpuTest( 'logical and/or/not/xor truth table', ( { assert } ) => {

			const T = equal( float( 1 ), float( 1 ) ); // a real bool-typed true, not a JS boolean
			const F = equal( float( 1 ), float( 0 ) ); // a real bool-typed false

			// and(): true only when both operands are true.
			assert.eq( float( and( T, T ) ), float( 1 ), 'and(T,T)' );
			assert.eq( float( and( T, F ) ), float( 0 ), 'and(T,F)' );
			assert.eq( float( and( F, F ) ), float( 0 ), 'and(F,F)' );

			// or(): true when at least one operand is true.
			assert.eq( float( or( T, F ) ), float( 1 ), 'or(T,F)' );
			assert.eq( float( or( F, F ) ), float( 0 ), 'or(F,F)' );

			// not(): simple negation.
			assert.eq( float( not( T ) ), float( 0 ), 'not(T)' );
			assert.eq( float( not( F ) ), float( 1 ), 'not(F)' );

			// xor(): true exactly when the two operands disagree.
			assert.eq( float( xor( T, T ) ), float( 0 ), 'xor(T,T)' );
			assert.eq( float( xor( T, F ) ), float( 1 ), 'xor(T,F)' );
			assert.eq( float( xor( F, F ) ), float( 0 ), 'xor(F,F)' );

		} );

		gpuTest( 'ternary() picks its if/else branch by condition, independent of the branch values', ( { assert } ) => {

			assert.eq( ternary( equal( float( 1 ), float( 1 ) ), float( 10 ), float( 20 ) ), float( 10 ), 'ternary(true, 10, 20) picks the "if" branch' );
			assert.eq( ternary( equal( float( 1 ), float( 0 ) ), float( 10 ), float( 20 ) ), float( 20 ), 'ternary(false, 10, 20) picks the "else" branch' );

			const cond = vec3( 0, 1, 1 ).greaterThan( vec3( 0, 0, 0 ) );
			assert.eq( ternary( cond, vec3( 1, 2, 3 ), vec3( 100, 200, 300 ) ), vec3( 100, 200, 300 ), 'a vector condition retains automatic conversion to a scalar bool' );

			const allTrue = vec3( 1, 2, 3 ).greaterThan( vec3( 0 ) );
			assert.eq( ternary( allTrue, vec3( 1, 2, 3 ), vec3( 100, 200, 300 ) ), vec3( 1, 2, 3 ), 'an all-true vector condition picks the "if" branch wholesale' );

			const allFalse = vec3( - 1, - 2, - 3 ).greaterThan( vec3( 0 ) );
			assert.eq( ternary( allFalse, vec3( 1, 2, 3 ), vec3( 100, 200, 300 ) ), vec3( 100, 200, 300 ), 'an all-false vector condition picks the "else" branch wholesale' );

		} );

	} );

	QUnit.module( 'bitwise operators', () => {

		gpuTest( 'bitAnd/bitOr/bitXor/bitNot on known bit patterns', ( { assert } ) => {

			// 0b0110 (6) and 0b0011 (3), hand-derived rather than re-deriving
			// the answer from the operator under test.
			assert.eq( bitAnd( int( 6 ), int( 3 ) ), int( 2 ), '0b0110 & 0b0011 == 0b0010 == 2' );
			assert.eq( bitOr( int( 6 ), int( 3 ) ), int( 7 ), '0b0110 | 0b0011 == 0b0111 == 7' );
			assert.eq( bitXor( int( 6 ), int( 3 ) ), int( 5 ), '0b0110 ^ 0b0011 == 0b0101 == 5' );

			// bitNot is two's-complement: ~x == -x - 1.
			assert.eq( bitNot( int( 0 ) ), int( -1 ), '~0 == -1' );
			assert.eq( bitNot( int( 5 ) ), int( -6 ), '~5 == -5-1 == -6' );

		} );

		gpuTest( 'shiftLeft/shiftRight match multiplying/dividing by a power of two', ( { assert } ) => {

			assert.eq( shiftLeft( uint( 1 ), uint( 4 ) ), uint( 16 ), '1 << 4 == 16' );
			assert.eq( shiftLeft( uint( 3 ), uint( 2 ) ), uint( 12 ), '3 << 2 == 12 (== 3 * 2^2)' );
			assert.eq( shiftRight( uint( 16 ), uint( 4 ) ), uint( 1 ), '16 >> 4 == 1' );
			assert.eq( shiftRight( uint( 255 ), uint( 3 ) ), uint( 31 ), '255 >> 3 == 31 (== floor(255 / 2^3))' );

		} );

		gpuTest( 'increment()/decrement() return the pre-mutation value, incrementBefore/decrementBefore return the post-mutation value', ( { assert } ) => {

			// increment(a)/decrement(a) are the postfix a++/a-- forms: they
			// return a's value *before* mutating it. Checked against two
			// independent observations of the same variable -- the returned
			// snapshot, and the variable's value read back afterward -- so a
			// broken implementation that returns the post-mutation value (or
			// fails to mutate at all) is caught either way.
			const a = int( 5 ).toVar();
			const postfixResult = increment( a );
			assert.eq( postfixResult, int( 5 ), 'increment(a) returns the value from before the increment' );
			assert.eq( a, int( 6 ), '...but a itself has been incremented as a side effect' );

			const b = int( 5 ).toVar();
			const postfixDecResult = decrement( b );
			assert.eq( postfixDecResult, int( 5 ), 'decrement(b) returns the value from before the decrement' );
			assert.eq( b, int( 4 ), '...but b itself has been decremented as a side effect' );

			// incrementBefore(a)/decrementBefore(a) are the prefix ++a/--a
			// forms: they return the value *after* mutating it.
			const c = int( 5 ).toVar();
			assert.eq( incrementBefore( c ), int( 6 ), 'incrementBefore(c) returns the value after the increment' );

			const d = int( 5 ).toVar();
			assert.eq( decrementBefore( d ), int( 4 ), 'decrementBefore(d) returns the value after the decrement' );

		} );

	} );

} );
