/**
 * @author alteredq / http://alteredqualia.com/
 * @author mr.doob / http://mrdoob.com/
 */




var Detector = (function() {

	var isWebGLAvailable = ( function () {

		try {

			var canvas = document.createElement( 'canvas' ); return !! ( window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) );

		} catch ( e ) {

			return false;

		}

	} )();

	var isWebGL2Available = ( function () {

		try {

			var canvas = document.createElement( 'canvas' ); return !! ( window.WebGL2RenderingContext && ( canvas.getContext( 'webgl2' ) ) );

		} catch ( e ) {

			return false;

		}

	} )();

	function getWebGLErrorMessage( version ) {

		var webgl2 = version === 'webgl2';

		var element = document.createElement( 'div' );
		element.id = 'webgl-error-message';
		element.style.fontFamily = 'monospace';
		element.style.fontSize = '13px';
		element.style.fontWeight = 'normal';
		element.style.textAlign = 'center';
		element.style.background = '#fff';
		element.style.color = '#000';
		element.style.padding = '1.5em';
		element.style.width = '400px';
		element.style.margin = '5em auto 0';
		element.style.position = 'fixed';
		element.style.left = 0;
		element.style.right = 0;
		element.style.top = 0;

		if ( webgl2 && !this.webgl2 || !webgl2 && !this.webgl ) {

			element.innerHTML = [
				'Your ' + ( ( webgl2 ? window.WebGL2RenderingContext : window.WebGLRenderingContext ) ? 'graphics card' : 'browser' ) + ' does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL' + ( webgl2 ? '2' : '' )+ '</a>.<br />',
				'Find out how to get it <a href="https://get.webgl.org/' + ( webgl2 ? 'webgl2' : '' ) + '" style="color:#000">here</a>.'
			].join( '\n' );

		}

		return element;

	}

	function addGetWebGLMessageByVersion( parameters, version ) {

		var parent, id, element;

		parameters = parameters || {};

		parent = parameters.parent !== undefined ? parameters.parent : document.body;
		id = parameters.id !== undefined ? parameters.id : 'oldie';

		element = getWebGLErrorMessage( version );
		element.id = id;

		parent.appendChild( element );

	}

	return {
		canvas: !! window.CanvasRenderingContext2D,
		webgl: isWebGLAvailable,
		webgl2: isWebGL2Available,
		workers: !! window.Worker,
		fileapi: window.File && window.FileReader && window.FileList && window.Blob,

		addGetWebGL2Message: function ( parameters ) {

			addGetWebGLMessageByVersion( parameters, 'webgl2' );

		},

		addGetWebGLMessage: function ( parameters ) {

			addGetWebGLMessageByVersion( parameters, 'webgl' );

		},

		getWebGLErrorMessage: getWebGLErrorMessage

	};

} )();

// browserify support
if ( typeof module === 'object' ) {

	module.exports = Detector;

}
