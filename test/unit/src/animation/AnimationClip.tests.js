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

	} );

} );
