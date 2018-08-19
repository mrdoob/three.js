/**
 * @author Don McCurdy / https://www.donmccurdy.com
 */
/* global QUnit */

import { AnimationUtils } from '../../../../src/animation/AnimationUtils';
import { VectorKeyframeTrack } from '../../../../src/animation/tracks/VectorKeyframeTrack';
import {
	InterpolateLinear,
	InterpolateSmooth,
	InterpolateDiscrete
} from '../../../../src/constants.js';

export default QUnit.module( 'Animation', () => {

	QUnit.module( 'AnimationUtils', () => {

		// PUBLIC STUFF
		QUnit.test( 'insertKeyframe', ( assert ) => {

			var track;
			var index;

			function createTrack () {
				return new VectorKeyframeTrack(
					'foo.bar',
					[ 5,    10,   15,   20,   25,   30 ],
					[ 0, 5, 1, 4, 2, 3, 3, 2, 4, 1, 5, 0 ],
					InterpolateLinear
				);
			}

			track = createTrack();
			index = AnimationUtils.insertKeyframe( track, 0 );
			assert.equal( index, 0, 'prepend - index' );
			assert.smartEqual( Array.from( track.times ), [ 0, 5, 10, 15, 20, 25, 30 ], 'prepend - time' );
			assert.smartEqual( Array.from( track.values ), [ 0, 5, 0, 5, 1, 4, 2, 3, 3, 2, 4, 1, 5, 0 ], 'prepend - value' );

			track = createTrack();
			index = AnimationUtils.insertKeyframe( track, 7.5 );
			assert.equal( index, 1, 'insert - index (linear)' );
			assert.smartEqual( Array.from( track.times ), [ 5, 7.5, 10, 15, 20, 25, 30 ], 'insert - time (linear)' );
			assert.smartEqual( Array.from( track.values ), [ 0, 5, 0.5, 4.5, 1, 4, 2, 3, 3, 2, 4, 1, 5, 0 ], 'insert - value (linear)' );

			track = createTrack();
			track.setInterpolation( InterpolateDiscrete );
			index = AnimationUtils.insertKeyframe( track, 16 );
			assert.equal( index, 3, 'insert - index (linear)' );
			assert.smartEqual( Array.from( track.times ), [ 5, 10, 15, 16, 20, 25, 30 ], 'insert - time (discrete)' );
			assert.smartEqual( Array.from( track.values ), [ 0, 5, 1, 4, 2, 3, 2, 3, 3, 2, 4, 1, 5, 0 ], 'insert - value (discrete)' );

			track = createTrack();
			index = AnimationUtils.insertKeyframe( track, 100 );
			assert.equal( index, 6, 'append - index' );
			assert.smartEqual( Array.from( track.times ), [ 5, 10, 15, 20, 25, 30, 100 ], 'append time' );
			assert.smartEqual( Array.from( track.values ), [ 0, 5, 1, 4, 2, 3, 3, 2, 4, 1, 5, 0, 5, 0 ], 'append value' );

			track = createTrack();
			index = AnimationUtils.insertKeyframe( track, 15 );
			assert.equal( index, 2, 'existing - index' );
			assert.smartEqual( Array.from( track.times ), [ 5, 10, 15, 20, 25, 30 ], 'existing - time' );
			assert.smartEqual( Array.from( track.values ), [ 0, 5, 1, 4, 2, 3, 3, 2, 4, 1, 5, 0 ], 'existing - value' );

			track = createTrack();
			index = AnimationUtils.insertKeyframe( track, 20.000005 );
			assert.equal( index, 3, 'tolerance - index' );
			assert.smartEqual( Array.from( track.times ), [ 5, 10, 15, 20, 25, 30 ], 'tolerance - time' );
			assert.smartEqual( Array.from( track.values ), [ 0, 5, 1, 4, 2, 3, 3, 2, 4, 1, 5, 0 ], 'tolerance - value' );

		} );

		QUnit.todo( "arraySlice", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "convertArray", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "isTypedArray", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "getKeyframeOrder", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "sortedArray", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "flattenJSON", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

	} );

} );

