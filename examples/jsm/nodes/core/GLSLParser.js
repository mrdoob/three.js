/**
 * @author sunag / http://www.sunag.com.br/
 */

import { FunctionNode } from './FunctionNode.js';
import { StructNode } from './StructNode.js';
import { ConstNode } from './ConstNode.js';

import { Tokenizer } from '../parser/Tokenizer.js';
import { Analyzer } from '../parser/Analyzer.js';

export class GLSLParser {

	constructor( source ) {

		this.tokenizer = undefined;
		this.analyzer = undefined;

		if ( source !== undefined ) this.parse( source );

	}
	
	get source() {
		
		return this.tokenizer.source;
		
	}
	
	get properties() {
		
		return this.analyzer.scope.properties;
		
	}
	
	parse( source ) {
		
		this.tokenizer = new Tokenizer( source ).tokenize();
		this.analyzer = new Analyzer( this.tokenizer ).analyze();

		return this;
		
	}
	
	getMainProperty() {

		return this.properties.length > 0 ? this.properties[ this.properties.length - 1 ] : this.analyzer.scope;

	}
	
	getProperty( name ) {

		return this.analyzer.scope.findProperty( name );

	}
	
	getIncludes( prop, includes = [] ) { 
	
		for (var i = 0; i < prop.calls.length; i++) {
			
			var argument = prop.calls[i];

			if (argument.parent.isEnvironment) {
			
				includes.push( this.getNode( argument ) );
				
			}
			
		}
		
		return includes;
	
	}
	
	getMainNode() {
		
		return this.getNode( this.getMainProperty() );
		
	}
	
	getNodeByName( name ) {
		
		return this.getNode( this.getProperty( name ) );
		
	}
	
	getNode( prop ) {
		
		if (!prop.node) {

			if ( prop.isFunction ) {
				
				prop.node = new FunctionNode().fromParser( this, prop );
			
			} else if ( prop.isStruct ) {
			
				prop.node = new StructNode().fromParser( this, prop );
			
			} else {
				
				prop.node = new ConstNode().fromParser( this, prop );
				
			}
			
		}
		
		return prop.node;
		
	}

}
