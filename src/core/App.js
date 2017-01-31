/**
 * @author Lewy Blue / https://github.com/looeee
 *
 * parameters = {
 *
 *  canvas: <canvas> DOM element,
 *
 *  scene: new THREE.Scene(),
 *
 *  camera: new THREE.Camera( ... )
 *
 *  renderer: new THREE.WebGLRenderer( ... )
 *
 *
 * }
 */

function App( parameters ) {

	parameters = parameters || {};

	if ( parameters.canvas !== undefined ) {

	  this.canvas = parameters.canvas;

	} else {

		this.canvas = document.body.appendChild( document.createElement( 'canvas' ) );
		this.canvas.style.width = this.canvas.style.height = '100%';

	}

	this.scene = ( parameters.scene !== undefined ) ? parameters.scene : new THREE.Scene();

	this.camera = ( parameters.camera !== undefined ) ? parameters.camera : new THREE.PerspectiveCamera( 75, this.canvas.clientWidth / this.canvas.clientHeight, 1, 1000 );

	if ( parameters.renderer !== undefined ) {

	  this.renderer = parameters.renderer;

	} else {

	  this.renderer = new THREE.WebGLRenderer( { canvas: this.canvas } );
	  this.renderer.setSize( this.canvas.clientWidth, this.canvas.clientHeight );

	}

}

Object.assign( App.prototype, {

	animate: function () {

	  var self = this;

		function animationHandler() {

	    self.onUpdate();

	    self.renderer.render( self.scene, self.camera );

			self.currentAnimationFrameID = requestAnimationFrame( function () { animationHandler() } );

	  }

	  animationHandler();

	},

	stopAnimation: function () {

	  cancelAnimationFrame( this.currentAnimationFrameID );

	},

	onUpdate: function () {},

} );


export { App };
