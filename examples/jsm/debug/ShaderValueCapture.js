/**
 * ShaderValueCapture - Handles injection of debug visualization code into shaders
 * 
 * Supports various debug visualization modes:
 * - uvs: UV coordinates
 * - normals: Surface normals
 * - depth: Depth buffer visualization
 * - position: View-space position
 * - worldPosition: World-space position
 * - viewPosition: View direction
 * - screenSpace: Screen-space coordinates
 * - tangents: Tangent vectors
 */
class ShaderValueCapture {

	constructor() {

		this.debugModes = [
			'uvs',
			'normals',
			'depth',
			'position',
			'worldPosition',
			'viewPosition',
			'screenSpace',
			'tangents'
		];

	}

	/**
	 * Gets the debug visualization code for a specific mode.
	 * @param {string} mode - The debug mode
	 * @returns {string} GLSL code for debug visualization
	 */
	getDebugCode( mode ) {

		switch ( mode ) {

			case 'uvs':
				return `
					gl_FragColor = vec4(vDebugUv, 0.0, 1.0);
				`;

			case 'normals':
				return `
					vec3 normalColor = normalize(vDebugNormal) * 0.5 + 0.5;
					gl_FragColor = vec4(normalColor, 1.0);
				`;

			case 'depth':
				return `
					float depth = gl_FragCoord.z;
					gl_FragColor = vec4(vec3(depth), 1.0);
				`;

			case 'position':
				return `
					vec3 posColor = vDebugPosition * 0.5 + 0.5;
					gl_FragColor = vec4(posColor, 1.0);
				`;

			case 'worldPosition':
				return `
					vec3 worldPosNorm = fract(vDebugWorldPosition * 0.1);
					gl_FragColor = vec4(worldPosNorm, 1.0);
				`;

			case 'viewPosition':
				return `
					vec3 viewDir = normalize(vDebugViewPosition);
					gl_FragColor = vec4(viewDir * 0.5 + 0.5, 1.0);
				`;

			case 'screenSpace':
				return `
					vec2 screenUv = gl_FragCoord.xy / vec2(1920.0, 1080.0);
					gl_FragColor = vec4(screenUv, 0.0, 1.0);
				`;

			case 'tangents':
				return `
					#ifdef USE_TANGENT
						vec3 tangentColor = vDebugTangent * 0.5 + 0.5;
						gl_FragColor = vec4(tangentColor, 1.0);
					#else
						gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
					#endif
				`;

			default:
				return '';

		}

	}

	/**
	 * Gets the varying declarations needed for debug modes.
	 * @param {string} mode - The debug mode
	 * @returns {string} GLSL varying declarations
	 */
	getVaryingDeclarations( mode ) {

		let declarations = '';

		switch ( mode ) {

			case 'uvs':
				declarations = 'varying vec2 vDebugUv;\n';
				break;

			case 'normals':
				declarations = 'varying vec3 vDebugNormal;\n';
				break;

			case 'position':
				declarations = 'varying vec3 vDebugPosition;\n';
				break;

			case 'worldPosition':
				declarations = 'varying vec3 vDebugWorldPosition;\n';
				break;

			case 'viewPosition':
				declarations = 'varying vec3 vDebugViewPosition;\n';
				break;

			case 'tangents':
				declarations = 'varying vec3 vDebugTangent;\n';
				break;

		}

		return declarations;

	}

	/**
	 * Gets the vertex shader code to compute debug varyings.
	 * @param {string} mode - The debug mode
	 * @returns {string} GLSL vertex shader code
	 */
	getVertexDebugCode( mode ) {

		switch ( mode ) {

			case 'uvs':
				return 'vDebugUv = uv;\n';

			case 'normals':
				return 'vDebugNormal = normalize(normalMatrix * normal);\n';

			case 'position':
				return 'vDebugPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;\n';

			case 'worldPosition':
				return 'vDebugWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;\n';

			case 'viewPosition':
				return 'vDebugViewPosition = -(modelViewMatrix * vec4(position, 1.0)).xyz;\n';

			case 'tangents':
				return `
					#ifdef USE_TANGENT
						vDebugTangent = normalize(normalMatrix * tangent.xyz);
					#endif
				`;

			default:
				return '';

		}

	}

	/**
	 * Injects debug code into a vertex shader.
	 * @param {string} shader - Original vertex shader
	 * @param {string} mode - Debug mode
	 * @returns {string} Modified vertex shader
	 */
	injectVertexShader( shader, mode ) {

		if ( ! mode || mode === 'depth' || mode === 'screenSpace' ) {

			return shader;

		}

		const varyingDecl = this.getVaryingDeclarations( mode );
		const debugCode = this.getVertexDebugCode( mode );

		// Find insertion points
		let result = shader;

		// Add varying declaration after other varyings or at start
		const varyingMatch = result.match( /varying\s+\w+\s+\w+\s*;/g );
		if ( varyingMatch && varyingMatch.length > 0 ) {

			const lastVarying = varyingMatch[ varyingMatch.length - 1 ];
			const lastIndex = result.lastIndexOf( lastVarying );
			result = result.slice( 0, lastIndex + lastVarying.length ) +
				'\n' + varyingDecl +
				result.slice( lastIndex + lastVarying.length );

		} else {

			// Add after precision or at very start
			const precisionMatch = result.match( /precision\s+\w+\s+float\s*;/ );
			if ( precisionMatch ) {

				const idx = result.indexOf( precisionMatch[ 0 ] ) + precisionMatch[ 0 ].length;
				result = result.slice( 0, idx ) + '\n' + varyingDecl + result.slice( idx );

			} else {

				result = varyingDecl + result;

			}

		}

		// Add debug code before closing brace of main()
		const mainEndMatch = result.match( /void\s+main\s*\(\s*\)\s*\{[\s\S]*\}/ );
		if ( mainEndMatch ) {

			const mainBlock = mainEndMatch[ 0 ];
			const lastBrace = mainBlock.lastIndexOf( '}' );
			const insertPoint = result.indexOf( mainBlock ) + lastBrace;
			result = result.slice( 0, insertPoint ) + '\n' + debugCode + '\n' + result.slice( insertPoint );

		}

		return result;

	}

	/**
	 * Injects debug code into a fragment shader.
	 * @param {string} shader - Original fragment shader
	 * @param {string} debugCode - Debug visualization code
	 * @returns {string} Modified fragment shader
	 */
	injectFragmentShader( shader, debugCode ) {

		if ( ! debugCode ) return shader;

		let result = shader;

		// Extract mode from debug code to add appropriate varyings
		let varyingDecl = '';
		if ( debugCode.includes( 'vDebugUv' ) ) {

			varyingDecl = 'varying vec2 vDebugUv;\n';

		} else if ( debugCode.includes( 'vDebugNormal' ) ) {

			varyingDecl = 'varying vec3 vDebugNormal;\n';

		} else if ( debugCode.includes( 'vDebugPosition' ) ) {

			varyingDecl = 'varying vec3 vDebugPosition;\n';

		} else if ( debugCode.includes( 'vDebugWorldPosition' ) ) {

			varyingDecl = 'varying vec3 vDebugWorldPosition;\n';

		} else if ( debugCode.includes( 'vDebugViewPosition' ) ) {

			varyingDecl = 'varying vec3 vDebugViewPosition;\n';

		} else if ( debugCode.includes( 'vDebugTangent' ) ) {

			varyingDecl = 'varying vec3 vDebugTangent;\n';

		}

		// Add varying declaration
		if ( varyingDecl ) {

			const varyingMatch = result.match( /varying\s+\w+\s+\w+\s*;/g );
			if ( varyingMatch && varyingMatch.length > 0 ) {

				const lastVarying = varyingMatch[ varyingMatch.length - 1 ];
				const lastIndex = result.lastIndexOf( lastVarying );
				result = result.slice( 0, lastIndex + lastVarying.length ) +
					'\n' + varyingDecl +
					result.slice( lastIndex + lastVarying.length );

			} else {

				const precisionMatch = result.match( /precision\s+\w+\s+float\s*;/ );
				if ( precisionMatch ) {

					const idx = result.indexOf( precisionMatch[ 0 ] ) + precisionMatch[ 0 ].length;
					result = result.slice( 0, idx ) + '\n' + varyingDecl + result.slice( idx );

				} else {

					result = varyingDecl + result;

				}

			}

		}

		// Replace gl_FragColor assignment or add at end of main
		const fragColorMatch = result.match( /gl_FragColor\s*=\s*[^;]+;/ );
		if ( fragColorMatch ) {

			// Comment out original and add debug code
			result = result.replace(
				fragColorMatch[ 0 ],
				'// DEBUG: ' + fragColorMatch[ 0 ] + '\n' + debugCode
			);

		} else {

			// Add before closing brace of main()
			const mainEndMatch = result.match( /void\s+main\s*\(\s*\)\s*\{[\s\S]*\}/ );
			if ( mainEndMatch ) {

				const mainBlock = mainEndMatch[ 0 ];
				const lastBrace = mainBlock.lastIndexOf( '}' );
				const insertPoint = result.indexOf( mainBlock ) + lastBrace;
				result = result.slice( 0, insertPoint ) + '\n' + debugCode + '\n' + result.slice( insertPoint );

			}

		}

		return result;

	}

}

export { ShaderValueCapture };

