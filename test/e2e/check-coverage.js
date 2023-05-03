import chalk from 'chalk';
import * as fs from 'fs/promises';

console.red = msg => console.log( chalk.red( msg ) );
console.green = msg => console.log( chalk.green( msg ) );

main();

async function main() {

	// examples
	const E = ( await fs.readdir( 'examples' ) )
		.filter( s => s.endsWith( '.html' ) )
		.map( s => s.slice( 0, s.indexOf( '.' ) ) )
		.filter( f => f !== 'index' );

	// screenshots
	const S = ( await fs.readdir( 'examples/screenshots' ) )
		.filter( s => s.indexOf( '.' ) !== -1 )
		.map( s => s.slice( 0, s.indexOf( '.' ) ) );

	// files.js
	const F = [];

	const files = JSON.parse( await fs.readFile( 'examples/files.json' ) );

	for ( const section of Object.values( files ) ) {

		F.push( ...section );

	}

	const subES = E.filter( x => ! S.includes( x ) );
	const subSE = S.filter( x => ! E.includes( x ) );
	const subEF = E.filter( x => ! F.includes( x ) );
	const subFE = F.filter( x => ! E.includes( x ) );

	if ( subES.length + subSE.length + subEF.length + subFE.length === 0 ) {

		console.green( 'TEST PASSED! All examples is covered with screenshots and descriptions in files.json!' );

	} else {

		if ( subES.length > 0 ) console.red( 'Make screenshot for example(s): ' + subES.join( ' ' ) );
		if ( subSE.length > 0 ) console.red( 'Remove unnecessary screenshot(s): ' + subSE.join( ' ' ) );
		if ( subEF.length > 0 ) console.red( 'Add description in files.json for example(s): ' + subEF.join( ' ' ) );
		if ( subFE.length > 0 ) console.red( 'Remove description in files.json for example(s): ' + subFE.join( ' ' ) );

		console.red( 'TEST FAILED!' );

		process.exit( 1 );

	}

}
