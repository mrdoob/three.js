import NodeFunction from '../../../nodes/core/NodeFunction.js';
import NodeFunctionInput from '../../../nodes/core/NodeFunctionInput.js';

const declarationRegexp = /^[fn]*\s*([a-z_0-9]+)?\s*\(([\s\S]*?)\)\s*[\-\>]*\s*([a-z_0-9]+)?/i;
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

	'vec3<f32>': 'vec3',
	'vec3<i32>': 'ivec3',
	'vec3<u32>': 'uvec3',
	'vec3<bool>': 'bvec3',

	'vec4<f32>': 'vec4',
	'vec4<i32>': 'ivec4',
	'vec4<u32>': 'uvec4',
	'vec4<bool>': 'bvec4',

	'mat2x2<f32>': 'mat2',
	'mat2x2<i32>': 'imat2',
	'mat2x2<u32>': 'umat2',
	'mat2x2<bool>': 'bmat2',

	'mat3x3<f32>': 'mat3',
	'mat3x3<i32>': 'imat3',
	'mat3x3<u32>': 'umat3',
	'mat3x3<bool>': 'bmat3',

	'mat4x4<f32>': 'mat4',
	'mat4x4<i32>': 'imat4',
	'mat4x4<u32>': 'umat4',
	'mat4x4<bool>': 'bmat4'
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

			if ( resolvedType.startsWith( 'texture' ) ) {

				resolvedType = type.split( '<' )[ 0 ];

			}

			resolvedType = wgslTypeLib[ resolvedType ] || resolvedType;

			inputs.push( new NodeFunctionInput( resolvedType, name ) );

		}

		const blockCode = source.substring( declaration[ 0 ].length );

		const name = declaration[ 1 ] !== undefined ? declaration[ 1 ] : '';
		const type = declaration[ 3 ] || 'void';

		return {
			type,
			inputs,
			name,
			inputsCode,
			blockCode
		};

	} else {

		throw new Error( 'FunctionNode: Function is not a WGSL code.' );

	}

};

class WGSLNodeFunction extends NodeFunction {

	constructor( source ) {

		const { type, inputs, name, inputsCode, blockCode } = parse( source );

		super( type, inputs, name );

		this.inputsCode = inputsCode;
		this.blockCode = blockCode;

	}

	getCode( name = this.name ) {

		const type = this.type !== 'void' ? '-> ' + this.type : '';

		return `fn ${ name } ( ${ this.inputsCode.trim() } ) ${ type }` + this.blockCode;

	}

}

export default WGSLNodeFunction;
