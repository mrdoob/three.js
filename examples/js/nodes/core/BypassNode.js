/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.BypassNode = function ( code, value ) {

	THREE.GLNode.call( this );

	this.code = code;
	this.value = value;

};

THREE.BypassNode.prototype = Object.create( THREE.GLNode.prototype );
THREE.BypassNode.prototype.constructor = THREE.BypassNode;
THREE.BypassNode.prototype.nodeType = "Bypass";

THREE.BypassNode.prototype.getType = function ( builder ) {

	return this.value ? this.value.getType( builder ) : 'void';

};

THREE.BypassNode.prototype.generate = function ( builder, output ) {

	var code = this.code.build( builder, output ) + ';';

	if ( builder.isShader( 'fragment' ) ) {
		
		builder.material.addFragmentNode( code );
		
	} else {
		
		builder.material.addVertexNode( code );

	}

	if (this.value) {
		
		return this.value.build( builder, output );
		
	}

};

THREE.BypassNode.prototype.copy = function ( source ) {
	
	THREE.GLNode.prototype.copy.call( this, source );
	
	this.code = source.code;
	this.value = source.value;
	
};

THREE.BypassNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.code = this.code.toJSON( meta ).uuid;

		if (this.value) data.value = this.value.toJSON( meta ).uuid;

	}

	return data;

};
