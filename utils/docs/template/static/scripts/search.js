const contentContainer = document.querySelector( '#page-content' );
const searchContainer = document.querySelector( '#search-content' );
const resultBox = document.querySelector( '#search-result' );

// eslint-disable-next-line no-unused-vars
function hideSearch() {

	searchContainer.style.display = 'none';
	contentContainer.style.display = 'block';


}

function showResultText( text ) {

	resultBox.innerHTML = text;

}

function showSearch() {

	searchContainer.style.display = 'block';
	contentContainer.style.display = 'none';

}

function extractUrlBase( url ) {

	const index = url.lastIndexOf( '/' );

	if ( index === - 1 ) return './';

	return url.slice( 0, index + 1 );

}

async function fetchAllData() {

	const { origin, pathname } = location;

	const baseURL = extractUrlBase( pathname );

	const base = origin + baseURL;

	const url = new URL( 'data/search.json', base );
	const result = await fetch( url );
	const { list } = await result.json();

	return list;

}


function buildSearchResult( result ) {

	let output = '';
	const removeHTMLTagsRegExp = /(<([^>]+)>)/ig;

	for ( const res of result ) {

		const { title = '', description = '' } = res.item;

		const _link = res.item.link.replace( '<a href="', '' ).replace( /">.*/, '' );
		const _title = title.replace( removeHTMLTagsRegExp, '' );
		const _description = description.replace( removeHTMLTagsRegExp, '' );

		output += `
    <a href="${_link}" class="search-result-item" onclick="hideSearch()">
      <span class="search-result-item-title">${_title}</span>
      <span class="search-result-item-description">- ${_description || 'No description available.'}</span>
    </a>
    `;

	}

	return output;

}

function getSearchResult( list, keys, searchKey ) {

	const defaultOptions = {
		shouldSort: true,
		threshold: 0.4,
		location: 0,
		distance: 100,
		maxPatternLength: 32,
		minMatchCharLength: 1,
		keys: keys
	};

	const options = { ...defaultOptions };

	// eslint-disable-next-line no-undef
	const searchIndex = Fuse.createIndex( options.keys, list );

	// eslint-disable-next-line no-undef
	const fuse = new Fuse( list, options, searchIndex );

	const result = fuse.search( searchKey );

	if ( result.length > 20 ) {

		return result.slice( 0, 20 );

	}

	return result;

}

let searchData;

// eslint-disable-next-line no-unused-vars
async function search( value ) {

	if ( value === '' ) {

		hideSearch();
		return;

	}

	showSearch();

	const keys = [ 'title', 'description' ];

	if ( searchData === undefined ) {

		showResultText( 'Loading...' );

		try {

			searchData = await fetchAllData();

		} catch ( e ) {

			console.log( e );
			showResultText( 'Failed to load result.' );

			return;

		}

	}

	const result = getSearchResult( searchData, keys, value );

	if ( ! result.length ) {

		showResultText( 'No result found! Try some different combination.' );

		return;

	}

	resultBox.innerHTML = buildSearchResult( result );

}
