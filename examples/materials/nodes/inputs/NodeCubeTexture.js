/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.NodeCubeTexture = function( value, coord, bias ) {
	
	THREE.NodeInput.call( this, 'v4' );

	this.value = value;
	this.coord = coord || new THREE.NodeReflect();
	this.bias = bias;
	
};

THREE.NodeCubeTexture.prototype = Object.create( THREE.NodeInput.prototype );
THREE.NodeCubeTexture.prototype.constructor = THREE.NodeCubeTexture;

THREE.NodeCubeTexture.prototype.generate = function( builder, output ) {

	var cubetex = THREE.NodeInput.prototype.generate.call( this, builder, output, this.value.uuid, 't' );
	var coord = this.coord.build( builder, 'v3' );
	var bias = this.bias ? this.bias.build( builder, 'fv1' ) : undefined;;
	
	if (bias == undefined && builder.require.cubeTextureBias) {
		
		bias = builder.require.cubeTextureBias.build( builder, 'fv1' );
		
	}
	
	var code;

	if (bias) code = 'textureCube(' + cubetex + ',' + coord + ',' + bias + ')';
	else code = 'textureCube(' + cubetex + ',' + coord + ')';
	
	return builder.format(code, this.type, output );

};