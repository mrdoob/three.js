// Initialize prettify for syntax highlighting
if ( typeof prettyPrint === 'function' ) {

	prettyPrint();

}

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
