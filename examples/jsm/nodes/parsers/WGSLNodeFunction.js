import NodeFunction from '../core/NodeFunction.js';
import NodeFunctionInput from '../core/NodeFunctionInput.js';

const declarationRegexp = /^[fn]*\s*([a-z_0-9]+)?\s*\(([\s\S]*?)\)\s*[\-\>]*\s*([a-z_0-9]+)?/i;
const propertiesRegexp = /[a-z_0-9]+/ig;

const wgslTypeLib = {
	f32: 'float'
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

		while ( i < propsMatches.length ) {

			// default

			const name = propsMatches[ i ++ ][ 0 ];
			let type = propsMatches[ i ++ ][ 0 ];

			type = wgslTypeLib[ type ] || type;

			// precision

			if ( i < propsMatches.length && /^[fui]\d{2}$/.test( propsMatches[ i ][ 0 ] ) === true )
				i ++;

			// add input

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
