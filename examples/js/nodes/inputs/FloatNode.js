/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.FloatNode = function ( value ) {

	THREE.InputNode.call( this, 'fv1' );

	this.value = value || 0;

};

THREE.FloatNode.prototype = Object.create( THREE.InputNode.prototype );
THREE.FloatNode.prototype.constructor = THREE.FloatNode;
THREE.FloatNode.prototype.nodeType = "Float";

THREE.FloatNode.prototype.generateReadonly = function ( builder, output, uuid, type, ns, needsUpdate ) {

	return builder.format( this.value + ( this.value % 1 ? '' : '.0' ), type, output );

};

THREE.FloatNode.prototype.copy = function ( source ) {
			
	THREE.InputNode.prototype.copy.call( this, source );
	
	this.value = source.value;
	
};

THREE.FloatNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.value = this.value;

		if ( this.readonly === true ) data.readonly = true;

	}

	return data;

};
