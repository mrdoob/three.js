import { PerspectiveCamera } from './cameras/PerspectiveCamera';
import { Scene } from './scenes/Scene';
import { WebGLRenderer } from './renderers/WebGLRenderer';

function App( parameters ) {

	var canvas;
	parameters = Object.assign( {}, parameters || {} );

	if ( parameters.canvas !== undefined ) {

	  canvas = parameters.canvas;

	} else {

		canvas = document.body.appendChild( document.createElement( 'canvas' ) );
		canvas.style.width = this.canvas.style.height = '100%';

	}

	parameters.canvas = canvas;

	this.scene = ( parameters.scene !== undefined ) ? parameters.scene : new Scene();
	this.camera = ( parameters.camera !== undefined ) ? parameters.camera : new PerspectiveCamera();

	this.renderer = new WebGLRenderer( parameters );
	this.resizeCanvasAndUpdateCamera();

}

Object.assign( App.prototype, {

	resizeCanvasAndUpdateCamera: function() {

		if ( this.renderer.resizeCanvasToMatchDisplaySize() ) {

			var canvas = this.renderer.domElement;
			this.camera.updateBasedOnRenderSize( canvas.clientWidth, canvas.clientHeight );

		}

	},

	onRender: function( fn ) {

		var self = this;
		var then = 0;

		function render( time ) {

			time *= 0.001;  // Just use seconds everwhere?
			var delta = time - then;
			then = time;

			self.resizeCanvasAndUpdateCamera();

			if ( fn( time, delta ) !== false ) {

				requestAnimationFrame( render );

			}

		};

		requestAnimationFrame( render );

	},


} );

export { App }

