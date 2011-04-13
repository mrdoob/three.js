/**
 * @author alteredq / http://alteredqualia.com/
 * @author mr.doob / http://mrdoob.com/
 */

Detector = {

	canvas : !! window.CanvasRenderingContext2D,
	webgl : !! window.WebGLRenderingContext,
	webglGfxCard : ( function () { try { return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ); } catch( e ) { return false; } } )(),
	workers : !! window.Worker,
	fileapi : window.File && window.FileReader && window.FileList && window.Blob,

	getWebGLErrorMessage : function () {

		var html;

		if ( ! this.webgl ) {

			html = [
				'Sorry, your browser doesn\'t support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation">WebGL</a><br/>',
				'Please try with',
				'<a href="http://www.google.com/chrome">Chrome 10</a>, ',
				'<a href="http://www.mozilla.com/en-US/firefox/all-beta.html">Firefox 4</a> or',
				'<a href="http://nightly.webkit.org/">Safari 6</a>'
			].join( '\n' );

		} else if ( ! this.webglGfxCard ) {

			html = [
				'Sorry, your browser supports <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation">WebGL</a><br/> but you may need to upgrade your graphics card.'
			].join( '\n' );

		}

		var msg = document.createElement( 'div' );
		msg.style.fontFamily = 'monospace';
		msg.style.fontSize = '13px';
		msg.style.textAlign = 'center';
		msg.style.background = '#eee';
		msg.style.color = '#000';
		msg.style.padding = '1em';
		msg.style.width = '475px';
		msg.style.margin = '5em auto 0';
		msg.innerHTML = html;

		return msg;

	},

	addGetWebGLMessage : function ( parameters ) {

		var parent, id, domElement;

		parameters = parameters || {};

		parent = parameters.parent !== undefined ? parameters.parent : document.body;
		id = parameters.id !== undefined ? parameters.id : 'oldie';

		domElement = Detector.getWebGLErrorMessage();
		domElement.id = id;

		parent.appendChild( domElement );

	}

};
