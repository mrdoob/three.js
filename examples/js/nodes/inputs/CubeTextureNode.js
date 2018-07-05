/**
 * @author sunag / http://www.sunag.com.br/
 */

import { InputNode } from '../core/InputNode.js';
import { ReflectNode } from '../accessors/ReflectNode.js';

function CubeTextureNode( value, coord, bias ) {

	InputNode.call( this, 'v4', { shared: true } );

	this.value = value;
	this.coord = coord || new ReflectNode();
	this.bias = bias;

};

CubeTextureNode.prototype = Object.create( InputNode.prototype );
CubeTextureNode.prototype.constructor = CubeTextureNode;
CubeTextureNode.prototype.nodeType = "CubeTexture";

CubeTextureNode.prototype.getTexture = function ( builder, output ) {

	return InputNode.prototype.generate.call( this, builder, output, this.value.uuid, 'tc' );

};

CubeTextureNode.prototype.generate = function ( builder, output ) {

	if ( output === 'samplerCube' ) {

		return this.getTexture( builder, output );

	}

	var cubetex = this.getTexture( builder, output );
	var coord = this.coord.build( builder, 'v3' );
	var bias = this.bias ? this.bias.build( builder, 'fv1' ) : undefined;

	if ( bias === undefined && builder.context.bias ) {

		bias = new builder.context.bias( this ).build( builder, 'fv1' );

	}

	var code;

	if ( bias ) code = 'texCubeBias( ' + cubetex + ', ' + coord + ', ' + bias + ' )';
	else code = 'texCube( ' + cubetex + ', ' + coord + ' )';

	code = builder.getTexelDecodingFunctionFromTexture( code, this.value );

	return builder.format( code, this.type, output );

};

CubeTextureNode.prototype.copy = function ( source ) {
			
	InputNode.prototype.copy.call( this, source );
	
	if ( source.value ) this.value = source.value;

	this.coord = source.coord;

	if ( source.bias ) this.bias = source.bias;
	
};

CubeTextureNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.value = this.value.uuid;
		data.coord = this.coord.toJSON( meta ).uuid;

		if ( this.bias ) data.bias = this.bias.toJSON( meta ).uuid;

	}

	return data;

};

export { CubeTextureNode };
