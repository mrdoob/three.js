import assert from 'node:assert/strict';

import * as fflate from '../examples/jsm/libs/fflate.module.js';
import {
	gzipSync,
	strToU8,
	zlibSync,
	zipSync,
} from '../examples/jsm/libs/fflate.zip.module.js';
import {
	gunzipSync,
	strFromU8,
	unzipSync,
	unzlibSync,
} from '../examples/jsm/libs/fflate.unzip.module.js';

function assertBytesEqual( actual, expected, label ) {

	assert.deepEqual( Array.from( actual ), Array.from( expected ), label );

}

const text = 'three.js fflate split compatibility\nZIP, zlib, gzip, UTF-8: ok';
const data = strToU8( text );

assertBytesEqual( data, fflate.strToU8( text ), 'strToU8 matches the compatibility module' );
assert.equal( strFromU8( data ), fflate.strFromU8( data ), 'strFromU8 matches the compatibility module' );

const gzip = gzipSync( data, { mtime: 0 } );
const fullGzip = fflate.gzipSync( data, { mtime: 0 } );

assertBytesEqual( gzip, fullGzip, 'gzipSync matches the compatibility module' );
assertBytesEqual( gunzipSync( gzip ), data, 'gunzipSync inflates split gzip data' );
assertBytesEqual( gunzipSync( fullGzip ), fflate.gunzipSync( fullGzip ), 'gunzipSync matches the compatibility module' );

const zlib = zlibSync( data );
const fullZlib = fflate.zlibSync( data );

assertBytesEqual( zlib, fullZlib, 'zlibSync matches the compatibility module' );
assertBytesEqual( unzlibSync( zlib ), data, 'unzlibSync inflates split zlib data' );
assertBytesEqual( unzlibSync( fullZlib ), fflate.unzlibSync( fullZlib ), 'unzlibSync matches the compatibility module' );

const zipOptions = { mtime: new Date( '2020-01-01T00:00:00Z' ) };
const zip = zipSync( { 'model.usda': data }, zipOptions );
const fullZip = fflate.zipSync( { 'model.usda': data }, zipOptions );

assertBytesEqual( zip, fullZip, 'zipSync matches the compatibility module' );

const unzipped = unzipSync( zip );
const fullUnzipped = fflate.unzipSync( fullZip );

assert.deepEqual( Object.keys( unzipped ), Object.keys( fullUnzipped ), 'unzipSync returns the same file names' );
assertBytesEqual( unzipped[ 'model.usda' ], fullUnzipped[ 'model.usda' ], 'unzipSync matches the compatibility module' );
assert.equal( strFromU8( unzipped[ 'model.usda' ] ), text, 'unzipped text round trips' );

console.log( 'fflate split compatibility ok' );

