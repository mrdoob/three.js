if ( ! window.frameElement && window.location.protocol !== 'file:' ) {

	// If the page is not yet displayed as an iframe of the index page (navigation panel/working links),
	// redirect to the index page (using the current URL without extension as the new fragment).
	// If this URL itself has a fragment, append it with a dot (since '#' in a URL fragment is not allowed).

	let href = window.location.href;
	const splitIndex = href.lastIndexOf( '/docs/' ) + 6;
	const docsBaseURL = href.slice( 0, splitIndex );

	let hash = window.location.hash;

	if ( hash !== '' ) {

		href = href.replace( hash, '' );
		hash = hash.replace( '#', '.' );

	}

	const extension = href.split( '.' ).pop();
	const end = ( extension === 'html' ) ? - 5 : href.length;
	const pathSnippet = href.slice( splitIndex, end );

	window.location.replace( docsBaseURL + '#' + pathSnippet + hash );

}


function onDocumentLoad() {

	let path, localizedPath;
	const pathname = window.location.pathname;
	const section = /\/(manual|api|examples)\//.exec( pathname )[ 1 ].toString().split( '.html' )[ 0 ];
	let name = /[\-A-Za-z0-9]+\.html/.exec( pathname ).toString().split( '.html' )[ 0 ];

	switch ( section ) {

		case 'api':
			localizedPath = /\/api\/[A-Za-z0-9\/]+/.exec( pathname ).toString().slice( 5 );

			// Remove localized part of the path (e.g. 'en/' or 'es-MX/'):
			path = localizedPath.replace( /^[A-Za-z0-9-]+\//, '' );

			break;

		case 'examples':
			path = localizedPath = /\/examples\/[A-Za-z0-9\/]+/.exec( pathname ).toString().slice( 10 );
			break;

		case 'manual':
			name = name.replace( /\-/g, ' ' );

			path = pathname.replace( /\ /g, '-' );
			path = localizedPath = /\/manual\/[-A-Za-z0-9\/]+/.exec( path ).toString().slice( 8 );
			break;

	}

	let text = document.body.innerHTML;

	text = text.replace( /\[name\]/gi, name );
	text = text.replace( /\[path\]/gi, path );
	text = text.replace( /\[page:([\w\.]+)\]/gi, '[page:$1 $1]' ); // [page:name] to [page:name title]
	text = text.replace( /\[page:\.([\w\.]+) ([\w\.\s]+)\]/gi, `[page:${name}.$1 $2]` ); // [page:.member title] to [page:name.member title]
	text = text.replace( /\[page:([\w\.]+) ([\w\.\s]+)\]/gi, '<a class=\'links\' data-fragment=\'$1\' title=\'$1\'>$2</a>' ); // [page:name title]
	// text = text.replace( /\[member:.([\w]+) ([\w\.\s]+)\]/gi, "<a onclick=\"window.parent.setUrlFragment('" + name + ".$1')\" title=\"$1\">$2</a>" );

	text = text.replace( /\[(member|property|method|param):([\w]+)\]/gi, '[$1:$2 $2]' ); // [member:name] to [member:name title]
	text = text.replace( /\[(?:member|property|method):([\w]+) ([\w\.\s]+)\]\s*(\(.*\))?/gi, `<a class='permalink links' data-fragment='${name}.$2' target='_parent' title='${name}.$2'>#</a> .<a class='links' data-fragment='${name}.$2' id='$2'>$2</a> $3 : <a class='param links' data-fragment='$1'>$1</a>` );
	text = text.replace( /\[param:([\w\.]+) ([\w\.\s]+)\]/gi, '$2 : <a class=\'param links\' data-fragment=\'$1\'>$1</a>' ); // [param:name title]

	text = text.replace( /\[link:([\w\:\/\.\-\_\(\)\?\#\=\!\~]+)\]/gi, '<a href="$1" target="_blank">$1</a>' ); // [link:url]
	text = text.replace( /\[link:([\w:/.\-_()?#=!~]+) ([\w\p{L}:/.\-_'\s]+)\]/giu, '<a href="$1" target="_blank">$2</a>' ); // [link:url title]
	text = text.replace( /\*([\w\d\"\-\(][\w\d\ \/\+\-\(\)\=\,\."]*[\w\d\"\)]|\w)\*/gi, '<strong>$1</strong>' ); // *text*
	text = text.replace( /\`(.*?)\`/gi, '<code class="inline">$1</code>' ); // `code`

	text = text.replace( /\[example:([\w\_]+)\]/gi, '[example:$1 $1]' ); // [example:name] to [example:name title]
	text = text.replace( /\[example:([\w\_]+) ([\w\:\/\.\-\_ \s]+)\]/gi, '<a href="../examples/#$1" target="_blank">$2</a>' ); // [example:name title]

	text = text.replace( /<a class=\'param links\' data-fragment=\'\w+\'>(undefined|null|this|Boolean|Object|Array|Number|String|Integer|Float|TypedArray|ArrayBuffer)<\/a>/gi, '<span class="param">$1</span>' ); // remove links to primitive types

	document.body.innerHTML = text;

	if ( window.parent.getPageURL ) {

		const links = document.querySelectorAll( '.links' );
		for ( let i = 0; i < links.length; i ++ ) {

			const pageURL = window.parent.getPageURL( links[ i ].dataset.fragment );
			if ( pageURL ) {

				links[ i ].href = './index.html#' + pageURL;

			}

		}

	}

	document.body.addEventListener( 'click', event => {

		const element = event.target;
		if ( element.classList.contains( 'links' ) && event.button === 0 && ! event.shiftKey && ! event.ctrlKey && ! event.metaKey && ! event.altKey ) {

			window.parent.setUrlFragment( element.dataset.fragment );
			event.preventDefault();

		}

	} );

	// handle code snippets formatting

	const elements = document.getElementsByTagName( 'code' );

	for ( let i = 0; i < elements.length; i ++ ) {

		const element = elements[ i ];

		text = element.textContent.trim();
		text = text.replace( /^\t\t/gm, '' );

		element.textContent = text;

	}

	// Edit button

	const button = document.createElement( 'div' );
	button.id = 'button';
	button.innerHTML = '<img src="../files/ic_mode_edit_black_24dp.svg">';
	button.addEventListener( 'click', function () {

		window.open( 'https://github.com/mrdoob/three.js/blob/dev/docs/' + section + '/' + localizedPath + '.html' );

	}, false );

	document.body.appendChild( button );

	// Syntax highlighting

	const styleBase = document.createElement( 'link' );
	styleBase.href = pathname.substring( 0, pathname.indexOf( 'docs' ) + 4 ) + '/prettify/prettify.css';
	styleBase.rel = 'stylesheet';

	const styleCustom = document.createElement( 'link' );
	styleCustom.href = pathname.substring( 0, pathname.indexOf( 'docs' ) + 4 ) + '/prettify/threejs.css';
	styleCustom.rel = 'stylesheet';

	document.head.appendChild( styleBase );
	document.head.appendChild( styleCustom );

	const prettify = document.createElement( 'script' );
	prettify.src = pathname.substring( 0, pathname.indexOf( 'docs' ) + 4 ) + '/prettify/prettify.js';

	prettify.onload = function () {

		const elements = document.getElementsByTagName( 'code' );

		for ( let i = 0; i < elements.length; i ++ ) {

			const e = elements[ i ];
			e.className += ' prettyprint';
			e.setAttribute( 'translate', 'no' );

		}

		prettyPrint();

	};

	document.head.appendChild( prettify );

}

document.addEventListener( 'DOMContentLoaded', onDocumentLoad, false );
