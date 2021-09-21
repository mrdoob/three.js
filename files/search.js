// Global functions and variables for docs/index.html and examples/index.html
//
// The script must be run after the DOM has been created

/*
globals
clearTimeout, console, document, exports, fetch, getComputedStyle, location, navigator, performance,
setTimeout, THREE, window
*/

'use strict';

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// DOCS
///////

function parseDoc( list, language, {
        categoryAfter, categoryBefore, pageAfter, sectionAfter, sectionBefore, skipUnderscore=true,
    } = {} ) {

    const engList = list.en;
    const isForeign = ( language != 'en' );
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
            let parent;

            if ( typeof pages == 'string' ) {

                category = pages;
                pages = engList[ refPath ][ category ];
                parent = pages;

            }

            let pageNames;

            if ( Array.isArray( pages ) ) {

                pageNames = pages;
                pages = {};

            } else {

                pageNames = Object.keys( pages );

            }

            //

            let engPath = pages._eng;
            let subPath = pages._sub || categories._sub;

            if ( isForeign && ! subPath ) {

                parent = parent || engList[ refPath ][ engPath || category ];

                if ( parent && parent._sub ) {

                    subPath = parent._sub;

                }

            }

            if ( subPath ) {

                if ( subPath[ 0 ] == '/' ) {

                    subPath = subPath.slice( 1 );

                } else if ( mainPath ) {

                    subPath = mainPath + '/' + subPath;

                }

            } else {

                subPath = mainPath + '/' + ( engPath || category ).toLowerCase().replace( / /g, '' );

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

                let page = pages[ pageName ];
                const type = typeof( page );
                let args;
                let url;

                // use English data for foreign languages

                if ( isForeign && parent ) {

                    page = parent[ pageName ];

                }

                // arguments for the constructor
                if ( Array.isArray( page ) ) {

                    args = page;
                    page = 1;

                } else if ( type == 'object' ) {

                    url = page.url;
                    args = page.args;

                } else if ( type == 'string' ) {

                    url = page;

                }

                if ( ! url || typeof url != 'string' ) {

                    url = pageName.replace( /\s+/g, '-' );

                }

                // if URL contains '/' => treat it as the final answer
                if ( ! url.includes( '/' ) ) {

                    url = subPath + '/' + url;

                }

                if ( pageAfter ) {

                    pageAfter( section, category, pageName, url, page, args );

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

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// EXPORTS
//////////

if ( typeof exports != 'undefined' ) {

    exports.parseDoc = parseDoc;

}
