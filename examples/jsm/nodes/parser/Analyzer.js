/**
 * @author sunag / http://www.sunag.com.br/
 */

const TypeRegExp = new RegExp( '^(' + [
	'void', 
	'bool', 'int', 'uint', 'float',
	'mat2', 'mat3', 'mat4', 
	'vec2', 'vec3', 'vec4', 
	'ivec2', 'ivec3', 'ivec4',
	'bvec2', 'bvec3', 'bvec4'
].join('|') + ')$' );

const ReservedKeywordsExp = new RegExp( '^(' + [
	'break', 'continue', 'return',
	'do', 'for', 'while',
	'if', 'else'
].join('|') + ')$' );

const QualifierRegExp = /^(in|out|inout|highp|mediump|lowp|const)$/;

export class ShaderNode {
	
	constructor( token, property = undefined ) {
		
		this.token = token;
		this.property = property;
	
		this.isNode = true;
	
	}
	
}

export class ShaderProperty {
	
	constructor( parent, type, name, qualifiers = [], length = undefined ) {
		
		this.parent = parent;
			
		this.type = type;
		this.name = name;
		this.qualifiers = qualifiers;
		
		this.length = length;
		
		this.start = undefined;
		this.end = undefined;
		
		this.nameToken = undefined;
		this.typeToken = undefined;
		
		this.calls = [];
		
		this.properties = [];
		
		this.isProperty = true;
			
	}
	
	findProperty( property, findParents = true ) {
		
		var names = property.split('.');
		var name = names.shift();
		
		var prop;
		
		for(var i = 0; i < this.properties.length; i++) {
			
			if ( this.properties[i].name === name ) {
				
				prop = this.properties[i];
				
				break;
				
			}
			
		}
		
		if ( findParents && !prop && this.parent ) {
			
			prop = this.parent.findProperty( name );
			
		}
		
		if (prop && names.length > 0) {

			return prop.findProperty( names.join('.'), false );
			
		}
		
		return prop;
		
		
	}
	
	addProperty( prop ) {
		
		this.properties.push( prop );
		
	}
	
	getBlock() {
		
		var scope = this;
		
		while(scope) {
			
			if (scope.isBlock) break;
			
			scope = scope.parent;
			
		}
		
		return scope;
		
	}
	
	getName() {
		
		return this.name;
		
	}
	
	getSourceValue() {
		
		var tokenizer = this.nameToken.tokenizer;
		
		var index = tokenizer.tokens.indexOf( this.nameToken ) + 1;
		var startToken = tokenizer.tokens[ index ];
		
		if ( startToken.str === '=' ) startToken = tokenizer.tokens[ index + 1 ];
		
		return tokenizer.source.substring( startToken.pos, this.end.pos );
		
	}
	
	getSource( tree ) {
		
		var source = '';
		
		if ( tree ) {
			
			for(var i = 0; i < this.calls.length; i++) {
				
				if ( this.calls[i].parent !== this ) {
					
					source += this.calls[i].getSource( true ) + '\n\n';
					
				}
				
			}
			
		}
		
		source += this.start.tokenizer.source.substring( this.start.pos, this.end.endPos );
		
		return source;
		
	}
	
}

export class ShaderDefine extends ShaderProperty {
	
	constructor( parent, name, value ) {
		
		super( parent, 'define', name );
		
		this.value = value;
		
		this.isDefine = true;
		
	}
	
	getSourceValue() {
		
		return this.value;
		
	}
	
}

export class ShaderBlock extends ShaderProperty {
	
	constructor( parent, type, name, qualifiers ) {
		
		super( parent, type, name, qualifiers );
		
		this.nodes = [];
		
		this.isBlock = true;
		
	}
	
	addNode( node ) {
		
		node.codeBlock = this;
		
		this.nodes.push( node );
		
		return this;
		
	}
	
	
	
}

export class ShaderStruct extends ShaderBlock {
	
	constructor( parent, name ) {
		
		super( parent, name, name );
	
		this.isStruct = true;
		
	}
	
}

export class ShaderFunction extends ShaderBlock {
	
	constructor( parent, type, name, qualifiers, args = [] ) {
		
		super( parent, type, name, qualifiers );
		
		this.args = args;
		
		this.isFunction = true;
			
	}
	
}

export class ShaderEnvironment extends ShaderBlock {

	constructor( tokenizer ) {
		
		super(undefined, 'env', 'Environment');
		
		this.tokenizer = tokenizer;
		
		this.declarations = [];
		
		this.attributes = [];
		this.uniforms = [];
		
		this.isEnvironment = true;
		
	}
	
	addDeclaration( property ) {
		
		this.declarations.push( property );
		
		return this;
		
	}
	
	addAttribute( property ) {
		
		this.attributes.push( property );
		
		return this.addProperty( property );
		
	}
	
	addUniform( property ) {
		
		this.uniforms.push( property );
		
		return this.addProperty( property );
		
	}
	
	getSource() {
		
		return this.tokenizer.source;
		
	}
	
}

export class Analyzer {
	
	constructor( tokenizer ) {
		
		this.tokenizer = tokenizer;
		
		this.tokens = tokenizer.tokens;
		this.position = 0;
		
		this.env = new ShaderEnvironment( this.tokenizer );
		
		this.scope = this.env;
		
	}
	
	readToken() {
		
		return this.tokens[ this.position++ ];
		
	}
	
	readDefine( currentToken = undefined ) {

		currentToken = currentToken || this.readToken();

		var match = currentToken.str.substr(7).trim().match( /([a-z_0-9]+)\s?(.*?$)/i );

		var prop = new ShaderDefine( this.scope, match[1], match[2] );
		prop.start = currentToken;
		prop.end = currentToken;

		return prop;

	}
	
	readPropertyOrFunction( currentToken = undefined ) {
		
		var qualifiers = [];
		
		currentToken = currentToken || this.readToken();
		
		while ( QualifierRegExp.test( currentToken.str ) ) {
			
			qualifiers.push( currentToken.str );
			
			currentToken = this.readToken();
			
		}
		
		var type = currentToken;
		var name = this.readToken();

		var prop;

		var currentToken = this.getToken();

		if (currentToken.str === '(') {
			
			this.readToken();
			
			var args = [];
			
			while( this.getToken().str !== ')' ) {
				
				args.push( this.readPropertyOrFunction() );

				if (this.getToken().str === ',') this.readToken();

			}

			// skip `)` token
			this.readToken();

			prop = new ShaderFunction( this.scope, type.str, name.str, qualifiers, args );
			
		} else {
			
			var length;
			
			if (currentToken === '[') {
				
				// skip `[` token
				this.readToken();
				
				length = parseInt( this.readToken() );
				
				// skip `]` token
				this.readToken();
				
			}
			
			prop = new ShaderProperty( this.scope, type.str, name.str, qualifiers, length );
			
		}
		
		var structProp = this.scope.findProperty( type.str );
		
		if (structProp) {
			
			prop.calls.push( structProp );
			
		}
		
		prop.nameToken = name;
		prop.typeToken = type;
		
		return prop;
		
	}
	
	getToken( offset = 0 ) {
		
		return this.tokens[ this.position + offset ];
		
	}
	
	analyze() {
		
		var blockOpened = 0;
		
		var codeBlock;
		var groupBlocks = [];
		
		while(this.position < this.tokens.length) {
			
			var token = this.readToken();

			if (token.isLiteralString) {
				
				if (token.str === 'attribute') {
					
					codeBlock = this.readPropertyOrFunction();
					codeBlock.start = token;
					
					this.scope.addAttribute( codeBlock );
					this.env.addDeclaration( codeBlock );
					
				} else if (token.str === 'uniform') {
					
					codeBlock = this.readPropertyOrFunction();
					codeBlock.start = token;
					
					this.scope.addUniform( codeBlock );
					this.env.addDeclaration( codeBlock );
					
				} else if (token.str === 'struct') {
					
					var block = new ShaderStruct( this.scope, this.readToken().str );
					block.start = token;

					this.scope.addProperty( block );
					this.env.addDeclaration( block );
					
					this.scope = block;
						
					this.analyze();
					
					this.scope = block.parent;
					
					if (this.getToken().str === ';') block.end = this.getToken();
					else block.end = this.getToken(-1);
					
				} else if (this.getToken() && this.getToken().isLiteralString && ! ReservedKeywordsExp.test( token.str ) && (
						this.scope.findProperty( token.str ) instanceof ShaderStruct || QualifierRegExp.test( token.str ) || TypeRegExp.test( token.str ) ||
						this.getToken(1).str === '('
					)) {
					
					while( true ) {
					
						codeBlock = this.readPropertyOrFunction( token );
						codeBlock.start = token;
						
						groupBlocks.push( codeBlock );
						
						this.scope.addProperty( codeBlock );
						this.env.addDeclaration( codeBlock );
						
						if (this.getToken().str === ',') {
							
							// skip `,` token
							this.readToken();

						} else break;
						
					}
					
					if ( this.getToken().str === '{' ) {
						
						this.scope = codeBlock;
						
						this.analyze();
						
						this.scope = codeBlock.parent;
						
						codeBlock.end = this.getToken(-1);
						
						codeBlock = undefined;
						groupBlocks = [];
						
					}
				
				} else {
					
					var prop = this.scope.findProperty( token.str );
					
					this.scope.addNode( new ShaderNode( token, prop ) );
					
					if (prop) {
	
						if (codeBlock) codeBlock.calls.push( prop );
						
						this.scope.calls.push( prop );
						
					}
					
				}
				
			} else if (token.isOperator) {
				
				if (token.str === '}') {
					
					blockOpened--;
					
					if (blockOpened === 0) return this;
					
				} else if (token.str === '{') {
					
					blockOpened++;
					
				} else if (token.str === ';' && codeBlock) {
					
					codeBlock.end = token;
					
					for(var i = 0; i < groupBlocks.length; i++) {
						
						groupBlocks[i].start = groupBlocks[0].start;
						groupBlocks[i].end = token;
						
					}
					
					codeBlock = undefined;
					groupBlocks = [];
					
				}
				
			} else if (token.isPreprocessor) {
				
				if (token.str.indexOf( '#define' ) === 0) {
				
					var prop = this.readDefine( token );
					
					this.scope.addProperty( prop );
					this.env.addDeclaration( prop );
					
				}
				
			}
			
		}
		
		return this;
		
	}
 	
}
