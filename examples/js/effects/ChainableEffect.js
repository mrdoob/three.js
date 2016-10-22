/**
 * @author takahirox / http://github.com/takahirox/
 *
 * ChainableEffect provides an abilily to apply two or more Effects
 * by enabling Effects which inherit ChainableEffect
 * to be used from other Effects.
 *
 * How to use: example - applies both VREffect and OutlineEffect
 *             (OutlineEffect inherits ChainableEffect)
 *
 *	function init() {
 *
 *		renderer = new THREE.WebGLRenderer();
 *		effect = new THREE.VREffect( new THREE.OutlineEffect( renderer ) );
 *
 *	}
 *
 *	function render() {
 *
 *		effect.render( scene, camera );
 *
 *	}
 */

THREE.ChainableEffect = function ( renderer ) {

	var keys = Object.keys( renderer );

	for ( var i = 0, il = keys.length; i < il; i ++ ) {

		var key = keys[ i ];

		this[ key ] = ( typeof( renderer[ key ] ) === 'function' ) ? renderer[ key ].bind( renderer ) : renderer[ key ];

	}

};
