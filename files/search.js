// Global functions and variables for docs/index.html and examples/index.html
//
// The script must be run after the DOM has been created

/*
globals
console, document, window
*/

'use strict';

const panel = document.getElementById( 'panel' );
const content = document.getElementById( 'content' );
const exitSearchButton = document.getElementById( 'exitSearchButton' );
const expandButton = document.getElementById( 'expandButton' );
const panelScrim = document.getElementById( 'panelScrim' );
const filterInput = document.getElementById( 'filterInput' );

const sectionLink = document.querySelector( '#sections > a' );
const sectionDefaultHref = sectionLink.href;


function extractQuery() {

    const search = window.location.search;

    if ( search.indexOf( '?q=' ) !== - 1 ) {

        return decodeURI( search.substr( 3 ) );

    }

    return '';

}

function searchQuery() {

    // Handle search query

    filterInput.value = extractQuery();

    if ( filterInput.value !== '' ) {

        panel.classList.add( 'searchFocused' );

        updateFilter();

    } else {

        updateLink( '' );

    }

}

function setGlobalEvents(updateFilter) {

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

        updateFilter();

    };

    exitSearchButton.onclick = function () {

        filterInput.value = '';
        updateFilter();
        panel.classList.remove( 'searchFocused' );

    };

}

function updateFilter() {
    
}

function updateLink( search ) {

    // update examples link

    if ( search ) {

        let link = sectionLink.href.split( /[?#]/ )[ 0 ];
        sectionLink.href = `${link}?q=${search}`;

    } else {

        sectionLink.href = sectionDefaultHref;

    }

}

function welcomeThree() {

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

}
