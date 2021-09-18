/*
globals
document, location, prettyPrint, window
*/
'use strict';

let documentReady;
let prettyDone;
let prettyLoaded;

if ( ! window.frameElement && location.protocol !== 'file:' ) {

	// If the page is not yet displayed as an iframe of the index page (navigation panel/working links),
	// redirect to the index page (using the current URL without extension as the new fragment).
	// If this URL itself has a fragment, append it with a dot (since '#' in an URL fragment is not allowed).

	let href = location.href;
	const splitIndex = href.lastIndexOf( '/docs/' ) + 6;
	const docsBaseURL = href.substr( 0, splitIndex );

	let hash = location.hash;

	if ( hash !== '' ) {

		href = href.replace( hash, '' );
		hash = hash.replace( '#', '.' );

	}

	const extension = href.split( '.' ).pop();
	const end = ( extension === 'html' ) ? - 5 : href.length;
	const pathSnippet = href.slice( splitIndex, end );

	location.replace( docsBaseURL + '#' + pathSnippet + hash );

}

function loadPrettify() {

	// Load syntax highlighter directly
	// This saves a few ms

	const pathname = location.pathname;
	const prettifyBase = pathname.substring( 0, pathname.indexOf( 'docs' ) + 4 ) + '/prettify';

	const styleBase = document.createElement( 'link' );
	styleBase.href = prettifyBase + '/prettify.css';
	styleBase.rel = 'stylesheet';

	const styleCustom = document.createElement( 'link' );
	styleCustom.href = prettifyBase + '/threejs.css';
	styleCustom.rel = 'stylesheet';

	const prettify = document.createElement( 'script' );
	prettify.src = prettifyBase + '/prettify.js';

	prettify.onload = () => {

		// try to prettify the document (might have to wait for the document to be ready)

		prettyLoaded = true;
		prettifyDocument();

	};

	document.head.appendChild( styleBase );
	document.head.appendChild( styleCustom );
	document.head.appendChild( prettify );

}

function prettifyDocument() {

	if ( prettyDone || ! documentReady || ! prettyLoaded ) {

		return;

	}

	for ( const element of document.getElementsByTagName( 'code' ) ) {

		element.classList.add( 'prettyprint' );
		element.setAttribute( 'translate', 'no' );

	}

	prettyPrint();
	prettyDone = true;

}

function onDocumentLoad() {

	loadPrettify();

	let path, localizedPath;
	const pathname = location.pathname;
	const section = /\/(manual|api|examples)\//.exec( pathname )[ 1 ].split( '.html' )[ 0 ];
	let pageName = pathname.split( '/' ).pop().split( '.' )[ 0 ];

	switch ( section ) {

		case 'api':
			localizedPath = /\/api\/([\w\/]+)/.exec( '/api/en/extras/Legacy.html' )[ 1 ];

			// Remove localized part of the path (e.g. 'en/' or 'es-MX/'):
			path = localizedPath.replace( /^[\w-]+\//, '' );
			break;

		case 'examples':
			path = localizedPath = /\/examples\/([\w\/]+)/.exec( pathname )[ 1 ];
			break;

		case 'manual':
			pageName = pageName.replace( /\-/g, ' ' );
			path = pathname.replace( /\ /g, '-' );
			path = localizedPath = /\/manual\/([-\w\/]+)/.exec( path )[ 1 ];
			break;

	}

	// Replace entities with RegExp
	//
	// benchmark of 1 iteration (averaged of 50k) on Vector3.html
	// - old code: 21682.9 / 50k = 0.4337 sec
	// - new code: 14844.2 / 50k = 0.2969 sec
	// => 1.46x faster + saves 0.137 sec on loading time ... why not? :)

	const PRIMITIVES = new Set( [
		'Any',
		'Array',
		'ArrayBuffer',
		'Boolean',
		'Float',
		'Integer',
		'null',
		'Number',
		'Object',
		'String',
		'this',
		'TypedArray',
	] );

	const onclick = 'onclick="window.parent.setUrlFragment';
	let html = document.body.innerHTML;

	// 1) replace single entities
	// - quicker to do one complex replace than multiple simple replaces

	const replaces = {
		name: pageName,
		path: path,
	};

	html = html.replace( /\[(name|path)\]/gi, ( _match, _1 ) => replaces[ _1 ] );

	// 2) [page:value text?]
	// - value: Class or .member or Class.member

	html = html.replace( /\[page:([\w\.]+)\s?([\w\.\s]+)?\]/gi, ( _match, value, text ) => {

		const classType = ( value[ 0 ] == '.' ) ? pageName + value : value;
		return '<a ' + onclick + '(\'' + classType + '\')" title="' + classType + '">' + ( text || value ) + '</a>';

	} );

	// 3) [member|property|method:type name?]
	// - type: type or Class
	// - name: name or .member or Class.member (new feature needed for Legacy)

	html = html.replace( /\[(?:member|property|method):([\w]+)\s?([A-Z]\w+\.)?([\w\.\s]+)?\]\s*(\(.*\))?/gi,

		( _match, rtype, class_, method, param ) => {

			method = method || rtype;
			const full = ( class_ || '' ) + method;
			const link = '<a ' + onclick + '(\'' + pageName + '.' + full + '\')"';

			let text = link + ' target="_parent" title="' + pageName + '.' + full + '" class="permalink">#</a>'
				+ '.' + link + ' id="' + full + '">' + method + '</a> ' + ( param || '' ) + ' : ';

			if ( PRIMITIVES.has( rtype ) ) {

				text += '<span class="param">' + rtype + '</span>';

			} else {

				text += '<a class="param" ' + onclick + '(\''+ rtype + '\')">' + rtype + '</a>';

			}

			return text;
		}

	);

	// 4) [param:type text?]
	html = html.replace( /\[param:([\w\.]+)\s?([\w\.\s]+)?\]/gi, ( _match, type, text ) => {

		if ( PRIMITIVES.has( type ) ) {

			return ( text || type ) + ' : ' + '<span class="param">' + type + '</span>';

		}

		return ( text || type ) + ' : ' + '<a class="param" ' + onclick + '(\'' + type + '\')">' + type + '</a>';

	} );

	// 5) [link:url text?]
	html = html.replace( /\[link:([\w|\:|\/|\.|\-|\_|\(|\)|\?|\#|\=|\!|\~]+)\s?([\w|\:|\/|\.|\-|\_|\'|\s]+)?\]/gi,

		( _match, url, text ) => {

			return '<a href="' + url + '" target="_blank">' + ( text || url ) + '</a>';

		}
	);

	// 6) *
	html = html.replace(
		/\*([\w|\d|\"|\-|\(][\w|\d|\ |\-|\/|\+|\-|\(|\)|\=|\,|\.\"]*[\w|\d|\"|\)]|\w)\*/gi, '<strong>$1</strong>' );

	// 7) [example:link text?]
	html = html.replace( /\[example:([\w\_]+)\s?([\w\:\/\.\-\_ \s]+)?\]/gi, ( _match, link, text ) => {

		return '<a href="../examples/#' + link + '" target="_blank">' + ( text || link ) + '</a>';

	} );

	document.body.innerHTML = html;

	// handle code snippets formatting

	for ( const element of document.getElementsByTagName( 'code' ) ) {

		element.textContent = element.textContent.trim().replace( /^\t\t/gm, '' );

	}

	// Edit button

	const button = document.createElement( 'div' );
	button.id = 'button';
	button.innerHTML = '<img src="../files/ic_mode_edit_black_24dp.svg">';
	button.addEventListener( 'click', function () {

		window.open( 'https://github.com/mrdoob/three.js/blob/dev/docs/' + section + '/' + localizedPath + '.html' );

	}, false );

	document.body.appendChild( button );

	// try to prettify the document (might have to wait for prettify.js to be loaded)

	documentReady = true;
	prettifyDocument();

	// inform the parent that we're done

	if ( window.parent.iFrameIsReady ) {

		window.parent.iFrameIsReady( location.href );

	}

}

document.addEventListener( 'DOMContentLoaded', onDocumentLoad, false );
