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
	filterInput.focus();
	// eslint-disable-next-line no-undef
	hideSearch(); // defined in search.js

};

//

window.addEventListener( 'DOMContentLoaded', updateNavigation );
window.addEventListener( 'hashchange', updateNavigation );

function updateNavigation() {

	// unselected elements

	const selected = document.querySelectorAll( 'nav a.selected' );
	selected.forEach( link => link.classList.remove( 'selected' ) );

	// determine target

	const filename = window.location.pathname.split( '/' ).pop();
	const pagename = filename.split( '.' )[ 0 ];

	let target = pagename;

	if ( pagename === 'global' ) {

		target = window.location.hash.split( '#' ).pop();

	}

	if ( target === '' ) return;

	// select target and move into view

	const liElement = document.querySelector( `li[data-name="${target}"]` );

	if ( liElement !== null ) {

		const aElement = liElement.firstChild;

		aElement.scrollIntoView( { block: 'center' } );
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
