// Global functions and variables for docs/index.html and examples/index.html
//
// The script must be run after the DOM has been created

/*
globals
console, document, exports, fetch, getComputedStyle, location, navigator, window
*/

'use strict';

// COMMON
/////////

let container;
let contentDoc;
let contentEx;
let exitSearchButton;
let expandButton;
let filterInput;
let nodeButton;
let nodeLanguage;
let panel;
let panelScrim;
let previewsToggler;
let sectionDoc;
let sectionEx;
let viewerDoc;
let viewerEx;

let currentSection = '';
let sectionData = {
    docs: {},
    examples: {},
};

function initNodes() {

    container = document.getElementById( 'container' );
    contentDoc = document.getElementById( 'contentDoc' );
    contentEx = document.getElementById( 'contentEx' );
    exitSearchButton = document.getElementById( 'exitSearchButton' );
    expandButton = document.getElementById( 'expandButton' );
    filterInput = document.getElementById( 'filterInput' );
    nodeButton = document.getElementById( 'button' );
    nodeLanguage = document.getElementById( 'language' );
    panel = document.getElementById( 'panel' );
    panelScrim = document.getElementById( 'panelScrim' );
    previewsToggler = document.getElementById( 'previewsToggler' );
    sectionDoc = document.getElementById( 'sectionDoc' );
    sectionEx = document.getElementById( 'sectionEx' );
    viewerDoc = document.getElementById( 'viewerDoc' );
    viewerEx = document.getElementById( 'viewerEx' );

}

function extractQuery() {

    const search = location.search;
    return ( search.indexOf( '?q=' ) >= 0 ) ? decodeURI( search.substr( 3 ) ) : '';

}

async function hashChanged(defaultSection) {

    const hash = location.hash.slice(1);
    const section = ( hash || ! defaultSection ) ? ( hash.includes( '/' ) ? 'docs': 'examples' ) : defaultSection;

    if ( section != currentSection ) {

        await setSection( section );

    }

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

        } );

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

        } );

    }

}

function setGlobalEvents() {

    // Functionality for hamburger button (on small devices)

    expandButton.onclick = event => {

        event.preventDefault();
        panel.classList.toggle( 'open' );

    };

    panelScrim.onclick = event => {

        event.preventDefault();
        panel.classList.toggle( 'open' );

    };

    // Functionality for search/filter input field

    filterInput.onfocus = () => {

        panel.classList.add( 'searchFocused' );

    };

    filterInput.onblur = () => {

        if ( filterInput.value === '' ) {

            panel.classList.remove( 'searchFocused' );

        }

    };

    filterInput.oninput = () => {

        updateFilter();

    };

    exitSearchButton.onclick = () => {

        filterInput.value = '';
        updateFilter();
        panel.classList.remove( 'searchFocused' );

    };

    // Handle search query

    filterInput.value = extractQuery();

    if ( filterInput.value !== '' ) {

        panel.classList.add( 'searchFocused' );

        updateFilter();

    }

    window.onhashchange = async event => {

        console.log('HASH_CHANGED', event);

        await hashChanged();

    };

    window.onpopstate = event => {
        console.log('POP_STATE', event);
    };

}

async function setSection( section ) {

    // used when changing sections

    currentSection = section;

    const isDoc = ( section == 'docs' );

    showHide( nodeLanguage, isDoc );
    showHide( contentDoc, isDoc );
    showHide( contentEx, ! isDoc );
    showHide( viewerDoc, isDoc );
    showHide( viewerEx, ! isDoc );

    if ( section == 'docs' ) {

        sectionDoc.classList.add( 'selected' );
        sectionEx.classList.remove( 'selected' );

        await initDoc();

    } else {

        sectionDoc.classList.remove( 'selected' );
        sectionEx.classList.add( 'selected' );

        await initEx();

    }
}

function showHide( node, show ) {

    node.classList.remove( 'hidden' );
    node.style.display = show ? '' : 'none';

}

function updateFilter() {

    if ( currentSection == 'docs' ) {

        updateFilterDoc();

    } else {

        updateFilterEx();

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

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// DOCS
///////

const categoryElements = [];
const pageProperties = {};
let readyDoc;

async function initDoc() {

    if ( readyDoc ) {

        return;

    }

    const list = await ( await fetch( '../docs/list.json' ) ).json();

    // *BufferGeometry to *Geometry

    let hash = window.location.hash;
    const index = hash.indexOf( 'BufferGeometry' );

    if ( index > 1 && ! hash.includes( 'Instanced' ) && hash[ index - 1 ] != '/' ) {

        hash = hash.replace( 'BufferGeometry', 'Geometry' );
        window.location.hash = hash;

    }

    hash = hash.slice( 1 );

    // Localisation

    let language = 'en';

    if ( /^(api|manual|examples)/.test( hash ) ) {

        const hashLanguage = /^(api|manual|examples)\/(en|ar|ko|zh|ja)\//.exec( hash );

        if ( hashLanguage === null ) {

            // Route old non-localised api links

            window.location.hash = hash.replace( /^(api|manual|examples)/, '$1/en' );

        } else {

            language = hashLanguage[ 2 ];

        }

    }

    nodeLanguage.value = language;
    nodeLanguage.onChange = function () {

        setLanguage( this.value );

    };

    function setLanguage( value ) {

        language = value;

        createNavigationDoc( list, language );
        updateFilterDoc();

		// Auto change language url. If a reader open a document in English, when he click "zh",
        // the document he read will auto change into Chinese version

        const hash = location.hash;
        if ( hash === '' ) {

            return;

        }

        const docType = hash.substr( 0, hash.indexOf( '/' ) + 1 );
        let docLink = hash.substr( hash.indexOf( '/' ) + 1 );
        docLink = docLink.substr( docLink.indexOf( '/' ) );
        location.href = docType + language + docLink;

    }

    createNavigationDoc( list, language );

    readyDoc = true;

}

function createNavigationDoc( list, language ) {

    // Create the navigation panel

    const selectedPage = location.hash.substring( 1 );
    const lines = [];

    parseDocumentation( list, language, {

        sectionBefore: section => {

            lines.push(
                `<h2>${section}</h2>`,
            );

        },

        categoryBefore: ( _section, category ) => {

            lines.push(
                '<div>',
                    `<h3>${category}</h3>`,
                    '<ul>',
            );

        },

        pageAfter: ( section, category, pageName, pageURL ) => {

            const selected = ( pageURL === selectedPage ) ? ' selected' : '';

            lines.push(
                        '<li>',
                            `<a href="#${pageURL}"${selected}>${pageName}</a>`,
                        '</li>',
            );

            // Gather the main properties for the current subpage

            pageProperties[ pageName ] = {
                section: section,
                category: category,
                pageURL: pageURL,
                text: pageName.toLowerCase(),
            };

        },

        categoryAfter: () => {

            lines.push(
                    '</ul>',
                '</div>',
            );

        },

    } );

    contentDoc.innerHTML = lines.join( '' );

    if ( language == 'ar' ) {

        contentDoc.style.setProperty( 'direction', 'rtl' );

    } else {

        contentDoc.style.removeProperty( 'direction' );

    }

}

function parseDocumentation( list, language, {
        categoryAfter, categoryBefore, pageAfter, sectionAfter, sectionBefore,
    } = {} ) {

    const engList = list.en;
    const localList = list[ language ];

    Object.keys( localList ).forEach( section => {

        // BEGIN: SECTION
        if ( sectionBefore ) {

            sectionBefore( section );

        }

        const categories = localList[ section ];

        let mainPath = categories._main;
        let refPath = ( mainPath && mainPath.slice(0, 2) == 'ex' ) ? 'Examples': 'Reference';

        Object.keys( categories ).forEach( category => {

            // Category

            if ( category[ 0 ] == '_' ) {

                return;

            }

            let pages = categories[ category ];

            if ( typeof pages == 'string' ) {

                category = pages;
                pages = engList[ refPath ][ category ];

            }

            let pageNames;

            if ( Array.isArray( pages ) ) {

                pageNames = pages;
                pages = {};

            } else {

                pageNames = Object.keys( pages );

            }

            //

            let subPath = pages._sub || categories._sub;

            if ( subPath ) {

                if ( subPath[ 0 ] == '/' ) {

                    subPath = subPath.slice( 1 );

                } else if ( mainPath ) {

                    subPath = `${mainPath}/${subPath}`;

                }

            } else {

                subPath = `${mainPath}/${category.toLowerCase().replace( / /g, '' )}`;

            }

            // BEGIN: CATEGORY
            if ( categoryBefore ) {

                categoryBefore( section, category );

            }

            for ( let pageName of pageNames ) {

                // Page

                if ( pageName[ 0 ] == '_' ) {

                    return;

                }

                // Construct the URL

                const page = pages[ pageName ];
                const type = typeof( page );
                let pageURL;

                if ( type == 'object' ) {

                    pageURL = page.url;

                } else {

                    pageURL = ( page && type == 'string' ) ? page : pageName.replace( /\s+/g, '-' );

                }

                // if URL contains '/' => treat it as the final answer
                if ( ! pageURL.includes( '/' ) ) {

                    pageURL = `${subPath}/${pageURL}`;

                }

                if ( pageAfter ) {

                    pageAfter( section, category, pageName, pageURL, page );

                }

            }

            // END: CATEGORY
            if ( categoryAfter ) {

                categoryAfter( section, category );

            }

        } );

        // END: SECTION
        if ( sectionAfter ) {

            sectionAfter( section );

        }

    } );

}

function showCategoriesDoc() {

    // Show/hide categories depending on their content

    categoryElements.forEach( ( [ parentClassList, childrenLists ] ) => {

        // If and only if all page names are hidden, hide the whole category

        let hideCategory = childrenLists.every( list => list.contains( 'hidden' ) );

        if ( hideCategory ) {

            parentClassList.add( 'hidden' );

        } else {

            parentClassList.remove( 'hidden' );

        }

    } );

}

function updateFilterDoc() {

    // see documentation @ search.js
    // time to remove "pro" from the search (average of 5 times)
    // - original: 37.68 ms
    // - new: 6.05 ms

    searchContent( pageProperties, ( name, page, regExp, index, end ) => {

        if ( regExp ) {

            // /regexp/ was used

            if ( index >= 0 ) {

                page.linkElement.innerHTML = name.replaceAll( regExp, '<b>$&</b>' );
                page.parentList.remove( 'hidden' );

            } else {

                page.parentList.add( 'hidden' );

            }

        } else if ( index == -2 ) {

            // empty search => restore original names if needed (note: the check is not useless)

            if ( page.linkElement.innerHTML != name ) {

                page.linkElement.innerHTML = name;

            }

            page.parentList.remove( 'hidden' );

        } else if ( index >= 0 ) {

            // full text match => show the matching text

            page.linkElement.innerHTML = highlightText( name, index, end );
            page.parentList.remove( 'hidden' );

        } else {

            // full text fail

            page.parentList.add( 'hidden' );

        }

    } );

    showCategoriesDoc();

}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// EXAMPLES
///////////

const fileObjects = {};
const headerClassLists = {};
const linkClassLists = {};
const linkTitles = {};
let readyEx;
let sectionFiles = {};
let selectedEx = null;
const validRedirects = new Map();

async function initEx() {

    if ( readyEx ) {

        return;

    }

    sectionFiles = await ( await fetch( '../examples/files.json' ) ).json();
    const fileTags = await ( await fetch( '../examples/tags.json' ) ).json();

    createNavigationEx( fileTags );

    if ( location.hash !== '' ) {

        const file = location.hash.substring( 1 );

        // use a predefined map of redirects to avoid untrusted URL redirection due to user-provided value

        if ( validRedirects.has( file ) === true ) {

            selectFile( file );
            viewerEx.src = validRedirects.get( file );
            showHide( viewerEx, true );

        }

    }

    // iOS iframe auto-resize workaround

    if ( /(iPad|iPhone|iPod)/g.test( navigator.userAgent ) ) {

        viewerEx.style.width = getComputedStyle( viewerEx ).width;
        viewerEx.style.height = getComputedStyle( viewerEx ).height;
        viewerEx.setAttribute( 'scrolling', 'no' );

    }

    previewsToggler.onclick = event => {

        event.preventDefault();
        contentEx.classList.toggle( 'minimal' );

    };

    readyEx = true;

}

function cleanName( name ) {

    return name.split( '_' ).slice( 1 ).join( ' / ' );

}

function createNavigationEx( fileTags ) {

    // create the list of examples
    // + fill the sectionFiles object

    const lines = [];

    Object.keys( sectionFiles ).forEach( section => {

        lines.push( `<h2 data-category="${section}">${section}</h2>` );

        for ( let name of sectionFiles[ section ] ) {

            fileObjects[ name ] = {};
            const file = fileObjects[ name ];
            const clean = cleanName( name );

            lines.push(
                '<div class="card">',
                    `<a href="#${name}" data-name="${name}">`,
                        '<div class="cover">',
                            `<img src="../examples/screenshots/${name}.jpg" loading="lazy" width="400">`,
                        '</div>',
                        `<div class="title">${clean}</div>`,
                    '</a>',
                '</div>',
            );

            file.clean = clean;
            file.text = [ clean, ... ( fileTags[ name ] || [] ) ].join(' ').toLowerCase();

            validRedirects.set( name, name + '.html' );

        }

    } );

    container.innerHTML = lines.join( '' );

    // cache headers + links

    container.querySelectorAll( 'h2' ).forEach( node => {

        headerClassLists[ node.dataset.category ] = node.classList;

    } );

    container.querySelectorAll( 'a' ).forEach( node => {

        let name = node.dataset.name;
        linkClassLists[ name ] = node.parentNode.classList;
        linkTitles[ name ] = node.querySelector( '.title' );

    } );

    // events

    container.onclick = event => {

        if ( event.button !== 0 || event.ctrlKey || event.altKey || event.metaKey || event.target.tagName != 'A') {

            return;

        }

        selectFile( event.target.dataset.name );

    };

}

function selectFile( file ) {

    if ( selectedEx !== null ) {

        linkClassLists[ selectedEx ].remove( 'selected' );

    }

    linkClassLists[ file ].add( 'selected' );

    location.hash = file;
    viewerEx.focus();
    showHide( viewerEx, true );

    panel.classList.remove( 'open' );

    selectedEx = file;

    // Reveal "View source" button and set attributes to this example
    showHide( nodeButton, true );
    nodeButton.href = `https://github.com/mrdoob/three.js/blob/master/examples/${selectedEx}.html`;
    nodeButton.title = `View source code for ${cleanName( selectedEx )} on GitHub`;

}

function showCategoriesEx() {

    Object.keys( sectionFiles ).forEach( section => {

        const collapsed = sectionFiles[ section ].every( name => linkClassLists[ name ].contains( 'hidden' ) );

        if ( collapsed ) {

            headerClassLists[ section ].add( 'hidden' );

        } else {

            headerClassLists[ section ].remove( 'hidden' );

        }

    } );

}

function updateFilterEx() {

    // see documentation @ search.js
    // time to remove "buffer" from the search (average of 5 times)
    // - original: 72.04 ms
    // - new: 2.82 ms

    searchContent( fileObjects, ( name, page, regExp, index, end ) => {

        if ( regExp ) {

            // /regexp/ was used

            if ( index >= 0 ) {

                linkTitles[ name ].innerHTML = page.clean.replaceAll( regExp, '<b>$&</b>' );
                linkClassLists[ name ].remove( 'hidden' );

            } else {

                linkClassLists[ name ].add( 'hidden' );

            }

        } else if ( index == -2 ) {

            // empty search => restore original names if needed (note: the check is not useless)

            const title = linkTitles[ name ];

            if ( title.innerHTML != page.clean ) {

                title.innerHTML = page.clean;

            }

            linkClassLists[ name ].remove( 'hidden' );

        } else if ( index >= 0 ) {

            // full text match => show the matching text

            linkTitles[ name ].innerHTML = highlightText( page.clean, index, end );
            linkClassLists[ name ].remove( 'hidden' );

        } else {

            // full text fail

            linkClassLists[ name ].add( 'hidden' );

        }

    } );

    showCategoriesEx();

}

// EXPORTS
//////////

if (typeof exports != 'undefined') {

    exports.parseDocumentation = parseDocumentation;

}
