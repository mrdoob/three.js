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
let iframes;
let nodeButton;
let nodeLanguage;
let nodeSectionDoc;
let nodeSectionEx;
let panel;
let panelScrim;
let previewsToggler;
let viewerDoc;
let viewerEx;

let currentSection = '';
let prevHash = '';

function initNodes() {

    container = document.getElementById( 'container' );
    contentDoc = document.getElementById( 'contentDoc' );
    contentEx = document.getElementById( 'contentEx' );
    exitSearchButton = document.getElementById( 'exitSearchButton' );
    expandButton = document.getElementById( 'expandButton' );
    filterInput = document.getElementById( 'filterInput' );
    iframes = document.getElementById( 'iframes' );
    nodeButton = document.getElementById( 'button' );
    nodeLanguage = document.getElementById( 'language' );
    nodeSectionDoc = document.getElementById( 'sectionDoc' );
    nodeSectionEx = document.getElementById( 'sectionEx' );
    panel = document.getElementById( 'panel' );
    panelScrim = document.getElementById( 'panelScrim' );
    previewsToggler = document.getElementById( 'previewsToggler' );
    viewerDoc = document.getElementById( 'viewerDoc' );
    viewerEx = document.getElementById( 'viewerEx' );

}

function cleanSearch() {

    // create a clean search query

    const search = filterInput.value.trim().replace( /\s+/g, ' ' );
    window.history.replaceState( {}, '', `${search? '?q=': ''}${search}${location.hash}` );
    return search;

}

function extractQuery() {

    const search = location.search;
    return ( search.indexOf( '?q=' ) >= 0 ) ? decodeURI( search.substr( 3 ) ) : '';

}

async function hashChanged( defaultSection ) {

    const hash = location.hash.slice( 1 );
    const section = ( hash || ! defaultSection ) ? ( hash.includes( '/' ) ? 'docs': 'examples' ) : defaultSection;

    // section change docs <=> examples

    if ( section != currentSection ) {

        await setSection( section );

    }

    // selection change

    if ( hash != prevHash ) {

        if ( section == 'docs' ) {

            selectDoc( hash );

        } else {

            selectEx( hash );

        }

        prevHash = hash;

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

function highlightTokens( name, lower, searchLow, mainUrl ) {

    const names = name.split( ' ' );
    const lowers = lower.split( ' ' );
    const searchLength = searchLow.length;
    const lines = [];

    for ( let i = 0, length = names.length; i < length; i ++ ) {

        const index = lowers[ i ].indexOf( searchLow );
        if ( index < 0 ) {

            continue;

        }

        const text = highlightText(names[ i ], index, index + searchLength);
        const url = `${mainUrl}.${names[ i ]}`;

        lines.push( `<a href="#${url}" data-url="${url}">${text}</a>` );
    }

    return lines.join( '' );
}

/**
 * Search content
 * @param {number} mode &1: text (class name), &2: property, &4: method
 */
function searchContent( search, data, mode, callback ) {

    // Search content:
    // - data must be an object of objects
    // - those objects must contain a `text` string used for matching

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

                if ( mode & 1 ) {

                    const index = item.text.indexOf( search );
                    callback( key, item, null, index, index + search.length, 1 );

                }

                if ( ( mode & 2 ) && item.propertyLow ) {

                    const index = item.propertyLow.indexOf( search );
                    callback( key, item, null, index, index + search.length, 2 );

                }

                if ( ( mode & 4 ) && item.methodLow ) {

                    const index = item.methodLow.indexOf( search );
                    callback( key, item, null, index, index + search.length, 4 );

                }

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

    }

    window.onhashchange = async () => {

        await hashChanged();

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

    if ( isDoc ) {

        nodeSectionDoc.classList.add( 'selected' );
        nodeSectionEx.classList.remove( 'selected' );

        await initDoc();

    } else {

        nodeSectionDoc.classList.remove( 'selected' );
        nodeSectionEx.classList.add( 'selected' );

        await initEx();

    }

    updateFilter();
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

function updateIFrame( iframe, src ) {

    if ( iframe.src == src ) {

        return;

    }

    // Update the source outside the DOM to prevent history from being changed

    iframes.removeChild( iframe );
    iframe.src = src;
    iframes.appendChild( iframe );

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

const categoriesDoc = [];
let lastSearchDoc;
const pagesDoc = {};
const sectionsDoc = [];
let readyDoc;

async function initDoc() {

    if ( readyDoc ) {

        return false;

    }

    const list = await ( await fetch( '../files/docs.json' ) ).json();

    // *BufferGeometry to *Geometry

    let hash = location.hash;
    const index = hash.indexOf( 'BufferGeometry' );

    if ( index > 1 && ! hash.includes( 'Instanced' ) && hash[ index - 1 ] != '/' ) {

        hash = hash.replace( 'BufferGeometry', 'Geometry' );
        location.hash = hash;

    }

    hash = hash.slice( 1 );

    // Localisation

    let language = 'en';

    if ( /^(api|manual|examples)/.test( hash ) ) {

        const hashLanguage = /^(api|manual|examples)\/(en|ar|ko|zh|ja)\//.exec( hash );

        if ( hashLanguage === null ) {

            // Route old non-localised api links

            location.hash = hash.replace( /^(api|manual|examples)/, '$1/en' );

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
    return true;
}

function createNavigationDoc( list, language ) {

    // Create the navigation panel

    const selectedPage = location.hash.substring( 1 );
    const lines = [];

    parseDoc( list, language, {

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

        pageAfter: ( _section, _category, pageName, url, page ) => {

            // Gather data for the current subpage

            pagesDoc[ pageName ] = {
                url: url,
                text: pageName.toLowerCase(),
            };

            if ( typeof page == 'object' ) {

                const dico = pagesDoc[ pageName ];

                if ( page.property ) {

                    const text = page.property.join( ' ' );
                    dico.property = text;
                    dico.propertyLow = text.toLowerCase();

                }

                if ( page.method ) {

                    const text = page.method.join( ' ' );
                    dico.method = text;
                    dico.methodLow = text.toLowerCase();

                }

            }

            const selected = ( url === selectedPage ) ? ' selected' : '';

            lines.push(
                        '<li>',
                            `<a href="#${url}"${selected} data-name="${pageName}" data-url="${url}">${pageName}</a>`,
                            '<div class="property"></div>',
                            '<div class="method"></div>',
                        '</li>',
            );

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

    // cache headers + links

    for ( const section of contentDoc.childNodes ) {

        if ( section.tagName != 'DIV' ) {

            continue;

        }

        const children = section.childNodes;
        const header = children[ 0 ];
        const lists = children[ 1 ];
        const svector = [ 1, header.classList ];

        for ( const node of lists.childNodes ) {

            const children = node.childNodes;
            const name = children[0].dataset.name;

            const cvector = [ 1, node.classList, name ];
            categoriesDoc.push( cvector );

            const page = pagesDoc[ name ];
            page.cvector = cvector;
            page.nodes = children;
            page.parentList = node.classList;
            page.svector = svector;

        }

        sectionsDoc.push( svector );

    }

    // events

    contentDoc.onclick = event => {

        let target = event.target;

        if ( event.button !== 0 || event.ctrlKey || event.altKey || event.metaKey || target.tagName != 'A' ) {

            return;

        }

        selectDoc( target.dataset.url, target );

    };

}

function parseDoc( list, language, {
        categoryAfter, categoryBefore, pageAfter, sectionAfter, sectionBefore, skipUnderscore=true,
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
        let refPath = ( mainPath && mainPath.slice( 0, 2 ) == 'ex' ) ? 'Examples' : 'Reference';

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

                    if ( ! skipUnderscore ) {

                        pageAfter( section, category, pageName, '', pages[ pageName ] );

                    }

                    continue;

                }

                // Construct the URL

                const page = pages[ pageName ];
                const type = typeof( page );

                let url = ( type == 'object' ) ? page.url : ( ( type == 'string' ) ? page : null );

                if ( ! url || typeof url != 'string' ) {

                    url = pageName.replace( /\s+/g, '-' );

                }

                // if URL contains '/' => treat it as the final answer
                if ( ! url.includes( '/' ) ) {

                    url = `${subPath}/${url}`;

                }

                if ( pageAfter ) {

                    pageAfter( section, category, pageName, url, page );

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

function selectDoc( url, node ) {

    const splits = url.split( '.' );

    if ( ! node ) {

        node = contentDoc.querySelector( `[data-url="${splits[0]}"]` );
        if ( ! node ) {

            return;

        }

    }

    const selected = contentDoc.querySelector( '.selected' );
    if ( selected ) {

        selected.classList.remove( 'selected' );

    }

    node.classList.add( 'selected' );

    let localURL = `../docs/${splits[ 0 ]}.html`;
    if ( splits[ 1 ] ) {

        localURL = `${localURL}#${splits[ 1 ]}`;

    }

    updateIFrame( viewerDoc, localURL );

}

function setUrlFragment( pageName ) {

    // Handle navigation from the subpages (iframes):
    // First separate the member (if existing) from the page name,
    // then identify the subpage's URL and set it as URL fragment (re-adding the member)

    const splits = pageName.split( '.' );
    const page = pagesDoc[ splits[ 0 ] ];

    if ( page ) {

        let url = page.url;

        if ( splits[ 1 ]) {

            url = `${url}.${splits[ 1 ]}`;

        }

        location.hash = url;

    }

}

function showCategoriesDoc() {

    // Show/hide sections + categories depending on their content

    for ( const [ count, classList ] of sectionsDoc ) {

        if ( count ) {

            classList.remove( 'hidden' );

        } else {

            classList.add( 'hidden' );

        }

    }

    for ( const [ count, classList ] of categoriesDoc ) {

        if ( count ) {

            classList.remove( 'hidden' );

        } else {

            classList.add( 'hidden' );

        }

    }

}

function updateFilterDoc() {

    // time to remove "pro" from the search (average of 5 times)
    // - original: 37.68 ms
    // - new: 6.05 ms

    let search = cleanSearch();
    if ( search == lastSearchDoc ) {

        return;

    }

    lastSearchDoc = search;

    let mode = 7;

    if ( search && search[ 0 ] == search[ 0 ].toUpperCase() && search[ 0 ] != search[ 0 ].toLowerCase() ) {

        mode = 1;
        contentDoc.classList.add( 'mainSearch' );

    } else {

        if ( search[ 0 ] == '.' ) {

            mode = 6;
            search = search.slice( 1 );

        }

        contentDoc.classList.remove( 'mainSearch' );

    }

    let searchLow = search.toLowerCase();

    for ( const vector of sectionsDoc ) {

        vector[ 0 ] = 0;

    }

    for ( const vector of categoriesDoc) {

        vector[ 0 ] = 0;

    }

    searchContent( search, pagesDoc, mode, ( name, page, regExp, index, end, type ) => {

        if ( regExp ) {

            // /regexp/ was used

            if ( index >= 0 ) {

                page.nodes[0].innerHTML = name.replaceAll( regExp, '<b>$&</b>' );
                page.cvector[ 0 ] |= 1;
                page.svector[ 0 ] ++;

            }

        } else if ( index == -2 ) {

            // empty search => restore original names if needed (note: the check is not useless)

            if ( page.nodes[0].innerHTML != name ) {

                page.nodes[0].innerHTML = name;

            }

            page.cvector[ 0 ] |= 1;
            page.svector[ 0 ] ++;

        } else if ( index >= 0 ) {

            // full text match => show the matching text

            if ( type == 1 ) {

                page.nodes[0].innerHTML = highlightText( name, index, end );
                page.cvector[ 0 ] |= 1;

            } else if ( type == 2 ) {

                page.nodes[ 1 ].innerHTML = highlightTokens( page.property, page.propertyLow, searchLow, page.url );
                page.cvector[ 0 ] |= 2;

            } else if ( type == 4 ) {

                page.nodes[ 2 ].innerHTML = highlightTokens( page.method, page.methodLow, searchLow, page.url );
                page.cvector[ 0 ] |= 4;

            }

            page.svector[ 0 ] ++;

        } else {

            // full text fail

            if ( type == 1 ) {

                page.nodes[0].innerHTML = name;

            } else if ( type == 2 ) {

                page.nodes[1].innerHTML = '';

            } else if ( type == 4 ) {

                page.nodes[2].innerHTML = '';

            }

        }

    } );

    showCategoriesDoc();

}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// EXAMPLES
///////////

const fileObjects = {};
const headerClassLists = {};
let lastSearchEx;
const linkClassLists = {};
const linkTitles = {};
let readyEx;
let sectionFiles = {};
// let sectionsEx = [];
let selectedEx = null;

async function initEx() {

    if ( readyEx ) {

        return false;

    }

    sectionFiles = await ( await fetch( '../examples/files.json' ) ).json();
    const fileTags = await ( await fetch( '../examples/tags.json' ) ).json();

    createNavigationEx( fileTags );

    if ( location.hash !== '' ) {

        const file = location.hash.substring( 1 );
        selectEx( file );

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
    return true;
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
            file.text = [ clean, ... ( fileTags[ name ] || [] ) ].join( ' ' ).toLowerCase();

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

        if ( event.button !== 0 || event.ctrlKey || event.altKey || event.metaKey || event.target.tagName != 'A' ) {

            return;

        }

        selectEx( event.target.dataset.name );

    };

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

function selectEx( name ) {

    const fileObj = fileObjects[ name ];
    if ( ! fileObj ) {

        return;

    }

    if ( selectedEx !== null ) {

        linkClassLists[ selectedEx ].remove( 'selected' );

    }

    linkClassLists[ name ].add( 'selected' );

    updateIFrame( viewerEx, `../examples/${name}.html` );

    viewerEx.focus();
    showHide( viewerEx, true );

    panel.classList.remove( 'open' );

    selectedEx = name;

    // Reveal "View source" button and set attributes to this example
    showHide( nodeButton, true );
    nodeButton.href = `https://github.com/mrdoob/three.js/blob/master/examples/${selectedEx}.html`;
    nodeButton.title = `View source code for ${cleanName( selectedEx )} on GitHub`;

}

function updateFilterEx() {

    // time to remove "buffer" from the search (average of 5 times)
    // - original: 72.04 ms
    // - new: 2.82 ms

    let search = cleanSearch();
    if ( search == lastSearchEx ) {

        return;

    }

    lastSearchEx = search;

    if ( search[ 0 ] == '.' ) {

        search = search.slice( 1 );

    }

    searchContent( search, fileObjects, 1, ( name, page, regExp, index, end ) => {

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

if ( typeof exports != 'undefined' ) {

    exports.parseDoc = parseDoc;

}
