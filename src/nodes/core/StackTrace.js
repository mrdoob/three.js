// Pre-compiled RegExp patterns for ignored files
const IGNORED_FILES = [
	/^StackTrace\.js$/,
	/^TSLCore\.js$/,
	/^.*Node\.js$/,
	/^three\.webgpu.*\.js$/
];

/**
 * Parses the stack trace and filters out ignored files.
 * Returns an array with function name, file, line, and column.
 */
function getFilteredTrace( stack ) {

	// Pattern to extract: 1.Function, 2.File, 3.Line, 4.Column
	const regex = /(?:at\s+)?([^@\s(]+)?(?:@|\s\()?.*?([^/)]+):(\d+):(\d+)/;

	return stack.split( '\n' )
		.map( line => {

			const match = line.match( regex );
			if ( ! match ) return null; // Skip if line format is invalid

			return {
				fn: match[ 1 ] || 'anonymous', // Function name
				file: match[ 2 ].split( '?' )[ 0 ], // Clean file name (Vite/HMR)
				line: parseInt( match[ 3 ], 10 ), // Line number
				column: parseInt( match[ 4 ], 10 ) // Column number (Added back)
			};

		} )
		.filter( frame => {

			// Only keep frames that are valid and not in the ignore list
			return frame && ! IGNORED_FILES.some( regex => regex.test( frame.file ) );

		} );

}

/**
 * Class representing a stack trace for debugging purposes.
 */
class StackTrace {

	/**
	 * Creates a StackTrace instance by capturing and filtering the current stack trace.
	 */
	constructor() {

		this.stack = getFilteredTrace( new Error().stack );

	}

}

export default StackTrace;
