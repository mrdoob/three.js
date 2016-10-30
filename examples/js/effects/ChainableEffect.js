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

	this.autoClear = renderer.autoClear;
	this.domElement = renderer.domElement;
	this.shadowMap = renderer.shadowMap;

	this.getPixelRatio = function () {

		return renderer.getPixelRatio();

	};

	this.setPixelRatio = function ( value ) {

		renderer.setPixelRatio( value );

	};

	this.getSize = function () {

		return renderer.getSize();

	};

	this.setSize = function ( width, height, updateStyle ) {

		renderer.setSize( width, height, updateStyle );

	};

	this.setViewport = function ( x, y, width, height ) {

		renderer.setViewport( x, y, width, height );

	};

	this.setScissor = function ( x, y, width, height ) {

		renderer.setScissor( x, y, width, height );

	};

	this.setScissorTest = function ( boolean ) {

		renderer.setScissorTest( boolean );

	};

	this.clear = function ( color, depth, stencil ) {

		renderer.clear( color, depth, stencil );

	};

	this.render = function ( scene, camera, renderTarget, forceClear ) {

		renderer.render( scene, camera, renderTarget, forceClear );

	};

	this.setRenderTarget = function ( renderTarget ) {

		renderer.setRenderTarget( renderTarget );

	};

};
