const MaterialXLogCodes = {
	UNSUPPORTED_NODE: {
		label: 'unsupported-node',
		severity: 'error',
	},
	IGNORED_SURFACE_INPUT: {
		label: 'ignored-surface-input',
		severity: 'warning',
	},
	MISSING_REFERENCE: {
		label: 'missing-reference',
		severity: 'error',
	},
	MISSING_MATERIAL: {
		label: 'missing-material',
		severity: 'error',
	},
	INVALID_VALUE: {
		label: 'invalid-value',
		severity: 'error',
	},
	UNKNOWN_INPUT: {
		label: 'unknown-input',
		severity: 'error',
	},
	INVALID_OUTPUT_CONNECTION: {
		label: 'invalid-output-connection',
		severity: 'error',
	},
	TYPE_MISMATCH: {
		label: 'type-mismatch',
		severity: 'error',
	},
};

class MaterialXLog {

	constructor() {

		this.entries = [];

	}

	get errors() {

		return this.entries.filter( ( entry ) => entry.severity === 'error' );

	}

	get warnings() {

		return this.entries.filter( ( entry ) => entry.severity === 'warning' );

	}

	add( code, message, nodeName ) {

		const entry = {
			code: code.label,
			severity: code.severity,
			message,
		};
		if ( nodeName !== undefined && nodeName !== null ) {

			entry.nodeName = nodeName;

		}

		this.entries.push( entry );

	}

}

export { MaterialXLogCodes, MaterialXLog };
