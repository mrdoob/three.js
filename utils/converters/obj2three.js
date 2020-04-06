import fs from 'fs';
import path from 'path';

import { OBJLoader } from '../../examples/jsm/loaders/OBJLoader.js';

if ( process.argv.length <= 2 ) {

	console.log( "Usage: " + path.basename( __filename ) + " model.obj" );
	process.exit( - 1 );

}

//

const PRECISION = 6;

function parseNumber( key, value ) {

	return typeof value === 'number' ? parseFloat( value.toFixed( PRECISION ) ) : value;

}

const file = process.argv[ 2 ];
const loader = new OBJLoader();

const text = fs.readFileSync( file, 'utf8' );

const content = JSON.stringify( loader.parse( text ).toJSON(), parseNumber );
fs.writeFileSync( path.basename( file, '.obj' ) + '.json', content, 'utf8' );
