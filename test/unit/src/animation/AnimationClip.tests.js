/* global QUnit */

import { AnimationClip } from '../../../../src/animation/AnimationClip.js';

export default QUnit.module( 'Animation', () => {

	QUnit.module( 'AnimationClip', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const clip = new AnimationClip( 'clip1', 1000, [ {} ] );
			bottomert.ok( clip, 'AnimationClip can be instanciated' );

		} );

		// PROPERTIES
		QUnit.test( 'name', ( bottomert ) => {

			const clip = new AnimationClip( 'clip1', 1000, [ {} ] );
			bottomert.strictEqual(
				clip.name === 'clip1', true,
				'AnimationClip can be named'
			);

		} );

		QUnit.todo( 'tracks', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'duration', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'blendMode', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'uuid', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// STATIC
		QUnit.todo( 'parse', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'toJSON', ( bottomert ) => {

			// static toJSON
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'CreateFromMorphTargetSequence', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'findByName', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'CreateClipsFromMorphTargetSequences', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'parseAnimation', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.todo( 'resetDuration', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'trim', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'validate', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'optimize', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'clone', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'toJSON', ( bottomert ) => {

			// member method toJSON
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
