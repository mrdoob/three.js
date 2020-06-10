if ( ! window.frameElement && window.location.protocol !== 'file:' ) {

	// If the page is not yet displayed as an iframe of the index page (navigation panel/working links),
	// redirect to the index page (using the current URL without extension as the new fragment).
	// If this URL itself has a fragment, append it with a dot (since '#' in an URL fragment is not allowed).

	var href = window.location.href;
	var splitIndex = href.lastIndexOf( '/docs/' ) + 6;
	var docsBaseURL = href.substr( 0, splitIndex );

	var hash = window.location.hash;

	if ( hash !== '' ) {

		href = href.replace( hash, '' );
		hash = hash.replace( '#', '.' );

	}

	var pathSnippet = href.slice( splitIndex, - 5 );

	window.location.replace( docsBaseURL + '#' + pathSnippet + hash );

}

var theme;

function htmlToElement( html ) {
	let template = document.createElement( 'template' );
	html = html.trim( );
	template.innerHTML = html;
	return template.content.firstChild;
}

function add_theme_styles( ) {
	var head = document.head || document.getElementsByTagName('head')[0];
	var style = document.createElement( 'style' );
	var csscontent = `[data-theme="dark"] {
							--background-color: #222;
							--secondary-background-color: #2e2e2e;

							--text-color: #bbb;
							--secondary-text-color: #666;

							--border-style: 1px solid #444;
						}`;

	head.appendChild(style);

	if ( style.styleSheet ){
		// This is required for IE8 and below.
		style.styleSheet.cssText = csscontent;
	} else {
		style.appendChild( document.createTextNode( csscontent ) );
	}
}

function theme_apply( ) {
	'use strict';
	if ( theme === 'light' ) {
		document.documentElement.setAttribute( 'data-theme', 'light' );
		localStorage.setItem( 'theme', 'light' );
	} else {
		document.documentElement.setAttribute( 'data-theme', 'dark' );
		localStorage.setItem( 'theme', 'dark' );
	}
}

function theme_switch( ) {
	'use strict';
	if ( theme === 'light' ) {
		theme = 'dark';
	} else {
		theme = 'light';
	}
	
	theme_apply( );
}

function theme_handler( ){
	var theme_OS = window.matchMedia( '(prefers-color-scheme: light)' );

	theme_OS.addEventListener( 'change', function ( e ) {
		'use strict';
		if ( e.matches ) {
			theme = 'light';
		} else {
			theme = 'dark';
		}
		theme_apply( );
	});
	
	window.addEventListener("message", function(event) {
		if (event.origin != 'http://threejs.org') {
			return;
		}
	  
		theme_switch( );
	});

	add_theme_styles( );

	theme_apply( );

}


function onDocumentLoad( event ) {

	var path, localizedPath;
	var pathname = window.location.pathname;
	var section = /\/(manual|api|examples)\//.exec( pathname )[ 1 ].toString().split( '.html' )[ 0 ];
	var name = /[\-A-z0-9]+\.html/.exec( pathname ).toString().split( '.html' )[ 0 ];

	switch ( section ) {

		case 'api':
			localizedPath = /\/api\/[A-z0-9\/]+/.exec( pathname ).toString().substr( 5 );

			// Remove localized part of the path (e.g. 'en/' or 'es-MX/'):
			path = localizedPath.replace( /^[A-z0-9-]+\//, '' );

			break;

		case 'examples':
			path = localizedPath = /\/examples\/[A-z0-9\/]+/.exec( pathname ).toString().substr( 10 );
			break;

		case 'manual':
			name = name.replace( /\-/g, ' ' );

			path = pathname.replace( /\ /g, '-' );
			path = localizedPath = /\/manual\/[-A-z0-9\/]+/.exec( path ).toString().substr( 8 );
			break;

	}

	var text = document.body.innerHTML;

	text = text.replace( /\[name\]/gi, name );
	text = text.replace( /\[path\]/gi, path );
	text = text.replace( /\[page:([\w\.]+)\]/gi, "[page:$1 $1]" ); // [page:name] to [page:name title]
	text = text.replace( /\[page:\.([\w\.]+) ([\w\.\s]+)\]/gi, "[page:" + name + ".$1 $2]" ); // [page:.member title] to [page:name.member title]
	text = text.replace( /\[page:([\w\.]+) ([\w\.\s]+)\]/gi, "<a onclick=\"window.parent.setUrlFragment('$1')\" title=\"$1\">$2</a>" ); // [page:name title]
	// text = text.replace( /\[member:.([\w]+) ([\w\.\s]+)\]/gi, "<a onclick=\"window.parent.setUrlFragment('" + name + ".$1')\" title=\"$1\">$2</a>" );

	text = text.replace( /\[(member|property|method|param):([\w]+)\]/gi, "[$1:$2 $2]" ); // [member:name] to [member:name title]
	text = text.replace( /\[(?:member|property|method):([\w]+) ([\w\.\s]+)\]\s*(\(.*\))?/gi, "<a onclick=\"window.parent.setUrlFragment('" + name + ".$2')\" target=\"_parent\" title=\"" + name + ".$2\" class=\"permalink\">#</a> .<a onclick=\"window.parent.setUrlFragment('" + name + ".$2')\" id=\"$2\">$2</a> $3 : <a class=\"param\" onclick=\"window.parent.setUrlFragment('$1')\">$1</a>" );
	text = text.replace( /\[param:([\w\.]+) ([\w\.\s]+)\]/gi, "$2 : <a class=\"param\" onclick=\"window.parent.setUrlFragment('$1')\">$1</a>" ); // [param:name title]

	text = text.replace( /\[link:([\w|\:|\/|\.|\-|\_]+)\]/gi, "[link:$1 $1]" ); // [link:url] to [link:url title]
	text = text.replace( /\[link:([\w|\:|\/|\.|\-|\_|\(|\)|\?|\#|\=]+) ([\w|\:|\/|\.|\-|\_|\s]+)\]/gi, "<a href=\"$1\"  target=\"_blank\">$2</a>" ); // [link:url title]
	text = text.replace( /\*([\w|\d|\"|\-|\(][\w|\d|\ |\-|\/|\+|\-|\(|\)|\=|\,|\.\"]*[\w|\d|\"|\)]|\w)\*/gi, "<strong>$1</strong>" ); // *

	text = text.replace( /\[example:([\w\_]+)\]/gi, "[example:$1 $1]" ); // [example:name] to [example:name title]
	text = text.replace( /\[example:([\w\_]+) ([\w\:\/\.\-\_ \s]+)\]/gi, "<a href=\"../examples/#$1\"  target=\"_blank\">$2</a>" ); // [example:name title]

	text = text.replace( /<a class="param" onclick="window.parent.setUrlFragment\('\w+'\)">(null|this|Boolean|Object|Array|Number|String|Integer|Float|TypedArray|ArrayBuffer)<\/a>/gi, '<span class="param">$1</span>' ); // remove links to primitive types

	document.body.innerHTML = text;

	// handle code snippets formatting

	var elements = document.getElementsByTagName( 'code' );

	for ( var i = 0; i < elements.length; i ++ ) {

		var element = elements[ i ];

		text = element.textContent.trim();
		text = text.replace( /^\t\t/gm, '' );

		element.textContent = text;

	}

	// Edit button

	var button = document.createElement( 'div' );
	button.id = 'button';
	button.innerHTML = '<img src="../files/ic_mode_edit_black_24dp.svg">';
	button.addEventListener( 'click', function ( event ) {

		window.open( 'https://github.com/mrdoob/three.js/blob/dev/docs/' + section + '/' + localizedPath + '.html' );

	}, false );

	document.body.appendChild( button );

	// Syntax highlighting

	var styleBase = document.createElement( 'link' );
	styleBase.href = pathname.substring( 0, pathname.indexOf( 'docs' ) + 4 ) + '/prettify/prettify.css';
	styleBase.rel = 'stylesheet';

	var styleCustom = document.createElement( 'link' );
	styleCustom.href = pathname.substring( 0, pathname.indexOf( 'docs' ) + 4 ) + '/prettify/threejs.css';
	styleCustom.rel = 'stylesheet';

	document.head.appendChild( styleBase );
	document.head.appendChild( styleCustom );

	var prettify = document.createElement( 'script' );
	prettify.src = pathname.substring( 0, pathname.indexOf( 'docs' ) + 4 ) + '/prettify/prettify.js';

	prettify.onload = function () {

		var elements = document.getElementsByTagName( 'code' );

		for ( var i = 0; i < elements.length; i ++ ) {

			var e = elements[ i ];
			e.className += ' prettyprint';
			e.setAttribute( 'translate', 'no' );

		}

		prettyPrint();

	};

	document.head.appendChild( prettify );

	theme_handler( );
};

document.addEventListener( 'DOMContentLoaded', onDocumentLoad, false );
