( function handleLegacyURLs() {

	const hash = window.location.hash;

	if ( hash.startsWith( '#api/' ) || hash.startsWith( '#examples/' ) ) {

		const mappings = {

			'3DMLoader': 'Rhino3dmLoader',

			'BufferGeometryUtils': 'module-BufferGeometryUtils',
			'CameraUtils': 'module-CameraUtils',
			'SceneUtils': 'module-SceneUtils',
			'SkeletonUtils': 'module-SkeletonUtils',
			'UniformsUtils': 'module-UniformsUtils',

			'DefaultLoadingManager': 'LoadingManager',
			'Interpolations': 'module-Interpolations',

			'Animation': 'global',
			'BufferAttributeUsage': 'global',
			'Core': 'global',
			'CustomBlendingEquations': 'global',
			'Materials': 'global',
			'Textures': 'global'
		};

		const parts = hash.split( '/' );
		let className = parts[ parts.length - 1 ];

		if ( className ) {

			if ( className in mappings ) className = mappings[ className ];

			window.location.href = `${className}.html`;

		}

	}

} )();

( function loadNavigation() {

	const content = document.getElementById( 'content' );
	const navContainer = content.querySelector( 'nav' );

	fetch( 'nav.html' )
		.then( response => response.text() )
		.then( html => {

			navContainer.innerHTML = html;

			const savedScrollTop = sessionStorage.getItem( 'navScrollTop' );

			if ( savedScrollTop !== null ) {

				content.scrollTop = parseInt( savedScrollTop, 10 );

			}

			// Save scroll position and preserve search query when clicking nav links
			navContainer.addEventListener( 'click', function ( event ) {

				const link = event.target.closest( 'a' );

				if ( link ) {

					sessionStorage.setItem( 'navScrollTop', content.scrollTop );

					// Preserve search query in URL
					const searchParams = new URLSearchParams( window.location.search );
					const query = searchParams.get( 'q' );

					if ( query ) {

						const href = link.getAttribute( 'href' );

						// Only modify if it doesn't already have a query parameter
						if ( ! href.includes( '?' ) ) {

							const [ path, hash ] = href.split( '#' );
							const newHref = hash ? `${path}?q=${encodeURIComponent( query )}#${hash}` : `${path}?q=${encodeURIComponent( query )}`;
							link.setAttribute( 'href', newHref );

						}

					}

				}

			} );

			updateNavigation();

			sessionStorage.removeItem( 'navScrollTop' );

			// Execute search if query parameter exists
			const urlParams = new URLSearchParams( window.location.search );
			const searchQuery = urlParams.get( 'q' );

			if ( searchQuery ) {

				const filterInput = document.getElementById( 'filterInput' );
				const panel = document.getElementById( 'panel' );

				if ( filterInput ) {

					filterInput.value = searchQuery;
					// eslint-disable-next-line no-undef
					search( searchQuery );

					if ( panel ) {

						panel.classList.add( 'searchFocused' );

					}

				}

			}

		} )
		.catch( err => console.error( 'Failed to load navigation:', err ) );

} )();

//

const panel = document.getElementById( 'panel' );
const panelScrim = document.getElementById( 'panelScrim' );
const expandButton = document.getElementById( 'expandButton' );
const clearSearchButton = document.getElementById( 'clearSearchButton' );
const filterInput = document.getElementById( 'filterInput' );

// code copy buttons

const elements = document.getElementsByTagName( 'pre' );

for ( let i = 0; i < elements.length; i ++ ) {

	const element = elements[ i ];

	if ( element.classList.contains( 'linenums' ) === false ) {

		addCopyButton( element );

	}

}

function addCopyButton( element ) {

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

// Functionality for hamburger button (on small devices)

expandButton.onclick = function ( event ) {

	event.preventDefault();
	panel.classList.toggle( 'open' );

};

panelScrim.onclick = function ( event ) {

	event.preventDefault();
	panel.classList.toggle( 'open' );

};

// Functionality for search/filter input field

filterInput.onfocus = function () {

	panel.classList.add( 'searchFocused' );

};

filterInput.onblur = function () {

	if ( filterInput.value === '' ) {

		panel.classList.remove( 'searchFocused' );

	}

};

filterInput.oninput = function () {

	const term = filterInput.value.trim();

	// eslint-disable-next-line no-undef
	search( term ); // defined in search.js

};

clearSearchButton.onclick = function () {

	filterInput.value = '';
	// eslint-disable-next-line no-undef
	hideSearch(); // defined in search.js

	// Remove query parameter from URL
	const url = new URL( window.location );
	url.searchParams.delete( 'q' );
	window.history.replaceState( {}, '', url );

	// Hide search UI
	panel.classList.remove( 'searchFocused' );

};

//

window.addEventListener( 'hashchange', updateNavigation );

function updateNavigation() {

	// unselected elements

	const selected = document.querySelectorAll( 'nav a.selected' );
	selected.forEach( link => link.classList.remove( 'selected' ) );

	// determine target

	const filename = window.location.pathname.split( '/' ).pop();
	const pagename = filename.split( '.' )[ 0 ];

	let target = pagename.replace( 'module-', '' );

	if ( pagename === 'global' ) {

		target = window.location.hash.split( '#' ).pop();

	}

	if ( target === '' ) return;

	// select target and move into view

	const aElement = document.querySelector( `nav a[href="${filename}"], nav a[href="${filename}#${target}"]` );

	if ( aElement !== null ) {

		const savedScrollTop = sessionStorage.getItem( 'navScrollTop' );

		if ( savedScrollTop === null ) {

			aElement.scrollIntoView( { block: 'center' } );

		}

		aElement.classList.add( 'selected' );

	}

}

// eslint-disable-next-line no-undef
prettyPrint();

console.log( [
	'    __     __',
	' __/ __\\  / __\\__   ____   _____   _____',
	'/ __/  /\\/ /  /___\\/ ____\\/ _____\\/ _____\\',
	'\\/_   __/ /   _   / /  __/ / __  / / __  /_   __   _____',
	'/ /  / / /  / /  / /  / / /  ___/ /  ___/\\ _\\/ __\\/ _____\\',
	'\\/__/  \\/__/\\/__/\\/__/  \\/_____/\\/_____/\\/__/ /  / /  ___/',
	'                                         / __/  /  \\__  \\',
	'                                         \\/____/\\/_____/'
].join( '\n' ) );

// console sandbox

import( '/build/three.module.js' ).then( THREE => {

	window.THREE = THREE;

} );
