import NodeFunction from '../../../nodes/core/NodeFunction.js';
import NodeFunctionInput from '../../../nodes/core/NodeFunctionInput.js';

const declarationRegexp = /^[fn]*\s*([a-z_0-9]+)?\s*\(([\s\S]*?)\)\s*[\-\>]*\s*([a-z_0-9]+(?:<[\s\S]+?>)?)/i;
const propertiesRegexp = /([a-z_0-9]+)\s*:\s*([a-z_0-9]+(?:<[\s\S]+?>)?)/ig;

const wgslTypeLib = {
	'f32': 'float',
	'i32': 'int',
	'u32': 'uint',
	'bool': 'bool',

	'vec2<f32>': 'vec2',
 	'vec2<i32>': 'ivec2',
 	'vec2<u32>': 'uvec2',
 	'vec2<bool>': 'bvec2',

	'vec2f': 'vec2',
	'vec2i': 'ivec2',
	'vec2u': 'uvec2',
	'vec2b': 'bvec2',

	'vec3<f32>': 'vec3',
	'vec3<i32>': 'ivec3',
	'vec3<u32>': 'uvec3',
	'vec3<bool>': 'bvec3',

	'vec3f': 'vec3',
	'vec3i': 'ivec3',
	'vec3u': 'uvec3',
	'vec3b': 'bvec3',

	'vec4<f32>': 'vec4',
	'vec4<i32>': 'ivec4',
	'vec4<u32>': 'uvec4',
	'vec4<bool>': 'bvec4',

	'vec4f': 'vec4',
	'vec4i': 'ivec4',
	'vec4u': 'uvec4',
	'vec4b': 'bvec4',

	'mat2x2<f32>': 'mat2',
	'mat2x2f': 'mat2',

	'mat3x3<f32>': 'mat3',
	'mat3x3f': 'mat3',

	'mat4x4<f32>': 'mat4',
	'mat4x4f': 'mat4',

	'sampler': 'sampler',

	'texture_1d': 'texture',

	'texture_2d': 'texture',
	'texture_2d_array': 'texture',
	'texture_multisampled_2d': 'cubeTexture',

	'texture_depth_2d': 'depthTexture',
	'texture_depth_2d_array': 'depthTexture',
	'texture_depth_multisampled_2d': 'depthTexture',
	'texture_depth_cube': 'depthTexture',
	'texture_depth_cube_array': 'depthTexture',

	'texture_3d': 'texture3D',

	'texture_cube': 'cubeTexture',
	'texture_cube_array': 'cubeTexture',

	'texture_storage_1d': 'storageTexture',
	'texture_storage_2d': 'storageTexture',
	'texture_storage_2d_array': 'storageTexture',
	'texture_storage_3d': 'storageTexture'

};

/**
 * Parses a storage pointer type like "ptr<storage, array<vec3f>, read>" and extracts metadata.
 *
 * @param {string} ptrType - The full ptr type string.
 * @return {Object|null} Object with { storageAccess, baseType } or null if not a storage pointer.
 */
const parseStoragePointer = ( ptrType ) => {

	// Match ptr<storage, TYPE, ACCESS> or ptr<storage, TYPE>
	const match = ptrType.match( /^ptr\s*<\s*storage\s*,\s*(.+?)(?:\s*,\s*(read|write|read_write))?\s*>$/i );

	if ( match ) {

		return {
			baseType: match[ 1 ].trim(),
			storageAccess: match[ 2 ] || 'read'
		};

	}

	return null;

};

const parse = ( source ) => {

	source = source.trim();

	const declaration = source.match( declarationRegexp );

	if ( declaration !== null && declaration.length === 4 ) {

		const inputsCode = declaration[ 2 ];
		const propsMatches = [];
		let match = null;

		while ( ( match = propertiesRegexp.exec( inputsCode ) ) !== null ) {

			propsMatches.push( { name: match[ 1 ], type: match[ 2 ] } );

		}

		// Process matches to correctly pair names and types
		const inputs = [];
		for ( let i = 0; i < propsMatches.length; i ++ ) {

			const { name, type } = propsMatches[ i ];

			let resolvedType = type;
			let storagePointerInfo = null;

			if ( resolvedType.startsWith( 'ptr' ) ) {

				// Check if it's a storage pointer
				storagePointerInfo = parseStoragePointer( type );

				if ( storagePointerInfo !== null ) {

					// Storage pointer - mark as special type
					resolvedType = 'storagePointer';

				} else {

					// Other pointer types (function, private, workgroup)
					resolvedType = 'pointer';

				}

			} else {

				if ( resolvedType.startsWith( 'texture' ) ) {

					resolvedType = type.split( '<' )[ 0 ];

				}

				resolvedType = wgslTypeLib[ resolvedType ];

			}

			const input = new NodeFunctionInput( resolvedType, name );

			// Store storage pointer metadata if applicable
			if ( storagePointerInfo !== null ) {

				input.storageAccess = storagePointerInfo.storageAccess;
				input.storageBaseType = storagePointerInfo.baseType;

			}

			inputs.push( input );

		}

		const blockCode = source.substring( declaration[ 0 ].length );
		const outputType = declaration[ 3 ] || 'void';

		const name = declaration[ 1 ] !== undefined ? declaration[ 1 ] : '';
		const type = wgslTypeLib[ outputType ] || outputType;

		return {
			type,
			inputs,
			name,
			inputsCode,
			blockCode,
			outputType
		};

	} else {

		throw new Error( 'FunctionNode: Function is not a WGSL code.' );

	}

};

/**
 * This class represents a WSL node function.
 *
 * @augments NodeFunction
 */
class WGSLNodeFunction extends NodeFunction {

	/**
	 * Constructs a new WGSL node function.
	 *
	 * @param {string} source - The WGSL source.
	 */
	constructor( source ) {

		const { type, inputs, name, inputsCode, blockCode, outputType } = parse( source );

		super( type, inputs, name );

		this.inputsCode = inputsCode;
		this.blockCode = blockCode;
		this.outputType = outputType;

	}

	/**
	 * This method returns the WGSL code of the node function.
	 *
	 * @param {string} [name=this.name] - The function's name.
	 * @param {Object} [storageBindingMap=null] - Map of storage pointer parameter names to their bound variable names.
	 * @return {string} The shader code.
	 */
	getCode( name = this.name, storageBindingMap = null ) {

		const outputType = this.outputType !== 'void' ? '-> ' + this.outputType : '';

		let inputsCode = this.inputsCode.trim();
		let blockCode = this.blockCode;

		// If we have storage bindings, filter them from the parameter list
		// and replace references in the function body
		if ( storageBindingMap !== null && Object.keys( storageBindingMap ).length > 0 ) {

			// Build list of non-storage parameters
			// Split by comma but respect angle bracket nesting (for types like texture_storage_3d<r32float, write>)
			const filteredParams = [];
			const storageParamNames = new Set();
			const inputParts = [];
			let depth = 0;
			let current = '';

			for ( let i = 0; i < inputsCode.length; i ++ ) {

				const char = inputsCode[ i ];

				if ( char === '<' ) {

					depth ++;
					current += char;

				} else if ( char === '>' ) {

					depth --;
					current += char;

				} else if ( char === ',' && depth === 0 ) {

					inputParts.push( current.trim() );
					current = '';

				} else {

					current += char;

				}

			}

			if ( current.trim() !== '' ) {

				inputParts.push( current.trim() );

			}

			for ( const part of inputParts ) {

				const trimmed = part.trim();
				if ( trimmed === '' ) continue;

				// Extract parameter name
				const colonIndex = trimmed.indexOf( ':' );
				if ( colonIndex === - 1 ) continue;

				const paramName = trimmed.substring( 0, colonIndex ).trim();

				// Check if this is a storage pointer parameter (either in map or has ptr<storage type)
				const paramType = trimmed.substring( colonIndex + 1 ).trim();
				const isStoragePtr = storageBindingMap[ paramName ] !== undefined ||
					( paramType.startsWith( 'ptr' ) && paramType.includes( 'storage' ) );

				if ( isStoragePtr ) {

					storageParamNames.add( paramName );
					continue;

				}

				filteredParams.push( trimmed );

			}

			inputsCode = filteredParams.join( ', ' );

			// Replace storage pointer parameter references in the body
			// The user's code may use (*param)[i] or param[i] syntax
			// Note: boundName already includes '.value' from WGSLNodeBuilder.getPropertyName()
			for ( const paramName in storageBindingMap ) {

				const boundName = storageBindingMap[ paramName ];

				// Replace (*paramName) with boundName (dereferenced array access)
				// boundName is already "NodeBuffer_XXX.value"
				blockCode = blockCode.replace(
					new RegExp( '\\(\\s*\\*\\s*' + paramName + '\\s*\\)', 'g' ),
					boundName
				);

				// Replace direct paramName references with boundName
				// Use word boundary to avoid partial matches
				blockCode = blockCode.replace(
					new RegExp( '\\b' + paramName + '\\b', 'g' ),
					boundName
				);

			}

			// Also remove storage arguments from function calls within the body
			// This handles calls like: someFunc(storageArg, otherArg) -> someFunc(otherArg)
			// We need to remove arguments that are now global bindings
			for ( const paramName in storageBindingMap ) {

				const boundName = storageBindingMap[ paramName ];

				// Remove as first argument: func( boundName, ... ) -> func( ... )
				blockCode = blockCode.replace(
					new RegExp( '(\\w+\\s*\\()\\s*' + this._escapeRegex( boundName ) + '\\s*,\\s*', 'g' ),
					'$1'
				);

				// Remove as middle argument: func( ..., boundName, ... ) -> func( ..., ... )
				blockCode = blockCode.replace(
					new RegExp( ',\\s*' + this._escapeRegex( boundName ) + '\\s*,', 'g' ),
					','
				);

				// Remove as last argument: func( ..., boundName ) -> func( ... )
				blockCode = blockCode.replace(
					new RegExp( ',\\s*' + this._escapeRegex( boundName ) + '\\s*\\)', 'g' ),
					')'
				);

				// Remove as only argument: func( boundName ) -> func( )
				blockCode = blockCode.replace(
					new RegExp( '(\\w+\\s*\\()\\s*' + this._escapeRegex( boundName ) + '\\s*\\)', 'g' ),
					'$1)'
				);

			}

		}

		return `fn ${ name } ( ${ inputsCode } ) ${ outputType }` + blockCode;

	}

	/**
	 * Escapes special regex characters in a string.
	 * @private
	 */
	_escapeRegex( str ) {

		return str.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );

	}

}

export default WGSLNodeFunction;
