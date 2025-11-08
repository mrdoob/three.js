import { Program, FunctionDeclaration, Switch, For, AccessorElements, Ternary, Varying, DynamicElement, StaticElement, FunctionParameter, Unary, Conditional, VariableDeclaration, Operator, Number, String, FunctionCall, Return, Accessor, Uniform, Discard, SwitchCase, Continue, Break, While, Comment } from './AST.js';

import { isType } from './TranspilerUtils.js';

const unaryOperators = [
	'+', '-', '~', '!', '++', '--'
];

const arithmeticOperators = [
	'*', '/', '%', '+', '-', '<<', '>>'
];

const precedenceOperators = [
	[ ',' ],
	[ '=', '+=', '-=', '*=', '/=', '%=', '^=', '&=', '|=', '<<=', '>>=' ],
	[ '?' ],
	[ '||' ],
	[ '^^' ],
	[ '&&' ],
	[ '|' ],
	[ '^' ],
	[ '&' ],
	[ '==', '!=' ],
	[ '<', '>', '<=', '>=' ],
	[ '<<', '>>' ],
	[ '+', '-' ],
	[ '*', '/', '%' ]
];

const associativityRightToLeft = [
	'=',
	'+=', '-=', '*=', '/=', '%=', '^=', '&=', '|=', '<<=', '>>=',
	',',
	'?',
	':'
];

const glslToTSL = {
	inversesqrt: 'inverseSqrt'
};

const samplers = [ 'sampler1D', 'sampler2D', 'sampler2DArray', 'sampler2DShadow', 'sampler2DArrayShadow', 'isampler2D', 'isampler2DArray', 'usampler2D', 'usampler2DArray' ];
const samplersCube = [ 'samplerCube', 'samplerCubeShadow', 'usamplerCube', 'isamplerCube' ];
const samplers3D = [ 'sampler3D', 'isampler3D', 'usampler3D' ];

const spaceRegExp = /^((\t| )\n*)+/;
const lineRegExp = /^\n+/;
const commentRegExp = /^\/\*[\s\S]*?\*\//;
const inlineCommentRegExp = /^\/\/.*?(?=\n|$)/;

const numberRegExp = /^((0x\w+)|(\.?\d+\.?\d*((e-?\d+)|\w)?))/;
const stringDoubleRegExp = /^(\"((?:[^"\\]|\\.)*)\")/;
const stringSingleRegExp = /^(\'((?:[^'\\]|\\.)*)\')/;
const literalRegExp = /^[A-Za-z](\w|\.)*/;
const operatorsRegExp = new RegExp( '^(\\' + [
	'<<=', '>>=', '++', '--', '<<', '>>', '+=', '-=', '*=', '/=', '%=', '&=', '^^', '^=', '|=',
	'<=', '>=', '==', '!=', '&&', '||',
	'(', ')', '[', ']', '{', '}',
	'.', ',', ';', '!', '=', '~', '*', '/', '%', '+', '-', '<', '>', '&', '^', '|', '?', ':', '#'
].join( '$' ).split( '' ).join( '\\' ).replace( /\\\$/g, '|' ) + ')' );

function getFunctionName( str ) {

	return glslToTSL[ str ] || str;

}

function getGroupDelta( str ) {

	if ( str === '(' || str === '[' || str === '{' ) return 1;
	if ( str === ')' || str === ']' || str === '}' ) return - 1;

	return 0;

}

class Token {

	constructor( tokenizer, type, str, pos ) {

		this.tokenizer = tokenizer;

		this.type = type;

		this.str = str;
		this.pos = pos;

		this.isTag = false;

		this.tags = null;

	}

	get endPos() {

		return this.pos + this.str.length;

	}

	get isNumber() {

		return this.type === Token.NUMBER;

	}

	get isString() {

		return this.type === Token.STRING;

	}

	get isLiteral() {

		return this.type === Token.LITERAL;

	}

	get isOperator() {

		return this.type === Token.OPERATOR;

	}

}

Token.LINE = 'line';
Token.COMMENT = 'comment';
Token.NUMBER = 'number';
Token.STRING = 'string';
Token.LITERAL = 'literal';
Token.OPERATOR = 'operator';

const TokenParserList = [
	{ type: Token.LINE, regexp: lineRegExp, isTag: true },
	{ type: Token.COMMENT, regexp: commentRegExp, isTag: true },
	{ type: Token.COMMENT, regexp: inlineCommentRegExp, isTag: true },
	{ type: Token.NUMBER, regexp: numberRegExp },
	{ type: Token.STRING, regexp: stringDoubleRegExp, group: 2 },
	{ type: Token.STRING, regexp: stringSingleRegExp, group: 2 },
	{ type: Token.LITERAL, regexp: literalRegExp },
	{ type: Token.OPERATOR, regexp: operatorsRegExp }
];

class Tokenizer {

	constructor( source ) {

		this.source = source;
		this.position = 0;

		this.tokens = [];

	}

	tokenize() {

		let token = this.readToken();

		while ( token ) {

			this.tokens.push( token );

			token = this.readToken();

		}

		return this;

	}

	skip( ...params ) {

		let remainingCode = this.source.substr( this.position );
		let i = params.length;

		while ( i -- ) {

			const skip = params[ i ].exec( remainingCode );
			const skipLength = skip ? skip[ 0 ].length : 0;

			if ( skipLength > 0 ) {

				this.position += skipLength;

				remainingCode = this.source.substr( this.position );

				// re-skip, new remainingCode is generated
				// maybe exist previous regexp non detected
				i = params.length;

			}

		}

		return remainingCode;

	}

	nextToken() {

		const remainingCode = this.skip( spaceRegExp );

		for ( var i = 0; i < TokenParserList.length; i ++ ) {

			const parser = TokenParserList[ i ];
			const result = parser.regexp.exec( remainingCode );

			if ( result ) {

				const token = new Token( this, parser.type, result[ parser.group || 0 ], this.position );
				token.isTag = parser.isTag;

				this.position += result[ 0 ].length;

				return token;

			}

		}

	}

	readToken() {

		let token = this.nextToken();

		if ( token && token.isTag ) {

			const tags = [];

			while ( token.isTag ) {

				tags.push( token );

				token = this.nextToken();

				if ( ! token ) return;

			}

			token.tags = tags;

		}

		return token;

	}

}

class GLSLDecoder {

	constructor() {

		this.index = 0;
		this.tokenizer = null;
		this.keywords = [];

		this.addPolyfill( 'gl_FragCoord', 'vec3 gl_FragCoord = vec3( screenCoordinate.x, screenCoordinate.y.oneMinus(), screenCoordinate.z );' );

	}

	addPolyfill( name, polyfill ) {

		this.keywords.push( { name, polyfill } );

		return this;

	}

	get tokens() {

		return this.tokenizer.tokens;

	}

	readToken() {

		return this.tokens[ this.index ++ ];

	}

	getToken( offset = 0 ) {

		return this.tokens[ this.index + offset ];

	}

	getTokensUntil( str, tokens, offset = 0 ) {

		const output = [];

		let groupIndex = 0;

		for ( let i = offset; i < tokens.length; i ++ ) {

			const token = tokens[ i ];

			groupIndex += getGroupDelta( token.str );

			output.push( token );

			if ( groupIndex === 0 && token.str === str ) {

				break;

			}

		}

		return output;

	}

	readTokensUntil( str ) {

		const tokens = this.getTokensUntil( str, this.tokens, this.index );

		this.index += tokens.length;

		return tokens;

	}

	parseExpressionFromTokens( tokens ) {

		if ( tokens.length === 0 ) return null;

		const firstToken = tokens[ 0 ];
		const lastToken = tokens[ tokens.length - 1 ];

		// precedence operators

		let groupIndex = 0;

		for ( const operators of precedenceOperators ) {

			const parseToken = ( i, inverse = false ) => {

				const token = tokens[ i ];

				groupIndex += getGroupDelta( token.str );

				if ( ! token.isOperator || i === 0 || i === tokens.length - 1 ) return;

				// important for negate operator after arithmetic operator: a * -1, a * -( b )
				if ( inverse && arithmeticOperators.includes( tokens[ i - 1 ].str ) ) {

					return;

				}

				if ( groupIndex === 0 && operators.includes( token.str ) ) {

					const operator = token.str;

					if ( operator === '?' ) {

						const conditionTokens = tokens.slice( 0, i );
						const leftTokens = this.getTokensUntil( ':', tokens, i + 1 ).slice( 0, - 1 );
						const rightTokens = tokens.slice( i + leftTokens.length + 2 );

						const condition = this.parseExpressionFromTokens( conditionTokens );
						const left = this.parseExpressionFromTokens( leftTokens );
						const right = this.parseExpressionFromTokens( rightTokens );

						return new Ternary( condition, left, right );

					} else {

						const left = this.parseExpressionFromTokens( tokens.slice( 0, i ) );
						const right = this.parseExpressionFromTokens( tokens.slice( i + 1, tokens.length ) );

						return new Operator( operator, left, right );

					}

				}

				if ( inverse ) {

					if ( groupIndex > 0 ) {

						return this.parseExpressionFromTokens( tokens.slice( i ) );

					}

				} else {

					if ( groupIndex < 0 ) {

						return this.parseExpressionFromTokens( tokens.slice( 0, i ) );

					}

				}

			};

			const isRightAssociative = operators.some( op => associativityRightToLeft.includes( op ) );

			if ( isRightAssociative ) {

				for ( let i = 0; i < tokens.length; i ++ ) {

					const result = parseToken( i );

					if ( result ) return result;

				}

			} else {

				for ( let i = tokens.length - 1; i >= 0; i -- ) {

					const result = parseToken( i, true );

					if ( result ) return result;

				}

			}

		}

		// unary operators (before)

		if ( firstToken.isOperator ) {

			for ( const operator of unaryOperators ) {

				if ( firstToken.str === operator ) {

					const right = this.parseExpressionFromTokens( tokens.slice( 1 ) );

					return new Unary( operator, right );

				}

			}

		}

		// unary operators (after)

		if ( lastToken.isOperator ) {

			for ( const operator of unaryOperators ) {

				if ( lastToken.str === operator ) {

					const left = this.parseExpressionFromTokens( tokens.slice( 0, tokens.length - 1 ) );

					return new Unary( operator, left, true );

				}

			}

		}

		// groups

		if ( firstToken.str === '(' ) {

			const leftTokens = this.getTokensUntil( ')', tokens );

			const left = this.parseExpressionFromTokens( leftTokens.slice( 1, leftTokens.length - 1 ) );

			const operator = tokens[ leftTokens.length ];

			if ( operator ) {

				const rightTokens = tokens.slice( leftTokens.length + 1 );
				const right = this.parseExpressionFromTokens( rightTokens );

				return new Operator( operator.str, left, right );

			}

			return left;

		}

		// primitives and accessors

		if ( firstToken.isNumber ) {

			let type;

			const isHex = /^(0x)/.test( firstToken.str );

			if ( isHex ) type = 'int';
			else if ( /u$|U$/.test( firstToken.str ) ) type = 'uint';
			else if ( /f|e|\./.test( firstToken.str ) ) type = 'float';
			else type = 'int';

			let str = firstToken.str.replace( /u|U|i$/, '' );

			if ( isHex === false ) {

				str = str.replace( /f$/, '' );

			}

			return new Number( str, type );

		} else if ( firstToken.isString ) {

			return new String( firstToken.str );

		} else if ( firstToken.isLiteral ) {

			if ( firstToken.str === 'return' ) {

				return new Return( this.parseExpressionFromTokens( tokens.slice( 1 ) ) );

			} else if ( firstToken.str === 'discard' ) {

				return new Discard();

			} else if ( firstToken.str === 'continue' ) {

				return new Continue();

			} else if ( firstToken.str === 'break' ) {

				return new Break();

			}

			const secondToken = tokens[ 1 ];

			if ( secondToken ) {

				if ( secondToken.str === '(' ) {

					// function call

					const internalTokens = this.getTokensUntil( ')', tokens, 1 ).slice( 1, - 1 );

					const paramsTokens = this.parseFunctionParametersFromTokens( internalTokens );

					const functionCall = new FunctionCall( getFunctionName( firstToken.str ), paramsTokens );

					const accessTokens = tokens.slice( 3 + internalTokens.length );

					if ( accessTokens.length > 0 ) {

						const elements = this.parseAccessorElementsFromTokens( accessTokens );

						return new AccessorElements( functionCall, elements );

					}

					return functionCall;

				} else if ( secondToken.str === '[' ) {

					// array accessor

					const elements = this.parseAccessorElementsFromTokens( tokens.slice( 1 ) );

					return new AccessorElements( new Accessor( firstToken.str ), elements );

				}

			}

			return new Accessor( firstToken.str );

		}

	}

	parseAccessorElementsFromTokens( tokens ) {

		const elements = [];

		let currentTokens = tokens;

		while ( currentTokens.length > 0 ) {

			const token = currentTokens[ 0 ];

			if ( token.str === '[' ) {

				const accessorTokens = this.getTokensUntil( ']', currentTokens );

				const element = this.parseExpressionFromTokens( accessorTokens.slice( 1, accessorTokens.length - 1 ) );

				currentTokens = currentTokens.slice( accessorTokens.length );

				elements.push( new DynamicElement( element ) );

			} else if ( token.str === '.' ) {

				const accessorTokens = currentTokens.slice( 1, 2 );

				const element = this.parseExpressionFromTokens( accessorTokens );

				currentTokens = currentTokens.slice( 2 );

				elements.push( new StaticElement( element ) );

			} else {

				console.error( 'Unknown accessor expression', token );

				break;

			}

		}

		return elements;

	}

	parseFunctionParametersFromTokens( tokens ) {

		if ( tokens.length === 0 ) return [];

		const expression = this.parseExpressionFromTokens( tokens );
		const params = [];

		let current = expression;

		while ( current.type === ',' ) {

			params.push( current.left );

			current = current.right;

		}

		params.push( current );

		return params;

	}

	parseExpression() {

		const tokens = this.readTokensUntil( ';' );

		const exp = this.parseExpressionFromTokens( tokens.slice( 0, tokens.length - 1 ) );

		return exp;

	}

	parseFunctionParams( tokens ) {

		const params = [];

		for ( let i = 0; i < tokens.length; i ++ ) {

			const immutable = tokens[ i ].str === 'const';
			if ( immutable ) i ++;

			let qualifier = tokens[ i ].str;

			if ( /^(in|out|inout)$/.test( qualifier ) ) {

				i ++;

			} else {

				qualifier = null;

			}

			const type = tokens[ i ++ ].str;
			const name = tokens[ i ++ ].str;

			params.push( new FunctionParameter( type, name, qualifier, immutable ) );

			if ( tokens[ i ] && tokens[ i ].str !== ',' ) throw new Error( 'Expected ","' );

		}

		return params;

	}

	parseFunction() {

		const type = this.readToken().str;
		const name = this.readToken().str;

		const paramsTokens = this.readTokensUntil( ')' );

		const params = this.parseFunctionParams( paramsTokens.slice( 1, paramsTokens.length - 1 ) );
		const body = this.parseBlock();

		const func = new FunctionDeclaration( type, name, params, body );

		return func;

	}

	parseVariablesFromToken( tokens, type ) {

		let index = 0;
		const immutable = tokens[ 0 ].str === 'const';

		if ( immutable ) index ++;

		type = type || tokens[ index ++ ].str;
		const name = tokens[ index ++ ].str;

		const token = tokens[ index ];

		let init = null;
		let next = null;

		if ( token ) {

			const initTokens = this.getTokensUntil( ',', tokens, index );

			if ( initTokens[ 0 ].str === '=' ) {

				const expressionTokens = initTokens.slice( 1 );
				if ( expressionTokens[ expressionTokens.length - 1 ].str === ',' ) expressionTokens.pop();

				init = this.parseExpressionFromTokens( expressionTokens );

			}

			const nextTokens = tokens.slice( initTokens.length + ( index - 1 ) );

			if ( nextTokens[ 0 ] && nextTokens[ 0 ].str === ',' ) {

				next = this.parseVariablesFromToken( nextTokens.slice( 1 ), type );

			}

		}

		const variable = new VariableDeclaration( type, name, init, next, immutable );

		return variable;

	}

	parseVariables() {

		const tokens = this.readTokensUntil( ';' );

		return this.parseVariablesFromToken( tokens.slice( 0, tokens.length - 1 ) );

	}

	parseUniform() {

		const tokens = this.readTokensUntil( ';' );

		let type = tokens[ 1 ].str;
		const name = tokens[ 2 ].str;

		// GLSL to TSL types

		if ( samplers.includes( type ) ) type = 'texture';
		else if ( samplersCube.includes( type ) ) type = 'cubeTexture';
		else if ( samplers3D.includes( type ) ) type = 'texture3D';

		return new Uniform( type, name );

	}

	parseVarying() {

		const tokens = this.readTokensUntil( ';' );

		const type = tokens[ 1 ].str;
		const name = tokens[ 2 ].str;

		return new Varying( type, name );

	}

	parseReturn() {

		this.readToken(); // skip 'return'

		const expression = this.parseExpression();

		return new Return( expression );

	}

	parseWhile() {

		this.readToken(); // skip 'while'

		const conditionTokens = this.readTokensUntil( ')' ).slice( 1, - 1 );
		const condition = this.parseExpressionFromTokens( conditionTokens );

		let body;

		if ( this.getToken().str === '{' ) {

			body = this.parseBlock();

		} else {

			body = [ this.parseExpression() ];

		}

		const statement = new While( condition, body );

		return statement;

	}

	parseFor() {

		this.readToken(); // skip 'for'

		const forTokens = this.readTokensUntil( ')' ).slice( 1, - 1 );

		const initializationTokens = this.getTokensUntil( ';', forTokens, 0 ).slice( 0, - 1 );
		const conditionTokens = this.getTokensUntil( ';', forTokens, initializationTokens.length + 1 ).slice( 0, - 1 );
		const afterthoughtTokens = forTokens.slice( initializationTokens.length + conditionTokens.length + 2 );

		let initialization;

		if ( initializationTokens[ 0 ] && isType( initializationTokens[ 0 ].str ) ) {

			initialization = this.parseVariablesFromToken( initializationTokens );

		} else {

			initialization = this.parseExpressionFromTokens( initializationTokens );

		}

		const condition = this.parseExpressionFromTokens( conditionTokens );
		const afterthought = this.parseExpressionFromTokens( afterthoughtTokens );

		let body;

		if ( this.getToken().str === '{' ) {

			body = this.parseBlock();

		} else {

			body = [ this.parseExpression() ];

		}

		const statement = new For( initialization, condition, afterthought, body );

		return statement;

	}

	parseSwitch() {

		this.readToken(); // Skip 'switch'

		const switchDeterminantTokens = this.readTokensUntil( ')' );

		// Parse expression between parentheses. Index 1: char after '('. Index -1: char before ')'
		const discriminant = this.parseExpressionFromTokens( switchDeterminantTokens.slice( 1, - 1 ) );

		// Validate curly braces
		if ( this.getToken().str !== '{' ) {

			throw new Error( 'Expected \'{\' after switch(...) ' );

		}

		this.readToken(); // Skip '{'

		const cases = this.parseSwitchCases();

		const switchStatement = new Switch( discriminant, cases );

		return switchStatement;

	}

	parseSwitchCases() {

		const cases = [];

		let token = this.getToken();
		let conditions = null;

		const isCase = ( token ) => token.str === 'case' || token.str === 'default';

		while ( isCase( token ) ) {

			this.readToken(); // Skip 'case' or 'default'

			if ( token.str === 'case' ) {

				const caseTokens = this.readTokensUntil( ':' );
				const caseStatement = this.parseExpressionFromTokens( caseTokens.slice( 0, - 1 ) );

				conditions = conditions || [];
				conditions.push( caseStatement );

			} else {

				this.readTokensUntil( ':' ); // Skip 'default:'

				conditions = null;

			}

			token = this.getToken();

			if ( isCase( token ) ) {

				// If the next token is another case/default, continue parsing
				continue;

			}

			cases.push( new SwitchCase( this.parseBlock(), conditions ) );

			token = this.getToken();

			conditions = null;

		}

		return cases;

	}

	parseIf() {

		const parseIfExpression = () => {

			this.readToken(); // skip 'if'

			const condTokens = this.readTokensUntil( ')' );

			return this.parseExpressionFromTokens( condTokens.slice( 1, condTokens.length - 1 ) );

		};

		const parseIfBlock = () => {

			let body;

			if ( this.getToken().str === '{' ) {

				body = this.parseBlock();

			} else {

				body = [ this.parseExpression() ];

			}

			return body;

		};

		//

		// Parse the first if statement
		const conditional = new Conditional( parseIfExpression(), parseIfBlock() );

		//

		let current = conditional;

		while ( this.getToken() && this.getToken().str === 'else' ) {

			this.readToken(); // skip 'else'

			// Assign the current if/else statement as the previous within the chain of conditionals
			const previous = current;

			let expression = null;

			// If an 'else if' statement, parse the conditional within the if
			if ( this.getToken().str === 'if' ) {

				// Current conditional now equal to next conditional in the chain
				expression = parseIfExpression();

			}

			current = new Conditional( expression, parseIfBlock() );
			current.parent = previous;

			// n - 1 conditional's else statement assigned to new if/else statement
			previous.elseConditional = current;

		}

		return conditional;

	}

	parseBlock() {

		const body = [];

		const firstToken = this.getToken();

		if ( firstToken.str === '{' ) {

			this.readToken(); // skip '{'

		}

		let groupIndex = 0;

		while ( this.index < this.tokens.length ) {

			const token = this.getToken();

			let statement = null;

			groupIndex += getGroupDelta( token.str );

			if ( groupIndex === 0 && ( token.str === 'case' || token.str === 'default' ) ) {

				return body; // switch case or default statement, return body

			} else if ( groupIndex < 0 ) {

				this.readToken(); // skip '}'

				return body;

			}

			//

			if ( token.tags ) {

				let lastStatement = null;

				for ( const tag of token.tags ) {

					if ( tag.type === Token.COMMENT ) {

						const str = tag.str.replace( /\t/g, '' );

						if ( ! lastStatement || lastStatement.isComment !== true ) {

							lastStatement = new Comment( str );
							body.push( lastStatement );

						} else {

							lastStatement.comment += '\n' + str;

						}

					}

				}

			}

			if ( token.isLiteral || token.isOperator ) {

				if ( token.str === 'const' ) {

					statement = this.parseVariables();

				} else if ( token.str === 'uniform' ) {

					statement = this.parseUniform();

				} else if ( token.str === 'varying' ) {

					statement = this.parseVarying();

				} else if ( isType( token.str ) ) {

					if ( this.getToken( 2 ).str === '(' ) {

						statement = this.parseFunction();

					} else {

						statement = this.parseVariables();

					}

				} else if ( token.str === 'return' ) {

					statement = this.parseReturn();

				} else if ( token.str === 'if' ) {

					statement = this.parseIf();

				} else if ( token.str === 'for' ) {

					statement = this.parseFor();

				} else if ( token.str === 'while' ) {

					statement = this.parseWhile();

				} else if ( token.str === 'switch' ) {

					statement = this.parseSwitch();

				} else {

					statement = this.parseExpression();

				}

			}

			if ( statement ) {

				body.push( statement );

			} else {

				this.index ++;

			}

		}

		return body;

	}

	parse( source ) {

		let polyfill = '';

		for ( const keyword of this.keywords ) {

			if ( new RegExp( `(^|\\b)${ keyword.name }($|\\b)`, 'gm' ).test( source ) ) {

				polyfill += keyword.polyfill + '\n';

			}

		}

		if ( polyfill ) {

			polyfill = '// Polyfills\n\n' + polyfill + '\n';

		}

		this.index = 0;
		this.tokenizer = new Tokenizer( polyfill + source ).tokenize();

		const body = this.parseBlock();
		const program = new Program( body );

		return program;


	}

}

export default GLSLDecoder;
