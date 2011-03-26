/**
 * @author alteredq / http://alteredqualia.com/
 */

Detector = {

	// supported features

	canvas	: !!window.CanvasRenderingContext2D,
	webgl	: !!window.WebGLRenderingContext,
	workers : !!window.Worker,
	fileapi : window.File && window.FileReader && window.FileList && window.Blob,

	// helper methods

	addGetWebGLMessage: function( parameters ) {

		var parent = document.body,
			id = "oldie" ;

		if ( parameters ) {

			if ( parameters.parent !== undefined ) parent  = parameters.parent;
			if ( parameters.id !== undefined ) id  = parameters.id;

		}

		var html = [

			'Sorry, your browser doesn\'t support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation">WebGL</a><br/>',
			'<br/>',
			'Please try with',
			'<a href="http://www.google.com/chrome">Chrome 9+</a> /',
			'<a href="http://www.mozilla.com/en-US/firefox/all-beta.html">Firefox 4+</a> /',
			'<a href="http://nightly.webkit.org/">Safari 10.6+</a>'

		].join("\n");

		var wrap = document.createElement( "center" ),
			message = document.createElement( "div" );

		message.innerHTML = html;
		message.id = id;

		var style = message.style;

		style.fontFamily = "monospace";
		style.fontSize = "13px";
		style.textAlign = "center";
		style.background = "#eee";
		style.color = "#000";
		style.padding = "1em";
		style.width = "475px";
		style.margin = "5em auto 0";

		wrap.appendChild( message )
		parent.appendChild( wrap );

		return message;

	}

};
