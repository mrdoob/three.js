import NodeFunction from '../core/NodeFunction.js';
import NodeFunctionInput from '../core/NodeFunctionInput.js';

const declarationRegexp = /^\s*(highp|mediump|lowp)?\s*([a-z_0-9]+)\s*([a-z_0-9]+)?\s*\(([\s\S]*?)\)/i;
const propertiesRegexp = /[a-z_0-9]+/ig;

const pragmaMain = '#pragma main';

const parse = ( source ) => {

	const pragmaMainIndex = source.indexOf( pragmaMain );

	const mainCode = pragmaMainIndex !== - 1 ? source.substr( pragmaMainIndex + pragmaMain.length ) : source;

	const declaration = mainCode.match( declarationRegexp );

	if ( declaration !== null && declaration.length === 5 ) {

		// tokenizer

		const inputsCode = declaration[ 4 ];
		const propsMatches = [];

		let nameMatch = null;

		while ( ( nameMatch = propertiesRegexp.exec( inputsCode ) ) !== null ) {

			propsMatches.push( nameMatch );

		}

		// parser

		const inputs = [];

		let i = 0;

		while ( i < propsMatches.length ) {

			const isConst = propsMatches[ i ][ 0 ] === 'const';

			if ( isConst === true ) {

				i ++;

			}

			let qualifier = propsMatches[ i ][ 0 ];

			if ( qualifier === 'in' || qualifier === 'out' || qualifier === 'inout' ) {

				i ++;

			} else {

				qualifier = '';

			}

			const type = propsMatches[ i ++ ][ 0 ];

			let count = Number.parseInt( propsMatches[ i ][ 0 ] );

			if ( Number.isNaN( count ) === false ) i ++;
			else count = null;

			const name = propsMatches[ i ++ ][ 0 ];

			inputs.push( new NodeFunctionInput( type, name, count, qualifier, isConst ) );

		}

		//

		const blockCode = mainCode.substring( declaration[ 0 ].length );

		const name = declaration[ 3 ] !== undefined ? declaration[ 3 ] : '';
		const type = declaration[ 2 ];

		const presicion = declaration[ 1 ] !== undefined ? declaration[ 1 ] : '';

		const headerCode = pragmaMainIndex !== - 1 ? source.substr( 0, pragmaMainIndex ) : '';

		return {
			type,
			inputs,
			name,
			presicion,
			inputsCode,
			blockCode,
			headerCode
		};

	} else {

		throw new Error( 'FunctionNode: Function is not a GLSL code.' );

	}

};

class GLSLNodeFunction extends NodeFunction {

	constructor( source ) {

		const { type, inputs, name, presicion, inputsCode, blockCode, headerCode } = parse( source );

		super( type, inputs, name, presicion );

		this.inputsCode = inputsCode;
		this.blockCode = blockCode;
		this.headerCode = headerCode;

	}

	getCode( name = this.name ) {

		const headerCode = this.headerCode;
		const presicion = this.presicion;

		let declarationCode = `${ this.type } ${ name } ( ${ this.inputsCode.trim() } )`;

		if ( presicion !== '' ) {

			declarationCode = `${ presicion } ${ declarationCode }`;

		}

		return headerCode + declarationCode + this.blockCode;

	}

}

export default GLSLNodeFunction;
