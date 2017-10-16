/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global module, test */

module.todo( 'AnimationAction', () => {

	test( 'write me !', assert => {

		assert.ok( false, "everything's gonna be alright" );

	} );

} );

//QUnit.module( "AnimationAction" );
//
//QUnit.test( "Instancing", function( assert ) {
//
//    var mixer = new THREE.AnimationMixer();
//    var clip = new THREE.AnimationClip();
//
//    assert.throws(
//        function() {
//            new THREE.AnimationAction()
//        },
//        new Error("Mixer can't be null or undefined !"),
//        "raised error instance about undefined or null mixer"
//    );
//
//    assert.throws(
//        function() {
//            new THREE.AnimationAction(mixer)
//        },
//        new Error("Clip can't be null or undefined !"),
//        "raised error instance about undefined or null clip"
//    );
//
//    var animationAction = new THREE.AnimationAction(mixer, clip);
//    assert.ok( animationAction, "animationAction instanciated" );
//
//} );
