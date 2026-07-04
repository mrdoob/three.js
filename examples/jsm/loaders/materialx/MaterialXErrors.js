const MaterialXErrorCodes = {
	UNSUPPORTED_NODE: 'unsupported-node',
	IGNORED_SURFACE_INPUT: 'ignored-surface-input',
	MISSING_REFERENCE: 'missing-reference',
	MISSING_MATERIAL: 'missing-material',
	INVALID_VALUE: 'invalid-value',
	UNKNOWN_INPUT: 'unknown-input',
	INVALID_OUTPUT_CONNECTION: 'invalid-output-connection',
	TYPE_MISMATCH: 'type-mismatch',
};

class MaterialXErrors {

	constructor() {

		this.errors = [];

	}

	addError( code, message, nodeName ) {

		const error = { code, message };
		if ( nodeName !== undefined && nodeName !== null ) {

			error.nodeName = nodeName;

		}

		this.errors.push( error );

	}

}

export { MaterialXErrorCodes, MaterialXErrors };
