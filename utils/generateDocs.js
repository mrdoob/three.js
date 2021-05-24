const fs = require( 'fs' );
const path = require( 'path' );

const DOCS_FOLDERS = [ 'api', 'examples', 'manual' ];
const DOCS_IGNORE = [ 'Template', 'Polyfills' ];
const DOCS_PATH = path.join( process.cwd(), 'docs' );

/**
 * Builds a flattened tree of doc endpoints.
 *
 * @param {String} dir Target directory to build tree from.
 * @param {Object} [tree] Base tree to write to.
 * @param {String} [level] Accumulated parent directory.
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
	fs.readdirSync( dir ).map( ( subDir ) => {

		// Scan target folders from base dir
		if ( dir === DOCS_PATH && ! DOCS_FOLDERS.includes( subDir ) ) return;

		getEndpoints( path.join( dir, subDir ), tree, dir );

	} );

	return tree;

};

/**
 * Generates a list from a target docs directory.
 *
 * @param {String} dir Docs directory to scan.
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
		const matches =
			file.match( /\[\s*(method|property):\w*\s(\w*\s*)\]/gi ) || [];
		const data = matches.reduce(
			( output, match ) => {

				if ( ! match ) return output;

				const type = match.replace( /\[\s*(\w+):\w*\s(\w*\s*)\]/gi, '$1' );
				const target = type === 'method' ? 'methods' : 'properties';

				const value = match.replace( /\[\s*(\w+):\w*\s(\w*\s*)\]/gi, '$2' );
				if ( value ) output[ target ].push( value );

				return output;

			},
			{
				url: endpoint,
				methods: [],
				properties: [],
			}
		);

		// Create JSON tree
		let root = output;
		[ ...slugs, value ].forEach( ( slug ) => {

			if ( ! root.hasOwnProperty( slug ) ) root[ slug ] = slug === value ? data : {};

			root = root[ slug ];

		} );

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
