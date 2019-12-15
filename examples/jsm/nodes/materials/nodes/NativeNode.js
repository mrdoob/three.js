/**
 * @author sunag / http://www.sunag.com.br/
 */

import { 
	Node,
	NodeBuilder,
	NodeMaterial
} from '../../../nodes/Nodes.js';

function NativeNode( shader ) {

	Node.call( this );

	this.shader = shader;

}

NativeNode.prototype = Object.create( Node.prototype );
NativeNode.prototype.constructor = NativeNode;
NativeNode.prototype.nodeType = "Native";

NativeNode.prototype.getNodeParameters = function( ) {
	
	var nodes = {};
	
	nodes.color = this.color && this.color.isNode && ( this.shader === 'standard' );

	return nodes;
	
}

NativeNode.prototype.build = function ( builder ) {
	
	var material = builder.material;
	var parameters = this.getNodeParameters();
	
	this.flow = {};
	
	var code = '';
	
	if ( builder.isShader( 'vertex' ) ) {
		
	} else {
		
		if ( parameters.color ) {
			
			this.color.analyze( builder );
			
			var color = this.color.flow( builder, 'c' );
			
			code += `${color.code};\ndiffuse = ${color.result};\n`;
			
		}
		
	}
	
	return code;
	
}

export { NativeNode };
