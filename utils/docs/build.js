var fs = require( "fs" );

function JSONsort( object ) {

	const isObject = ( objectToTest ) => ( '[object Object]' === Object.prototype.toString.call( objectToTest ) );

	if ( Array.isArray( object ) ) {

		return object.sort().map( item => isObject( item ) ? JSON.sort( item ) : item );

	} else if ( isObject( object ) ) {

		return Object
			.keys( object )
			.sort()
			.reduce( ( obj, key ) => {

				if ( isObject( object[ key ] ) ) {

					obj[ key ] = JSON.sort( object[ key ] );

				} else if ( Array.isArray( object[ key ] ) ) {

					obj[ key ] = object[ key ].map( item => isObject( item ) ? JSON.sort( item ) : item );

				} else {

					obj[ key ] = object[ key ];

				}

				return obj;

			}, {} );

	}

	return object;

}

function getParent( HTMLFile ) {


	var ParentRegex = /\[page:([\w\.]+) ?([\w\.\s]+)?\]\s+&rarr;/gi;
	do {

		match = ParentRegex.exec( HTMLFile );
		if ( match ) {

			return match[ 1 ];

		}

	} while ( match );

	return undefined;

}

function getMembers( HTMLFile ) {

	var memberregex = /\[(?:member|property|method):([\w]+) ?([\w\.\s]+)?\]/gi;
	var matches = [];
	do {

		match = memberregex.exec( HTMLFile );
		if ( match && match[ 2 ] ) {

			matches.push( match[ 2 ] );

		} else if ( match && match[ 1 ] ) {

			matches.push( match[ 1 ] );

		}

	} while ( match );
	return matches;

}


function extractData( obj ) {

	var allPages = {};

	for ( var category in obj ) {

		var pages = obj[ category ];
		for ( var page in pages ) {

			var filterItems = pages[ page ];
			if ( typeof filterItems === "string" ) {

				filterItems = { "#URL": filterItems };

			} else {

				filterItems = { "#URL": filterItems[ "#URL" ] };

			}
			var url = filterItems[ "#URL" ];
			var HTMLFile = fs.readFileSync( docsFolder + url + ".html", "utf8" );

			var parent = getParent( HTMLFile );
			if ( parent ) {

				filterItems[ "#PARENT" ] = parent;

			}


			var members = getMembers( HTMLFile );
			if ( members && members.length > 0 ) {

				members.forEach( function ( member ) {

					filterItems[ member ] = page + "." + member;

				} );

			}

			pages[ page ] = JSONsort( filterItems );

			allPages[ page ] = filterItems;

		}

	}
	/*
    for (var pageToCheck in allPages) {
        var parent = allPages[pageToCheck]["#PARENT"];
        while (parent) {
            if (allPages[parent]) {
                for (parentFilters in allPages[parent]) {
                    if (!parentFilters.startsWith("#") && !allPages[pageToCheck][parentFilters]) {
                        allPages[pageToCheck][parentFilters] = allPages[parent][parentFilters];
                    }
                }
                parent = allPages[parent]["#PARENT"];
            } else {
                parent = undefined;
            }
        }
    }*/

}


function eslint( files ) {

	var CLIEngine = require( "eslint" ).CLIEngine;

	var cli = new CLIEngine( {
		fix: true
	} );

	// lint myfile.js and all files in lib/
	var report = cli.executeOnFiles( files );

	// output fixes to disk
	CLIEngine.outputFixes( report );

}

var docsFolder = "../../docs/"
var listFile = docsFolder + "list.js";

var list = ( new Function( fs.readFileSync( listFile, "utf8" ) + ";return list;" ) )();
extractData( list.Reference );
extractData( list.Examples );


fs.writeFileSync( listFile, "var list = " + JSON.stringify( list, undefined, 4 ), "utf8" );

eslint( [ listFile,] );
