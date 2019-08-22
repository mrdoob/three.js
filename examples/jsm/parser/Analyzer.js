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

const QualifierRegExp = /^(in|out|inout|highp|mediump|lowp|const)$/;

class ShaderNode {
	
	isNode = true;
	
	constructor( token, property = undefined ) {
		
		this.token = token;
		this.property = property;
		
	}
	
}

class ShaderProperty {
	
	isProperty = true;
	
	start = undefined;
	end = undefined;
	
	nameToken = undefined;
	typeToken = undefined;
	
	calls = [];
	
	properties = [];
	
	constructor( parent, type, name, qualifiers = [], length = undefined ) {
		
		this.parent = parent;
			
		this.type = type;
		this.name = name;
		this.qualifiers = qualifiers;
		
		this.length = undefined;
			
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
	
	getNamespace() {
		
		var scope = this;
		
		while(scope) {
			
			if (scope.isNamespace) break;
			
			scope = scope.parent;
			
		}
		
		return scope;
		
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
		
		var ns = '';
		var scope = this.parent;
		
		while(scope) {
			
			if (scope.isNamespace) {
				
				// namespace prefix
				if (!ns) ns = 'ns_'
				
				ns = ns + scope.name + '_';
				
			}
			
			scope = scope.parent;
			
		}
		
		return ns + this.name;
		
	}
	
	getSource() {
		
		var ns = this.getNamespace();
		
		var start = this.start.pos;
		var end = this.end.endPos;
		var offset = 0;
		
		var source = this.start.tokenizer.source.substring( start, end );
		
		function replaceAt(absoluteStart, absoluteEnd, str) {
			
			var len = source.length;
			
			source = source.substring( 0, (absoluteStart - start) + offset ) + str + source.substring( (absoluteEnd - start) + offset );
			
			offset += source.length - len;
			
		}
		
		var nodes = this.nodes;
		
		if (nodes) {
		
			for(var i = 0; i < nodes.length; i++) {
				
				if (nodes[i].property) {
					
					var token = nodes[i].token;
					var realName = nodes[i].property.getName();
					
					if (token.str !== realName) {
					
						replaceAt(token.pos, token.endPos, realName);
						
					}
					
				}
				
			}
			
		}
		
		if (ns) {
			
			replaceAt(this.nameToken.pos, this.nameToken.endPos, this.getName());
			
		}

		return source;
		
	}
	
}

class ShaderBlock extends ShaderProperty {
	
	isBlock = true;
	
	nodes = []
	
	constructor( parent, type, name, qualifiers ) {
		
		super( parent, type, name, qualifiers );
		
	}
	
	addNode( node ) {
		
		this.nodes.push( node );
		
		return this;
		
	}
	
	
	
}

class ShaderNamespace extends ShaderBlock {
	
	isNamespace = true;
	
	constructor( parent, name ) {
		
		super( parent, 'namespace', name );
			
	}
	
}

class ShaderStruct extends ShaderBlock {
	
	isStruct = true;
	
	constructor( parent, name ) {
		
		super( parent, 'struct', name );
			
	}
	
}

class ShaderFunction extends ShaderBlock {
	
	isFunction = true;
	
	constructor( parent, type, name, qualifiers, args = [] ) {
		
		super( parent, type, name, qualifiers );
		
		this.args = args;
			
	}
	
}

class ShaderEnvironment extends ShaderBlock {
	
	isEnvironment = true;
	
	declarations = [];
	
	attributes = [];
	uniforms = [];
	
	constructor( tokenizer ) {
		
		super(undefined, 'env', 'Environment');
		
		this.tokenizer = tokenizer;
		
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
				
				if (token.str === 'namespace') {
					
					var block = new ShaderNamespace( this.scope, this.readToken().str );
					block.start = token;

					this.scope.addProperty( block );
					this.env.addDeclaration( block );
					
					this.scope = block;
						
					this.analyze();
					
					this.scope = block.parent;
					
					block.end = this.getToken(-1);
					
				} else if (token.str === 'attribute') {
					
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
					
				} else if (this.getToken().isLiteralString && 
					(this.scope.findProperty( token.str ) instanceof ShaderStruct || QualifierRegExp.test( token.str ) || TypeRegExp.test( token.str ))) {
					
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
				
			}
			
		}
		
		return this;
		
	}
 	
}
