// Initialize Highlight.js for syntax highlighting
if ( typeof hljs !== 'undefined' ) {

	hljs.highlightAll();

}

// Scroll to hash on page load
( function () {

	const hash = window.location.hash.substring( 1 );

	if ( hash ) {

		const element = document.getElementById( hash );

		if ( element ) element.scrollIntoView();

	}

} )();

// Update URL hash when clicking on method/property links
( function () {

	const h1 = document.querySelector( 'h1' );
	const className = h1 ? h1.textContent.trim() : null;

	if ( ! className ) return;

	document.addEventListener( 'click', function ( event ) {

		const target = event.target.closest( 'a' );

		if ( ! target || ! target.hash ) return;

		// Check if it's a same-page link (either starting with # or pointing to current page)
		const href = target.getAttribute( 'href' );
		const isSamePageLink = href.startsWith( '#' ) || ( target.hostname === window.location.hostname && target.pathname === window.location.pathname );

		if ( ! isSamePageLink ) return;

		const hash = target.hash.substring( 1 );
		const newHash = ( hash !== className ) ? `#${className}.${hash}` : `#${hash}`;
		const targetWindow = ( window.parent !== window ) ? window.parent : window;

		targetWindow.history.pushState( null, '', newHash );

	} );

} )();

// Add code copy buttons
( function addCopyButtons() {

	const elements = document.getElementsByTagName( 'pre' );

	for ( let i = 0; i < elements.length; i ++ ) {

		const element = elements[ i ];

		if ( element.classList.contains( 'linenums' ) === false ) {

			const copyButton = document.createElement( 'button' );
			copyButton.className = 'copy-btn';

			element.appendChild( copyButton );

			copyButton.addEventListener( 'click', function () {

				const codeContent = element.textContent;
				navigator.clipboard.writeText( codeContent ).then( () => {

					copyButton.classList.add( 'copied' );

					setTimeout( () => {

						copyButton.classList.remove( 'copied' );

					}, 1000 );

				} );

			} );

		}

	}

} )();
