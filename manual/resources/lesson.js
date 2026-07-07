// Licensed under a BSD license. See license.html for license
'use strict';

( function () {

	if ( ! window.frameElement && window.location.protocol !== 'file:' ) {

		// not in iframe: redirect to the framed manual

		const re = /^(.*?\/manual\/)(.*?)$/;
		const [ , baseURL, articlePath ] = re.exec( window.location.href );
		const href = `${baseURL}#${articlePath.replace( '.html', '' )}`;
		window.location.replace( href ); // lgtm[js/client-side-unvalidated-url-redirection]

	}

	const parts = window.location.href.split( '/' );
	const filename = parts[ parts.length - 1 ].split( '#' )[ 0 ];

	function getHeadingId( heading ) {

		const namedAnchor = heading.querySelector( 'a[name]' );

		if ( namedAnchor ) {

			return namedAnchor.getAttribute( 'name' );

		}

		const id = heading.textContent
			.trim()
			.toLowerCase()
			.normalize( 'NFKD' )
			.replace( /[\u0300-\u036f]/g, '' )
			.replace( /[^\p{L}\p{N}]+/gu, '-' )
			.replace( /^-+|-+$/g, '' );

		return id || 'section';

	}

	function addHeadingIds() {

		const usedIds = new Set();

		document.querySelectorAll( '[id]' ).forEach( element => {

			if ( element.id ) {

				usedIds.add( element.id );

			}

		} );

		document.querySelectorAll( 'h1, h2, h3, h4, h5, h6' ).forEach( heading => {

			if ( heading.id ) return;

			const baseId = getHeadingId( heading );
			let id = baseId;
			let suffix = 2;

			while ( usedIds.has( id ) ) {

				id = `${baseId}-${suffix ++}`;

			}

			heading.id = id;
			usedIds.add( id );

		} );

	}

	function scrollToHash() {

		if ( window.location.hash.length <= 1 ) return;

		let id;

		try {

			id = decodeURIComponent( window.location.hash.substring( 1 ) );

		} catch ( e ) {

			id = window.location.hash.substring( 1 );

		}

		const element = document.getElementById( id ) || document.getElementsByName( id )[ 0 ];

		if ( element ) {

			element.scrollIntoView();

		}

	}

	if ( filename !== 'primitives.html' && filename !== 'prerequisites.html' ) {

		let text = document.body.innerHTML;

		text = text.replace( /\[link:([\w\:\/\.\-\_\(\)\?\#\=\!\~]+)\]/gi, '<a href="$1" target="_blank">$1</a>' ); // [link:url]
		text = text.replace( /\[link:([\w:/.\-_()?#=!~]+) ([\w\p{L}:/.\-_'\s]+)\]/giu, '<a href="$1" target="_blank">$2</a>' ); // [link:url title]
		text = text.replace( /\[example:([\w\_]+)\]/gi, '[example:$1 $1]' ); // [example:name] to [example:name title]
		text = text.replace( /\[example:([\w\_]+) ([\w\:\/\.\-\_ \s]+)\]/gi, '<a href="../../examples/#$1" target="_blank">$2</a>' ); // [example:name title]
		text = text.replace( /\`(.*?)\`/gs, '<code class="notranslate" translate="no">$1</code>' ); // `code`

		document.body.innerHTML = text;

	}

	addHeadingIds();

	if ( window.frameElement ) {

		// in iframe
		// Bind link handlers after the innerHTML above has been (re)written,
		// otherwise the reassignment discards the freshly attached listeners
		// and clicks fall back to native iframe navigation, leaving the parent
		// page's URL hash and sidebar out of sync.
		document.querySelectorAll( 'a' ).forEach( a => {

			// we have to send all links to the parent
			// otherwise we'll end up with 3rd party
			// sites under the frame.
			a.addEventListener( 'click', e => {

				// opening a new tab?
				if ( a.target === '_blank' ) {

					return;

				}

				// change changing hashes?
				if ( a.origin !== window.location.origin || a.pathname !== window.location.pathname ) {

					e.preventDefault();

				}

				window.parent.setUrl( a.href );

			} );

		} );
		window.parent.setTitle( document.title );

	}

	scrollToHash();

	if ( window.prettyPrint ) {

		window.prettyPrint();

	}

	// help translation services translate comments.
	document.querySelectorAll( 'span[class=com]' ).forEach( elem => {

		elem.classList.add( 'translate', 'yestranslate' );
		elem.setAttribute( 'translate', 'yes' );

	} );

	if ( window.threejsLessonUtils ) {

		window.threejsLessonUtils.afterPrettify();

	}

	scrollToHash();

}() );

// ios needs this to allow touch events in an iframe
window.addEventListener( 'touchstart', {} );
