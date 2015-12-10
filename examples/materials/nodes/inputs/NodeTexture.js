/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.NodeTexture = function( value, coord, bias ) {
	
	THREE.NodeInput.call( this, 'v4' );
	
	this.value = value;
	this.coord = coord || new THREE.NodeUV();
	this.bias = bias;
	
};

THREE.NodeTexture.prototype = Object.create( THREE.NodeInput.prototype );
THREE.NodeTexture.prototype.constructor = THREE.NodeTexture;

THREE.NodeTexture.prototype.generate = function( builder, output ) {

	var tex = THREE.NodeInput.prototype.generate.call( this, builder, output, this.value.uuid, 't' );
	var coord = this.coord.build( builder, 'v2' );
	var bias = this.bias ? this.bias.build( builder, 'fv1' ) : undefined;
	
	var code;

	if (bias) code = 'texture2D(' + tex + ',' + coord + ',' + bias + ')';
	else code = 'texture2D(' + tex + ',' + coord + ')';
	
	return builder.format(code, this.type, output );

};
