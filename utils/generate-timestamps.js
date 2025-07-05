import { getStamps } from 'git-date-extractor';
import { glob } from 'glob';
import fs from 'fs';

( async () => {

	const outputFile = 'examples/timestamps.json';
	const filePattern = 'examples/*.html';

	console.log( 'Starting timestamp generation...' );
	console.log( `- Finding files with pattern: ${filePattern}` );

	try {

		const files = await glob( filePattern );

		if ( files.length === 0 ) {

			console.error( `Error: Glob pattern "${filePattern}" did not match any files. Please check the path.` );
			process.exit( 1 );

		}

		console.log( `- Found ${files.length} files to process.` );

		const stamps = await getStamps( {
			projectRootPath: process.cwd(),
			files: files, // Pass the explicit list of found files
		} );

		if ( Object.keys( stamps ).length === 0 ) {

			console.error( 'Error: The script received no data from git-date-extractor, even though files were found.' );
			console.error( 'This is unexpected. Please ensure your git history is not corrupt.' );
			process.exit( 1 );

		}

		const cleaned = {};
		for ( const key in stamps ) {

			const newKey = key.replace( /^examples\//, '' ).replace( /\.html$/, '' );
			cleaned[ newKey ] = stamps[ key ];

		}

		console.log( `- Successfully processed ${Object.keys( cleaned ).length} files.` );

		fs.writeFileSync( outputFile, JSON.stringify( cleaned, null, 2 ) );

		console.log( `\n✅ Successfully generated ${outputFile}` );

	} catch ( error ) {

		console.error( '\n--- SCRIPT FAILED ---' );
		console.error( 'An error occurred during timestamp generation:', error );
		console.error( '---------------------\n' );
		process.exit( 1 );

	}

} )();
