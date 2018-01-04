
var panel = document.getElementById( 'panel' );
var content = document.getElementById( 'content' );
var clearFilterButton = document.getElementById( 'clearFilterButton' );
var expandButton = document.getElementById( 'expandButton' );
var filterInput = document.getElementById( 'filterInput' );
var iframe = document.querySelector( 'iframe' );

var pageProperties = {};
var titles = {};
var categoryElements = [];


// Functionality for hamburger button (on small devices)

expandButton.onclick = function ( event ) {

	event.preventDefault();
	panel.classList.toggle( 'collapsed' );

};


// Functionality for search/filter input field

filterInput.oninput = function ( event ) {

	updateFilter();

};


// Functionality for filter clear button

clearFilterButton.onclick = function ( event ) {

	event.preventDefault();

	filterInput.value = '';
	updateFilter();

};

// Activate content and title change on browser navigation

window.onpopstate = createNewIframe;

// Create the navigation panel and configure the iframe

createNavigation();
createNewIframe();

// Navigation Panel

function createLink( pageName, pageURL ) {

	var link = document.createElement( 'a' );
	link.href = pageURL + '.html';
	link.textContent = pageName;
	link.setAttribute( 'target', 'viewer' );
	link.addEventListener( 'click', function ( event ) {

		window.location.hash = pageURL;
		panel.classList.add( 'collapsed' );

	} );

	return link;

}


function createFilterLink( pageName, pageURL, fragment ) {

	var link = document.createElement( 'a' );
	link.href = pageURL + '.html#' + pageName;
	link.textContent = pageName;
	link.setAttribute( 'target', 'viewer' );
	link.addEventListener( 'click', function ( event ) {

		setUrlFragment( fragment );
		panel.classList.add( 'collapsed' );

	} );

	return link;

}

function createNavigation() {

	// Create the navigation panel using data from list.js

	var navigation = document.createElement( 'div' );
	content.appendChild( navigation );

	for ( var section in list ) {

		// Create sections

		var categories = list[ section ];

		var sectionHead = document.createElement( 'h2' );
		sectionHead.textContent = section;
		navigation.appendChild( sectionHead );

		for ( var category in categories ) {

			// Create categories

			var pages = categories[ category ];

			var categoryContainer = document.createElement( 'div' );
			navigation.appendChild( categoryContainer );

			var categoryHead = document.createElement( 'h3' );
			categoryHead.textContent = category;
			categoryContainer.appendChild( categoryHead );

			var categoryContent = document.createElement( 'ul' );
			categoryContainer.appendChild( categoryContent );

			for ( var pageName in pages ) {

				// Create page links

				var filter = pages[ pageName ];
				if ( typeof filter !== "string" ) {

					pageURL = filter[ "#URL" ];

				} else {

					pageURL = filter;

				}


				var listElement = document.createElement( 'li' );
				categoryContent.appendChild( listElement );

				var linkElement = createLink( pageName, pageURL );
				listElement.appendChild( linkElement );

				// Gather the main properties for the current subpage

				pageProperties[ pageName ] = {
					section: section,
					category: category,
					pageURL: pageURL,
					linkElement: linkElement,

				};
				if ( typeof filter !== "string" ) {


					pageProperties[ pageName ].filterItems = filter;
					pageProperties[ pageName ].filterLinkItems = [];

					var filterItems = document.createElement( 'ul' );
					listElement.appendChild( filterItems );

					for ( var i in filter ) {

						if ( ! i.startsWith( "#" ) ) {

							var filterItem = document.createElement( 'li' );
							filterItem.classList.add( 'hidden' );
							filterItem.classList.add( 'filterItem' );
							filterItems.appendChild( filterItem );

							linkElement = createFilterLink( i, pageURL, filter[ i ] );
							filterItem.appendChild( linkElement );

							pageProperties[ pageName ].filterLinkItems.push( linkElement );

						}

					}

				}


				// Gather the document titles (used for easy access on browser navigation)

				titles[ pageURL ] = pageName;

			}

			// Gather the category elements for easy access on filtering

			categoryElements.push( categoryContent );

		}

	}

}


// Filtering

function updateFilter() {

	// (uncomment the following line and the "Query strings" section, if you want query strings):
	// updateQueryString();

	if ( filterInput.value !== "" ) {

		var regExp = new RegExp( filterInput.value, 'gi' );

		for ( var pageName in pageProperties ) {

			var pageProperty = pageProperties[ pageName ];
			var linkElement = pageProperty.linkElement;
			var categoryClassList = linkElement.parentElement.classList;
			var filterResults = pageName.match( regExp );
			var filterItemResults = [];

			if ( pageProperty.filterItems ) {

				for ( var filterItem in pageProperty.filterItems ) {

					var match = filterItem.match( regExp );
					if ( match && match.length > 0 ) {

						filterItemResults.push( filterItem );

					}

				}

			}


			if ( filterResults && filterResults.length > 0 ) {

				// Accentuate matching characters

				for ( var i = 0; i < filterResults.length; i ++ ) {

					var result = filterResults[ i ];

					if ( result !== '' ) {

						pageName = pageName.replace( result, '<b>' + result + '</b>' );

					}

				}

				if ( pageProperty.filterItems ) {

					for ( var j = 0; j < pageProperty.filterLinkItems.length; j ++ ) {

						var filterLinkItem = pageProperty.filterLinkItems[ j ];
						filterLinkItem.parentElement.classList.add( 'hidden' );

					}

				}

				categoryClassList.remove( 'hidden' );
				linkElement.innerHTML = pageName;

			} else if ( filterItemResults.length > 0 ) {

				for ( var j = 0; j < pageProperty.filterLinkItems.length; j ++ ) {

                    var found = false;

                    for ( var i = 0; i < filterItemResults.length; i ++ ) {

                        var filterLinkItem = pageProperty.filterLinkItems[ j ];

						if ( filterLinkItem.textContent == filterItemResults[ i ] ) {

							filterLinkItem.parentElement.classList.remove( 'hidden' );
                            found = true;

						}

                    }

                    if (!found) {

					    var filterLinkItem = pageProperty.filterLinkItems[ j ];
					    filterLinkItem.parentElement.classList.add( 'hidden' );

                    } 

		        }

				categoryClassList.remove( 'hidden' );
				linkElement.innerHTML = pageName;

			} else {

				// Hide all non-matching page names
				categoryClassList.add( 'hidden' );

			}

		}


	} else {

		for ( var pageName in pageProperties ) {

			var linkElement = pageProperties[ pageName ].linkElement;
			var categoryClassList = linkElement.parentElement.classList;
			categoryClassList.remove( 'hidden' );
			linkElement.innerHTML = pageName;

		}

		var filterItems = document.getElementsByClassName( "filterItem" );
		for ( var i = 0; i < filterItems.length; ++ i ) {

			filterItems[ i ].classList.add( 'hidden' );

		}


	}

	displayFilteredPanel();

}

function displayFilteredPanel() {

	// Show/hide categories depending on their content
	// First check if at least one page in this category is not hidden

	categoryElements.forEach( function ( category ) {

		var pages = category.children;
		var pagesLength = pages.length;
		var sectionClassList = category.parentElement.classList;

		var hideCategory = true;

		for ( var i = 0; i < pagesLength; i ++ ) {

			var pageClassList = pages[ i ].classList;

			if ( ! pageClassList.contains( 'hidden' ) ) {

				hideCategory = false;

			}

		}

		// If and only if all page names are hidden, hide the whole category

		if ( hideCategory ) {

			sectionClassList.add( 'hidden' );

		} else {

			sectionClassList.remove( 'hidden' );

		}

	} );

}


// Routing

function setUrlFragment( pageName ) {

	// Handle navigation from the subpages (iframes):
	// First separate the memeber (if existing) from the page name,
	// then identify the subpage's URL and set it as URL fragment (re-adding the member)

	var splitPageName = decomposePageName( pageName, '.', '.' );

	var currentProperties = pageProperties[ splitPageName[ 0 ] ];

	if ( currentProperties ) {

		window.location.hash = currentProperties.pageURL + splitPageName[ 1 ];

		createNewIframe();

	}

}

function createNewIframe() {

	// Change the content displayed in the iframe
	// First separate the member part of the fragment (if existing)

	var hash = window.location.hash.substring( 1 );
	var splitHash = decomposePageName( hash, '.', '#' );

	// Creating a new Iframe instead of assigning a new src is
	// a cross-browser solution to allow normal browser navigation;
	// - only assigning a new src would result in two history states each time.

	// Note: iframe.contentWindow.location.replace(hash) should work, too,
	// but it doesn't work in Edge with links from the subpages!

	var oldIframe;
	var subtitle;

	oldIframe = iframe;
	iframe = oldIframe.cloneNode();

	if ( hash ) {

		iframe.src = splitHash[ 0 ] + '.html' + splitHash[ 1 ];
		subtitle = titles[ splitHash[ 0 ] ] + splitHash[ 1 ] + ' - ';

	} else {

		iframe.src = '';
		subtitle = '';

	}

	document.body.replaceChild( iframe, oldIframe );
	document.title = subtitle + 'three.js docs';

}

function decomposePageName( pageName, oldDelimiter, newDelimiter ) {

	// Helper function for separating the member (if existing) from the pageName
	// For example: 'Geometry.morphTarget' can be converted to
	// ['Geometry', '.morphTarget'] or ['Geometry', '#morphTarget']
	// Note: According RFC 3986 no '#' allowed inside of an URL fragment!

	var parts = [];

	var dotIndex = pageName.indexOf( oldDelimiter );

	if ( dotIndex !== - 1 ) {

		parts = pageName.split( oldDelimiter );
		parts[ 1 ] = newDelimiter + parts[ 1 ];

	} else {

		parts[ 0 ] = pageName;
		parts[ 1 ] = '';

	}

	return parts;

}

//

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


