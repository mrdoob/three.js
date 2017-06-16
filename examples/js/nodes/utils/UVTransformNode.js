/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.UVTransformNode = function () {

	THREE.FunctionNode.call( this, "( uvTransform * vec4( uvNode, 0, 1 ) ).xy", "vec2" );

	this.uv = new THREE.UVNode();
	this.transform = new THREE.Matrix4Node();

};

THREE.UVTransformNode.prototype = Object.create( THREE.FunctionNode.prototype );
THREE.UVTransformNode.prototype.constructor = THREE.UVTransformNode;

THREE.UVTransformNode.prototype.generate = function ( builder, output ) {

	this.keywords[ "uvNode" ] = this.uv;
	this.keywords[ "uvTransform" ] = this.transform;

	return THREE.FunctionNode.prototype.generate.call( this, builder, output );

};

THREE.UVTransformNode.prototype.compose = function () {

	var defaultPivot = new THREE.Vector2( .5, .5 ),
		tempVector = new THREE.Vector3(),
		tempMatrix = new THREE.Matrix4();

	return function compose( translate, rotate, scale, optionalCenter ) {

		optionalCenter = optionalCenter !== undefined ? optionalCenter : defaultPivot;

		var matrix = this.transform.value;

		matrix.identity()
			.setPosition( tempVector.set( - optionalCenter.x, - optionalCenter.y, 0 ) )
			.premultiply( tempMatrix.makeRotationZ( rotate ) )
			.multiply( tempMatrix.makeScale( scale.x, scale.y, 0 ) )
			.multiply( tempMatrix.makeTranslation( translate.x, translate.y, 0 ) );

		return this;

	};

}();
