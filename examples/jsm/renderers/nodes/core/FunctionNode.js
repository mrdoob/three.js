import CodeNode from './CodeNode.js';
import NodeFunctionInput from './NodeFunctionInput.js';
import FunctionCallNode from './FunctionCallNode.js';

const declarationRegexp = /^\s*(highp|mediump|lowp)?\s*([a-z_0-9]+)\s*([a-z_0-9]+)?\s*\((.*?)\)/i;
const propertiesRegexp = /[a-z_0-9]+/ig;

const pragmaMain = '#pragma main';

class FunctionNode extends CodeNode {

	constructor( code = '' ) {

		super( code );

		this.inputs = [];

		this.name = '';
		this.needsUpdate = true;

		this.useKeywords = true;

		this.presicion = '';

		this._includeCode = '';
		this._internalCode = '';

	}

	getType( /*builder*/ ) {

		if ( this.needsUpdate === true ) {

			this.parse();

		}

		return this.type;

	}

	getInputs( /*builder*/ ) {

		if ( this.needsUpdate === true ) {

			this.parse();

		}

		return this.inputs;

	}

	parse() {

		const code = this.code;

		const pragmaMainIndex = code.indexOf( pragmaMain );

		const mainCode = pragmaMainIndex !== - 1 ? code.substr( pragmaMainIndex + pragmaMain.length ) : code;

		const declaration = mainCode.match( declarationRegexp );

		if ( declaration !== null && declaration.length === 5 ) {

			// tokenizer

			const paramsCode = declaration[ 4 ];
			const propsMatches = [];

			let nameMatch = null;

			while ( ( nameMatch = propertiesRegexp.exec( paramsCode ) ) !== null ) {

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
				const name = propsMatches[ i ++ ][ 0 ];

				inputs.push( new NodeFunctionInput( type, name, qualifier, isConst ) );

			}

			const blockCode = mainCode.substring( declaration[ 0 ].length );

			this.name = declaration[ 3 ] !== undefined ? declaration[ 3 ] : '';
			this.type = declaration[ 2 ];

			this.presicion = declaration[ 1 ] !== undefined ? declaration[ 1 ] : '';

			this.inputs = inputs;

			this._includeCode = pragmaMainIndex !== - 1 ? code.substr( 0, pragmaMainIndex ) : '';
			this._internalCode = `( ${paramsCode} ) ${blockCode}`;

		} else {

			throw new Error( 'FunctionNode: Function is not a GLSL code.' );

		}

		this.code = code;

		this.needsUpdate = false;

	}

	call( parameters = null ) {

		return new FunctionCallNode( this, parameters );

	}

	generate( builder, output ) {

		super.generate( builder );

		const type = this.getType( builder );
		const nodeCode = builder.getCodeFromNode( this, type );

		if ( this.name !== '' ) {

			// use a custom property name

			nodeCode.name = this.name;

		}

		const propertyName = builder.getPropertyName( nodeCode );

		const presicion = this.presicion;
		const includeCode = this._includeCode;

		let code = `${type} ${propertyName} ${this._internalCode}`;

		if ( presicion !== '' ) {

			code = `${presicion} ${code}`;

		}

		if ( includeCode !== '' ) {

			code = `${includeCode} ${code}`;

		}

		nodeCode.code = code;

		if ( output === 'property' ) {

			return propertyName;

		} else {

			return builder.format( `${propertyName}()`, type, output );

		}

	}

}

export default FunctionNode;
