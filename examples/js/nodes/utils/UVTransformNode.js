/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.UVTransformNode = function () {

	THREE.FunctionNode.call( this, "( uvTransform * vec3( uvNode, 1 ) ).xy", "vec2" );

	this.uv = new THREE.UVNode();
	this.transform = new THREE.Matrix3Node();

};

THREE.UVTransformNode.prototype = Object.create( THREE.FunctionNode.prototype );
THREE.UVTransformNode.prototype.constructor = THREE.UVTransformNode;
THREE.UVTransformNode.prototype.nodeType = "UVTransform";

THREE.UVTransformNode.prototype.generate = function ( builder, output ) {

	this.keywords[ "uvNode" ] = this.uv;
	this.keywords[ "uvTransform" ] = this.transform;

	return THREE.FunctionNode.prototype.generate.call( this, builder, output );

};

THREE.UVTransformNode.prototype.compose = function () {

	var defaultPivot = new THREE.Vector2( .5, .5 );

	return function compose( translate, scale, rotate, optionalCenter ) {

		optionalCenter = optionalCenter !== undefined ? optionalCenter : defaultPivot;

		this.transform.value.setUvTransform( translate.x, translate.y, scale.x, scale.y, rotate, optionalCenter.x, optionalCenter.y );

		return this;

	};

}();

THREE.UVTransformNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.uv = this.uv.toJSON( meta ).uuid;
		data.transform = this.transform.toJSON( meta ).uuid;

	}

	return data;

};
