const fs = require( 'fs' );
const path = require( 'path' );
const glob = require( 'glob' );

const paths = glob.sync( path.resolve( __dirname, '../examples/jsm/**/*.js' ) );
paths.forEach( p => {

	const content = fs.readFileSync( p, { encoding: 'utf8' } );
	const bareContent = content.replace( /(\.\.\/){2,}build\/three.module.js/g, 'three' );
	fs.writeFileSync( p, bareContent, { encoding: 'utf8' } );

} );
