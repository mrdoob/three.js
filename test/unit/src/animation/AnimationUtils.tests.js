/**
 * @author Don McCurdy / https://www.donmccurdy.com
 */
/* global QUnit */

import { AnimationClip } from '../../../../src/animation/AnimationClip';
import { AnimationUtils } from '../../../../src/animation/AnimationUtils';
import { BufferAttribute } from '../../../../src/core/BufferAttribute';
import { BufferGeometry } from '../../../../src/core/BufferGeometry';
import { Mesh } from '../../../../src/objects/Mesh';
import { Object3D } from '../../../../src/core/Object3D';
import { NumberKeyframeTrack } from '../../../../src/animation/tracks/NumberKeyframeTrack';
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

		QUnit.test( 'mergeMorphTargetTracks', ( assert ) => {

			var trackA = new NumberKeyframeTrack(
				'foo.morphTargetInfluences[a]',
				[ 5, 10, 15, 20, 25, 30 ],
				[ 0, 0.2, 0.4, 0.6, 0.8, 1.0 ],
				InterpolateLinear
			);

			var trackB = new NumberKeyframeTrack(
				'foo.morphTargetInfluences[b]',
				[ 10, 50 ],
				[ 0.25, 0.75 ],
				InterpolateLinear
			);

			var geometry = new BufferGeometry();
			var position = new BufferAttribute( new Float32Array( [ 0, 0, 0, 0, 0, 1, 1, 0, 1 ] ), 3 );
			geometry.addAttribute( 'position',  position );
			geometry.morphAttributes.position = [ position, position ];

			var mesh = new Mesh( geometry );
			mesh.name = 'foo';
			mesh.morphTargetDictionary.a = 0;
			mesh.morphTargetDictionary.b = 1;

			var root = new Object3D();
			root.add( mesh );

			var clip = new AnimationClip( 'waltz', undefined, [ trackA, trackB ] );
			clip = AnimationUtils.mergeMorphTargetTracks( clip, root );

			assert.equal( clip.tracks.length, 1, 'tracks are merged' );

			var track = clip.tracks[ 0 ];

			assert.smartEqual( Array.from( track.times ), [ 5, 10, 15, 20, 25, 30, 50 ], 'all keyframes are present' );

			var expectedValues = [ 0, 0.25, 0.2, 0.25, 0.4, 0.3125, 0.6, 0.375, 0.8, 0.4375, 1.0, 0.5, 1.0, 0.75 ];

			for ( var i = 0; i < track.values.length; i ++ ) {

				assert.numEqual( track.values[ i ], expectedValues[ i ], 'all values are merged or interpolated - ' + i );

			}

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

