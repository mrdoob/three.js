/* global QUnit */

import { AnimationClip } from '../../../../src/animation/AnimationClip.js';

export default QUnit.module( 'Animation', () => {

	QUnit.module( 'AnimationClip', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const clip = new AnimationClip( 'clip1', 1000, [ {} ] );
			assert.ok( clip, 'AnimationClip can be instantiated' );

		} );

		// PROPERTIES
		QUnit.test( 'name', ( assert ) => {

			const clip = new AnimationClip( 'clip1', 1000, [ {} ] );
			assert.strictEqual(
				clip.name === 'clip1', true,
				'AnimationClip can be named'
			);

		} );

		QUnit.todo( 'tracks', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'duration', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'blendMode', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'uuid', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// STATIC
		QUnit.todo( 'parse', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'toJSON', ( assert ) => {

			// static toJSON
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'CreateFromMorphTargetSequence', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'findByName', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'CreateClipsFromMorphTargetSequences', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'parseAnimation', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.todo( 'resetDuration', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'trim', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'validate', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'optimize', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'clone', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'toJSON', ( assert ) => {

			// member method toJSON
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
