const fs = require( 'fs' );
const path = require( 'path' );

const DOCS_IGNORE = [ 'Template', 'Polyfills' ];
const DOCS_FOLDERS = [ 'api', 'examples', 'manual' ];
const DOCS_PATH = path.join( process.cwd(), 'docs' );
const DOCS_PROPS_REGEX = /\[\s*(method|property):\w*\s(\w*\s*)\]/gi;

/**
 * Builds a flattened tree of doc endpoints.
 */
const getEndpoints = ( dir, tree = {}, level ) => {

	// Get file stats
	const isFile = fs.lstatSync( dir ).isFile();
	const baseName = path.basename( dir ).replace( '.html', '' );

	// Ignore non-html and excluded docs
	if ( isFile && ! dir.endsWith( '.html' ) ) return;
	if ( DOCS_IGNORE.includes( baseName ) ) return;

	if ( isFile ) {

		return Object.assign( tree, {
			[ level ]: baseName,
		} );

	}

	// Crawl directory
	fs.readdirSync( dir ).forEach( ( subDir ) => {

		// Scan target folders from base dir
		if ( dir === DOCS_PATH && ! DOCS_FOLDERS.includes( subDir ) ) return;

		getEndpoints( path.join( dir, subDir ), tree, dir );

	} );

	return tree;

};

/**
 * Creates a deeply-nested tree from an array of keys.
 */
const createTree = ( keys, value = {}, root = {} ) => {

	let tree = root;

	keys.forEach( ( key, index, arr ) => {

		// Create new properties with value if specified
		if ( ! tree.hasOwnProperty( key ) ) {

			tree[ key ] = index === arr.length - 1 ? value : {};

		}

		tree = tree[ key ];

	} );

	return tree;

};

/**
 * Generates a list from a target docs directory.
 */
const createList = ( dir ) => {

	// Generate list from endpoints
	const endpoints = getEndpoints( dir );
	const list = Object.entries( endpoints ).reduce( ( output, [ key, value ] ) => {

		// Get slugs from path, build web endpoint
		const slugs = key.replace( DOCS_PATH, '' ).split( /\/|\\/ ).filter( Boolean );
		const endpoint = [ ...slugs, value ].join( '/' );

		// Read doc file
		const file = fs.readFileSync(
			path.join( DOCS_PATH, `${endpoint}.html` ),
			'utf-8'
		);

		// Parse methods & properties from doc file
		const matches = file.match( DOCS_PROPS_REGEX ) || [];
		const data = matches.reduce(
			( output, match ) => {

				if ( ! match ) return output;

				const type = match.replace( DOCS_PROPS_REGEX, '$1' );
				const target = type === 'method' ? 'methods' : 'properties';

				const value = match.replace( DOCS_PROPS_REGEX, '$2' );
				if ( value ) output[ target ].push( value );

				return output;

			},
			{
				url: endpoint,
				methods: [],
				properties: [],
			}
		);

		// Create entry in JSON tree
		createTree( [ ...slugs, value ], data, output );

		return output;

	}, {} );

	return list;

};

const list = createList( DOCS_PATH );

fs.writeFileSync(
	path.join( DOCS_PATH, 'list.json' ),
	JSON.stringify( list, null, '\t' )
);

process.exit( 0 );
