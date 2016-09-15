/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.VarNode = function( type ) {

	THREE.GLNode.call( this, type );

};

THREE.VarNode.prototype = Object.create( THREE.GLNode.prototype );
THREE.VarNode.prototype.constructor = THREE.VarNode;

THREE.VarNode.prototype.getType = function( builder ) {

	return builder.getTypeByFormat( this.type );

};

THREE.VarNode.prototype.generate = function( builder, output ) {

	var varying = builder.material.getVar( this.uuid, this.type );

	return builder.format( varying.name, this.getType( builder ), output );

};
