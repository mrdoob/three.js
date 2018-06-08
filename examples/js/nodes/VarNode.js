/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.VarNode = function ( type ) {

	THREE.GLNode.call( this, type );

};

THREE.VarNode.prototype = Object.create( THREE.GLNode.prototype );
THREE.VarNode.prototype.constructor = THREE.VarNode;
THREE.VarNode.prototype.nodeType = "Var";

THREE.VarNode.prototype.getType = function ( builder ) {

	return builder.getTypeByFormat( this.type );

};

THREE.VarNode.prototype.generate = function ( builder, output ) {

	var varying = builder.material.getVar( this.uuid, this.type );

	return builder.format( varying.name, this.getType( builder ), output );

};

THREE.VarNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.out = this.type;

	}

	return data;

};
