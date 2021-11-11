const fs = require( 'fs' );

// examples
const E = fs.readdirSync( './examples' )
	.filter( s => s.slice( - 5 ) === '.html' )
	.map( s => s.slice( 0, s.length - 5 ) )
	.filter( f => f !== 'index' );

// screenshots
const S = fs.readdirSync( './examples/screenshots' )
	.filter( s => s.slice( - 4 ) === '.jpg' )
	.map( s => s.slice( 0, s.length - 4 ) );

// files.js
const F = [];

const files = JSON.parse( fs.readFileSync( './examples/files.json' ) );

for ( const key in files ) {

	const section = files[ key ];
	for ( let i = 0, len = section.length; i < len; i ++ ) {

		F.push( section[ i ] );

	}

}

const subES = E.filter( x => ! S.includes( x ) );
const subSE = S.filter( x => ! E.includes( x ) );
const subEF = E.filter( x => ! F.includes( x ) );
const subFE = F.filter( x => ! E.includes( x ) );

console.green = ( msg ) => console.log( `\x1b[32m${ msg }\x1b[37m` );
console.red = ( msg ) => console.log( `\x1b[31m${ msg }\x1b[37m` );

if ( subES.length + subSE.length + subEF.length + subFE.length === 0 ) {

	console.green( 'TEST PASSED! All examples is covered with screenshots and descriptions in files.js!' );

} else {

	if ( subES.length > 0 ) console.red( 'Make screenshot for example(s): ' + subES.join( ' ' ) );
	if ( subSE.length > 0 ) console.red( 'Remove unnecessary screenshot(s): ' + subSE.join( ' ' ) );
	if ( subEF.length > 0 ) console.red( 'Add description in file.js for example(s): ' + subEF.join( ' ' ) );
	if ( subFE.length > 0 ) console.red( 'Remove description in file.js for example(s): ' + subFE.join( ' ' ) );

	console.red( 'TEST FAILED!' );

	process.exit( 1 );

}
