import NodeFunction from '../../../nodes/core/NodeFunction.js';
import NodeFunctionInput from '../../../nodes/core/NodeFunctionInput.js';

const declarationRegexp = /^[fn]*\s*([a-z_0-9]+)?\s*\(([\s\S]*?)\)\s*[\-\>]*\s*([a-z_0-9]+)?/i;
const propertiesRegexp = /([a-z_0-9]+)\s*:\s*([a-z_0-9]+(?:<[\s\S]+?>)?)/ig;

const wgslTypeLib = {
	'f32': 'float',
	'mat2x2': 'mat2',
	'mat2x2': 'imat2',
	'mat2x2': 'umat2',
	'mat2x2': 'bmat2',

	'mat3x3': 'mat3',
	'mat3x3': 'imat3',
	'mat3x3': 'umat3',
	'mat3x3': 'bmat3',

	'mat4x4': 'mat4',
	'mat4x4': 'imat4',
	'mat4x4': 'umat4',
	'mat4x4': 'bmat4'
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

			let resolvedType = type.replace( /<[^>]+>/, '' );

			resolvedType = wgslTypeLib[ resolvedType ] || resolvedType;

			// debugger;
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
