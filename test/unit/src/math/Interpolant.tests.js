/* global QUnit */

import { Interpolant } from '../../../../src/math/Interpolant.js';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Interpolant', () => {

		// Since this is an abstract base class, we have to make it concrete in order
		// to QUnit.test its functionality...

		class Mock extends Interpolant {

			constructor( parameterPositions, sampleValues, sampleSize, resultBuffer ) {

				super( parameterPositions, sampleValues, sampleSize, resultBuffer );

			}

		}

		Mock.prototype.intervalChanged_ = function intervalChanged( i1, t0, t1 ) {

			if ( Mock.calls !== null ) {

				Mock.calls.push( {
					func: 'intervalChanged',
					args: [ i1, t0, t1 ]
				} );

			}

		};

		Mock.prototype.interpolate_ = function interpolate( i1, t0, t, t1 ) {

			if ( Mock.calls !== null ) {

				Mock.calls.push( {
					func: 'interpolate',
					args: [ i1, t0, t, t1 ]
				} );

			}

			return this.copySampleValue_( i1 - 1 );

		};

		// Call capturing facility

		Mock.calls = null;

		// Tests

		// INSTANCING
		QUnit.todo( 'Instancing', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC STUFF
		QUnit.todo( 'evaluate', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PRIVATE STUFF
		QUnit.test( 'copySampleValue_', ( assert ) => {

			var interpolant = new Mock( null, [ 1, 11, 2, 22, 3, 33 ], 2, [] );

			assert.deepEqual( interpolant.copySampleValue_( 0 ), [ 1, 11 ], 'sample fetch (0)' );
			assert.deepEqual( interpolant.copySampleValue_( 1 ), [ 2, 22 ], 'sample fetch (1)' );
			assert.deepEqual( interpolant.copySampleValue_( 2 ), [ 3, 33 ], 'first sample (2)' );

		} );

		QUnit.test( 'evaluate -> intervalChanged_ / interpolate_', ( assert ) => {

			var actual, expect;

			var interpolant = new Mock( [ 11, 22, 33, 44, 55, 66, 77, 88, 99 ], null, 0, null );

			Mock.calls = [];
			interpolant.evaluate( 11 );

			actual = Mock.calls[ 0 ];
			expect = {
				func: 'intervalChanged',
				args: [ 1, 11, 22 ]
			};
			assert.deepEqual( actual, expect, JSON.stringify( expect ) );

			actual = Mock.calls[ 1 ];
			expect = {
				func: 'interpolate',
				args: [ 1, 11, 11, 22 ]
			};
			assert.deepEqual( actual, expect, JSON.stringify( expect ) );

			assert.ok( Mock.calls.length === 2, 'no further calls' );

			Mock.calls = [];
			interpolant.evaluate( 12 ); // same interval

			actual = Mock.calls[ 0 ];
			expect = {
				func: 'interpolate',
				args: [ 1, 11, 12, 22 ]
			};
			assert.deepEqual( actual, expect, JSON.stringify( expect ) );

			assert.ok( Mock.calls.length === 1, 'no further calls' );

			Mock.calls = [];
			interpolant.evaluate( 22 ); // step forward

			actual = Mock.calls[ 0 ];
			expect = {
				func: 'intervalChanged',
				args: [ 2, 22, 33 ]
			};
			assert.deepEqual( actual, expect, JSON.stringify( expect ) );

			actual = Mock.calls[ 1 ];
			expect = {
				func: 'interpolate',
				args: [ 2, 22, 22, 33 ]
			};
			assert.deepEqual( actual, expect, JSON.stringify( expect ) );

			assert.ok( Mock.calls.length === 2 );

			Mock.calls = [];
			interpolant.evaluate( 21 ); // step back

			actual = Mock.calls[ 0 ];
			expect = {
				func: 'intervalChanged',
				args: [ 1, 11, 22 ]
			};
			assert.deepEqual( actual, expect, JSON.stringify( expect ) );

			actual = Mock.calls[ 1 ];
			expect = {
				func: 'interpolate',
				args: [ 1, 11, 21, 22 ]
			};
			assert.deepEqual( actual, expect, JSON.stringify( expect ) );

			assert.ok( Mock.calls.length === 2, 'no further calls' );

			Mock.calls = [];
			interpolant.evaluate( 20 ); // same interval

			actual = Mock.calls[ 0 ];
			expect = {
				func: 'interpolate',
				args: [ 1, 11, 20, 22 ]
			};
			assert.deepEqual( actual, expect, JSON.stringify( expect ) );

			assert.ok( Mock.calls.length === 1, 'no further calls' );

			Mock.calls = [];
			interpolant.evaluate( 43 ); // two steps forward

			actual = Mock.calls[ 0 ];
			expect = {
				func: 'intervalChanged',
				args: [ 3, 33, 44 ]
			};
			assert.deepEqual( actual, expect, JSON.stringify( expect ) );

			actual = Mock.calls[ 1 ];
			expect = {
				func: 'interpolate',
				args: [ 3, 33, 43, 44 ]
			};
			assert.deepEqual( actual, expect, JSON.stringify( expect ) );

			assert.ok( Mock.calls.length === 2, 'no further calls' );

			Mock.calls = [];
			interpolant.evaluate( 12 ); // two steps back

			actual = Mock.calls[ 0 ];
			expect = {
				func: 'intervalChanged',
				args: [ 1, 11, 22 ]
			};
			assert.deepEqual( actual, expect, JSON.stringify( expect ) );

			actual = Mock.calls[ 1 ];
			expect = {
				func: 'interpolate',
				args: [ 1, 11, 12, 22 ]
			};
			assert.deepEqual( actual, expect, JSON.stringify( expect ) );

			assert.ok( Mock.calls.length === 2, 'no further calls' );

			Mock.calls = [];
			interpolant.evaluate( 77 ); // random access

			actual = Mock.calls[ 0 ];
			expect = {
				func: 'intervalChanged',
				args: [ 7, 77, 88 ]
			};
			assert.deepEqual( actual, expect, JSON.stringify( expect ) );

			actual = Mock.calls[ 1 ];
			expect = {
				func: 'interpolate',
				args: [ 7, 77, 77, 88 ]
			};
			assert.deepEqual( actual, expect, JSON.stringify( expect ) );

			assert.ok( Mock.calls.length === 2, 'no further calls' );

			Mock.calls = [];
			interpolant.evaluate( 80 ); // same interval

			actual = Mock.calls[ 0 ];
			expect = {
				func: 'interpolate',
				args: [ 7, 77, 80, 88 ]
			};
			assert.deepEqual( actual, expect, JSON.stringify( expect ) );

			assert.ok( Mock.calls.length === 1, 'no further calls' );

			Mock.calls = [];
			interpolant.evaluate( 36 ); // random access

			actual = Mock.calls[ 0 ];
			expect = {
				func: 'intervalChanged',
				args: [ 3, 33, 44 ]
			};
			assert.deepEqual( actual, expect, JSON.stringify( expect ) );

			actual = Mock.calls[ 1 ];
			expect = {
				func: 'interpolate',
				args: [ 3, 33, 36, 44 ]
			};
			assert.deepEqual( actual, expect, JSON.stringify( expect ) );

			assert.ok( Mock.calls.length === 2, 'no further calls' );

			Mock.calls = [];
			interpolant.evaluate( 24 ); // fast reset / loop (2nd)

			actual = Mock.calls[ 0 ];
			expect = {
				func: 'intervalChanged',
				args: [ 2, 22, 33 ]
			};
			assert.deepEqual( actual, expect, JSON.stringify( expect ) );

			actual = Mock.calls[ 1 ];
			expect = {
				func: 'interpolate',
				args: [ 2, 22, 24, 33 ]
			};
			assert.deepEqual( actual, expect, JSON.stringify( expect ) );

			assert.ok( Mock.calls.length === 2, 'no further calls' );

			Mock.calls = [];
			interpolant.evaluate( 16 ); // fast reset / loop (2nd)

			actual = Mock.calls[ 0 ];
			expect = {
				func: 'intervalChanged',
				args: [ 1, 11, 22 ]
			};
			assert.deepEqual( actual, expect, JSON.stringify( expect ) );

			actual = Mock.calls[ 1 ];
			expect = {
				func: 'interpolate',
				args: [ 1, 11, 16, 22 ]
			};
			assert.deepEqual( actual, expect, JSON.stringify( expect ) );

			assert.ok( Mock.calls.length === 2, 'no further calls' );

		} );

	} );

} );
