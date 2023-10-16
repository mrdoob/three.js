import { Program, FunctionDeclaration, FunctionParameter, VariableDeclaration, Operator, Number, FunctionCall, Return, Accessor } from './AST.js';

const precedenceOperators = [
	'*', '/', '%',
	'+', '-',
	'<<', '>>',
	'<', '>', '<=', '>=',
	'==', '!=',
	'&',
	'^',
	'|',
	'&&',
	'^^',
	'||'
].reverse();

const spaceRegExp = /^((\t| )\n*)+/;
const lineRegExp = /^\n+/;
const commentRegExp = /^\/\*.*?\*\//;
const inlineCommentRegExp = /^\/\/.*?(\n|$)/;

const numberRegExp = /^((\.\d)|\d)(\d*)(\.)?(\d*)/;
const stringDoubleRegExp = /^(\"((?:[^"\\]|\\.)*)\")/;
const stringSingleRegExp = /^(\'((?:[^'\\]|\\.)*)\')/;
const literalRegExp = /^[A-Za-z](\w|\.)*/;
const operatorsRegExp = new RegExp( '^(\\' + [
	'<<=', '>>=', '++', '--', '<<', '>>', '+=', '-=', '*=', '/=', '%=', '&=', '^^', '^=', '|=',
	'<=', '>=', '==', '!=', '&&', '||',
	'(', ')', '[', ']', '{', '}',
	'.', ',', ';', '!', '=', '~', '*', '/', '%', '+', '-', '<', '>', '&', '^', '|', '?', ':', '#'
].join( '$' ).split( '' ).join( '\\' ).replace( /\\\$/g, '|' ) + ')' );

class Token {

	constructor( tokenizer, type, str, pos ) {

		this.tokenizer = tokenizer;

		this.type = type;

		this.str = str;
		this.pos = pos;

		this.tag = null;

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

	readToken() {

		const remainingCode = this.skip( spaceRegExp );

		for ( var i = 0; i < TokenParserList.length; i ++ ) {

			const parser = TokenParserList[ i ];
			const result = parser.regexp.exec( remainingCode );

			if ( result ) {

				const token = new Token( this, parser.type, result[ parser.group || 0 ], this.position );

				this.position += token.str.length;

				if ( parser.isTag ) {

					const nextToken = this.readToken();

					if ( nextToken ) {

						nextToken.tag = token;

					}

					return nextToken;

				}

				return token;

			}

		}

	}

}

const isType = ( str ) => /void|bool|float|u?int|(u|i)?vec[234]/.test( str );

class GLSLDecoder {

	constructor() {

		this.index = 0;
		this.tokenizer = null;

		this.program = null;
		this.scopes = [];

	}

	get scope() {

		return this.scopes[ this.scopes.length - 1 ];

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

			if ( token.str === '(' ) groupIndex ++;
			else if ( token.str === ')' ) groupIndex --;

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

		const firstToken = tokens[ 0 ];

		// groups

		if ( firstToken.isOperator && firstToken.str === '(' ) {

			const leftTokens = this.getTokensUntil( ')', tokens );

			const left = this.parseExpressionFromTokens( leftTokens.slice( 1, leftTokens.length - 1 ) );

			const operator = tokens[ leftTokens.length + 2 ];

			if ( operator ) {

				const rightTokens = tokens.slice( leftTokens.length + 3, tokens.length );
				const right = this.parseExpressionFromTokens( rightTokens );

				return new Operator( operator.str, left, right );

			}

			return left;

		}

		// precedence operators

		let groupIndex = 0;

		for ( const operator of precedenceOperators ) {

			for ( let i = 0; i < tokens.length; i ++ ) {

				const token = tokens[ i ];
				if ( ! token.isOperator ) continue;

				if ( groupIndex === 0 && token.str === operator ) {

					const left = this.parseExpressionFromTokens( tokens.slice( 0, i ) );
					const right = this.parseExpressionFromTokens( tokens.slice( i + 1, tokens.length ) );

					return new Operator( operator, left, right );

				}

				if ( token.str === '(' ) groupIndex ++;
				else if ( token.str === ')' ) groupIndex --;

				if ( groupIndex < 0 ) {

					return this.parseExpressionFromTokens( tokens.slice( 0, i ) );

				}

			}

		}

		// primitives and accessors

		if ( firstToken.isNumber ) {

			return new Number( firstToken.str );

		} else if ( firstToken.isLiteral ) {

			const secondToken = tokens[ 1 ];

			if ( secondToken && secondToken.str === '(' ) {

				const paramsTokens = this.parseFunctionParametersFromTokens( tokens.slice( 2, tokens.length - 1 ) );

				return new FunctionCall( firstToken.str, paramsTokens );

			}

			return new Accessor( firstToken.str );

		}

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

			const type = tokens[ i ++ ];
			const name = tokens[ i ++ ];

			params.push( new FunctionParameter( type.str, name.str ) );

			if ( tokens[ i ] && tokens[ i ].str !== ',' ) throw new Error( 'Expected ","' );

		}

		return params;

	}

	parseFunction() {

		const type = this.readToken().str;
		const name = this.readToken().str;

		const paramsTokens = this.readTokensUntil( ')' );

		const params = this.parseFunctionParams( paramsTokens.splice( 1, paramsTokens.length - 2 ) );

		const func = new FunctionDeclaration( type, name, params );

		this.scopes.push( func );

		this.readToken(); // skip ')'

		this.parseBlock();

		this.scopes.pop();

		return func;

	}

	parseVariable() {

		const type = this.readToken().str;
		const name = this.readToken().str;

		const token = this.getToken();

		let init = null;

		if ( token.str === '=' ) {

			this.readToken(); // skip

			init = this.parseExpression();

		}

		const variable = new VariableDeclaration( type, name, init );

		return variable;

	}

	parseReturn() {

		this.readToken(); // skip return

		const expression = this.parseExpression();

		return new Return( expression );

	}

	parseBlock() {

		while ( this.index < this.tokens.length ) {

			const token = this.getToken();

			let statement = null;

			let groupIndex = 0;

			if ( token.isOperator && token.str === '{' ) groupIndex ++;
			else if ( token.isOperator && token.str === '}' ) groupIndex --;

			if ( groupIndex < 0 ) {

				this.readToken(); // skip '}'

				break;

			}

			//

			if ( token.isLiteral ) {

				if ( isType( token.str ) ) {

					if ( this.getToken( 2 ).str === '(' ) {

						statement = this.parseFunction();

					} else {

						statement = this.parseVariable();

					}

				} else if ( token.str === 'return' ) {

					statement = this.parseReturn();

				} else {

					statement = this.parseExpression();

				}

			}

			if ( statement ) {

				this.scope.body.push( statement );

			} else {

				this.index ++;

			}

		}

	}

	parse( source ) {

		this.index = 0;
		this.tokenizer = new Tokenizer( source ).tokenize();

		this.program = new Program();
		this.scopes = [ this.program ];

		this.parseBlock();

		return this.program;


	}

}

export default GLSLDecoder;
