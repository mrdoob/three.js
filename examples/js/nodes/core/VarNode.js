/**
 * @author sunag / http://www.sunag.com.br/
 */

import { GLNode } from './GLNode.js';

function VarNode( type, value ) {

	GLNode.call( this, type );
	
	this.value = value;

};

VarNode.prototype = Object.create( GLNode.prototype );
VarNode.prototype.constructor = VarNode;
VarNode.prototype.nodeType = "Var";

VarNode.prototype.getType = function ( builder ) {

	return builder.getTypeByFormat( this.type );

};

VarNode.prototype.generate = function ( builder, output ) {

	var varying = builder.getVar( this.uuid, this.type );

	if ( this.value && builder.isShader( 'vertex' ) ) {

		builder.addNodeCode( varying.name + ' = ' + this.value.build( builder, this.getType( builder ) ) + ';' );

	}
	
	return builder.format( varying.name, this.getType( builder ), output );

};

VarNode.prototype.copy = function ( source ) {
	
	GLNode.prototype.copy.call( this, source );
	
	this.type = source.type;
	this.value = source.value;
	
};

VarNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.type = this.type;

		if ( this.value ) data.value = this.value.toJSON( meta ).uuid;

	}

	return data;

};

export { VarNode };
