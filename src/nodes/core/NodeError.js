/**
 * Custom error class for node-related errors, including stack trace information.
 */
class NodeError extends Error {

	constructor( message, stackTrace = null ) {

		super( message );

		/**
		 * The name of the error.
		 *
		 * @type {string}
		 */
		this.name = 'NodeError';

		/**
		 * The stack trace associated with the error.
		 *
		 * @type {?StackTrace}
		 */
		this.stackTrace = stackTrace;

	}

}

export default NodeError;
