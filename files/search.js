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
const sectionDefaultHref = sectionLink.getAttribute( 'href' );


function extractQuery() {

    const search = window.location.search;

    if ( search.indexOf( '?q=' ) !== - 1 ) {

        return decodeURI( search.substr( 3 ) );

    }

    return '';

}

function highlightText( name, start, end ) {

    return [
        name.slice( 0, start ),
        '<b>',
        name.slice( start, end ),
        '</b>',
        name.slice( end ),
    ].join( '' );

}

function searchContent( data, callback ) {

    // Search content:
    // - data must be an object of objects
    // - those objects must contain a `text` string used for matching

    // create a clean search query
    let search = filterInput.value.trim().replace( /\s+/g, ' ' );

    window.history.replaceState( {}, '', `${search? '?q=': ''}${search}${window.location.hash}` );

    if ( search.length >= 2 && search[ 0 ] == '/' && search.slice( - 1 ) == '/' ) {

        // /regexp/ format
        // ex:
        // - /./ => finds everything
        // - /^pro/ => finds PropertyBinding + PropertyMixer, but NOT: LightProbe
        // - /mesh.*material/
        // - /audio|video/ => finds all audio and video stuff
        // - /3$/ => finds everything that ends with a 3: CatmullRomCurve3, ..., Box3, Line3, ...

        let regExp;

        try {

            regExp = new RegExp( search.slice( 1, - 1 ), 'gi' );

        } catch ( e ) {

            // invalid regexp => don't search anything
            return;

        }

        Object.keys( data ).forEach( key => {

            const item = data[ key ];
            const filterResults = key.match( regExp );

            if ( filterResults !== null && filterResults.length > 0 ) {

                callback( key, item, regExp, 0 );

            } else {

                callback( key, item, regExp, -1 );

            }

        });

    } else {

        // full text search
        // ex:
        // - . => finds nothing
        // - pro => finds post-processing, PropertyBinding, PropertyMixer, ... LightProbe etc, same as /pro/

        search = search.toLowerCase();

        Object.keys( data ).forEach( key => {

            const item = data[ key ];

            if ( ! search ) {

                callback( key, item, null, -2 );

            } else {

                const index = item.text.indexOf( search );

                callback( key, item, null, index, index + search.length );

            }

        });

    }

    updateLink( search );

}

function setGlobalEvents( updateFilter ) {

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

    // Handle search query

    filterInput.value = extractQuery();

    if ( filterInput.value !== '' ) {

        panel.classList.add( 'searchFocused' );

        updateFilter();

    } else {

        updateLink( '' );

    }

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
