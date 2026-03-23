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
function getFilteredStack( stack ) {

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
	 *
	 * @param {Error|string|null} stackMessage - An optional stack trace to use instead of capturing a new one.
	 */
	constructor( stackMessage = null ) {

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isStackTrace = true;

		/**
		 * The stack trace.
		 *
		 * @type {Array<{fn: string, file: string, line: number, column: number}>}
		 */
		this.stack = getFilteredStack( stackMessage ? stackMessage : new Error().stack );

	}

	/**
	 * Returns a formatted location string of the top stack frame.
	 *
	 * @returns {string} The formatted stack trace message.
	 */
	getLocation() {

		if ( this.stack.length === 0 ) {

			return '[Unknown location]';

		}

		const mainStack = this.stack[ 0 ];

		const fn = mainStack.fn;
		const fnName = fn ? `"${ fn }()" at ` : '';

		return `${fnName}"${mainStack.file}:${mainStack.line}"`; // :${mainStack.column}

	}

	/**
	 * Returns the full error message including the stack trace.
	 *
	 * @param {string} message - The error message.
	 * @returns {string} The full error message with stack trace.
	 */
	getError( message ) {

		if ( this.stack.length === 0 ) {

			return message;

		}

		// Output: "Error: message\n    at functionName (file.js:line:column)"
		const stackString = this.stack.map( frame => {

			const location = `${ frame.file }:${ frame.line }:${ frame.column }`;

			if ( frame.fn ) {

				return `    at ${ frame.fn } (${ location })`;

			}

			return `    at ${ location }`;

		} ).join( '\n' );

		return `${ message }\n${ stackString }`;

	}

}

export default StackTrace;
