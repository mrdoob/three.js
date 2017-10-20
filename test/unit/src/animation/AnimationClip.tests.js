/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { AnimationClip } from '../../../../src/animation/AnimationClip';

export default QUnit.module( 'Animation', () => {

	QUnit.module.todo( 'AnimationClip', () => {

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {} );

		// STATIC STUFF
		QUnit.test( "parse", ( assert ) => {} );

		QUnit.test( "toJSON", ( assert ) => {} );

		QUnit.test( "CreateFromMorphTargetSequence", ( assert ) => {} );

		QUnit.test( "findByName", ( assert ) => {} );

		QUnit.test( "CreateClipsFromMorphTargetSequences", ( assert ) => {} );

		QUnit.test( "parseAnimation", ( assert ) => {} );

		// PUBLIC STUFF
		QUnit.test( "resetDuration", ( assert ) => {} );

		QUnit.test( "trim", ( assert ) => {} );

		QUnit.test( "optimize", ( assert ) => {} );

	} );

} );
