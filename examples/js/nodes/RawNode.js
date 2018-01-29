/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.RawNode = function ( value ) {

	THREE.GLNode.call( this, 'v4' );

	this.value = value;

};

THREE.RawNode.prototype = Object.create( THREE.GLNode.prototype );
THREE.RawNode.prototype.constructor = THREE.RawNode;
THREE.RawNode.prototype.nodeType = "Raw";

THREE.RawNode.prototype.generate = function ( builder ) {

	var material = builder.material;

	var data = this.value.parseAndBuildCode( builder, this.type );

	var code = data.code + '\n';

	if ( builder.shader == 'vertex' ) {

		code += 'gl_Position = ' + data.result + ';';

	} else {

		code += 'gl_FragColor = ' + data.result + ';';

	}

	return code;

};

THREE.RawNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.value = this.value.toJSON( meta ).uuid;

	}

	return data;

};
