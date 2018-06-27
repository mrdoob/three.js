/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { AnimationClip } from '../../../../src/animation/AnimationClip';
import { NumberKeyframeTrack } from '../../../../src/animation/tracks/NumberKeyframeTrack';

export default QUnit.module( 'Animation', () => {

	QUnit.module( 'AnimationClip', () => {

		// INSTANCING
		QUnit.todo( "Instancing", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// STATIC STUFF
		QUnit.todo( "parse", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "toJSON", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "CreateFromMorphTargetSequence", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "findByName", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "CreateClipsFromMorphTargetSequences", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "parseAnimation", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// PUBLIC STUFF
		QUnit.todo( "resetDuration", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "trim", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( 'optimize', ( assert ) => {

			var track = new NumberKeyframeTrack( '.material.opacity', [ 0, 1, 2, 3, 4 ], [ 0, 0, 0, 0, 1 ] );
			var clip = new AnimationClip( 'fadeIn', 4, [ track ] );

			assert.equal( clip.tracks[0].values.length, 5 );

			clip.isOptimized = true;
			clip.optimize();

			assert.equal( clip.tracks[0].values.length, 5 );

			clip.isOptimized = false;
			clip.optimize();

			assert.equal( clip.tracks[0].values.length, 3 );

		} );

		QUnit.test( 'validate', ( assert ) => {

			var track = new NumberKeyframeTrack( '.material.opacity', [ 0, 1 ], [ 0, NaN ] );
			var clip = new AnimationClip( 'fadeIn', 1, [ track ] );

			track.validate = () => { throw new Error('Validation should not be called.') };
			clip.isValidated = true;
			clip.validate();

			delete track.validate;
			clip.isValidated = false;
			clip.validate();
			assert.ok( clip.isValidated );

		} );

	} );

} );
