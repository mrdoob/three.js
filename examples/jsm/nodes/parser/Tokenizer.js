/**
 * @author sunag / http://www.sunag.com.br/
 */

const SpaceRegExp = /^\s*/;
const CommentRegExp = /^\/\*.*?\*\//;
const InlineCommentRegExp = /^\/\/.*?(\n|$)/;

const PreprocessorRegExp = /^\#.*?(\n|$)/;
const NumberRegExp = /^((\.\d)|\d)(\d*)(\.)?(\d*)/;
const StringDoubleRegExp = /^(\"((?:[^"\\]|\\.)*)\")/;
const StringSingleRegExp = /^(\'((?:[^'\\]|\\.)*)\')/;
const LiteralStringRegExp = /^[A-Za-z](\w|\.)*/;
const OperatorsRegExp = new RegExp( '^(\\' + [
    '<<=', '>>=', '++', '--', '<<', '>>', '+=', '-=', '*=', '/=', '%=', '&=', '^^', '^=', '|=',
	'<=', '>=', '==', '!=', '&&', '||', 
	'(', ')', '[', ']', '{', '}', 
	'.', ',', ';', '!', '=', '~', '*', '/', '%', '+', '-', '<', '>', '&', '^', '|', '?', ':', '#'
].join('$').split('').join('\\').replace(/\\\$/g, '|') + ')' );

export class Token {
	
	constructor( tokenizer, type, str, pos ) {
		
		this.tokenizer = tokenizer;
		
		this.type = type
		
		this.str = str;
		this.pos = pos;
		
	}
	
	get endPos() {
		
		return this.pos + this.str.length;
		
	}
	
	get isPreprocessor() {
		
		return this.type === Token.PREPROCESSOR;
		
	}
	
	get isNumber() {
		
		return this.type === Token.NUMBER;
		
	}
	
	get isString() {
		
		return this.type === Token.STRING;
		
	}
	
	get isLiteralString() {
		
		return this.type === Token.LITERAL_STRING;
		
	}
	
	get isOperator() {
		
		return this.type === Token.OPERATOR;
		
	}
	
}

Token.PREPROCESSOR = 'preprocessor';
Token.NUMBER = 'number';
Token.STRING = 'string';
Token.LITERAL_STRING = 'literalString';
Token.OPERATOR = 'operator';

const TokenParserList = [
	{ type: Token.PREPROCESSOR, regexp: PreprocessorRegExp },
	{ type: Token.NUMBER, regexp: NumberRegExp },
	{ type: Token.STRING, regexp: StringDoubleRegExp, group: 2 },
	{ type: Token.STRING, regexp: StringSingleRegExp, group: 2 },
	{ type: Token.LITERAL_STRING, regexp: LiteralStringRegExp },
	{ type: Token.OPERATOR, regexp: OperatorsRegExp }
];

export class Tokenizer {
	
	constructor( source ) {
		
		this.source = source;
		this.position = 0;
		
		this.tokens = [];
		
	}
	
	tokenize() {
		
		var token = this.readToken();
		
		while ( token ) {

			this.tokens.push( token );
			
			token = this.readToken();
			
		}
		
		return this;
		
	}

	skip() {
		
		var remainingCode = this.source.substr( this.position );
		var i = arguments.length;
		
		while( i-- ) {
		
			var skip = arguments[i].exec( remainingCode );
			var skipLength = skip ? skip[0].length : 0;
			
			if (skipLength > 0) {

				this.position += skipLength;
					
				remainingCode = this.source.substr( this.position );
			
				// re-skip, new remainingCode is generated
				// maybe exist previous regexp non detected
				i = arguments.length;
					
			}
			
		}
		
		return remainingCode;
		
	}
	
	readToken() {
		
		var remainingCode = this.skip( SpaceRegExp, CommentRegExp, InlineCommentRegExp );
		
		for(var i = 0; i < TokenParserList.length; i++) {
			
			var parser = TokenParserList[i];
			var result = parser.regexp.exec( remainingCode );
			
			if (result) {
				
				var token = new Token( this, parser.type, result[ parser.group || 0 ], this.position );
				
				this.position += token.str.length;
				
				return token;
				
			}
		}

	}
	
}
