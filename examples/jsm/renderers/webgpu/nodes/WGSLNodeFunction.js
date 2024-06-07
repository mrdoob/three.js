import NodeFunction from '../../../nodes/core/NodeFunction.js';
import NodeFunctionInput from '../../../nodes/core/NodeFunctionInput.js';

const declarationRegexp = /^[fn]*\s*([a-z_0-9]+)?\s*\(([\s\S]*?)\)\s*[\-\>]*\s*([a-z_0-9]+)?/i;
const propertiesRegexp = /[a-z_0-9]+|<(.*?)>+/ig;

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

		// tokenizer

		const inputsCode = declaration[ 2 ];
		const propsMatches = [];

		let nameMatch = null;

		while ( ( nameMatch = propertiesRegexp.exec( inputsCode ) ) !== null ) {

			propsMatches.push( nameMatch );

		}

		// parser

		const inputs = [];

		let i = 0;

		console.log(propsMatches)

		while ( i < propsMatches.length ) {

			// default

			const name = propsMatches[ i ++ ][ 0 ];
			let type = propsMatches[ i ++ ][ 0 ];

			// precision

			if ( i < propsMatches.length && propsMatches[ i ][ 0 ].startsWith( '<' ) === true) {
				
				const elementType = propsMatches[ i++ ][ 0 ];

				// If primitive data type
				if (!elementType.includes(',')) {

					type += elementType;

				}

			}

			type = wgslTypeLib[ type ] || type;

			// add input

			console.log(name, type, i);

			inputs.push( new NodeFunctionInput( type, name ) );

		}

		//

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
