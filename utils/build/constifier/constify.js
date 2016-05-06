module.exports = function constify( sourceCode, spec, debug ) {

	for ( var i = 0, n = spec.length; i !== n; ++ i ) {

		var ctxSpec = spec[ i ];
		if ( ctxSpec.contextRegExp !== undefined ) break;

		ctxSpec.contextRegExp = new RegExp( ctxSpec.contextRegExpString );

	}

	return sourceCode.replace(

		/(^|\W)(\w+)\s*\.\s*([A-Z]\w+)(?!\s*=[^=])/g,
		// matches <context> . <Id>
		// where 'Id' must refer to an uppercase identifier.
		// The construct must not be followed by '=', but may
		// be followed by '=='.

		function( match, before, context, identifier, offset ) {

			for ( var i = 0, n = spec.length; i !== n; ++ i ) {

				var ctxSpec = spec[ i ];
				if ( ! ctxSpec.contextRegExp.test( context ) ) continue;

				var value = ctxSpec.constants[ identifier ];

				if ( value != undefined ) {

					if ( debug === true ) {

						var start = offset + before.length,
							end = offset + match.length,

							lineStart =
									sourceCode.lastIndexOf( '\n', start ) + 1,
							lineEnd = sourceCode.indexOf( '\n', end );

						if ( lineEnd === -1 ) lineEnd = sourceCode.length;

						var line = sourceCode.slice( lineStart, lineEnd ),
							prefix = line.slice( 0, start - lineStart );

						line = line.replace( /\t/g, '    ' );
						prefix = prefix.replace( /\t/g, '    ' );

						console.log( line );
						console.log( ' '.repeat( prefix.length ) + '^\n' );

					}

					return before + value;

				}
				
				break;

			}

			return match; // don't replace

		} );

};

