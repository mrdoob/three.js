/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { AnimationAction } from '../../../../src/animation/AnimationAction';

export default QUnit.module( 'Animation', () => {

	QUnit.module.todo( 'AnimationAction', () => {

		QUnit.test( 'write me !', ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

	} );

} );


//QUnit.module( "AnimationAction" );
//
//QUnit.test( "Instancing", function( assert ) {
//
//    var mixer = new AnimationMixer();
//    var clip = new AnimationClip();
//
//    assert.throws(
//        function() {
//            new AnimationAction()
//        },
//        new Error("Mixer can't be null or undefined !"),
//        "raised error instance about undefined or null mixer"
//    );
//
//    assert.throws(
//        function() {
//            new AnimationAction(mixer)
//        },
//        new Error("Clip can't be null or undefined !"),
//        "raised error instance about undefined or null clip"
//    );
//
//    var animationAction = new AnimationAction(mixer, clip);
//    assert.ok( animationAction, "animationAction instanciated" );
//
//} );
