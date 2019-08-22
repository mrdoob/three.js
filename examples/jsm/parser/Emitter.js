/**
 * @author sunag / http://www.sunag.com.br/
 */

export class Emitter {
	
	constructor( analyzer ) {
		
		this.analyzer = analyzer;
		this.scope = analyzer.env;
		
		this.flowDict = new Map();
		this.source = '';
		
	}
	
	flow( node ) {
		
		if (this.flowDict.get( node )) return;
		
		this.flowDict.set( node, true );
		
		for(var i = 0; i < node.calls.length; i++) {
			
			var callBlock = node.calls[i].getBlock();
			
			if (callBlock !== node) {
				
				this.flow( callBlock );
				
			}
			
		}
		
		this.source += node.getSource() + '\n\n';
		
	}
	
	emitArray( list ) {
		
		for(var i = 0; i < list.length; i++) {
			
			this.source += list[i].getSource() + '\n';
			
		}
		
		if ( list.length ) this.source += '\n';
		
	}
	
	inFlow( node ) {
		
		while( node && ! this.flowDict.get( node ) ) {
			
			node = node.parent;
			
		}
		
		return !!node;
		
	}
	
	unemit(name = undefined) {
		
		this.emit( name );
		
		var source = this.scope.getSource();
		var offset = 0;
		
		for(var i = 0; i < this.scope.declarations.length; i++) {
			
			var node = this.scope.declarations[i];
			
			if ( ! this.inFlow( node ) ) {
				
				var start = node.start.pos;
				var end = node.end.endPos;
				var length = end - start;
				
				source = source.substring( 0, start ) + ' '.repeat(length) + source.substring( end );
				
			}
			
		}
		
		this.source = source;
		
		return this;
		
	}
	
	emit(name = 'main') {

		var node = this.scope.findProperty( name );
		
		this.emitArray( this.scope.attributes );
		this.emitArray( this.scope.uniforms );
		
		this.flow( node );
		
		return this;
		
	}
 	
}
