const fs = require( 'fs' );
const path = require( 'path' );

const DOCS_PATH = path.join( process.cwd(), 'docs' );
const DOCS_PROPS_REGEX = /\[\s*(method|property):\w*\s(\w*\s*)\]/gi;

/**
 * Updates docs list meta in `docs/list.json`.
 */
const updateDocs = ( write ) => {

	// Get list data
	const list = JSON.parse( fs.readFileSync( path.join( DOCS_PATH, 'list.json' ), 'utf-8' ) );

	for ( const locale in list ) {

		const localList = list[ locale ];

		for ( const section in localList ) {

			const categories = localList[ section ];

			for ( const category in categories ) {

				const pages = categories[ category ];

				for ( const pageName in pages ) {

					const pageURL = pages[ pageName ].url;

					// Read doc file
					const file = fs.readFileSync(
						path.join( DOCS_PATH, `${pageURL}.html` ),
						'utf-8'
					);

					// Parse methods & properties from doc file
					const matches = file.match( DOCS_PROPS_REGEX ) || [];
					const pageData = matches.reduce(
						( output, match ) => {

							if ( ! match ) return output;

							const type = match.replace( DOCS_PROPS_REGEX, '$1' );
							const target = type === 'method' ? 'methods' : 'properties';

							const value = match.replace( DOCS_PROPS_REGEX, '$2' );
							if ( value ) output[ target ].push( value );

							return output;

						},
						{
							url: pageURL,
							methods: [],
							properties: [],
						}
					);

					pages[ pageName ] = pageData;

				}

			}

		}

	}

	if ( write ) {

		fs.writeFileSync(
			path.join( DOCS_PATH, 'list.json' ),
			JSON.stringify( list, null, '\t' )
		);

	}

	return list;

};

// Write to list.json if specified via flag
const args = process.argv.slice( 2 );
const write = args.includes( '--write' );

updateDocs( write );

process.exit( 0 );
