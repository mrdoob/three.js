/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.VarNode = function ( type, value ) {

	THREE.GLNode.call( this, type );
	
	this.value = value;

};

THREE.VarNode.prototype = Object.create( THREE.GLNode.prototype );
THREE.VarNode.prototype.constructor = THREE.VarNode;
THREE.VarNode.prototype.nodeType = "Var";

THREE.VarNode.prototype.getType = function ( builder ) {

	return builder.getTypeByFormat( this.type );

};

THREE.VarNode.prototype.generate = function ( builder, output ) {

	var varying = builder.material.getVar( this.uuid, this.type );

	if ( this.value && builder.isShader( 'vertex' ) ) {

		builder.material.addVertexNode( varying.name + ' = ' + this.value.build( builder, this.getType( builder ) ) + ';' );

	}
	
	return builder.format( varying.name, this.getType( builder ), output );

};

THREE.VarNode.prototype.copy = function ( source ) {
	
	THREE.GLNode.prototype.copy.call( this, source );
	
	this.type = source.type;
	this.value = source.value;
	
};

THREE.VarNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.type = this.type;

		if ( this.value ) data.value = this.value.toJSON( meta ).uuid;

	}

	return data;

};
