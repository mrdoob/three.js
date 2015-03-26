/**
 * GLSL Preprocessor with Caching.
 *
 * @author bhouston / http://clara.io/
 */


THREE.ShaderPreprocessor._shaderCache = {};

THREE.ShaderPreprocessor.preprocess( shaderCode, shaderName ) {

	shaderName = shaderName.replace( '.glsl', '' ); // standardize on no extensions as that is how it is in ShaderChunk.

	if( ! shaderCode ) {
		if( ! THREE.ShaderChunks[shaderName] ) {
			throw new Error( 'no shader chunk named: ' + shaderName );
		}
		shaderCode = THREE.ShaderChunks[shaderName];
	}

	if( THREE.ShaderPreprocessor._shaderCache[ shaderName ] ) {
		return THREE.ShaderPreprocessor._shaderCache[ shaderName ];
	}

	var inputLines = shaderCode.match(/[^\r\n]+/g);

	var outputLines = [];

	for( var i = 0; i < inputLines.length; i ++ ) {

		var inputLine = inputLines[i];

		var results = inputLine.match(^[\s]+#include[\s]+["<]([a-zA-Z0-9_\.]+)[">]/gmi);

		console.log( inputLine, results ); // for debugging

		if( results && results.length == 1 ) {

			var includeName = results[0];

			// recursively apply preprocessor. :)
			var includeCode = THREE.ShaderPreprocessor.preprocess( null, includeName );

			outputLines.concat( includeCode );
		}
		else {
			outputLines.concat( inputLine );
		}

	}

	var outputCode = outputLines.join( '\n' );
	THREE.ShaderPreprocessor._shaderCache[ shaderName ] = outputCode;

	return outputCode;

};
