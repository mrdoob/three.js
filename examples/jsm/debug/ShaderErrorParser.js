/**
 * ShaderErrorParser - Parses and formats shader compilation errors
 * 
 * Provides structured error information with line numbers, messages,
 * and helpful suggestions for common GLSL errors.
 */
class ShaderErrorParser {

	constructor() {

		// Common error patterns and suggestions
		this.errorPatterns = [
			{
				pattern: /undeclared identifier/i,
				suggestion: 'Check variable declarations. Make sure the variable is declared before use.'
			},
			{
				pattern: /syntax error/i,
				suggestion: 'Check for missing semicolons, brackets, or typos.'
			},
			{
				pattern: /type mismatch/i,
				suggestion: 'Ensure operand types match. Use explicit type conversions if needed.'
			},
			{
				pattern: /undefined variable/i,
				suggestion: 'Variable not declared. Check spelling and scope.'
			},
			{
				pattern: /no matching function/i,
				suggestion: 'Check function name and argument types.'
			},
			{
				pattern: /cannot convert/i,
				suggestion: 'Use explicit type casting: float(), int(), vec3(), etc.'
			},
			{
				pattern: /gl_FragColor/i,
				suggestion: 'gl_FragColor is deprecated in GLSL ES 3.0+. Use "out vec4 fragColor" instead.'
			}
		];

	}

	/**
	 * Parses shader error logs.
	 * @param {string} vertexLog - Vertex shader error log
	 * @param {string} fragmentLog - Fragment shader error log
	 * @param {string} programLog - Program linking error log
	 * @returns {Object} Structured error information
	 */
	parse( vertexLog, fragmentLog, programLog ) {

		const result = {
			hasErrors: false,
			hasWarnings: false,
			vertexErrors: [],
			vertexWarnings: [],
			fragmentErrors: [],
			fragmentWarnings: [],
			linkingErrors: [],
			raw: {
				vertex: vertexLog || '',
				fragment: fragmentLog || '',
				program: programLog || ''
			}
		};

		// Parse vertex shader log
		if ( vertexLog ) {

			const parsed = this._parseLog( vertexLog );
			result.vertexErrors = parsed.errors;
			result.vertexWarnings = parsed.warnings;

		}

		// Parse fragment shader log
		if ( fragmentLog ) {

			const parsed = this._parseLog( fragmentLog );
			result.fragmentErrors = parsed.errors;
			result.fragmentWarnings = parsed.warnings;

		}

		// Parse program log
		if ( programLog ) {

			const parsed = this._parseLog( programLog );
			result.linkingErrors = parsed.errors;

		}

		result.hasErrors = result.vertexErrors.length > 0 ||
			result.fragmentErrors.length > 0 ||
			result.linkingErrors.length > 0;

		result.hasWarnings = result.vertexWarnings.length > 0 ||
			result.fragmentWarnings.length > 0;

		return result;

	}

	/**
	 * Parses a single shader log.
	 * @private
	 * @param {string} log - Shader compilation log
	 * @returns {Object} Parsed errors and warnings
	 */
	_parseLog( log ) {

		const errors = [];
		const warnings = [];

		if ( ! log || log.trim() === '' ) {

			return { errors, warnings };

		}

		// Common log formats:
		// ERROR: 0:10: 'variable' : undeclared identifier
		// WARNING: 0:5: 'precision' : not supported
		// 0:10(15): error: ...
		const lines = log.split( '\n' );

		for ( const line of lines ) {

			if ( ! line.trim() ) continue;

			// Try different formats
			let match = line.match( /ERROR:\s*(\d+):(\d+):\s*(.+)/i );
			if ( match ) {

				errors.push( {
					line: parseInt( match[ 2 ] ),
					column: 0,
					message: match[ 3 ].trim(),
					raw: line
				} );
				continue;

			}

			match = line.match( /WARNING:\s*(\d+):(\d+):\s*(.+)/i );
			if ( match ) {

				warnings.push( {
					line: parseInt( match[ 2 ] ),
					column: 0,
					message: match[ 3 ].trim(),
					raw: line
				} );
				continue;

			}

			// Alternative format: 0:10(15): error: message
			match = line.match( /(\d+):(\d+)\((\d+)\):\s*(error|warning):\s*(.+)/i );
			if ( match ) {

				const entry = {
					line: parseInt( match[ 2 ] ),
					column: parseInt( match[ 3 ] ),
					message: match[ 5 ].trim(),
					raw: line
				};

				if ( match[ 4 ].toLowerCase() === 'error' ) {

					errors.push( entry );

				} else {

					warnings.push( entry );

				}
				continue;

			}

			// Generic error detection
			if ( line.toLowerCase().includes( 'error' ) ) {

				const lineMatch = line.match( /:(\d+):/);
				errors.push( {
					line: lineMatch ? parseInt( lineMatch[ 1 ] ) : 0,
					column: 0,
					message: line.trim(),
					raw: line
				} );

			} else if ( line.toLowerCase().includes( 'warning' ) ) {

				const lineMatch = line.match( /:(\d+):/);
				warnings.push( {
					line: lineMatch ? parseInt( lineMatch[ 1 ] ) : 0,
					column: 0,
					message: line.trim(),
					raw: line
				} );

			}

		}

		return { errors, warnings };

	}

	/**
	 * Gets suggestions for an error message.
	 * @param {string} message - Error message
	 * @param {number} line - Error line number
	 * @param {string} shaderSource - Shader source code
	 * @returns {Object} Hints and documentation links
	 */
	getErrorSuggestions( message, line, shaderSource ) {

		const hints = [];
		const documentation = [];

		// Check against known patterns
		for ( const pattern of this.errorPatterns ) {

			if ( pattern.pattern.test( message ) ) {

				hints.push( pattern.suggestion );

			}

		}

		// Add generic hints based on context
		if ( shaderSource && line > 0 ) {

			const lines = shaderSource.split( '\n' );
			if ( line <= lines.length ) {

				const errorLine = lines[ line - 1 ];

				// Check for common issues
				if ( errorLine && ! errorLine.trim().endsWith( ';' ) &&
					! errorLine.trim().endsWith( '{' ) &&
					! errorLine.trim().endsWith( '}' ) &&
					! errorLine.trim().startsWith( '//' ) &&
					! errorLine.trim().startsWith( '#' ) ) {

					hints.push( 'Line may be missing a semicolon.' );

				}

			}

		}

		// Add documentation links
		documentation.push( {
			title: 'GLSL Reference',
			url: 'https://www.khronos.org/opengl/wiki/Core_Language_(GLSL)'
		} );

		documentation.push( {
			title: 'three.js ShaderMaterial',
			url: 'https://threejs.org/docs/#api/en/materials/ShaderMaterial'
		} );

		return { hints, documentation };

	}

	/**
	 * Formats errors for display.
	 * @param {Object} parsed - Parsed error object from parse()
	 * @returns {string} Formatted error string
	 */
	format( parsed ) {

		let output = '';

		if ( parsed.vertexErrors.length > 0 ) {

			output += '=== Vertex Shader Errors ===\n';
			parsed.vertexErrors.forEach( e => {

				output += `Line ${e.line}: ${e.message}\n`;

			} );
			output += '\n';

		}

		if ( parsed.fragmentErrors.length > 0 ) {

			output += '=== Fragment Shader Errors ===\n';
			parsed.fragmentErrors.forEach( e => {

				output += `Line ${e.line}: ${e.message}\n`;

			} );
			output += '\n';

		}

		if ( parsed.linkingErrors.length > 0 ) {

			output += '=== Linking Errors ===\n';
			parsed.linkingErrors.forEach( e => {

				output += `${e.message}\n`;

			} );
			output += '\n';

		}

		if ( parsed.vertexWarnings.length > 0 || parsed.fragmentWarnings.length > 0 ) {

			output += '=== Warnings ===\n';
			[ ...parsed.vertexWarnings, ...parsed.fragmentWarnings ].forEach( w => {

				output += `Line ${w.line}: ${w.message}\n`;

			} );

		}

		return output || 'No errors found.';

	}

}

export { ShaderErrorParser };

