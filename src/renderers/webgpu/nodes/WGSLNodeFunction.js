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

	'texture_3d': 'texture3D',

	'texture_cube': 'cubeTexture',
	'texture_cube_array': 'cubeTexture',

	'texture_storage_1d': 'storageTexture',
	'texture_storage_2d': 'storageTexture',
	'texture_storage_2d_array': 'storageTexture',
	'texture_storage_3d': 'storageTexture'

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

			if ( resolvedType.startsWith( 'ptr' ) ) {

				resolvedType = 'pointer';

			} else {

				if ( resolvedType.startsWith( 'texture' ) ) {

					resolvedType = type.split( '<' )[ 0 ];

				}

				resolvedType = wgslTypeLib[ resolvedType ];

			}

			inputs.push( new NodeFunctionInput( resolvedType, name ) );

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

class WGSLNodeFunction extends NodeFunction {

	constructor( source ) {

		const { type, inputs, name, inputsCode, blockCode, outputType } = parse( source );

		super( type, inputs, name );

		this.inputsCode = inputsCode;
		this.blockCode = blockCode;
		this.outputType = outputType;

	}

	getCode( name = this.name ) {

		const outputType = this.outputType !== 'void' ? '-> ' + this.outputType : '';

		return `fn ${ name } ( ${ this.inputsCode.trim() } ) ${ outputType }` + this.blockCode;

	}

}

export default WGSLNodeFunction;
