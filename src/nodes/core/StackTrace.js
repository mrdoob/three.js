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

	// Pattern to extract function name, file, line, and column from different browsers
	// Chrome: "at functionName (file.js:1:2)" or "at file.js:1:2"
	// Firefox: "functionName@file.js:1:2"
	const regex = /(?:at\s+(.+?)\s+\()?(?:(.+?)@)?([^@\s()]+):(\d+):(\d+)/;

	return stack.split( '\n' )
		.map( line => {

			const match = line.match( regex );
			if ( ! match ) return null; // Skip if line format is invalid

			// Chrome: match[1], Firefox: match[2]
			const fn = match[ 1 ] || match[ 2 ] || '';
			const file = match[ 3 ].split( '?' )[ 0 ]; // Clean file name (Vite/HMR)
			const lineNum = parseInt( match[ 4 ], 10 );
			const column = parseInt( match[ 5 ], 10 );

			// Extract only the filename from full path
			const fileName = file.split( '/' ).pop();

			return {
				fn: fn,
				file: fileName,
				line: lineNum,
				column: column
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
