// Node.js script to create the 'threeSpec.json' for three.js.
//
// When used as a module defines a function that returns the spec given the
// three.js source file.

var ConstifierDir = __dirname + '/';

var fs = require( 'fs' ),
	path = require( 'path' ),

	extractConstants = require( ConstifierDir + 'extractConstants' );

function generateThreeSpec( threeJsSourceFile ) {

	var inputDir = path.resolve(
			process.cwd(), path.dirname( threeJsSourceFile ) ),

		inputModule = path.basename( threeJsSourceFile, '.js' );

	var THREE = require( inputDir + '/' + inputModule );

	return [
		{
			contextRegExpString: '^_?gl$',
			constants: JSON.parse(
				fs.readFileSync( ConstifierDir + 'webgl_constants.json', 'utf-8' ) )
		},
		{
			contextRegExpString: '^THREE$',
			constants: extractConstants( THREE )
		}
	];

}

if ( require.main === module ) {

	var threeJsSourceFile = process.argv[ 2 ],
		outputFile = process.argv[ 3 ];

	if ( threeJsSourceFile === undefined || outputFile === undefined ) {

		console.error( "Usage:\t%s %s path/to/three.js path/to/output_spec.json",
				path.basename( process.argv[ 0 ] ),
				path.basename( process.argv[ 1 ] ) );

		return;

	}

	var spec = generateThreeSpec( threeJsSourceFile );

	fs.writeFileSync( outputFile, JSON.stringify( spec, null, '\t' ), 'utf-8' );

} else {

	module.exports = generateThreeSpec;

}
