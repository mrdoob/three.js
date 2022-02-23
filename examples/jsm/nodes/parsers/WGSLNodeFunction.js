import NodeFunction from '../core/NodeFunction.js';
import NodeFunctionInput from '../core/NodeFunctionInput.js';

const declarationRegexp = /^fn\s*([a-z_0-9]+)?\s*\(([\s\S]*?)\)\s*\-\>\s*([a-z_0-9]+)?/i;
const propertiesRegexp = /[a-z_0-9]+/ig;

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

		while ( i < propsMatches.length ) {

			const name = propsMatches[ i ++ ][ 0 ];
			const type = propsMatches[ i ++ ][ 0 ];

			propsMatches[ i ++ ][ 0 ]; // precision

			inputs.push( new NodeFunctionInput( type, name ) );

		}

		//

		const blockCode = source.substring( declaration[ 0 ].length );

		const name = declaration[ 1 ] !== undefined ? declaration[ 1 ] : '';
		const type = declaration[ 3 ];

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

		return `fn ${ name } ( ${ this.inputsCode.trim() } ) -> ${ this.type }` + this.blockCode;

	}

}

export default WGSLNodeFunction;
