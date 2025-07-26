// Licensed under a BSD license. See license.html for license
/* eslint-disable strict */
'use strict';  // eslint-disable-line

( function () {

	if ( window.frameElement ) {

		// in iframe
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

	} else {

		if ( window.location.protocol !== 'file:' ) {

			const re = /^(.*?\/manual\/)(.*?)$/;
			const [ , baseURL, articlePath ] = re.exec( window.location.href );
			const href = `${baseURL}#${articlePath.replace( '.html', '' )}`;
			window.location.replace( href ); // lgtm[js/client-side-unvalidated-url-redirection]

		}

	}

	const parts = window.location.href.split( '/' );
	const filename = parts[ parts.length - 1 ];

	if ( filename !== 'primitives.html' ) {

		let text = document.body.innerHTML;

		text = text.replace( /\[link:([\w\:\/\.\-\_\(\)\?\#\=\!\~]+)\]/gi, '<a href="$1" target="_blank">$1</a>' ); // [link:url]
		text = text.replace( /\[link:([\w:/.\-_()?#=!~]+) ([\w\p{L}:/.\-_'\s]+)\]/giu, '<a href="$1" target="_blank">$2</a>' ); // [link:url title]
		text = text.replace( /\[example:([\w\_]+)\]/gi, '[example:$1 $1]' ); // [example:name] to [example:name title]
		text = text.replace( /\[example:([\w\_]+) ([\w\:\/\.\-\_ \s]+)\]/gi, '<a href="../../examples/#$1" target="_blank">$2</a>' ); // [example:name title]
		text = text.replace( /\`(.*?)\`/gs, '<code class="notranslate" translate="no">$1</code>' ); // `code`

		document.body.innerHTML = text;

	}

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

}() );

// ios needs this to allow touch events in an iframe
window.addEventListener( 'touchstart', {} );
