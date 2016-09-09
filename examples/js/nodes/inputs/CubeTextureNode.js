/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.CubeTextureNode = function( value, coord, bias ) {

	THREE.CubeTextureBaseNode.call( this, value, 'v4' );

	this.coord = coord || new THREE.ReflectNode();
	this.bias = bias;

};

THREE.CubeTextureNode.prototype = Object.create( THREE.CubeTextureBaseNode.prototype );
THREE.CubeTextureNode.prototype.constructor = THREE.CubeTextureNode;

THREE.CubeTextureNode.prototype.generate = function( builder, output ) {

	var cubetex = this.getTexture( builder, output );
	var coord = this.coord.build( builder, 'v3' );
	var bias = this.bias ? this.bias.build( builder, 'fv1' ) : undefined;

	if ( bias == undefined && builder.requires.bias ) {

		bias = builder.requires.bias.build( builder, 'fv1' );

	}

	var code;

	if ( bias ) code = 'texCubeBias(' + cubetex + ',' + coord + ',' + bias + ')';
	else code = 'texCube(' + cubetex + ',' + coord + ')';

	if (builder.isSlot('color')) {
			
		code = 'mapTexelToLinear(' + code + ')';
		
	} else if (builder.isSlot('emissive')) {
		
		code = 'emissiveMapTexelToLinear(' + code + ')';
		
	} else if (builder.isSlot('environment')) {
		
		code = 'envMapTexelToLinear(' + code + ')';
		
	}
	
	return builder.format( code, this.type, output );

};
